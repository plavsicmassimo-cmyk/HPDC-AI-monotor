import React from 'react';
import { useHPDCStore } from './store/hpdcStore';
import { useSimulation } from './hooks/useSimulation';
import { Sidebar } from './components/Layout/Sidebar';
import { Header } from './components/Layout/Header';
import { DashboardPage } from './pages/DashboardPage';
import { InjectionPage } from './pages/InjectionPage';
import { ThermalPage } from './pages/ThermalPage';
import { ParametersPage } from './pages/ParametersPage';
import { AlarmsPage } from './pages/AlarmsPage';
import { AnalyticsPage } from './pages/AnalyticsPage';

function PageContent() {
  const activePage = useHPDCStore((s) => s.activePage);

  switch (activePage) {
    case 'dashboard':  return <DashboardPage />;
    case 'injection':  return <InjectionPage />;
    case 'thermal':    return <ThermalPage />;
    case 'parameters': return <ParametersPage />;
    case 'alarms':     return <AlarmsPage />;
    case 'analytics':  return <AnalyticsPage />;
    default:           return <DashboardPage />;
  }
}

export default function App() {
  useSimulation();

  return (
    <div className="flex h-screen bg-[#0d1117] overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto">
          <PageContent />
        </main>
      </div>
    </div>
  );
}
