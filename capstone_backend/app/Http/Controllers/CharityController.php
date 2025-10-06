<?php

namespace App\Http\Controllers;

use App\Models\{Charity, CharityDocument, DonationChannel, User};
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use App\Services\NotificationService;

class CharityController extends Controller
{
    protected $notificationService;

    public function __construct(NotificationService $notificationService)
    {
        $this->notificationService = $notificationService;
    }
    // Public directory with advanced search and filtering
    public function index(Request $r){
        $q = Charity::query()->where('verification_status','approved');

        // Search by name or description
        if($term = $r->query('q')) {
            $q->where(function($query) use ($term) {
                $query->where('name','like',"%$term%")
                      ->orWhere('mission','like',"%$term%")
                      ->orWhere('vision','like',"%$term%");
            });
        }

        // Filter by category
        if($category = $r->query('category')) {
            $q->where('category', $category);
        }

        // Filter by region
        if($region = $r->query('region')) {
            $q->where('region', $region);
        }

        // Filter by municipality
        if($municipality = $r->query('municipality')) {
            $q->where('municipality', $municipality);
        }

        // Sort options
        $sortBy = $r->query('sort', 'name'); // name, created_at, total_received
        switch($sortBy) {
            case 'newest':
                $q->orderBy('created_at', 'desc');
                break;
            case 'total_received':
                $q->leftJoin('donations', function($join) {
                    $join->on('charities.id', '=', 'donations.charity_id')
                         ->where('donations.status', '=', 'completed');
                })
                ->selectRaw('charities.*, COALESCE(SUM(donations.amount), 0) as total_received')
                ->groupBy('charities.id')
                ->orderBy('total_received', 'desc');
                break;
            default:
                $q->orderBy('name');
        }

        // Get unique values for filters
        $filters = [
            'categories' => Charity::where('verification_status','approved')
                ->whereNotNull('category')
                ->distinct()
                ->pluck('category'),
            'regions' => Charity::where('verification_status','approved')
                ->whereNotNull('region')
                ->distinct()
                ->pluck('region'),
        ];

        $charities = $q->paginate(12);

        return response()->json([
            'charities' => $charities,
            'filters' => $filters,
            'total' => $charities->total(),
        ]);
    }

    public function show(Charity $charity){
        return $charity->load([
            'documents',
            'owner:id,name,email'
        ])->loadCount(['donations as total_received' => function($q){
            $q->where('status','completed')->select(\DB::raw('coalesce(sum(amount),0)'));
        }]);
    }

    // Charity Admin creates their org
    public function store(Request $r){
        $r->validate(['name'=>'required|string|max:255']);
        $charity = Charity::create([
            'owner_id'=>$r->user()->id,
            'name'=>$r->input('name'),
            'mission'=>$r->input('mission'),
            'contact_email'=>$r->input('contact_email'),
            'contact_phone'=>$r->input('contact_phone'),
        ]);

        // Notify admins about new charity registration
        $admins = User::where('role', 'admin')->get();
        foreach ($admins as $admin) {
            $this->notificationService->sendSystemAlert(
                $admin,
                "A new charity '{$charity->name}' has registered and needs verification.",
                'info'
            );
        }

        return response()->json($charity,201);
    }

    // Update org
    public function update(Request $r, Charity $charity){
        abort_unless($charity->owner_id === $r->user()->id, 403);
        $charity->update($r->only(['name','acronym','mission','vision','goals','website','contact_email','contact_phone']));
        return $charity;
    }

    // Upload verification doc
    public function uploadDocument(Request $r, Charity $charity){
        abort_unless($charity->owner_id === $r->user()->id, 403);
        $data = $r->validate([
            'doc_type'=>'required|in:registration,tax,bylaws,audit,other',
            'file'=>'required|file|mimes:pdf,jpg,jpeg,png'
        ]);
        $path = $r->file('file')->store('charity_docs','public');
        $hash = hash_file('sha256', $r->file('file')->getRealPath());
        $doc = $charity->documents()->create([
            'doc_type'=>$data['doc_type'],
            'file_path'=>$path,
            'sha256'=>$hash,
            'uploaded_by'=>$r->user()->id
        ]);
        return response()->json($doc,201);
    }

    // Public charity documents (for viewing by donors and public)
    public function getDocuments(Charity $charity){
        return $charity->documents()->orderBy('created_at', 'desc')->get();
    }

    public function storeChannel(Request $r, Charity $charity){
        abort_unless($charity->owner_id === $r->user()->id, 403);
        $data = $r->validate([
            'type'=>'required|in:gcash,paypal,bank,other',
            'label'=>'required|string|max:255',
            'details'=>'required|array'
        ]);
        return $charity->channels()->create([
            'type'=>$data['type'],
            'label'=>$data['label'],
            'details'=>$data['details'],
        ]);
    }
}
