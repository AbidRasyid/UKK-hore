<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\ChangePinController;
use App\Http\Controllers\CustomerPasswordResetController;
use App\Http\Controllers\TransactionController;
use App\Http\Controllers\UserController;
use App\enum\UserRole;
use App\Http\Controllers\AccountingJournalController;
use App\Http\Controllers\DailyReportController;
use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Broadcast;
use Illuminate\Support\Facades\Route;
use Kreait\Firebase\Messaging\CloudMessage;
use Kreait\Laravel\Firebase\Facades\Firebase;

Route::post('/test-fcm', function (Request $request) {
    $token = $request->input('token');
    $title = $request->input('title', 'Test Notifikasi');
    $body = $request->input('body', 'Halo dari Laravel!');

    try {
        // Panggil messaging service
        $messaging = app('firebase.messaging');

        // Bikin message pakai array (INI YANG PALING AMAN)
        $message = CloudMessage::fromArray([
            'token' => $token, // Target token langsung di sini
            'notification' => [
                'title' => $title,
                'body' => $body,
            ],
            'android' => [
                'priority' => 'high',
            ],
        ]);

        // Kirim!
        $messaging->send($message);

        return response()->json([
            "message" => "Notifikasi berhasil dikirim!"
        ], 200);
    } catch (\Throwable $e) {
        return response()->json([
            "message" => "Gagal mengirim notifikasi",
            "error" => $e->getMessage()
        ], 500);
    }
});

Broadcast::routes(['middleware' => ['auth:sanctum']]);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/customer/login', [AuthController::class, 'CustomerLogin']);
Route::post('/customer/forgot-password', [CustomerPasswordResetController::class, 'forgot'])
    ->middleware('throttle:forgot-password');
Route::post('/customer/reset-password', [CustomerPasswordResetController::class, 'reset']);
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
    Route::patch('/user/{user_id}/edit', [UserController::class, 'update']);

    Route::post('/customers', [CustomerController::class, 'store']);
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
    Route::patch('/daily-report/{id}/approve', [DailyReportController::class, 'approve']);
});

Route::middleware(['auth:sanctum', 'role:'. UserRole::TELLER->value])->group(function(){
    Route::post('/user/{customer_id}/transaction/initiate', [TransactionController::class, 'initiate']);
    Route::get('/teller/customer/{customer_id}/transactions', [TransactionController::class, 'show']);
    Route::get('/daily-report/{user_id}/initiate', [DailyReportController::class, 'initiateStore']);
    Route::post('/daily-report/{user_id}/store', [DailyReportController::class, 'store']);
    Route::get('/daily-reports/{user_id}', [DailyReportController::class, 'tellerIndex']);
    Route::get('/transactions/{teller_id}', [TransactionController::class, 'teller_daily_show']);

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