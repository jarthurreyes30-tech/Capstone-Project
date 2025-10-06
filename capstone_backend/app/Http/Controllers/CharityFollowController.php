<?php

namespace App\Http\Controllers;

use App\Models\{Charity, CharityFollow};
use Illuminate\Http\Request;

class CharityFollowController extends Controller
{
    // Follow/unfollow a charity
    public function toggleFollow(Request $request, Charity $charity)
    {
        $user = $request->user();

        // Check if already following
        $existingFollow = CharityFollow::where('donor_id', $user->id)
            ->where('charity_id', $charity->id)
            ->first();

        if ($existingFollow) {
            // Toggle follow status
            $existingFollow->update([
                'is_following' => !$existingFollow->is_following,
                'followed_at' => $existingFollow->is_following ? null : now()
            ]);

            $action = $existingFollow->is_following ? 'followed' : 'unfollowed';
        } else {
            // Create new follow
            CharityFollow::create([
                'donor_id' => $user->id,
                'charity_id' => $charity->id,
                'is_following' => true,
                'followed_at' => now()
            ]);

            $action = 'followed';
        }

        return response()->json([
            'message' => "Successfully {$action} {$charity->name}",
            'is_following' => $action === 'followed'
        ]);
    }

    // Get follow status for a charity
    public function getFollowStatus(Request $request, Charity $charity)
    {
        $user = $request->user();

        $follow = CharityFollow::where('donor_id', $user->id)
            ->where('charity_id', $charity->id)
            ->first();

        return response()->json([
            'is_following' => $follow ? $follow->is_following : false,
            'followed_at' => $follow ? $follow->followed_at : null
        ]);
    }

    // Get user's followed charities
    public function myFollowedCharities(Request $request)
    {
        $user = $request->user();

        $followedCharities = CharityFollow::where('donor_id', $user->id)
            ->where('is_following', true)
            ->with(['charity' => function($query) {
                $query->where('verification_status', 'approved');
            }])
            ->get()
            ->pluck('charity')
            ->filter()
            ->values();

        return response()->json($followedCharities);
    }

    // Get followers count for a charity
    public function getFollowersCount(Charity $charity)
    {
        $followersCount = CharityFollow::where('charity_id', $charity->id)
            ->where('is_following', true)
            ->count();

        return response()->json([
            'followers_count' => $followersCount
        ]);
    }
}
