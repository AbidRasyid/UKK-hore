<?php

use App\Models\User;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Laravel\Sanctum\Sanctum;

beforeEach(function () {
    Schema::dropIfExists('transactions');
    Schema::dropIfExists('customers');
    Schema::dropIfExists('users');

    Schema::create('users', function (Blueprint $table) {
        $table->id();
        $table->string('username')->unique();
        $table->string('password');
        $table->string('fullname');
        $table->string('role');
        $table->string('status');
        $table->timestamps();
    });

    Schema::create('transactions', function (Blueprint $table) {
        $table->id();
        $table->foreignId('user_id');
        $table->unsignedBigInteger('customer_id')->nullable();
        $table->date('transaction_date');
        $table->string('transaction_type');
        $table->unsignedBigInteger('amount');
        $table->timestamps();
    });

    Schema::create('customers', function (Blueprint $table) {
        $table->id();
        $table->string('account_number')->unique();
        $table->timestamps();
    });
});

function createTransactionHistoryUser(string $role): User
{
    return User::create([
        'username' => "{$role}-user",
        'password' => 'password',
        'fullname' => ucfirst($role),
        'role' => $role,
        'status' => 'active',
    ]);
}

it('returns all-time supervisor transactions newest first with ten rows per page', function () {
    $supervisor = createTransactionHistoryUser('supervisor');
    Sanctum::actingAs($supervisor);

    foreach (range(0, 11) as $index) {
        DB::table('transactions')->insert([
            'user_id' => $supervisor->id,
            'transaction_date' => now()->subYears(20)->subDays($index)->toDateString(),
            'transaction_type' => 'deposit',
            'amount' => 1000 + $index,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    $firstPage = $this->getJson('/api/supervisor/transactions/history')
        ->assertOk()
        ->assertJsonCount(10, 'data')
        ->assertJsonPath('current_page', 1)
        ->assertJsonPath('last_page', 2)
        ->assertJsonPath('total', 12);

    expect($firstPage->json('data.0.transaction_date'))
        ->toBe(now()->subYears(20)->toDateString());

    $this->getJson('/api/supervisor/transactions/history?page=2')
        ->assertOk()
        ->assertJsonCount(2, 'data')
        ->assertJsonPath('current_page', 2);
});

it('denies teller access to supervisor transaction history', function () {
    Sanctum::actingAs(createTransactionHistoryUser('teller'));

    $this->getJson('/api/supervisor/transactions/history')->assertForbidden();
});

it('filters supervisor history by date and search and supports larger export pages', function () {
    $supervisor = createTransactionHistoryUser('supervisor');
    Sanctum::actingAs($supervisor);
    $date = now()->subYears(2)->toDateString();

    foreach ([['deposit', 1500], ['withdrawal', 2500]] as [$type, $amount]) {
        DB::table('transactions')->insert([
            'user_id' => $supervisor->id,
            'transaction_date' => $date,
            'transaction_type' => $type,
            'amount' => $amount,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    $this->getJson('/api/supervisor/transactions/history?date_from='.$date.'&date_to='.$date.'&search=withdrawal&per_page=100')
        ->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.transaction_type', 'withdrawal')
        ->assertJsonPath('per_page', 100);
});

it('returns only the signed-in teller transactions for the requested period', function () {
    $teller = createTransactionHistoryUser('teller');
    $otherTeller = User::create([
        'username' => 'other-teller',
        'password' => 'password',
        'fullname' => 'Other Teller',
        'role' => 'teller',
        'status' => 'active',
    ]);
    Sanctum::actingAs($teller);
    $customerId = DB::table('customers')->insertGetId([
        'account_number' => 'AK100001',
        'created_at' => now(),
        'updated_at' => now(),
    ]);
    $date = now()->subYears(3)->toDateString();

    foreach ([$teller->id, $otherTeller->id] as $userId) {
        DB::table('transactions')->insert([
            'user_id' => $userId,
            'customer_id' => $customerId,
            'transaction_date' => $date,
            'transaction_type' => 'deposit',
            'amount' => 1000,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    $this->getJson('/api/teller/transactions/history?date_from='.$date.'&date_to='.$date)
        ->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.account_number', 'AK100001');
});