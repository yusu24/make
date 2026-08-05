<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Rename table and add type column
        Schema::rename('retail_expense_categories', 'retail_finance_categories');
        Schema::table('retail_finance_categories', function (Blueprint $table) {
            $table->string('type')->default('expense')->after('name');
        });

        // 2. Rename foreign key column in retail_expenses
        // In SQLite, dropForeign might fail if constraints are not explicitly named or supported, 
        // but Laravel 10+ handles renameColumn gracefully in SQLite.
        Schema::table('retail_expenses', function (Blueprint $table) {
            $table->renameColumn('expense_category_id', 'finance_category_id');
        });

        // 3. Create retail_incomes table
        Schema::create('retail_incomes', function (Blueprint $table) {
            $table->id();
            $table->string('tenant_id');
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->date('tanggal');
            $table->text('keterangan');
            $table->decimal('nominal', 15, 2);
            $table->string('kategori')->nullable(); // Legacy string category
            $table->foreignId('finance_category_id')->nullable()->constrained('retail_finance_categories')->nullOnDelete();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('retail_incomes');

        Schema::table('retail_expenses', function (Blueprint $table) {
            $table->renameColumn('finance_category_id', 'expense_category_id');
        });

        Schema::table('retail_finance_categories', function (Blueprint $table) {
            $table->dropColumn('type');
        });
        Schema::rename('retail_finance_categories', 'retail_expense_categories');
    }
};
