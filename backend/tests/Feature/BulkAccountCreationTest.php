<?php

use App\Models\Customer;
use App\Models\Teller;
use App\Models\User;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Laravel\Sanctum\Sanctum;

beforeEach(function () {
    Schema::dropIfExists('activity_logs');
    Schema::dropIfExists('tellers');
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

    Schema::create('customers', function (Blueprint $table) {
        $table->id();
        $table->string('account_number')->unique();
        $table->string('student_id')->unique();
        $table->string('student_name');
        $table->string('email')->nullable()->unique();
        $table->string('student_class');
        $table->unsignedBigInteger('balance')->default(10000);
        $table->string('password');
        $table->string('pin');
        $table->string('status');
        $table->timestamps();
    });

    Schema::create('tellers', function (Blueprint $table) {
        $table->id();
        $table->foreignId('user_id')->constrained();
        $table->string('name');
        $table->string('class');
        $table->string('phone_number');
        $table->timestamps();
    });

    Schema::create('activity_logs', function (Blueprint $table) {
        $table->id();
        $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
        $table->foreignId('customer_id')->nullable()->constrained()->nullOnDelete();
        $table->string('action');
        $table->text('description');
        $table->string('ip_address')->nullable();
        $table->timestamps();
    });
});

function createBulkCreationAdmin(): User
{
    $admin = User::create([
        'username' => 'bulk-admin',
        'password' => 'password',
        'fullname' => 'Bulk Admin',
        'role' => 'administrator',
        'status' => 'active',
    ]);

    Sanctum::actingAs($admin);

    return $admin;
}

it('creates customer accounts in one bulk request', function () {
    createBulkCreationAdmin();

    $response = $this->postJson('/api/customers/bulk', [
        'customers' => [
            [
                'student_name' => 'First Student',
                'student_id' => '20260001',
                'student_class' => 'rpl',
                'password' => 'password',
                'pin' => '123456',
            ],
            [
                'student_name' => 'Second Student',
                'student_id' => '20260002',
                'student_class' => 'ak',
                'password' => 'password',
                'pin' => '654321',
            ],
        ],
    ]);

    $response->assertCreated()->assertJsonCount(2, 'data');
    expect(Customer::count())->toBe(2);
    expect(Customer::query()->where('student_id', '20260001')->value('account_number'))
        ->toEndWith('4620260001');
});

it('rejects duplicate student ids in a customer batch without creating any accounts', function () {
    createBulkCreationAdmin();

    $response = $this->postJson('/api/customers/bulk', [
        'customers' => [
            [
                'student_name' => 'First Student',
                'student_id' => '20260001',
                'student_class' => 'rpl',
                'password' => 'password',
                'pin' => '123456',
            ],
            [
                'student_name' => 'Duplicate Student',
                'student_id' => '20260001',
                'student_class' => 'rpl',
                'password' => 'password',
                'pin' => '654321',
            ],
        ],
    ]);

    $response->assertUnprocessable();
    expect(Customer::count())->toBe(0);
});

it('creates users and teller records in one bulk request', function () {
    createBulkCreationAdmin();

    $response = $this->postJson('/api/users/bulk', [
        'users' => [
            [
                'fullname' => 'Bulk Teller',
                'username' => 'bulk-teller',
                'password' => 'password',
                'role' => 'teller',
                'class' => 'XI RPL 1',
                'phone_number' => '08123456789',
            ],
            [
                'fullname' => 'Bulk Supervisor',
                'username' => 'bulk-supervisor',
                'password' => 'password',
                'role' => 'supervisor',
            ],
        ],
    ]);

    $response->assertCreated()->assertJsonCount(2, 'data');
    expect(User::count())->toBe(3);
    expect(Teller::count())->toBe(1);
    $this->assertDatabaseHas('tellers', [
        'name' => 'Bulk Teller',
        'class' => 'XI RPL 1',
        'phone_number' => '08123456789',
    ]);
});

it('requires teller details before creating any users in a batch', function () {
    createBulkCreationAdmin();

    $response = $this->postJson('/api/users/bulk', [
        'users' => [
            [
                'fullname' => 'Incomplete Teller',
                'username' => 'incomplete-teller',
                'password' => 'password',
                'role' => 'teller',
            ],
            [
                'fullname' => 'Valid Supervisor',
                'username' => 'valid-supervisor',
                'password' => 'password',
                'role' => 'supervisor',
            ],
        ],
    ]);

    $response->assertUnprocessable();
    expect(User::query()->where('username', '!=', 'bulk-admin')->count())->toBe(0);
    expect(Teller::count())->toBe(0);
});
