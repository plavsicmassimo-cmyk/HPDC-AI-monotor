import { useParams, Link } from 'react-router-dom';
import { Printer, Code2, Download, ArrowLeft } from 'lucide-react';
import { useImdsStore } from '../store/imdsStore';
import { flattenTree, computeCompliance } from '../engine/compliance';
import { formatDate, formatPercent, STATUS_LABELS } from '../utils/format';
import { moduleToXml, downloadTextFile } from '../utils/xmlExport';

export function DatasheetPage() {
  const { id } = useParams<{ id: string }>();
  const module = useImdsStore((s) => s.modules.find((m) => m.id === id));

  if (!module) {
    return (
      <div className="p-6 text-center text-slate-500">
        Module not found. <Link to="/" className="text-brand-700 underline">Back to modules</Link>
      </div>
    );
  }

  const rows = flattenTree(module.rootNode);
  const report = computeCompliance(module.rootNode);

  const substanceRows = rows
    .filter((r) => r.node.type === 'material')
    .flatMap((r) =>
      (r.node.substances ?? []).map((s) => ({
        materialPath: r.path,
        effectivePercent: r.scale * s.massPercent,
        ...s,
      }))
    );

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="no-print bg-white border-b border-slate-200 px-5 py-3 flex items-center justify-between">
        <Link to={`/modules/${module.id}`} className="flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900">
          <ArrowLeft size={15} />
          Back to editor
        </Link>
        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-md bg-brand-700 text-white hover:bg-brand-800"
          >
            <Printer size={14} />
            Print / Save PDF
          </button>
          <button
            onClick={() => downloadTextFile(`${module.mdsId}.xml`, moduleToXml(module), 'application/xml')}
            className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-md border border-slate-300 hover:bg-slate-50"
          >
            <Code2 size={14} />
            Export XML
          </button>
          <button
            onClick={() => downloadTextFile(`${module.mdsId}.json`, JSON.stringify(module, null, 2), 'application/json')}
            className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-md border border-slate-300 hover:bg-slate-50"
          >
            <Download size={14} />
            Export JSON
          </button>
        </div>
      </div>

      <div className="print-area max-w-4xl mx-auto bg-white shadow-md my-6 p-10">
        <div className="flex items-start justify-between border-b-2 border-brand-800 pb-4 mb-6">
          <div>
            <h1 className="text-lg font-bold text-brand-900">Material Data Sheet</h1>
            <p className="text-xs text-slate-500">AI-assisted IMDS-style module — REACH &amp; RoHS compliance declaration</p>
          </div>
          <div className="text-right text-xs">
            <div className="font-mono font-semibold text-sm">{module.mdsId}</div>
            <div className="text-slate-500">Version {module.version}</div>
            <div className="text-slate-500">{STATUS_LABELS[module.status]}</div>
          </div>
        </div>

        <table className="mds-table mb-6">
          <tbody>
            <tr>
              <th className="w-40">Component / Module</th>
              <td>{module.name}</td>
              <th className="w-32">Created</th>
              <td>{formatDate(module.createdAt)}</td>
            </tr>
            <tr>
              <th>Sender Company</th>
              <td>
                {module.companyName} ({module.companyImdsId})
              </td>
              <th>Last Updated</th>
              <td>{formatDate(module.updatedAt)}</td>
            </tr>
            <tr>
              <th>Recipient</th>
              <td>
                {module.recipientName} ({module.recipientImdsId})
              </td>
              <th>AI-Generated Draft</th>
              <td>{module.aiGenerated ? 'Yes' : 'No'}</td>
            </tr>
          </tbody>
        </table>

        <h2 className="text-sm font-semibold text-brand-900 mb-2">Bill of Materials Structure</h2>
        <table className="mds-table mb-6">
          <thead>
            <tr>
              <th>Node</th>
              <th>Type</th>
              <th>% of Parent</th>
              <th>Part Number</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.node.id}>
                <td style={{ paddingLeft: 10 + r.depth * 18 }}>{r.node.name}</td>
                <td className="capitalize">{r.node.type.replace('-', ' ')}</td>
                <td>{r.depth === 0 ? '100.0%' : formatPercent(r.node.percentOfParent)}</td>
                <td>{r.node.partNumber ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <h2 className="text-sm font-semibold text-brand-900 mb-2">Full Substance Declaration</h2>
        <table className="mds-table mb-6">
          <thead>
            <tr>
              <th>Material</th>
              <th>CAS Number</th>
              <th>Substance</th>
              <th>% in Material</th>
              <th>% of Module</th>
              <th>SVHC</th>
              <th>RoHS</th>
              <th>GADSL</th>
            </tr>
          </thead>
          <tbody>
            {substanceRows.map((s) => (
              <tr key={`${s.materialPath}-${s.id}`}>
                <td>{s.materialPath}</td>
                <td className="font-mono">{s.casNumber}</td>
                <td>{s.name}</td>
                <td>{formatPercent(s.massPercent)}</td>
                <td>{formatPercent(s.effectivePercent)}</td>
                <td>{s.svhc ? 'Yes' : '—'}</td>
                <td>{s.rohsRestricted ? `≤${s.rohsThresholdPercent}%` : '—'}</td>
                <td>{s.gadslClass ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <h2 className="text-sm font-semibold text-brand-900 mb-2">Compliance Declaration</h2>
        <div className="text-xs text-slate-700 space-y-2 mb-6">
          <p>
            <strong>RoHS 2011/65/EU (as amended):</strong>{' '}
            {report.rohsViolations.length === 0
              ? 'No homogeneous material in this module contains a RoHS Annex II restricted substance above its threshold.'
              : `${report.rohsViolations.length} substance/material combination(s) exceed the applicable RoHS threshold — see findings below.`}
          </p>
          <p>
            <strong>REACH Article 33 (SVHC communication):</strong>{' '}
            {report.svhcFindings.filter((f) => f.meetsThreshold).length === 0
              ? 'No Candidate List SVHC substance is present at or above 0.1% w/w of this article.'
              : `${report.svhcFindings.filter((f) => f.meetsThreshold).length} SVHC substance(s) are present at or above 0.1% w/w and require downstream communication.`}
          </p>
          <p>
            <strong>GADSL:</strong>{' '}
            {report.gadslDeclarable.length === 0
              ? 'No GADSL Class D declarable substances detected.'
              : `${report.gadslDeclarable.length} GADSL Class D substance(s) detected and should be declared per GADSL reporting requirements.`}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-8 mt-10 pt-6 border-t border-slate-300 text-xs">
          <div>
            <div className="border-b border-slate-400 h-8" />
            <p className="mt-1 text-slate-500">Prepared by (operator / signature)</p>
          </div>
          <div>
            <div className="border-b border-slate-400 h-8" />
            <p className="mt-1 text-slate-500">Date</p>
          </div>
        </div>

        <p className="text-[10px] text-slate-400 mt-8">
          This datasheet was generated by an internal AI-assisted drafting tool using a starter materials/substances
          knowledge base. It is not an official IMDS system export and must be verified against current ECHA SVHC
          Candidate List, RoHS exemption annexes, and GADSL entries, and against actual supplier declarations, before
          regulatory submission.
        </p>
      </div>
    </div>
  );
}
