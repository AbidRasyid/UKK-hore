<?php

namespace App\Http\Requests;

use App\Status;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

use App\UserRole;
use Illuminate\Validation\Rule;

class UserRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()->role === UserRole::ADMINISTRATOR;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
        'username' => ['required', 'string'],
        'password' => ['required', 'string'],
        'fullname' => ['required', 'string'],
        'role' => ['required', Rule::enum(UserRole::class)],
        'status' => ['nullable', Rule::enum(Status::class)]
    ];
    }
}
