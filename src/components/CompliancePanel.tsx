import { AlertTriangle } from 'lucide-react';
import type { ModuleNode } from '../types/imds';
import { computeCompliance } from '../engine/compliance';
import { ComplianceBadge } from './common/ComplianceBadge';
import { formatPercent } from '../utils/format';

export function CompliancePanel({ rootNode }: { rootNode: ModuleNode }) {
  const report = computeCompliance(rootNode);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-700">Compliance Summary</h3>
        <ComplianceBadge status={report.overallStatus} />
      </div>

      <section>
        <h4 className="text-xs font-semibold uppercase text-slate-500 mb-1.5">RoHS Restricted Substances</h4>
        {report.rohsViolations.length === 0 ? (
          <p className="text-xs text-slate-500">No RoHS Annex II substances exceed their threshold.</p>
        ) : (
          <ul className="space-y-1.5">
            {report.rohsViolations.map((v, i) => (
              <li key={i} className="text-xs bg-red-50 border border-red-200 rounded px-2 py-1.5">
                <span className="font-semibold text-compliance-fail">{v.substanceName}</span> in{' '}
                <span className="font-medium">{v.nodeName}</span>: {formatPercent(v.effectivePercent)} exceeds {v.thresholdPercent}%
                threshold
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h4 className="text-xs font-semibold uppercase text-slate-500 mb-1.5">REACH SVHC (Art. 33 communication ≥0.1% w/w)</h4>
        {report.svhcFindings.length === 0 ? (
          <p className="text-xs text-slate-500">No SVHC Candidate List substances detected.</p>
        ) : (
          <ul className="space-y-1.5">
            {report.svhcFindings.map((f, i) => (
              <li
                key={i}
                className={`text-xs rounded px-2 py-1.5 border ${
                  f.meetsThreshold ? 'bg-amber-50 border-amber-200' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <span className="font-semibold text-compliance-warn">{f.substanceName}</span> ({f.casNumber}):{' '}
                {formatPercent(f.effectivePercent)} of module mass
                {f.meetsThreshold ? ' — communication duty applies' : ' — below 0.1% threshold'}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h4 className="text-xs font-semibold uppercase text-slate-500 mb-1.5">GADSL Declarable Substances</h4>
        {report.gadslDeclarable.length === 0 ? (
          <p className="text-xs text-slate-500">No GADSL Class D substances detected.</p>
        ) : (
          <ul className="space-y-1.5">
            {report.gadslDeclarable.map((f, i) => (
              <li key={i} className="text-xs bg-slate-50 border border-slate-200 rounded px-2 py-1.5">
                {f.substanceName} ({f.casNumber}) — {formatPercent(f.effectivePercent)} of module mass
              </li>
            ))}
          </ul>
        )}
      </section>

      {report.massBalanceWarnings.length > 0 && (
        <section>
          <h4 className="text-xs font-semibold uppercase text-slate-500 mb-1.5 flex items-center gap-1">
            <AlertTriangle size={13} className="text-compliance-warn" />
            Mass Balance Warnings
          </h4>
          <ul className="space-y-1.5">
            {report.massBalanceWarnings.map((w, i) => (
              <li key={i} className="text-xs bg-amber-50 border border-amber-200 rounded px-2 py-1.5">
                {w}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
