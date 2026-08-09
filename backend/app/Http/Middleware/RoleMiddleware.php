<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\Auth;

class RoleMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {

        $roles = array_map('trim', $roles);

        if (!in_array(Auth::user()->role->value, $roles)) {
            abort(403, "unauthorized: allowed roles are " . implode(', ', $roles) . ". Your role: " . Auth::user()->role->value);
        }
        return $next($request);
    }
}
