import React from 'react';

// Re-export everything from lucide-react as the Central Gateway / Proxy
export * from 'lucide-react';

import {
  Pencil,
  Trash2,
  Plus,
  Eye,
  EyeOff,
  Save,
  Check,
  X,
  XCircle,
  Copy,
  RotateCcw,
  ExternalLink,
  History,
  Edit,
  Edit3,
  CheckSquare,
  Minus,
  Play,
  PlayCircle,
  PlusCircle,
  Power,
  ZoomIn,
  ZoomOut,
  Search,
  Filter,
  SlidersHorizontal,
  Sliders,
  RefreshCw,
  Printer,
  Download,
  Upload,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ChevronDown,
  ChevronUp,
  MoreVertical,
  MoreHorizontal,
  ArrowRight,
  ArrowLeft,
  ArrowLeftRight,
  ArrowRightLeft,
  ArrowDownCircle,
  ArrowUpCircle,
  ArrowDownLeft,
  ArrowUpRight,
  ArrowDownRight,
  Grid3X3,
  LayoutGrid,
  ListFilter,
  Table,
  Maximize2,
  Minimize2,
  Split,
  CheckCircle2,
  CheckCircle,
  AlertTriangle,
  AlertCircle,
  CircleAlert,
  Info,
  HelpCircle,
  Bell,
  BellRing,
  ShieldCheck,
  ShieldAlert,
  Lock,
  Unlock,
  Loader2,
  Award,
  BadgeCheck,
  Ban,
  Heart,
  HeartPulse,
  LifeBuoy,
  Star,
  Target,
  Trophy,
  Wallet,
  CreditCard,
  Receipt,
  ShoppingCart,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Coins,
  Banknote,
  BarChart2,
  BarChart3,
  LineChart,
  PieChart,
  Calculator,
  Percent,
  Scale,
  Package,
  PackageOpen,
  PackagePlus,
  PackageCheck,
  PackageX,
  Box,
  Boxes,
  Tag,
  Tags,
  Barcode,
  Scan,
  QrCode,
  Store,
  Truck,
  Warehouse,
  Ruler,
  ClipboardList,
  Factory,
  Shirt,
  ShoppingBag,
  ChefHat,
  Coffee,
  Utensils,
  UtensilsCrossed,
  Flame,
  Wrench,
  Car,
  Scissors,
  ClipboardCheck,
  FlaskConical,
  Fish,
  Droplets,
  Droplet,
  Waves,
  Thermometer,
  CloudRain,
  Sun,
  Wind,
  Sprout,
  Trees,
  Snowflake,
  Users,
  User,
  UserPlus,
  UserCheck,
  Shield,
  Briefcase,
  LogIn,
  LogOut,
  Phone,
  Mail,
  LayoutDashboard,
  Sparkles,
  Bot,
  ServerCog,
  Server,
  Database,
  Settings,
  Building2,
  Building,
  Landmark,
  Home,
  Layers,
  Layout,
  BookOpen,
  FileText,
  FileSpreadsheet,
  FileCheck,
  FileCode,
  FileEdit,
  Folder,
  FolderArchive,
  FolderTree,
  Archive,
  Calendar,
  CalendarCheck,
  CalendarRange,
  Clock,
  MapPin,
  Globe,
  KeyRound,
  Key,
  Cpu,
  Activity,
  HardDrive,
  HardDriveDownload,
  Terminal,
  Code,
  Code2,
  Webhook,
  Link,
  Link2,
  Link2Off,
  Zap,
  Rocket,
  Megaphone,
  Radio,
  Send,
  Inbox,
  MessageSquare,
  MessageCircle,
  Camera,
  Image,
  Ticket,
  Gift,
  BadgePercent,
  Monitor,
  Smartphone,
  Wifi,
  WifiOff,
  Type,
  Hash,
  Palette,
  Quote,
  Binary,
  GitCommit,
  Network,
  Share2,
  Volume2,
  VolumeX,
  Moon,
  Menu,
  AlignLeft,
  Square,
  Bug,
  Lightbulb,
  MousePointerClick,
  Plug,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';

// =============================================================================
// 1. SEMANTIC EXPORTS (SINGLE SOURCE OF TRUTH)
// Gunakan semantic naming ini di seluruh modul & halaman Bizora UMKM
// =============================================================================
export const EditIcon = Pencil;
export const DeleteIcon = Trash2;
export const AddIcon = Plus;
export const ViewIcon = Eye;
export const ViewOffIcon = EyeOff;
export const SaveIcon = Save;
export const CheckIcon = Check;
export const CloseIcon = X;
export const CancelIcon = XCircle;
export const CopyIcon = Copy;
export const ResetIcon = RotateCcw;
export const ExternalLinkIcon = ExternalLink;
export const HistoryIcon = History;
export const EditAltIcon = Edit;
export const EditSquareIcon = Edit3;
export const CheckSquareIcon = CheckSquare;
export const MinusIcon = Minus;
export const PlayIcon = Play;
export const PlayCircleIcon = PlayCircle;
export const PlusCircleIcon = PlusCircle;
export const PowerIcon = Power;
export const ZoomInIcon = ZoomIn;
export const ZoomOutIcon = ZoomOut;
export const SearchIcon = Search;
export const FilterIcon = Filter;
export const SlidersIcon = SlidersHorizontal;
export const SlidersAltIcon = Sliders;
export const RefreshIcon = RefreshCw;
export const PrintIcon = Printer;
export const ExportIcon = Download;
export const ImportIcon = Upload;
export const SortIcon = ArrowUpDown;
export const PrevIcon = ChevronLeft;
export const NextIcon = ChevronRight;
export const FirstPageIcon = ChevronsLeft;
export const LastPageIcon = ChevronsRight;
export const ExpandIcon = ChevronDown;
export const CollapseIcon = ChevronUp;
export const MoreVerticalIcon = MoreVertical;
export const MoreHorizontalIcon = MoreHorizontal;
export const ArrowRightIcon = ArrowRight;
export const ArrowLeftIcon = ArrowLeft;
export const ArrowLeftRightIcon = ArrowLeftRight;
export const ArrowRightLeftIcon = ArrowRightLeft;
export const ArrowDownCircleIcon = ArrowDownCircle;
export const ArrowUpCircleIcon = ArrowUpCircle;
export const ArrowDownLeftIcon = ArrowDownLeft;
export const ArrowUpRightIcon = ArrowUpRight;
export const ArrowDownRightIcon = ArrowDownRight;
export const GridIcon = Grid3X3;
export const LayoutGridIcon = LayoutGrid;
export const ListFilterIcon = ListFilter;
export const TableDataIcon = Table;
export const MaximizeIcon = Maximize2;
export const MinimizeIcon = Minimize2;
export const SplitIcon = Split;
export const SuccessIcon = CheckCircle2;
export const CheckCircleAltIcon = CheckCircle;
export const WarningIcon = AlertTriangle;
export const ErrorIcon = AlertCircle;
export const CircleAlertIcon = CircleAlert;
export const InfoIcon = Info;
export const HelpIcon = HelpCircle;
export const NotificationIcon = Bell;
export const BellRingIcon = BellRing;
export const VerifiedIcon = ShieldCheck;
export const ShieldAlertIcon = ShieldAlert;
export const LockIcon = Lock;
export const UnlockIcon = Unlock;
export const LoadingIcon = Loader2;
export const AwardIcon = Award;
export const BadgeCheckIcon = BadgeCheck;
export const BanIcon = Ban;
export const HeartIcon = Heart;
export const HealthPulseIcon = HeartPulse;
export const SupportLifeBuoyIcon = LifeBuoy;
export const StarIcon = Star;
export const TargetIcon = Target;
export const TrophyIcon = Trophy;
export const CashIcon = Wallet;
export const BillingIcon = CreditCard;
export const ReceiptIcon = Receipt;
export const PosCartIcon = ShoppingCart;
export const ProfitIcon = TrendingUp;
export const ExpenseIcon = TrendingDown;
export const CurrencyIcon = DollarSign;
export const CoinsIcon = Coins;
export const BanknoteIcon = Banknote;
export const BarChartIcon = BarChart2;
export const BarChartAltIcon = BarChart3;
export const LineChartIcon = LineChart;
export const PieChartIcon = PieChart;
export const CalculatorIcon = Calculator;
export const PercentIcon = Percent;
export const BalanceScaleIcon = Scale;
export const ProductIcon = Package;
export const StockReceiveIcon = PackageOpen;
export const PackagePlusIcon = PackagePlus;
export const PackageCheckIcon = PackageCheck;
export const PackageRejectIcon = PackageX;
export const BoxSingleIcon = Box;
export const BoxesMultiIcon = Boxes;
export const PriceTagIcon = Tag;
export const TagsMultiIcon = Tags;
export const BarcodeIcon = Barcode;
export const ScanIcon = Scan;
export const QrCodeIcon = QrCode;
export const StoreOutletIcon = Store;
export const SupplierTruckIcon = Truck;
export const WarehouseIcon = Warehouse;
export const UnitMeasureIcon = Ruler;
export const StockOpnameIcon = ClipboardList;
export const FactoryProductionIcon = Factory;
export const FashionClothingIcon = Shirt;
export const OrderBagIcon = ShoppingBag;
export const ChefHatIcon = ChefHat;
export const CoffeeIcon = Coffee;
export const FoodMenuIcon = Utensils;
export const RestaurantTableIcon = UtensilsCrossed;
export const KitchenFlameIcon = Flame;
export const MechanicWrenchIcon = Wrench;
export const CarVehicleIcon = Car;
export const ServiceScissorsIcon = Scissors;
export const InspectionCheckIcon = ClipboardCheck;
export const LabSampleIcon = FlaskConical;
export const FishPondIcon = Fish;
export const WaterDropIcon = Droplets;
export const SingleDropletIcon = Droplet;
export const WaterTelemetryIcon = Waves;
export const PondTempIcon = Thermometer;
export const RainWeatherIcon = CloudRain;
export const LightModeIcon = Sun;
export const WindAerationIcon = Wind;
export const HarvestPlantIcon = Sprout;
export const AgriTreesIcon = Trees;
export const ColdStorageIcon = Snowflake;
export const StaffListIcon = Users;
export const UserProfileIcon = User;
export const UserPlusIcon = UserPlus;
export const UserCheckIcon = UserCheck;
export const RoleShieldIcon = Shield;
export const JobPositionIcon = Briefcase;
export const LogInIcon = LogIn;
export const LogOutIcon = LogOut;
export const PhoneContactIcon = Phone;
export const MailContactIcon = Mail;
export const DashboardIcon = LayoutDashboard;
export const AiSparkleIcon = Sparkles;
export const AiBotIcon = Bot;
export const ServerCogIcon = ServerCog;
export const ServerHostIcon = Server;
export const DatabaseIcon = Database;
export const SettingsIcon = Settings;
export const TenantBuildingIcon = Building2;
export const BuildingAltIcon = Building;
export const LandmarkIcon = Landmark;
export const HomeIcon = Home;
export const LayersIcon = Layers;
export const LayoutIcon = Layout;
export const DocsIcon = BookOpen;
export const DocumentIcon = FileText;
export const SpreadsheetIcon = FileSpreadsheet;
export const FileCheckIcon = FileCheck;
export const FileCodeIcon = FileCode;
export const FileEditIcon = FileEdit;
export const FolderIcon = Folder;
export const FolderArchiveIcon = FolderArchive;
export const FolderTreeIcon = FolderTree;
export const BackupIcon = Archive;
export const CalendarIcon = Calendar;
export const CalendarCheckIcon = CalendarCheck;
export const CalendarRangeIcon = CalendarRange;
export const TimeIcon = Clock;
export const LocationIcon = MapPin;
export const GlobalIcon = Globe;
export const PasswordKeyIcon = KeyRound;
export const KeyAltIcon = Key;
export const CpuIcon = Cpu;
export const ActivityIcon = Activity;
export const HardDriveIcon = HardDrive;
export const DiskDownloadIcon = HardDriveDownload;
export const TerminalIcon = Terminal;
export const CodeIcon = Code;
export const Code2Icon = Code2;
export const WebhookIcon = Webhook;
export const LinkIcon = Link;
export const Link2Icon = Link2;
export const LinkDisconnectIcon = Link2Off;
export const ZapIcon = Zap;
export const RocketIcon = Rocket;
export const BroadcastIcon = Megaphone;
export const RadioIcon = Radio;
export const SendIcon = Send;
export const InboxIcon = Inbox;
export const MessageSquareIcon = MessageSquare;
export const MessageCircleIcon = MessageCircle;
export const CameraProofIcon = Camera;
export const ImageIcon = Image;
export const TicketIcon = Ticket;
export const GiftIcon = Gift;
export const BadgePercentIcon = BadgePercent;
export const MonitorDisplayIcon = Monitor;
export const SmartphoneIcon = Smartphone;
export const WifiIcon = Wifi;
export const WifiOffIcon = WifiOff;
export const TypographyIcon = Type;
export const HashIcon = Hash;
export const PaletteThemeIcon = Palette;
export const QuoteIcon = Quote;
export const BinaryDataIcon = Binary;
export const GitCommitIcon = GitCommit;
export const NetworkTopologyIcon = Network;
export const ShareIcon = Share2;
export const VolumeIcon = Volume2;
export const MuteIcon = VolumeX;
export const DarkModeIcon = Moon;
export const HamburgerMenuIcon = Menu;
export const AlignLeftIcon = AlignLeft;
export const SquareIcon = Square;
export const BugIcon = Bug;
export const LightbulbIcon = Lightbulb;
export const MouseClickIcon = MousePointerClick;
export const PluginIcon = Plug;
export const ToggleOffIcon = ToggleLeft;
export const ToggleOnIcon = ToggleRight;

// =============================================================================
// 2. ICON CATALOG METADATA (Untuk Kamus Visual di SaaS Admin)
// Total Terdaftar: 225 Icon Lengkap Seluruh Modul
// =============================================================================
export const ICON_CATALOG = [
  {
    category: 'crud',
    categoryName: 'Aksi & CRUD',
    name: 'EditIcon',
    lucideName: 'Pencil',
    component: Pencil,
    description: 'Aksi edit / ubah data baris atau formulir.',
    standardSize: 16,
    colorClass: 'text-indigo-600',
    keywords: ["edit","ubah","pencil","sunting"]
  },
  {
    category: 'crud',
    categoryName: 'Aksi & CRUD',
    name: 'DeleteIcon',
    lucideName: 'Trash2',
    component: Trash2,
    description: 'Aksi hapus data secara permanen atau soft delete.',
    standardSize: 16,
    colorClass: 'text-rose-600',
    keywords: ["delete","hapus","trash","buang"]
  },
  {
    category: 'crud',
    categoryName: 'Aksi & CRUD',
    name: 'AddIcon',
    lucideName: 'Plus',
    component: Plus,
    description: 'Aksi tambah data baru atau item baru.',
    standardSize: 16,
    colorClass: 'text-indigo-600',
    keywords: ["add","tambah","plus","create"]
  },
  {
    category: 'crud',
    categoryName: 'Aksi & CRUD',
    name: 'ViewIcon',
    lucideName: 'Eye',
    component: Eye,
    description: 'Melihat detail data, preview modal, atau tampilkan password.',
    standardSize: 16,
    colorClass: 'text-slate-600',
    keywords: ["view","lihat","detail","mata"]
  },
  {
    category: 'crud',
    categoryName: 'Aksi & CRUD',
    name: 'ViewOffIcon',
    lucideName: 'EyeOff',
    component: EyeOff,
    description: 'Sembunyikan kata sandi atau data sensitif.',
    standardSize: 16,
    colorClass: 'text-slate-400',
    keywords: ["hide","sembunyi","tutup mata"]
  },
  {
    category: 'crud',
    categoryName: 'Aksi & CRUD',
    name: 'SaveIcon',
    lucideName: 'Save',
    component: Save,
    description: 'Simpan data formulir atau konfigurasi.',
    standardSize: 16,
    colorClass: 'text-emerald-600',
    keywords: ["save","simpan","rekam"]
  },
  {
    category: 'crud',
    categoryName: 'Aksi & CRUD',
    name: 'CheckIcon',
    lucideName: 'Check',
    component: Check,
    description: 'Tanda centang konfirmasi atau pilihan terpilih.',
    standardSize: 16,
    colorClass: 'text-emerald-600',
    keywords: ["check","centang","pilih"]
  },
  {
    category: 'crud',
    categoryName: 'Aksi & CRUD',
    name: 'CloseIcon',
    lucideName: 'X',
    component: X,
    description: 'Tutup modal, drawer, popup, atau hapus tag.',
    standardSize: 18,
    colorClass: 'text-slate-500',
    keywords: ["close","tutup","batal","silang"]
  },
  {
    category: 'crud',
    categoryName: 'Aksi & CRUD',
    name: 'CancelIcon',
    lucideName: 'XCircle',
    component: XCircle,
    description: 'Batalkan transaksi atau tolak permohonan.',
    standardSize: 16,
    colorClass: 'text-rose-600',
    keywords: ["cancel","batal","tolak","lingkaran silang"]
  },
  {
    category: 'crud',
    categoryName: 'Aksi & CRUD',
    name: 'CopyIcon',
    lucideName: 'Copy',
    component: Copy,
    description: 'Salin kode token, nomor resi, atau teks ke clipboard.',
    standardSize: 15,
    colorClass: 'text-slate-600',
    keywords: ["copy","salin","duplikat","clipboard"]
  },
  {
    category: 'crud',
    categoryName: 'Aksi & CRUD',
    name: 'ResetIcon',
    lucideName: 'RotateCcw',
    component: RotateCcw,
    description: 'Reset filter tabel atau batalkan perubahan.',
    standardSize: 16,
    colorClass: 'text-amber-600',
    keywords: ["reset","undo","rotate","kembalikan"]
  },
  {
    category: 'crud',
    categoryName: 'Aksi & CRUD',
    name: 'ExternalLinkIcon',
    lucideName: 'ExternalLink',
    component: ExternalLink,
    description: 'Buka tautan eksternal di tab browser baru.',
    standardSize: 15,
    colorClass: 'text-indigo-600',
    keywords: ["external","link","tautan","buka tab"]
  },
  {
    category: 'crud',
    categoryName: 'Aksi & CRUD',
    name: 'HistoryIcon',
    lucideName: 'History',
    component: History,
    description: 'Riwayat perubahan data, mutasi stok, atau audit log.',
    standardSize: 16,
    colorClass: 'text-slate-600',
    keywords: ["history","riwayat","log","kronologis"]
  },
  {
    category: 'crud',
    categoryName: 'Aksi & CRUD',
    name: 'EditAltIcon',
    lucideName: 'Edit',
    component: Edit,
    description: 'Varian tombol edit alternatif.',
    standardSize: 16,
    colorClass: 'text-indigo-600',
    keywords: ["edit","ubah","sunting"]
  },
  {
    category: 'crud',
    categoryName: 'Aksi & CRUD',
    name: 'EditSquareIcon',
    lucideName: 'Edit3',
    component: Edit3,
    description: 'Varian tombol edit dalam kotak.',
    standardSize: 16,
    colorClass: 'text-indigo-600',
    keywords: ["edit","ubah","kotak"]
  },
  {
    category: 'crud',
    categoryName: 'Aksi & CRUD',
    name: 'CheckSquareIcon',
    lucideName: 'CheckSquare',
    component: CheckSquare,
    description: 'Kotak centang checkbox untuk memilih banyak data.',
    standardSize: 16,
    colorClass: 'text-indigo-600',
    keywords: ["checkbox","centang kotak","pilih massal"]
  },
  {
    category: 'crud',
    categoryName: 'Aksi & CRUD',
    name: 'MinusIcon',
    lucideName: 'Minus',
    component: Minus,
    description: 'Kurangi kuantitas item atau collapse section.',
    standardSize: 16,
    colorClass: 'text-slate-600',
    keywords: ["minus","kurang","kecilkan"]
  },
  {
    category: 'crud',
    categoryName: 'Aksi & CRUD',
    name: 'PlayIcon',
    lucideName: 'Play',
    component: Play,
    description: 'Mulai proses batch, jalankan sinkronisasi, atau putar media.',
    standardSize: 16,
    colorClass: 'text-emerald-600',
    keywords: ["play","mulai","jalankan"]
  },
  {
    category: 'crud',
    categoryName: 'Aksi & CRUD',
    name: 'PlayCircleIcon',
    lucideName: 'PlayCircle',
    component: PlayCircle,
    description: 'Tombol putar video panduan atau tutorial.',
    standardSize: 18,
    colorClass: 'text-indigo-600',
    keywords: ["play","video","panduan"]
  },
  {
    category: 'crud',
    categoryName: 'Aksi & CRUD',
    name: 'PlusCircleIcon',
    lucideName: 'PlusCircle',
    component: PlusCircle,
    description: 'Tombol tambah baris baru pada tabel dinamis.',
    standardSize: 16,
    colorClass: 'text-indigo-600',
    keywords: ["plus","tambah baris","lingkaran tambah"]
  },
  {
    category: 'crud',
    categoryName: 'Aksi & CRUD',
    name: 'PowerIcon',
    lucideName: 'Power',
    component: Power,
    description: 'Tombol shutdown, reboot worker, atau matikan sesi.',
    standardSize: 16,
    colorClass: 'text-rose-600',
    keywords: ["power","daya","matikan","saklar"]
  },
  {
    category: 'crud',
    categoryName: 'Aksi & CRUD',
    name: 'ZoomInIcon',
    lucideName: 'ZoomIn',
    component: ZoomIn,
    description: 'Perbesar tampilan gambar bukti atau grafik.',
    standardSize: 16,
    colorClass: 'text-slate-600',
    keywords: ["zoom in","perbesar","kaca pembesar"]
  },
  {
    category: 'crud',
    categoryName: 'Aksi & CRUD',
    name: 'ZoomOutIcon',
    lucideName: 'ZoomOut',
    component: ZoomOut,
    description: 'Perkecil tampilan visual.',
    standardSize: 16,
    colorClass: 'text-slate-600',
    keywords: ["zoom out","perkecil"]
  },
  {
    category: 'table',
    categoryName: 'Tabel & Toolbar',
    name: 'SearchIcon',
    lucideName: 'Search',
    component: Search,
    description: 'Kolom input pencarian data di seluruh tabel & header.',
    standardSize: 18,
    colorClass: 'text-slate-400',
    keywords: ["search","cari","temukan","filter data"]
  },
  {
    category: 'table',
    categoryName: 'Tabel & Toolbar',
    name: 'FilterIcon',
    lucideName: 'Filter',
    component: Filter,
    description: 'Penyaringan data tabel berdasarkan kategori / status.',
    standardSize: 16,
    colorClass: 'text-slate-600',
    keywords: ["filter","saring","kriteria"]
  },
  {
    category: 'table',
    categoryName: 'Tabel & Toolbar',
    name: 'SlidersIcon',
    lucideName: 'SlidersHorizontal',
    component: SlidersHorizontal,
    description: 'Panel filter lanjut dengan multi-parameter.',
    standardSize: 16,
    colorClass: 'text-slate-600',
    keywords: ["sliders","filter lanjut","opsi saring"]
  },
  {
    category: 'table',
    categoryName: 'Tabel & Toolbar',
    name: 'SlidersAltIcon',
    lucideName: 'Sliders',
    component: Sliders,
    description: 'Varian icon sliders pengaturan tabel.',
    standardSize: 16,
    colorClass: 'text-slate-600',
    keywords: ["sliders","pengaturan tabel"]
  },
  {
    category: 'table',
    categoryName: 'Tabel & Toolbar',
    name: 'RefreshIcon',
    lucideName: 'RefreshCw',
    component: RefreshCw,
    description: 'Muat ulang data tabel realtime tanpa refresh halaman.',
    standardSize: 16,
    colorClass: 'text-slate-600',
    keywords: ["refresh","reload","muat ulang","sync"]
  },
  {
    category: 'table',
    categoryName: 'Tabel & Toolbar',
    name: 'PrintIcon',
    lucideName: 'Printer',
    component: Printer,
    description: 'Cetak struk kasir POS, invoice, atau laporan berkas.',
    standardSize: 16,
    colorClass: 'text-slate-600',
    keywords: ["print","cetak","struk","printer"]
  },
  {
    category: 'table',
    categoryName: 'Tabel & Toolbar',
    name: 'ExportIcon',
    lucideName: 'Download',
    component: Download,
    description: 'Unduh laporan data ke Excel / CSV / PDF.',
    standardSize: 16,
    colorClass: 'text-slate-600',
    keywords: ["export","download","unduh","excel"]
  },
  {
    category: 'table',
    categoryName: 'Tabel & Toolbar',
    name: 'ImportIcon',
    lucideName: 'Upload',
    component: Upload,
    description: 'Unggah file Excel/CSV untuk import data massal.',
    standardSize: 16,
    colorClass: 'text-slate-600',
    keywords: ["import","upload","unggah"]
  },
  {
    category: 'table',
    categoryName: 'Tabel & Toolbar',
    name: 'SortIcon',
    lucideName: 'ArrowUpDown',
    component: ArrowUpDown,
    description: 'Urutkan data kolom tabel (A-Z, terbaru, termahal).',
    standardSize: 15,
    colorClass: 'text-slate-500',
    keywords: ["sort","urutkan","sorting","kolom"]
  },
  {
    category: 'table',
    categoryName: 'Tabel & Toolbar',
    name: 'PrevIcon',
    lucideName: 'ChevronLeft',
    component: ChevronLeft,
    description: 'Halaman tabel sebelumnya.',
    standardSize: 18,
    colorClass: 'text-slate-600',
    keywords: ["prev","sebelumnya","kiri"]
  },
  {
    category: 'table',
    categoryName: 'Tabel & Toolbar',
    name: 'NextIcon',
    lucideName: 'ChevronRight',
    component: ChevronRight,
    description: 'Halaman tabel berikutnya.',
    standardSize: 18,
    colorClass: 'text-slate-600',
    keywords: ["next","berikutnya","kanan"]
  },
  {
    category: 'table',
    categoryName: 'Tabel & Toolbar',
    name: 'FirstPageIcon',
    lucideName: 'ChevronsLeft',
    component: ChevronsLeft,
    description: 'Kembali ke halaman pertama tabel.',
    standardSize: 18,
    colorClass: 'text-slate-600',
    keywords: ["first","awal","halaman pertama"]
  },
  {
    category: 'table',
    categoryName: 'Tabel & Toolbar',
    name: 'LastPageIcon',
    lucideName: 'ChevronsRight',
    component: ChevronsRight,
    description: 'Lompat ke halaman terakhir tabel.',
    standardSize: 18,
    colorClass: 'text-slate-600',
    keywords: ["last","akhir","halaman terakhir"]
  },
  {
    category: 'table',
    categoryName: 'Tabel & Toolbar',
    name: 'ExpandIcon',
    lucideName: 'ChevronDown',
    component: ChevronDown,
    description: 'Buka dropdown menu atau expand accordion.',
    standardSize: 16,
    colorClass: 'text-slate-500',
    keywords: ["dropdown","buka","turun"]
  },
  {
    category: 'table',
    categoryName: 'Tabel & Toolbar',
    name: 'CollapseIcon',
    lucideName: 'ChevronUp',
    component: ChevronUp,
    description: 'Tutup accordion atau collapse section.',
    standardSize: 16,
    colorClass: 'text-slate-500',
    keywords: ["collapse","tutup","naik"]
  },
  {
    category: 'table',
    categoryName: 'Tabel & Toolbar',
    name: 'MoreVerticalIcon',
    lucideName: 'MoreVertical',
    component: MoreVertical,
    description: 'Menu aksi dropdown pada baris tabel (3 titik tegak).',
    standardSize: 16,
    colorClass: 'text-slate-500',
    keywords: ["more","menu aksi","titik tiga"]
  },
  {
    category: 'table',
    categoryName: 'Tabel & Toolbar',
    name: 'MoreHorizontalIcon',
    lucideName: 'MoreHorizontal',
    component: MoreHorizontal,
    description: 'Menu opsi horizontal.',
    standardSize: 16,
    colorClass: 'text-slate-500',
    keywords: ["more","opsi baris"]
  },
  {
    category: 'table',
    categoryName: 'Tabel & Toolbar',
    name: 'ArrowRightIcon',
    lucideName: 'ArrowRight',
    component: ArrowRight,
    description: 'Arah navigasi langkah selanjutnya atau alur data.',
    standardSize: 16,
    colorClass: 'text-slate-600',
    keywords: ["arrow","panah kanan","maju"]
  },
  {
    category: 'table',
    categoryName: 'Tabel & Toolbar',
    name: 'ArrowLeftIcon',
    lucideName: 'ArrowLeft',
    component: ArrowLeft,
    description: 'Tombol kembali ke halaman sebelumnya.',
    standardSize: 16,
    colorClass: 'text-slate-600',
    keywords: ["arrow","panah kiri","kembali"]
  },
  {
    category: 'table',
    categoryName: 'Tabel & Toolbar',
    name: 'ArrowLeftRightIcon',
    lucideName: 'ArrowLeftRight',
    component: ArrowLeftRight,
    description: 'Transfer antar akun, mutasi bolak-balik.',
    standardSize: 16,
    colorClass: 'text-slate-600',
    keywords: ["transfer","bolak balik","pertukaran"]
  },
  {
    category: 'table',
    categoryName: 'Tabel & Toolbar',
    name: 'ArrowRightLeftIcon',
    lucideName: 'ArrowRightLeft',
    component: ArrowRightLeft,
    description: 'Transfer kas atau mutasi rekening antar outlet.',
    standardSize: 16,
    colorClass: 'text-slate-600',
    keywords: ["transfer kas","mutasi saldo"]
  },
  {
    category: 'table',
    categoryName: 'Tabel & Toolbar',
    name: 'ArrowDownCircleIcon',
    lucideName: 'ArrowDownCircle',
    component: ArrowDownCircle,
    description: 'Indikator barang masuk atau dana cair.',
    standardSize: 16,
    colorClass: 'text-emerald-600',
    keywords: ["masuk","dana cair","inbound"]
  },
  {
    category: 'table',
    categoryName: 'Tabel & Toolbar',
    name: 'ArrowUpCircleIcon',
    lucideName: 'ArrowUpCircle',
    component: ArrowUpCircle,
    description: 'Indikator barang keluar atau biaya debit.',
    standardSize: 16,
    colorClass: 'text-rose-600',
    keywords: ["keluar","outbound","debit"]
  },
  {
    category: 'table',
    categoryName: 'Tabel & Toolbar',
    name: 'ArrowDownLeftIcon',
    lucideName: 'ArrowDownLeft',
    component: ArrowDownLeft,
    description: 'Penerimaan pembayaran / kas masuk.',
    standardSize: 16,
    colorClass: 'text-emerald-600',
    keywords: ["kas masuk","terima uang"]
  },
  {
    category: 'table',
    categoryName: 'Tabel & Toolbar',
    name: 'ArrowUpRightIcon',
    lucideName: 'ArrowUpRight',
    component: ArrowUpRight,
    description: 'Pengeluaran kas atau rincian link.',
    standardSize: 16,
    colorClass: 'text-indigo-600',
    keywords: ["kas keluar","detail link"]
  },
  {
    category: 'table',
    categoryName: 'Tabel & Toolbar',
    name: 'ArrowDownRightIcon',
    lucideName: 'ArrowDownRight',
    component: ArrowDownRight,
    description: 'Arah grafik atau rincian turunan.',
    standardSize: 16,
    colorClass: 'text-slate-600',
    keywords: ["arah bawah kanan"]
  },
  {
    category: 'table',
    categoryName: 'Tabel & Toolbar',
    name: 'GridIcon',
    lucideName: 'Grid3X3',
    component: Grid3X3,
    description: 'Tampilan layout grid 3x3 untuk katalog produk.',
    standardSize: 16,
    colorClass: 'text-slate-600',
    keywords: ["grid","kisi","katalog grid"]
  },
  {
    category: 'table',
    categoryName: 'Tabel & Toolbar',
    name: 'LayoutGridIcon',
    lucideName: 'LayoutGrid',
    component: LayoutGrid,
    description: 'Mode tampilan grid modul atau widget.',
    standardSize: 16,
    colorClass: 'text-slate-600',
    keywords: ["grid layout","tampilan kotak"]
  },
  {
    category: 'table',
    categoryName: 'Tabel & Toolbar',
    name: 'ListFilterIcon',
    lucideName: 'ListFilter',
    component: ListFilter,
    description: 'Filter daftar bersyarat.',
    standardSize: 16,
    colorClass: 'text-slate-600',
    keywords: ["list filter","saring daftar"]
  },
  {
    category: 'table',
    categoryName: 'Tabel & Toolbar',
    name: 'TableDataIcon',
    lucideName: 'Table',
    component: Table,
    description: 'Mode tampilan tabel data standar.',
    standardSize: 16,
    colorClass: 'text-slate-600',
    keywords: ["table","tabel data","spreadsheet"]
  },
  {
    category: 'table',
    categoryName: 'Tabel & Toolbar',
    name: 'MaximizeIcon',
    lucideName: 'Maximize2',
    component: Maximize2,
    description: 'Mode layar penuh (fullscreen) kasir POS atau KDS.',
    standardSize: 16,
    colorClass: 'text-slate-600',
    keywords: ["maximize","fullscreen","layar penuh"]
  },
  {
    category: 'table',
    categoryName: 'Tabel & Toolbar',
    name: 'MinimizeIcon',
    lucideName: 'Minimize2',
    component: Minimize2,
    description: 'Keluar dari mode layar penuh.',
    standardSize: 16,
    colorClass: 'text-slate-600',
    keywords: ["minimize","perkecil layar"]
  },
  {
    category: 'table',
    categoryName: 'Tabel & Toolbar',
    name: 'SplitIcon',
    lucideName: 'Split',
    component: Split,
    description: 'Pecah tagihan (split bill) kasir atau alokasi stok multi-gudang.',
    standardSize: 16,
    colorClass: 'text-indigo-600',
    keywords: ["split","pecah","split bill"]
  },
  {
    category: 'feedback',
    categoryName: 'Status & Feedback',
    name: 'SuccessIcon',
    lucideName: 'CheckCircle2',
    component: CheckCircle2,
    description: 'Status berhasil, transaksi sukses, data valid.',
    standardSize: 18,
    colorClass: 'text-emerald-500',
    keywords: ["success","sukses","berhasil","valid"]
  },
  {
    category: 'feedback',
    categoryName: 'Status & Feedback',
    name: 'CheckCircleAltIcon',
    lucideName: 'CheckCircle',
    component: CheckCircle,
    description: 'Varian status centang berhasil.',
    standardSize: 18,
    colorClass: 'text-emerald-500',
    keywords: ["check","sukses","centang"]
  },
  {
    category: 'feedback',
    categoryName: 'Status & Feedback',
    name: 'WarningIcon',
    lucideName: 'AlertTriangle',
    component: AlertTriangle,
    description: 'Peringatan stok menipis, peringatan jatuh tempo.',
    standardSize: 18,
    colorClass: 'text-amber-500',
    keywords: ["warning","peringatan","waspada","hati-hati"]
  },
  {
    category: 'feedback',
    categoryName: 'Status & Feedback',
    name: 'ErrorIcon',
    lucideName: 'AlertCircle',
    component: AlertCircle,
    description: 'Indikator kegagalan validasi form atau kesalahan sistem.',
    standardSize: 18,
    colorClass: 'text-rose-500',
    keywords: ["error","gagal","kesalahan","danger"]
  },
  {
    category: 'feedback',
    categoryName: 'Status & Feedback',
    name: 'CircleAlertIcon',
    lucideName: 'CircleAlert',
    component: CircleAlert,
    description: 'Pemberitahuan peringatan lingkaran.',
    standardSize: 18,
    colorClass: 'text-rose-500',
    keywords: ["alert","lingkaran bahaya"]
  },
  {
    category: 'feedback',
    categoryName: 'Status & Feedback',
    name: 'InfoIcon',
    lucideName: 'Info',
    component: Info,
    description: 'Keterangan tooltip, bantuan formulir, atau info petunjuk.',
    standardSize: 18,
    colorClass: 'text-sky-500',
    keywords: ["info","informasi","petunjuk","tooltip"]
  },
  {
    category: 'feedback',
    categoryName: 'Status & Feedback',
    name: 'HelpIcon',
    lucideName: 'HelpCircle',
    component: HelpCircle,
    description: 'Pusat bantuan tiket, tutorial, dan dokumentasi.',
    standardSize: 18,
    colorClass: 'text-indigo-600',
    keywords: ["help","bantuan","tanya","faq"]
  },
  {
    category: 'feedback',
    categoryName: 'Status & Feedback',
    name: 'NotificationIcon',
    lucideName: 'Bell',
    component: Bell,
    description: 'Pusat lonceng notifikasi dan pengingat sistem.',
    standardSize: 18,
    colorClass: 'text-slate-600',
    keywords: ["bell","notifikasi","lonceng","pemberitahuan"]
  },
  {
    category: 'feedback',
    categoryName: 'Status & Feedback',
    name: 'BellRingIcon',
    lucideName: 'BellRing',
    component: BellRing,
    description: 'Notifikasi aktif atau pesanan baru masuk.',
    standardSize: 18,
    colorClass: 'text-amber-500',
    keywords: ["bell ring","notif aktif","order masuk"]
  },
  {
    category: 'feedback',
    categoryName: 'Status & Feedback',
    name: 'VerifiedIcon',
    lucideName: 'ShieldCheck',
    component: ShieldCheck,
    description: 'Verifikasi keamanan tenant KYC dan lisensi resmi.',
    standardSize: 16,
    colorClass: 'text-emerald-600',
    keywords: ["verified","shield","kyc","aman"]
  },
  {
    category: 'feedback',
    categoryName: 'Status & Feedback',
    name: 'ShieldAlertIcon',
    lucideName: 'ShieldAlert',
    component: ShieldAlert,
    description: 'Peringatan celah keamanan atau login mencurigakan.',
    standardSize: 16,
    colorClass: 'text-rose-600',
    keywords: ["shield alert","bahaya keamanan","fraud"]
  },
  {
    category: 'feedback',
    categoryName: 'Status & Feedback',
    name: 'LockIcon',
    lucideName: 'Lock',
    component: Lock,
    description: 'Fitur terkunci (karena belum upgrade paket) atau enkripsi.',
    standardSize: 16,
    colorClass: 'text-slate-500',
    keywords: ["lock","kunci","terkunci","upgrade"]
  },
  {
    category: 'feedback',
    categoryName: 'Status & Feedback',
    name: 'UnlockIcon',
    lucideName: 'Unlock',
    component: Unlock,
    description: 'Hak akses terbuka atau shift kasir aktif.',
    standardSize: 16,
    colorClass: 'text-emerald-600',
    keywords: ["unlock","terbuka","buka kunci"]
  },
  {
    category: 'feedback',
    categoryName: 'Status & Feedback',
    name: 'LoadingIcon',
    lucideName: 'Loader2',
    component: Loader2,
    description: 'Indikator loading animasi proses data.',
    standardSize: 18,
    colorClass: 'text-indigo-600',
    keywords: ["loading","spinner","tunggu"]
  },
  {
    category: 'feedback',
    categoryName: 'Status & Feedback',
    name: 'AwardIcon',
    lucideName: 'Award',
    component: Award,
    description: 'Pencapaian target penjualan, merchant terbaik, atau reward.',
    standardSize: 18,
    colorClass: 'text-amber-500',
    keywords: ["award","penghargaan","prestasi","top tenant"]
  },
  {
    category: 'feedback',
    categoryName: 'Status & Feedback',
    name: 'BadgeCheckIcon',
    lucideName: 'BadgeCheck',
    component: BadgeCheck,
    description: 'Lencana verifikasi resmi akun merchant.',
    standardSize: 18,
    colorClass: 'text-sky-600',
    keywords: ["badge","centang verifikasi","official"]
  },
  {
    category: 'feedback',
    categoryName: 'Status & Feedback',
    name: 'BanIcon',
    lucideName: 'Ban',
    component: Ban,
    description: 'Akses diblokir, akun dinonaktifkan, atau blacklist.',
    standardSize: 18,
    colorClass: 'text-rose-600',
    keywords: ["ban","blokir","larang","suspend"]
  },
  {
    category: 'feedback',
    categoryName: 'Status & Feedback',
    name: 'HeartIcon',
    lucideName: 'Heart',
    component: Heart,
    description: 'Item favorit pelanggan atau daftar wishlist produk.',
    standardSize: 18,
    colorClass: 'text-rose-500',
    keywords: ["heart","suka","favorit","wishlist"]
  },
  {
    category: 'feedback',
    categoryName: 'Status & Feedback',
    name: 'HealthPulseIcon',
    lucideName: 'HeartPulse',
    component: HeartPulse,
    description: 'Status kesehatan server realtime (heartbeat check).',
    standardSize: 18,
    colorClass: 'text-emerald-500',
    keywords: ["heartbeat","kesehatan server","pulse"]
  },
  {
    category: 'feedback',
    categoryName: 'Status & Feedback',
    name: 'SupportLifeBuoyIcon',
    lucideName: 'LifeBuoy',
    component: LifeBuoy,
    description: 'Pusat bantuan darurat dan live chat support.',
    standardSize: 18,
    colorClass: 'text-sky-600',
    keywords: ["support","pelampung","cs","bantuan"]
  },
  {
    category: 'feedback',
    categoryName: 'Status & Feedback',
    name: 'StarIcon',
    lucideName: 'Star',
    component: Star,
    description: 'Rating ulasan pelanggan, rating kepuasan teknisi/resto.',
    standardSize: 18,
    colorClass: 'text-amber-400',
    keywords: ["star","bintang","rating","ulasan"]
  },
  {
    category: 'feedback',
    categoryName: 'Status & Feedback',
    name: 'TargetIcon',
    lucideName: 'Target',
    component: Target,
    description: 'Target pencapaian omzet bulanan toko.',
    standardSize: 18,
    colorClass: 'text-indigo-600',
    keywords: ["target","tujuan","kpi omzet"]
  },
  {
    category: 'feedback',
    categoryName: 'Status & Feedback',
    name: 'TrophyIcon',
    lucideName: 'Trophy',
    component: Trophy,
    description: 'Peringkat penjualan tertinggi cabang / karyawan.',
    standardSize: 18,
    colorClass: 'text-amber-500',
    keywords: ["trophy","juara","pemenang"]
  },
  {
    category: 'finance',
    categoryName: 'Keuangan & POS',
    name: 'CashIcon',
    lucideName: 'Wallet',
    component: Wallet,
    description: 'Saldo kas toko, dompet digital merchant, modal laci kasir.',
    standardSize: 18,
    colorClass: 'text-emerald-600',
    keywords: ["cash","kas","wallet","dompet","uang"]
  },
  {
    category: 'finance',
    categoryName: 'Keuangan & POS',
    name: 'BillingIcon',
    lucideName: 'CreditCard',
    component: CreditCard,
    description: 'Metode pembayaran kartu kredit/debit, invoice langganan.',
    standardSize: 18,
    colorClass: 'text-blue-600',
    keywords: ["credit card","debit","kartu","billing"]
  },
  {
    category: 'finance',
    categoryName: 'Keuangan & POS',
    name: 'ReceiptIcon',
    lucideName: 'Receipt',
    component: Receipt,
    description: 'Struk bukti kasir, nota pembayaran, dan faktur cetak.',
    standardSize: 18,
    colorClass: 'text-indigo-600',
    keywords: ["receipt","struk","nota","faktur"]
  },
  {
    category: 'finance',
    categoryName: 'Keuangan & POS',
    name: 'PosCartIcon',
    lucideName: 'ShoppingCart',
    component: ShoppingCart,
    description: 'Keranjang kasir POS dan checkout penjualan barang.',
    standardSize: 18,
    colorClass: 'text-indigo-600',
    keywords: ["cart","keranjang","pos","kasir"]
  },
  {
    category: 'finance',
    categoryName: 'Keuangan & POS',
    name: 'ProfitIcon',
    lucideName: 'TrendingUp',
    component: TrendingUp,
    description: 'Grafik kenaikan laba, tren omzet meningkat.',
    standardSize: 18,
    colorClass: 'text-emerald-600',
    keywords: ["trending up","profit","laba","naik"]
  },
  {
    category: 'finance',
    categoryName: 'Keuangan & POS',
    name: 'ExpenseIcon',
    lucideName: 'TrendingDown',
    component: TrendingDown,
    description: 'Beban operasional toko, pengeluaran modal, tren turun.',
    standardSize: 18,
    colorClass: 'text-rose-600',
    keywords: ["trending down","rugi","beban","turun"]
  },
  {
    category: 'finance',
    categoryName: 'Keuangan & POS',
    name: 'CurrencyIcon',
    lucideName: 'DollarSign',
    component: DollarSign,
    description: 'Simbol nominal uang, harga produk, dan finansial.',
    standardSize: 18,
    colorClass: 'text-emerald-600',
    keywords: ["dollar","uang","rupiah","harga"]
  },
  {
    category: 'finance',
    categoryName: 'Keuangan & POS',
    name: 'CoinsIcon',
    lucideName: 'Coins',
    component: Coins,
    description: 'Koin receh kasir untuk uang kembalian tunai.',
    standardSize: 18,
    colorClass: 'text-amber-500',
    keywords: ["coins","koin","uang kembalian","receh"]
  },
  {
    category: 'finance',
    categoryName: 'Keuangan & POS',
    name: 'BanknoteIcon',
    lucideName: 'Banknote',
    component: Banknote,
    description: 'Uang kertas fisik setoran kasir shift ke brankas.',
    standardSize: 18,
    colorClass: 'text-emerald-600',
    keywords: ["banknote","uang kertas","tunai","setoran"]
  },
  {
    category: 'finance',
    categoryName: 'Keuangan & POS',
    name: 'BarChartIcon',
    lucideName: 'BarChart2',
    component: BarChart2,
    description: 'Diagram batang analisis penjualan dan perbandingan periode.',
    standardSize: 18,
    colorClass: 'text-indigo-600',
    keywords: ["bar chart","diagram","grafik batang"]
  },
  {
    category: 'finance',
    categoryName: 'Keuangan & POS',
    name: 'BarChartAltIcon',
    lucideName: 'BarChart3',
    component: BarChart3,
    description: 'Varian grafik analitik.',
    standardSize: 18,
    colorClass: 'text-indigo-600',
    keywords: ["bar chart 3","laporan grafik"]
  },
  {
    category: 'finance',
    categoryName: 'Keuangan & POS',
    name: 'LineChartIcon',
    lucideName: 'LineChart',
    component: LineChart,
    description: 'Grafik garis tren transaksi harian.',
    standardSize: 18,
    colorClass: 'text-indigo-600',
    keywords: ["line chart","grafik tren","pergerakan"]
  },
  {
    category: 'finance',
    categoryName: 'Keuangan & POS',
    name: 'PieChartIcon',
    lucideName: 'PieChart',
    component: PieChart,
    description: 'Diagram lingkaran proporsi kategori produk & metode bayar.',
    standardSize: 18,
    colorClass: 'text-violet-600',
    keywords: ["pie chart","diagram lingkaran","proporsi"]
  },
  {
    category: 'finance',
    categoryName: 'Keuangan & POS',
    name: 'CalculatorIcon',
    lucideName: 'Calculator',
    component: Calculator,
    description: 'Kalkulator hitung cepat kasir dan kembalian.',
    standardSize: 18,
    colorClass: 'text-slate-600',
    keywords: ["calculator","hitung","kalkulator"]
  },
  {
    category: 'finance',
    categoryName: 'Keuangan & POS',
    name: 'PercentIcon',
    lucideName: 'Percent',
    component: Percent,
    description: 'Diskon persentase kupon promo toko atau pajak PPN.',
    standardSize: 18,
    colorClass: 'text-indigo-600',
    keywords: ["percent","persen","diskon","pajak"]
  },
  {
    category: 'finance',
    categoryName: 'Keuangan & POS',
    name: 'BalanceScaleIcon',
    lucideName: 'Scale',
    component: Scale,
    description: 'Neraca keuangan laba rugi atau timbangan gramatur.',
    standardSize: 18,
    colorClass: 'text-indigo-700',
    keywords: ["scale","neraca","timbangan","seimbang"]
  },
  {
    category: 'inventory',
    categoryName: 'Inventori & Logistik',
    name: 'ProductIcon',
    lucideName: 'Package',
    component: Package,
    description: 'Master katalog barang, data SKU produk, dan kemasan.',
    standardSize: 18,
    colorClass: 'text-indigo-600',
    keywords: ["package","produk","sku","barang"]
  },
  {
    category: 'inventory',
    categoryName: 'Inventori & Logistik',
    name: 'StockReceiveIcon',
    lucideName: 'PackageOpen',
    component: PackageOpen,
    description: 'Penerimaan barang masuk dari supplier (inbound PO).',
    standardSize: 18,
    colorClass: 'text-emerald-600',
    keywords: ["receive","bongkar barang","masuk stok"]
  },
  {
    category: 'inventory',
    categoryName: 'Inventori & Logistik',
    name: 'PackagePlusIcon',
    lucideName: 'PackagePlus',
    component: PackagePlus,
    description: 'Input stok baru hasil produksi atau penerimaan.',
    standardSize: 18,
    colorClass: 'text-emerald-600',
    keywords: ["tambah stok","barang baru"]
  },
  {
    category: 'inventory',
    categoryName: 'Inventori & Logistik',
    name: 'PackageCheckIcon',
    lucideName: 'PackageCheck',
    component: PackageCheck,
    description: 'Stok opname selesai terverifikasi.',
    standardSize: 18,
    colorClass: 'text-emerald-600',
    keywords: ["stok opname","verifikasi paket"]
  },
  {
    category: 'inventory',
    categoryName: 'Inventori & Logistik',
    name: 'PackageRejectIcon',
    lucideName: 'PackageX',
    component: PackageX,
    description: 'Retur barang rusak / kadaluarsa.',
    standardSize: 18,
    colorClass: 'text-rose-600',
    keywords: ["retur","rusak","reject"]
  },
  {
    category: 'inventory',
    categoryName: 'Inventori & Logistik',
    name: 'BoxSingleIcon',
    lucideName: 'Box',
    component: Box,
    description: 'Kotak kardus kemasan produk satuan.',
    standardSize: 18,
    colorClass: 'text-slate-700',
    keywords: ["box","kotak","kemasan"]
  },
  {
    category: 'inventory',
    categoryName: 'Inventori & Logistik',
    name: 'BoxesMultiIcon',
    lucideName: 'Boxes',
    component: Boxes,
    description: 'Karton dus grosir isi multi-satuan (Pack/Dus/Koli).',
    standardSize: 18,
    colorClass: 'text-slate-700',
    keywords: ["boxes","dus","grosir","koli"]
  },
  {
    category: 'inventory',
    categoryName: 'Inventori & Logistik',
    name: 'PriceTagIcon',
    lucideName: 'Tag',
    component: Tag,
    description: 'Label harga barang dan kategori tag produk.',
    standardSize: 18,
    colorClass: 'text-indigo-600',
    keywords: ["tag","harga","label"]
  },
  {
    category: 'inventory',
    categoryName: 'Inventori & Logistik',
    name: 'TagsMultiIcon',
    lucideName: 'Tags',
    component: Tags,
    description: 'Kumpulan multi-tag kategori atau badge varian.',
    standardSize: 18,
    colorClass: 'text-indigo-600',
    keywords: ["tags","multi tag","varian"]
  },
  {
    category: 'inventory',
    categoryName: 'Inventori & Logistik',
    name: 'BarcodeIcon',
    lucideName: 'Barcode',
    component: Barcode,
    description: 'Barcode kode batang EAN-13 untuk scan kasir POS.',
    standardSize: 18,
    colorClass: 'text-slate-700',
    keywords: ["barcode","scan","kode batang"]
  },
  {
    category: 'inventory',
    categoryName: 'Inventori & Logistik',
    name: 'ScanIcon',
    lucideName: 'Scan',
    component: Scan,
    description: 'Mode scanner kamera smartphone untuk kasir cepat.',
    standardSize: 18,
    colorClass: 'text-indigo-600',
    keywords: ["scan","kamera scan","pindai"]
  },
  {
    category: 'inventory',
    categoryName: 'Inventori & Logistik',
    name: 'QrCodeIcon',
    lucideName: 'QrCode',
    component: QrCode,
    description: 'QRIS dinamis pembayaran kasir & kode tracking batch.',
    standardSize: 18,
    colorClass: 'text-indigo-600',
    keywords: ["qrcode","qris","kode qr"]
  },
  {
    category: 'inventory',
    categoryName: 'Inventori & Logistik',
    name: 'StoreOutletIcon',
    lucideName: 'Store',
    component: Store,
    description: 'Manajemen toko fisik retail, ruko, dan outlet cabang.',
    standardSize: 18,
    colorClass: 'text-indigo-600',
    keywords: ["store","toko","outlet","cabang"]
  },
  {
    category: 'inventory',
    categoryName: 'Inventori & Logistik',
    name: 'SupplierTruckIcon',
    lucideName: 'Truck',
    component: Truck,
    description: 'Logistik pengiriman ekspedisi, kurir, dan PO supplier.',
    standardSize: 18,
    colorClass: 'text-slate-700',
    keywords: ["truck","truk","kurir","pengiriman"]
  },
  {
    category: 'inventory',
    categoryName: 'Inventori & Logistik',
    name: 'WarehouseIcon',
    lucideName: 'Warehouse',
    component: Warehouse,
    description: 'Gudang pusat, penyimpanan multi-lokasi, dan buffer.',
    standardSize: 18,
    colorClass: 'text-slate-700',
    keywords: ["warehouse","gudang","depot"]
  },
  {
    category: 'inventory',
    categoryName: 'Inventori & Logistik',
    name: 'UnitMeasureIcon',
    lucideName: 'Ruler',
    component: Ruler,
    description: 'Satuan ukuran barang (Meter, Kg, Liter, Pcs).',
    standardSize: 18,
    colorClass: 'text-slate-600',
    keywords: ["ruler","satuan","dimensi","meter"]
  },
  {
    category: 'inventory',
    categoryName: 'Inventori & Logistik',
    name: 'StockOpnameIcon',
    lucideName: 'ClipboardList',
    component: ClipboardList,
    description: 'Formulir jadwal stok opname berkala gudang.',
    standardSize: 18,
    colorClass: 'text-indigo-600',
    keywords: ["stok opname","daftar inventori","checklist"]
  },
  {
    category: 'inventory',
    categoryName: 'Inventori & Logistik',
    name: 'FactoryProductionIcon',
    lucideName: 'Factory',
    component: Factory,
    description: 'Pabrik manufaktur, produksi barang, dan supplier utama.',
    standardSize: 18,
    colorClass: 'text-slate-700',
    keywords: ["factory","pabrik","produksi","manufaktur"]
  },
  {
    category: 'inventory',
    categoryName: 'Inventori & Logistik',
    name: 'FashionClothingIcon',
    lucideName: 'Shirt',
    component: Shirt,
    description: 'Kategori fashion pakaian, distro, dan ukuran baju.',
    standardSize: 18,
    colorClass: 'text-violet-600',
    keywords: ["shirt","baju","fashion","pakaian"]
  },
  {
    category: 'inventory',
    categoryName: 'Inventori & Logistik',
    name: 'OrderBagIcon',
    lucideName: 'ShoppingBag',
    component: ShoppingBag,
    description: 'Kantong belanja pesanan pelanggan & omnichannel order.',
    standardSize: 18,
    colorClass: 'text-indigo-600',
    keywords: ["bag","kantong","order","pesanan"]
  },
  {
    category: 'kuliner',
    categoryName: 'F&B & Kuliner',
    name: 'ChefHatIcon',
    lucideName: 'ChefHat',
    component: ChefHat,
    description: 'Koki dapur, Kitchen Display System (KDS), dan resep HPP.',
    standardSize: 18,
    colorClass: 'text-amber-600',
    keywords: ["chef","koki","dapur","kuliner"]
  },
  {
    category: 'kuliner',
    categoryName: 'F&B & Kuliner',
    name: 'CoffeeIcon',
    lucideName: 'Coffee',
    component: Coffee,
    description: 'Menu minuman kopi, cafe, barista, dan coffee shop.',
    standardSize: 18,
    colorClass: 'text-amber-700',
    keywords: ["coffee","kopi","minuman","cafe"]
  },
  {
    category: 'kuliner',
    categoryName: 'F&B & Kuliner',
    name: 'FoodMenuIcon',
    lucideName: 'Utensils',
    component: Utensils,
    description: 'Katalog menu makanan resto, porsi sajian kuliner.',
    standardSize: 18,
    colorClass: 'text-amber-600',
    keywords: ["food","makanan","menu","kuliner"]
  },
  {
    category: 'kuliner',
    categoryName: 'F&B & Kuliner',
    name: 'RestaurantTableIcon',
    lucideName: 'UtensilsCrossed',
    component: UtensilsCrossed,
    description: 'Manajemen meja dine-in, status meja terisi/kosong.',
    standardSize: 18,
    colorClass: 'text-amber-600',
    keywords: ["table","meja","dine in","resto"]
  },
  {
    category: 'kuliner',
    categoryName: 'F&B & Kuliner',
    name: 'KitchenFlameIcon',
    lucideName: 'Flame',
    component: Flame,
    description: 'Indikator tingkat kepedasan masakan atau api dapur aktif.',
    standardSize: 18,
    colorClass: 'text-rose-500',
    keywords: ["flame","api","pedas","panas"]
  },
  {
    category: 'jasa',
    categoryName: 'Jasa & Bengkel',
    name: 'MechanicWrenchIcon',
    lucideName: 'Wrench',
    component: Wrench,
    description: 'Layanan servis bengkel motor/mobil, mekanik, reparasi.',
    standardSize: 18,
    colorClass: 'text-sky-600',
    keywords: ["wrench","bengkel","servis","mekanik"]
  },
  {
    category: 'jasa',
    categoryName: 'Jasa & Bengkel',
    name: 'CarVehicleIcon',
    lucideName: 'Car',
    component: Car,
    description: 'Data kendaraan servis pelanggan, plat no, dan odometer.',
    standardSize: 18,
    colorClass: 'text-sky-700',
    keywords: ["car","kendaraan","mobil","motor"]
  },
  {
    category: 'jasa',
    categoryName: 'Jasa & Bengkel',
    name: 'ServiceScissorsIcon',
    lucideName: 'Scissors',
    component: Scissors,
    description: 'Layanan salon kecantikan, potong rambut, dan barbershop.',
    standardSize: 18,
    colorClass: 'text-violet-600',
    keywords: ["scissors","gunting","salon","barber"]
  },
  {
    category: 'jasa',
    categoryName: 'Jasa & Bengkel',
    name: 'InspectionCheckIcon',
    lucideName: 'ClipboardCheck',
    component: ClipboardCheck,
    description: 'Checklist inspeksi awal kondisi unit dan SPK servis.',
    standardSize: 18,
    colorClass: 'text-sky-600',
    keywords: ["spk","work order","inspeksi","checklist"]
  },
  {
    category: 'jasa',
    categoryName: 'Jasa & Bengkel',
    name: 'LabSampleIcon',
    lucideName: 'FlaskConical',
    component: FlaskConical,
    description: 'Uji laboratorium oli kendaraan atau uji kimiawi.',
    standardSize: 18,
    colorClass: 'text-teal-600',
    keywords: ["lab","kimia","sampel","oli"]
  },
  {
    category: 'budidaya',
    categoryName: 'Budidaya & Tambak',
    name: 'FishPondIcon',
    lucideName: 'Fish',
    component: Fish,
    description: 'Komoditas budidaya udang vaname, ikan lele/nila, dan siklus.',
    standardSize: 18,
    colorClass: 'text-teal-600',
    keywords: ["fish","ikan","udang","tambak","kolam"]
  },
  {
    category: 'budidaya',
    categoryName: 'Budidaya & Tambak',
    name: 'WaterDropIcon',
    lucideName: 'Droplets',
    component: Droplets,
    description: 'Kualitas air kolam, pergantian air, dan kebersihan.',
    standardSize: 18,
    colorClass: 'text-cyan-600',
    keywords: ["droplets","air","water","tetes"]
  },
  {
    category: 'budidaya',
    categoryName: 'Budidaya & Tambak',
    name: 'SingleDropletIcon',
    lucideName: 'Droplet',
    component: Droplet,
    description: 'Indikator takaran tetes cairan suplemen kolam.',
    standardSize: 18,
    colorClass: 'text-cyan-500',
    keywords: ["tetes","suplemen","droplet"]
  },
  {
    category: 'budidaya',
    categoryName: 'Budidaya & Tambak',
    name: 'WaterTelemetryIcon',
    lucideName: 'Waves',
    component: Waves,
    description: 'Sensor IoT telemetri kualitas air (pH, DO, Salinitas).',
    standardSize: 18,
    colorClass: 'text-teal-600',
    keywords: ["waves","gelombang","telemetri","iot"]
  },
  {
    category: 'budidaya',
    categoryName: 'Budidaya & Tambak',
    name: 'PondTempIcon',
    lucideName: 'Thermometer',
    component: Thermometer,
    description: 'Sensor suhu air kolam (°C) dan deteksi cuaca.',
    standardSize: 18,
    colorClass: 'text-amber-600',
    keywords: ["thermometer","suhu","temperatur"]
  },
  {
    category: 'budidaya',
    categoryName: 'Budidaya & Tambak',
    name: 'RainWeatherIcon',
    lucideName: 'CloudRain',
    component: CloudRain,
    description: 'Kondisi cuaca hujan yang mempengaruhi salinitas air.',
    standardSize: 18,
    colorClass: 'text-sky-600',
    keywords: ["rain","hujan","cuaca"]
  },
  {
    category: 'system',
    categoryName: 'Sistem & Server',
    name: 'LightModeIcon',
    lucideName: 'Sun',
    component: Sun,
    description: 'Beralih ke mode terang (Light Mode).',
    standardSize: 18,
    colorClass: 'text-amber-500',
    keywords: ["sun","light mode","terang","siang"]
  },
  {
    category: 'budidaya',
    categoryName: 'Budidaya & Tambak',
    name: 'WindAerationIcon',
    lucideName: 'Wind',
    component: Wind,
    description: 'Sirkulasi udara dan kincir aerasi oksigen kolam.',
    standardSize: 18,
    colorClass: 'text-cyan-600',
    keywords: ["wind","angin","kincir","aerasi"]
  },
  {
    category: 'budidaya',
    categoryName: 'Budidaya & Tambak',
    name: 'HarvestPlantIcon',
    lucideName: 'Sprout',
    component: Sprout,
    description: 'Pertumbuhan bibit/benih ikan dan fase panen sayur hidroponik.',
    standardSize: 18,
    colorClass: 'text-emerald-600',
    keywords: ["sprout","tunas","bibit","tanaman"]
  },
  {
    category: 'budidaya',
    categoryName: 'Budidaya & Tambak',
    name: 'AgriTreesIcon',
    lucideName: 'Trees',
    component: Trees,
    description: 'Perkebunan, lahan budidaya agro, dan tanaman keras.',
    standardSize: 18,
    colorClass: 'text-emerald-700',
    keywords: ["trees","kebun","pohon","lahan"]
  },
  {
    category: 'budidaya',
    categoryName: 'Budidaya & Tambak',
    name: 'ColdStorageIcon',
    lucideName: 'Snowflake',
    component: Snowflake,
    description: 'Penyimpanan beku cold storage hasil panen ikan/udang.',
    standardSize: 18,
    colorClass: 'text-sky-500',
    keywords: ["cold storage","beku","es","panen"]
  },
  {
    category: 'users',
    categoryName: 'Pengguna & Akses',
    name: 'StaffListIcon',
    lucideName: 'Users',
    component: Users,
    description: 'Daftar semua karyawan, staf outlet, dan manajemen tim.',
    standardSize: 18,
    colorClass: 'text-indigo-600',
    keywords: ["users","staff","karyawan","tim"]
  },
  {
    category: 'users',
    categoryName: 'Pengguna & Akses',
    name: 'UserProfileIcon',
    lucideName: 'User',
    component: User,
    description: 'Profil akun pengguna yang sedang login.',
    standardSize: 18,
    colorClass: 'text-slate-600',
    keywords: ["user","profil","akun","saya"]
  },
  {
    category: 'users',
    categoryName: 'Pengguna & Akses',
    name: 'UserPlusIcon',
    lucideName: 'UserPlus',
    component: UserPlus,
    description: 'Undang staf baru atau daftarkan member pelanggan.',
    standardSize: 18,
    colorClass: 'text-indigo-600',
    keywords: ["tambah staff","member baru","user plus"]
  },
  {
    category: 'users',
    categoryName: 'Pengguna & Akses',
    name: 'UserCheckIcon',
    lucideName: 'UserCheck',
    component: UserCheck,
    description: 'Akun terverifikasi, staf hadir presensi aktif.',
    standardSize: 18,
    colorClass: 'text-emerald-600',
    keywords: ["user check","presensi","hadir","aktif"]
  },
  {
    category: 'users',
    categoryName: 'Pengguna & Akses',
    name: 'RoleShieldIcon',
    lucideName: 'Shield',
    component: Shield,
    description: 'Role & permission hak akses staf per modul.',
    standardSize: 18,
    colorClass: 'text-indigo-600',
    keywords: ["shield","role","hak akses","permission"]
  },
  {
    category: 'users',
    categoryName: 'Pengguna & Akses',
    name: 'JobPositionIcon',
    lucideName: 'Briefcase',
    component: Briefcase,
    description: 'Posisi jabatan kerja karyawan dan penugasan shift.',
    standardSize: 18,
    colorClass: 'text-slate-600',
    keywords: ["briefcase","jabatan","pekerjaan"]
  },
  {
    category: 'users',
    categoryName: 'Pengguna & Akses',
    name: 'LogInIcon',
    lucideName: 'LogIn',
    component: LogIn,
    description: 'Masuk ke sesi akun atau otentikasi login.',
    standardSize: 18,
    colorClass: 'text-indigo-600',
    keywords: ["login","masuk","auth"]
  },
  {
    category: 'users',
    categoryName: 'Pengguna & Akses',
    name: 'LogOutIcon',
    lucideName: 'LogOut',
    component: LogOut,
    description: 'Keluar dari akun aplikasi (logout).',
    standardSize: 18,
    colorClass: 'text-rose-600',
    keywords: ["logout","keluar","sign out"]
  },
  {
    category: 'users',
    categoryName: 'Pengguna & Akses',
    name: 'PhoneContactIcon',
    lucideName: 'Phone',
    component: Phone,
    description: 'Nomor telepon WhatsApp pelanggan / supplier.',
    standardSize: 18,
    colorClass: 'text-emerald-600',
    keywords: ["phone","telepon","whatsapp","kontak"]
  },
  {
    category: 'users',
    categoryName: 'Pengguna & Akses',
    name: 'MailContactIcon',
    lucideName: 'Mail',
    component: Mail,
    description: 'Alamat email pengiriman invoice atau verifikasi.',
    standardSize: 18,
    colorClass: 'text-indigo-600',
    keywords: ["mail","email","surat"]
  },
  {
    category: 'system',
    categoryName: 'Sistem & Server',
    name: 'DashboardIcon',
    lucideName: 'LayoutDashboard',
    component: LayoutDashboard,
    description: 'Halaman dashboard utama dan ringkasan metrik.',
    standardSize: 18,
    colorClass: 'text-indigo-600',
    keywords: ["dashboard","beranda","layout"]
  },
  {
    category: 'system',
    categoryName: 'Sistem & Server',
    name: 'AiSparkleIcon',
    lucideName: 'Sparkles',
    component: Sparkles,
    description: 'Asisten AI Bizora, rekomendasi cerdas otomatis.',
    standardSize: 18,
    colorClass: 'text-amber-500',
    keywords: ["sparkles","ai","cerdas","otomatis"]
  },
  {
    category: 'system',
    categoryName: 'Sistem & Server',
    name: 'AiBotIcon',
    lucideName: 'Bot',
    component: Bot,
    description: 'Chatbot AI dan automasi bot WhatsApp notifikasi.',
    standardSize: 18,
    colorClass: 'text-indigo-600',
    keywords: ["bot","robot","ai chat","automasi"]
  },
  {
    category: 'system',
    categoryName: 'Sistem & Server',
    name: 'ServerCogIcon',
    lucideName: 'ServerCog',
    component: ServerCog,
    description: 'Monitoring performa server, background jobs, worker.',
    standardSize: 18,
    colorClass: 'text-slate-700',
    keywords: ["server","monitoring","backend","worker"]
  },
  {
    category: 'system',
    categoryName: 'Sistem & Server',
    name: 'ServerHostIcon',
    lucideName: 'Server',
    component: Server,
    description: 'Infrastruktur cloud hosting & status node API.',
    standardSize: 18,
    colorClass: 'text-slate-700',
    keywords: ["server host","cloud","api"]
  },
  {
    category: 'system',
    categoryName: 'Sistem & Server',
    name: 'DatabaseIcon',
    lucideName: 'Database',
    component: Database,
    description: 'Basis data multi-tenant, tabel database, dan relasi.',
    standardSize: 18,
    colorClass: 'text-slate-700',
    keywords: ["database","basis data","tabel"]
  },
  {
    category: 'system',
    categoryName: 'Sistem & Server',
    name: 'SettingsIcon',
    lucideName: 'Settings',
    component: Settings,
    description: 'Pengaturan sistem, preferensi outlet, dan konfigurasi umum.',
    standardSize: 18,
    colorClass: 'text-slate-600',
    keywords: ["settings","pengaturan","opsi"]
  },
  {
    category: 'system',
    categoryName: 'Sistem & Server',
    name: 'TenantBuildingIcon',
    lucideName: 'Building2',
    component: Building2,
    description: 'Profil perusahaan tenant SaaS dan entitas usaha.',
    standardSize: 18,
    colorClass: 'text-slate-700',
    keywords: ["building","perusahaan","tenant","pt","cv"]
  },
  {
    category: 'system',
    categoryName: 'Sistem & Server',
    name: 'BuildingAltIcon',
    lucideName: 'Building',
    component: Building,
    description: 'Gedung kantor dan lokasi properti usaha.',
    standardSize: 18,
    colorClass: 'text-slate-700',
    keywords: ["building","gedung","kantor"]
  },
  {
    category: 'system',
    categoryName: 'Sistem & Server',
    name: 'LandmarkIcon',
    lucideName: 'Landmark',
    component: Landmark,
    description: 'Bank penyedia rekening dan integrasi payment gateway resmi.',
    standardSize: 18,
    colorClass: 'text-indigo-700',
    keywords: ["bank","rekening","landmark","keuangan"]
  },
  {
    category: 'system',
    categoryName: 'Sistem & Server',
    name: 'HomeIcon',
    lucideName: 'Home',
    component: Home,
    description: 'Beranda awal aplikasi toko atau landing page.',
    standardSize: 18,
    colorClass: 'text-indigo-600',
    keywords: ["home","beranda","rumah"]
  },
  {
    category: 'system',
    categoryName: 'Sistem & Server',
    name: 'LayersIcon',
    lucideName: 'Layers',
    component: Layers,
    description: 'Kategori hierarkis dan arsitektur modul berlapis.',
    standardSize: 18,
    colorClass: 'text-indigo-600',
    keywords: ["layers","kategori","lapisan","modul"]
  },
  {
    category: 'system',
    categoryName: 'Sistem & Server',
    name: 'LayoutIcon',
    lucideName: 'Layout',
    component: Layout,
    description: 'Tata letak halaman dan struktur template tampilan.',
    standardSize: 18,
    colorClass: 'text-slate-600',
    keywords: ["layout","tata letak","struktur"]
  },
  {
    category: 'system',
    categoryName: 'Sistem & Server',
    name: 'DocsIcon',
    lucideName: 'BookOpen',
    component: BookOpen,
    description: 'Pusat dokumentasi sistem, panduan modul, dan kamus.',
    standardSize: 18,
    colorClass: 'text-indigo-600',
    keywords: ["docs","buku","panduan","dokumentasi"]
  },
  {
    category: 'system',
    categoryName: 'Sistem & Server',
    name: 'DocumentIcon',
    lucideName: 'FileText',
    component: FileText,
    description: 'Berkas dokumen, laporan teks, dan surat resmi.',
    standardSize: 18,
    colorClass: 'text-slate-600',
    keywords: ["document","file","laporan","dokumen"]
  },
  {
    category: 'system',
    categoryName: 'Sistem & Server',
    name: 'SpreadsheetIcon',
    lucideName: 'FileSpreadsheet',
    component: FileSpreadsheet,
    description: 'Berkas laporan Excel XLS / CSV keuangan.',
    standardSize: 18,
    colorClass: 'text-emerald-700',
    keywords: ["excel","spreadsheet","csv","lembar kerja"]
  },
  {
    category: 'system',
    categoryName: 'Sistem & Server',
    name: 'FileCheckIcon',
    lucideName: 'FileCheck',
    component: FileCheck,
    description: 'Dokumen legalitas KYC terverifikasi.',
    standardSize: 18,
    colorClass: 'text-emerald-600',
    keywords: ["file check","dokumen sah","nib","ktp"]
  },
  {
    category: 'system',
    categoryName: 'Sistem & Server',
    name: 'FileCodeIcon',
    lucideName: 'FileCode',
    component: FileCode,
    description: 'Berkas kode sumber, skrip integrasi developer.',
    standardSize: 18,
    colorClass: 'text-indigo-600',
    keywords: ["code file","skrip","developer"]
  },
  {
    category: 'system',
    categoryName: 'Sistem & Server',
    name: 'FileEditIcon',
    lucideName: 'FileEdit',
    component: FileEdit,
    description: 'Draft dokumen dalam proses penyuntingan.',
    standardSize: 18,
    colorClass: 'text-amber-600',
    keywords: ["draft","edit file"]
  },
  {
    category: 'system',
    categoryName: 'Sistem & Server',
    name: 'FolderIcon',
    lucideName: 'Folder',
    component: Folder,
    description: 'Folder direktori berkas atau arsip dokumen.',
    standardSize: 18,
    colorClass: 'text-amber-500',
    keywords: ["folder","direktori","arsip"]
  },
  {
    category: 'system',
    categoryName: 'Sistem & Server',
    name: 'FolderArchiveIcon',
    lucideName: 'FolderArchive',
    component: FolderArchive,
    description: 'Arsip dokumen lampau yang telah ditutup.',
    standardSize: 18,
    colorClass: 'text-slate-600',
    keywords: ["archive","arsip folder"]
  },
  {
    category: 'system',
    categoryName: 'Sistem & Server',
    name: 'FolderTreeIcon',
    lucideName: 'FolderTree',
    component: FolderTree,
    description: 'Struktur pohon direktori file dan modul.',
    standardSize: 18,
    colorClass: 'text-indigo-600',
    keywords: ["tree","hierarki folder"]
  },
  {
    category: 'system',
    categoryName: 'Sistem & Server',
    name: 'BackupIcon',
    lucideName: 'Archive',
    component: Archive,
    description: 'Cadangan data (backup database) dan pemulihan arsip.',
    standardSize: 18,
    colorClass: 'text-slate-600',
    keywords: ["backup","cadangan","archive","pulihkan"]
  },
  {
    category: 'system',
    categoryName: 'Sistem & Server',
    name: 'CalendarIcon',
    lucideName: 'Calendar',
    component: Calendar,
    description: 'Pilihan tanggal transaksi dan filter rentang waktu.',
    standardSize: 18,
    colorClass: 'text-indigo-600',
    keywords: ["calendar","tanggal","kalender"]
  },
  {
    category: 'system',
    categoryName: 'Sistem & Server',
    name: 'CalendarCheckIcon',
    lucideName: 'CalendarCheck',
    component: CalendarCheck,
    description: 'Jadwal janji temu servis atau booking meja terkonfirmasi.',
    standardSize: 18,
    colorClass: 'text-emerald-600',
    keywords: ["booking","jadwal konfirmasi","janji"]
  },
  {
    category: 'system',
    categoryName: 'Sistem & Server',
    name: 'CalendarRangeIcon',
    lucideName: 'CalendarRange',
    component: CalendarRange,
    description: 'Rentang periode laporan (tanggal awal s/d akhir).',
    standardSize: 18,
    colorClass: 'text-indigo-600',
    keywords: ["periode","rentang tanggal","date range"]
  },
  {
    category: 'system',
    categoryName: 'Sistem & Server',
    name: 'TimeIcon',
    lucideName: 'Clock',
    component: Clock,
    description: 'Waktu operasional, jam transaksi, dan timer pesanan.',
    standardSize: 18,
    colorClass: 'text-slate-600',
    keywords: ["clock","jam","waktu","durasi"]
  },
  {
    category: 'system',
    categoryName: 'Sistem & Server',
    name: 'LocationIcon',
    lucideName: 'MapPin',
    component: MapPin,
    description: 'Alamat outlet merchant, lokasi pengiriman kurir.',
    standardSize: 18,
    colorClass: 'text-rose-500',
    keywords: ["location","lokasi","alamat","map pin"]
  },
  {
    category: 'system',
    categoryName: 'Sistem & Server',
    name: 'GlobalIcon',
    lucideName: 'Globe',
    component: Globe,
    description: 'Landing page publik, domain web, dan bahasa global.',
    standardSize: 18,
    colorClass: 'text-indigo-600',
    keywords: ["globe","web","internet","domain"]
  },
  {
    category: 'system',
    categoryName: 'Sistem & Server',
    name: 'PasswordKeyIcon',
    lucideName: 'KeyRound',
    component: KeyRound,
    description: 'Kunci enkripsi, token API developer, dan PIN.',
    standardSize: 18,
    colorClass: 'text-slate-600',
    keywords: ["key","kunci","token","pin"]
  },
  {
    category: 'system',
    categoryName: 'Sistem & Server',
    name: 'KeyAltIcon',
    lucideName: 'Key',
    component: Key,
    description: 'Varian kunci akses rahasia (API Secret Key).',
    standardSize: 18,
    colorClass: 'text-amber-600',
    keywords: ["api key","kunci rahasia"]
  },
  {
    category: 'system',
    categoryName: 'Sistem & Server',
    name: 'CpuIcon',
    lucideName: 'Cpu',
    component: Cpu,
    description: 'Penggunaan CPU server backend dan beban komputasi.',
    standardSize: 18,
    colorClass: 'text-indigo-600',
    keywords: ["cpu","prosesor","server load"]
  },
  {
    category: 'system',
    categoryName: 'Sistem & Server',
    name: 'ActivityIcon',
    lucideName: 'Activity',
    component: Activity,
    description: 'Monitoring aktivitas realtime sistem dan throughput API.',
    standardSize: 18,
    colorClass: 'text-emerald-600',
    keywords: ["activity","aktivitas","metrik live"]
  },
  {
    category: 'system',
    categoryName: 'Sistem & Server',
    name: 'HardDriveIcon',
    lucideName: 'HardDrive',
    component: HardDrive,
    description: 'Kapasitas penyimpanan storage media dan disk space.',
    standardSize: 18,
    colorClass: 'text-slate-700',
    keywords: ["hard drive","storage","disk"]
  },
  {
    category: 'system',
    categoryName: 'Sistem & Server',
    name: 'DiskDownloadIcon',
    lucideName: 'HardDriveDownload',
    component: HardDriveDownload,
    description: 'Download file backup database (.sql / .zip).',
    standardSize: 18,
    colorClass: 'text-indigo-600',
    keywords: ["backup download","unduh database"]
  },
  {
    category: 'system',
    categoryName: 'Sistem & Server',
    name: 'TerminalIcon',
    lucideName: 'Terminal',
    component: Terminal,
    description: 'Konsol perintah CLI dan log eksekusi developer.',
    standardSize: 18,
    colorClass: 'text-slate-800',
    keywords: ["terminal","cli","konsol","perintah"]
  },
  {
    category: 'system',
    categoryName: 'Sistem & Server',
    name: 'CodeIcon',
    lucideName: 'Code',
    component: Code,
    description: 'Tag kode JSX / HTML atau konfigurasi webhook.',
    standardSize: 18,
    colorClass: 'text-indigo-600',
    keywords: ["code","kode","syntax"]
  },
  {
    category: 'system',
    categoryName: 'Sistem & Server',
    name: 'Code2Icon',
    lucideName: 'Code2',
    component: Code2,
    description: 'Varian icon kode pemulaian developer.',
    standardSize: 18,
    colorClass: 'text-indigo-600',
    keywords: ["code2","developer api"]
  },
  {
    category: 'system',
    categoryName: 'Sistem & Server',
    name: 'WebhookIcon',
    lucideName: 'Webhook',
    component: Webhook,
    description: 'Webhook event pengiriman data otomatis ke server klien.',
    standardSize: 18,
    colorClass: 'text-violet-600',
    keywords: ["webhook","event","callback"]
  },
  {
    category: 'system',
    categoryName: 'Sistem & Server',
    name: 'LinkIcon',
    lucideName: 'Link',
    component: Link,
    description: 'Tautan URL terhubung.',
    standardSize: 16,
    colorClass: 'text-indigo-600',
    keywords: ["link","tautan","url"]
  },
  {
    category: 'system',
    categoryName: 'Sistem & Server',
    name: 'Link2Icon',
    lucideName: 'Link2',
    component: Link2,
    description: 'Integrasi terhubung antara marketplace dan toko.',
    standardSize: 16,
    colorClass: 'text-indigo-600',
    keywords: ["integrasi","koneksi"]
  },
  {
    category: 'system',
    categoryName: 'Sistem & Server',
    name: 'LinkDisconnectIcon',
    lucideName: 'Link2Off',
    component: Link2Off,
    description: 'Koneksi integrasi terputus.',
    standardSize: 16,
    colorClass: 'text-rose-600',
    keywords: ["terputus","disconnect"]
  },
  {
    category: 'system',
    categoryName: 'Sistem & Server',
    name: 'ZapIcon',
    lucideName: 'Zap',
    component: Zap,
    description: 'Fitur instan otomatis dan pemicu webhook realtime.',
    standardSize: 18,
    colorClass: 'text-amber-500',
    keywords: ["zap","kilat","otomatis","cepat"]
  },
  {
    category: 'system',
    categoryName: 'Sistem & Server',
    name: 'RocketIcon',
    lucideName: 'Rocket',
    component: Rocket,
    description: 'Peluncuran produk baru atau onboarding bisnis.',
    standardSize: 18,
    colorClass: 'text-indigo-600',
    keywords: ["rocket","launch","peluncuran"]
  },
  {
    category: 'system',
    categoryName: 'Sistem & Server',
    name: 'BroadcastIcon',
    lucideName: 'Megaphone',
    component: Megaphone,
    description: 'Siaran pengumuman ke seluruh tenant merchant.',
    standardSize: 18,
    colorClass: 'text-indigo-600',
    keywords: ["broadcast","pengumuman","toa","siaran"]
  },
  {
    category: 'system',
    categoryName: 'Sistem & Server',
    name: 'RadioIcon',
    lucideName: 'Radio',
    component: Radio,
    description: 'Frekuensi siaran atau sensor radio IoT.',
    standardSize: 18,
    colorClass: 'text-slate-600',
    keywords: ["radio","sinyal","frekuensi"]
  },
  {
    category: 'system',
    categoryName: 'Sistem & Server',
    name: 'SendIcon',
    lucideName: 'Send',
    component: Send,
    description: 'Kirim pesan notifikasi, invoice email, atau pesan chat.',
    standardSize: 18,
    colorClass: 'text-indigo-600',
    keywords: ["send","kirim","pesan"]
  },
  {
    category: 'system',
    categoryName: 'Sistem & Server',
    name: 'InboxIcon',
    lucideName: 'Inbox',
    component: Inbox,
    description: 'Kotak masuk tiket pelanggan atau antrean pengajuan.',
    standardSize: 18,
    colorClass: 'text-indigo-600',
    keywords: ["inbox","kotak masuk","antrean"]
  },
  {
    category: 'system',
    categoryName: 'Sistem & Server',
    name: 'MessageSquareIcon',
    lucideName: 'MessageSquare',
    component: MessageSquare,
    description: 'Ulasan rating pelanggan atau komentar transaksi.',
    standardSize: 18,
    colorClass: 'text-indigo-600',
    keywords: ["message","pesan","komentar"]
  },
  {
    category: 'system',
    categoryName: 'Sistem & Server',
    name: 'MessageCircleIcon',
    lucideName: 'MessageCircle',
    component: MessageCircle,
    description: 'Gelembung obrolan live chat pelanggan.',
    standardSize: 18,
    colorClass: 'text-emerald-600',
    keywords: ["chat","obrolan","wa"]
  },
  {
    category: 'system',
    categoryName: 'Sistem & Server',
    name: 'CameraProofIcon',
    lucideName: 'Camera',
    component: Camera,
    description: 'Ambil foto bukti KTP KYC, foto kerusakan unit, atau struk.',
    standardSize: 18,
    colorClass: 'text-slate-600',
    keywords: ["camera","kamera","foto bukti"]
  },
  {
    category: 'system',
    categoryName: 'Sistem & Server',
    name: 'ImageIcon',
    lucideName: 'Image',
    component: Image,
    description: 'Galeri foto produk, banner promosi, atau logo tenant.',
    standardSize: 18,
    colorClass: 'text-slate-600',
    keywords: ["image","gambar","foto","banner"]
  },
  {
    category: 'system',
    categoryName: 'Sistem & Server',
    name: 'TicketIcon',
    lucideName: 'Ticket',
    component: Ticket,
    description: 'Tiket nomor antrean kasir, tiket bantuan support.',
    standardSize: 18,
    colorClass: 'text-indigo-600',
    keywords: ["ticket","tiket","antrean"]
  },
  {
    category: 'system',
    categoryName: 'Sistem & Server',
    name: 'GiftIcon',
    lucideName: 'Gift',
    component: Gift,
    description: 'Hadiah voucher promo, loyalty reward pelanggan.',
    standardSize: 18,
    colorClass: 'text-rose-500',
    keywords: ["gift","hadiah","voucher","promo"]
  },
  {
    category: 'system',
    categoryName: 'Sistem & Server',
    name: 'BadgePercentIcon',
    lucideName: 'BadgePercent',
    component: BadgePercent,
    description: 'Lencana kupon potongan harga belanja.',
    standardSize: 18,
    colorClass: 'text-amber-500',
    keywords: ["diskon","potongan","promo"]
  },
  {
    category: 'system',
    categoryName: 'Sistem & Server',
    name: 'MonitorDisplayIcon',
    lucideName: 'Monitor',
    component: Monitor,
    description: 'Layar komputer kasir atau Kitchen Display Screen.',
    standardSize: 18,
    colorClass: 'text-slate-700',
    keywords: ["monitor","layar","display"]
  },
  {
    category: 'system',
    categoryName: 'Sistem & Server',
    name: 'SmartphoneIcon',
    lucideName: 'Smartphone',
    component: Smartphone,
    description: 'Aplikasi mobile kasir Android/iOS.',
    standardSize: 18,
    colorClass: 'text-slate-700',
    keywords: ["smartphone","hp","mobile","android"]
  },
  {
    category: 'system',
    categoryName: 'Sistem & Server',
    name: 'WifiIcon',
    lucideName: 'Wifi',
    component: Wifi,
    description: 'Status koneksi internet online stabil.',
    standardSize: 18,
    colorClass: 'text-emerald-600',
    keywords: ["wifi","sinyal","online"]
  },
  {
    category: 'system',
    categoryName: 'Sistem & Server',
    name: 'WifiOffIcon',
    lucideName: 'WifiOff',
    component: WifiOff,
    description: 'Mode offline kasir POS (tanpa internet).',
    standardSize: 18,
    colorClass: 'text-rose-500',
    keywords: ["offline","tanpa internet","wifi mati"]
  },
  {
    category: 'system',
    categoryName: 'Sistem & Server',
    name: 'TypographyIcon',
    lucideName: 'Type',
    component: Type,
    description: 'Pengaturan font, tipografi, dan ukuran teks.',
    standardSize: 18,
    colorClass: 'text-indigo-600',
    keywords: ["type","font","huruf","teks"]
  },
  {
    category: 'system',
    categoryName: 'Sistem & Server',
    name: 'HashIcon',
    lucideName: 'Hash',
    component: Hash,
    description: 'Nomor indeks baris tabel atau kode nomor referensi.',
    standardSize: 16,
    colorClass: 'text-slate-500',
    keywords: ["hash","nomor","angka"]
  },
  {
    category: 'system',
    categoryName: 'Sistem & Server',
    name: 'PaletteThemeIcon',
    lucideName: 'Palette',
    component: Palette,
    description: 'Pilihan tema warna dan branding tenant.',
    standardSize: 18,
    colorClass: 'text-violet-600',
    keywords: ["palette","tema","warna","desain"]
  },
  {
    category: 'system',
    categoryName: 'Sistem & Server',
    name: 'QuoteIcon',
    lucideName: 'Quote',
    component: Quote,
    description: 'Kutipan testimoni pelanggan di landing page.',
    standardSize: 18,
    colorClass: 'text-indigo-400',
    keywords: ["quote","kutipan","testimoni"]
  },
  {
    category: 'system',
    categoryName: 'Sistem & Server',
    name: 'BinaryDataIcon',
    lucideName: 'Binary',
    component: Binary,
    description: 'Enkripsi data rahasia dan protokol keamanan.',
    standardSize: 18,
    colorClass: 'text-indigo-600',
    keywords: ["binary","enkripsi","biner"]
  },
  {
    category: 'system',
    categoryName: 'Sistem & Server',
    name: 'GitCommitIcon',
    lucideName: 'GitCommit',
    component: GitCommit,
    description: 'Versi rilis pembaruan sistem dan riwayat commit.',
    standardSize: 18,
    colorClass: 'text-slate-600',
    keywords: ["git","commit","versi"]
  },
  {
    category: 'system',
    categoryName: 'Sistem & Server',
    name: 'NetworkTopologyIcon',
    lucideName: 'Network',
    component: Network,
    description: 'Jaringan multi-cabang outlet dan sinkronisasi mesh.',
    standardSize: 18,
    colorClass: 'text-indigo-600',
    keywords: ["network","jaringan","koneksi cabang"]
  },
  {
    category: 'system',
    categoryName: 'Sistem & Server',
    name: 'ShareIcon',
    lucideName: 'Share2',
    component: Share2,
    description: 'Bagikan nota struk via WhatsApp atau tautan invoice.',
    standardSize: 18,
    colorClass: 'text-indigo-600',
    keywords: ["share","bagikan","kirim nota"]
  },
  {
    category: 'system',
    categoryName: 'Sistem & Server',
    name: 'VolumeIcon',
    lucideName: 'Volume2',
    component: Volume2,
    description: 'Suara bel notifikasi kasir berbunyi.',
    standardSize: 18,
    colorClass: 'text-slate-600',
    keywords: ["volume","suara","bel"]
  },
  {
    category: 'system',
    categoryName: 'Sistem & Server',
    name: 'MuteIcon',
    lucideName: 'VolumeX',
    component: VolumeX,
    description: 'Matikan suara bel kasir.',
    standardSize: 18,
    colorClass: 'text-slate-400',
    keywords: ["mute","hening","senyap"]
  },
  {
    category: 'system',
    categoryName: 'Sistem & Server',
    name: 'DarkModeIcon',
    lucideName: 'Moon',
    component: Moon,
    description: 'Beralih ke mode gelap (Dark Mode).',
    standardSize: 18,
    colorClass: 'text-indigo-400',
    keywords: ["moon","dark mode","gelap","malam"]
  },
  {
    category: 'system',
    categoryName: 'Sistem & Server',
    name: 'HamburgerMenuIcon',
    lucideName: 'Menu',
    component: Menu,
    description: 'Buka navigasi sidebar mobile (garis 3).',
    standardSize: 20,
    colorClass: 'text-slate-700',
    keywords: ["menu","hamburger","sidebar","garis tiga"]
  },
  {
    category: 'table',
    categoryName: 'Tabel & Toolbar',
    name: 'AlignLeftIcon',
    lucideName: 'AlignLeft',
    component: AlignLeft,
    description: 'Perataan teks kiri pada tabel dan artikel.',
    standardSize: 16,
    colorClass: 'text-slate-600',
    keywords: ["align","rata kiri","teks"]
  },
  {
    category: 'table',
    categoryName: 'Tabel & Toolbar',
    name: 'SquareIcon',
    lucideName: 'Square',
    component: Square,
    description: 'Bentuk kotak batas area atau tombol stop.',
    standardSize: 16,
    colorClass: 'text-slate-500',
    keywords: ["square","kotak","persegi"]
  },
  {
    category: 'system',
    categoryName: 'Sistem & Server',
    name: 'BugIcon',
    lucideName: 'Bug',
    component: Bug,
    description: 'Pelaporan kendala teknis atau bug sistem.',
    standardSize: 16,
    colorClass: 'text-rose-600',
    keywords: ["bug","kutu","error","kendala"]
  },
  {
    category: 'system',
    categoryName: 'Sistem & Server',
    name: 'LightbulbIcon',
    lucideName: 'Lightbulb',
    component: Lightbulb,
    description: 'Tips panduan bisnis, saran AI, atau ide optimasi.',
    standardSize: 18,
    colorClass: 'text-amber-500',
    keywords: ["idea","tips","saran","lampu","ide"]
  },
  {
    category: 'system',
    categoryName: 'Sistem & Server',
    name: 'MouseClickIcon',
    lucideName: 'MousePointerClick',
    component: MousePointerClick,
    description: 'Indikator elemen tombol interaktif atau klik pengguna.',
    standardSize: 18,
    colorClass: 'text-indigo-600',
    keywords: ["click","klik","kursor","pilih"]
  },
  {
    category: 'system',
    categoryName: 'Sistem & Server',
    name: 'PluginIcon',
    lucideName: 'Plug',
    component: Plug,
    description: 'Plugin tambahan, integrasi hardware scanner / printer POS.',
    standardSize: 18,
    colorClass: 'text-indigo-600',
    keywords: ["plug","colokan","plugin","perangkat"]
  },
  {
    category: 'system',
    categoryName: 'Sistem & Server',
    name: 'ToggleOffIcon',
    lucideName: 'ToggleLeft',
    component: ToggleLeft,
    description: 'Saklar switch non-aktif (OFF).',
    standardSize: 20,
    colorClass: 'text-slate-400',
    keywords: ["toggle off","saklar mati","nonaktif"]
  },
  {
    category: 'system',
    categoryName: 'Sistem & Server',
    name: 'ToggleOnIcon',
    lucideName: 'ToggleRight',
    component: ToggleRight,
    description: 'Saklar switch aktif (ON).',
    standardSize: 20,
    colorClass: 'text-emerald-500',
    keywords: ["toggle on","saklar hidup","aktif"]
  }
];
