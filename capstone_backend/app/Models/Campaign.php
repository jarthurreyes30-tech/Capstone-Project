<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Campaign extends Model
{
    protected $fillable = [
        'charity_id',
        'title',
        'description',
        'target_amount',
        'deadline_at',
        'cover_image_path',
        'status',
    ];

    protected $casts = [
        'deadline_at' => 'datetime',
        'target_amount' => 'decimal:2',
    ];

    // Relationships
    public function charity()
    {
        return $this->belongsTo(Charity::class);
    }

    public function donations()
    {
        return $this->hasMany(Donation::class);
    }

    public function fundUsageLogs()
    {
        return $this->hasMany(FundUsageLog::class);
    }
}
