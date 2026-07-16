<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use App\Models\RetailExpense;
use App\Models\RetailExpenseCategory;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('retail_expenses', function (Blueprint $table) {
            $table->foreignId('expense_category_id')->nullable()->after('kategori')->constrained('retail_expense_categories')->nullOnDelete();
        });

        // Backfill: map existing free-text `kategori` values to matching/new category rows per tenant.
        RetailExpense::withoutGlobalScopes()->whereNotNull('kategori')->get()
            ->groupBy(['tenant_id', 'kategori'])
            ->each(function ($byKategori, $tenantId) {
                foreach ($byKategori as $kategori => $rows) {
                    $category = RetailExpenseCategory::withoutGlobalScopes()
                        ->where('tenant_id', $tenantId)
                        ->where('name', $kategori)
                        ->first();

                    if (!$category) {
                        $category = RetailExpenseCategory::withoutGlobalScopes()->create([
                            'tenant_id' => $tenantId,
                            'name' => $kategori,
                        ]);
                    }

                    RetailExpense::withoutGlobalScopes()
                        ->whereIn('id', $rows->pluck('id'))
                        ->update(['expense_category_id' => $category->id]);
                }
            });
    }

    public function down(): void
    {
        Schema::table('retail_expenses', function (Blueprint $table) {
            $table->dropForeign(['expense_category_id']);
            $table->dropColumn('expense_category_id');
        });
    }
};
