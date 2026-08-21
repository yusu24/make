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
        Schema::create('budidaya_animals', function (Blueprint $table) {
            $table->id();
            $table->string('tenant_id')->index();
            $table->foreignId('pond_id')->nullable()->constrained('budidaya_ponds')->nullOnDelete(); // enclosure / cage / aviary / pen
            $table->foreignId('cycle_id')->nullable()->constrained('budidaya_cycles')->nullOnDelete(); // optional link to batch
            $table->foreignId('species_id')->nullable()->constrained('budidaya_species')->nullOnDelete();
            
            $table->string('tag_code')->index(); // Ear Tag, Ring ID, RFID, Microchip, Tattoo, Serial
            $table->string('name')->nullable(); // Optional pet/breeder name
            $table->string('category')->default('livestock'); // aquaculture, poultry, livestock, bird
            $table->string('species_name')->nullable();
            $table->string('breed')->nullable(); // Ras, Varian, Mutasi Warna (e.g. Limosin, Boer, Lutino MM, Biola)
            $table->enum('gender', ['male', 'female', 'unknown'])->default('unknown');
            $table->date('birth_date')->nullable();
            $table->date('entry_date')->nullable();
            
            $table->decimal('initial_weight_kg', 10, 3)->nullable();
            $table->decimal('current_weight_kg', 10, 3)->nullable();
            
            $table->unsignedBigInteger('father_id')->nullable(); // Sire / Pejantan
            $table->unsignedBigInteger('mother_id')->nullable(); // Dam / Indukan
            
            $table->enum('status', [
                'active',       // Sehat / Aktif
                'breeding',     // Dalam masa kawin / jodoh
                'pregnant',     // Bunting / Mengeram
                'quarantine',   // Karantina
                'sick',         // Sakit
                'sold',         // Terjual
                'harvested',    // Dipotong / Dipanen
                'deceased',     // Mati
                'culled'        // Afkir
            ])->default('active');
            
            $table->decimal('purchase_price', 15, 2)->nullable();
            $table->decimal('selling_price', 15, 2)->nullable();
            $table->date('exit_date')->nullable();
            $table->string('exit_reason')->nullable();
            
            $table->string('photo_url')->nullable();
            $table->text('notes')->nullable();
            $table->json('metadata')->nullable(); // Custom traits: eye color, horn shape, certificate no, etc.
            
            $table->timestamps();

            // Silsilah Foreign Keys (self-referencing without cascade to avoid delete cycles)
            $table->foreign('father_id')->references('id')->on('budidaya_animals')->nullOnDelete();
            $table->foreign('mother_id')->references('id')->on('budidaya_animals')->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('budidaya_animals');
    }
};
