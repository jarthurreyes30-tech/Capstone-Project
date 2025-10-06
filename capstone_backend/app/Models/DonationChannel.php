<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DonationChannel extends Model
{
    protected $fillable = [
        'charity_id',
        'type',      // gcash|paypal|bank|other
        'label',
        'details',   // json
        'is_active',
    ];

    protected $casts = [
        'details' => 'array',         // important: stored as JSON in DB
        'is_active' => 'boolean',
    ];

    // Relationships
    public function charity()
    {
        return $this->belongsTo(Charity::class);
    }
}
