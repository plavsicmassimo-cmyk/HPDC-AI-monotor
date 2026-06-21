import { useMemo, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { FileText, Download, Copy, Trash2, Code2 } from 'lucide-react';
import { useImdsStore } from '../store/imdsStore';
import { NodeTree } from '../components/tree/NodeTree';
import { NodeDetailPanel } from '../components/tree/NodeDetailPanel';
import { CompliancePanel } from '../components/CompliancePanel';
import { StatusBadge } from '../components/common/StatusBadge';
import type { ModuleNode, ModuleStatus } from '../types/imds';
import { moduleToXml, downloadTextFile } from '../utils/xmlExport';

function findNode(root: ModuleNode, id: string): ModuleNode | null {
  if (root.id === id) return root;
  for (const child of root.children) {
    const found = findNode(child, id);
    if (found) return found;
  }
  return null;
}

const STATUS_OPTIONS: ModuleStatus[] = ['draft', 'in-review', 'sent', 'accepted', 'rejected'];

export function ModuleEditorPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const module = useImdsStore((s) => s.modules.find((m) => m.id === id));
  const addNode = useImdsStore((s) => s.addNode);
  const removeNodeById = useImdsStore((s) => s.removeNodeById);
  const updateModuleMeta = useImdsStore((s) => s.updateModuleMeta);
  const setModuleStatus = useImdsStore((s) => s.setModuleStatus);
  const duplicateModule = useImdsStore((s) => s.duplicateModule);
  const deleteModule = useImdsStore((s) => s.deleteModule);

  const [selectedId, setSelectedId] = useState<string | null>(module?.rootNode.id ?? null);

  const selectedNode = useMemo(() => {
    if (!module) return null;
    const sid = selectedId ?? module.rootNode.id;
    return findNode(module.rootNode, sid);
  }, [module, selectedId]);

  if (!module) {
    return (
      <div className="p-6 text-center text-slate-500">
        Module not found. <Link to="/" className="text-brand-700 underline">Back to modules</Link>
      </div>
    );
  }

  function handleExportXml() {
    downloadTextFile(`${module!.mdsId}.xml`, moduleToXml(module!), 'application/xml');
  }

  function handleExportJson() {
    downloadTextFile(`${module!.mdsId}.json`, JSON.stringify(module, null, 2), 'application/json');
  }

  return (
    <div className="flex flex-col h-full">
      <div className="bg-white border-b border-slate-200 px-5 py-3 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3 min-w-0">
          <span className="font-mono text-sm text-slate-500">{module.mdsId}</span>
          <input
            value={module.name}
            onChange={(e) => updateModuleMeta(module.id, { name: e.target.value })}
            className="font-semibold text-slate-800 border-b border-transparent hover:border-slate-300 focus:border-brand-500 outline-none bg-transparent min-w-[200px]"
          />
          <span className="text-xs text-slate-400">v{module.version}</span>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={module.status}
            onChange={(e) => setModuleStatus(module.id, e.target.value as ModuleStatus)}
            className="text-xs border border-slate-300 rounded px-2 py-1"
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <StatusBadge status={module.status} />
          <Link
            to={`/modules/${module.id}/datasheet`}
            className="flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-md border border-slate-300 hover:bg-slate-50"
          >
            <FileText size={14} />
            Datasheet
          </Link>
          <button
            onClick={handleExportXml}
            className="flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-md border border-slate-300 hover:bg-slate-50"
          >
            <Code2 size={14} />
            XML
          </button>
          <button
            onClick={handleExportJson}
            className="flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-md border border-slate-300 hover:bg-slate-50"
          >
            <Download size={14} />
            JSON
          </button>
          <button
            onClick={() => duplicateModule(module.id)}
            className="p-1.5 rounded-md border border-slate-300 hover:bg-slate-50"
            title="Duplicate"
          >
            <Copy size={14} />
          </button>
          <button
            onClick={() => {
              if (confirm('Delete this module?')) {
                deleteModule(module.id);
                navigate('/');
              }
            }}
            className="p-1.5 rounded-md border border-slate-300 hover:bg-red-50 text-red-600"
            title="Delete"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className="w-72 border-r border-slate-200 bg-white overflow-y-auto p-2 shrink-0">
          <NodeTree
            node={module.rootNode}
            selectedId={selectedId}
            onSelect={setSelectedId}
            onAddChild={(parentId, type) => addNode(module.id, parentId, type, `New ${type}`)}
            onDelete={(nodeId) => {
              removeNodeById(module.id, nodeId);
              if (selectedId === nodeId) setSelectedId(module.rootNode.id);
            }}
          />
        </div>

        <div className="flex-1 overflow-y-auto p-5 bg-slate-50">
          {selectedNode ? (
            <NodeDetailPanel moduleId={module.id} node={selectedNode} isRoot={selectedNode.id === module.rootNode.id} />
          ) : (
            <p className="text-sm text-slate-400">Select a node to edit.</p>
          )}
        </div>

        <div className="w-96 border-l border-slate-200 bg-white overflow-y-auto p-5 shrink-0">
          <CompliancePanel rootNode={module.rootNode} />
        </div>
      </div>
    </div>
  );
}
