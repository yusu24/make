<?php

namespace App\Observers;

use App\Models\BudidayaAuditLog;
use Illuminate\Database\Eloquent\Model;

class BudidayaAuditObserver
{
    public function created(Model $model)
    {
        $this->logActivity('create', $model, null, $model->getAttributes());
    }

    public function updated(Model $model)
    {
        $oldValues = array_intersect_key($model->getOriginal(), $model->getChanges());
        $newValues = $model->getChanges();
        
        $this->logActivity('update', $model, $oldValues, $newValues);
    }

    public function deleted(Model $model)
    {
        $this->logActivity('delete', $model, $model->getAttributes(), null);
    }

    protected function logActivity(string $action, Model $model, ?array $oldValues, ?array $newValues)
    {
        // Ignore timestamps and internal IDs
        if ($oldValues) {
            unset($oldValues['updated_at']);
        }
        if ($newValues) {
            unset($newValues['updated_at']);
        }

        // Only log if there are actual changes (for updates)
        if ($action === 'update' && empty($newValues)) {
            return;
        }

        $tenantId = auth()->user()?->tenant_id;

        // If user is Super Admin (no tenant_id), try to get it from the model
        if (!$tenantId) {
            if (isset($model->tenant_id)) {
                $tenantId = $model->tenant_id;
            } elseif ($model->relationLoaded('cycle') || method_exists($model, 'cycle')) {
                $tenantId = $model->cycle?->tenant_id;
            } elseif ($model->relationLoaded('pond') || method_exists($model, 'pond')) {
                $tenantId = $model->pond?->tenant_id;
            }
        }

        BudidayaAuditLog::create([
            'tenant_id' => $tenantId,
            'user_id' => auth()->id(),
            'auditable_type' => get_class($model),
            'auditable_id' => $model->id,
            'action' => $action,
            'old_values' => $oldValues,
            'new_values' => $newValues,
        ]);
    }
}
