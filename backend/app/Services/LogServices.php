<?php

namespace App\Services;

use App\ActivityAction;
use App\Models\ActivityLog;
use Illuminate\Support\Facades\Auth;

class LogService
{
    public static function record(ActivityAction $action, $description)
    {
        ActivityLog::create([
            'user_id' => Auth::id(),
            'action' => $action->value,
            'description' => $description,
            'ip_address' => request()->ip(),
        ]);
    }
}