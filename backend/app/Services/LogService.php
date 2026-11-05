<?php

namespace App\Services;

use App\enum\ActivityAction;
use App\Events\ActivityLogged;
use App\Models\ActivityLog;
use App\Models\Customer;
use App\Models\User;
use Illuminate\Support\Facades\Auth;

class LogService
{
    public static function record(ActivityAction $action, string $description, User|Customer|null $actor = null): void
    {
        $authenticated = $actor instanceof User
            ? $actor
            : ($actor instanceof Customer ? null : Auth::user());
        $customer = $actor instanceof Customer
            ? $actor
            : ($actor instanceof User ? null : Auth::guard('customer')->user());

        $log = ActivityLog::create([
            'user_id' => $authenticated instanceof User ? $authenticated->getKey() : null,
            'customer_id' => $customer instanceof Customer
                ? $customer->getKey()
                : ($authenticated instanceof Customer ? $authenticated->getKey() : null),
            'action' => $action->value,
            'description' => $description,
            'ip_address' => request()->ip(),
        ]);

        broadcast(new ActivityLogged($log))->toOthers();
    }
}
