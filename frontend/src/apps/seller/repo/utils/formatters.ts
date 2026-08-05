import { MarketplacePlatform } from '../types';

export function formatIDR(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function getPlatformBadgeColor(platform: MarketplacePlatform): {
  bg: string;
  text: string;
  border: string;
  dot: string;
} {
  switch (platform) {
    case 'Shopee':
      return {
        bg: 'bg-orange-50 dark:bg-orange-950/40',
        text: 'text-orange-600 dark:text-orange-400',
        border: 'border-orange-200 dark:border-orange-800/60',
        dot: 'bg-orange-500',
      };
    case 'Tokopedia':
      return {
        bg: 'bg-emerald-50 dark:bg-emerald-950/40',
        text: 'text-emerald-600 dark:text-emerald-400',
        border: 'border-emerald-200 dark:border-emerald-800/60',
        dot: 'bg-emerald-500',
      };
    case 'TikTok Shop':
      return {
        bg: 'bg-slate-900 text-slate-100 dark:bg-slate-800',
        text: 'text-rose-400',
        border: 'border-slate-700',
        dot: 'bg-rose-500',
      };
    case 'Lazada':
      return {
        bg: 'bg-blue-50 dark:bg-blue-950/40',
        text: 'text-blue-600 dark:text-blue-400',
        border: 'border-blue-200 dark:border-blue-800/60',
        dot: 'bg-blue-500',
      };
    case 'Blibli':
      return {
        bg: 'bg-sky-50 dark:bg-sky-950/40',
        text: 'text-sky-600 dark:text-sky-400',
        border: 'border-sky-200 dark:border-sky-800/60',
        dot: 'bg-sky-500',
      };
    default:
      return {
        bg: 'bg-gray-100 dark:bg-gray-800',
        text: 'text-gray-700 dark:text-gray-300',
        border: 'border-gray-200 dark:border-gray-700',
        dot: 'bg-gray-500',
      };
  }
}
