import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Layers,
  Box,
  FileCode2,
  FolderHeart,
  PlusCircle,
  PackagePlus,
  FilePlus2,
  Upload,
  Printer,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Clock,
  ExternalLink
} from 'lucide-react';
import { DashboardStats, NavigationPath } from '../types';
import { dashboardApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

interface DashboardProps {
  onNavigate: (path: NavigationPath) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const { currentUser } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setIsLoading(true);
      const data = await dashboardApi.getStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to load dashboard stats', err);
    } finally {
      setIsLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Categories',
      value: stats?.total_categories ?? 0,
      icon: Layers,
      color: 'from-blue-600 to-indigo-600',
      bgLight: 'bg-blue-50 text-blue-700',
      path: 'categories' as NavigationPath,
    },
    {
      title: 'Total Products',
      value: stats?.total_products ?? 0,
      icon: Box,
      color: 'from-sky-600 to-cyan-600',
      bgLight: 'bg-sky-50 text-sky-700',
      path: 'products' as NavigationPath,
    },
    {
      title: 'Label Templates',
      value: stats?.total_templates ?? 0,
      icon: FileCode2,
      color: 'from-emerald-600 to-teal-600',
      bgLight: 'bg-emerald-50 text-emerald-700',
      path: 'templates' as NavigationPath,
    },
    {
      title: 'Labels Created',
      value: stats?.total_labels_created ?? 0,
      icon: FolderHeart,
      color: 'from-violet-600 to-purple-600',
      bgLight: 'bg-violet-50 text-violet-700',
      path: 'saved-labels' as NavigationPath,
    },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-10">
      {/* 3D Welcome Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 text-white p-6 sm:p-8 shadow-xl border border-slate-800">
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
          <div className="lg:col-span-2 space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span>Precision Compliance Labeling System</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Welcome back, {currentUser?.name || 'Administrator'}!
            </h2>
            <p className="text-sm text-slate-300 max-w-xl leading-relaxed">
              Auto-fill master product data, preview industrial packaging stickers in real-time,
              and dispatch print-ready jobs adhering to physical dimensions.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => onNavigate('create-label')}
                className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-semibold shadow-lg shadow-blue-600/30 transition transform hover:-translate-y-0.5 cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Create New Label</span>
              </button>
              <button
                onClick={() => onNavigate('products')}
                className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white border border-white/15 rounded-xl text-sm font-medium transition cursor-pointer backdrop-blur-xs"
              >
                <PackagePlus className="w-4 h-4 text-slate-300" />
                <span>Manage Products</span>
              </button>
            </div>
          </div>

          {/* 3D Animated Cardboard Product Box with Label */}
          <div className="flex justify-center lg:justify-end items-center">
            <motion.div
              animate={{
                rotateY: [0, 15, -15, 0],
                rotateX: [0, 8, -8, 0],
                y: [0, -6, 0],
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              style={{ transformStyle: 'preserve-3d', perspective: 800 }}
              className="w-44 h-40 sm:w-48 sm:h-44 bg-gradient-to-br from-amber-700 via-amber-800 to-amber-950 rounded-2xl shadow-2xl p-3 border border-amber-600/30 flex flex-col justify-between relative transform hover:scale-105 transition"
            >
              <div className="flex items-center justify-between border-b border-amber-600/40 pb-1.5 text-[10px] text-amber-200 font-bold uppercase tracking-wider">
                <span>RIT PACKAGING</span>
                <span className="bg-amber-500 text-amber-950 px-1 py-0.5 rounded text-[8px]">PASS</span>
              </div>
              
              {/* Product Sticker on Box */}
              <div className="bg-white text-slate-900 rounded-lg p-2 shadow-md border border-slate-200 text-[8px] space-y-0.5">
                <div className="font-bold border-b border-slate-200 pb-0.5 text-blue-900 truncate">
                  HP ProDesk 2 G1a Tower
                </div>
                <div className="text-[7px] text-slate-600 truncate">Mfd By: Flextronics India</div>
                <div className="flex justify-between items-center font-mono font-bold text-[8px] pt-0.5">
                  <span>MRP ₹114,229</span>
                  <span className="text-emerald-700">1 N</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-[8px] text-amber-300/80">
                <span>100x150 mm</span>
                <span>ISO Certified</span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Quick Actions Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <button
          onClick={() => onNavigate('create-label')}
          className="flex items-center gap-3 p-4 bg-white hover:bg-blue-50/50 border border-slate-200 rounded-2xl shadow-xs transition transform hover:-translate-y-0.5 group cursor-pointer text-left"
        >
          <div className="w-11 h-11 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 group-hover:scale-110 transition">
            <PlusCircle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-700 transition">
              Create Label
            </h3>
            <p className="text-xs text-slate-500">Pick product & print sticker</p>
          </div>
        </button>

        <button
          onClick={() => onNavigate('products')}
          className="flex items-center gap-3 p-4 bg-white hover:bg-sky-50/50 border border-slate-200 rounded-2xl shadow-xs transition transform hover:-translate-y-0.5 group cursor-pointer text-left"
        >
          <div className="w-11 h-11 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center shrink-0 group-hover:scale-110 transition">
            <PackagePlus className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 group-hover:text-sky-700 transition">
              Add Product
            </h3>
            <p className="text-xs text-slate-500">Save master specifications</p>
          </div>
        </button>

        <button
          onClick={() => onNavigate('templates')}
          className="flex items-center gap-3 p-4 bg-white hover:bg-emerald-50/50 border border-slate-200 rounded-2xl shadow-xs transition transform hover:-translate-y-0.5 group cursor-pointer text-left"
        >
          <div className="w-11 h-11 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 group-hover:scale-110 transition">
            <FilePlus2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition">
              Create Template
            </h3>
            <p className="text-xs text-slate-500">Design label layout & fields</p>
          </div>
        </button>

        <button
          onClick={() => onNavigate('import-labels')}
          className="flex items-center gap-3 p-4 bg-white hover:bg-violet-50/50 border border-slate-200 rounded-2xl shadow-xs transition transform hover:-translate-y-0.5 group cursor-pointer text-left"
        >
          <div className="w-11 h-11 rounded-xl bg-violet-100 text-violet-700 flex items-center justify-center shrink-0 group-hover:scale-110 transition">
            <Upload className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 group-hover:text-violet-700 transition">
              Upload Excel/PDF
            </h3>
            <p className="text-xs text-slate-500">Import rows & prefill labels</p>
          </div>
        </button>
      </div>

      {/* Dynamic Statistics Cards */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-slate-900">Master Statistics</h3>
          <span className="text-xs text-slate-400">Live Database Counters</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((card, idx) => {
            const IconComponent = card.icon;
            return (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.08 }}
                onClick={() => onNavigate(card.path)}
                className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition transform hover:-translate-y-1 cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-2.5 rounded-xl ${card.bgLight} group-hover:scale-110 transition`}>
                    <IconComponent className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-semibold text-slate-400 flex items-center gap-1 group-hover:text-blue-600 transition">
                    View <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
                <div className="text-2xl font-black text-slate-900">
                  {isLoading ? (
                    <span className="inline-block w-8 h-6 bg-slate-200 animate-pulse rounded" />
                  ) : (
                    card.value
                  )}
                </div>
                <p className="text-xs text-slate-500 font-medium mt-1">{card.title}</p>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Recent Labels Section */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Recent Labels</h3>
              <p className="text-xs text-slate-400">Recently formatted compliance stickers</p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('saved-labels')}
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
          >
            View All Saved Labels <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100">
              <tr>
                <th className="py-3 px-5">Product Model</th>
                <th className="py-3 px-5">Category</th>
                <th className="py-3 px-5">Mfg Date</th>
                <th className="py-3 px-5">MRP</th>
                <th className="py-3 px-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {stats?.recent_labels && stats.recent_labels.length > 0 ? (
                stats.recent_labels.map((lbl) => (
                  <tr key={lbl.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-5 font-semibold text-slate-800">
                      {lbl.product_name}
                    </td>
                    <td className="py-3.5 px-5 text-slate-600">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium">
                        {lbl.category_name || 'Standard'}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-slate-600 font-medium">
                      {lbl.month} {lbl.year}
                    </td>
                    <td className="py-3.5 px-5 font-mono font-bold text-slate-900">
                      ₹{lbl.mrp.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <button
                        onClick={() => onNavigate('saved-labels')}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 rounded-lg font-medium transition cursor-pointer"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    No labels saved yet. Click{' '}
                    <button
                      onClick={() => onNavigate('create-label')}
                      className="text-blue-600 font-semibold hover:underline"
                    >
                      + Create Label
                    </button>{' '}
                    to generate your first label.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
