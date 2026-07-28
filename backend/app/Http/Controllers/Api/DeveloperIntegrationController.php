<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\ApiKey;
use App\Models\Webhook;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class DeveloperIntegrationController extends Controller
{
    // ─── API Keys ───────────────────────────────────────────────────────────
    // The raw key is only ever returned once, from store() — everywhere else
    // (index) only the prefix is exposed, matching how Stripe/GitHub tokens
    // work, since a hash can't be reversed back into the original value.

    public function indexKeys(Request $request)
    {
        $keys = ApiKey::with('creator:id,name')->latest()->get([
            'id', 'name', 'key_prefix', 'last_used_at', 'created_by', 'created_at',
        ]);

        return response()->json(['success' => true, 'data' => $keys]);
    }

    public function storeKey(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $rawKey = 'bzr_live_' . Str::random(40);

        $key = ApiKey::create([
            'name' => $request->name,
            'key_prefix' => substr($rawKey, 0, 12) . '...',
            'hashed_key' => hash('sha256', $rawKey),
            'created_by' => $request->user()->id,
        ]);

        ActivityLog::record('create_api_key', 'API Key: ' . $key->name, 'success');

        return response()->json([
            'success' => true,
            'message' => 'API key berhasil dibuat',
            'data' => [
                'id' => $key->id,
                'name' => $key->name,
                'key_prefix' => $key->key_prefix,
                'raw_key' => $rawKey, // only ever sent this one time
                'created_at' => $key->created_at,
            ],
        ], 201);
    }

    public function destroyKey($id)
    {
        $key = ApiKey::findOrFail($id);
        ActivityLog::record('revoke_api_key', 'API Key: ' . $key->name, 'danger');
        $key->delete();

        return response()->json(['success' => true, 'message' => 'API key berhasil dicabut']);
    }

    // ─── Webhooks ───────────────────────────────────────────────────────────

    public function indexWebhooks(Request $request)
    {
        $webhooks = Webhook::with('creator:id,name')->latest()->get();
        return response()->json(['success' => true, 'data' => $webhooks]);
    }

    public function storeWebhook(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'url' => 'required|url|max:2048',
        ]);

        if ($validator->fails()) {
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $webhook = Webhook::create([
            'url' => $request->url,
            'is_active' => true,
            'created_by' => $request->user()->id,
        ])->load('creator:id,name');

        ActivityLog::record('create_webhook', 'Webhook: ' . $webhook->url, 'success');

        return response()->json(['success' => true, 'message' => 'Webhook berhasil ditambahkan', 'data' => $webhook], 201);
    }

    public function toggleWebhook($id)
    {
        $webhook = Webhook::findOrFail($id);
        $webhook->update(['is_active' => !$webhook->is_active]);

        return response()->json(['success' => true, 'data' => $webhook]);
    }

    public function destroyWebhook($id)
    {
        $webhook = Webhook::findOrFail($id);
        ActivityLog::record('delete_webhook', 'Webhook: ' . $webhook->url, 'danger');
        $webhook->delete();

        return response()->json(['success' => true, 'message' => 'Webhook berhasil dihapus']);
    }
}
