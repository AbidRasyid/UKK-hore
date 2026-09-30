<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Status;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Carbon\Carbon;

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
                "student_id" => ['required', 'string'],
                "student_class" => ['required', 'string'],
                "password" => ['required', 'string'],
                "pin" => ['required', 'string']
            ]);

            $now = Carbon::now();

            $academic_year = $now->month >= 7 ? $now->year : $now->year - 1;

                $customer = Customer::create([
                    'student_id' => $validated['student_id'],
                    'account_number' => $academic_year . $validated['student_id'],
                    'student_name' => $validated['student_name'],
                    'student_class' => $validated['student_class'],
                    'password' => $validated['password'],
                    'pin' => $validated['pin'],
                ]);

                return response()->json([
                    "message" => "user created successfully",
                    "data" => [
                        "customer" => $customer
                    ] 
                ], 200);
        }catch(\Throwable $e){
            return response()->json([
                "message" => "user failed to create". $e->getMessage()
            ], 400);
        }
    }

    public function show(int $customer_id):JsonResponse
    {
        try {
            $customer = Customer::findOrFail($customer_id);
            return response()->json([
                "message" => "customer has been found successfully",
                "data" => [
                    "customer" => $customer,
                    ]
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
            $validated = $request->validate([
                "student_name" => ['required', 'string'],
                "student_id" => ['required', 'string'],
                "student_class" => ['required', 'string'],
                "password" => ['required', 'string'],
                "pin" => ['required', 'string'],
                "status" => ['nullable', Status::class]
            ]);
            $customer = Customer::findOrFail($customer_id);
                $customer->update([
                    'student_name' => $validated['student_name'],
                    'student_class' => $validated['student_class'],
                    'password' => $validated['password'],
                    'pin' => $validated['pin'],
                    'status' => $validated['status'] ?? $customer->status,
                ]);
                return response()->json([
                    "message" => "user updated successfully"
                ], 200);

        } catch (\Throwable $th) {
            return response()->json([
                "message" => "user failed to update",
            ], 400);
        }
    }

    public function delete(int $customer_id):JsonResponse
    {
        try {
            $customer = Customer::findOrFail($customer_id);
            $customer->delete();
            return response()->json([
                "message" => "customer has been deleted successfully"
            ], 200);
        } catch (\Throwable $th) {
            return response()->json([
                "message" => "customer failed to delete",
            ], 400);
        }
    }

}
