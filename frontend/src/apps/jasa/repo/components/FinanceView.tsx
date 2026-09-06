import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  Receipt,
  Search,
  Filter,
  CreditCard,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Eye,
  Printer,
  Download,
  Plus,
  TrendingUp,
  Banknote,
  CheckCircle2,
  AlertCircle,
  BarChart3,
  Layers,
  Scale,
  BookOpen,
  ArrowRightLeft,
  ShieldCheck,
  Check,
  Building2,
  FileSpreadsheet,
  HelpCircle,
  Sparkles,
  Package,
  ChevronRight
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts';
import { 
  JasaInvoice, 
  InvoiceStatus, 
  JasaExpense, 
  ExpenseCategory, 
  JasaPayable, 
  PayableStatus, 
  FinancialAccount, 
  JournalEntry 
} from '../types';
import { formatRupiah } from '../data/mockData';
import usePagination from '../../../../hooks/usePagination';
import RetailPagination from '../../../retail/components/RetailPagination';
import { useAuth } from '../../../../contexts/AuthContext';
import { useReactToPrint } from 'react-to-print';
import '../../jasa-print.css';
import {
  JasaPrintHeader,
  JasaPrintSectionHeader,
  JasaPrintAppendixHeader,
  JasaPrintExplanationBox,
  JasaPrintFooter,
  formatRp,
  formatDateIndo
} from '../../components/JasaPrintLayout';

interface FinanceViewProps {
  invoices: JasaInvoice[];
  expenses: JasaExpense[];
  inventory?: any[];
  initialTab?: 'invoices' | 'expenses' | 'summary' | 'payables' | 'accounts' | 'balance_sheet' | 'journal';
  onUpdateInvoiceStatus: (invoiceId: string, status: InvoiceStatus) => void;
  onViewInvoice: (invoice: JasaInvoice) => void;
  onAddExpense?: (expense: Omit<JasaExpense, 'id'>) => void;
}

const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  'Belanja Suku Cadang (Parts)',
  'Komisi / Upah Teknisi',
  'Alat Kerja & Perlengkapan',
  'Biaya Transport & Akomodasi',
  'Listrik, Internet & Utilitas',
  'Sewa Tempat / Workshop',
  'Biaya Operasional',
  'Lain-lain'
];

const COLORS = ['#2563eb', '#059669', '#d97706', '#dc2626', '#8b5cf6', '#06b6d4', '#475569', '#ec4899'];

// Default Multi-Bank / Cash Accounts
const INITIAL_ACCOUNTS: FinancialAccount[] = [
  { id: 'ACC-01', name: 'Kas Utama / Laci Kasir', type: 'Kas Tunai', balance: 5000000, color: 'emerald' },
  { id: 'ACC-02', name: 'Rekening Bank BCA', type: 'Rekening Bank', accountNumber: '8830-192-881', balance: 24500000, color: 'blue' },
  { id: 'ACC-03', name: 'Rekening Bank Mandiri', type: 'Rekening Bank', accountNumber: '137-00-19283-1', balance: 12800000, color: 'indigo' },
  { id: 'ACC-04', name: 'QRIS & E-Wallet Settlement', type: 'E-Wallet / QRIS', accountNumber: 'MID-99201', balance: 3450000, color: 'amber' }
];

export const FinanceView: React.FC<FinanceViewProps> = ({ 
  invoices = [], 
  expenses = [],
  inventory = [],
  initialTab = 'invoices',
  onUpdateInvoiceStatus,
  onViewInvoice,
  onAddExpense
}) => {
  const { user } = useAuth();
  
  // Accounting Mode: 'simple' (Praktis UMKM) vs 'advanced' (Akuntansi Lengkap SAK EMKM)
  const [accountingMode, setAccountingMode] = useState<'simple' | 'advanced'>(() => {
    const saved = localStorage.getItem('bizora_accounting_mode');
    return saved === 'advanced' ? 'advanced' : 'simple';
  });

  const handleModeChange = (mode: 'simple' | 'advanced') => {
    setAccountingMode(mode);
    localStorage.setItem('bizora_accounting_mode', mode);
    if (mode === 'simple' && (activeTab === 'payables' || activeTab === 'accounts' || activeTab === 'balance_sheet' || activeTab === 'journal')) {
      setActiveTab('invoices');
    }
  };

  const [activeTab, setActiveTab] = useState<'invoices' | 'expenses' | 'summary' | 'payables' | 'accounts' | 'balance_sheet' | 'journal'>(initialTab);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // Invoice States
  const [invoiceSearch, setInvoiceSearch] = useState('');
  const [invoiceStatusFilter, setInvoiceStatusFilter] = useState<InvoiceStatus | 'Semua'>('Semua');
  const invoicePrintRef = useRef<HTMLDivElement>(null);

  // Expense States
  const [expenseSearch, setExpenseSearch] = useState('');
  const [expenseCategoryFilter, setExpenseCategoryFilter] = useState<ExpenseCategory | 'Semua'>('Semua');
  const [showAddExpense, setShowAddExpense] = useState(false);
  const expensePrintRef = useRef<HTMLDivElement>(null);
  const pnlPrintRef = useRef<HTMLDivElement>(null);
  const balanceSheetPrintRef = useRef<HTMLDivElement>(null);
  const journalPrintRef = useRef<HTMLDivElement>(null);
  const payablesPrintRef = useRef<HTMLDivElement>(null);

  // New Expense Form State
  const [newExpense, setNewExpense] = useState<{
    type: 'Pemasukan' | 'Pengeluaran';
    date: string;
    category: ExpenseCategory;
    description: string;
    amount: number;
    referenceSpkId: string;
    notes: string;
  }>({
    type: 'Pengeluaran',
    date: new Date().toISOString().slice(0, 10),
    category: 'Biaya Operasional',
    description: '',
    amount: 0,
    referenceSpkId: '',
    notes: ''
  });

  // --- Accounts Payable (Hutang Supplier) State ---
  const [payables, setPayables] = useState<JasaPayable[]>(() => {
    const saved = localStorage.getItem('bizora_jasa_payables');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return [
      {
        id: 'AP-2026-001',
        supplierName: 'PT Mega Auto Spareparts',
        invoiceNumber: 'INV-SPL/2026/089',
        issueDate: '2026-08-15',
        dueDate: '2026-09-15',
        totalAmount: 4800000,
        paidAmount: 2000000,
        status: 'Dibayar Sebagian',
        category: 'Belanja Suku Cadang',
        notes: 'Termin 30 hari - Pengadaan Kampas Rem & Busi'
      },
      {
        id: 'AP-2026-002',
        supplierName: 'CV Sumber Dingin Teknik',
        invoiceNumber: 'SDT-FAK/8821',
        issueDate: '2026-08-20',
        dueDate: '2026-09-20',
        totalAmount: 3200000,
        paidAmount: 0,
        status: 'Belum Dibayar',
        category: 'Material & Freon AC',
        notes: 'Freon R32 5 Tabung & Pipa Tembaga'
      }
    ];
  });

  const savePayables = (updated: JasaPayable[]) => {
    setPayables(updated);
    localStorage.setItem('bizora_jasa_payables', JSON.stringify(updated));
  };

  const [payableSearch, setPayableSearch] = useState('');
  const [payableStatusFilter, setPayableStatusFilter] = useState<PayableStatus | 'Semua'>('Semua');
  const [showAddPayable, setShowAddPayable] = useState(false);
  const [newPayable, setNewPayable] = useState({
    supplierName: '',
    invoiceNumber: '',
    issueDate: new Date().toISOString().slice(0, 10),
    dueDate: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
    totalAmount: 0,
    category: 'Belanja Suku Cadang',
    notes: ''
  });

  // --- Multi Kas & Bank Accounts State ---
  const [accounts, setAccounts] = useState<FinancialAccount[]>(() => {
    const saved = localStorage.getItem('bizora_jasa_accounts');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return INITIAL_ACCOUNTS;
  });

  const saveAccounts = (updated: FinancialAccount[]) => {
    setAccounts(updated);
    localStorage.setItem('bizora_jasa_accounts', JSON.stringify(updated));
  };

  const [showAddAccount, setShowAddAccount] = useState(false);
  const [newAccount, setNewAccount] = useState({
    name: '',
    type: 'Rekening Bank' as 'Kas Tunai' | 'Rekening Bank' | 'E-Wallet / QRIS',
    accountNumber: '',
    balance: 0
  });

  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferData, setTransferData] = useState({
    fromAccountId: '',
    toAccountId: '',
    amount: 0,
    notes: ''
  });

  // --- Financial Calculations ---
  // Invoices & Receivables (AR)
  const totalRevenueLunas = useMemo(() => 
    invoices.filter(i => i.status === 'Lunas').reduce((acc, curr) => acc + Number(curr.totalAmount || 0), 0)
  , [invoices]);

  const totalReceivables = useMemo(() => 
    invoices.filter(i => i.status !== 'Lunas' && i.status !== 'Dibatalkan').reduce((acc, curr) => acc + (Number(curr.totalAmount || 0) - Number(curr.paidAmount || 0)), 0)
  , [invoices]);

  const totalInvoiced = useMemo(() =>
    invoices.filter(i => i.status !== 'Dibatalkan').reduce((acc, curr) => acc + Number(curr.totalAmount || 0), 0)
  , [invoices]);

  // Expenses & Cashbook
  const totalPemasukanKas = useMemo(() => 
    expenses.filter(e => e.type === 'Pemasukan').reduce((acc, curr) => acc + Number(curr.amount || 0), 0)
  , [expenses]);

  const totalPengeluaranKas = useMemo(() => 
    expenses.filter(e => e.type !== 'Pemasukan').reduce((acc, curr) => acc + Number(curr.amount || 0), 0)
  , [expenses]);

  const saldoKasBersih = totalPemasukanKas - totalPengeluaranKas;

  // Payables & Liabilities (AP)
  const totalPayables = useMemo(() => 
    payables.filter(p => p.status !== 'Lunas').reduce((acc, curr) => acc + (Number(curr.totalAmount || 0) - Number(curr.paidAmount || 0)), 0)
  , [payables]);

  const totalPaidPayables = useMemo(() => 
    payables.reduce((acc, curr) => acc + Number(curr.paidAmount || 0), 0)
  , [payables]);

  // Total Liquid Cash & Bank Balances
  const totalLiquidCash = useMemo(() => 
    accounts.reduce((acc, curr) => acc + Number(curr.balance || 0), 0)
  , [accounts]);

  // Inventory Asset Value
  const totalInventoryAsset = useMemo(() => {
    if (!inventory || inventory.length === 0) return 8500000; // Fallback sensible default if empty
    return inventory.reduce((acc, item) => acc + (Number(item.price || 0) * Number(item.stock || 0)), 0);
  }, [inventory]);

  // Fixed Assets (Equipment / Workshop Tools)
  const totalFixedAssets = 25000000;
  const accumulatedDepreciation = 3500000;
  const netFixedAssets = totalFixedAssets - accumulatedDepreciation;

  // Balance Sheet Totals
  const totalCurrentAssets = totalLiquidCash + totalReceivables + totalInventoryAsset;
  const totalAssets = totalCurrentAssets + netFixedAssets;

  const totalLiabilities = totalPayables;
  const ownerEquity = totalAssets - totalLiabilities;

  // Real-Time P&L Calculations
  const actualRevenue = invoices.reduce((sum, inv) => sum + (inv.paidAmount || 0), 0);
  const actualPartsCost = expenses
    .filter(e => e.category === 'Belanja Suku Cadang (Parts)')
    .reduce((sum, e) => sum + (e.amount || 0), 0);
  const actualTechCommission = expenses
    .filter(e => e.description.toLowerCase().includes('komisi') || e.description.toLowerCase().includes('upah'))
    .reduce((sum, e) => sum + (e.amount || 0), 0) || (actualRevenue * 0.30);
  const actualOtherExpenses = expenses
    .filter(e => e.category !== 'Belanja Suku Cadang (Parts)' && !e.description.toLowerCase().includes('komisi') && !e.description.toLowerCase().includes('upah'))
    .reduce((sum, e) => sum + (e.amount || 0), 0);
  const actualNetProfit = actualRevenue - actualPartsCost - actualTechCommission - actualOtherExpenses;
  const profitMargin = actualRevenue > 0 ? ((actualNetProfit / actualRevenue) * 100).toFixed(1) : '0.0';

  // --- Dynamic Double-Entry General Journal (Jurnal Umum Otomatis) ---
  const journalEntries: JournalEntry[] = useMemo(() => {
    const list: JournalEntry[] = [];
    let entryCounter = 1;

    // 1. Invoices -> Debit Kas / Piutang, Kredit Pendapatan
    invoices.forEach(inv => {
      const paid = Number(inv.paidAmount || 0);
      const remaining = Number(inv.totalAmount || 0) - paid;
      const date = (inv.issueDate || new Date().toISOString()).split('T')[0];

      if (paid > 0) {
        list.push({
          id: 'JRN-' + String(entryCounter++).padStart(4, '0'),
          date,
          referenceNumber: inv.id,
          description: 'Penerimaan Pembayaran Faktur - ' + inv.customerName,
          debitAccount: '1-1000 Kas & Rekening Bank',
          creditAccount: '4-1000 Pendapatan Jasa Servis',
          amount: paid
        });
      }

      if (remaining > 0) {
        list.push({
          id: 'JRN-' + String(entryCounter++).padStart(4, '0'),
          date,
          referenceNumber: inv.id,
          description: 'Pengakuan Piutang Usaha SPK - ' + inv.customerName,
          debitAccount: '1-1200 Piutang Usaha (AR)',
          creditAccount: '4-1000 Pendapatan Jasa Servis',
          amount: remaining
        });
      }
    });

    // 2. Expenses -> Debit Beban, Kredit Kas
    expenses.forEach(exp => {
      const date = (exp.date || new Date().toISOString()).split('T')[0];
      let debitAcc = '5-2000 Beban Operasional Usaha';
      if (exp.category === 'Belanja Suku Cadang (Parts)') debitAcc = '1-1300 Persediaan Suku Cadang';
      else if (exp.category === 'Komisi / Upah Teknisi') debitAcc = '5-1100 Beban Komisi & Upah Teknisi';
      else if (exp.category === 'Listrik, Internet & Utilitas') debitAcc = '5-2100 Beban Listrik, Air & Internet';
      else if (exp.category === 'Sewa Tempat / Workshop') debitAcc = '5-2200 Beban Sewa Tempat';

      if (exp.type === 'Pemasukan') {
        list.push({
          id: 'JRN-' + String(entryCounter++).padStart(4, '0'),
          date,
          referenceNumber: exp.id,
          description: exp.description,
          debitAccount: '1-1000 Kas & Rekening Bank',
          creditAccount: '4-2000 Pendapatan Lain-lain',
          amount: Number(exp.amount)
        });
      } else {
        list.push({
          id: 'JRN-' + String(entryCounter++).padStart(4, '0'),
          date,
          referenceNumber: exp.id,
          description: exp.description,
          debitAccount: debitAcc,
          creditAccount: '1-1000 Kas & Rekening Bank',
          amount: Number(exp.amount)
        });
      }
    });

    // 3. Payables -> Debit Persediaan / Beban, Kredit Hutang Usaha
    payables.forEach(pay => {
      const date = pay.issueDate || new Date().toISOString().slice(0, 10);
      list.push({
        id: 'JRN-' + String(entryCounter++).padStart(4, '0'),
        date,
        referenceNumber: pay.id,
        description: 'Pembelian Tempo dari ' + pay.supplierName + ' (' + pay.invoiceNumber + ')',
        debitAccount: '1-1300 Persediaan Suku Cadang',
        creditAccount: '2-1100 Hutang Usaha Supplier (AP)',
        amount: Number(pay.totalAmount)
      });

      if (pay.paidAmount > 0) {
        list.push({
          id: 'JRN-' + String(entryCounter++).padStart(4, '0'),
          date: pay.dueDate || date,
          referenceNumber: pay.id + '-PAY',
          description: 'Pelunasan Hutang Supplier - ' + pay.supplierName,
          debitAccount: '2-1100 Hutang Usaha Supplier (AP)',
          creditAccount: '1-1000 Kas & Rekening Bank',
          amount: Number(pay.paidAmount)
        });
      }
    });

    return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [invoices, expenses, payables]);

  const totalDebitJournal = useMemo(() => journalEntries.reduce((sum, j) => sum + j.amount, 0), [journalEntries]);
  const totalCreditJournal = useMemo(() => journalEntries.reduce((sum, j) => sum + j.amount, 0), [journalEntries]);

  // --- Filtering & Pagination ---
  const filteredInvoices = useMemo(() => {
    return invoices.filter(inv => {
      const matchesSearch = 
        !invoiceSearch || 
        inv.id.toLowerCase().includes(invoiceSearch.toLowerCase()) || 
        inv.customerName.toLowerCase().includes(invoiceSearch.toLowerCase()) ||
        inv.workOrderId.toLowerCase().includes(invoiceSearch.toLowerCase());
        
      const matchesStatus = invoiceStatusFilter === 'Semua' || inv.status === invoiceStatusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [invoices, invoiceSearch, invoiceStatusFilter]);

  const invoicePagination = usePagination(filteredInvoices, 10);

  const filteredExpenses = useMemo(() => {
    return expenses.filter(exp => {
      const matchesSearch = 
        !expenseSearch || 
        exp.description.toLowerCase().includes(expenseSearch.toLowerCase()) || 
        (exp.referenceSpkId && exp.referenceSpkId.toLowerCase().includes(expenseSearch.toLowerCase())) ||
        exp.category.toLowerCase().includes(expenseSearch.toLowerCase());
        
      const matchesCategory = expenseCategoryFilter === 'Semua' || exp.category === expenseCategoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [expenses, expenseSearch, expenseCategoryFilter]);

  const expensePagination = usePagination(filteredExpenses, 10);

  const filteredPayables = useMemo(() => {
    return payables.filter(p => {
      const matchesSearch = 
        !payableSearch || 
        p.supplierName.toLowerCase().includes(payableSearch.toLowerCase()) ||
        p.invoiceNumber.toLowerCase().includes(payableSearch.toLowerCase()) ||
        p.id.toLowerCase().includes(payableSearch.toLowerCase());
      const matchesStatus = payableStatusFilter === 'Semua' || p.status === payableStatusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [payables, payableSearch, payableStatusFilter]);

  const payablesPagination = usePagination(filteredPayables, 10);

  const [journalSearch, setJournalSearch] = useState('');
  const filteredJournal = useMemo(() => {
    return journalEntries.filter(j => 
      !journalSearch ||
      j.description.toLowerCase().includes(journalSearch.toLowerCase()) ||
      j.referenceNumber.toLowerCase().includes(journalSearch.toLowerCase()) ||
      j.debitAccount.toLowerCase().includes(journalSearch.toLowerCase()) ||
      j.creditAccount.toLowerCase().includes(journalSearch.toLowerCase())
    );
  }, [journalEntries, journalSearch]);

  const journalPagination = usePagination(filteredJournal, 12);

  const chartData = useMemo(() => {
    const grouped = expenses.filter(e => e.type !== 'Pemasukan').reduce((acc, exp) => {
      acc[exp.category] = (acc[exp.category] || 0) + Number(exp.amount || 0);
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(grouped)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [expenses]);

  // Print Handlers
  const handlePrintInvoices = useReactToPrint({
    contentRef: invoicePrintRef,
    documentTitle: 'Laporan-Tagihan-Piutang-Jasa-' + new Date().toISOString().split('T')[0],
  });

  const handlePrintExpenses = useReactToPrint({
    contentRef: expensePrintRef,
    documentTitle: 'Buku-Kas-Pengeluaran-Jasa-' + new Date().toISOString().split('T')[0],
  });

  const handlePrintPnl = useReactToPrint({
    contentRef: pnlPrintRef,
    documentTitle: 'Laporan-Arus-Kas-Laba-Rugi-Jasa-' + new Date().toISOString().split('T')[0],
  });

  const handlePrintBalanceSheet = useReactToPrint({
    contentRef: balanceSheetPrintRef,
    documentTitle: 'Laporan-Neraca-SAK-EMKM-Jasa-' + new Date().toISOString().split('T')[0],
  });

  const handlePrintJournal = useReactToPrint({
    contentRef: journalPrintRef,
    documentTitle: 'Jurnal-Umum-Akuntansi-Jasa-' + new Date().toISOString().split('T')[0],
  });

  const handlePrintPayables = useReactToPrint({
    contentRef: payablesPrintRef,
    documentTitle: 'Laporan-Hutang-Supplier-AP-Jasa-' + new Date().toISOString().split('T')[0],
  });

  // Export Handlers
  const handleExportInvoices = () => {
    const headers = ['No. Invoice', 'Ref SPK', 'Pelanggan', 'Perusahaan', 'Tanggal Tagihan', 'Jatuh Tempo', 'Total (Rp)', 'Dibayar (Rp)', 'Sisa (Rp)', 'Status'];
    const rows = filteredInvoices.map(inv => [
      inv.id,
      inv.workOrderId,
      '"' + (inv.customerName || '').replace(/"/g, '""') + '"',
      '"' + (inv.customerCompany || '-').replace(/"/g, '""') + '"',
      (inv.issueDate || '').split('T')[0],
      (inv.dueDate || '').split('T')[0],
      inv.totalAmount,
      inv.paidAmount || 0,
      Math.max(0, inv.totalAmount - (inv.paidAmount || 0)),
      inv.status
    ]);
    downloadCsv('Tagihan_Piutang_Jasa_' + new Date().toISOString().split('T')[0] + '.csv', headers, rows);
  };

  const handleExportExpenses = () => {
    const headers = ['ID', 'Tipe', 'Tanggal', 'Kategori', 'Keterangan', 'Ref SPK', 'Nominal (Rp)', 'Dicatat Oleh'];
    const rows = filteredExpenses.map(exp => [
      exp.id,
      exp.type,
      exp.date.split('T')[0],
      '"' + exp.category + '"',
      '"' + exp.description.replace(/"/g, '""') + '"',
      exp.referenceSpkId || '-',
      exp.amount,
      '"' + exp.recordedBy + '"'
    ]);
    downloadCsv('Buku_Kas_Pengeluaran_Jasa_' + new Date().toISOString().split('T')[0] + '.csv', headers, rows);
  };

  const handleExportPayables = () => {
    const headers = ['ID Hutang', 'Supplier / Vendor', 'No. Faktur Vendor', 'Tgl Pembelian', 'Jatuh Tempo', 'Kategori', 'Total Tagihan (Rp)', 'Terbayar (Rp)', 'Sisa Hutang (Rp)', 'Status'];
    const rows = filteredPayables.map(p => [
      p.id,
      '"' + p.supplierName.replace(/"/g, '""') + '"',
      '"' + p.invoiceNumber.replace(/"/g, '""') + '"',
      p.issueDate,
      p.dueDate,
      '"' + p.category + '"',
      p.totalAmount,
      p.paidAmount,
      Math.max(0, p.totalAmount - p.paidAmount),
      p.status
    ]);
    downloadCsv('Hutang_Supplier_AP_' + new Date().toISOString().split('T')[0] + '.csv', headers, rows);
  };

  const handleExportJournal = () => {
    const headers = ['No. Jurnal', 'Tanggal', 'No. Referensi', 'Keterangan Transaksi', 'Akun Debit', 'Akun Kredit', 'Nominal (Rp)'];
    const rows = filteredJournal.map(j => [
      j.id,
      j.date,
      j.referenceNumber,
      '"' + j.description.replace(/"/g, '""') + '"',
      '"' + j.debitAccount + '"',
      '"' + j.creditAccount + '"',
      j.amount
    ]);
    downloadCsv('Jurnal_Umum_Akuntansi_' + new Date().toISOString().split('T')[0] + '.csv', headers, rows);
  };

  const downloadCsv = (filename: string, headers: string[], rows: any[][]) => {
    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Submit Expense
  const handleCreateExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExpense.description || newExpense.amount <= 0) return;
    
    if (onAddExpense) {
      onAddExpense({
        type: newExpense.type,
        date: newExpense.date,
        category: newExpense.category,
        description: newExpense.description,
        amount: Number(newExpense.amount),
        referenceSpkId: newExpense.referenceSpkId || undefined,
        recordedBy: user?.name || 'Admin Jasa',
        notes: newExpense.notes
      });
    }
    
    setShowAddExpense(false);
    setNewExpense({
      type: 'Pengeluaran',
      date: new Date().toISOString().slice(0, 10),
      category: 'Biaya Operasional',
      description: '',
      amount: 0,
      referenceSpkId: '',
      notes: ''
    });
  };

  // Submit Payable (Hutang Supplier)
  const handleCreatePayableSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPayable.supplierName || newPayable.totalAmount <= 0) return;

    const created: JasaPayable = {
      id: 'AP-' + new Date().getFullYear() + '-' + String(payables.length + 1).padStart(3, '0'),
      supplierName: newPayable.supplierName,
      invoiceNumber: newPayable.invoiceNumber || 'INV-VND/' + Date.now(),
      issueDate: newPayable.issueDate,
      dueDate: newPayable.dueDate,
      totalAmount: Number(newPayable.totalAmount),
      paidAmount: 0,
      status: 'Belum Dibayar',
      category: newPayable.category,
      notes: newPayable.notes
    };

    savePayables([created, ...payables]);
    setShowAddPayable(false);
    setNewPayable({
      supplierName: '',
      invoiceNumber: '',
      issueDate: new Date().toISOString().slice(0, 10),
      dueDate: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
      totalAmount: 0,
      category: 'Belanja Suku Cadang',
      notes: ''
    });
  };

  // Pay Payable (Pelunasan Hutang)
  const handlePayPayable = (payableId: string, payAmount: number) => {
    const updated = payables.map(p => {
      if (p.id === payableId) {
        const newPaid = Math.min(p.totalAmount, (p.paidAmount || 0) + payAmount);
        const newStatus: PayableStatus = newPaid >= p.totalAmount ? 'Lunas' : 'Dibayar Sebagian';
        return { ...p, paidAmount: newPaid, status: newStatus };
      }
      return p;
    });
    savePayables(updated);
  };

  // Add Bank Account
  const handleAddAccountSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAccount.name) return;

    const colors = ['blue', 'emerald', 'indigo', 'amber', 'purple', 'teal'];
    const acc: FinancialAccount = {
      id: 'ACC-' + String(accounts.length + 1).padStart(2, '0'),
      name: newAccount.name,
      type: newAccount.type,
      accountNumber: newAccount.accountNumber || undefined,
      balance: Number(newAccount.balance || 0),
      color: colors[accounts.length % colors.length]
    };

    saveAccounts([...accounts, acc]);
    setShowAddAccount(false);
    setNewAccount({ name: '', type: 'Rekening Bank', accountNumber: '', balance: 0 });
  };

  // Handle Transfer
  const handleTransferSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!transferData.fromAccountId || !transferData.toAccountId || transferData.amount <= 0) return;
    if (transferData.fromAccountId === transferData.toAccountId) return;

    const updated = accounts.map(acc => {
      if (acc.id === transferData.fromAccountId) {
        return { ...acc, balance: acc.balance - transferData.amount };
      }
      if (acc.id === transferData.toAccountId) {
        return { ...acc, balance: acc.balance + transferData.amount };
      }
      return acc;
    });

    saveAccounts(updated);
    setShowTransferModal(false);
    setTransferData({ fromAccountId: '', toAccountId: '', amount: 0, notes: '' });
  };

  const getStatusBadgeColor = (status: InvoiceStatus) => {
    switch (status) {
      case 'Lunas': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Dibayar Sebagian': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Belum Dibayar': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Jatuh Tempo': return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'Dibatalkan': return 'bg-slate-100 text-slate-600 border-slate-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const getPayableBadgeColor = (status: PayableStatus) => {
    switch (status) {
      case 'Lunas': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Dibayar Sebagian': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Belum Dibayar': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Jatuh Tempo': return 'bg-rose-100 text-rose-800 border-rose-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  return (
    <div className="space-y-5">
      {/* Top Header with Progressive Accounting Mode Switcher */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Financial Hub</span>
              <span className={'px-2 py-0.5 rounded-md text-[10px] font-extrabold border ' + (accountingMode === 'simple' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-purple-50 text-purple-700 border-purple-200')}>
                {accountingMode === 'simple' ? 'Mode Praktis UMKM' : 'Mode Akuntansi SAK EMKM'}
              </span>
            </div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 mt-0.5">
              <Wallet className="w-5 h-5 text-blue-600" />
              <span>Manajemen Keuangan & Kas Terpadu</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {accountingMode === 'simple' 
                ? 'Pencatatan kas masuk & keluar praktis, pantau piutang konsumen, serta arus laba rugi instan.'
                : 'Sistem akuntansi terintegrasi standar SAK EMKM: AR/AP, multi-rekening bank, neraca saldo, dan jurnal otomatis.'
              }
            </p>
          </div>

          {/* Mode Switcher Toggle Pill */}
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => handleModeChange('simple')}
                className={'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ' + (accountingMode === 'simple' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-500 hover:text-slate-800')}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Mode Praktis</span>
              </button>
              <button
                type="button"
                onClick={() => handleModeChange('advanced')}
                className={'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ' + (accountingMode === 'advanced' ? 'bg-purple-600 text-white shadow-xs' : 'text-slate-500 hover:text-slate-800')}
              >
                <Scale className="w-3.5 h-3.5" />
                <span>Akuntansi Lengkap</span>
              </button>
            </div>
          </div>
        </div>

        {/* Sub-Navigation Tabs based on Accounting Mode */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto pb-1">
          {/* Core Tabs (Available in both modes) */}
          <button
            onClick={() => setActiveTab('invoices')}
            className={'flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ' + (activeTab === 'invoices' ? 'bg-blue-600 text-white shadow-xs' : 'bg-slate-50 text-slate-600 hover:bg-slate-100')}
          >
            <Receipt className="w-3.5 h-3.5" />
            <span>Tagihan & Piutang {accountingMode === 'advanced' ? '(AR)' : ''}</span>
            {totalReceivables > 0 && (
              <span className={'w-2 h-2 rounded-full ' + (activeTab === 'invoices' ? 'bg-white animate-pulse' : 'bg-amber-500 animate-pulse')} />
            )}
          </button>

          <button
            onClick={() => setActiveTab('expenses')}
            className={'flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ' + (activeTab === 'expenses' ? 'bg-blue-600 text-white shadow-xs' : 'bg-slate-50 text-slate-600 hover:bg-slate-100')}
          >
            <Banknote className="w-3.5 h-3.5" />
            <span>Buku Kas & Pengeluaran</span>
          </button>

          <button
            onClick={() => setActiveTab('summary')}
            className={'flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ' + (activeTab === 'summary' ? 'bg-blue-600 text-white shadow-xs' : 'bg-slate-50 text-slate-600 hover:bg-slate-100')}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Laba Rugi {accountingMode === 'advanced' ? '(P&L)' : 'Simpel'}</span>
          </button>

          {/* Advanced SAK EMKM Tabs */}
          {accountingMode === 'advanced' && (
            <>
              <div className="h-5 w-px bg-slate-200 mx-1 shrink-0" />

              <button
                onClick={() => setActiveTab('payables')}
                className={'flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ' + (activeTab === 'payables' ? 'bg-purple-600 text-white shadow-xs' : 'bg-purple-50 text-purple-700 hover:bg-purple-100')}
              >
                <Package className="w-3.5 h-3.5" />
                <span>Hutang Supplier (AP)</span>
                {totalPayables > 0 && (
                  <span className={'w-2 h-2 rounded-full ' + (activeTab === 'payables' ? 'bg-white' : 'bg-rose-500 animate-pulse')} />
                )}
              </button>

              <button
                onClick={() => setActiveTab('accounts')}
                className={'flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ' + (activeTab === 'accounts' ? 'bg-purple-600 text-white shadow-xs' : 'bg-purple-50 text-purple-700 hover:bg-purple-100')}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>Multi Kas & Rekening Bank</span>
              </button>

              <button
                onClick={() => setActiveTab('balance_sheet')}
                className={'flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ' + (activeTab === 'balance_sheet' ? 'bg-purple-600 text-white shadow-xs' : 'bg-purple-50 text-purple-700 hover:bg-purple-100')}
              >
                <Scale className="w-3.5 h-3.5" />
                <span>Laporan Neraca SAK EMKM</span>
              </button>

              <button
                onClick={() => setActiveTab('journal')}
                className={'flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ' + (activeTab === 'journal' ? 'bg-purple-600 text-white shadow-xs' : 'bg-purple-50 text-purple-700 hover:bg-purple-100')}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Jurnal Umum Otomatis</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: TAGIHAN & PIUTANG (INVOICES / AR)                                 */}
      {/* ========================================================================= */}
      {activeTab === 'invoices' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          {/* Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-1">Total Kas Masuk (Lunas)</p>
                <h4 className="text-lg font-bold text-slate-900">{formatRupiah(totalRevenueLunas)}</h4>
                <div className="flex items-center gap-1 mt-1 text-[10px] font-semibold text-emerald-600">
                  <ArrowUpRight className="w-3 h-3" />
                  <span>Pelunasan Terverifikasi</span>
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center border border-emerald-100">
                <Wallet className="w-5 h-5 text-emerald-600" />
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-1">Piutang Belum Tertagih</p>
                <h4 className="text-lg font-bold text-rose-600">{formatRupiah(totalReceivables)}</h4>
                <div className="flex items-center gap-1 mt-1 text-[10px] font-semibold text-amber-600">
                  <Clock className="w-3 h-3" />
                  <span>Menunggu Pelunasan Klien</span>
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center border border-amber-100">
                <CreditCard className="w-5 h-5 text-amber-600" />
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-1">Total Faktur Diterbitkan</p>
                <h4 className="text-lg font-bold text-slate-900">{formatRupiah(totalInvoiced)}</h4>
                <div className="flex items-center gap-1 mt-1 text-[10px] font-semibold text-blue-600">
                  <Receipt className="w-3 h-3" />
                  <span>{invoices.length} Faktur Tercatat</span>
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center border border-blue-100">
                <Layers className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </div>

          {/* Invoice Controls */}
          <div className="flex flex-wrap gap-3 justify-between items-center bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex flex-1 w-full sm:w-auto items-center gap-3 flex-wrap">
              <div className="relative flex-1 sm:max-w-xs">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari ID Invoice, Pelanggan, atau Ref SPK..."
                  value={invoiceSearch}
                  onChange={e => setInvoiceSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all outline-none"
                />
              </div>
              
              <div className="relative">
                <Filter className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <select
                  value={invoiceStatusFilter}
                  onChange={e => setInvoiceStatusFilter(e.target.value as any)}
                  className="pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none appearance-none cursor-pointer"
                >
                  <option value="Semua">Semua Status Tagihan</option>
                  <option value="Lunas">Lunas</option>
                  <option value="Dibayar Sebagian">Dibayar Sebagian (DP)</option>
                  <option value="Belum Dibayar">Belum Dibayar</option>
                  <option value="Jatuh Tempo">Jatuh Tempo</option>
                  <option value="Dibatalkan">Dibatalkan</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handlePrintInvoices}
                className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl shadow-xs transition-all cursor-pointer"
                title="Cetak Laporan Tagihan & Piutang PDF"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Cetak PDF</span>
              </button>

              <button
                onClick={handleExportInvoices}
                className="flex items-center gap-1.5 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-semibold rounded-xl transition-all cursor-pointer"
                title="Export Tagihan ke Excel / CSV"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Excel</span>
              </button>
            </div>
          </div>

          {/* Invoices Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">No. Invoice & SPK</th>
                    <th className="py-3 px-4">Pelanggan</th>
                    <th className="py-3 px-4">Jatuh Tempo</th>
                    <th className="py-3 px-4 text-right">Total Tagihan</th>
                    <th className="py-3 px-4 text-right">Terbayar</th>
                    <th className="py-3 px-4 text-right">Sisa Piutang</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {invoicePagination.paginatedData.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-400">
                        <Receipt className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                        <p className="font-semibold text-slate-600 text-sm">Belum ada faktur tagihan</p>
                        <p className="text-xs text-slate-400 mt-0.5">Faktur akan otomatis terbentuk saat SPK selesai atau order kasir dicatat.</p>
                      </td>
                    </tr>
                  ) : (
                    invoicePagination.paginatedData.map((invoice) => {
                      const remaining = Math.max(0, invoice.totalAmount - (invoice.paidAmount || 0));
                      return (
                        <tr key={invoice.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-slate-900">{invoice.id}</div>
                            <div className="text-[11px] text-slate-500">{invoice.workOrderId}</div>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="font-semibold text-slate-900">{invoice.customerName}</div>
                            <div className="text-[11px] text-slate-500">{invoice.customerCompany || '-'}</div>
                          </td>
                          <td className="py-3.5 px-4 text-slate-600">
                            {invoice.dueDate ? invoice.dueDate.split('T')[0] : '-'}
                          </td>
                          <td className="py-3.5 px-4 text-right font-bold text-slate-900">
                            {formatRupiah(invoice.totalAmount)}
                          </td>
                          <td className="py-3.5 px-4 text-right text-emerald-600 font-semibold">
                            {formatRupiah(invoice.paidAmount || 0)}
                          </td>
                          <td className="py-3.5 px-4 text-right font-bold text-rose-600">
                            {formatRupiah(remaining)}
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <select
                              value={invoice.status}
                              onChange={(e) => onUpdateInvoiceStatus(invoice.id, e.target.value as InvoiceStatus)}
                              className={'text-[11px] font-bold px-2.5 py-1 rounded-lg border outline-none cursor-pointer ' + getStatusBadgeColor(invoice.status)}
                            >
                              <option value="Lunas">Lunas</option>
                              <option value="Dibayar Sebagian">Dibayar Sebagian (DP)</option>
                              <option value="Belum Dibayar">Belum Dibayar</option>
                              <option value="Jatuh Tempo">Jatuh Tempo</option>
                              <option value="Dibatalkan">Dibatalkan</option>
                            </select>
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <button
                              onClick={() => onViewInvoice(invoice)}
                              className="p-1.5 hover:bg-slate-100 text-slate-600 hover:text-blue-600 rounded-lg transition-colors cursor-pointer"
                              title="Lihat Rincian Faktur"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {filteredInvoices.length > 0 && (
              <div className="p-3 border-t border-slate-100">
                <RetailPagination
                  currentPage={invoicePagination.currentPage}
                  totalPages={invoicePagination.totalPages}
                  pageSize={invoicePagination.pageSize}
                  totalItems={filteredInvoices.length}
                  startIndex={invoicePagination.startIndex}
                  endIndex={invoicePagination.endIndex}
                  onPageChange={invoicePagination.setCurrentPage}
                  onPageSizeChange={invoicePagination.setPageSize}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: BUKU KAS & PENGELUARAN (EXPENSES / DISBURSEMENTS)                   */}
      {/* ========================================================================= */}
      {activeTab === 'expenses' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          {/* Metric Cards & Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center border border-blue-100 shrink-0">
                    <Banknote className="w-5 h-5 text-blue-600" />
                  </div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest leading-tight">Saldo Kas Bersih<br/>(Buku Kas)</p>
                </div>
                <h4 className="text-3xl font-bold text-slate-900 mb-4">{formatRupiah(saldoKasBersih)}</h4>
                
                <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-slate-100">
                  <div>
                    <p className="text-[10px] text-slate-500 font-semibold uppercase">Total Masuk</p>
                    <p className="text-sm font-bold text-emerald-600">+{formatRupiah(totalPemasukanKas)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-500 font-semibold uppercase">Total Keluar</p>
                    <p className="text-sm font-bold text-rose-600">-{formatRupiah(totalPengeluaranKas)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Expenses Chart */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm lg:col-span-2">
              <h4 className="text-sm font-semibold text-slate-900 mb-4">Distribusi Pengeluaran per Kategori</h4>
              <div className="h-44 w-full">
                {chartData.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-xs text-slate-400">
                    Belum ada data pengeluaran operasional
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                      <XAxis 
                        type="number" 
                        tickFormatter={(val) => 'Rp' + (val / 1000000).toFixed(1) + 'M'}
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fontSize: 10, fill: '#64748b' }} 
                      />
                      <YAxis 
                        type="category" 
                        dataKey="name" 
                        width={130} 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fontSize: 10, fill: '#475569', fontWeight: 600 }} 
                      />
                      <Tooltip 
                        formatter={(value: number) => [formatRupiah(value), 'Total']}
                        contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                        cursor={{ fill: '#f1f5f9' }}
                      />
                      <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                        {chartData.map((entry, index) => (
                          <Cell key={'cell-' + index} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </div>

          {/* Expense Controls */}
          <div className="flex flex-wrap gap-3 justify-between items-center bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex flex-1 w-full sm:w-auto items-center gap-3 flex-wrap">
              <div className="relative flex-1 sm:max-w-xs">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari pengeluaran atau Ref SPK..."
                  value={expenseSearch}
                  onChange={e => setExpenseSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all outline-none"
                />
              </div>
              
              <div className="relative">
                <Filter className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <select
                  value={expenseCategoryFilter}
                  onChange={e => setExpenseCategoryFilter(e.target.value as any)}
                  className="pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none appearance-none cursor-pointer"
                >
                  <option value="Semua">Semua Kategori</option>
                  {EXPENSE_CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowAddExpense(true)}
                className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Catat Transaksi Kas</span>
              </button>

              <button
                onClick={handlePrintExpenses}
                className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl shadow-xs transition-all cursor-pointer"
                title="Cetak Buku Kas PDF"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Cetak PDF</span>
              </button>

              <button
                onClick={handleExportExpenses}
                className="flex items-center gap-1.5 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-semibold rounded-xl transition-all cursor-pointer"
                title="Export Kas ke Excel / CSV"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Excel</span>
              </button>
            </div>
          </div>

          {/* Expenses Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Tipe & Tanggal</th>
                    <th className="py-3 px-4">Kategori & Keterangan</th>
                    <th className="py-3 px-4">Ref SPK / Order</th>
                    <th className="py-3 px-4">Dicatat Oleh</th>
                    <th className="py-3 px-4 text-right">Nominal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {expensePagination.paginatedData.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-slate-400">
                        <Banknote className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                        <p className="font-semibold text-slate-600 text-sm">Belum ada catatan transaksi kas</p>
                        <p className="text-xs text-slate-400 mt-0.5">Gunakan tombol "+ Catat Transaksi Kas" untuk membukukan pengeluaran atau pemasukan.</p>
                      </td>
                    </tr>
                  ) : (
                    expensePagination.paginatedData.map((exp) => (
                      <tr key={exp.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4">
                          <span className={'inline-block px-2 py-0.5 rounded-md text-[10px] font-bold ' + (exp.type === 'Pemasukan' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200')}>
                            {exp.type}
                          </span>
                          <div className="text-[11px] text-slate-500 mt-1">{exp.date.split('T')[0]}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-slate-900">{exp.description}</div>
                          <div className="text-[11px] text-slate-500">{exp.category}</div>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-slate-600">
                          {exp.referenceSpkId || '-'}
                        </td>
                        <td className="py-3.5 px-4 text-slate-600">
                          {exp.recordedBy}
                        </td>
                        <td className={'py-3.5 px-4 text-right font-bold ' + (exp.type === 'Pemasukan' ? 'text-emerald-600' : 'text-rose-600')}>
                          {exp.type === 'Pemasukan' ? '+' : '-'}{formatRupiah(exp.amount)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {filteredExpenses.length > 0 && (
              <div className="p-3 border-t border-slate-100">
                <RetailPagination
                  currentPage={expensePagination.currentPage}
                  totalPages={expensePagination.totalPages}
                  pageSize={expensePagination.pageSize}
                  totalItems={filteredExpenses.length}
                  startIndex={expensePagination.startIndex}
                  endIndex={expensePagination.endIndex}
                  onPageChange={expensePagination.setCurrentPage}
                  onPageSizeChange={expensePagination.setPageSize}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: ARUS KAS & LABA RUGI (CASHFLOW & PNL)                              */}
      {/* ========================================================================= */}
      {activeTab === 'summary' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          {/* Real-time Profit & Loss Bento Cards */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Statement</span>
                <h3 className="text-sm font-bold text-slate-900 flex items-center mt-0.5">
                  <BarChart3 className="w-4 h-4 mr-1.5 text-blue-600" /> Ringkasan Laba Rugi Operasional Riil
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-200">
                  Margin Kotor: {profitMargin}%
                </span>
                <button
                  onClick={handlePrintPnl}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition-all cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Cetak Laporan PDF</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mb-1">Total Penerimaan Kas</p>
                <p className="text-sm font-bold text-slate-900">{formatRupiah(actualRevenue)}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mb-1">HPP Material & Sparepart</p>
                <p className="text-sm font-bold text-rose-600">-{formatRupiah(actualPartsCost)}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mb-1">Komisi & Beban Operasional</p>
                <p className="text-sm font-bold text-rose-600">-{formatRupiah(actualTechCommission + actualOtherExpenses)}</p>
              </div>
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 shadow-sm">
                <p className="text-[10px] text-emerald-800 font-semibold uppercase tracking-wider mb-1">Laba Operasional Bersih</p>
                <p className="text-sm font-bold text-emerald-700">{actualNetProfit >= 0 ? '+' : ''}{formatRupiah(actualNetProfit)}</p>
              </div>
            </div>
          </div>

          {/* Detailed Financial Breakdown Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Struktur Arus Kas & Posisi Finansial</h4>
            
            <table className="w-full text-xs text-left">
              <tbody className="divide-y divide-slate-100 text-slate-700">
                <tr className="bg-slate-50/60 font-semibold">
                  <td className="py-2.5 px-3 text-slate-900">A. PENDAPATAN OPERASIONAL MASUK</td>
                  <td className="py-2.5 px-3 text-right text-emerald-700 font-bold">+{formatRupiah(actualRevenue)}</td>
                </tr>
                <tr>
                  <td className="py-2 px-6 text-slate-600">• Pendapatan Bersih dari Jasa & SPK Lunas</td>
                  <td className="py-2 px-3 text-right text-slate-900">+{formatRupiah(actualRevenue * 0.65)}</td>
                </tr>
                <tr>
                  <td className="py-2 px-6 text-slate-600">• Penjualan Suku Cadang & Material</td>
                  <td className="py-2 px-3 text-right text-slate-900">+{formatRupiah(actualRevenue * 0.35)}</td>
                </tr>

                <tr className="bg-slate-50/60 font-semibold">
                  <td className="py-2.5 px-3 text-slate-900">B. BIAYA POKOK PENDAPATAN & OPERASIONAL (BEBAN)</td>
                  <td className="py-2.5 px-3 text-right text-rose-700 font-bold">-{formatRupiah(actualPartsCost + actualTechCommission + actualOtherExpenses)}</td>
                </tr>
                <tr>
                  <td className="py-2 px-6 text-slate-600">• Belanja Suku Cadang / Material</td>
                  <td className="py-2 px-3 text-right text-rose-600">-{formatRupiah(actualPartsCost)}</td>
                </tr>
                <tr>
                  <td className="py-2 px-6 text-slate-600">• Bagi Hasil / Komisi Upah Teknisi</td>
                  <td className="py-2 px-3 text-right text-rose-600">-{formatRupiah(actualTechCommission)}</td>
                </tr>
                <tr>
                  <td className="py-2 px-6 text-slate-600">• Biaya Transportasi & Operasional Kantor</td>
                  <td className="py-2 px-3 text-right text-rose-600">-{formatRupiah(actualOtherExpenses)}</td>
                </tr>

                <tr className="bg-emerald-50/50 font-bold border-t-2 border-slate-300">
                  <td className="py-3 px-3 text-emerald-950 font-extrabold text-sm">LABA OPERASIONAL BERSIH (NET PROFIT)</td>
                  <td className="py-3 px-3 text-right text-emerald-700 font-extrabold text-sm">
                    {actualNetProfit >= 0 ? '+' : ''}{formatRupiah(actualNetProfit)} ({profitMargin}%)
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: HUTANG USAHA SUPPLIER (ACCOUNTS PAYABLE / AP) - PRO MODE           */}
      {/* ========================================================================= */}
      {activeTab === 'payables' && accountingMode === 'advanced' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          {/* Payables Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-1">Total Hutang Berjalan (AP)</p>
                <h4 className="text-lg font-bold text-rose-600">{formatRupiah(totalPayables)}</h4>
                <div className="flex items-center gap-1 mt-1 text-[10px] font-semibold text-amber-600">
                  <Clock className="w-3 h-3" />
                  <span>Kewajiban ke Vendor / Supplier</span>
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center border border-rose-100">
                <Package className="w-5 h-5 text-rose-600" />
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-1">Hutang Terbayar</p>
                <h4 className="text-lg font-bold text-emerald-600">{formatRupiah(totalPaidPayables)}</h4>
                <div className="flex items-center gap-1 mt-1 text-[10px] font-semibold text-emerald-600">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Pelunasan Suku Cadang & Bahan</span>
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center border border-emerald-100">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-1">Faktur Supplier Terdaftar</p>
                <h4 className="text-lg font-bold text-slate-900">{payables.length} Faktur</h4>
                <div className="flex items-center gap-1 mt-1 text-[10px] font-semibold text-purple-600">
                  <FileSpreadsheet className="w-3 h-3" />
                  <span>Pengadaan Tempo & Konsinyasi</span>
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center border border-purple-100">
                <Building2 className="w-5 h-5 text-purple-600" />
              </div>
            </div>
          </div>

          {/* Payable Controls */}
          <div className="flex flex-wrap gap-3 justify-between items-center bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex flex-1 w-full sm:w-auto items-center gap-3 flex-wrap">
              <div className="relative flex-1 sm:max-w-xs">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari Supplier, No Faktur, atau ID..."
                  value={payableSearch}
                  onChange={e => setPayableSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-purple-600/20 focus:border-purple-600 transition-all outline-none"
                />
              </div>
              
              <div className="relative">
                <Filter className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <select
                  value={payableStatusFilter}
                  onChange={e => setPayableStatusFilter(e.target.value as any)}
                  className="pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-purple-600/20 focus:border-purple-600 outline-none appearance-none cursor-pointer"
                >
                  <option value="Semua">Semua Status Hutang</option>
                  <option value="Belum Dibayar">Belum Dibayar</option>
                  <option value="Dibayar Sebagian">Dibayar Sebagian</option>
                  <option value="Lunas">Lunas</option>
                  <option value="Jatuh Tempo">Jatuh Tempo</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowAddPayable(true)}
                className="flex items-center gap-1.5 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Catat Hutang Supplier</span>
              </button>

              <button
                onClick={handlePrintPayables}
                className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl shadow-xs transition-all cursor-pointer"
                title="Cetak Laporan Hutang Supplier PDF"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Cetak PDF</span>
              </button>

              <button
                onClick={handleExportPayables}
                className="flex items-center gap-1.5 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-semibold rounded-xl transition-all cursor-pointer"
                title="Export Hutang Supplier ke Excel / CSV"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Excel</span>
              </button>
            </div>
          </div>

          {/* Payables Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">ID & No Faktur</th>
                    <th className="py-3 px-4">Supplier / Vendor</th>
                    <th className="py-3 px-4">Jatuh Tempo</th>
                    <th className="py-3 px-4 text-right">Total Kewajiban</th>
                    <th className="py-3 px-4 text-right">Sudah Dibayar</th>
                    <th className="py-3 px-4 text-right">Sisa Hutang</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-center">Aksi Bayar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {payablesPagination.paginatedData.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-400">
                        <Package className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                        <p className="font-semibold text-slate-600 text-sm">Belum ada catatan hutang supplier</p>
                        <p className="text-xs text-slate-400 mt-0.5">Gunakan tombol "+ Catat Hutang Supplier" saat melakukan pembelian sparepart / material secara tempo.</p>
                      </td>
                    </tr>
                  ) : (
                    payablesPagination.paginatedData.map((payable) => {
                      const remaining = Math.max(0, payable.totalAmount - (payable.paidAmount || 0));
                      return (
                        <tr key={payable.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-slate-900">{payable.id}</div>
                            <div className="text-[11px] text-slate-500">{payable.invoiceNumber}</div>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="font-semibold text-slate-900">{payable.supplierName}</div>
                            <div className="text-[11px] text-slate-500">{payable.category}</div>
                          </td>
                          <td className="py-3.5 px-4 text-slate-600">
                            {payable.dueDate}
                          </td>
                          <td className="py-3.5 px-4 text-right font-bold text-slate-900">
                            {formatRupiah(payable.totalAmount)}
                          </td>
                          <td className="py-3.5 px-4 text-right text-emerald-600 font-semibold">
                            {formatRupiah(payable.paidAmount || 0)}
                          </td>
                          <td className="py-3.5 px-4 text-right font-bold text-rose-600">
                            {formatRupiah(remaining)}
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <span className={'inline-block text-[11px] font-bold px-2.5 py-1 rounded-lg border ' + getPayableBadgeColor(payable.status)}>
                              {payable.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            {remaining > 0 ? (
                              <button
                                onClick={() => {
                                  const amtStr = prompt('Masukkan nominal pembayaran untuk ' + payable.supplierName + ' (Sisa: ' + formatRupiah(remaining) + '):', String(remaining));
                                  if (amtStr) {
                                    const val = Number(amtStr);
                                    if (val > 0) handlePayPayable(payable.id, val);
                                  }
                                }}
                                className="px-2.5 py-1 bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold border border-purple-200 rounded-lg transition-all cursor-pointer text-[11px]"
                              >
                                Bayar Hutang
                              </button>
                            ) : (
                              <span className="text-emerald-600 font-bold flex items-center justify-center gap-1 text-[11px]">
                                <Check className="w-3.5 h-3.5" /> Lunas
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {filteredPayables.length > 0 && (
              <div className="p-3 border-t border-slate-100">
                <RetailPagination
                  currentPage={payablesPagination.currentPage}
                  totalPages={payablesPagination.totalPages}
                  pageSize={payablesPagination.pageSize}
                  totalItems={filteredPayables.length}
                  startIndex={payablesPagination.startIndex}
                  endIndex={payablesPagination.endIndex}
                  onPageChange={payablesPagination.setCurrentPage}
                  onPageSizeChange={payablesPagination.setPageSize}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: MULTI KAS & REKENING BANK - PRO MODE                               */}
      {/* ========================================================================= */}
      {activeTab === 'accounts' && accountingMode === 'advanced' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          {/* Header Action */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Rekening Bank & Kas Likuid</h3>
              <p className="text-xs text-slate-500">Kelola posisi likuiditas antar rekening kasir tunai, bank giro/transfer, dan settlement QRIS</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowTransferModal(true)}
                className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer border border-slate-200"
              >
                <ArrowRightLeft className="w-3.5 h-3.5 text-blue-600" />
                <span>Transfer Antar Kas / Bank</span>
              </button>
              <button
                onClick={() => setShowAddAccount(true)}
                className="flex items-center gap-1.5 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Tambah Akun Bank / Kas</span>
              </button>
            </div>
          </div>

          {/* Account Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {accounts.map(acc => (
              <div key={acc.id} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between relative overflow-hidden group hover:border-purple-300 transition-all">
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-slate-100 text-slate-700">
                    {acc.type}
                  </span>
                  <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center border border-purple-100">
                    <Building2 className="w-4 h-4 text-purple-600" />
                  </div>
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{acc.name}</h4>
                  <p className="text-[11px] text-slate-500 font-mono mt-0.5">{acc.accountNumber || 'Kas Fisik Workshop'}</p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100">
                  <p className="text-[10px] text-slate-400 uppercase font-semibold">Saldo Likuid Aktif</p>
                  <p className="text-base font-extrabold text-slate-900 mt-0.5">{formatRupiah(acc.balance)}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Summary Box */}
          <div className="bg-purple-50/50 border border-purple-200 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0">
                <Scale className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-purple-900">Total Likuiditas Seluruh Akun Kas & Bank</p>
                <p className="text-xs text-purple-700">Dana siap pakai untuk operasional, pengadaan sparepart, dan pelunasan kewajiban supplier</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-purple-700 font-semibold uppercase">Total Saldo Likuid</p>
              <h3 className="text-xl font-extrabold text-purple-900">{formatRupiah(totalLiquidCash)}</h3>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 6: LAPORAN NERACA KEUANGAN (BALANCE SHEET SAK EMKM) - PRO MODE        */}
      {/* ========================================================================= */}
      {activeTab === 'balance_sheet' && accountingMode === 'advanced' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          {/* Header Action */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Standar SAK EMKM</span>
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5 mt-0.5">
                <Scale className="w-4 h-4 text-purple-600" />
                <span>Laporan Posisi Keuangan (Neraca Saldo)</span>
              </h3>
              <p className="text-xs text-slate-500">Keseimbangan Aset (Aktiva) dengan Kewajiban & Ekuitas Pemilik (Pasiva)</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Neraca Seimbang (Balanced)</span>
              </span>
              <button
                onClick={handlePrintBalanceSheet}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition-all cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Cetak Neraca PDF</span>
              </button>
            </div>
          </div>

          {/* Dual-Column SAK EMKM Balance Sheet */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* LEFT COLUMN: ASET / AKTIVA */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h4 className="font-extrabold text-slate-900 text-sm uppercase tracking-wider flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-blue-600" />
                  <span>I. ASET (AKTIVA)</span>
                </h4>
                <span className="text-xs font-bold text-blue-700">{formatRupiah(totalAssets)}</span>
              </div>

              {/* Aset Lancar */}
              <div>
                <p className="text-xs font-bold text-slate-800 mb-2">A. Aset Lancar</p>
                <table className="w-full text-xs">
                  <tbody className="divide-y divide-slate-100 text-slate-600">
                    <tr>
                      <td className="py-2 pl-3">1. Kas & Setara Kas (Multi Bank)</td>
                      <td className="py-2 text-right font-semibold text-slate-900">{formatRupiah(totalLiquidCash)}</td>
                    </tr>
                    <tr>
                      <td className="py-2 pl-3">2. Piutang Usaha Konsumen (AR)</td>
                      <td className="py-2 text-right font-semibold text-slate-900">{formatRupiah(totalReceivables)}</td>
                    </tr>
                    <tr>
                      <td className="py-2 pl-3">3. Persediaan Suku Cadang & Bahan Gudang</td>
                      <td className="py-2 text-right font-semibold text-slate-900">{formatRupiah(totalInventoryAsset)}</td>
                    </tr>
                    <tr className="bg-slate-50 font-bold text-slate-900">
                      <td className="py-2 px-3">Total Aset Lancar</td>
                      <td className="py-2 px-3 text-right">{formatRupiah(totalCurrentAssets)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Aset Tetap */}
              <div className="pt-2">
                <p className="text-xs font-bold text-slate-800 mb-2">B. Aset Tetap & Peralatan Usaha</p>
                <table className="w-full text-xs">
                  <tbody className="divide-y divide-slate-100 text-slate-600">
                    <tr>
                      <td className="py-2 pl-3">1. Peralatan Servis & Mesin Workshop</td>
                      <td className="py-2 text-right font-semibold text-slate-900">{formatRupiah(totalFixedAssets)}</td>
                    </tr>
                    <tr>
                      <td className="py-2 pl-3">2. Akumulasi Penyusutan Peralatan</td>
                      <td className="py-2 text-right font-semibold text-rose-600">-{formatRupiah(accumulatedDepreciation)}</td>
                    </tr>
                    <tr className="bg-slate-50 font-bold text-slate-900">
                      <td className="py-2 px-3">Nilai Buku Aset Tetap</td>
                      <td className="py-2 px-3 text-right">{formatRupiah(netFixedAssets)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Total Aset */}
              <div className="pt-3 border-t-2 border-slate-900 flex justify-between items-center text-sm font-extrabold text-slate-900 bg-blue-50/50 p-3 rounded-xl">
                <span>TOTAL ASET (AKTIVA)</span>
                <span className="text-blue-700">{formatRupiah(totalAssets)}</span>
              </div>
            </div>

            {/* RIGHT COLUMN: KEWAJIBAN & EKUITAS / PASIVA */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h4 className="font-extrabold text-slate-900 text-sm uppercase tracking-wider flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-purple-600" />
                  <span>II. KEWAJIBAN & EKUITAS (PASIVA)</span>
                </h4>
                <span className="text-xs font-bold text-purple-700">{formatRupiah(totalLiabilities + ownerEquity)}</span>
              </div>

              {/* Kewajiban / Hutang */}
              <div>
                <p className="text-xs font-bold text-slate-800 mb-2">A. Kewajiban Jangka Pendek (Hutang)</p>
                <table className="w-full text-xs">
                  <tbody className="divide-y divide-slate-100 text-slate-600">
                    <tr>
                      <td className="py-2 pl-3">1. Hutang Usaha Supplier & Vendor (AP)</td>
                      <td className="py-2 text-right font-semibold text-slate-900">{formatRupiah(totalPayables)}</td>
                    </tr>
                    <tr>
                      <td className="py-2 pl-3">2. Beban Akrual & Hutang Pajak/Lainnya</td>
                      <td className="py-2 text-right font-semibold text-slate-900">Rp0</td>
                    </tr>
                    <tr className="bg-slate-50 font-bold text-slate-900">
                      <td className="py-2 px-3">Total Kewajiban</td>
                      <td className="py-2 px-3 text-right text-rose-600">{formatRupiah(totalLiabilities)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Ekuitas / Modal */}
              <div className="pt-2">
                <p className="text-xs font-bold text-slate-800 mb-2">B. Ekuitas & Modal Pemilik</p>
                <table className="w-full text-xs">
                  <tbody className="divide-y divide-slate-100 text-slate-600">
                    <tr>
                      <td className="py-2 pl-3">1. Modal Disetor / Ekuitas Awal</td>
                      <td className="py-2 text-right font-semibold text-slate-900">{formatRupiah(ownerEquity - actualNetProfit)}</td>
                    </tr>
                    <tr>
                      <td className="py-2 pl-3">2. Laba Bersih Tahun Berjalan</td>
                      <td className="py-2 text-right font-semibold text-emerald-600">{actualNetProfit >= 0 ? '+' : ''}{formatRupiah(actualNetProfit)}</td>
                    </tr>
                    <tr className="bg-slate-50 font-bold text-slate-900">
                      <td className="py-2 px-3">Total Ekuitas Bersih</td>
                      <td className="py-2 px-3 text-right">{formatRupiah(ownerEquity)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Total Pasiva */}
              <div className="pt-3 border-t-2 border-slate-900 flex justify-between items-center text-sm font-extrabold text-slate-900 bg-purple-50/50 p-3 rounded-xl">
                <span>TOTAL KEWAJIBAN & EKUITAS</span>
                <span className="text-purple-700">{formatRupiah(totalLiabilities + ownerEquity)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 7: JURNAL UMUM OTOMATIS (GENERAL JOURNAL) - PRO MODE                  */}
      {/* ========================================================================= */}
      {activeTab === 'journal' && accountingMode === 'advanced' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          {/* Header Action */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Double-Entry Bookkeeping</span>
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5 mt-0.5">
                <BookOpen className="w-4 h-4 text-purple-600" />
                <span>Buku Jurnal Umum Otomatis</span>
              </h3>
              <p className="text-xs text-slate-500">Pencatatan debit-kredit otomatis dari setiap transaksi faktur, buku kas, dan hutang supplier</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrintJournal}
                className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl shadow-xs transition-all cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Cetak Jurnal PDF</span>
              </button>

              <button
                onClick={handleExportJournal}
                className="flex items-center gap-1.5 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-semibold rounded-xl transition-all cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Excel</span>
              </button>
            </div>
          </div>

          {/* Search bar */}
          <div className="relative max-w-sm">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari transaksi jurnal, akun, atau nomor ref..."
              value={journalSearch}
              onChange={e => setJournalSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-purple-600/20 focus:border-purple-600 outline-none"
            />
          </div>

          {/* Journal Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">No. Jurnal & Tanggal</th>
                    <th className="py-3 px-4">No. Ref</th>
                    <th className="py-3 px-4">Keterangan Transaksi</th>
                    <th className="py-3 px-4">Akun Debit (+)</th>
                    <th className="py-3 px-4">Akun Kredit (-)</th>
                    <th className="py-3 px-4 text-right">Nominal (Rp)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {journalPagination.paginatedData.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400">
                        <BookOpen className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                        <p className="font-semibold text-slate-600 text-sm">Belum ada catatan jurnal</p>
                        <p className="text-xs text-slate-400 mt-0.5">Jurnal akan terisi secara otomatis ketika ada transaksi faktur atau buku kas.</p>
                      </td>
                    </tr>
                  ) : (
                    journalPagination.paginatedData.map(entry => (
                      <tr key={entry.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4 font-mono">
                          <span className="font-bold text-slate-900">{entry.id}</span>
                          <div className="text-[10px] text-slate-400">{entry.date}</div>
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-600">
                          {entry.referenceNumber}
                        </td>
                        <td className="py-3 px-4 font-medium text-slate-900">
                          {entry.description}
                        </td>
                        <td className="py-3 px-4 font-semibold text-blue-700">
                          {entry.debitAccount}
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-600">
                          {entry.creditAccount}
                        </td>
                        <td className="py-3 px-4 text-right font-extrabold text-slate-900">
                          {formatRupiah(entry.amount)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
                {filteredJournal.length > 0 && (
                  <tfoot className="bg-slate-50 font-bold border-t border-slate-200">
                    <tr>
                      <td colSpan={5} className="py-3 px-4 text-slate-700">Total Akumulasi Debit & Kredit Jurnal</td>
                      <td className="py-3 px-4 text-right text-purple-700 font-extrabold">{formatRupiah(totalDebitJournal)}</td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>

            {filteredJournal.length > 0 && (
              <div className="p-3 border-t border-slate-100">
                <RetailPagination
                  currentPage={journalPagination.currentPage}
                  totalPages={journalPagination.totalPages}
                  pageSize={journalPagination.pageSize}
                  totalItems={filteredJournal.length}
                  startIndex={journalPagination.startIndex}
                  endIndex={journalPagination.endIndex}
                  onPageChange={journalPagination.setCurrentPage}
                  onPageSizeChange={journalPagination.setPageSize}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: + CATAT TRANSAKSI KAS                                            */}
      {/* ========================================================================= */}
      {showAddExpense && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center border border-blue-100">
                  <Banknote className="w-4 h-4 text-blue-600" />
                </div>
                <h3 className="font-bold text-slate-900 text-sm">Catat Transaksi Kas Baru</h3>
              </div>
              <button 
                onClick={() => setShowAddExpense(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateExpenseSubmit} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tipe Transaksi</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewExpense({ ...newExpense, type: 'Pengeluaran' })}
                    className={'py-2 text-center rounded-xl font-bold border transition-all cursor-pointer ' + (newExpense.type === 'Pengeluaran' ? 'bg-rose-50 border-rose-300 text-rose-700' : 'bg-slate-50 border-slate-200 text-slate-600')}
                  >
                    Pengeluaran (Kas Keluar)
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewExpense({ ...newExpense, type: 'Pemasukan' })}
                    className={'py-2 text-center rounded-xl font-bold border transition-all cursor-pointer ' + (newExpense.type === 'Pemasukan' ? 'bg-emerald-50 border-emerald-300 text-emerald-700' : 'bg-slate-50 border-slate-200 text-slate-600')}
                  >
                    Pemasukan (Kas Masuk)
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tanggal Transaksi</label>
                <input
                  type="date"
                  required
                  value={newExpense.date}
                  onChange={e => setNewExpense({ ...newExpense, date: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-600/20"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Kategori Pengeluaran</label>
                <select
                  value={newExpense.category}
                  onChange={e => setNewExpense({ ...newExpense, category: e.target.value as ExpenseCategory })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-600/20 cursor-pointer"
                >
                  {EXPENSE_CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Deskripsi / Keterangan</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Pembelian Baut & Seal, Gaji Teknisi..."
                  value={newExpense.description}
                  onChange={e => setNewExpense({ ...newExpense, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-600/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nominal (Rp)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="0"
                    value={newExpense.amount || ''}
                    onChange={e => setNewExpense({ ...newExpense, amount: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-blue-600/20"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Ref No. SPK (Opsional)</label>
                  <input
                    type="text"
                    placeholder="SPK-..."
                    value={newExpense.referenceSpkId}
                    onChange={e => setNewExpense({ ...newExpense, referenceSpkId: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-600/20"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddExpense(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 font-semibold rounded-xl hover:bg-slate-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs transition-all cursor-pointer"
                >
                  Simpan Transaksi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: + CATAT HUTANG SUPPLIER (AP)                                     */}
      {/* ========================================================================= */}
      {showAddPayable && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center border border-purple-100">
                  <Package className="w-4 h-4 text-purple-600" />
                </div>
                <h3 className="font-bold text-slate-900 text-sm">Catat Hutang Supplier (AP)</h3>
              </div>
              <button 
                onClick={() => setShowAddPayable(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreatePayableSubmit} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama Supplier / Vendor</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: PT Mega Auto Parts"
                  value={newPayable.supplierName}
                  onChange={e => setNewPayable({ ...newPayable, supplierName: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-purple-600/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">No. Faktur Vendor</label>
                  <input
                    type="text"
                    required
                    placeholder="INV-SPL/2026/001"
                    value={newPayable.invoiceNumber}
                    onChange={e => setNewPayable({ ...newPayable, invoiceNumber: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-purple-600/20"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Kategori Pengadaan</label>
                  <select
                    value={newPayable.category}
                    onChange={e => setNewPayable({ ...newPayable, category: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-purple-600/20 cursor-pointer"
                  >
                    <option value="Belanja Suku Cadang">Belanja Suku Cadang</option>
                    <option value="Material & Bahan Baku">Material & Bahan Baku</option>
                    <option value="Peralatan Kerja">Peralatan Kerja</option>
                    <option value="Subkontraktor / Jasa Luar">Subkontraktor / Jasa Luar</option>
                    <option value="Lain-lain">Lain-lain</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tanggal Faktur</label>
                  <input
                    type="date"
                    required
                    value={newPayable.issueDate}
                    onChange={e => setNewPayable({ ...newPayable, issueDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-purple-600/20"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Jatuh Tempo Pembayaran</label>
                  <input
                    type="date"
                    required
                    value={newPayable.dueDate}
                    onChange={e => setNewPayable({ ...newPayable, dueDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-purple-600/20"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Total Tagihan Hutang (Rp)</label>
                <input
                  type="number"
                  required
                  min="1"
                  placeholder="0"
                  value={newPayable.totalAmount || ''}
                  onChange={e => setNewPayable({ ...newPayable, totalAmount: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-purple-600/20"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Catatan / Keterangan Tempo</label>
                <input
                  type="text"
                  placeholder="Contoh: Pembelian tempo 30 hari via transfer BCA"
                  value={newPayable.notes}
                  onChange={e => setNewPayable({ ...newPayable, notes: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-purple-600/20"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddPayable(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 font-semibold rounded-xl hover:bg-slate-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-xs transition-all cursor-pointer"
                >
                  Simpan Hutang Supplier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: + TAMBAH AKUN KAS / BANK                                         */}
      {/* ========================================================================= */}
      {showAddAccount && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center border border-purple-100">
                  <Building2 className="w-4 h-4 text-purple-600" />
                </div>
                <h3 className="font-bold text-slate-900 text-sm">Tambah Akun Kas / Bank Baru</h3>
              </div>
              <button 
                onClick={() => setShowAddAccount(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddAccountSubmit} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama Akun / Bank</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Rekening Bank BNI, Kas Kasir 2"
                  value={newAccount.name}
                  onChange={e => setNewAccount({ ...newAccount, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-purple-600/20"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Jenis Akun</label>
                <select
                  value={newAccount.type}
                  onChange={e => setNewAccount({ ...newAccount, type: e.target.value as any })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-purple-600/20 cursor-pointer"
                >
                  <option value="Rekening Bank">Rekening Bank</option>
                  <option value="Kas Tunai">Kas Tunai (Fisik Laci)</option>
                  <option value="E-Wallet / QRIS">E-Wallet / QRIS Settlement</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nomor Rekening / Merchant ID (Opsional)</label>
                <input
                  type="text"
                  placeholder="08192837492..."
                  value={newAccount.accountNumber}
                  onChange={e => setNewAccount({ ...newAccount, accountNumber: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-purple-600/20"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Saldo Awal (Rp)</label>
                <input
                  type="number"
                  min="0"
                  placeholder="0"
                  value={newAccount.balance || ''}
                  onChange={e => setNewAccount({ ...newAccount, balance: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-purple-600/20"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddAccount(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 font-semibold rounded-xl hover:bg-slate-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-xs transition-all cursor-pointer"
                >
                  Simpan Akun
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: TRANSFER ANTAR KAS / BANK                                        */}
      {/* ========================================================================= */}
      {showTransferModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center border border-blue-100">
                  <ArrowRightLeft className="w-4 h-4 text-blue-600" />
                </div>
                <h3 className="font-bold text-slate-900 text-sm">Transfer Antar Akun Kas / Bank</h3>
              </div>
              <button 
                onClick={() => setShowTransferModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleTransferSubmit} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Dari Akun Sumber</label>
                <select
                  required
                  value={transferData.fromAccountId}
                  onChange={e => setTransferData({ ...transferData, fromAccountId: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-600/20 cursor-pointer"
                >
                  <option value="">Pilih Akun Sumber</option>
                  {accounts.map(acc => (
                    <option key={acc.id} value={acc.id}>{acc.name} (Saldo: {formatRupiah(acc.balance)})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Ke Akun Tujuan</label>
                <select
                  required
                  value={transferData.toAccountId}
                  onChange={e => setTransferData({ ...transferData, toAccountId: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-600/20 cursor-pointer"
                >
                  <option value="">Pilih Akun Tujuan</option>
                  {accounts.filter(acc => acc.id !== transferData.fromAccountId).map(acc => (
                    <option key={acc.id} value={acc.id}>{acc.name} (Saldo: {formatRupiah(acc.balance)})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nominal Transfer (Rp)</label>
                <input
                  type="number"
                  required
                  min="1"
                  placeholder="0"
                  value={transferData.amount || ''}
                  onChange={e => setTransferData({ ...transferData, amount: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-blue-600/20"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Catatan Mutasi</label>
                <input
                  type="text"
                  placeholder="Contoh: Setor tunai omzet kasir laci ke Bank BCA"
                  value={transferData.notes}
                  onChange={e => setTransferData({ ...transferData, notes: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-600/20"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowTransferModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 font-semibold rounded-xl hover:bg-slate-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs transition-all cursor-pointer"
                >
                  Proses Transfer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PRINT-ONLY SECTION (HIDDEN)                                               */}
      {/* ========================================================================= */}
      <div style={{ display: 'none' }}>
        {/* Print Invoices */}
        <div ref={invoicePrintRef} className="print-only" style={{ padding: 0, fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif", color: '#000000' }}>
          <JasaPrintHeader
            user={user}
            title="Laporan Register Tagihan & Piutang Jasa"
            subtitle="Rekapitulasi Faktur Tagihan SPK, Pembayaran Diterima & Sisa Piutang Berjalan"
            periodText={'Status: ' + (invoiceStatusFilter === 'Semua' ? 'Semua Status Tagihan' : invoiceStatusFilter)}
          />
          <div style={{ marginBottom: 20 }}>
            <JasaPrintSectionHeader title="I. Ringkasan Posisi Piutang Usaha" />
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11, color: '#000000' }}>
              <tbody>
                <tr style={{ borderBottom: '1px solid #E5E7EB' }}>
                  <td style={{ padding: '5px 4px' }}>Total Tagihan Diterbitkan</td>
                  <td style={{ padding: '5px 4px', textAlign: 'right', fontWeight: 600 }}>+{formatRp(totalInvoiced)}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #E5E7EB' }}>
                  <td style={{ padding: '5px 4px' }}>Pembayaran Diterima (Lunas)</td>
                  <td style={{ padding: '5px 4px', textAlign: 'right', color: '#059669', fontWeight: 600 }}>+{formatRp(totalRevenueLunas)}</td>
                </tr>
                <tr style={{ borderTop: '1.5px solid #000000', borderBottom: '3px double #000000', fontWeight: 600 }}>
                  <td style={{ padding: '7px 4px' }}>SISA PIUTANG BELUM TERTAGIH</td>
                  <td style={{ padding: '7px 4px', textAlign: 'right', color: '#DC2626', fontWeight: 700 }}>+{formatRp(totalReceivables)}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <JasaPrintFooter user={user} />
        </div>

        {/* Print Expenses */}
        <div ref={expensePrintRef} className="print-only" style={{ padding: 0, fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif", color: '#000000' }}>
          <JasaPrintHeader
            user={user}
            title="Laporan Buku Kas & Pengeluaran Operasional"
            subtitle="Rekapitulasi Mutasi Kas Masuk, Pembelian Sparepart, Upah & Beban Operasional"
            periodText={'Kategori: ' + (expenseCategoryFilter === 'Semua' ? 'Semua Kategori' : expenseCategoryFilter)}
          />
          <div style={{ marginBottom: 20 }}>
            <JasaPrintSectionHeader title="I. Ringkasan Saldo Buku Kas" />
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11, color: '#000000' }}>
              <tbody>
                <tr style={{ borderBottom: '1px solid #E5E7EB' }}>
                  <td style={{ padding: '5px 4px' }}>Total Kas Masuk (Inflow)</td>
                  <td style={{ padding: '5px 4px', textAlign: 'right', color: '#059669', fontWeight: 600 }}>+{formatRp(totalPemasukanKas)}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #E5E7EB' }}>
                  <td style={{ padding: '5px 4px' }}>Total Kas Keluar (Outflow)</td>
                  <td style={{ padding: '5px 4px', textAlign: 'right', color: '#DC2626', fontWeight: 600 }}>-{formatRp(totalPengeluaranKas)}</td>
                </tr>
                <tr style={{ borderTop: '1.5px solid #000000', borderBottom: '3px double #000000', fontWeight: 600 }}>
                  <td style={{ padding: '7px 4px' }}>SALDO KAS BERSIH BERJALAN</td>
                  <td style={{ padding: '7px 4px', textAlign: 'right', fontWeight: 700 }}>{formatRp(saldoKasBersih)}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <JasaPrintFooter user={user} />
        </div>

        {/* Print P&L */}
        <div ref={pnlPrintRef} className="print-only" style={{ padding: 0, fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif", color: '#000000' }}>
          <JasaPrintHeader
            user={user}
            title="Laporan Kinerja, Pendapatan & Laba Rugi Jasa"
            subtitle="Rekapitulasi Omzet Servis, Penjualan Material, Beban Operasional & Utilisasi Tim"
            periodText="Kuartal Berjalan — Tahun Buku 2026"
          />
          <div style={{ marginBottom: 20 }}>
            <JasaPrintSectionHeader title="I. Posisi Keuangan & Profitabilitas Jasa" />
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11, color: '#000000' }}>
              <tbody>
                <tr style={{ borderBottom: '1px solid #000000' }}>
                  <td colSpan={2} style={{ padding: '6px 4px', fontWeight: 600 }}>A. PENDAPATAN OPERASIONAL JASA (REVENUE)</td>
                  <td style={{ padding: '6px 4px', textAlign: 'right', fontWeight: 600 }}>+{formatRp(actualRevenue)}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #000000' }}>
                  <td colSpan={2} style={{ padding: '6px 4px', fontWeight: 600 }}>B. HARGA POKOK & BEBAN OPERASIONAL (EXPENSES)</td>
                  <td style={{ padding: '6px 4px', textAlign: 'right', color: '#DC2626', fontWeight: 600 }}>-{formatRp(actualPartsCost + actualTechCommission + actualOtherExpenses)}</td>
                </tr>
                <tr style={{ borderTop: '1.5px solid #000000', borderBottom: '3px double #000000', fontWeight: 700 }}>
                  <td style={{ padding: '7px 4px' }}>LABA OPERASIONAL BERSIH (NET PROFIT)</td>
                  <td style={{ padding: '7px 4px', textAlign: 'center' }}>{profitMargin}%</td>
                  <td style={{ padding: '7px 4px', textAlign: 'right', fontWeight: 700 }}>{actualNetProfit >= 0 ? '+' : ''}{formatRp(actualNetProfit)}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <JasaPrintFooter user={user} />
        </div>

        {/* Print Payables (AP) */}
        <div ref={payablesPrintRef} className="print-only" style={{ padding: 0, fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif", color: '#000000' }}>
          <JasaPrintHeader
            user={user}
            title="Laporan Register Hutang Usaha Supplier (AP)"
            subtitle="Daftar Kewajiban Pembelian Suku Cadang & Bahan Baku Tempo ke Vendor"
            periodText={'Status: ' + (payableStatusFilter === 'Semua' ? 'Semua Status Hutang' : payableStatusFilter)}
          />
          <div style={{ marginBottom: 20 }}>
            <JasaPrintSectionHeader title="I. Ringkasan Posisi Hutang Usaha" />
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11, color: '#000000' }}>
              <tbody>
                <tr style={{ borderBottom: '1px solid #E5E7EB' }}>
                  <td style={{ padding: '5px 4px' }}>Total Hutang Tercatat</td>
                  <td style={{ padding: '5px 4px', textAlign: 'right', fontWeight: 600 }}>+{formatRp(payables.reduce((a, b) => a + b.totalAmount, 0))}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #E5E7EB' }}>
                  <td style={{ padding: '5px 4px' }}>Pelunasan Hutang Terbayar</td>
                  <td style={{ padding: '5px 4px', textAlign: 'right', color: '#059669', fontWeight: 600 }}>+{formatRp(totalPaidPayables)}</td>
                </tr>
                <tr style={{ borderTop: '1.5px solid #000000', borderBottom: '3px double #000000', fontWeight: 600 }}>
                  <td style={{ padding: '7px 4px' }}>SISA KEWAJIBAN HUTANG BERJALAN</td>
                  <td style={{ padding: '7px 4px', textAlign: 'right', color: '#DC2626', fontWeight: 700 }}>+{formatRp(totalPayables)}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <JasaPrintFooter user={user} />
        </div>

        {/* Print Balance Sheet (Neraca SAK EMKM) */}
        <div ref={balanceSheetPrintRef} className="print-only" style={{ padding: 0, fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif", color: '#000000' }}>
          <JasaPrintHeader
            user={user}
            title="Laporan Posisi Keuangan (Neraca SAK EMKM)"
            subtitle="Ringkasan Aset, Kewajiban & Ekuitas Modal Berdasarkan Standar Akuntansi Keuangan EMKM"
            periodText="Per Tanggal — Tahun Buku 2026"
          />
          <div style={{ marginBottom: 20 }}>
            <JasaPrintSectionHeader title="I. Komposisi Aset (Aktiva)" />
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11, color: '#000000' }}>
              <tbody>
                <tr style={{ borderBottom: '1px solid #E5E7EB' }}>
                  <td style={{ padding: '5px 4px' }}>Kas & Rekening Bank (Multi Likuiditas)</td>
                  <td style={{ padding: '5px 4px', textAlign: 'right', fontWeight: 600 }}>{formatRp(totalLiquidCash)}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #E5E7EB' }}>
                  <td style={{ padding: '5px 4px' }}>Piutang Usaha Konsumen (AR)</td>
                  <td style={{ padding: '5px 4px', textAlign: 'right', fontWeight: 600 }}>{formatRp(totalReceivables)}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #E5E7EB' }}>
                  <td style={{ padding: '5px 4px' }}>Persediaan Suku Cadang & Bahan Gudang</td>
                  <td style={{ padding: '5px 4px', textAlign: 'right', fontWeight: 600 }}>{formatRp(totalInventoryAsset)}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #E5E7EB' }}>
                  <td style={{ padding: '5px 4px' }}>Nilai Buku Aset Tetap & Peralatan Usaha</td>
                  <td style={{ padding: '5px 4px', textAlign: 'right', fontWeight: 600 }}>{formatRp(netFixedAssets)}</td>
                </tr>
                <tr style={{ borderTop: '1.5px solid #000000', borderBottom: '3px double #000000', fontWeight: 700 }}>
                  <td style={{ padding: '7px 4px' }}>TOTAL ASET (AKTIVA)</td>
                  <td style={{ padding: '7px 4px', textAlign: 'right', fontWeight: 700 }}>{formatRp(totalAssets)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div style={{ marginBottom: 20 }}>
            <JasaPrintSectionHeader title="II. Kewajiban & Ekuitas Pemilik (Pasiva)" />
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11, color: '#000000' }}>
              <tbody>
                <tr style={{ borderBottom: '1px solid #E5E7EB' }}>
                  <td style={{ padding: '5px 4px' }}>Hutang Usaha Supplier & Vendor (AP)</td>
                  <td style={{ padding: '5px 4px', textAlign: 'right', color: '#DC2626', fontWeight: 600 }}>{formatRp(totalLiabilities)}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #E5E7EB' }}>
                  <td style={{ padding: '5px 4px' }}>Ekuitas Bersih & Modal Pemilik</td>
                  <td style={{ padding: '5px 4px', textAlign: 'right', fontWeight: 600 }}>{formatRp(ownerEquity)}</td>
                </tr>
                <tr style={{ borderTop: '1.5px solid #000000', borderBottom: '3px double #000000', fontWeight: 700 }}>
                  <td style={{ padding: '7px 4px' }}>TOTAL KEWAJIBAN & EKUITAS (PASIVA)</td>
                  <td style={{ padding: '7px 4px', textAlign: 'right', fontWeight: 700 }}>{formatRp(totalLiabilities + ownerEquity)}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <JasaPrintFooter user={user} />
        </div>

        {/* Print Journal */}
        <div ref={journalPrintRef} className="print-only" style={{ padding: 0, fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif", color: '#000000' }}>
          <JasaPrintHeader
            user={user}
            title="Laporan Jurnal Umum Double-Entry Otomatis"
            subtitle="Rekapitulasi Mutasi Buku Jurnal Akuntansi Entri Ganda"
            periodText="Periode Berjalan — Tahun Buku 2026"
          />
          <div style={{ marginBottom: 20 }}>
            <JasaPrintSectionHeader title="I. Daftar Transaksi Jurnal Umum" />
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 10, color: '#000000' }}>
              <thead>
                <tr style={{ borderBottom: '1.5px solid #000000', fontWeight: 700 }}>
                  <th style={{ padding: '5px 4px', textAlign: 'left' }}>No. Jurnal</th>
                  <th style={{ padding: '5px 4px', textAlign: 'left' }}>Tanggal</th>
                  <th style={{ padding: '5px 4px', textAlign: 'left' }}>Keterangan</th>
                  <th style={{ padding: '5px 4px', textAlign: 'left' }}>Akun Debit</th>
                  <th style={{ padding: '5px 4px', textAlign: 'left' }}>Akun Kredit</th>
                  <th style={{ padding: '5px 4px', textAlign: 'right' }}>Nominal (Rp)</th>
                </tr>
              </thead>
              <tbody>
                {journalEntries.map(j => (
                  <tr key={j.id} style={{ borderBottom: '1px solid #E5E7EB' }}>
                    <td style={{ padding: '4px 4px' }}>{j.id}</td>
                    <td style={{ padding: '4px 4px' }}>{j.date}</td>
                    <td style={{ padding: '4px 4px' }}>{j.description}</td>
                    <td style={{ padding: '4px 4px' }}>{j.debitAccount}</td>
                    <td style={{ padding: '4px 4px' }}>{j.creditAccount}</td>
                    <td style={{ padding: '4px 4px', textAlign: 'right', fontWeight: 600 }}>{formatRp(j.amount)}</td>
                  </tr>
                ))}
                <tr style={{ borderTop: '1.5px solid #000000', borderBottom: '3px double #000000', fontWeight: 700 }}>
                  <td colSpan={5} style={{ padding: '6px 4px' }}>TOTAL DEBIT / KREDIT</td>
                  <td style={{ padding: '6px 4px', textAlign: 'right', fontWeight: 700 }}>{formatRp(totalDebitJournal)}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <JasaPrintFooter user={user} />
        </div>
      </div>

    </div>
  );
};
