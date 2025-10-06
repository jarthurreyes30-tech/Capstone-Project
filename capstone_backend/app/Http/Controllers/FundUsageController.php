<?php

namespace App\Http\Controllers;

use App\Models\{FundUsageLog, Campaign, Charity};
use Illuminate\Http\Request;

class FundUsageController extends Controller
{
    // public view of a campaign's spending
    public function publicIndex(Campaign $campaign){
        return $campaign->charity->fundUsageLogs()
            ->where('campaign_id',$campaign->id)
            ->latest('spent_at')->paginate(20);
    }

    // charity admin adds an expense
    public function store(Request $r, Campaign $campaign){
        $charity = $campaign->charity;
        abort_unless($charity->owner_id === $r->user()->id, 403);
        $data = $r->validate([
            'amount'=>'required|numeric|min:0',
            'category'=>'required|in:supplies,staffing,transport,operations,other',
            'description'=>'nullable|string',
            'spent_at'=>'nullable|date',
            'attachment'=>'nullable|file|mimes:jpg,jpeg,png,pdf'
        ]);
        $path = null;
        if($r->hasFile('attachment')){
            $path = $r->file('attachment')->store('fund_usage','public');
        }
        return FundUsageLog::create([
            'charity_id'=>$charity->id,
            'campaign_id'=>$campaign->id,
            'amount'=>$data['amount'],
            'category'=>$data['category'],
            'description'=>$data['description'] ?? null,
            'spent_at'=>$data['spent_at'] ?? now(),
            'attachment_path'=>$path
        ]);
    }
}
