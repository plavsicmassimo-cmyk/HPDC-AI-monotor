import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, FilePlus2, RotateCcw } from 'lucide-react';
import { generateModuleDraft, type DraftResult } from '../engine/aiEngine';
import { useImdsStore } from '../store/imdsStore';
import { createEmptyNode } from '../store/imdsStore';
import { computeCompliance } from '../engine/compliance';
import { ComplianceBadge } from '../components/common/ComplianceBadge';

export function NewModulePage() {
  const navigate = useNavigate();
  const createModule = useImdsStore((s) => s.createModule);

  const [componentName, setComponentName] = useState('');
  const [massGrams, setMassGrams] = useState<number>(100);
  const [description, setDescription] = useState('');
  const [draft, setDraft] = useState<DraftResult | null>(null);

  function handleGenerate() {
    const result = generateModuleDraft(componentName || 'New Component', description, massGrams);
    setDraft(result);
  }

  function handleUseDraft() {
    if (!draft) return;
    const id = createModule({
      name: componentName || 'New Component',
      rootNode: draft.rootNode,
      aiGenerated: true,
      sourceDescription: description,
    });
    navigate(`/modules/${id}`);
  }

  function handleStartBlank() {
    const root = createEmptyNode('component', componentName || 'New Component');
    root.massGrams = massGrams;
    const id = createModule({ name: componentName || 'New Component', rootNode: root, aiGenerated: false });
    navigate(`/modules/${id}`);
  }

  const report = draft ? computeCompliance(draft.rootNode) : null;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-xl font-semibold text-slate-800 mb-1">New Module</h1>
      <p className="text-sm text-slate-500 mb-6">
        Describe the component or assembly and let the AI engine draft a starting Bill of Materials with REACH/RoHS flags
        already applied — or start from a blank module and build it manually.
      </p>

      <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Component / Assembly Name</label>
            <input
              value={componentName}
              onChange={(e) => setComponentName(e.target.value)}
              placeholder="e.g. Door Hinge Bracket"
              className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Total Mass (g)</label>
            <input
              type="number"
              step="0.01"
              value={massGrams}
              onChange={(e) => setMassGrams(parseFloat(e.target.value) || 0)}
              className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">
            Describe the component, its materials, and any coatings/finishes
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            placeholder="e.g. Stainless steel bracket with a zinc-chromate coating, fastened with leaded brass inserts"
            className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-sm"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleGenerate}
            className="flex items-center gap-1.5 bg-brand-700 text-white text-sm font-medium px-4 py-2 rounded-md hover:bg-brand-800"
          >
            <Sparkles size={16} />
            Generate Draft with AI
          </button>
          <button
            onClick={handleStartBlank}
            className="flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-md border border-slate-300 hover:bg-slate-50"
          >
            <FilePlus2 size={16} />
            Start Blank Module
          </button>
        </div>
      </div>

      {draft && (
        <div className="bg-white border border-slate-200 rounded-lg p-5 mt-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-slate-700">AI Draft Preview</h2>
            {report && <ComplianceBadge status={report.overallStatus} />}
          </div>

          {draft.unmatched && (
            <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded px-2.5 py-1.5 mb-3">
              No materials in the knowledge base matched your description. A placeholder material was created — add
              composition manually after opening the module.
            </p>
          )}

          {!draft.unmatched && (
            <p className="text-xs text-slate-500 mb-3">
              Matched materials:{' '}
              {draft.matches.map((m) => `${m.template.name} (${m.matchedKeywords.join(', ')})`).join('; ')}
            </p>
          )}

          <ul className="space-y-1.5 mb-4">
            {draft.rootNode.children.map((child) => (
              <li key={child.id} className="text-sm border border-slate-200 rounded px-3 py-2">
                <span className="font-medium">{child.name}</span> — {child.percentOfParent.toFixed(1)}% of mass
                <ul className="mt-1 text-xs text-slate-500 pl-3 list-disc">
                  {(child.substances ?? []).map((s) => (
                    <li key={s.id}>
                      {s.name} ({s.casNumber}) — {s.massPercent}%{s.svhc && <span className="text-compliance-fail font-semibold"> SVHC</span>}
                      {s.rohsRestricted && <span className="text-compliance-warn font-semibold"> RoHS-restricted</span>}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-2">
            <button
              onClick={handleUseDraft}
              className="bg-green-600 text-white text-sm font-medium px-4 py-2 rounded-md hover:bg-green-700"
            >
              Use This Draft
            </button>
            <button
              onClick={handleGenerate}
              className="flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-md border border-slate-300 hover:bg-slate-50"
            >
              <RotateCcw size={15} />
              Regenerate
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
