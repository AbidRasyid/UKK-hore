<?php

namespace App\Providers;

use App\Events\PinRequested;
use App\Events\TransactionCompleted;
use App\Listeners\SendPinNotification;
use App\Listeners\SendTransactionCompleted;
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

    protected array $listen = [
        PinRequested::class => [SendPinNotification::class],
        TransactionCompleted::class => [SendTransactionCompleted::class]
    ];
}
