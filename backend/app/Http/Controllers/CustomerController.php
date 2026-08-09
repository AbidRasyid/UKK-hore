<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\UserRole;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\User;
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
                "username" => ['required', 'string'],
                "password" => ['required', 'string'],
                "student_name" => ['required', 'string'],
                "student_id" => ['required', 'string'],
                "student_class" => ['required', 'string'],
                "pin" => ['required', 'string']
            ]);

            $now = Carbon::now();

            $academic_year = $now->month >= 7 ? $now->year : $now->year - 1;

            return DB::transaction(function () use ($validated, $academic_year){
                $user = User::create([
                    'username' => $validated['username'],
                    'password' => $validated['password'],
                    'fullname' => $validated['student_name'],
                    'role' => UserRole::CUSTOMER->value,
                ]);

                $customer = Customer::create([
                    'user_id' => $user->id,
                    'student_id' => $validated['student_id'],
                    'account_number' => $academic_year . $validated['student_id'],
                    'student_name' => $validated['student_name'],
                    'student_class' => $validated['student_class'],
                    'pin' => $validated['pin'],
                ]);

                return response()->json([
                    "message" => "user created successfully",
                    "data" => [
                        "user" => $user, 
                        "customer" => $customer
                    ] 
                ], 200);
            });
        }catch(\Throwable $e){
            return response()->json([
                "message" => "user failed to create". $e->getMessage()
            ], 400);
        }
    }

    public function show(int $id):JsonResponse
    {
        try {
            $customer = Customer::findOrFail($id);
            $user = User::findOrFail($customer['user_id']);
            return response()->json([
                "message" => "customer has been found successfully",
                "data" => [
                    "customer" => $customer,
                    "user" => $user
                    ]
            ], 200);
        } catch (\Throwable $th) {
            return response()->json([
                "message" => "customer not found",
            ], 404);
        }
    }

    public function update(Request $request, int $id):JsonResponse
    {
        try {
            $validated = $request->validate([
                "username" => ['required', 'string'],
                "password" => ['required', 'string'],
                "student_name" => ['required', 'string'],
                "student_id" => ['required', 'string'],
                "student_class" => ['required', 'string'],
                "pin" => ['required', 'string']
            ]);
            $customer = Customer::findOrFail($id);
            $user = User::findOrFail($customer['user_id']);

            return DB::transaction(function () use ($validated, $user, $customer){
                $user->update([
                    'username' => $validated['username'],
                    'password' => $validated['password'],
                    'fullname' => $validated['student_name'],
                ]);
                $customer->update([
                    'student_name' => $validated['student_name'],
                    'student_class' => $validated['student_class'],
                    'pin' => $validated['pin'],
                ]);
                return response()->json([
                    "message" => "user updated successfully"
                ], 200);
            });

        } catch (\Throwable $th) {
            return response()->json([
                "message" => "user failed to update",
            ], 400);
        }
    }

}
