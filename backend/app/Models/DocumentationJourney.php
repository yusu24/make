<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DocumentationJourney extends Model
{
    use HasFactory;

    protected $guarded = ['id'];

    public function steps()
    {
        return $this->hasMany(DocumentationJourneyStep::class, 'journey_id')->orderBy('order');
    }
}
