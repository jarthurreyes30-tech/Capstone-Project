<?php

namespace App\Http\Controllers;

use App\Models\{Campaign, Charity};
use Illuminate\Http\Request;

class CampaignController extends Controller
{
    public function index(Charity $charity){
        return $charity->campaigns()->where('status','published')->latest()->paginate(12);
    }

    public function show(Campaign $campaign){ return $campaign; }

    public function store(Request $r, Charity $charity){
        abort_unless($charity->owner_id === $r->user()->id, 403);
        $data = $r->validate([
            'title'=>'required|string|max:255',
            'description'=>'nullable|string',
            'target_amount'=>'nullable|numeric|min:0',
            'deadline_at'=>'nullable|date',
            'status'=>'in:draft,published,closed,archived'
        ]);
        return $charity->campaigns()->create($data);
    }

    public function update(Request $r, Campaign $campaign){
        abort_unless($campaign->charity->owner_id === $r->user()->id, 403);
        $campaign->update($r->only(['title','description','target_amount','deadline_at','status']));
        return $campaign;
    }

    public function destroy(Request $r, Campaign $campaign){
        abort_unless($campaign->charity->owner_id === $r->user()->id, 403);
        $campaign->delete();
        return response()->noContent();
    }
}
