<?php
$token = DB::table('personal_access_tokens')->orderBy('last_used_at', 'desc')->first();
if ($token) {
    $user = App\Models\User::find($token->tokenable_id);
    $tenant = App\Models\Tenant::where('tenant_id', $user->tenant_id)->with('businessCategory')->first();
    echo 'Last active user: ' . $user->email . ' (Tenant: ' . $tenant->tenant_id . ', Category: ' . ($tenant->businessCategory ? $tenant->businessCategory->slug : 'NULL') . ")\n";
} else {
    echo 'No tokens.';
}
