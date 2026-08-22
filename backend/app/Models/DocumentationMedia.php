<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DocumentationMedia extends Model
{
    use HasFactory;

    protected $guarded = ['id'];

    public function article()
    {
        return $this->belongsTo(DocumentationArticle::class, 'article_id');
    }
}
