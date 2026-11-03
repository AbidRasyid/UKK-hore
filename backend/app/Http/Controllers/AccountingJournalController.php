<?php

namespace App\Http\Controllers;

use App\Models\AccountingJournal;
// use Illuminate\Http\Request;

class AccountingJournalController extends Controller
{
    public function index(){
        try {
            $data = AccountingJournal::orderByDesc('created_at')->get();
            return response()->json([
                'message' => 'data has been loaded successfully',
                'data' => $data
            ], 200);
        } catch (\Throwable $th) {
            return response()->json([
                'message' => 'data not loaded',
            ], 500);
        }
    }
}
