<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('modules', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique(); // retail_pos, inventory, budidaya_cycle, website_order
            $table->string('display_name')->nullable();
            $table->timestamps();
        });

        Schema::create('business_modules', function (Blueprint $table) {
            $table->id();
            $table->string('tenant_id');
            $table->unsignedBigInteger('module_id');
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->foreign('module_id')->references('id')->on('modules')->onDelete('cascade');
            $table->index('tenant_id');
        });

        // Seed basic modules
        $modules = [
            ['name' => 'retail_pos', 'display_name' => 'Retail POS'],
            ['name' => 'inventory', 'display_name' => 'Inventory Management'],
            ['name' => 'budidaya_cycle', 'display_name' => 'Budidaya Cycle Management'],
            ['name' => 'website_order', 'display_name' => 'Website Ordering'],
        ];

        foreach ($modules as $module) {
            \DB::table('modules')->insert($module + ['created_at' => now(), 'updated_at' => now()]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('business_modules');
        Schema::dropIfExists('modules');
    }
};
