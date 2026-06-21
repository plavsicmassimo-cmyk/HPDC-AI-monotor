import { useMemo, useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { MATERIAL_TEMPLATES } from '../data/materialTemplates';
import { SUBSTANCE_LIBRARY } from '../data/substanceLibrary';

export function KnowledgeBasePage() {
  const [query, setQuery] = useState('');

  const filteredMaterials = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return MATERIAL_TEMPLATES;
    return MATERIAL_TEMPLATES.filter(
      (m) => m.name.toLowerCase().includes(q) || m.keywords.some((k) => k.includes(q))
    );
  }, [query]);

  const filteredSubstances = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return SUBSTANCE_LIBRARY;
    return SUBSTANCE_LIBRARY.filter((s) => s.name.toLowerCase().includes(q) || s.casNumber.includes(q));
  }, [query]);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-xl font-semibold text-slate-800 mb-1">Knowledge Base</h1>
      <p className="text-sm text-slate-500 mb-4">
        The material templates and substance library that power the AI drafting and compliance engine.
      </p>

      <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-md px-3 py-2 mb-5 text-xs text-amber-800">
        <AlertTriangle size={15} className="shrink-0 mt-0.5" />
        <span>
          This is a starter reference set, not a live regulatory feed. Compositions are typical/representative values
          and the SVHC / RoHS / GADSL flags must be validated and kept current by your EHS/compliance team against the
          official ECHA SVHC Candidate List, RoHS exemption annexes, and GADSL before relying on it for submissions.
        </span>
      </div>

      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Filter materials or substances by name, keyword, or CAS number..."
        className="w-full max-w-md mb-5 px-3 py-2 text-sm border border-slate-300 rounded-md bg-white"
      />

      <h2 className="text-sm font-semibold text-slate-700 mb-2">Material Templates ({filteredMaterials.length})</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8">
        {filteredMaterials.map((m) => (
          <div key={m.id} className="bg-white border border-slate-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-sm font-semibold text-slate-800">{m.name}</h3>
              <span className="text-[10px] uppercase font-semibold text-brand-700 bg-brand-50 px-1.5 py-0.5 rounded">
                {m.category}
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-2">{m.description}</p>
            <ul className="text-xs text-slate-600 list-disc pl-4">
              {m.substances.map((s) => (
                <li key={s.casNumber}>
                  {SUBSTANCE_LIBRARY.find((sub) => sub.casNumber === s.casNumber)?.name ?? s.casNumber} —{' '}
                  {s.percentTypical}%
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <h2 className="text-sm font-semibold text-slate-700 mb-2">Substance Library ({filteredSubstances.length})</h2>
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <table className="mds-table">
          <thead>
            <tr>
              <th>CAS Number</th>
              <th>Substance</th>
              <th>REACH SVHC</th>
              <th>RoHS Threshold</th>
              <th>GADSL Class</th>
            </tr>
          </thead>
          <tbody>
            {filteredSubstances.map((s) => (
              <tr key={s.casNumber}>
                <td className="font-mono">{s.casNumber}</td>
                <td>{s.name}</td>
                <td>{s.svhc ? `Yes (${s.svhcDate ?? 'n/a'})` : '—'}</td>
                <td>{s.rohsRestricted ? `${s.rohsThresholdPercent}%` : '—'}</td>
                <td>{s.gadslClass ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
