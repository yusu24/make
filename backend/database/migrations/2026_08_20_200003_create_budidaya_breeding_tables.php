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
        // 1. Breeding Pairs (Pasangan Jodoh / Koloni Breeding)
        Schema::create('budidaya_breeding_pairs', function (Blueprint $table) {
            $table->id();
            $table->string('tenant_id')->index();
            $table->foreignId('pond_id')->nullable()->constrained('budidaya_ponds')->nullOnDelete(); // enclosure / kandang jodoh / aviary
            $table->string('pair_code')->index(); // e.g. PAIR-LB-01, JODOH-MR-02
            $table->string('name')->nullable();
            
            $table->unsignedBigInteger('male_animal_id')->nullable();
            $table->unsignedBigInteger('female_animal_id')->nullable();
            $table->string('male_name')->nullable(); // manual fallback if not tracked in animals table
            $table->string('female_name')->nullable();
            
            $table->date('paired_date');
            $table->enum('status', ['active', 'separated', 'resting', 'retired'])->default('active');
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->foreign('male_animal_id')->references('id')->on('budidaya_animals')->nullOnDelete();
            $table->foreign('female_animal_id')->references('id')->on('budidaya_animals')->nullOnDelete();
        });

        // 2. Breeding Logs (Siklus Kawin, Telur/Clutch, Bunting, Inkubasi, Menetas/Kelahiran, Anakan)
        Schema::create('budidaya_breeding_logs', function (Blueprint $table) {
            $table->id();
            $table->string('tenant_id')->index();
            $table->foreignId('breeding_pair_id')->nullable()->constrained('budidaya_breeding_pairs')->cascadeOnDelete();
            $table->foreignId('cycle_id')->nullable()->constrained('budidaya_cycles')->nullOnDelete();
            
            $table->enum('event_type', [
                'mating',            // Perkawinan
                'clutch_egg',        // Bertelur (Burung / Unggas)
                'pregnancy_check',   // Cek Kebuntingan (Mamalia)
                'incubation',        // Pengeraman / Mesin Tetas
                'hatch_birth',       // Menetas / Kelahiran
                'weaning'            // Sapih Anakan
            ]);
            
            $table->date('event_date');
            
            // Metrics
            $table->integer('egg_count')->nullable(); // Total telur
            $table->integer('fertile_egg_count')->nullable(); // Telur fertil / isi
            $table->integer('hatched_count')->nullable(); // Menetas
            $table->integer('born_alive_count')->nullable(); // Lahir hidup
            $table->integer('born_dead_count')->nullable(); // Lahir mati
            
            $table->date('expected_date')->nullable(); // Estimasi menetas / partus
            $table->date('actual_date')->nullable(); // Realisasi
            
            $table->enum('status', ['in_progress', 'completed', 'failed'])->default('in_progress');
            $table->text('offspring_notes')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('budidaya_breeding_logs');
        Schema::dropIfExists('budidaya_breeding_pairs');
    }
};
