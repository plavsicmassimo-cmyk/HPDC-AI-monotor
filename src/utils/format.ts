import type { ModuleStatus } from '../types/imds';

export function formatPercent(value: number): string {
  return `${value.toFixed(2)}%`;
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: '2-digit' });
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export const STATUS_LABELS: Record<ModuleStatus, string> = {
  draft: 'Draft',
  'in-review': 'In Review',
  sent: 'Sent',
  accepted: 'Accepted',
  rejected: 'Rejected',
};

export const STATUS_COLORS: Record<ModuleStatus, string> = {
  draft: 'bg-gray-200 text-gray-700',
  'in-review': 'bg-amber-100 text-amber-800',
  sent: 'bg-blue-100 text-blue-800',
  accepted: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
};
