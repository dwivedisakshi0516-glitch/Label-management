import React, { useState } from 'react';
import {
  LayoutDashboard,
  Database,
  Layers,
  Box,
  Building2,
  Headphones,
  ShieldCheck,
  FileCode2,
  PlusCircle,
  FolderHeart,
  Settings,
  LogOut,
  ChevronDown,
  ChevronRight,
  Printer,
  Sparkles,
  X,
  Edit2
} from 'lucide-react';
import { NavigationPath } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';

interface SidebarProps {
  currentPath: NavigationPath;
  onNavigate: (path: NavigationPath) => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPath,
  onNavigate,
  isMobileOpen,
  onCloseMobile,
}) => {
  const { currentUser, logout } = useAuth();
  const { settings } = useSettings();
  const [masterDataOpen, setMasterDataOpen] = useState(true);

  const isMasterActive = [
    'categories',
    'products',
    'manufacturers',
    'customer-care',
    'warranty'
  ].includes(currentPath);

  const navItemClass = (path: NavigationPath) => {
    const isActive = currentPath === path;
    return `flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 cursor-pointer select-none ${
      isActive
        ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20 font-semibold'
        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
    }`;
  };

  const subNavItemClass = (path: NavigationPath) => {
    const isActive = currentPath === path;
    return `flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150 cursor-pointer select-none ${
      isActive
        ? 'bg-blue-50 text-blue-700 font-semibold border-l-2 border-blue-600'
        : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
    }`;
  };

  const handleNav = (path: NavigationPath) => {
    onNavigate(path);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 left-0 z-40 h-full w-64 bg-white border-r border-slate-200/80 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {/* Header / Brand Logo */}
        <div className="h-16 px-5 flex items-center justify-between border-b border-slate-100">
          <div
            onClick={() => handleNav('dashboard')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 via-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-lg tracking-tight text-slate-900">{settings.app_name}</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-blue-100 text-blue-700">SUITE</span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium truncate max-w-36">{settings.company_name}</p>
            </div>
          </div>
          <button
            onClick={onCloseMobile}
            className="p-1 text-slate-400 hover:text-slate-600 lg:hidden rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Menu Links */}
        <div className="flex-1 overflow-y-auto px-3.5 py-4 space-y-1.5 scrollbar-thin scrollbar-thumb-slate-200">
          {/* Dashboard */}
          <div
            onClick={() => handleNav('dashboard')}
            className={navItemClass('dashboard')}
          >
            <LayoutDashboard className="w-4 h-4 shrink-0" />
            <span>Dashboard</span>
          </div>

          {/* Master Data Section with Submenu */}
          <div className="pt-2">
            <div
              onClick={() => setMasterDataOpen(!masterDataOpen)}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 cursor-pointer select-none ${
                isMasterActive && !masterDataOpen
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
              }`}
            >
              <div className="flex items-center gap-3">
                <Database className="w-4 h-4 shrink-0 text-slate-500" />
                <span>Master Data</span>
              </div>
              {masterDataOpen ? (
                <ChevronDown className="w-4 h-4 text-slate-400" />
              ) : (
                <ChevronRight className="w-4 h-4 text-slate-400" />
              )}
            </div>

            {masterDataOpen && (
              <div className="pl-6 pr-1 pt-1.5 space-y-1 border-l-2 border-slate-100 ml-5 my-1">
                <div
                  onClick={() => handleNav('categories')}
                  className={subNavItemClass('categories')}
                >
                  <Layers className="w-3.5 h-3.5 shrink-0" />
                  <span>Categories</span>
                </div>
                <div
                  onClick={() => handleNav('products')}
                  className={subNavItemClass('products')}
                >
                  <Box className="w-3.5 h-3.5 shrink-0" />
                  <span>Products</span>
                </div>
                <div
                  onClick={() => handleNav('manufacturers')}
                  className={subNavItemClass('manufacturers')}
                >
                  <Building2 className="w-3.5 h-3.5 shrink-0" />
                  <span>Manufacturers</span>
                </div>
                <div
                  onClick={() => handleNav('customer-care')}
                  className={subNavItemClass('customer-care')}
                >
                  <Headphones className="w-3.5 h-3.5 shrink-0" />
                  <span>Customer Care</span>
                </div>
                <div
                  onClick={() => handleNav('warranty')}
                  className={subNavItemClass('warranty')}
                >
                  <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                  <span>Warranty</span>
                </div>
              </div>
            )}
          </div>

          {/* Label Templates */}
          <div
            onClick={() => handleNav('templates')}
            className={navItemClass('templates')}
          >
            <FileCode2 className="w-4 h-4 shrink-0" />
            <span>Label Templates</span>
          </div>

          <div className="pt-2 pb-1">
            <div className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Operations
            </div>
          </div>

          {/* Create Label Highlighted */}
          <div
            onClick={() => handleNav('create-label')}
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 cursor-pointer select-none ${
              currentPath === 'create-label'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20 font-semibold'
                : 'text-blue-700 bg-blue-50/70 hover:bg-blue-100/80 hover:text-blue-800 border border-blue-100'
            }`}
          >
            <PlusCircle className="w-4 h-4 shrink-0" />
            <span>Create Label</span>
          </div>

          {/* Edit Label (100% Editable Fields) */}
          <div
            onClick={() => handleNav('edit-label')}
            className={navItemClass('edit-label')}
          >
            <Edit2 className="w-4 h-4 shrink-0" />
            <span>Edit Label</span>
          </div>

          {/* Saved Labels */}
          <div
            onClick={() => handleNav('saved-labels')}
            className={navItemClass('saved-labels')}
          >
            <FolderHeart className="w-4 h-4 shrink-0" />
            <span>Saved Labels</span>
          </div>

          <div className="pt-2 pb-1">
            <div className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              System
            </div>
          </div>

          {/* Settings */}
          <div
            onClick={() => handleNav('settings')}
            className={navItemClass('settings')}
          >
            <Settings className="w-4 h-4 shrink-0" />
            <span>Settings</span>
          </div>
        </div>

        {/* User Card & Logout Footer */}
        <div className="p-3.5 border-t border-slate-100 bg-slate-50/50">
          <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-white border border-slate-200/80 shadow-xs">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-xs shrink-0">
                {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'A'}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-slate-900 truncate">
                  {currentUser?.name || 'Administrator'}
                </p>
                <p className="text-[10px] text-slate-400 truncate">
                  {currentUser?.email || 'admin@rit.com'}
                </p>
              </div>
            </div>
            <button
              onClick={logout}
              title="Logout"
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition shrink-0 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
