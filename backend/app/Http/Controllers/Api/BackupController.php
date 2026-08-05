<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Process;
use Illuminate\Support\Facades\Storage;
use Spatie\Backup\BackupDestination\BackupDestination;

class BackupController extends Controller
{
    // GET /api/admin/backups — list every backup archive across all configured
    // destination disks (local now, +offsite once DO Spaces is configured).
    public function index()
    {
        $backupName = config('backup.backup.name');
        $disks = config('backup.backup.destination.disks', []);

        $backups = [];
        $reachable = true;
        $connectionError = null;

        foreach ($disks as $diskName) {
            $destination = BackupDestination::create($diskName, $backupName);

            if (! $destination->isReachable()) {
                $reachable = false;
                $connectionError = $destination->connectionError()?->getMessage();
                continue;
            }

            foreach ($destination->backups() as $backup) {
                $backups[] = [
                    'disk' => $diskName,
                    'filename' => basename($backup->path()),
                    'path' => $backup->path(),
                    'date' => $backup->date()->toIso8601String(),
                    'size_bytes' => $backup->sizeInBytes(),
                    'size_human' => $this->formatBytes($backup->sizeInBytes()),
                ];
            }
        }

        usort($backups, fn ($a, $b) => strcmp($b['date'], $a['date']));

        return response()->json([
            'success' => true,
            'data' => $backups,
            'reachable' => $reachable,
            'connection_error' => $connectionError,
            'total_size_human' => $this->formatBytes(array_sum(array_column($backups, 'size_bytes'))),
        ]);
    }

    // POST /api/admin/backups/run — trigger a backup right now. Spawns
    // `php artisan backup:run` as its own process (rather than Artisan::call
    // in-process) — on Windows, mysqldump throws a spurious "Can't create
    // TCP/IP socket" error when run in-process inside `php artisan serve`,
    // but works fine as a standalone process (which is also exactly how the
    // real scheduled backup runs, via Task Scheduler → schedule:run). Runs
    // synchronously (DB + files are small enough this finishes in seconds);
    // revisit with a queued job if that stops being true.
    public function run(Request $request)
    {
        try {
            $result = Process::path(base_path())
                ->timeout(120)
                ->env([
                    'TEMP' => sys_get_temp_dir(),
                    'TMP' => sys_get_temp_dir(),
                    'SystemRoot' => getenv('SystemRoot') ?: 'C:\\Windows',
                    'PATH' => getenv('PATH'),
                ])
                ->run([PHP_BINARY, 'artisan', 'backup:run', '--disable-notifications']);

            $output = $result->output() . $result->errorOutput();

            if (! $result->successful()) {
                return response()->json(['success' => false, 'message' => 'Backup gagal dijalankan.', 'output' => $output], 500);
            }

            ActivityLog::record('backup_run', 'Backup manual dijalankan oleh ' . ($request->user()->name ?? 'admin'), 'success');

            return response()->json(['success' => true, 'message' => 'Backup berhasil dijalankan.', 'output' => $output]);
        } catch (\Throwable $e) {
            return response()->json(['success' => false, 'message' => 'Backup gagal: ' . $e->getMessage()], 500);
        }
    }

    // GET /api/admin/backups/download?disk=backups&filename=... — stream a
    // specific backup archive back to the browser.
    public function download(Request $request)
    {
        $request->validate([
            'disk' => 'required|string',
            'filename' => 'required|string',
        ]);

        $allowedDisks = config('backup.backup.destination.disks', []);
        if (! in_array($request->disk, $allowedDisks, true)) {
            abort(403, 'Disk tidak diizinkan.');
        }

        $backupName = config('backup.backup.name');
        $destination = BackupDestination::create($request->disk, $backupName);

        foreach ($destination->backups() as $backup) {
            if (basename($backup->path()) === basename($request->filename)) {
                return Storage::disk($request->disk)->download($backup->path());
            }
        }

        abort(404, 'Backup tidak ditemukan.');
    }

    private function formatBytes(float $bytes): string
    {
        if ($bytes >= 1073741824) {
            return round($bytes / 1073741824, 2) . ' GB';
        }
        if ($bytes >= 1048576) {
            return round($bytes / 1048576, 2) . ' MB';
        }
        if ($bytes >= 1024) {
            return round($bytes / 1024, 2) . ' KB';
        }

        return $bytes . ' B';
    }
}
