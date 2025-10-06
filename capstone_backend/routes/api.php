<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\{
  AuthController, CharityController, CampaignController, DonationController, FundUsageController, CharityPostController, TransparencyController, CharityFollowController, NotificationController
};
use App\Http\Controllers\Admin\VerificationController;

// Health
Route::get('/ping', fn () => ['ok' => true, 'time' => now()->toDateTimeString()]);

// Auth
Route::post('/auth/register', [AuthController::class,'registerDonor']);
Route::post('/auth/register-charity', [AuthController::class,'registerCharityAdmin']);
Route::post('/auth/login', [AuthController::class,'login']);
Route::post('/auth/logout', [AuthController::class,'logout'])->middleware('auth:sanctum');
Route::get('/me', [AuthController::class,'me'])->middleware('auth:sanctum');
Route::put('/me', [AuthController::class,'updateProfile'])->middleware('auth:sanctum');
Route::post('/me/change-password', [AuthController::class,'changePassword'])->middleware('auth:sanctum');
Route::post('/me/deactivate', [AuthController::class,'deactivateAccount'])->middleware('auth:sanctum');
Route::delete('/me', [AuthController::class,'deleteAccount'])->middleware('auth:sanctum');

// Public directory
Route::get('/charities', [CharityController::class,'index']);
Route::get('/charities/{charity}', [CharityController::class,'show']);
Route::get('/charities/{charity}/channels', [CharityController::class,'channels']);
Route::get('/charities/{charity}/campaigns', [CampaignController::class,'index']);
Route::get('/campaigns/{campaign}', [CampaignController::class,'show']);
Route::get('/campaigns/{campaign}/fund-usage', [FundUsageController::class,'publicIndex']);

// Public charity posts (for donor news feed and charity profile)
Route::get('/posts', [CharityPostController::class,'index']);
Route::get('/charities/{charity}/posts', [CharityPostController::class,'getCharityPosts']);

// Public charity documents (for viewing by donors and public)
Route::get('/charities/{charity}/documents', [CharityController::class,'getDocuments']);

// Charity follow system (for donors)
Route::middleware(['auth:sanctum','role:donor'])->group(function(){
  Route::post('/charities/{charity}/follow', [CharityFollowController::class,'toggleFollow']);
  Route::get('/charities/{charity}/follow-status', [CharityFollowController::class,'getFollowStatus']);
  Route::get('/me/followed-charities', [CharityFollowController::class,'myFollowedCharities']);
});

// Public charity follow stats
Route::get('/charities/{charity}/followers-count', [CharityFollowController::class,'getFollowersCount']);

// Public transparency (for approved charities only)
Route::get('/charities/{charity}/transparency', [TransparencyController::class,'publicTransparency']);

// Donor transparency dashboard
Route::middleware(['auth:sanctum','role:donor'])->group(function(){
  Route::get('/me/transparency', [TransparencyController::class,'donorTransparency']);
});

// Charity admin transparency dashboard
Route::middleware(['auth:sanctum','role:charity_admin'])->group(function(){
  Route::get('/charities/{charity}/transparency', [TransparencyController::class,'charityTransparency']);
});

// Donor actions
Route::middleware(['auth:sanctum','role:donor'])->group(function(){
  Route::post('/donations', [DonationController::class,'store']);
  Route::post('/donations/{donation}/proof', [DonationController::class,'uploadProof']);
  Route::get('/me/donations', [DonationController::class,'myDonations']);
  Route::get('/donations/{donation}/receipt', [DonationController::class,'downloadReceipt']);

  // Notifications
  Route::get('/me/notifications', [NotificationController::class,'index']);
  Route::post('/notifications/{notification}/read', [NotificationController::class,'markAsRead']);
  Route::post('/notifications/mark-all-read', [NotificationController::class,'markAllAsRead']);
  Route::get('/notifications/unread-count', [NotificationController::class,'unreadCount']);
  Route::delete('/notifications/{notification}', [NotificationController::class,'destroy']);
});

// System admin (for recurring donations processing and security)
Route::middleware(['auth:sanctum','role:admin'])->group(function(){
  Route::post('/admin/process-recurring-donations', [DonationController::class,'processRecurringDonations']);
  Route::get('/admin/security/activity-logs', [\App\Http\Controllers\Admin\SecurityController::class,'activityLogs']);
  Route::get('/admin/compliance/report', [\App\Http\Controllers\Admin\ComplianceController::class,'generateReport']);
});

// Charity admin
Route::middleware(['auth:sanctum','role:charity_admin'])->group(function(){
  Route::post('/charities', [CharityController::class,'store']);
  Route::put('/charities/{charity}', [CharityController::class,'update']);
  Route::post('/charities/{charity}/documents', [CharityController::class,'uploadDocument']);

  Route::post('/charities/{charity}/channels', [CharityController::class,'storeChannel']);

  Route::post('/charities/{charity}/campaigns', [CampaignController::class,'store']);
  Route::put('/campaigns/{campaign}', [CampaignController::class,'update']);
  Route::delete('/campaigns/{campaign}', [CampaignController::class,'destroy']);

  Route::get('/charities/{charity}/donations', [DonationController::class,'charityInbox']);
  Route::patch('/donations/{donation}/confirm', [DonationController::class,'confirm']);

  Route::post('/campaigns/{campaign}/fund-usage', [FundUsageController::class,'store']);
  
  // Charity posts management
  Route::get('/my-posts', [CharityPostController::class,'getMyPosts']);
  Route::post('/posts', [CharityPostController::class,'store']);
  Route::put('/posts/{post}', [CharityPostController::class,'update']);
  Route::delete('/posts/{post}', [CharityPostController::class,'destroy']);
});

// System admin
Route::middleware(['auth:sanctum','role:admin'])->group(function(){
  Route::get('/admin/verifications', [VerificationController::class,'index']);
  Route::get('/admin/charities', [VerificationController::class,'getAllCharities']);
  Route::get('/admin/users', [VerificationController::class,'getUsers']);
  Route::patch('/admin/charities/{charity}/approve', [VerificationController::class,'approve']);
  Route::patch('/admin/charities/{charity}/reject', [VerificationController::class,'reject']);
  Route::patch('/admin/users/{user}/suspend', [VerificationController::class,'suspendUser']);
  Route::patch('/admin/users/{user}/activate', [VerificationController::class,'activateUser']);
});

// routes/api.php
Route::get('/metrics', function () {
    return [
        'total_users' => \App\Models\User::count(),
        'total_donors' => \App\Models\User::where('role', 'donor')->count(),
        'total_charity_admins' => \App\Models\User::where('role', 'charity_admin')->count(),
        'charities' => \App\Models\Charity::where('verification_status','approved')->count(),
        'pending_verifications' => \App\Models\Charity::where('verification_status','pending')->count(),
        'campaigns' => \App\Models\Campaign::count(),
        'donations' => \App\Models\Donation::count(),
    ];
});
