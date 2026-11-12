<?php

use App\enum\UserRole;
use App\Models\Customer;
use App\Models\User;
use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

Broadcast::channel('admin.activity-logs', function(User $user){
    return $user->role === UserRole::ADMINISTRATOR;
});

Broadcast::channel('teller.{tellerId}', function($user, $tellerId){
    return (int) $user->id === (int) $tellerId;
});

Broadcast::channel('customer.{customerId}', function ($customer, $customerId) {
    return $customer instanceof Customer && (int) $customer->id === (int) $customerId;
});