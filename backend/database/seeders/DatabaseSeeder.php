<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            userSeeder::class,
            majorSeeder::class,
            configurationSeeder::class,
            tellerSeeder::class,
            dailyReportSeeder::class,
            transactionSeeder::class,
            accountingJournalSeeder::class,
        ]);
    }
}
