<?php

namespace Database\Seeders;

use App\enum\Majors;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class majorSeeder extends Seeder
{
    public function run(): void
    {
        foreach (Majors::cases() as $major) {
            if (! DB::table('majors')->where('name', $major->value)->exists()) {
                DB::table('majors')->insert([
                    'name' => $major->value,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }
    }
}
