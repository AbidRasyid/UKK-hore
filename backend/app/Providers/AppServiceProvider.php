<?php

namespace App\Providers;

use App\Events\PinRequested;
use App\Events\TransactionCompleted;
use App\Listeners\SendPinNotification;
use App\Listeners\SendTransactionCompleted;
use Illuminate\Foundation\DevCommands;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        RateLimiter::for('forgot-password', function (Request $request): Limit {
            $email = strtolower((string) $request->input('email'));

            return Limit::perMinute(1)->by($email . '|' . $request->ip());
        });

        if ($this->app->environment('local')) {
            // Replaces the broken remove() method
            DevCommands::except(['vite', 'reverb']);
        }
    }

    protected array $listen = [
        PinRequested::class => [SendPinNotification::class],
        TransactionCompleted::class => [SendTransactionCompleted::class]
    ];
}
