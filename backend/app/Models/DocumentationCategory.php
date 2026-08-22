<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DocumentationCategory extends Model
{
    use HasFactory;

    protected $guarded = ['id'];

    public function parent()
    {
        return $this->belongsTo(DocumentationCategory::class, 'parent_id');
    }

    public function children()
    {
        return $this->hasMany(DocumentationCategory::class, 'parent_id')->orderBy('order');
    }

    public function articles()
    {
        return $this->hasMany(DocumentationArticle::class, 'category_id')->orderBy('id', 'desc');
    }
}
