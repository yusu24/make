<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DocumentationArticle;
use App\Models\DocumentationCategory;
use App\Models\DocumentationJourney;
use App\Models\DocumentationJourneyStep;
use App\Models\DocumentationMedia;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class AdminDocumentationController extends Controller
{
    // ==========================================
    // CATEGORIES
    // ==========================================
    public function getCategories(Request $request)
    {
        $categories = DocumentationCategory::with('children')->whereNull('parent_id')->orderBy('order')->get();
        return response()->json($categories);
    }

    public function storeCategory(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'module' => 'nullable|string',
            'parent_id' => 'nullable|exists:documentation_categories,id'
        ]);

        $category = DocumentationCategory::create([
            'name' => $request->name,
            'slug' => Str::slug($request->name) . '-' . time(),
            'module' => $request->module,
            'parent_id' => $request->parent_id,
            'description' => $request->description,
            'order' => $request->order ?? 0,
            'is_active' => $request->boolean('is_active', true),
        ]);

        return response()->json(['message' => 'Category created', 'category' => $category]);
    }

    public function updateCategory(Request $request, $id)
    {
        $category = DocumentationCategory::findOrFail($id);
        $category->update($request->only(['name', 'module', 'parent_id', 'description', 'order', 'is_active']));
        
        if ($request->has('name')) {
            $category->update(['slug' => Str::slug($request->name) . '-' . time()]);
        }

        return response()->json(['message' => 'Category updated', 'category' => $category]);
    }

    public function destroyCategory($id)
    {
        DocumentationCategory::destroy($id);
        return response()->json(['message' => 'Category deleted']);
    }

    // ==========================================
    // ARTICLES
    // ==========================================
    public function getArticles(Request $request)
    {
        $query = DocumentationArticle::with(['category', 'author', 'media']);
        
        if ($request->has('module')) {
            $query->where('module', $request->module);
        }
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }
        
        return response()->json($query->orderByDesc('id')->get());
    }

    public function showArticle($id)
    {
        $article = DocumentationArticle::with(['category', 'media'])->findOrFail($id);
        return response()->json($article);
    }

    public function storeArticle(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'category_id' => 'nullable|exists:documentation_categories,id'
        ]);

        $article = DocumentationArticle::create([
            'title' => $request->title,
            'slug' => Str::slug($request->title) . '-' . time(),
            'content' => $request->content,
            'short_description' => $request->short_description,
            'category_id' => $request->category_id,
            'module' => $request->module,
            'status' => $request->status ?? 'draft',
            'access_level' => $request->access_level ?? 'public',
            'author_id' => $request->user()->id,
            'published_at' => $request->status === 'published' ? now() : null,
        ]);

        return response()->json(['message' => 'Article created', 'article' => $article]);
    }

    public function updateArticle(Request $request, $id)
    {
        $article = DocumentationArticle::findOrFail($id);
        
        $data = $request->only(['title', 'content', 'short_description', 'category_id', 'module', 'status', 'access_level', 'version']);
        $data['last_updated_by'] = $request->user()->id;

        if ($request->has('title') && $request->title !== $article->title) {
            $data['slug'] = Str::slug($request->title) . '-' . time();
        }

        if ($request->status === 'published' && $article->status !== 'published') {
            $data['published_at'] = now();
        }

        $article->update($data);

        return response()->json(['message' => 'Article updated', 'article' => $article]);
    }

    public function destroyArticle($id)
    {
        DocumentationArticle::destroy($id);
        return response()->json(['message' => 'Article deleted']);
    }

    // ==========================================
    // MEDIA UPLOAD
    // ==========================================
    public function uploadMedia(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:jpg,jpeg,png,gif,pdf|max:5120',
            'article_id' => 'nullable|exists:documentation_articles,id'
        ]);

        $path = $request->file('file')->store('documentation/media', 'public');

        $media = DocumentationMedia::create([
            'article_id' => $request->article_id,
            'file_path' => '/storage/' . $path,
            'file_type' => $request->file('file')->getClientMimeType(),
            'alt_text' => $request->alt_text ?? $request->file('file')->getClientOriginalName(),
        ]);

        return response()->json(['message' => 'Media uploaded', 'media' => $media]);
    }

    // ==========================================
    // JOURNEYS (ACTIVITY GUIDES)
    // ==========================================
    public function getJourneys()
    {
        $journeys = DocumentationJourney::with('steps.article')->orderBy('order')->get();
        return response()->json($journeys);
    }
    
    public function storeJourney(Request $request)
    {
        $journey = DocumentationJourney::create([
            'name' => $request->name,
            'slug' => Str::slug($request->name) . '-' . time(),
            'module' => $request->module,
            'description' => $request->description,
        ]);
        
        return response()->json(['message' => 'Journey created', 'journey' => $journey]);
    }
}
