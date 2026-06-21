import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { FilePlus2, FileText, Copy, Trash2, Search } from 'lucide-react';
import { useImdsStore } from '../store/imdsStore';
import { StatusBadge } from '../components/common/StatusBadge';
import { ComplianceBadge } from '../components/common/ComplianceBadge';
import { computeCompliance } from '../engine/compliance';
import { formatDateTime } from '../utils/format';

export function DashboardPage() {
  const modules = useImdsStore((s) => s.modules);
  const deleteModule = useImdsStore((s) => s.deleteModule);
  const duplicateModule = useImdsStore((s) => s.duplicateModule);
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return modules;
    return modules.filter(
      (m) => m.name.toLowerCase().includes(q) || m.mdsId.toLowerCase().includes(q) || m.companyName.toLowerCase().includes(q)
    );
  }, [modules, query]);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-slate-800">Modules</h1>
          <p className="text-sm text-slate-500">IMDS-style material data sheets with REACH &amp; RoHS compliance checking.</p>
        </div>
        <Link
          to="/modules/new"
          className="flex items-center gap-1.5 bg-brand-700 text-white text-sm font-medium px-4 py-2 rounded-md hover:bg-brand-800"
        >
          <FilePlus2 size={16} />
          New Module
        </Link>
      </div>

      <div className="relative mb-4 max-w-sm">
        <Search size={15} className="absolute left-2.5 top-2.5 text-slate-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name, MDS ID, or company..."
          className="w-full pl-8 pr-3 py-2 text-sm border border-slate-300 rounded-md bg-white"
        />
      </div>

      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <table className="mds-table">
          <thead>
            <tr>
              <th>MDS ID</th>
              <th>Name</th>
              <th>Version</th>
              <th>Status</th>
              <th>Compliance</th>
              <th>Company</th>
              <th>Recipient</th>
              <th>Updated</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={9} className="text-center text-slate-400 py-8">
                  No modules yet. Create your first module to get started.
                </td>
              </tr>
            )}
            {filtered.map((m) => {
              const report = computeCompliance(m.rootNode);
              return (
                <tr key={m.id}>
                  <td className="font-mono">
                    <Link to={`/modules/${m.id}`} className="text-brand-700 hover:underline">
                      {m.mdsId}
                    </Link>
                  </td>
                  <td className="font-medium">{m.name}</td>
                  <td>{m.version}</td>
                  <td>
                    <StatusBadge status={m.status} />
                  </td>
                  <td>
                    <ComplianceBadge status={report.overallStatus} />
                  </td>
                  <td>{m.companyName}</td>
                  <td>{m.recipientName}</td>
                  <td className="whitespace-nowrap text-slate-500">{formatDateTime(m.updatedAt)}</td>
                  <td>
                    <div className="flex items-center gap-1">
                      <Link to={`/modules/${m.id}/datasheet`} title="Datasheet" className="p-1.5 rounded hover:bg-brand-100 text-brand-700">
                        <FileText size={15} />
                      </Link>
                      <button onClick={() => duplicateModule(m.id)} title="Duplicate" className="p-1.5 rounded hover:bg-slate-100">
                        <Copy size={15} />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Delete module "${m.name}"? This cannot be undone.`)) deleteModule(m.id);
                        }}
                        title="Delete"
                        className="p-1.5 rounded hover:bg-red-100 text-red-600"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
