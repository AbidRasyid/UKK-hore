<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\enum\Status;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Carbon\Carbon;
use Illuminate\Validation\Rule;

use function Laravel\Prompts\search;

function account_number(Customer $customer) {
    $now = Carbon::now();
    $academic_year = $now->month >= 7 ? $now->year : $now->year - 1;
    return substr($academic_year, -2) . substr($customer->student_id, -4);
}

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
                "pin" => ['required', 'digits:6']
            ]);

            $now = Carbon::now();

            $academic_year = $now->month >= 7 ? $now->year : $now->year - 1;

                $customer = Customer::create([
                    'student_id' => $validated['student_id'],
                    'account_number' => $academic_year . $validated['student_id'],
                    'student_name' => $validated['student_name'],
                    'student_class' => $validated['student_class'],
                    'password' => $validated['password'],
                    'status' => Status::ACTIVE->value,
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
            return response()->json([
                "message" => "user updated successfully"
            ], 200);

        } catch (\Throwable $th) {
            return response()->json([
                "message" => "user failed to update",
                "error" => $th->getMessage(),
                'line' => $th->getLine()
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
