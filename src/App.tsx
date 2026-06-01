import React from 'react';
import { useHPDCStore } from './store/hpdcStore';
import { useTrainingStore } from './store/trainingStore';
import { useSimulation } from './hooks/useSimulation';
import { useTrainingSimulation } from './hooks/useTrainingSimulation';
import { Sidebar } from './components/Layout/Sidebar';
import { Header } from './components/Layout/Header';
import { DashboardPage } from './pages/DashboardPage';
import { InjectionPage } from './pages/InjectionPage';
import { ThermalPage } from './pages/ThermalPage';
import { ParametersPage } from './pages/ParametersPage';
import { AlarmsPage } from './pages/AlarmsPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { TrainingDashboardPage } from './pages/training/TrainingDashboardPage';
import { DiagnosisPage } from './pages/training/DiagnosisPage';
import { ContentPage } from './pages/training/ContentPage';
import { AssessmentPage } from './pages/training/AssessmentPage';
import { CoachingPage } from './pages/training/CoachingPage';
import { TrainingAnalyticsPage } from './pages/training/TrainingAnalyticsPage';

function PageContent() {
  const activePage = useHPDCStore((s) => s.activePage);
  const activeTrainingPage = useTrainingStore((s) => s.activeTrainingPage);

  if (activePage === 'training') {
    switch (activeTrainingPage) {
      case 'training-dashboard':  return <TrainingDashboardPage />;
      case 'training-diagnosis':  return <DiagnosisPage />;
      case 'training-content':    return <ContentPage />;
      case 'training-assessment': return <AssessmentPage />;
      case 'training-coaching':   return <CoachingPage />;
      case 'training-analytics':  return <TrainingAnalyticsPage />;
      default:                    return <TrainingDashboardPage />;
    }
  }

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
  useTrainingSimulation();

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
