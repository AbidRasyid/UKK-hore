<?php

use App\enum\UserRole;
use App\Models\User;
use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

Broadcast::channel('admin.activity-logs', function(User $user){
    return $user->role === UserRole::ADMINISTRATOR;
});