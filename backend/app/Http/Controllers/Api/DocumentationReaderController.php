<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DocumentationArticle;
use App\Models\DocumentationCategory;
use App\Models\DocumentationJourney;
use Illuminate\Http\Request;
use Barryvdh\DomPDF\Facade\Pdf;

class DocumentationReaderController extends Controller
{
    public function index(Request $request)
    {
        $query = DocumentationArticle::with('category')->where('status', 'published');
        
        if ($request->has('module')) {
            $query->where(function($q) use ($request) {
                $q->where('module', $request->module)->orWhereNull('module')->orWhere('module', 'umum');
            });
        }
        
        // Example simple access control (would integrate with user roles properly)
        if (!auth()->check()) {
            $query->where('access_level', 'public');
        }

        return response()->json($query->orderByDesc('published_at')->get());
    }
    
    public function getCategories()
    {
        $categories = DocumentationCategory::with(['children', 'articles' => function($q) {
            $q->where('status', 'published')->select('id', 'category_id', 'title', 'slug');
        }])->where('is_active', true)
          ->whereNull('parent_id')
          ->orderBy('order')
          ->get();
          
        return response()->json($categories);
    }

    public function show($slug)
    {
        $article = DocumentationArticle::with(['category', 'media'])->where('slug', $slug)->firstOrFail();
        
        // Security check
        if ($article->status !== 'published') {
            abort(403, 'Article is not published');
        }

        return response()->json($article);
    }

    public function search(Request $request)
    {
        $q = $request->query('q');
        if (!$q) return response()->json([]);

        $articles = DocumentationArticle::where('status', 'published')
            ->where(function($query) use ($q) {
                $query->where('title', 'like', "%{$q}%")
                      ->orWhere('short_description', 'like', "%{$q}%")
                      ->orWhere('content', 'like', "%{$q}%");
            })
            ->select('id', 'title', 'slug', 'short_description', 'category_id')
            ->with('category:id,name')
            ->limit(10)
            ->get();

        return response()->json($articles);
    }

    public function getJourneys()
    {
        $journeys = DocumentationJourney::with(['steps.article' => function($q) {
            $q->select('id', 'title', 'slug');
        }])->where('is_active', true)->orderBy('order')->get();
        
        return response()->json($journeys);
    }

    // ==========================================
    // EXPORT PDF
    // ==========================================
    public function exportArticlePdf($slug)
    {
        $article = DocumentationArticle::with('category')->where('slug', $slug)->firstOrFail();
        
        $html = "
            <html>
            <head>
                <style>
                    body { font-family: sans-serif; line-height: 1.6; color: #333; }
                    h1 { color: #1e293b; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; }
                    .meta { color: #64748b; font-size: 12px; margin-bottom: 30px; }
                    img { max-width: 100%; border-radius: 8px; }
                    .content { margin-top: 20px; }
                </style>
            </head>
            <body>
                <h1>{$article->title}</h1>
                <div class='meta'>
                    Kategori: " . ($article->category->name ?? 'Umum') . " | 
                    Versi: {$article->version} | 
                    Diperbarui: " . ($article->published_at ? $article->published_at->format('d M Y') : '') . "
                </div>
                <div class='content'>
                    {$article->content}
                </div>
            </body>
            </html>
        ";

        $pdf = Pdf::loadHTML($html);
        return $pdf->download("Panduan_{$article->slug}.pdf");
    }
}
