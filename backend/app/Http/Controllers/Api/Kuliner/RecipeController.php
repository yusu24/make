<?php

namespace App\Http\Controllers\Api\Kuliner;

use App\Http\Controllers\Controller;
use App\Http\Requests\Kuliner\SyncRecipeRequest;
use App\Models\KulinerProduct;
use App\Services\Kuliner\RecipeService;
use Illuminate\Http\Request;

class RecipeController extends Controller
{
    public function __construct(private RecipeService $recipeService)
    {
    }

    public function index(Request $request, int $product)
    {
        $product = KulinerProduct::where('tenant_id', $request->user()->tenant_id)->findOrFail($product);
        $items = $product->recipeItems()->with('ingredient')->get();

        return response()->json($items);
    }

    public function sync(SyncRecipeRequest $request, int $product)
    {
        $product = KulinerProduct::where('tenant_id', $request->user()->tenant_id)->findOrFail($product);
        $this->recipeService->syncRecipe($product, $request->validated('items', []));

        return response()->json($product->recipeItems()->with('ingredient')->get());
    }
}
