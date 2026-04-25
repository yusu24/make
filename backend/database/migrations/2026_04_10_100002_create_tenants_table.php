<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tenants', function (Blueprint $table) {
            $table->id();
            $table->string('tenant_id')->unique(); // e.g. TN-001
            $table->unsignedBigInteger('user_id');
            $table->unsignedBigInteger('business_category_id');
            $table->string('business_name');
            $table->string('subscription_plan')->default('free'); // free | basic | pro
            $table->string('status')->default('active'); // active | inactive | suspended
            $table->timestamp('trial_ends_at')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('business_category_id')->references('id')->on('business_categories')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tenants');
    }
};
