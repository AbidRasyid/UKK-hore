<?php

namespace App\Http\Controllers;

use App\enum\ActivityAction;
use App\enum\Majors;
use App\enum\MajorsInit;
use App\Models\Customer;
use App\Services\LogService;
use App\enum\Status;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;

class CustomerController extends Controller
{
    public function index():JsonResponse{
        try{
            $data = Customer::all();
            return response()->json([
                "message" => "data has been loaded successfully",
                "data" => $data
            ], 200);
        }catch(\Throwable $e){
            return response()->json([
                "message" => "data not loaded",
            ], 500);
        }
    }

    public function store(Request $request):JsonResponse{
        try{
            $validated = $request->validate([
                "student_name" => ['required', 'string'],
                "email" => ['nullable', 'email', 'unique:customers,email'],
                "student_id" => ['required', 'string'],
                "student_class" => ['required', Rule::enum(Majors::class)],
                "password" => ['required', 'string'],
                "pin" => ['nullable', 'digits:6']
            ]);

                $customer = $this->createCustomer($validated);

                $actor = Auth::user()?->fullname ?? Auth::id() ?? 'Unknown';
                LogService::record(
                    ActivityAction::CUSTOMER_CREATED,
                    "Customer created by {$actor} on Customer ID {$customer->id}. Status: Success. Customer account created."
                );

                return response()->json([
                    "message" => "user created successfully",
                    "data" => [
                        "customer" => $customer
                    ] 
                ], 200);
        }catch(\Throwable $e){
            $actor = Auth::user()?->fullname ?? Auth::id() ?? 'Unknown';
            $studentId = $validated['student_id'] ?? 'unknown';
            LogService::record(
                ActivityAction::CUSTOMER_CREATED,
                "Customer created by {$actor} on Customer student ID {$studentId}. Status: Failed. {$e->getMessage()}"
            );

            return response()->json([
                "message" => "user failed to create". $e->getMessage()
            ], 400);
        }
    }

    public function bulkStore(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'customers' => ['required', 'array', 'min:1', 'max:100'],
            'customers.*.student_name' => ['required', 'string'],
            'customers.*.email' => ['nullable', 'email', 'distinct:ignore_case', 'unique:customers,email'],
            'customers.*.student_id' => ['required', 'string', 'distinct', 'unique:customers,student_id'],
            'customers.*.student_class' => ['required', Rule::enum(Majors::class)],
            'customers.*.password' => ['required', 'string'],
            'customers.*.pin' => ['nullable', 'digits:6'],
        ]);

        try {
            $customers = DB::transaction(function () use ($validated) {
                return collect($validated['customers'])
                    ->map(fn (array $customer) => $this->createCustomer($customer));
            });

            $actor = Auth::user()?->fullname ?? Auth::id() ?? 'Unknown';
            foreach ($customers as $customer) {
                LogService::record(
                    ActivityAction::CUSTOMER_CREATED,
                    "Customer created by {$actor} on Customer ID {$customer->id}. Status: Success. Customer account created."
                );
            }

            return response()->json([
                'message' => 'Customers created successfully',
                'data' => $customers,
            ], 201);
        } catch (\Throwable $e) {
            report($e);

            return response()->json([
                'message' => 'Customers failed to create.',
            ], 500);
        }
    }

    private function createCustomer(array $customerData): Customer
    {
        $now = Carbon::now();
        $academicYear = $now->month >= 7 ? $now->year : $now->year - 1;
        $majorCode = match (Majors::from($customerData['student_class'])) {
            Majors::RPL => MajorsInit::RPL->value,
            Majors::TKJ => MajorsInit::TKJ->value,
            Majors::DKV => MajorsInit::DKV->value,
            Majors::MP => MajorsInit::MP->value,
            Majors::AK => MajorsInit::AK->value,
            Majors::BR => MajorsInit::BR->value,
            Majors::BD => MajorsInit::BD->value,
            Majors::LPS => MajorsInit::LPS->value,
        };

        return Customer::create([
            'student_id' => $customerData['student_id'],
            'account_number' => substr((string) $academicYear, -2)
                . '0'
                . $majorCode
                . $customerData['student_id'],
            'student_name' => $customerData['student_name'],
            'email' => $customerData['email'] ?? null,
            'student_class' => $customerData['student_class'],
            'password' => $customerData['password'],
            'status' => Status::ACTIVE->value,
            'pin' => $customerData['pin'] ?? null,
        ]);
    }

    public function show($customer_id = null):JsonResponse
    {
        try {
            if(is_numeric($customer_id)){
                $customer = Customer::findOrFail($customer_id);

                return response()->json([
                    'message' => 'customer has been found successfully',
                    'data' => $customer
                ], 200);
            }
            
            $query = Customer::query();
            
            if(request()->has('s')) {
                $search = request()->query('s');
                $query->where('account_number', 'like', "%{$search}%")
                        ->orWhere('student_name', 'like', "%{$search}%");
            }

            $customer = $query->get();

            if($customer->isEmpty()){
                return response()->json([
                    "message" => "customers not found",
                    "data" => []
                ], 404);
            }
            return response()->json([
                "message" => "customer has been found successfully",
                "data" => $customer
            ], 200);
        } catch (\Throwable $th) {
            return response()->json([
                "message" => "customer not found",
            ], 404);
        }
    }

    public function update(Request $request, int $customer_id):JsonResponse
    {
        try {
            $updateData = [];
            $customer = Customer::findOrFail($customer_id);
            $validated = $request->validate([
                "student_name" => ['sometimes', 'required', 'string'],
                "email" => ['sometimes', 'nullable', 'email', Rule::unique('customers', 'email')->ignore($customer->id)],
                "student_id" => ['sometimes', 'required', 'string'],
                "student_class" => ['sometimes', 'required', 'string'],
                "password" => ['sometimes', 'required', 'string'],
                "pin" => ['sometimes', 'required', 'digits:6'],
                "status" => ['sometimes', 'nullable', Rule::enum(Status::class)]
            ]);

            if(array_key_exists('student_id', $validated)){
                $updateData['student_id'] = $validated['student_id'];
            }

            if(array_key_exists('student_name', $validated)){
                $updateData['student_name'] = $validated['student_name'];
            }

            if(array_key_exists('email', $validated)){
                $updateData['email'] = $validated['email'];
            }

            if(array_key_exists('student_class', $validated)){
                $updateData['student_class'] = $validated['student_class'];
            }

            if(array_key_exists('password', $validated)){
                $updateData['password'] = $validated['password'];
            }

            if(array_key_exists('pin', $validated)){
                $updateData['pin'] = $validated['pin'];
            }

            if(array_key_exists('status', $validated)){
                $updateData['status'] = $validated['status'];
            }

            $customer->update($updateData);
            $actor = Auth::user()?->fullname ?? Auth::id() ?? 'Unknown';
            LogService::record(
                ActivityAction::CUSTOMER_UPDATED,
                "Customer updated by {$actor} on Customer ID {$customer->id}. Status: Success. Customer details updated."
            );

            return response()->json([
                "message" => "user updated successfully"
            ], 200);

        } catch (\Throwable $th) {
            $actor = Auth::user()?->fullname ?? Auth::id() ?? 'Unknown';
            LogService::record(
                ActivityAction::CUSTOMER_UPDATED,
                "Customer updated by {$actor} on Customer ID {$customer_id}. Status: Failed. {$th->getMessage()}"
            );

            return response()->json([
                "message" => "user failed to update",
                "error" => $th->getMessage(),
                'line' => $th->getLine()
            ], 400);
        }
    }

    public function updateEmail(Request $request): JsonResponse
    {
        $customer = $request->user('customer');

        if (!$customer) {
            return response()->json([
                'message' => 'Customer authentication is required.',
            ], 401);
        }

        $validated = $request->validate([
            'email' => [
                'required',
                'email',
                Rule::unique('customers', 'email')->ignore($customer->getKey()),
            ],
        ]);

        $email = Str::lower($validated['email']);

        if (Str::lower((string) $customer->email) === $email) {
            return response()->json([
                'message' => 'The new email must be different from the current email.',
            ], 422);
        }

        if (Customer::query()
            ->where('id', '!=', $customer->getKey())
            ->whereRaw('LOWER(email) = ?', [$email], 'and')
            ->exists()) {
            return response()->json([
                'message' => 'The email has already been taken.',
            ], 422);
        }

        $customer->update(['email' => $email]);

        return response()->json([
            'message' => 'Email updated successfully.',
        ], 200);
    }

    public function delete(int $customer_id):JsonResponse
    {
        try {
            $customer = Customer::findOrFail($customer_id);
            $customer->delete();
            $actor = Auth::user()?->fullname ?? Auth::id() ?? 'Unknown';
            LogService::record(
                ActivityAction::CUSTOMER_DELETED,
                "Customer deleted by {$actor} on Customer ID {$customer->id}. Status: Success. Customer account deleted."
            );

            return response()->json([
                "message" => "customer has been deleted successfully"
            ], 200);
        } catch (\Throwable $th) {
            $actor = Auth::user()?->fullname ?? Auth::id() ?? 'Unknown';
            LogService::record(
                ActivityAction::CUSTOMER_DELETED,
                "Customer deleted by {$actor} on Customer ID {$customer_id}. Status: Failed. {$th->getMessage()}"
            );

            return response()->json([
                "message" => "customer failed to delete",
            ], 400);
        }
    }

}
