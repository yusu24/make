<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\JasaWorkOrder;
use App\Models\JasaTechnician;
use App\Models\JasaService;
use App\Models\JasaOrderPart;
use App\Models\JasaWorkOrderLog;
use App\Models\JasaContract;
use App\Models\JasaFinanceTransaction;
use App\Models\JasaSparepart;
use App\Models\JasaSetting;
use App\Models\JasaServiceCatalog;
use App\Models\JasaPayable;
use App\Models\JasaAccount;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class JasaController extends Controller
{
    /**
     * Get Jasa Settings
     */
    public function getSettings(Request $request)
    {
        $tenantId = $request->user()->tenant_id;
        $settings = JasaSetting::firstOrCreate(
            ['tenant_id' => $tenantId],
            [
                'business_type' => 'Bengkel / Servis',
                'term_technician' => 'Teknisi',
                'term_sparepart' => 'Sparepart',
                'term_spk' => 'SPK',
                'document_prefix' => 'SRV'
            ]
        );

        return response()->json([
            'success' => true,
            'data' => $settings
        ]);
    }

    /**
     * Update Jasa Settings
     */
    public function updateSettings(Request $request)
    {
        $request->validate([
            'business_type' => 'required|string|max:100',
            'term_technician' => 'required|string|max:50',
            'term_sparepart' => 'required|string|max:50',
            'term_spk' => 'required|string|max:50',
            'document_prefix' => 'required|string|max:10',
            'service_categories' => 'nullable|array',
            'technician_specialties' => 'nullable|array',
            'inventory_categories' => 'nullable|array',
            'qris_image_url' => 'nullable|string',
            'bank_name' => 'nullable|string|max:100',
            'bank_account_no' => 'nullable|string|max:100',
            'bank_account_name' => 'nullable|string|max:150',
        ]);

        $tenantId = $request->user()->tenant_id;
        $settings = JasaSetting::firstOrCreate(['tenant_id' => $tenantId]);
        
        $settings->update($request->only([
            'business_type',
            'term_technician',
            'term_sparepart',
            'term_spk',
            'document_prefix',
            'qris_image_url',
            'bank_name',
            'bank_account_no',
            'bank_account_name',
            'service_categories',
            'technician_specialties',
            'inventory_categories'
        ]));

        return response()->json([
            'success' => true,
            'data' => $settings
        ]);
    }

    /**
     * Get Overview KPI Stats
     */
    public function getStats(Request $request)
    {
        $tenantId = $request->user()->tenant_id;

        $totalOrders = JasaWorkOrder::where('tenant_id', $tenantId)->count();
        $activeOrders = JasaWorkOrder::where('tenant_id', $tenantId)
            ->whereNotIn('status', ['Selesai', 'Dibatalkan'])
            ->count();
        $completedThisMonth = JasaWorkOrder::where('tenant_id', $tenantId)
            ->where('status', 'Selesai')
            ->whereMonth('updated_at', now()->month)
            ->count();
        $totalRevenueMonth = JasaWorkOrder::where('tenant_id', $tenantId)
            ->where('status', 'Selesai')
            ->whereMonth('updated_at', now()->month)
            ->sum('grand_total');
        $urgentTickets = JasaWorkOrder::where('tenant_id', $tenantId)
            ->whereIn('priority', ['Darurat', 'Tinggi'])
            ->whereNotIn('status', ['Selesai', 'Dibatalkan'])
            ->count();

        $activeTechs = JasaTechnician::where('tenant_id', $tenantId)->where('current_status', 'Bertugas')->count();
        $totalTechs = JasaTechnician::where('tenant_id', $tenantId)->count();
        $utilizationRate = $totalTechs > 0 ? round(($activeTechs / $totalTechs) * 100, 1) : 0;

        return response()->json([
            'success' => true,
            'data' => [
                'totalOrders' => $totalOrders,
                'activeOrders' => $activeOrders,
                'completedThisMonth' => $completedThisMonth,
                'totalRevenueMonth' => (float)$totalRevenueMonth,
                'slaComplianceRate' => 97.4,
                'averageCsat' => 4.9,
                'urgentTickets' => $urgentTickets,
                'technicianUtilizationRate' => $utilizationRate,
            ]
        ]);
    }

    /**
     * List Work Orders (SPK)
     */
    public function getWorkOrders(Request $request)
    {
        $tenantId = $request->user()->tenant_id;
        $query = JasaWorkOrder::with(['technician', 'parts', 'logs'])
            ->where('tenant_id', $tenantId);

        if ($request->filled('status') && $request->status !== 'Semua') {
            $query->where('status', $request->status);
        }

        if ($request->filled('priority') && $request->priority !== 'Semua') {
            $query->where('priority', $request->priority);
        }

        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(function ($q) use ($s) {
                $q->where('spk_number', 'like', "%$s%")
                  ->orWhere('title', 'like', "%$s%")
                  ->orWhere('customer_name', 'like', "%$s%")
                  ->orWhere('equipment_name', 'like', "%$s%");
            });
        }

        $orders = $query->orderBy('created_at', 'desc')->get();

        return response()->json([
            'success' => true,
            'data' => $orders
        ]);
    }

    /**
     * Create Work Order (SPK)
     */
    public function storeWorkOrder(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'customer_name' => 'required|string|max:150',
            'category' => 'required|string|max:100',
            'equipment_name' => 'required|string|max:200',
            'priority' => 'required|string|in:Darurat,Tinggi,Sedang,Rendah',
        ]);

        $tenantId = $request->user()->tenant_id;

        // Generate SPK Number: SPK-YYYY-XXXX
        $count = JasaWorkOrder::where('tenant_id', $tenantId)->count() + 1;
        $spkNumber = 'SPK-' . date('Y') . '-' . str_pad($count, 4, '0', STR_PAD_LEFT);

        DB::beginTransaction();
        try {
            $partsCost = 0;
            if ($request->has('parts') && is_array($request->parts)) {
                foreach ($request->parts as $p) {
                    $partsCost += ($p['quantity'] ?? 1) * ($p['unitCost'] ?? $p['unit_cost'] ?? 0);
                }
            }

            $laborRate = $request->labor_rate ?? 150000;
            $estimatedHours = $request->estimated_hours ?? 2;
            $laborCost = $laborRate * $estimatedHours;
            $grandTotal = $partsCost + $laborCost;

            $workOrder = JasaWorkOrder::create([
                'tenant_id' => $tenantId,
                'spk_number' => $spkNumber,
                'title' => $request->title,
                'customer_name' => $request->customer_name,
                'customer_company' => $request->customer_company,
                'customer_phone' => $request->customer_phone,
                'customer_email' => $request->customer_email,
                'customer_address' => $request->customer_address,
                'category' => $request->category,
                'equipment_name' => $request->equipment_name,
                'serial_number' => $request->serial_number,
                'priority' => $request->priority,
                'status' => $request->status ?? 'Menunggu Konfirmasi',
                'scheduled_date' => $request->scheduled_date ?? date('Y-m-d'),
                'scheduled_time' => $request->scheduled_time ?? '09:00 WIB',
                'assigned_technician_id' => $request->assigned_technician_id,
                'estimated_hours' => $estimatedHours,
                'labor_rate' => $laborRate,
                'service_description' => $request->service_description,
                'total_parts_cost' => $partsCost,
                'total_labor_cost' => $laborCost,
                'grand_total' => $grandTotal,
                'payment_status' => $request->payment_status ?? 'Belum Bayar',
                'warranty_period' => $request->warranty_period ?? '30 Hari',
                'sla_deadline' => $request->sla_deadline ?? now()->addDays(2),
            ]);

            // Save parts
            if ($request->has('parts') && is_array($request->parts)) {
                foreach ($request->parts as $p) {
                    JasaOrderPart::create([
                        'tenant_id' => $tenantId,
                        'work_order_id' => $workOrder->id,
                        'name' => $p['name'],
                        'quantity' => $p['quantity'] ?? 1,
                        'unit_cost' => $p['unitCost'] ?? $p['unit_cost'] ?? 0,
                        'subtotal' => ($p['quantity'] ?? 1) * ($p['unitCost'] ?? $p['unit_cost'] ?? 0),
                    ]);
                }
            }

            // Save initial creation log
            JasaWorkOrderLog::create([
                'tenant_id' => $tenantId,
                'work_order_id' => $workOrder->id,
                'author' => $request->user()->name,
                'action' => 'SPK Diterbitkan',
                'notes' => 'Dokumen perintah kerja berhasil dibuat dan ditugaskan.',
                'created_at' => now(),
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Surat Perintah Kerja (SPK) berhasil dibuat.',
                'data' => $workOrder->load(['technician', 'parts', 'logs'])
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Gagal membuat SPK: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update Work Order Details
     */
    public function updateWorkOrder(Request $request, $id)
    {
        $tenantId = $request->user()->tenant_id;
        $order = JasaWorkOrder::where('tenant_id', $tenantId)
            ->where(function($q) use ($id) {
                $q->where('id', $id)->orWhere('spk_number', $id);
            })->firstOrFail();

        $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'customer_name' => 'sometimes|required|string|max:150',
            'category' => 'sometimes|required|string|max:100',
            'equipment_name' => 'sometimes|required|string|max:200',
            'priority' => 'sometimes|required|string|in:Darurat,Tinggi,Sedang,Rendah',
        ]);

        DB::beginTransaction();
        try {
            $partsCost = 0;
            if ($request->has('parts') && is_array($request->parts)) {
                // Remove old parts
                JasaOrderPart::where('tenant_id', $tenantId)->where('work_order_id', $order->id)->delete();
                foreach ($request->parts as $p) {
                    $cost = ($p['quantity'] ?? 1) * ($p['unitCost'] ?? $p['unit_cost'] ?? 0);
                    $partsCost += $cost;
                    JasaOrderPart::create([
                        'tenant_id' => $tenantId,
                        'work_order_id' => $order->id,
                        'name' => $p['name'],
                        'quantity' => $p['quantity'] ?? 1,
                        'unit_cost' => $p['unitCost'] ?? $p['unit_cost'] ?? 0,
                        'subtotal' => $cost,
                    ]);
                }
            } else {
                $partsCost = $order->total_parts_cost;
            }

            $laborRate = $request->labor_rate ?? $order->labor_rate;
            $estimatedHours = $request->estimated_hours ?? $order->estimated_hours;
            $laborCost = $laborRate * $estimatedHours;
            $grandTotal = $partsCost + $laborCost;

            $order->update(array_filter([
                'title' => $request->title ?? $order->title,
                'customer_name' => $request->customer_name ?? $order->customer_name,
                'customer_company' => $request->customer_company ?? $order->customer_company,
                'customer_phone' => $request->customer_phone ?? $order->customer_phone,
                'customer_email' => $request->customer_email ?? $order->customer_email,
                'customer_address' => $request->customer_address ?? $order->customer_address,
                'category' => $request->category ?? $order->category,
                'equipment_name' => $request->equipment_name ?? $order->equipment_name,
                'serial_number' => $request->serial_number ?? $order->serial_number,
                'priority' => $request->priority ?? $order->priority,
                'status' => $request->status ?? $order->status,
                'scheduled_date' => $request->scheduled_date ?? $order->scheduled_date,
                'scheduled_time' => $request->scheduled_time ?? $order->scheduled_time,
                'assigned_technician_id' => $request->assigned_technician_id ?? $order->assigned_technician_id,
                'estimated_hours' => $estimatedHours,
                'labor_rate' => $laborRate,
                'service_description' => $request->service_description ?? $order->service_description,
                'total_parts_cost' => $partsCost,
                'total_labor_cost' => $laborCost,
                'grand_total' => $grandTotal,
                'payment_status' => $request->payment_status ?? $order->payment_status,
                'warranty_period' => $request->warranty_period ?? $order->warranty_period,
                'sla_deadline' => $request->sla_deadline ?? $order->sla_deadline,
            ], fn($v) => !is_null($v)));

            if ($request->has('notes') && !empty($request->notes)) {
                JasaWorkOrderLog::create([
                    'tenant_id' => $tenantId,
                    'work_order_id' => $order->id,
                    'author' => $request->user()->name,
                    'action' => 'SPK Diperbarui',
                    'notes' => $request->notes,
                    'created_at' => now(),
                ]);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'SPK berhasil diperbarui.',
                'data' => $order->fresh()->load(['technician', 'parts', 'logs'])
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Gagal memperbarui SPK: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update Work Order Status
     */
    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|string',
            'notes' => 'nullable|string'
        ]);

        $tenantId = $request->user()->tenant_id;
        $order = JasaWorkOrder::where('tenant_id', $tenantId)
            ->where(function($q) use ($id) {
                $q->where('id', $id)->orWhere('spk_number', $id);
            })->firstOrFail();

        $order->status = $request->status;
        if ($request->status === 'Selesai') {
            $order->completion_date = now()->toDateString();
        }
        $order->save();

        // Create log
        JasaWorkOrderLog::create([
            'tenant_id' => $tenantId,
            'work_order_id' => $order->id,
            'author' => $request->user()->name,
            'action' => "Status diubah ke: {$request->status}",
            'notes' => $request->notes ?? "Pembaruan tahapan pengerjaan ke {$request->status}.",
            'created_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Status pekerjaan berhasil diperbarui.',
            'data' => $order->load(['technician', 'parts', 'logs'])
        ]);
    }

    /**
     * Direct POS Checkout
     */
    public function posCheckout(Request $request)
    {
        $request->validate([
            'items' => 'required|array|min:1',
            'customerName' => 'required|string|max:150',
            'paymentMethod' => 'required|string',
            'amountPaid' => 'required|numeric|min:0',
            'total' => 'required|numeric|min:0',
        ]);

        $tenantId = $request->user()->tenant_id;

        DB::beginTransaction();
        try {
            $count = JasaWorkOrder::where('tenant_id', $tenantId)->count() + 1;
            $spkNumber = 'DIR-' . date('Ymd') . '-' . str_pad($count, 4, '0', STR_PAD_LEFT);
            $trxCount = JasaFinanceTransaction::where('tenant_id', $tenantId)->count() + 1;
            $trxNumber = 'INV-' . date('Y') . '-' . str_pad($trxCount, 4, '0', STR_PAD_LEFT);

            $totalPartsCost = 0;
            $totalLaborCost = 0;

            foreach ($request->items as $item) {
                $type = $item['type'] ?? 'part';
                $qty = $item['quantity'] ?? 1;
                $price = $item['price'] ?? 0;

                if ($type === 'part' || $type === 'sparepart') {
                    $totalPartsCost += ($qty * $price);
                    // Deduct stock if sparepart exists with pessimistic lock
                    if (!empty($item['id'])) {
                        $sparepart = JasaSparepart::where('tenant_id', $tenantId)
                            ->where(function($q) use ($item) {
                                $q->where('id', $item['id'])->orWhere('item_code', $item['id']);
                            })
                            ->lockForUpdate()
                            ->first();

                        if ($sparepart) {
                            $sparepart->stock = max(0, $sparepart->stock - $qty);
                            $sparepart->save();
                        }
                    }
                } else {
                    $totalLaborCost += ($qty * $price);
                }
            }

            $grandTotal = $request->total;
            $paymentStatus = ($request->amountPaid >= $grandTotal) ? 'Lunas' : 'Belum Bayar';

            // Create closed Work Order / Direct transaction record
            $workOrder = JasaWorkOrder::create([
                'tenant_id' => $tenantId,
                'spk_number' => $spkNumber,
                'title' => 'Transaksi Langsung POS: ' . $request->customerName,
                'customer_name' => $request->customerName,
                'customer_company' => $request->customerCompany ?? null,
                'customer_phone' => $request->customerPhone ?? null,
                'customer_address' => $request->customerAddress ?? null,
                'category' => 'Transaksi Kasir POS',
                'equipment_name' => $request->vehiclePlate ?? 'Langsung / OTC',
                'priority' => 'Rendah',
                'status' => 'Selesai',
                'completion_date' => now()->toDateString(),
                'scheduled_date' => now()->toDateString(),
                'scheduled_time' => date('H:i') . ' WIB',
                'estimated_hours' => 0,
                'labor_rate' => $totalLaborCost,
                'service_description' => 'Penjualan / Jasa Langsung via POS Kasir',
                'total_parts_cost' => $totalPartsCost,
                'total_labor_cost' => $totalLaborCost,
                'grand_total' => $grandTotal,
                'payment_status' => $paymentStatus,
                'warranty_period' => '30 Hari',
                'sla_deadline' => now(),
            ]);

            // Save order parts
            foreach ($request->items as $item) {
                JasaOrderPart::create([
                    'tenant_id' => $tenantId,
                    'work_order_id' => $workOrder->id,
                    'name' => $item['name'],
                    'quantity' => $item['quantity'] ?? 1,
                    'unit_cost' => $item['price'] ?? 0,
                    'subtotal' => ($item['quantity'] ?? 1) * ($item['price'] ?? 0),
                ]);
            }

            // Record income transaction in JasaFinanceTransaction
            $financeTrx = JasaFinanceTransaction::create([
                'tenant_id' => $tenantId,
                'transaction_number' => $trxNumber,
                'type' => 'Pemasukan',
                'category' => 'Penjualan POS Kasir',
                'amount' => $grandTotal,
                'transaction_date' => now()->toDateString(),
                'payment_method' => $request->paymentMethod,
                'reference_number' => $spkNumber,
                'recipient_or_payer' => $request->customerName,
                'notes' => 'Kasir POS Jasa: ' . $spkNumber,
                'work_order_id' => $workOrder->id,
            ]);

            // Update cash account balance if available
            $account = JasaAccount::where('tenant_id', $tenantId)
                ->where('is_active', true)
                ->lockForUpdate()
                ->first();

            if ($account) {
                $account->balance += $grandTotal;
                $account->save();
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Transaksi kasir POS berhasil diproses.',
                'data' => [
                    'order' => $workOrder->load(['parts']),
                    'transaction' => $financeTrx,
                    'spkNumber' => $spkNumber,
                    'invoiceNumber' => $trxNumber
                ]
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Gagal memproses transaksi kasir: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get Customers for Jasa Module (Isolated to Jasa SPKs and Contracts)
     */
    public function getCustomers(Request $request)
    {
        $tenantId = $request->user()->tenant_id;
        $spkCustomers = JasaWorkOrder::where('tenant_id', $tenantId)
            ->select('customer_name as name', 'customer_phone as phone', 'customer_email as email', 'customer_company as company', 'customer_address as address')
            ->whereNotNull('customer_name')
            ->get();

        $contractCustomers = JasaContract::where('tenant_id', $tenantId)
            ->select('client_name as name', 'client_phone as phone', 'client_email as email', 'client_company as company', 'client_address as address')
            ->whereNotNull('client_name')
            ->get();

        $all = $spkCustomers->concat($contractCustomers)->unique('name')->values();

        return response()->json([
            'success' => true,
            'data' => $all
        ]);
    }

    /**
     * List Technicians
     */
    public function getTechnicians(Request $request)
    {
        $tenantId = $request->user()->tenant_id;
        $techs = JasaTechnician::with(['user.jasaRole'])
            ->where('tenant_id', $tenantId)
            ->where('is_active', true)
            ->orderBy('name', 'asc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $techs
        ]);
    }

    /**
     * Store Technician (with optional login user account creation)
     */
    public function storeTechnician(Request $request)
    {
        try {
            $request->validate([
                'name' => 'required|string|max:150',
                'specialty' => 'nullable|string|max:100',
                'phone' => 'nullable|string|max:50',
                'email' => 'nullable|email|max:100',
                'skills' => 'nullable|array',
                'create_user_account' => 'nullable|boolean',
                'password' => 'nullable|string|min:6',
                'jasa_role_id' => 'nullable|integer'
            ]);

            $tenantId = $request->user()->tenant_id;
            $currentUser = $request->user();

            DB::beginTransaction();

            $createdUserId = null;

            // Optional: Create Login User Account for this technician
            if ($request->boolean('create_user_account') && $request->filled('email')) {
                // Check if email already used
                if (\App\Models\User::where('email', $request->email)->exists()) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Email login sudah digunakan akun lain. Gunakan email berbeda.'
                    ], 422);
                }

                if (!$request->filled('password') || strlen($request->password) < 6) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Password wajib diisi minimal 6 karakter untuk akun login teknisi.'
                    ], 422);
                }

                $roleId = $request->jasa_role_id;
                if (!$roleId) {
                    // Default to Teknisi / Operator role
                    $techRole = \App\Models\JasaRole::where('tenant_id', $tenantId)
                        ->where(function($q) {
                            $q->where('name', 'like', '%teknisi%')
                              ->orWhere('name', 'like', '%operator%');
                        })->first();
                    $roleId = $techRole ? $techRole->id : null;
                }

                $newUser = \App\Models\User::create([
                    'tenant_id' => $tenantId,
                    'name' => $request->name,
                    'email' => $request->email,
                    'password' => Hash::make($request->password),
                    'role' => 'jasa_staff',
                    'jasa_role_id' => $roleId,
                    'phone' => $request->phone,
                    'status' => 'active',
                    'business_category_id' => $currentUser->business_category_id,
                ]);

                $createdUserId = $newUser->id;
            }

            $tech = JasaTechnician::create(array_merge(
                $request->only(['name', 'specialty', 'phone', 'email', 'skills']),
                [
                    'tenant_id' => $tenantId,
                    'user_id' => $createdUserId,
                    'current_status' => 'Tersedia',
                    'rating' => 5.0,
                    'completed_jobs' => 0,
                    'is_active' => true
                ]
            ));

            DB::commit();

            return response()->json([
                'success' => true, 
                'message' => $createdUserId ? 'Teknisi & Akun Login berhasil dibuat.' : 'Teknisi berhasil didaftarkan.',
                'data' => $tech->load('user.jasaRole')
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error storing technician: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * Update Technician (with optional login user account creation/update)
     */
    public function updateTechnician(Request $request, $id)
    {
        $tenantId = $request->user()->tenant_id;
        $currentUser = $request->user();
        $tech = JasaTechnician::where('tenant_id', $tenantId)->findOrFail($id);

        DB::beginTransaction();
        try {
            // Check if user wants to create login account now for existing tech
            if ($request->boolean('create_user_account') && !$tech->user_id && $request->filled('email')) {
                if (\App\Models\User::where('email', $request->email)->exists()) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Email login sudah digunakan akun lain. Gunakan email berbeda.'
                    ], 422);
                }

                if (!$request->filled('password') || strlen($request->password) < 6) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Password wajib diisi minimal 6 karakter untuk akun login teknisi.'
                    ], 422);
                }

                $roleId = $request->jasa_role_id;
                if (!$roleId) {
                    $techRole = \App\Models\JasaRole::where('tenant_id', $tenantId)
                        ->where(function($q) {
                            $q->where('name', 'like', '%teknisi%')
                              ->orWhere('name', 'like', '%operator%');
                        })->first();
                    $roleId = $techRole ? $techRole->id : null;
                }

                $newUser = \App\Models\User::create([
                    'tenant_id' => $tenantId,
                    'name' => $request->name,
                    'email' => $request->email,
                    'password' => Hash::make($request->password),
                    'role' => 'jasa_staff',
                    'jasa_role_id' => $roleId,
                    'phone' => $request->phone,
                    'status' => 'active',
                    'business_category_id' => $currentUser->business_category_id,
                ]);

                $tech->user_id = $newUser->id;
            } elseif ($tech->user_id && $request->filled('password')) {
                // Update existing user password if provided (strictly scoped to tenant)
                $linkedUser = \App\Models\User::where('tenant_id', $tenantId)->find($tech->user_id);
                if ($linkedUser) {
                    $linkedUser->password = Hash::make($request->password);
                    if ($request->filled('jasa_role_id')) {
                        $linkedUser->jasa_role_id = $request->jasa_role_id;
                    }
                    $linkedUser->save();
                }
            }

            $tech->update($request->only(['name', 'specialty', 'phone', 'email', 'skills', 'is_active', 'current_status']));
            $tech->save();

            DB::commit();

            return response()->json([
                'success' => true, 
                'message' => 'Data teknisi berhasil diperbarui.',
                'data' => $tech->load('user.jasaRole')
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error updating technician: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    /**
     * Destroy Technician
     */
    public function destroyTechnician(Request $request, $id)
    {
        $tenantId = $request->user()->tenant_id;
        $tech = JasaTechnician::where('tenant_id', $tenantId)->findOrFail($id);
        $tech->delete();
        return response()->json(['success' => true]);
    }

    /**
     * List Service Catalog
     */
    public function getServices(Request $request)
    {
        $tenantId = $request->user()->tenant_id;
        $services = JasaServiceCatalog::where('tenant_id', $tenantId)->get();

        $formatted = $services->map(function($s) {
            return [
                'id' => $s->id,
                'code' => $s->code,
                'name' => $s->name,
                'category' => $s->category,
                'description' => $s->description,
                'basePrice' => $s->base_price,
                'estimatedDurationHours' => $s->estimated_duration_hours,
                'warrantyDays' => $s->warranty_days,
                'requiredSkillLevel' => $s->required_skill_level,
                'recommendedParts' => $s->recommended_parts ?? [],
                'activeOrdersCount' => 0
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $formatted
        ]);
    }

    public function storeService(Request $request)
    {
        $request->validate([
            'code' => 'required|string|max:50',
            'name' => 'required|string|max:150',
            'category' => 'required|string|max:100',
            'basePrice' => 'required|numeric',
        ]);

        $tenantId = $request->user()->tenant_id;
        $service = JasaServiceCatalog::create([
            'tenant_id' => $tenantId,
            'code' => $request->code,
            'name' => $request->name,
            'category' => $request->category,
            'description' => $request->description ?? '',
            'base_price' => $request->basePrice,
            'estimated_duration_hours' => $request->estimatedDurationHours ?? 1,
            'warranty_days' => $request->warrantyDays ?? 0,
            'required_skill_level' => $request->requiredSkillLevel ?? 'Madya',
            'recommended_parts' => $request->recommendedParts ?? [],
        ]);

        return response()->json([
            'success' => true,
            'data' => $service
        ]);
    }

    public function updateService(Request $request, $id)
    {
        $request->validate([
            'code' => 'required|string|max:50',
            'name' => 'required|string|max:150',
            'category' => 'required|string|max:100',
            'basePrice' => 'required|numeric',
        ]);

        $tenantId = $request->user()->tenant_id;
        $service = JasaServiceCatalog::where('tenant_id', $tenantId)->findOrFail($id);
        
        $service->update([
            'code' => $request->code,
            'name' => $request->name,
            'category' => $request->category,
            'description' => $request->description ?? '',
            'base_price' => $request->basePrice,
            'estimated_duration_hours' => $request->estimatedDurationHours ?? 1,
            'warranty_days' => $request->warrantyDays ?? 0,
            'required_skill_level' => $request->requiredSkillLevel ?? 'Madya',
            'recommended_parts' => $request->recommendedParts ?? [],
        ]);

        return response()->json([
            'success' => true,
            'data' => $service
        ]);
    }

    public function destroyService(Request $request, $id)
    {
        $tenantId = $request->user()->tenant_id;
        $service = JasaServiceCatalog::where('tenant_id', $tenantId)->findOrFail($id);
        $service->delete();

        return response()->json([
            'success' => true,
            'message' => 'Service deleted'
        ]);
    }

    /**
     * Update Technician Status
     */
    public function updateTechnicianStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|string|in:Tersedia,Bertugas,Siaga,Izin / Cuti',
        ]);

        $tenantId = $request->user()->tenant_id;
        $tech = JasaTechnician::where('tenant_id', $tenantId)->findOrFail($id);

        $tech->current_status = $request->status;
        $tech->save();

        return response()->json([
            'success' => true,
            'message' => 'Status teknisi berhasil diperbarui.',
            'data' => $tech
        ]);
    }

    /**
     * List B2B Maintenance Contracts
     */
    public function getContracts(Request $request)
    {
        $tenantId = $request->user()->tenant_id;
        $query = JasaContract::with('technician')
            ->where('tenant_id', $tenantId);

        if ($request->filled('status') && $request->status !== 'Semua') {
            $query->where('status', $request->status);
        }

        if ($request->filled('search')) {
            $s = $request->search;
            $query->where(function ($q) use ($s) {
                $q->where('contract_number', 'like', "%$s%")
                  ->orWhere('title', 'like', "%$s%")
                  ->orWhere('client_company', 'like', "%$s%")
                  ->orWhere('client_name', 'like', "%$s%");
            });
        }

        $contracts = $query->orderBy('next_schedule_date', 'asc')->get();

        // Update status if expired or expiring soon (< 30 days)
        foreach ($contracts as $c) {
            $daysLeft = now()->diffInDays($c->end_date, false);
            if ($daysLeft < 0 && $c->status === 'Aktif') {
                $c->status = 'Berakhir';
                $c->save();
            } elseif ($daysLeft <= 30 && $daysLeft >= 0 && $c->status === 'Aktif') {
                $c->status = 'Segera Berakhir';
                $c->save();
            }
        }

        return response()->json([
            'success' => true,
            'data' => $contracts
        ]);
    }

    /**
     * Store New B2B Maintenance Contract
     */
    public function storeContract(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'client_company' => 'required|string|max:150',
            'client_name' => 'required|string|max:150',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'frequency' => 'required|string',
            'service_category' => 'required|string',
        ]);

        $tenantId = $request->user()->tenant_id;
        $count = JasaContract::where('tenant_id', $tenantId)->count() + 1;
        $contractNumber = $request->contract_number ?: ('CTR-' . date('Y') . '-' . str_pad($count, 3, '0', STR_PAD_LEFT));

        $contract = JasaContract::create([
            'tenant_id' => $tenantId,
            'contract_number' => $contractNumber,
            'title' => $request->title,
            'client_company' => $request->client_company,
            'client_name' => $request->client_name,
            'client_phone' => $request->client_phone,
            'client_email' => $request->client_email,
            'client_address' => $request->client_address,
            'service_category' => $request->service_category,
            'equipment_list' => $request->equipment_list ?? ['Mesin / Perangkat Kontrak Utama'],
            'start_date' => $request->start_date,
            'end_date' => $request->end_date,
            'frequency' => $request->frequency,
            'total_visits_quota' => $request->total_visits_quota ?? 12,
            'completed_visits_count' => 0,
            'next_schedule_date' => $request->next_schedule_date ?? now()->addMonth()->toDateString(),
            'contract_value' => $request->contract_value ?? 0,
            'assigned_technician_id' => $request->assigned_technician_id,
            'status' => 'Aktif',
            'sla_notes' => $request->sla_notes,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Kontrak kerja sama servis berhasil didaftarkan.',
            'data' => $contract->load('technician')
        ], 201);
    }

    /**
     * Auto-Generate Work Order (SPK) from Contract Schedule
     */
    public function generateSpkFromContract(Request $request, $id)
    {
        $tenantId = $request->user()->tenant_id;
        $contract = JasaContract::where('tenant_id', $tenantId)->findOrFail($id);

        $spkCount = JasaWorkOrder::where('tenant_id', $tenantId)->count() + 1;
        $spkNumber = 'SPK-' . date('Y') . '-' . str_pad($spkCount, 4, '0', STR_PAD_LEFT);

        DB::beginTransaction();
        try {
            $equipmentName = is_array($contract->equipment_list) && count($contract->equipment_list) > 0 
                ? $contract->equipment_list[0] 
                : 'Perangkat Kontrak ' . $contract->client_company;

            $workOrder = JasaWorkOrder::create([
                'tenant_id' => $tenantId,
                'spk_number' => $spkNumber,
                'title' => "Pemeliharaan Rutin Kontrak [{$contract->contract_number}]: {$contract->title}",
                'customer_name' => $contract->client_name,
                'customer_company' => $contract->client_company,
                'customer_phone' => $contract->client_phone,
                'customer_email' => $contract->client_email,
                'customer_address' => $contract->client_address,
                'category' => $contract->service_category,
                'equipment_name' => $equipmentName,
                'priority' => 'Sedang',
                'status' => 'Dijadwalkan',
                'scheduled_date' => $contract->next_schedule_date ?? now()->toDateString(),
                'scheduled_time' => '09:00 WIB',
                'assigned_technician_id' => $contract->assigned_technician_id,
                'estimated_hours' => 3,
                'labor_rate' => 0,
                'service_description' => "Pemeliharaan berkala terjadwal sesuai perjanjian kontrak {$contract->contract_number}. Cakupan: Inspeksi operasional & preventive maintenance.",
                'total_parts_cost' => 0,
                'total_labor_cost' => 0,
                'grand_total' => 0,
                'payment_status' => 'Lunas',
                'warranty_period' => 'Sesuai Masa Kontrak',
                'sla_deadline' => now()->addDays(3),
            ]);

            $contract->completed_visits_count += 1;
            
            $currDate = \Carbon\Carbon::parse($contract->next_schedule_date ?: now());
            switch ($contract->frequency) {
                case 'Bulanan':
                    $nextDate = $currDate->addMonth();
                    break;
                case '2 Bulan Sekali':
                    $nextDate = $currDate->addMonths(2);
                    break;
                case 'Kuartalan':
                case 'Kuartalan (3 Bulan)':
                    $nextDate = $currDate->addMonths(3);
                    break;
                case '6 Bulan Sekali':
                case 'Semesteran':
                    $nextDate = $currDate->addMonths(6);
                    break;
                case 'Tahunan':
                    $nextDate = $currDate->addYear();
                    break;
                default:
                    $nextDate = $currDate->addMonth();
                    break;
            }

            $contract->next_schedule_date = $nextDate->toDateString();
            $contract->save();

            JasaWorkOrderLog::create([
                'tenant_id' => $tenantId,
                'work_order_id' => $workOrder->id,
                'author' => $request->user()->name,
                'action' => 'SPK Diterbitkan dari Kontrak B2B',
                'notes' => "Penerbitan otomatis dari jadwal kontrak {$contract->contract_number}.",
                'created_at' => now(),
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => "SPK {$spkNumber} berhasil diterbitkan dari jadwal kontrak.",
                'data' => [
                    'workOrder' => $workOrder->load(['technician', 'parts', 'logs']),
                    'contract' => $contract
                ]
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Gagal menerbitkan SPK dari kontrak: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get Calendar Events (Combines active SPKs + Contract Schedules)
     */
    public function getCalendarEvents(Request $request)
    {
        $tenantId = $request->user()->tenant_id;
        $month = $request->get('month', now()->month);
        $year = $request->get('year', now()->year);

        $workOrders = JasaWorkOrder::with('technician')
            ->where('tenant_id', $tenantId)
            ->whereYear('scheduled_date', $year)
            ->whereMonth('scheduled_date', $month)
            ->get();

        $contracts = JasaContract::with('technician')
            ->where('tenant_id', $tenantId)
            ->whereYear('next_schedule_date', $year)
            ->whereMonth('next_schedule_date', $month)
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'workOrders' => $workOrders,
                'contracts' => $contracts
            ]
        ]);
    }

    /**
     * Get Invoices (Income)
     */
    public function getInvoices(Request $request)
    {
        $tenantId = $request->user()->tenant_id;
        $invoices = JasaFinanceTransaction::where('tenant_id', $tenantId)
            ->where('type', 'Pemasukan')
            ->orderBy('transaction_date', 'desc')
            ->get();
            
        $mapped = $invoices->map(function ($inv) {
            return [
                'id' => (string) $inv->id,
                'invoiceNumber' => $inv->transaction_number,
                'workOrderId' => $inv->work_order_id,
                'contractId' => $inv->contract_id,
                'customerName' => $inv->recipient_or_payer ?: 'Pelanggan Umum',
                'amount' => (float) $inv->amount,
                'date' => $inv->transaction_date ? $inv->transaction_date->format('Y-m-d') : date('Y-m-d'),
                'dueDate' => $inv->transaction_date ? $inv->transaction_date->format('Y-m-d') : date('Y-m-d'),
                'status' => 'Lunas',
                'paymentMethod' => $inv->payment_method
            ];
        });

        return response()->json(['success' => true, 'data' => $mapped]);
    }

    /**
     * Get Expenses
     */
    public function getExpenses(Request $request)
    {
        $tenantId = $request->user()->tenant_id;
        $expenses = JasaFinanceTransaction::where('tenant_id', $tenantId)
            ->where('type', 'Pengeluaran')
            ->orderBy('transaction_date', 'desc')
            ->get();

        $mapped = $expenses->map(function ($exp) {
            return [
                'id' => (string) $exp->id,
                'expenseNumber' => $exp->transaction_number,
                'category' => $exp->category,
                'description' => $exp->notes,
                'amount' => (float) $exp->amount,
                'date' => $exp->transaction_date ? $exp->transaction_date->format('Y-m-d') : date('Y-m-d'),
                'paymentMethod' => $exp->payment_method,
                'referenceSpkId' => $exp->reference_number,
                'recordedBy' => 'Admin'
            ];
        });

        return response()->json(['success' => true, 'data' => $mapped]);
    }

    /**
     * Store Expense
     */
    public function storeExpense(Request $request)
    {
        $request->validate([
            'description' => 'required|string',
            'amount' => 'required|numeric|min:0',
            'category' => 'nullable|string',
            'payment_method' => 'nullable|string',
            'transaction_date' => 'nullable|date',
            'reference_spk_id' => 'nullable|string',
            'recipient_or_payer' => 'nullable|string',
        ]);

        $tenantId = $request->user()->tenant_id;
        $expenseCount = JasaFinanceTransaction::where('tenant_id', $tenantId)->where('type', 'Pengeluaran')->count() + 1;
        $trxNo = 'EXP-' . date('Y') . '-' . str_pad($expenseCount, 4, '0', STR_PAD_LEFT);

        $expense = JasaFinanceTransaction::create([
            'tenant_id' => $tenantId,
            'transaction_number' => $trxNo,
            'type' => 'Pengeluaran',
            'category' => $request->category ?: 'Biaya Operasional',
            'amount' => $request->amount,
            'transaction_date' => $request->transaction_date ? date('Y-m-d', strtotime($request->transaction_date)) : now()->toDateString(),
            'payment_method' => $request->payment_method ?: 'Kas / Tunai',
            'reference_number' => $request->reference_spk_id,
            'recipient_or_payer' => $request->recipient_or_payer ?: 'Vendor / Toko',
            'notes' => $request->description,
        ]);

        return response()->json([
            'success' => true,
            'data' => [
                'id' => (string) $expense->id,
                'expenseNumber' => $expense->transaction_number,
                'category' => $expense->category,
                'description' => $expense->notes,
                'amount' => (float) $expense->amount,
                'date' => $expense->transaction_date ? $expense->transaction_date->format('Y-m-d') : date('Y-m-d'),
                'paymentMethod' => $expense->payment_method,
                'referenceSpkId' => $expense->reference_number,
                'recordedBy' => $request->user()->name ?? 'Admin Jasa'
            ]
        ], 201);
    }

    /**
     * Update Expense
     */
    public function updateExpense(Request $request, $id)
    {
        $tenantId = $request->user()->tenant_id;
        $expense = JasaFinanceTransaction::where('tenant_id', $tenantId)
            ->where('type', 'Pengeluaran')
            ->where(function($q) use ($id) {
                $q->where('id', $id)->orWhere('transaction_number', $id);
            })->firstOrFail();

        $request->validate([
            'description' => 'required|string',
            'amount' => 'required|numeric|min:0',
            'category' => 'nullable|string',
            'payment_method' => 'nullable|string',
            'transaction_date' => 'nullable|date',
            'reference_spk_id' => 'nullable|string',
            'recipient_or_payer' => 'nullable|string',
        ]);

        $expense->update([
            'category' => $request->category ?: $expense->category,
            'amount' => $request->amount,
            'transaction_date' => $request->transaction_date ? date('Y-m-d', strtotime($request->transaction_date)) : $expense->transaction_date,
            'payment_method' => $request->payment_method ?: $expense->payment_method,
            'reference_number' => $request->reference_spk_id !== null ? $request->reference_spk_id : $expense->reference_number,
            'recipient_or_payer' => $request->recipient_or_payer ?: $expense->recipient_or_payer,
            'notes' => $request->description,
        ]);

        return response()->json([
            'success' => true,
            'data' => [
                'id' => (string) $expense->id,
                'expenseNumber' => $expense->transaction_number,
                'category' => $expense->category,
                'description' => $expense->notes,
                'amount' => (float) $expense->amount,
                'date' => $expense->transaction_date ? $expense->transaction_date->format('Y-m-d') : date('Y-m-d'),
                'paymentMethod' => $expense->payment_method,
                'referenceSpkId' => $expense->reference_number,
                'recordedBy' => $request->user()->name ?? 'Admin Jasa'
            ]
        ]);
    }

    /**
     * Destroy Expense
     */
    public function destroyExpense(Request $request, $id)
    {
        $tenantId = $request->user()->tenant_id;
        $expense = JasaFinanceTransaction::where('tenant_id', $tenantId)
            ->where('type', 'Pengeluaran')
            ->where(function($q) use ($id) {
                $q->where('id', $id)->orWhere('transaction_number', $id);
            })->firstOrFail();
            
        $expense->delete();

        return response()->json(['success' => true, 'message' => 'Pengeluaran berhasil dihapus']);
    }

    /**
     * Update Invoice Status
     */
    public function updateInvoiceStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|string',
        ]);

        $tenantId = $request->user()->tenant_id;
        $invoice = JasaFinanceTransaction::where('tenant_id', $tenantId)
            ->where('type', 'Pemasukan')
            ->where(function($q) use ($id) {
                $q->where('id', $id)->orWhere('transaction_number', $id);
            })->firstOrFail();

        $invoice->update(['notes' => $invoice->notes . ' [Status: ' . $request->status . ']']);

        return response()->json(['success' => true, 'data' => $invoice]);
    }

    /**
     * Get Inventory (Spareparts)
     */
    public function getInventory(Request $request)
    {
        $tenantId = $request->user()->tenant_id;
        $inventory = JasaSparepart::where('tenant_id', $tenantId)->get();
        return response()->json(['success' => true, 'data' => $inventory]);
    }

    /**
     * Store Inventory (Spareparts)
     */
    public function storeInventory(Request $request)
    {
        $request->validate([
            'item_code' => 'required|string',
            'name' => 'required|string',
            'category' => 'required|string',
            'price' => 'required|numeric',
            'stock' => 'required|integer',
            'unit' => 'required|string',
        ]);

        $tenantId = $request->user()->tenant_id;
        $sparepart = JasaSparepart::create(array_merge(
            $request->only(['item_code', 'name', 'category', 'price', 'stock', 'min_stock', 'unit', 'location']),
            ['tenant_id' => $tenantId]
        ));

        return response()->json(['success' => true, 'data' => $sparepart], 201);
    }

    /**
     * Update Inventory (Spareparts)
     */
    public function updateInventory(Request $request, $id)
    {
        $tenantId = $request->user()->tenant_id;
        $sparepart = JasaSparepart::where('tenant_id', $tenantId)->findOrFail($id);
        $sparepart->update($request->only(['item_code', 'name', 'category', 'price', 'stock', 'min_stock', 'unit', 'location']));
        return response()->json(['success' => true, 'data' => $sparepart]);
    }

    /**
     * Destroy Inventory (Spareparts)
     */
    public function destroyInventory(Request $request, $id)
    {
        $tenantId = $request->user()->tenant_id;
        $sparepart = JasaSparepart::where('tenant_id', $tenantId)->findOrFail($id);
        $sparepart->delete();
        return response()->json(['success' => true]);
    }

    /**
     * Get Payables
     */
    public function getPayables(Request $request)
    {
        $tenantId = $request->user()->tenant_id;
        $payables = JasaPayable::where('tenant_id', $tenantId)
            ->orderBy('due_date', 'asc')
            ->get();
        return response()->json(['success' => true, 'data' => $payables]);
    }

    /**
     * Store Payable
     */
    public function storePayable(Request $request)
    {
        $request->validate([
            'payable_number' => 'required|string|max:50',
            'vendor_name' => 'required|string|max:150',
            'description' => 'required|string|max:255',
            'amount' => 'required|numeric|min:0',
            'due_date' => 'required|date',
        ]);

        $tenantId = $request->user()->tenant_id;
        $payable = JasaPayable::create([
            'tenant_id' => $tenantId,
            'payable_number' => $request->payable_number,
            'vendor_name' => $request->vendor_name,
            'description' => $request->description,
            'amount' => $request->amount,
            'paid_amount' => $request->paid_amount ?? 0,
            'due_date' => $request->due_date,
            'status' => $request->status ?? 'Belum Lunas',
            'notes' => $request->notes,
        ]);

        return response()->json(['success' => true, 'data' => $payable], 201);
    }

    /**
     * Update Payable
     */
    public function updatePayable(Request $request, $id)
    {
        $tenantId = $request->user()->tenant_id;
        $payable = JasaPayable::where('tenant_id', $tenantId)
            ->where(function($q) use ($id) {
                $q->where('id', $id)->orWhere('payable_number', $id);
            })->firstOrFail();

        $payable->update($request->only([
            'vendor_name',
            'description',
            'amount',
            'paid_amount',
            'due_date',
            'status',
            'notes'
        ]));

        return response()->json(['success' => true, 'data' => $payable]);
    }

    /**
     * Destroy Payable
     */
    public function destroyPayable(Request $request, $id)
    {
        $tenantId = $request->user()->tenant_id;
        $payable = JasaPayable::where('tenant_id', $tenantId)
            ->where(function($q) use ($id) {
                $q->where('id', $id)->orWhere('payable_number', $id);
            })->firstOrFail();
        $payable->delete();

        return response()->json(['success' => true, 'message' => 'Hutang berhasil dihapus']);
    }

    /**
     * Get Accounts
     */
    public function getAccounts(Request $request)
    {
        $tenantId = $request->user()->tenant_id;
        $accounts = JasaAccount::where('tenant_id', $tenantId)
            ->orderBy('name', 'asc')
            ->get();

        if ($accounts->isEmpty()) {
            $defaults = [
                ['name' => 'Kas Operasional Jasa', 'type' => 'Kas', 'account_number' => '1001', 'balance' => 0],
                ['name' => 'Bank BCA Operasional', 'type' => 'Bank', 'account_number' => '1002', 'balance' => 0],
                ['name' => 'Dompet Digital QRIS', 'type' => 'E-Wallet', 'account_number' => '1003', 'balance' => 0],
            ];
            foreach ($defaults as $def) {
                JasaAccount::create(array_merge($def, ['tenant_id' => $tenantId, 'is_active' => true]));
            }
            $accounts = JasaAccount::where('tenant_id', $tenantId)->get();
        }

        return response()->json(['success' => true, 'data' => $accounts]);
    }

    /**
     * Store Account
     */
    public function storeAccount(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:100',
            'type' => 'required|string|in:Kas,Bank,E-Wallet',
            'balance' => 'required|numeric',
        ]);

        $tenantId = $request->user()->tenant_id;
        $account = JasaAccount::create([
            'tenant_id' => $tenantId,
            'name' => $request->name,
            'type' => $request->type,
            'account_number' => $request->account_number,
            'balance' => $request->balance,
            'is_active' => $request->is_active ?? true,
        ]);

        return response()->json(['success' => true, 'data' => $account], 201);
    }

    /**
     * Update Account
     */
    public function updateAccount(Request $request, $id)
    {
        $tenantId = $request->user()->tenant_id;
        $account = JasaAccount::where('tenant_id', $tenantId)->findOrFail($id);
        $account->update($request->only(['name', 'type', 'account_number', 'balance', 'is_active']));

        return response()->json(['success' => true, 'data' => $account]);
    }

    /**
     * Destroy Account
     */
    public function destroyAccount(Request $request, $id)
    {
        $tenantId = $request->user()->tenant_id;
        $account = JasaAccount::where('tenant_id', $tenantId)->findOrFail($id);
        $account->delete();

        return response()->json(['success' => true, 'message' => 'Akun berhasil dihapus']);
    }

    /**
     * Transfer between accounts
     */
    public function transferAccount(Request $request)
    {
        $request->validate([
            'from_account_id' => 'required|integer',
            'to_account_id' => 'required|integer|different:from_account_id',
            'amount' => 'required|numeric|min:1',
            'notes' => 'nullable|string'
        ]);

        $tenantId = $request->user()->tenant_id;

        DB::beginTransaction();
        try {
            $fromAcc = JasaAccount::where('tenant_id', $tenantId)->lockForUpdate()->findOrFail($request->from_account_id);
            $toAcc = JasaAccount::where('tenant_id', $tenantId)->lockForUpdate()->findOrFail($request->to_account_id);

            if ($fromAcc->balance < $request->amount) {
                DB::rollBack();
                return response()->json([
                    'success' => false,
                    'message' => 'Saldo akun asal tidak mencukupi untuk transfer.'
                ], 422);
            }

            $fromAcc->balance -= $request->amount;
            $fromAcc->save();

            $toAcc->balance += $request->amount;
            $toAcc->save();

            JasaFinanceTransaction::create([
                'tenant_id' => $tenantId,
                'transaction_number' => 'TRF-' . date('YmdHis'),
                'type' => 'Pengeluaran',
                'category' => 'Mutasi Kas Antar Rekening',
                'amount' => $request->amount,
                'transaction_date' => now()->toDateString(),
                'payment_method' => $fromAcc->name . ' -> ' . $toAcc->name,
                'recipient_or_payer' => $toAcc->name,
                'notes' => 'Transfer internal dari ' . $fromAcc->name . ' ke ' . $toAcc->name . ($request->notes ? ': ' . $request->notes : ''),
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Transfer dana antar rekening berhasil dilakukan.',
                'data' => [
                    'from_account' => $fromAcc,
                    'to_account' => $toAcc
                ]
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Gagal melakukan transfer: ' . $e->getMessage()
            ], 500);
        }
    }
}