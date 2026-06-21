import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Sidebar } from './components/Layout/Sidebar';
import { Header } from './components/Layout/Header';
import { DashboardPage } from './pages/DashboardPage';
import { NewModulePage } from './pages/NewModulePage';
import { ModuleEditorPage } from './pages/ModuleEditorPage';
import { DatasheetPage } from './pages/DatasheetPage';
import { KnowledgeBasePage } from './pages/KnowledgeBasePage';
import { SettingsPage } from './pages/SettingsPage';

function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Routes>
        <Route path="/modules/:id/datasheet" element={<DatasheetPage />} />
        <Route
          path="/"
          element={
            <AppShell>
              <DashboardPage />
            </AppShell>
          }
        />
        <Route
          path="/modules/new"
          element={
            <AppShell>
              <NewModulePage />
            </AppShell>
          }
        />
        <Route
          path="/modules/:id"
          element={
            <AppShell>
              <ModuleEditorPage />
            </AppShell>
          }
        />
        <Route
          path="/knowledge-base"
          element={
            <AppShell>
              <KnowledgeBasePage />
            </AppShell>
          }
        />
        <Route
          path="/settings"
          element={
            <AppShell>
              <SettingsPage />
            </AppShell>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
