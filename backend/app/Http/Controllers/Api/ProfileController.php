<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class ProfileController extends Controller
{
    public function update(Request $request)
    {
        $user = $request->user();

        $validator = Validator::make($request->all(), [
            'name'  => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $user->id,
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $user->update(['name' => $request->name, 'email' => $request->email]);
        ActivityLog::record('edit_profile', 'Profile: ' . $user->name, 'info');

        return response()->json(['success' => true, 'message' => 'Profil berhasil diperbarui', 'data' => $user]);
    }

    public function updatePassword(Request $request)
    {
        $user = $request->user();

        $validator = Validator::make($request->all(), [
            'current_password'           => 'required|string',
            'new_password'               => 'required|string|min:8|confirmed',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        if (!Hash::check($request->current_password, $user->password)) {
            return response()->json(['success' => false, 'message' => 'Password saat ini salah'], 422);
        }

        $user->update(['password' => Hash::make($request->new_password)]);
        ActivityLog::record('change_password', 'Profile: ' . $user->name, 'info');

        return response()->json(['success' => true, 'message' => 'Password berhasil diubah']);
    }
}
