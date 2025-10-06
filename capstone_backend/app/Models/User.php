<?php

namespace App\Models;

use Laravel\Sanctum\HasApiTokens;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use HasApiTokens, Notifiable;

    protected $fillable = ['name','email','phone','password','profile_image','role','status','sms_notifications_enabled','sms_notification_types'];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
        'sms_notifications_enabled' => 'boolean',
        'sms_notification_types' => 'array',
    ];

    public function charities(){ return $this->hasMany(Charity::class, 'owner_id'); }
    public function charity(){ return $this->hasOne(Charity::class, 'owner_id'); }
    public function donations(){ return $this->hasMany(Donation::class, 'donor_id'); }
    public function charityFollows(){ return $this->hasMany(CharityFollow::class, 'donor_id'); }
    public function notifications(){ return $this->hasMany(Notification::class); }
    public function unreadNotifications(){ return $this->hasMany(Notification::class)->where('read', false); }
}
