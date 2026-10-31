<?php

namespace App\Http\Requests;

use App\enum\Status;
use Illuminate\Foundation\Http\FormRequest;

use App\enum\UserRole;
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
        'username' => ['required', 'string', 'unique:users,username'],
        'password' => ['required', 'string'],
        'fullname' => ['required', 'string'],
        'role' => ['required', Rule::enum(UserRole::class)],
        'status' => ['nullable', Rule::enum(Status::class)],
        'class' => ['nullable', 'string', 'required_if:role,teller'],
        'phone_number' => ['nullable', 'string', 'required_if:role,teller'],
    ];
    }
}
