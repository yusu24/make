<?php

namespace Tests\Feature;

use App\Models\ApiKey;
use App\Models\BusinessCategory;
use App\Models\Product;
use App\Models\RetailProduct;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class MultiTenancySecurityTest extends TestCase
{
    use RefreshDatabase;

    private BusinessCategory $category;
    private Tenant $tenantA;
    private Tenant $tenantB;
    private User $userA;
    private User $userB;

    protected function setUp(): void
    {
        parent::setUp();

        $this->category = BusinessCategory::create([
            'name' => 'Toko Retail',
            'slug' => 'toko-retail',
            'icon' => 'shopping-cart',
            'color' => '#10B981',
            'is_active' => true,
        ]);

        $this->userA = User::create([
            'name' => 'Owner Tenant A',
            'email' => 'tenantA@example.com',
            'password' => Hash::make('password'),
            'role' => 'owner',
            'tenant_id' => 'TN-TEST-AAA',
            'business_category_id' => $this->category->id,
        ]);

        $this->tenantA = Tenant::create([
            'tenant_id' => 'TN-TEST-AAA',
            'user_id' => $this->userA->id,
            'business_category_id' => $this->category->id,
            'business_name' => 'Retail Shop A',
            'subscription_plan' => 'enterprise',
            'status' => 'active',
            'trial_ends_at' => now()->addDays(30),
        ]);

        $this->userB = User::create([
            'name' => 'Owner Tenant B',
            'email' => 'tenantB@example.com',
            'password' => Hash::make('password'),
            'role' => 'owner',
            'tenant_id' => 'TN-TEST-BBB',
            'business_category_id' => $this->category->id,
        ]);

        $this->tenantB = Tenant::create([
            'tenant_id' => 'TN-TEST-BBB',
            'user_id' => $this->userB->id,
            'business_category_id' => $this->category->id,
            'business_name' => 'Retail Shop B',
            'subscription_plan' => 'enterprise',
            'status' => 'active',
            'trial_ends_at' => now()->addDays(30),
        ]);
    }

    /**
     * T1: Tenant Isolation - User A cannot see User B's retail products.
     */
    public function test_tenant_data_isolation_on_retail_products(): void
    {
        // Seed products directly in DB
        RetailProduct::withoutGlobalScopes()->create([
            'tenant_id' => 'TN-TEST-AAA',
            'name' => 'Product Alpha (Tenant A)',
            'sku' => 'SKU-A1',
            'price_sell' => 10000,
            'stock' => 50,
        ]);

        RetailProduct::withoutGlobalScopes()->create([
            'tenant_id' => 'TN-TEST-BBB',
            'name' => 'Product Beta (Tenant B)',
            'sku' => 'SKU-B1',
            'price_sell' => 20000,
            'stock' => 30,
        ]);

        Sanctum::actingAs($this->userA);

        $response = $this->getJson('/api/retail/products');

        $response->assertStatus(200);
        $response->assertJsonFragment(['sku' => 'SKU-A1']);
        $response->assertJsonMissing(['sku' => 'SKU-B1']);
    }

    /**
     * T2: Header Tampering - Passing X-Tenant-ID does not allow context switching.
     */
    public function test_x_tenant_id_header_spoofing_is_ignored(): void
    {
        RetailProduct::withoutGlobalScopes()->create([
            'tenant_id' => 'TN-TEST-AAA',
            'name' => 'Product Alpha (Tenant A)',
            'sku' => 'SKU-A1',
            'price_sell' => 10000,
            'stock' => 50,
        ]);

        RetailProduct::withoutGlobalScopes()->create([
            'tenant_id' => 'TN-TEST-BBB',
            'name' => 'Product Beta (Tenant B)',
            'sku' => 'SKU-B1',
            'price_sell' => 20000,
            'stock' => 30,
        ]);

        Sanctum::actingAs($this->userA);

        // User A tries to spoof context by sending X-Tenant-ID header of Tenant B
        $response = $this->withHeader('X-Tenant-ID', 'TN-TEST-BBB')
                         ->getJson('/api/retail/products');

        $response->assertStatus(200);
        $response->assertJsonFragment(['sku' => 'SKU-A1']);
        $response->assertJsonMissing(['sku' => 'SKU-B1']);
    }

    /**
     * T3: User without tenant_id receives 403 Forbidden.
     */
    public function test_user_without_tenant_id_is_rejected_with_403(): void
    {
        $orphanedUser = User::create([
            'name' => 'User Without Tenant',
            'email' => 'notenant@example.com',
            'password' => Hash::make('password'),
            'role' => 'staff',
            'tenant_id' => null,
            'business_category_id' => $this->category->id,
        ]);

        Sanctum::actingAs($orphanedUser);

        $response = $this->getJson('/api/retail/products');

        $response->assertStatus(403);
    }

    /**
     * T4: API Key Authentication - Valid API Key scopes queries to tenant context.
     */
    public function test_api_key_authentication_scopes_queries_to_tenant(): void
    {
        $rawKey = 'biz_test_apikey_1234567890';
        ApiKey::create([
            'tenant_id' => 'TN-TEST-AAA',
            'name' => 'Integration Key A',
            'key_prefix' => 'biz_test',
            'hashed_key' => hash('sha256', $rawKey),
            'created_by' => $this->userA->id,
        ]);

        Product::withoutGlobalScopes()->create([
            'tenant_id' => 'TN-TEST-AAA',
            'name' => 'Product Alpha (Tenant A)',
            'price' => 10000,
            'stock' => 50,
        ]);

        Product::withoutGlobalScopes()->create([
            'tenant_id' => 'TN-TEST-BBB',
            'name' => 'Product Beta (Tenant B)',
            'price' => 20000,
            'stock' => 30,
        ]);

        $response = $this->withHeader('X-API-KEY', $rawKey)
                         ->getJson('/api/v1/external/products');

        $response->assertStatus(200);
        $response->assertJsonFragment(['name' => 'Product Alpha (Tenant A)']);
        $response->assertJsonMissing(['name' => 'Product Beta (Tenant B)']);
    }

    /**
     * T5: Orphaned API Key - API key with null tenant_id is rejected with 403.
     */
    public function test_orphaned_api_key_is_rejected_with_403(): void
    {
        $rawKey = 'biz_orphaned_key_999999999';
        ApiKey::create([
            'tenant_id' => null,
            'name' => 'Orphaned Key',
            'key_prefix' => 'biz_orph',
            'hashed_key' => hash('sha256', $rawKey),
            'created_by' => $this->userA->id,
        ]);

        $response = $this->withHeader('X-API-KEY', $rawKey)
                         ->getJson('/api/v1/external/products');

        $response->assertStatus(403);
        $response->assertJsonFragment(['error_code' => 'API_KEY_ORPHANED']);
    }

    /**
     * T6: Demo/Sandbox API Key - Blocked with DEMO_API_DISABLED.
     */
    public function test_demo_sandbox_api_key_is_blocked(): void
    {
        $rawKey = 'biz_demo_key_888888888';
        ApiKey::create([
            'tenant_id' => 'TN-DS-99999',
            'name' => 'Demo Sandbox Key',
            'key_prefix' => 'biz_demo',
            'hashed_key' => hash('sha256', $rawKey),
            'created_by' => $this->userA->id,
        ]);

        $response = $this->withHeader('X-API-KEY', $rawKey)
                         ->getJson('/api/v1/external/products');

        $response->assertStatus(403);
        $response->assertJsonFragment(['error_code' => 'DEMO_API_DISABLED']);
    }

    /**
     * T7: HasTenant creating event - Overrides spoofed tenant_id from request context.
     */
    public function test_has_tenant_creating_forces_trusted_tenant_context(): void
    {
        Sanctum::actingAs($this->userA);

        // Attempt mass-assignment injection of tenant_id = 'TN-TEST-BBB'
        $product = RetailProduct::create([
            'tenant_id' => 'TN-TEST-BBB',
            'name' => 'Malicious Product',
            'sku' => 'MAL-001',
            'price_sell' => 5000,
            'stock' => 10,
        ]);

        // Model must have overwritten the injected tenant_id with User A's tenant_id
        $this->assertEquals('TN-TEST-AAA', $product->tenant_id);
    }

    /**
     * T8: HasTenant updating event - Reverts dirty tenant_id modifications.
     */
    public function test_has_tenant_updating_prevents_tenant_id_mutation(): void
    {
        $product = RetailProduct::withoutGlobalScopes()->create([
            'tenant_id' => 'TN-TEST-AAA',
            'name' => 'Original Product',
            'sku' => 'ORIG-001',
            'price_sell' => 5000,
            'stock' => 10,
        ]);

        // Attempt to reassign product to Tenant B
        $product->tenant_id = 'TN-TEST-BBB';
        $product->save();

        $fresh = RetailProduct::withoutGlobalScopes()->find($product->id);
        $this->assertEquals('TN-TEST-AAA', $fresh->tenant_id);
    }
}
