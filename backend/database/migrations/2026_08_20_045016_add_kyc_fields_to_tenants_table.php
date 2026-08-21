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
        Schema::table('tenants', function (Blueprint $table) {
            $table->string('kyc_status')->default('unverified')->after('status');
            $table->string('kyc_document_path')->nullable()->after('kyc_status');
            $table->text('kyc_notes')->nullable()->after('kyc_document_path');
            $table->timestamp('kyc_submitted_at')->nullable()->after('kyc_notes');
            $table->timestamp('kyc_verified_at')->nullable()->after('kyc_submitted_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('tenants', function (Blueprint $table) {
            $table->dropColumn([
                'kyc_status',
                'kyc_document_path',
                'kyc_notes',
                'kyc_submitted_at',
                'kyc_verified_at',
            ]);
        });
    }
};
