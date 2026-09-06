import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Save, Building, Globe, IndianRupee, Printer, Shield } from 'lucide-react';
import { AppSettings } from '../types';
import { settingsApi } from '../services/api';
import { useToast } from '../context/ToastContext';
import { useSettings } from '../context/SettingsContext';

export const Settings: React.FC = () => {
  const toast = useToast();
  const { settings: globalSettings, setSettings: setGlobalSettings, refreshSettings } = useSettings();
  const [settings, setSettings] = useState<AppSettings>({
    app_name: 'RIT',
    company_name: 'RIT Precision Suite Pvt. Ltd.',
    logo_url: '/rit-logo.svg',
    default_currency: '₹',
    default_country: 'India',
    default_label_width: 100,
    default_label_height: 150,
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setSettings(globalSettings);
  }, [globalSettings]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const updated = await settingsApi.update(settings);
      setSettings(updated);
      setGlobalSettings(updated);
      await refreshSettings();
      toast.success('System settings updated successfully.');
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to save settings.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Application Settings</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Configure branding, currency symbols, and default sticker measurement parameters
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
            <SettingsIcon className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">General Suite Configuration</h3>
            <p className="text-xs text-slate-400">Master branding & default printing presets</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-5 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Application Brand Name
              </label>
              <input
                type="text"
                required
                value={settings.app_name}
                onChange={(e) => setSettings({ ...settings, app_name: e.target.value })}
                placeholder="RIT"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Company Legal Name
              </label>
              <input
                type="text"
                required
                value={settings.company_name}
                onChange={(e) => setSettings({ ...settings, company_name: e.target.value })}
                placeholder="RIT Precision Suite Pvt. Ltd."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Default Currency Symbol
              </label>
              <input
                type="text"
                required
                value={settings.default_currency}
                onChange={(e) => setSettings({ ...settings, default_currency: e.target.value })}
                placeholder="₹"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Default Country of Origin
              </label>
              <input
                type="text"
                required
                value={settings.default_country}
                onChange={(e) => setSettings({ ...settings, default_country: e.target.value })}
                placeholder="India"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2 border-t border-slate-100">
            <div>
              <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Default Label Width (mm)
              </label>
              <input
                type="number"
                min="10"
                max="500"
                required
                value={settings.default_label_width}
                onChange={(e) => setSettings({ ...settings, default_label_width: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Default Label Height (mm)
              </label>
              <input
                type="number"
                min="10"
                max="500"
                required
                value={settings.default_label_height}
                onChange={(e) => setSettings({ ...settings, default_label_height: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-hidden"
              />
            </div>
          </div>

          <div className="flex items-center justify-end pt-4 border-t border-slate-100">
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl transition shadow-md shadow-blue-500/20 flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Configuration</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
