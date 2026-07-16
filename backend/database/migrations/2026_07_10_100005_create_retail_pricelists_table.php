<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('retail_pricelists', function (Blueprint $table) {
            $table->id();
            $table->string('tenant_id');
            $table->string('name');
            $table->string('type', 20)->default('retail'); // retail | wholesale | member
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('retail_pricelists');
    }
};
