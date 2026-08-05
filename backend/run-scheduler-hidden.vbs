' Runs "php artisan schedule:run" completely hidden (no console window flash).
' Used by the Windows Scheduled Task "UMKM-Laravel-Scheduler", triggered every
' minute in place of a Linux cron job for this local dev environment.
Set WshShell = CreateObject("WScript.Shell")
WshShell.CurrentDirectory = "c:\Project\umkm\backend"
WshShell.Run "C:\xampp\php\php.exe artisan schedule:run", 0, True
