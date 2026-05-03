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
        // Adjust Tenants table to match core requirements (id, name, type)
        // We'll keep existing columns if needed but ensure id, name, type exist.
        if (Schema::hasTable('tenants')) {
            Schema::table('tenants', function (Blueprint $table) {
                if (!Schema::hasColumn('tenants', 'name')) {
                    $table->string('name')->after('id')->nullable();
                }
                if (!Schema::hasColumn('tenants', 'type')) {
                    $table->string('type')->after('name')->nullable();
                }
            });
            
            // Sync business_name to name if exists
            \DB::table('tenants')->update(['name' => \DB::raw('business_name')]);
        }

        // Adjust Users table to match core requirements (id, tenant_id, name, email, password, role)
        // Most are already there from Laravel default + previous migrations.

        // Create Products table (id, tenant_id, name, type, price, cost, stock, unit)
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->string('tenant_id');
            $table->string('name');
            $table->string('type')->nullable();
            $table->decimal('price', 15, 2)->default(0);
            $table->decimal('cost', 15, 2)->default(0);
            $table->decimal('stock', 15, 2)->default(0);
            $table->string('unit')->nullable();
            $table->timestamps();

            $table->index('tenant_id');
        });

        // Create Transactions table (id, tenant_id, type[income/expense], source, reference_id, amount, description, date)
        Schema::create('transactions', function (Blueprint $table) {
            $table->id();
            $table->string('tenant_id');
            $table->enum('type', ['income', 'expense']);
            $table->string('source')->nullable(); // e.g. sale, purchase, expense_manual
            $table->string('reference_id')->nullable(); // link to other records if needed
            $table->decimal('amount', 15, 2);
            $table->text('description')->nullable();
            $table->date('date');
            $table->timestamps();

            $table->index('tenant_id');
            $table->index('type');
        });

        // Create Transaction Items table (id, transaction_id, product_id, qty, price, subtotal)
        Schema::create('transaction_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('transaction_id')->constrained()->onDelete('cascade');
            $table->foreignId('product_id')->constrained()->onDelete('cascade');
            $table->decimal('qty', 15, 2);
            $table->decimal('price', 15, 2);
            $table->decimal('subtotal', 15, 2);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('transaction_items');
        Schema::dropIfExists('transactions');
        Schema::dropIfExists('products');
    }
};
