import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FilePlus2, BookOpen, Settings, FlaskConical } from 'lucide-react';
import clsx from 'clsx';

const navItems = [
  { to: '/', label: 'Modules', icon: LayoutDashboard },
  { to: '/modules/new', label: 'New Module', icon: FilePlus2 },
  { to: '/knowledge-base', label: 'Knowledge Base', icon: BookOpen },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export function Sidebar() {
  return (
    <aside className="hidden md:flex md:flex-col w-60 bg-brand-900 text-white shrink-0">
      <div className="flex items-center gap-2 px-5 h-16 border-b border-white/10">
        <FlaskConical size={22} className="text-brand-100" />
        <div className="leading-tight">
          <div className="font-semibold text-sm">IMDS Module Creator</div>
          <div className="text-[11px] text-brand-100/70">REACH &amp; RoHS Compliance</div>
        </div>
      </div>
      <nav className="flex-1 py-3 px-2 space-y-1">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                isActive ? 'bg-brand-700 text-white' : 'text-brand-100/80 hover:bg-brand-800 hover:text-white'
              )
            }
          >
            <Icon size={17} />
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="px-4 py-3 text-[11px] text-brand-100/50 border-t border-white/10">
        Starter knowledge base — verify against ECHA SVHC / RoHS / GADSL before submission.
      </div>
    </aside>
  );
}
