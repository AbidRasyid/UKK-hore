<?php

namespace Database\Seeders;

use App\Models\Configuration;
use Illuminate\Database\Seeder;

class configurationSeeder extends Seeder
{
    public function run(): void
    {
        Configuration::updateOrCreate(
            ['key' => 'minimum_balance'],
            ['value' => '10000'],
        );
    }
}
