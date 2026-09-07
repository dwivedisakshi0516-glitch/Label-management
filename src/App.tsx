import React, { useEffect, useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { SettingsProvider, useSettings } from './context/SettingsContext';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Categories } from './pages/Categories';
import { Manufacturers } from './pages/Manufacturers';
import { CustomerCareView } from './pages/CustomerCare';
import { WarrantyView } from './pages/Warranty';
import { Products } from './pages/Products';
import { Templates } from './pages/Templates';
import { CreateLabel } from './pages/CreateLabel';
import { EditLabel } from './pages/EditLabel';
import { SavedLabels } from './pages/SavedLabels';
import { ImportLabels } from './pages/ImportLabels';
import { Settings } from './pages/Settings';
import { NavigationPath, SavedLabel } from './types';
import { ImportedRow } from './components/import/ImportedFileTable';

const NAVIGATION_PATHS: NavigationPath[] = [
  'dashboard',
  'categories',
  'products',
  'manufacturers',
  'customer-care',
  'warranty',
  'templates',
  'create-label',
  'import-labels',
  'edit-label',
  'saved-labels',
  'settings',
  'login',
  'template-library',
  'manufacturers-plants',
  'line-settings',
];

const getInitialPath = (): NavigationPath => {
  const savedPath = localStorage.getItem('rit_current_path') as NavigationPath | null;
  return savedPath && NAVIGATION_PATHS.includes(savedPath) ? savedPath : 'dashboard';
};

const AppLayout: React.FC = () => {
  const { currentUser, isLoading } = useAuth();
  const { settings } = useSettings();
  const [currentPath, setCurrentPath] = useState<NavigationPath>(getInitialPath);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [duplicateTarget, setDuplicateTarget] = useState<SavedLabel | null>(null);
  const [editTarget, setEditTarget] = useState<SavedLabel | null>(null);
  const [importedRowTarget, setImportedRowTarget] = useState<ImportedRow | null>(null);

  useEffect(() => {
    localStorage.setItem('rit_current_path', currentPath);
  }, [currentPath]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-white">
          <span className="w-8 h-8 border-3 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
          <p className="text-xs font-semibold tracking-wider uppercase text-slate-400">Loading {settings.app_name} Suite...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <Login onSuccess={() => setCurrentPath('dashboard')} />;
  }

  const handleDuplicate = (label: SavedLabel) => {
    setDuplicateTarget(label);
    setCurrentPath('create-label');
  };

  const handleEditLabel = (label: SavedLabel) => {
    setEditTarget(label);
    setCurrentPath('edit-label');
  };

  const renderActiveView = () => {
    switch (currentPath) {
      case 'dashboard':
        return <Dashboard onNavigate={(path) => setCurrentPath(path)} />;
      case 'categories':
        return <Categories />;
      case 'manufacturers':
        return <Manufacturers />;
      case 'customer-care':
        return <CustomerCareView />;
      case 'warranty':
        return <WarrantyView />;
      case 'products':
        return <Products />;
      case 'templates':
        return <Templates />;
      case 'create-label':
        return (
          <CreateLabel
            initialLabelData={duplicateTarget}
            initialImportRow={importedRowTarget}
            onImportApplied={() => setImportedRowTarget(null)}
            onNavigateToSaved={() => {
              setDuplicateTarget(null);
              setCurrentPath('saved-labels');
            }}
            onNavigateToEdit={() => setCurrentPath('edit-label')}
          />
        );
      case 'import-labels':
        return (
          <ImportLabels
            onUseRow={(row) => {
              setDuplicateTarget(null);
              setEditTarget(null);
              setImportedRowTarget(row);
              setCurrentPath('create-label');
            }}
          />
        );
      case 'edit-label':
        return (
          <EditLabel
            labelToEdit={editTarget}
            onNavigateToSaved={() => {
              setEditTarget(null);
              setCurrentPath('saved-labels');
            }}
          />
        );
      case 'saved-labels':
        return (
          <SavedLabels
            onDuplicate={handleDuplicate}
            onEdit={handleEditLabel}
            onNavigateToCreate={() => {
              setDuplicateTarget(null);
              setEditTarget(null);
              setCurrentPath('create-label');
            }}
          />
        );
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard onNavigate={(path) => setCurrentPath(path)} />;
    }
  };

  return (
    <div id="app-root-shell" className="min-h-screen bg-slate-50 text-slate-900 flex">
      {/* Sidebar Navigation */}
      <Sidebar
        currentPath={currentPath}
        onNavigate={(path) => {
          if (path !== 'create-label') {
            setDuplicateTarget(null);
            setImportedRowTarget(null);
          }
          if (path !== 'edit-label') {
            setEditTarget(null);
          }
          setCurrentPath(path);
        }}
        isMobileOpen={isMobileOpen}
        onCloseMobile={() => setIsMobileOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col pl-0 lg:pl-64 min-w-0 transition-all">
        {/* Header */}
        <Header
          currentPath={currentPath}
          onNavigate={(path) => {
            if (path !== 'create-label') {
              setDuplicateTarget(null);
              setImportedRowTarget(null);
            }
            if (path !== 'edit-label') {
              setEditTarget(null);
            }
            setCurrentPath(path);
          }}
          onToggleMobile={() => setIsMobileOpen(!isMobileOpen)}
        />

        {/* Dynamic Route View */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {renderActiveView()}
        </main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <SettingsProvider>
          <AppLayout />
        </SettingsProvider>
      </ToastProvider>
    </AuthProvider>
  );
}
