<?php

namespace Database\Seeders;

use App\enum\PinStatus;
use App\Models\ChangePinRequest;
use App\Models\Customer;
use Illuminate\Database\Seeder;

class ChangePinRequestSeeder extends Seeder
{
    public function run(): void
    {
        $customer = Customer::where('student_id', '17756')->firstOrFail();

        ChangePinRequest::updateOrCreate(
            [
                'customer_id' => $customer->id,
                'status' => PinStatus::PENDING->value,
            ],
            [
                'new_pin' => '654321',
                'approved_by' => null,
            ],
        );
    }
}
