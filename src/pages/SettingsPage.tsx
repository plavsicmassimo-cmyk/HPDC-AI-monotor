import { useImdsStore } from '../store/imdsStore';

export function SettingsPage() {
  const profile = useImdsStore((s) => s.companyProfile);
  const updateCompanyProfile = useImdsStore((s) => s.updateCompanyProfile);

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-xl font-semibold text-slate-800 mb-1">Settings</h1>
      <p className="text-sm text-slate-500 mb-6">
        Default sender/recipient details used when creating new modules.
      </p>

      <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-4 mb-6">
        <h2 className="text-sm font-semibold text-slate-700">Company Profile</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Company Name</label>
            <input
              value={profile.companyName}
              onChange={(e) => updateCompanyProfile({ companyName: e.target.value })}
              className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Company IMDS ID</label>
            <input
              value={profile.companyImdsId}
              onChange={(e) => updateCompanyProfile({ companyImdsId: e.target.value })}
              className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-sm font-mono"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Default Recipient Name</label>
            <input
              value={profile.defaultRecipientName}
              onChange={(e) => updateCompanyProfile({ defaultRecipientName: e.target.value })}
              className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Default Recipient IMDS ID</label>
            <input
              value={profile.defaultRecipientImdsId}
              onChange={(e) => updateCompanyProfile({ defaultRecipientImdsId: e.target.value })}
              className="w-full border border-slate-300 rounded px-2.5 py-1.5 text-sm font-mono"
            />
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg p-5 space-y-2 text-sm text-slate-600">
        <h2 className="text-sm font-semibold text-slate-700 mb-1">Install on Phone or PC</h2>
        <p>
          This app is an installable Progressive Web App. On Chrome/Edge desktop, use the install icon in the address
          bar or the "Install App" button in the header. On Android Chrome, use "Add to Home screen" from the browser
          menu. On iOS Safari, use Share → "Add to Home Screen". Once installed it launches full-screen and works
          offline for previously visited modules.
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg p-5 mt-6 text-sm text-slate-600">
        <h2 className="text-sm font-semibold text-slate-700 mb-1">About the AI Engine</h2>
        <p>
          Module drafts are produced by a deterministic, explainable rule-based engine: it matches keywords in your
          description against a built-in material/substance knowledge base, then auto-applies REACH SVHC, RoHS, and
          GADSL flags from that library. It does not call an external generative model, so every suggestion can be
          traced back to a specific keyword match and a specific knowledge-base entry — review the{' '}
          <a href="/knowledge-base" className="text-brand-700 underline">
            Knowledge Base
          </a>{' '}
          page for details.
        </p>
      </div>
    </div>
  );
}
