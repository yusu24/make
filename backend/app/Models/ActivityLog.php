<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ActivityLog extends Model
{
    protected $fillable = [
        'user_id', 'action', 'target', 'level', 'ip_address', 'description', 'meta',
    ];

    protected $casts = [
        'meta' => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Helper to create a log entry
    public static function record(string $action, string $target = null, string $level = 'info', array $meta = []): void
    {
        static::create([
            'user_id'    => auth()->id(),
            'action'     => $action,
            'target'     => $target,
            'level'      => $level,
            'ip_address' => request()->ip(),
            'meta'       => $meta,
        ]);
    }
}
