import React from 'react';
import { Upload } from 'lucide-react';
import { ImportedFileTable, ImportedRow } from '../components/import/ImportedFileTable';

interface ImportLabelsProps {
  onUseRow: (row: ImportedRow) => void;
}

export const ImportLabels: React.FC<ImportLabelsProps> = ({ onUseRow }) => {
  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Upload Excel / PDF</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Import label data, review rows, and send any record to Create Label for automatic prefill
          </p>
        </div>
        <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100">
          <Upload className="w-5 h-5" />
        </div>
      </div>

      <ImportedFileTable onRowSelect={onUseRow} selectActionLabel="Create Label" />
    </div>
  );
};
