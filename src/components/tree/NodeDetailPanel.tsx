import { Sparkles } from 'lucide-react';
import type { ModuleNode } from '../../types/imds';
import { SubstanceTable } from './SubstanceTable';
import { suggestCompositionForName, buildMaterialNode } from '../../engine/aiEngine';
import { useImdsStore } from '../../store/imdsStore';

interface Props {
  moduleId: string;
  node: ModuleNode;
  isRoot: boolean;
}

const TYPE_LABEL: Record<ModuleNode['type'], string> = {
  component: 'Component',
  'semi-component': 'Semi-Component',
  material: 'Material (homogeneous)',
};

export function NodeDetailPanel({ moduleId, node, isRoot }: Props) {
  const updateNode = useImdsStore((s) => s.updateNode);
  const addSubstance = useImdsStore((s) => s.addSubstance);
  const updateSubstance = useImdsStore((s) => s.updateSubstance);
  const removeSubstance = useImdsStore((s) => s.removeSubstance);

  function handleAiSuggest() {
    const matches = suggestCompositionForName(node.name);
    if (matches.length === 0) return;
    const built = buildMaterialNode(matches[0].template, node.percentOfParent);
    updateNode(moduleId, node.id, { substances: built.substances, notes: built.notes });
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Node Type</label>
        <div className="text-sm font-medium">{TYPE_LABEL[node.type]}</div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Name</label>
        <input
          value={node.name}
          onChange={(e) => updateNode(moduleId, node.id, { name: e.target.value })}
          className="w-full border border-slate-300 rounded px-2 py-1.5 text-sm"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Part Number</label>
          <input
            value={node.partNumber ?? ''}
            onChange={(e) => updateNode(moduleId, node.id, { partNumber: e.target.value })}
            className="w-full border border-slate-300 rounded px-2 py-1.5 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">
            {isRoot ? 'Total Mass (g)' : '% of Parent Mass'}
          </label>
          {isRoot ? (
            <input
              type="number"
              step="0.01"
              value={node.massGrams ?? ''}
              onChange={(e) => updateNode(moduleId, node.id, { massGrams: parseFloat(e.target.value) || 0 })}
              className="w-full border border-slate-300 rounded px-2 py-1.5 text-sm"
            />
          ) : (
            <input
              type="number"
              step="0.01"
              value={node.percentOfParent}
              onChange={(e) => updateNode(moduleId, node.id, { percentOfParent: parseFloat(e.target.value) || 0 })}
              className="w-full border border-slate-300 rounded px-2 py-1.5 text-sm"
            />
          )}
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Notes</label>
        <textarea
          value={node.notes ?? ''}
          onChange={(e) => updateNode(moduleId, node.id, { notes: e.target.value })}
          rows={2}
          className="w-full border border-slate-300 rounded px-2 py-1.5 text-sm"
        />
      </div>

      {node.type === 'material' && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold text-slate-500 uppercase">Substance Composition</label>
            <button
              onClick={handleAiSuggest}
              className="flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-md bg-brand-50 text-brand-700 border border-brand-200 hover:bg-brand-100"
            >
              <Sparkles size={13} />
              AI Suggest Composition
            </button>
          </div>
          <SubstanceTable
            substances={node.substances ?? []}
            onAdd={(s) => addSubstance(moduleId, node.id, s)}
            onUpdatePercent={(id, pct) => updateSubstance(moduleId, node.id, id, { massPercent: pct })}
            onRemove={(id) => removeSubstance(moduleId, node.id, id)}
          />
        </div>
      )}
    </div>
  );
}
