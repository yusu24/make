import { useAuth } from '../../../../contexts/AuthContext';

export interface OmnichannelAccessResult {
  isUnlocked: boolean;
  isDemo: boolean;
  plan: string;
}

/**
 * Hook to determine whether Omnichannel / Marketplace features are unlocked.
 *
 * Per requirements:
 * - Demo accounts (and sandbox demo users) are ALWAYS 100% UNLOCKED.
 * - Standard tenant accounts require Pro plan, marketplace feature, or marketplace addon.
 */
export const useOmnichannelAccess = (): OmnichannelAccessResult => {
  const { user } = useAuth();

  // 1. Detect demo sandbox, demo accounts, or admin/super_admin
  const isDemo = 
    sessionStorage.getItem('is_demo_sandbox') === 'true' ||
    Boolean(user?.tenant_id?.startsWith('TN-DS-')) ||
    Boolean(user?.tenant_id?.startsWith('TN-DK-')) ||
    user?.tenant_id === 'TN-SELLER' ||
    user?.tenant_id === 'TN-RETAIL' ||
    user?.tenant_id === 'TN-0001' ||
    Boolean(user?.email?.includes('demo')) ||
    user?.email === 'ahmad@retail.com' ||
    user?.role === 'super_admin' ||
    user?.role === 'admin';

  // 2. Check subscription plan and features for real accounts
  const isPlanPro = user?.subscription_plan === 'pro' || user?.subscription_plan === 'enterprise';
  const hasMarketplaceFeature = Boolean(user?.plan_features?.marketplace);
  const hasMarketplaceAddon = Boolean((user as any)?.has_marketplace_addon);

  // If demo, it is ALWAYS unlocked.
  const isUnlocked = isDemo || isPlanPro || hasMarketplaceFeature || hasMarketplaceAddon;

  return {
    isUnlocked,
    isDemo,
    plan: user?.subscription_plan || 'free'
  };
};

export default useOmnichannelAccess;
