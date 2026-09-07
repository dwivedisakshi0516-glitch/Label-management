import React, { useState, useEffect } from 'react';
import {
  FolderHeart,
  Search,
  Eye,
  Printer,
  Copy,
  Trash2,
  X,
  Calendar,
  Layers,
  Box,
  IndianRupee,
  User,
  Plus,
  Edit2
} from 'lucide-react';
import { SavedLabel, Category } from '../types';
import { labelsApi, categoriesApi } from '../services/api';
import { useToast } from '../context/ToastContext';
import { DeleteModal } from '../components/common/DeleteModal';
import { PrintableLabel } from '../components/label/PrintableLabel';

interface SavedLabelsProps {
  onDuplicate: (label: SavedLabel) => void;
  onEdit: (label: SavedLabel) => void;
  onNavigateToCreate: () => void;
}

export const SavedLabels: React.FC<SavedLabelsProps> = ({
  onDuplicate,
  onEdit,
  onNavigateToCreate,
}) => {
  const toast = useToast();
  const [labels, setLabels] = useState<SavedLabel[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // View Modal
  const [viewingLabel, setViewingLabel] = useState<SavedLabel | null>(null);

  // Delete State
  const [deleteTarget, setDeleteTarget] = useState<SavedLabel | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Active Print Target
  const [printTarget, setPrintTarget] = useState<SavedLabel | null>(null);
  const [printCopies, setPrintCopies] = useState<number>(1);

  useEffect(() => {
    categoriesApi.getAll().then(setCategories).catch(console.error);
  }, []);

  useEffect(() => {
    loadSavedLabels();
  }, [searchQuery, selectedCategoryFilter]);

  const loadSavedLabels = async () => {
    try {
      setIsLoading(true);
      const data = await labelsApi.getAll({
        search: searchQuery,
        category_id: selectedCategoryFilter || undefined,
      });
      setLabels(data);
    } catch (err) {
      toast.error('Failed to load saved labels history.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrintLabel = (lbl: SavedLabel) => {
    setPrintTarget(lbl);
    setTimeout(() => {
      window.print();
    }, 150);
  };

  const handlePrintCopiesChange = (value: string) => {
    const nextCopies = Number(value);
    setPrintCopies(Number.isFinite(nextCopies) ? Math.min(100, Math.max(1, nextCopies)) : 1);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await labelsApi.delete(deleteTarget.id);
      toast.success('Saved label record deleted successfully.');
      setDeleteTarget(null);
      loadSavedLabels();
    } catch (err) {
      toast.error('Failed to delete saved label.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Saved Labels</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Archived production labels with historical master data snapshots for auditing and reprinting
          </p>
        </div>
        <button
          onClick={onNavigateToCreate}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold shadow-sm shadow-blue-500/20 transition cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Label</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search saved labels by product name, category, month or year..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
          />
        </div>

        <select
          value={selectedCategoryFilter}
          onChange={(e) => setSelectedCategoryFilter(e.target.value)}
          className="w-full sm:w-48 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>

        <div className="w-full sm:w-36">
          <label className="sr-only" htmlFor="saved-label-print-copies">Print Copies</label>
          <input
            id="saved-label-print-copies"
            type="number"
            min="1"
            max="100"
            value={printCopies}
            onChange={(e) => handlePrintCopiesChange(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 font-semibold font-mono focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
            title="Number of labels to print"
            aria-label="Number of labels to print"
          />
        </div>
      </div>

      {/* Saved Labels Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 uppercase tracking-wider font-semibold border-b border-slate-200/80">
              <tr>
                <th className="py-3 px-5">Date Created</th>
                <th className="py-3 px-5">Product Model</th>
                <th className="py-3 px-5">Category</th>
                <th className="py-3 px-5">Mfg Date</th>
                <th className="py-3 px-5">MRP (₹)</th>
                <th className="py-3 px-5">Saved By</th>
                <th className="py-3 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <div className="flex items-center justify-center gap-2">
                      <span className="w-5 h-5 border-2 border-blue-600/30 border-t-blue-600 rounded-full animate-spin" />
                      <span>Loading saved labels...</span>
                    </div>
                  </td>
                </tr>
              ) : labels.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <div className="max-w-xs mx-auto space-y-2">
                      <FolderHeart className="w-8 h-8 text-slate-300 mx-auto" />
                      <p className="font-semibold text-slate-700 text-sm">No Saved Labels Found</p>
                      <p className="text-xs text-slate-400">
                        Labels created from the operator screen will appear here.
                      </p>
                      <button
                        onClick={onNavigateToCreate}
                        className="mt-2 px-3 py-1.5 bg-blue-50 text-blue-600 font-semibold rounded-lg hover:bg-blue-100 text-xs transition"
                      >
                        + Create Label
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                labels.map((lbl) => (
                  <tr key={lbl.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-5 text-slate-500 font-mono text-[11px]">
                      {lbl.created_at ? new Date(lbl.created_at).toLocaleDateString() : '-'}
                    </td>
                    <td className="py-3.5 px-5">
                      <div className="font-bold text-slate-900 text-sm">{lbl.product_name}</div>
                    </td>
                    <td className="py-3.5 px-5">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium">
                        {lbl.category_name || 'Standard'}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 font-semibold text-slate-700">
                      {lbl.month} {lbl.year}
                    </td>
                    <td className="py-3.5 px-5 font-mono font-bold text-slate-900">
                      ₹{Number(lbl.mrp).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3.5 px-5 text-slate-600">
                      <span className="inline-flex items-center gap-1 text-[11px]">
                        <User className="w-3 h-3 text-slate-400" />
                        {lbl.created_by || 'Admin'}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-right space-x-1">
                      <button
                        onClick={() => onEdit(lbl)}
                        className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition cursor-pointer"
                        title="Edit All Fields"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setViewingLabel(lbl)}
                        className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                        title="View Label Preview"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handlePrintLabel(lbl)}
                        className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition cursor-pointer"
                        title="Print Label"
                      >
                        <Printer className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDuplicate(lbl)}
                        className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition cursor-pointer"
                        title="Duplicate into Editor"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(lbl)}
                        className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                        title="Delete Label"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Saved Label Modal */}
      {viewingLabel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Saved Label Preview</h3>
                <p className="text-xs text-slate-400">{viewingLabel.product_name} • {viewingLabel.month} {viewingLabel.year}</p>
              </div>
              <button
                onClick={() => setViewingLabel(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 overflow-auto flex-1 flex justify-center items-start bg-slate-100">
              <div className="origin-top scale-[0.78]">
                <PrintableLabel
                  snapshot={viewingLabel.snapshot}
                  copies={1}
                  isPrintMode={false}
                />
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 flex items-center justify-end gap-2 bg-white">
              <button
                onClick={() => setViewingLabel(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl text-xs transition cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => {
                  const toPrint = viewingLabel;
                  setViewingLabel(null);
                  handlePrintLabel(toPrint);
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-xs transition flex items-center gap-1.5 shadow-sm shadow-blue-500/20 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print ({printCopies})</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Standalone hidden print render for direct list item printing */}
      {printTarget && (
        <div id="printable-label-hidden-root" className="print-hidden-root">
          <PrintableLabel
            snapshot={printTarget.snapshot}
            copies={printCopies}
            isPrintMode={true}
          />
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteModal
        isOpen={!!deleteTarget}
        title="Delete Saved Label"
        itemName={`${deleteTarget?.product_name} (${deleteTarget?.month} ${deleteTarget?.year})`}
        isDeleting={isDeleting}
        onConfirm={handleDeleteConfirm}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
};
