<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('kuliner_wastes', function (Blueprint $table) {
            $table->id();
            $table->string('tenant_id')->index();
            $table->foreignId('ingredient_id')->constrained('kuliner_ingredients')->cascadeOnDelete();
            $table->decimal('quantity', 10, 2);
            $table->string('reason', 20); // expired | damaged | other
            $table->date('waste_date');
            $table->decimal('value_lost', 15, 2)->default(0);
            $table->string('note')->nullable();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index(['tenant_id', 'waste_date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('kuliner_wastes');
    }
};
