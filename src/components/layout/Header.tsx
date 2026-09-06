import React from 'react';
import { Menu, PlusCircle, User, ShieldCheck, Printer } from 'lucide-react';
import { NavigationPath } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';

interface HeaderProps {
  currentPath: NavigationPath;
  onNavigate: (path: NavigationPath) => void;
  onToggleMobile: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentPath,
  onNavigate,
  onToggleMobile,
}) => {
  const { currentUser } = useAuth();
  const { settings } = useSettings();

  const getPageTitle = (path: NavigationPath) => {
    switch (path) {
      case 'dashboard':
        return 'Dashboard Overview';
      case 'categories':
        return 'Category Master';
      case 'products':
        return 'Product Master';
      case 'manufacturers':
        return 'Manufacturer Master';
      case 'customer-care':
        return 'Customer Care Profiles';
      case 'warranty':
        return 'Warranty Master';
      case 'templates':
        return 'Label Templates';
      case 'create-label':
        return 'Create & Print Label';
      case 'edit-label':
        return 'Edit & Customize Label';
      case 'import-labels':
        return 'Upload Excel / PDF';
      case 'saved-labels':
        return 'Saved Labels History';
      case 'settings':
        return 'Application Settings';
      default:
        return 'Overview';
    }
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200/80 px-4 sm:px-6 lg:px-8 flex items-center justify-between sticky top-0 z-30 shadow-xs">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobile}
          className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl lg:hidden cursor-pointer"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
            {getPageTitle(currentPath)}
          </h1>
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
            <span>{settings.company_name}</span>
            <span>•</span>
            <span className="capitalize">{currentPath.replace('-', ' ')}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {currentPath !== 'create-label' && (
          <button
            onClick={() => onNavigate('create-label')}
            className="flex items-center gap-2 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-sm shadow-blue-500/20 transition cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span className="hidden sm:inline">Create Label</span>
          </button>
        )}

        <div className="flex items-center gap-2 pl-3 border-l border-slate-200">
          <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700">
            <User className="w-4 h-4" />
          </div>
          <div className="hidden md:block text-left">
            <p className="text-xs font-semibold text-slate-800 leading-tight">
              {currentUser?.name || 'Administrator'}
            </p>
            <div className="flex items-center gap-1 text-[10px] text-emerald-600 font-medium">
              <ShieldCheck className="w-3 h-3" />
              <span>{currentUser?.role || 'Admin'}</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
