<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Charity extends Model
{
    protected $fillable = [
        'owner_id','name','acronym','legal_trading_name','reg_no','tax_id',
        'mission','vision','goals','website','services',
        'contact_email','contact_phone',
        'address','region','municipality','category',
        'logo_path','cover_image',
        'verification_status','verified_at','verification_notes'
    ];

    protected $casts = [
        'verified_at' => 'datetime',
    ];

    public function owner(){ return $this->belongsTo(User::class,'owner_id'); }
    public function documents(){ return $this->hasMany(CharityDocument::class); }
    public function channels(){ return $this->hasMany(DonationChannel::class); }
    public function campaigns(){ return $this->hasMany(Campaign::class); }
    public function donations(){ return $this->hasMany(Donation::class); }
    public function fundUsageLogs(){ return $this->hasMany(FundUsageLog::class); }
    public function posts(){ return $this->hasMany(CharityPost::class); }
    public function followers(){ return $this->hasMany(CharityFollow::class); }
    public function activeFollowers(){ return $this->hasMany(CharityFollow::class)->where('is_following', true); }
}
