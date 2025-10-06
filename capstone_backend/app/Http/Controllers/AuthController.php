<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Charity;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Log;
use App\Services\SecurityService;

class AuthController extends Controller
{
    protected $securityService;

    public function __construct(SecurityService $securityService)
    {
        $this->securityService = $securityService;
    }
    public function registerDonor(Request $r){
        try {
            $data = $r->validate([
                'name'=>'required|string|max:255',
                'email'=>'required|email|unique:users,email',
                'password'=>'required|min:6|confirmed',
                'phone'=>'nullable|string',
                'address'=>'nullable|string',
                'profile_image'=>'nullable|image|max:2048'
            ]);
            
            // Handle profile image upload
            $profileImagePath = null;
            if ($r->hasFile('profile_image')) {
                $profileImagePath = $r->file('profile_image')->store('profile_images', 'public');
            }
            
            $user = User::create([
                'name'=>$data['name'],
                'email'=>$data['email'],
                'password'=>Hash::make($data['password']),
                'phone'=>$data['phone'] ?? null,
                'address'=>$data['address'] ?? null,
                'profile_image'=>$profileImagePath,
                'role'=>'donor',
                'status'=>'active'
            ]);
            
            // Log successful registration
            $this->securityService->logAuthEvent('user_registered', $user, [
                'role' => 'donor',
                'registration_method' => 'email'
            ]);
            
            return response()->json([
                'message' => 'Registration successful',
                'user' => $user
            ], 201);
        } catch (ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Throwable $e) {
            Log::error('Register donor failed', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            return response()->json(['message' => 'Server error creating account'], 500);
        }
    }

    public function registerCharityAdmin(Request $r){
        DB::beginTransaction();
        try {
            // Validate all fields - frontend sends different field names
            $validated = $r->validate([
                // Representative details
                'contact_person_name'=>'required|string|max:255',
                'contact_email'=>'required|email|unique:users,email',
                'contact_phone'=>'nullable|string',
                'password'=>'required|string|min:6|confirmed',
                
                // Organization details
                'organization_name'=>'required|string|max:255',
                'registration_number'=>'nullable|string|max:255',
                'tax_id'=>'nullable|string|max:255',
                'mission_statement'=>'nullable|string',
                'description'=>'nullable|string',
                'website'=>'nullable|string', // Changed from 'url' to 'string'
                'address'=>'nullable|string',
                'region'=>'nullable|string',
                'municipality'=>'nullable|string',
                'nonprofit_category'=>'nullable|string',
                'legal_trading_name'=>'nullable|string',
                'accept_terms'=>'nullable',
                'confirm_truthfulness'=>'nullable',
                
                // Files (optional) - removed validation temporarily
                'logo'=>'nullable',
                'cover_image'=>'nullable',
                'documents'=>'nullable',
                'doc_types'=>'nullable'
            ]);
            
            // Create user account with provided password
            $user = User::create([
                'name'=>$validated['contact_person_name'],
                'email'=>$validated['contact_email'],
                'password'=>Hash::make($validated['password']),
                'phone'=>$validated['contact_phone'] ?? null,
                'role'=>'charity_admin',
                'status'=>'active'
            ]);
            
            // Handle logo upload
            $logoPath = null;
            if ($r->hasFile('logo')) {
                $logoPath = $r->file('logo')->store('charity_logos', 'public');
            }
            
            // Handle cover image upload
            $coverPath = null;
            if ($r->hasFile('cover_image')) {
                $coverPath = $r->file('cover_image')->store('charity_covers', 'public');
            }
            
            // Create charity organization with all fields
            $charity = Charity::create([
                'owner_id'=>$user->id,
                'name'=>$validated['organization_name'],
                'legal_trading_name'=>$validated['legal_trading_name'] ?? null,
                'reg_no'=>$validated['registration_number'] ?? null,
                'tax_id'=>$validated['tax_id'] ?? null,
                'mission'=>$validated['mission_statement'] ?? null,
                'vision'=>$validated['description'] ?? null,
                'website'=>$validated['website'] ?? null,
                'contact_email'=>$validated['contact_email'],
                'contact_phone'=>$validated['contact_phone'] ?? null,
                'address'=>$validated['address'] ?? null,
                'region'=>$validated['region'] ?? null,
                'municipality'=>$validated['municipality'] ?? null,
                'category'=>$validated['nonprofit_category'] ?? null,
                'logo_path'=>$logoPath,
                'cover_image'=>$coverPath,
                'verification_status'=>'pending'
            ]);
            
            // Handle document uploads
            if ($r->hasFile('documents')) {
                foreach ($r->file('documents') as $index => $file) {
                    $docType = $r->input("doc_types.{$index}", 'other');
                    $path = $file->store('charity_docs', 'public');
                    $hash = hash_file('sha256', $file->getRealPath());
                    
                    $charity->documents()->create([
                        'doc_type'=>$docType,
                        'file_path'=>$path,
                        'sha256'=>$hash,
                        'uploaded_by'=>$user->id
                    ]);
                }
            }
            
            DB::commit();
            
            return response()->json([
                'message' => 'Registration successful. Your charity is pending verification.',
                'user' => $user,
                'charity' => $charity->load('documents')
            ], 201);
        } catch (ValidationException $e) {
            DB::rollBack();
            Log::error('Charity registration validation failed', [
                'errors' => $e->errors(),
                'input' => $r->except(['password', 'password_confirmation'])
            ]);
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Throwable $e) {
            DB::rollBack();
            Log::error('Register charity admin failed', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'input' => $r->except(['password', 'password_confirmation'])
            ]);
            return response()->json([
                'message' => 'Server error creating account',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function login(Request $r){
        $data = $r->validate([
            'email'=>'required|email',
            'password'=>'required'
        ]);
        $user = User::where('email',$data['email'])->first();
        if(!$user || !Hash::check($data['password'], $user->password) || $user->status!=='active'){
            // Log failed login attempt
            $this->securityService->logFailedLogin($data['email'], $r->ip(), 'invalid_credentials');
            return response()->json(['message'=>'Invalid credentials'], 401);
        }

        // Log successful login
        $this->securityService->logAuthEvent('user_login', $user, [
            'login_method' => 'password'
        ]);

        // Check for suspicious login patterns
        $this->securityService->checkSuspiciousLogin($user, $r->ip());

        $token = $user->createToken('auth')->plainTextToken;
        return response()->json(['token'=>$token,'user'=>$user]);
    }

    public function logout(Request $r){
        $r->user()->currentAccessToken()->delete();
        return response()->json(['message'=>'Logged out']);
    }

    public function me(Request $r){
        return response()->json($r->user());
    }

    public function updateProfile(Request $r){
        $user = $r->user();

        // Enhanced validation based on user role
        $validationRules = [
            'name' => 'sometimes|string|max:255',
            'phone' => 'sometimes|nullable|string|max:20',
            'address' => 'sometimes|nullable|string|max:500',
        ];

        // Add role-specific fields
        if ($user->role === 'donor') {
            $validationRules['profile_image'] = 'sometimes|image|mimes:jpeg,png,jpg|max:2048';
        }

        if ($user->role === 'charity_admin') {
            $validationRules['contact_person_name'] = 'sometimes|string|max:255';
            $validationRules['contact_email'] = 'sometimes|email|unique:users,email,' . $user->id;
            $validationRules['logo'] = 'sometimes|image|mimes:jpeg,png,jpg|max:2048';
        }

        $validatedData = $r->validate($validationRules);

        // Handle profile image upload for donors
        if ($r->hasFile('profile_image') && $user->role === 'donor') {
            // Delete old profile image if exists
            if ($user->profile_image) {
                \Storage::disk('public')->delete($user->profile_image);
            }
            $validatedData['profile_image'] = $r->file('profile_image')->store('profile_images', 'public');
        }

        // Handle charity logo upload for charity admins
        if ($r->hasFile('logo') && $user->role === 'charity_admin') {
            $charity = $user->charity;
            if ($charity && $charity->logo_path) {
                \Storage::disk('public')->delete($charity->logo_path);
            }
            $validatedData['logo_path'] = $r->file('logo')->store('charity_logos', 'public');
        }

        // Update user profile
        $user->update($validatedData);

        // Update charity information if user is charity admin
        if ($user->role === 'charity_admin' && $user->charity) {
            $charityData = [];
            if ($r->has('contact_person_name')) {
                $charityData['contact_email'] = $validatedData['contact_email'] ?? $user->email;
            }

            if (!empty($charityData)) {
                $user->charity->update($charityData);
            }

            // Update logo if uploaded
            if (isset($validatedData['logo_path'])) {
                $user->charity->update(['logo_path' => $validatedData['logo_path']]);
            }
        }

        // Log the profile update
        $this->securityService->logActivity($user, 'profile_updated', [
            'updated_fields' => array_keys($validatedData),
            'user_role' => $user->role
        ]);

        // Return updated user with charity data if applicable
        $responseData = $user;
        if ($user->charity) {
            $responseData = $user->load('charity');
        }

        return response()->json([
            'message' => 'Profile updated successfully',
            'user' => $responseData
        ]);
    }

    public function changePassword(Request $r){
        $user = $r->user();

        $data = $r->validate([
            'current_password' => 'required|string',
            'new_password' => 'required|string|min:6|confirmed',
        ]);

        // Verify current password
        if (!Hash::check($data['current_password'], $user->password)) {
            return response()->json(['message' => 'Current password is incorrect'], 422);
        }

        // Update password
        $user->update([
            'password' => Hash::make($data['new_password'])
        ]);

        // Log password change
        $this->securityService->logActivity($user, 'password_changed', [
            'changed_at' => now()->toISOString()
        ]);

        return response()->json(['message' => 'Password changed successfully']);
    }

    public function deactivateAccount(Request $r){
        $user = $r->user();

        // Log account deactivation
        $this->securityService->logActivity($user, 'account_deactivated', [
            'deactivated_at' => now()->toISOString(),
            'reason' => $r->input('reason', 'User requested deactivation')
        ]);

        // Set status to inactive (soft delete)
        $user->update(['status' => 'inactive']);

        return response()->json(['message' => 'Account deactivated successfully']);
    }

    public function deleteAccount(Request $r){
        $user = $r->user();

        $data = $r->validate([
            'password' => 'required|string',
            'reason' => 'nullable|string|max:500'
        ]);

        // Verify password before deletion
        if (!Hash::check($data['password'], $user->password)) {
            return response()->json(['message' => 'Password is incorrect'], 422);
        }

        // Log account deletion
        $this->securityService->logActivity($user, 'account_deleted', [
            'deleted_at' => now()->toISOString(),
            'reason' => $data['reason'] ?? 'User requested deletion'
        ]);

        // Hard delete the user and all associated data
        $user->delete();

        return response()->json(['message' => 'Account deleted successfully']);
    }
}
