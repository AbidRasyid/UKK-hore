<?php

namespace App\Providers;

use Illuminate\Foundation\DevCommands;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        if ($this->app->environment('local')) {
            // Replaces the broken remove() method
            DevCommands::except(['vite', 'reverb']);
        }
    }
}
