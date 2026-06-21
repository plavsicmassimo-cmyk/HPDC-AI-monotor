import { useEffect, useState } from 'react';
import { Download, Building2 } from 'lucide-react';
import { useImdsStore } from '../../store/imdsStore';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
}

export function Header() {
  const companyProfile = useImdsStore((s) => s.companyProfile);
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setInstallEvent(e as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', () => setInstalled(true));
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-6 shrink-0">
      <div className="flex items-center gap-2 text-slate-600 text-sm">
        <Building2 size={16} />
        <span className="font-medium text-slate-800">{companyProfile.companyName}</span>
        <span className="text-slate-400">·</span>
        <span className="text-slate-500">{companyProfile.companyImdsId}</span>
      </div>
      {!installed && installEvent && (
        <button
          onClick={() => installEvent.prompt()}
          className="flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-md bg-brand-700 text-white hover:bg-brand-800 transition-colors"
        >
          <Download size={15} />
          Install App
        </button>
      )}
    </header>
  );
}
