import type { ModuleStatus } from '../../types/imds';
import { STATUS_COLORS, STATUS_LABELS } from '../../utils/format';
import clsx from 'clsx';

export function StatusBadge({ status }: { status: ModuleStatus }) {
  return (
    <span className={clsx('inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold', STATUS_COLORS[status])}>
      {STATUS_LABELS[status]}
    </span>
  );
}
