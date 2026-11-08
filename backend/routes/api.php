<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\ChangePinController;
use App\Http\Controllers\CustomerPasswordResetController;
use App\Http\Controllers\CustomerPinResetController;
use App\Http\Controllers\TransactionController;
use App\Http\Controllers\UserController;
use App\enum\UserRole;
use App\Http\Controllers\AccountingJournalController;
use App\Http\Controllers\DailyReportController;
use App\Http\Controllers\ShiftController;
use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Broadcast;
use Illuminate\Support\Facades\Route;
use Kreait\Laravel\Firebase\Facades\Firebase;


Broadcast::routes(['middleware' => ['auth:sanctum']]);
Route::post('/logout', [AuthController::class, 'logout']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/customer/login', [AuthController::class, 'CustomerLogin']);
Route::post('/customer/forgot-password', [CustomerPasswordResetController::class, 'forgot'])
    ->middleware('throttle:forgot-password');
Route::post('/customer/reset-password', [CustomerPasswordResetController::class, 'reset'])
    ->middleware('throttle:5,1');
Route::post('/customer/forgot-pin', [CustomerPinResetController::class, 'requestCode'])
    ->middleware('throttle:forgot-password');
Route::post('/customer/reset-pin', [CustomerPinResetController::class, 'reset'])
    ->middleware('throttle:5,1');
Route::middleware('auth:sanctum')->get('/me', function (\Illuminate\Http\Request $request) {
    return response()->json($request->user());
});
Route::middleware('auth:customer')->get("/customer/me", function (\Illuminate\Http\Request $request) {
    return response()->json($request->user('customer'));
});

Route::middleware(['auth:sanctum', 'role:'. UserRole::ADMINISTRATOR->value . ',' . UserRole::SUPERVISOR->value])->group(function(){
    Route::get('/users', [UserController::class, 'index']);
    Route::get('/user/{user_id}', [UserController::class, 'show']);

    Route::get('/accounting-journals', [AccountingJournalController::class, 'index']);
});

Route::middleware(['auth:sanctum', 'role:'. UserRole::ADMINISTRATOR->value . ',' . UserRole::TELLER->value . ',' . UserRole::SUPERVISOR->value])->group(function(){
    Route::get('/customers', [CustomerController::class, 'index']);
    Route::get('/customer/{customer_id?}', [CustomerController::class, 'show']);
    Route::get('/daily-report/{id}', [DailyReportController::class, 'show']);
});

Route::middleware(['auth:sanctum', 'role:'. UserRole::ADMINISTRATOR->value])->group(function(){
    Route::get('/pin-change-requests', [ChangePinController::class, 'index']);
    Route::patch('/pin-change-request/{id}', [ChangePinController::class, 'update']);

    Route::post('/user', [UserController::class, 'store']);
    Route::post('/users/bulk', [UserController::class, 'bulkStore']);
    Route::patch('/user/{user_id}/edit', [UserController::class, 'update']);

    Route::post('/customers', [CustomerController::class, 'store']);
    Route::post('/customers/bulk', [CustomerController::class, 'bulkStore']);
    Route::patch('/customer/{customer_id}/edit', [CustomerController::class, 'update']);
    Route::delete('/customer/{customer_id}/delete', [CustomerController::class, 'delete']);

    Route::get('/pin-requests', [ChangePinController::class, 'index']);
    Route::get('/activity-logs', function(){
        return response()->json([
            'data' => ActivityLog::with('user')->orderBy('created_at', 'desc')->take(50)->get()
        ]);
    });
});

Route::middleware(['auth:sanctum', 'role:'. UserRole::SUPERVISOR->value])->group(function(){
    Route::get('/daily-reports', [DailyReportController::class, 'index']);
    Route::get('/supervisor/transactions', [TransactionController::class, 'supervisorIndex']);
    Route::get('/supervisor/transactions/history', [TransactionController::class, 'supervisorHistory']);
    Route::patch('/daily-report/{id}/approve', [DailyReportController::class, 'approve']);
});

Route::middleware(['auth:sanctum', 'role:'. UserRole::TELLER->value])->group(function(){
    Route::get('/teller/shift', [ShiftController::class, 'current']);
    Route::post('/teller/shift/open', [ShiftController::class, 'open']);
    Route::post('/teller/shift/{shiftId}/close', [ShiftController::class, 'close']);
    Route::post('/user/{customer_id}/transaction/initiate', [TransactionController::class, 'initiate']);
    Route::get('/teller/customer/{customer_id}/transactions', [TransactionController::class, 'show']);
    Route::get('/daily-reports/{user_id}', [DailyReportController::class, 'tellerIndex']);
    Route::get('/transactions/{teller_id}', [TransactionController::class, 'teller_daily_show']);
    Route::get('/teller/transactions/history', [TransactionController::class, 'tellerHistory']);

});

Route::middleware(['auth:customer'])->group(function(){
    Route::post('/customer/change-pin', [ChangePinController::class, 'store']);
    Route::post('/customer/change-password', [CustomerPasswordResetController::class, 'change']);
    Route::patch('/customer/email', [CustomerController::class, 'updateEmail']);
    Route::post('/customer/{customer_id}/transaction/confirm', [TransactionController::class, 'confirmStore']);
    Route::get('/customer/{customer_id}/transactions', [TransactionController::class, 'show']);
    Route::post('/customer/fcm-token', function(Request $request){
        $request->validate(['fcm_token' => 'required|string']);
        $customer = auth('customer')->user();
        $customer->fcm_token = $request->fcm_token;
        $customer->save();
        return response()->json(['message' => 'FCM token saved']);
    });
});