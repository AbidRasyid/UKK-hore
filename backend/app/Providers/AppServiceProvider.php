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
use Laravel\Sanctum\PersonalAccessToken;
use Laravel\Sanctum\Sanctum;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        Sanctum::getAccessTokenFromRequestUsing(function (Request $request){
            if ($request->header('Authorization')){
                return str_replace('Bearer', '', $request->header('Authorization'));
            }
            return $request->cookie('token');
        });

        Sanctum::authenticateAccessTokensUsing(function (PersonalAccessToken $accessToken, bool $isValid) {
            if (!$isValid) return false;

            // Automatically bind customer tokens to the correct request auth guard state
            if ($accessToken->tokenable_type === \App\Models\Customer::class) {
                auth()->shouldUse('customer');
            }

            return true;
      });

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
