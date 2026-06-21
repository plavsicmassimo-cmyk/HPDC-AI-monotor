import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import type { SubstanceEntry } from '../../types/imds';
import { SUBSTANCE_LIBRARY, lookupSubstance } from '../../data/substanceLibrary';
import { generateId } from '../../engine/idGenerator';

interface Props {
  substances: SubstanceEntry[];
  onAdd: (substance: SubstanceEntry) => void;
  onUpdatePercent: (substanceId: string, massPercent: number) => void;
  onRemove: (substanceId: string) => void;
}

export function SubstanceTable({ substances, onAdd, onUpdatePercent, onRemove }: Props) {
  const [casInput, setCasInput] = useState('');
  const [percentInput, setPercentInput] = useState('');

  const sum = substances.reduce((acc, s) => acc + s.massPercent, 0);

  function handleAdd() {
    const master = lookupSubstance(casInput.trim());
    const percent = parseFloat(percentInput);
    if (!casInput.trim() || isNaN(percent)) return;
    onAdd({
      id: generateId('sub'),
      casNumber: casInput.trim(),
      name: master?.name ?? 'Unknown substance (verify CAS)',
      massPercent: percent,
      svhc: master?.svhc ?? false,
      svhcDate: master?.svhcDate,
      rohsRestricted: master?.rohsRestricted ?? false,
      rohsThresholdPercent: master?.rohsThresholdPercent,
      gadslClass: master?.gadslClass ?? null,
    });
    setCasInput('');
    setPercentInput('');
  }

  return (
    <div>
      <table className="mds-table">
        <thead>
          <tr>
            <th>CAS Number</th>
            <th>Substance Name</th>
            <th>Mass %</th>
            <th>REACH SVHC</th>
            <th>RoHS</th>
            <th>GADSL</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {substances.map((s) => (
            <tr key={s.id}>
              <td className="font-mono">{s.casNumber}</td>
              <td>{s.name}</td>
              <td>
                <input
                  type="number"
                  step="0.01"
                  value={s.massPercent}
                  onChange={(e) => onUpdatePercent(s.id, parseFloat(e.target.value) || 0)}
                  className="w-20 border border-slate-300 rounded px-1.5 py-0.5"
                />
              </td>
              <td>
                {s.svhc ? (
                  <span className="text-compliance-fail font-semibold">SVHC</span>
                ) : (
                  <span className="text-slate-400">—</span>
                )}
              </td>
              <td>
                {s.rohsRestricted ? (
                  <span className="text-compliance-warn font-semibold">≤{s.rohsThresholdPercent}%</span>
                ) : (
                  <span className="text-slate-400">—</span>
                )}
              </td>
              <td>{s.gadslClass ? <span className="font-semibold">{s.gadslClass}</span> : <span className="text-slate-400">—</span>}</td>
              <td>
                <button onClick={() => onRemove(s.id)} className="p-1 rounded hover:bg-red-100 text-red-600">
                  <Trash2 size={14} />
                </button>
              </td>
            </tr>
          ))}
          <tr>
            <td>
              <input
                list="substance-library"
                value={casInput}
                onChange={(e) => setCasInput(e.target.value)}
                placeholder="CAS number"
                className="w-32 border border-slate-300 rounded px-1.5 py-0.5 font-mono"
              />
              <datalist id="substance-library">
                {SUBSTANCE_LIBRARY.map((s) => (
                  <option key={s.casNumber} value={s.casNumber}>
                    {s.name}
                  </option>
                ))}
              </datalist>
            </td>
            <td className="text-slate-400 text-xs italic">{lookupSubstance(casInput.trim())?.name ?? 'auto-filled from CAS'}</td>
            <td>
              <input
                type="number"
                step="0.01"
                value={percentInput}
                onChange={(e) => setPercentInput(e.target.value)}
                placeholder="%"
                className="w-20 border border-slate-300 rounded px-1.5 py-0.5"
              />
            </td>
            <td colSpan={3} />
            <td>
              <button onClick={handleAdd} className="p-1 rounded hover:bg-brand-100 text-brand-700">
                <Plus size={16} />
              </button>
            </td>
          </tr>
        </tbody>
      </table>
      <div className={`text-xs mt-1.5 font-medium ${Math.abs(sum - 100) > 0.5 ? 'text-compliance-warn' : 'text-slate-500'}`}>
        Mass balance: {sum.toFixed(2)}% of material {Math.abs(sum - 100) > 0.5 && '(should total 100%)'}
      </div>
    </div>
  );
}
