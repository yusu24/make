import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  ClipboardList,
  Users,
  BookOpen,
  ShieldCheck,
  X,
  Wrench,
  FileText,
  Receipt,
  Package,
  Database,
  CreditCard,
  Wallet,
  Zap,
  ChevronDown,
  ChevronRight,
  TrendingUp,
  BarChart2,
  Building2,
  HelpCircle,
  ShoppingBag,
  User
} from '@/constants/icons';
import { useJasa } from '../contexts/JasaContext';
import { useAuth } from '../../../../contexts/AuthContext';
import bizoraLogo from '../../../../assets/bizora-logo.png';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenNewSpk?: () => void;
  onOpenAiAssistant?: () => void;
  urgentCount: number;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  totalOrders: number;
  availableTechsCount: number;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  badge?: string;
  badgeType?: 'urgent' | 'success' | 'pos' | 'neutral';
  permission?: string | string[];
}

interface NavGroup {
  type: 'link' | 'dropdown';
  id?: string;
  label?: string;
  icon?: React.ElementType;
  badge?: string;
  badgeType?: 'urgent' | 'success' | 'pos' | 'neutral';
  permission?: string | string[];
  children?: NavItem[];
}

export const hasJasaPermission = (user: any, requiredPerm?: string | string[]): boolean => {
  if (!user) return false;
  // Super admin, admin, owner, or users with permissions 'all' have full access
  if (user.role === 'super_admin' || user.role === 'admin' || user.role === 'owner' || user.role === 'customer') {
    return true;
  }
  if (user.permissions === 'all') return true;
  if (!requiredPerm) return true;

  const perms = user.permissions || {};
  const checkOne = (perm: string): boolean => {
    if (typeof perms === 'object' && !Array.isArray(perms)) {
      if (perms[perm] === true) return true;
      if (perms.all === true) return true;
      return false;
    }
    if (Array.isArray(perms)) {
      if (perms.includes('all')) return true;
      if (perms.includes(perm)) return true;
      if (perms.some((p: string) => perm.startsWith(p))) return true;
      return false;
    }
    return false;
  };

  if (Array.isArray(requiredPerm)) {
    return requiredPerm.some(p => checkOne(p));
  }
  return checkOne(requiredPerm);
};

interface FlyoutItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  badge?: string;
  badgeType?: string;
}

interface FlyoutGroup {
  id: string;
  label: string;
  items: FlyoutItem[];
}

const CollapsedGroupFlyout: React.FC<{
  group: FlyoutGroup;
  anchorY: number;
  onClose: () => void;
  activeTab: string;
  onSelect: (tab: string) => void;
}> = ({ group, anchorY, onClose, activeTab, onSelect }) => {
  const ref = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const timer = setTimeout(() => document.addEventListener('mousedown', handler), 50);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousedown', handler);
    };
  }, [onClose]);

  if (!group) return null;

  return (
    <div
      ref={ref}
      style={{
        position: 'fixed',
        left: 72,
        top: Math.max(8, Math.min(anchorY, window.innerHeight - 340)),
        zIndex: 1100,
        minWidth: 210,
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: 12,
        boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
        padding: 6,
      }}
    >
      <div style={{ padding: '6px 12px 8px', fontSize: 11.5, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #f1f5f9', marginBottom: 4 }}>
        {group.label}
      </div>
      {group.items.map(item => {
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => {
              onSelect(item.id);
              onClose();
            }}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 10,
              padding: '8px 12px',
              borderRadius: 8,
              fontSize: 13,
              border: 'none',
              cursor: 'pointer',
              color: isActive ? '#2563eb' : '#334155',
              background: isActive ? '#eff6ff' : 'transparent',
              fontWeight: isActive ? 700 : 500,
              textAlign: 'left',
              transition: 'background 0.15s',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0, overflow: 'hidden' }}>
              {item.icon && <span style={{ display: 'flex', color: isActive ? '#2563eb' : '#64748b', flexShrink: 0 }}>{item.icon}</span>}
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.label}</span>
            </div>
            {item.badge && (
              <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-extrabold flex-shrink-0 ${
                item.badgeType === 'urgent'
                  ? 'bg-rose-100 text-rose-700 animate-pulse'
                  : item.badgeType === 'success'
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-slate-100 text-slate-600'
              }`}>
                {item.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  onOpenNewSpk,
  onOpenAiAssistant,
  urgentCount,
  isOpenMobile,
  onCloseMobile,
  totalOrders,
  availableTechsCount,
  collapsed = false,
  onToggleCollapse,
}) => {
  const { user } = useAuth();
  const { terms } = useJasa();

  const navGroups: NavGroup[] = [
    {
      type: 'link',
      id: 'overview',
      label: 'Dashboard',
      icon: LayoutDashboard,
      permission: ['spk_view_all', 'spk_view_assigned', 'finance_view']
    },
    {
      type: 'link',
      id: 'pos',
      label: 'Kasir (POS)',
      icon: ShoppingBag,
      badge: 'POS',
      badgeType: 'pos',
      permission: 'pos_checkout'
    },
    {
      type: 'dropdown',
      id: 'operasional',
      label: 'Operasional Servis',
      icon: Wrench,
      children: [
        { 
          id: 'work-orders', 
          label: terms.workOrdersLabel || 'Daftar SPK', 
          icon: ClipboardList, 
          badge: urgentCount > 0 ? `${urgentCount} Darurat` : (totalOrders > 0 ? `${totalOrders}` : undefined),
          badgeType: urgentCount > 0 ? 'urgent' : 'neutral',
          permission: ['spk_view_all', 'spk_view_assigned']
        },
        { 
          id: 'contracts', 
          label: 'Jadwal & Kontrak', 
          icon: FileText,
          permission: 'contracts_manage'
        },
        { 
          id: 'technicians', 
          label: terms.techniciansLabel || 'Tim & Teknisi', 
          icon: Users,
          badge: availableTechsCount > 0 ? `${availableTechsCount} Siaga` : undefined,
          badgeType: 'success',
          permission: 'technicians_manage'
        },
        { 
          id: 'catalog', 
          label: 'Katalog Layanan', 
          icon: BookOpen,
          permission: 'catalog_manage'
        },
        { 
          id: 'inventory', 
          label: terms.sparepartsLabel || 'Stok & Material', 
          icon: Package,
          permission: ['inventory_view', 'inventory_manage']
        }
      ]
    },
    {
      type: 'dropdown',
      id: 'keuangan',
      label: 'Keuangan & Laporan',
      icon: Wallet,
      children: [
        {
          id: 'finance-summary',
          label: 'Laba Rugi',
          icon: TrendingUp,
          permission: 'finance_view'
        },
        {
          id: 'finance-expenses',
          label: 'Buku Kas',
          icon: Wallet,
          permission: 'finance_expenses'
        },
        {
          id: 'finance-invoices',
          label: 'Tagihan & Piutang',
          icon: Receipt,
          permission: 'pos_invoices'
        },
        {
          id: 'finance-payables',
          label: 'Hutang Vendor',
          icon: CreditCard,
          permission: 'finance_expenses'
        },
        {
          id: 'finance-accounts',
          label: 'Rekening & Bank',
          icon: Building2,
          permission: 'finance_accounts'
        },
        {
          id: 'analytics',
          label: 'Laporan & SLA',
          icon: ShieldCheck,
          permission: 'finance_view'
        }
      ]
    },
    {
      type: 'dropdown',
      id: 'pengaturan',
      label: 'Pengaturan',
      icon: Database,
      children: [
        { 
          id: 'settings', 
          label: 'Pengaturan Jasa', 
          icon: Wrench,
          permission: 'staff_manage'
        },
        { 
          id: 'roles', 
          label: 'Role & Hak Akses', 
          icon: ShieldCheck,
          permission: 'staff_manage'
        },
        { 
          id: 'staff', 
          label: 'Staf & Operator', 
          icon: Users,
          permission: 'staff_manage'
        },
        { 
          id: 'backup', 
          label: 'Backup Data', 
          icon: Database,
          permission: 'staff_manage'
        },
        { 
          id: 'developer-api', 
          label: 'Integrasi API', 
          icon: Zap,
          permission: 'staff_manage'
        }
      ]
    },
    {
      type: 'dropdown',
      id: 'bantuan',
      label: 'Bantuan & Akun',
      icon: HelpCircle,
      children: [
        { 
          id: 'profile', 
          label: 'Profil Pengguna', 
          icon: User,
        },
        { 
          id: 'guide', 
          label: 'Buku Panduan', 
          icon: BookOpen,
          badge: 'Panduan',
          badgeType: 'neutral'
        },
        { 
          id: 'subscription', 
          label: 'Paket Langganan', 
          icon: CreditCard,
          badge: 'Upgrade',
          badgeType: 'urgent',
          permission: 'staff_manage'
        }
      ]
    }
  ];

  // Filter groups according to user permissions
  const filteredNavGroups = navGroups
    .map(group => {
      if (group.type === 'link') {
        if (!hasJasaPermission(user, group.permission)) {
          return null;
        }
        return group;
      }
      const allowedChildren = (group.children || []).filter(item => hasJasaPermission(user, item.permission));
      if (allowedChildren.length === 0) {
        return null;
      }
      return {
        ...group,
        children: allowedChildren,
      };
    })
    .filter(Boolean) as NavGroup[];

  // Identify which group contains active tab
  const activeGroupId = filteredNavGroups.find(
    group => group.type === 'dropdown' && group.children?.some(c => c.id === activeTab)
  )?.id;

  const [collapsedActive, setCollapsedActive] = useState(false);
  const [expandedNonActive, setExpandedNonActive] = useState<string | null>(null);
  const [openSection, setOpenSection] = useState<string | null>(null);
  const [flyoutAnchorY, setFlyoutAnchorY] = useState(0);

  useEffect(() => {
    setCollapsedActive(false);
    setExpandedNonActive(null);
    setOpenSection(null);
  }, [activeTab]);

  const toggleGroup = (id: string) => {
    if (id === activeGroupId) {
      setCollapsedActive(prev => !prev);
    } else {
      setExpandedNonActive(prev => (prev === id ? null : id));
    }
  };

  const isGroupOpen = (id: string) => {
    if (id === activeGroupId) {
      return !collapsedActive;
    }
    return expandedNonActive === id;
  };

  const handleGroupIconClick = (groupId: string, e: React.MouseEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setFlyoutAnchorY(rect.top);
    setOpenSection(prev => (prev === groupId ? null : groupId));
  };

  const activeFlyoutGroup = filteredNavGroups.find(g => g.type === 'dropdown' && g.id === openSection);
  const flyoutGroupData: FlyoutGroup | null = activeFlyoutGroup ? {
    id: activeFlyoutGroup.id!,
    label: activeFlyoutGroup.label || '',
    items: (activeFlyoutGroup.children || []).map(c => ({
      id: c.id,
      label: c.label,
      icon: <c.icon className="w-4 h-4" />,
      badge: c.badge,
      badgeType: c.badgeType,
    }))
  } : null;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div 
          id="sidebar-backdrop"
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs lg:hidden transition-opacity"
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        id="main-sidebar"
        className={`fixed top-0 bottom-0 left-0 z-50 ${
          collapsed ? 'w-[68px]' : 'w-72'
        } bg-white flex flex-col justify-between transition-all duration-300 ease-in-out lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {/* Top Branding Section */}
        <div className="h-16 flex items-center justify-center relative w-full px-2">
          <div 
            id="sidebar-brand"
            className="flex items-center justify-center cursor-pointer group py-2"
            onClick={() => {
              setActiveTab('overview');
              onCloseMobile();
            }}
            title="Kembali ke Beranda"
          >
            <img 
              src={user?.store_icon_url || bizoraLogo} 
              alt="Logo" 
              className={`${
                collapsed ? 'max-h-8 max-w-[36px]' : 'max-h-10 max-w-[160px]'
              } w-auto h-auto object-contain transition-transform group-hover:scale-105`}
            />
          </div>

          {/* Mobile Close Button */}
          <button
            id="btn-close-sidebar-mobile"
            onClick={onCloseMobile}
            className="lg:hidden absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            aria-label="Tutup menu navigasi"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Collapsed Rail View */}
        {collapsed ? (
          <div className="flex-1 overflow-y-auto py-3 px-2 flex flex-col items-center space-y-2 scrollbar-none">
            {filteredNavGroups.map((group) => {
              if (group.type === 'link') {
                const Icon = group.icon!;
                const isActive = activeTab === group.id;

                return (
                  <button
                    key={group.id}
                    id={`nav-item-${group.id}`}
                    onClick={() => {
                      setActiveTab(group.id!);
                      setOpenSection(null);
                      onCloseMobile();
                    }}
                    title={group.label}
                    className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all relative cursor-pointer ${
                      isActive
                        ? 'bg-blue-50 text-blue-600 font-bold shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {group.badge && (
                      <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-600 ring-2 ring-white" />
                    )}
                  </button>
                );
              }

              const groupId = group.id!;
              const GroupIcon = group.icon!;
              const isGroupActive = group.children?.some(c => c.id === activeTab);
              const isFlyoutOpen = openSection === groupId;

              return (
                <button
                  key={groupId}
                  id={`nav-group-${groupId}`}
                  onClick={(e) => handleGroupIconClick(groupId, e)}
                  title={group.label}
                  className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all relative cursor-pointer ${
                    isGroupActive || isFlyoutOpen
                      ? 'bg-blue-50 text-blue-600 font-bold shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <GroupIcon className="w-5 h-5" />
                  {group.children?.some(c => c.badge) && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-600 ring-2 ring-white" />
                  )}
                </button>
              );
            })}
          </div>
        ) : (
          /* Expanded Navigation Links (Scrollable Accordion) */
          <div className="flex-1 overflow-y-auto px-3.5 py-3 space-y-1.5 scrollbar-none">
            {filteredNavGroups.map((group) => {
              if (group.type === 'link') {
                const Icon = group.icon!;
                const isActive = activeTab === group.id;

                return (
                  <button
                    key={group.id}
                    id={`nav-item-${group.id}`}
                    onClick={() => {
                      setActiveTab(group.id!);
                      onCloseMobile();
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-left transition-all group cursor-pointer ${
                      isActive
                        ? 'bg-blue-50 text-blue-700 font-bold shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-medium'
                    }`}
                  >
                    <div className="flex items-center space-x-3 min-w-0">
                      <div className={`w-5 h-5 flex items-center justify-center flex-shrink-0 transition-colors ${
                        isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'
                      }`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className={`text-[13.5px] truncate ${isActive ? 'font-bold text-blue-900' : 'font-medium text-slate-700'}`}>
                        {group.label}
                      </div>
                    </div>

                    {group.badge && (
                      <span className={`px-2 py-0.5 rounded-full text-[9.5px] font-extrabold flex-shrink-0 ml-2 ${
                        group.badgeType === 'pos'
                          ? 'bg-blue-100 text-blue-700 border border-blue-200'
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        {group.badge}
                      </span>
                    )}
                  </button>
                );
              }

              // Dropdown Group with Sub-menus
              const groupId = group.id!;
              const isOpen = isGroupOpen(groupId);
              const isGroupActive = group.children?.some(c => c.id === activeTab);
              const GroupIcon = group.icon!;

              return (
                <div key={groupId} className="space-y-1">
                  <button
                    type="button"
                    onClick={() => toggleGroup(groupId)}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-left transition-all group cursor-pointer ${
                      isGroupActive
                        ? 'bg-slate-100/80 text-slate-900 font-bold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-medium'
                    }`}
                  >
                    <div className="flex items-center space-x-3 min-w-0">
                      <div className={`w-5 h-5 flex items-center justify-center flex-shrink-0 transition-colors ${
                        isGroupActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'
                      }`}>
                        <GroupIcon className="w-5 h-5" />
                      </div>
                      <div className="text-[13.5px] truncate font-semibold text-slate-800">
                        {group.label}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {isOpen ? (
                        <ChevronDown className="w-4 h-4 text-slate-400" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                      )}
                    </div>
                  </button>

                  {/* Sub-menu items */}
                  {isOpen && group.children && (
                    <div className="pl-6 pr-1 py-1 space-y-1 border-l-2 border-slate-100 ml-4">
                      {group.children.map((child) => {
                        const SubIcon = child.icon;
                        const isSubActive = activeTab === child.id;

                        return (
                          <button
                            key={child.id}
                            id={`nav-item-${child.id}`}
                            onClick={() => {
                              setActiveTab(child.id);
                              onCloseMobile();
                            }}
                            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left transition-all cursor-pointer ${
                              isSubActive
                                ? 'bg-blue-50 text-blue-700 font-bold shadow-2xs'
                                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-medium'
                            }`}
                          >
                            <div className="flex items-center space-x-2.5 min-w-0">
                              <SubIcon className={`w-4 h-4 shrink-0 ${isSubActive ? 'text-blue-600' : 'text-slate-400'}`} />
                              <span className={`text-[12.5px] truncate ${isSubActive ? 'font-bold text-blue-900' : 'text-slate-700'}`}>
                                {child.label}
                              </span>
                            </div>

                            {child.badge && (
                              <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold flex-shrink-0 ml-1.5 ${
                                child.badgeType === 'urgent'
                                  ? 'bg-rose-100 text-rose-700 animate-pulse border border-rose-200'
                                  : child.badgeType === 'success'
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                  : 'bg-slate-100 text-slate-600'
                              }`}>
                                {child.badge}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </aside>

      {/* Pop-up Flyout in Collapsed Mode */}
      {collapsed && openSection && flyoutGroupData && (
        <CollapsedGroupFlyout
          group={flyoutGroupData}
          anchorY={flyoutAnchorY}
          onClose={() => setOpenSection(null)}
          activeTab={activeTab}
          onSelect={(tab) => {
            setActiveTab(tab);
            setOpenSection(null);
            onCloseMobile();
          }}
        />
      )}
    </>
  );
};
