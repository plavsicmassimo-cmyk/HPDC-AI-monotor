import { CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
import clsx from 'clsx';
import type { ComplianceReport } from '../../types/imds';

const CONFIG: Record<ComplianceReport['overallStatus'], { label: string; classes: string; Icon: typeof CheckCircle2 }> = {
  pass: { label: 'Compliant', classes: 'bg-green-100 text-compliance-pass', Icon: CheckCircle2 },
  warn: { label: 'Needs Review', classes: 'bg-amber-100 text-compliance-warn', Icon: AlertTriangle },
  fail: { label: 'Non-Compliant', classes: 'bg-red-100 text-compliance-fail', Icon: XCircle },
};

export function ComplianceBadge({ status }: { status: ComplianceReport['overallStatus'] }) {
  const { label, classes, Icon } = CONFIG[status];
  return (
    <span className={clsx('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold', classes)}>
      <Icon size={13} />
      {label}
    </span>
  );
}
