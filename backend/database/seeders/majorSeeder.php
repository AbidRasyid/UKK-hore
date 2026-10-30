<?php

namespace Database\Seeders;

use App\enum\Majors;
use App\Models\major;
use Illuminate\Database\Seeder;

class majorSeeder extends Seeder
{
    public function run(): void
    {
        foreach (Majors::cases() as $major) {
            major::firstOrCreate(['name' => $major->value]);
        }
    }
}
