<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UsersSeeder extends Seeder
{
    public function run(): void
    {
        // Admin
        User::firstOrCreate(
            ['email' => 'admin@example.com'],
            [
                'name' => 'System Admin',
                'password' => Hash::make('admin123'),
                'role' => 'admin',
                'status' => 'active'
            ]
        );

        // Donor
        User::firstOrCreate(
            ['email' => 'donor@example.com'],
            [
                'name' => 'Test Donor',
                'password' => Hash::make('donor123'),
                'role' => 'donor',
                'status' => 'active'
            ]
        );

        // Charity Admin
        User::firstOrCreate(
            ['email' => 'charity@example.com'],
            [
                'name' => 'Test Charity Admin',
                'password' => Hash::make('charity123'),
                'role' => 'charity_admin',
                'status' => 'active'
            ]
        );
    }
}
