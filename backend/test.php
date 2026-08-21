<?php
$t = DB::table('tenants')->where('business_category_id', DB::table('business_categories')->where('slug', 'jasa')->value('id'))->first();
$u = App\Models\User::where('tenant_id', $t->tenant_id)->first();
echo "TOKEN=" . $u->createToken('test')->plainTextToken;
