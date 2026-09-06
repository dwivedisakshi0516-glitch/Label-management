import React, { useMemo, useState } from 'react';
import { CheckCircle2, FileSpreadsheet, FileText, Upload, X } from 'lucide-react';
import * as XLSX from 'xlsx';
import * as pdfjsLib from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.mjs?url';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

export type ImportedRow = Record<string, string | number>;

interface ImportedFileTableProps {
  onRowSelect?: (row: ImportedRow) => void;
  selectActionLabel?: string;
}

const splitPdfLine = (line: string) =>
  line
    .trim()
    .split(/\s{2,}|\t+/)
    .map((part) => part.trim())
    .filter(Boolean);

const normalizeMatrix = (matrix: Array<Array<string | number | null | undefined>>) => {
  const cleanRows = matrix
    .map((row) => row.map((cell) => (cell ?? '').toString().trim()))
    .filter((row) => row.some(Boolean));

  if (cleanRows.length === 0) {
    return { headers: [], rows: [] as ImportedRow[] };
  }

  const firstRow = cleanRows[0];
  const hasHeader = firstRow.some((cell) => Number.isNaN(Number(cell)) && cell.length > 0);
  const columnCount = Math.max(...cleanRows.map((row) => row.length));
  const headers = Array.from({ length: columnCount }, (_, index) => {
    const header = hasHeader ? firstRow[index] : '';
    return header || `Column ${index + 1}`;
  });
  const dataRows = hasHeader ? cleanRows.slice(1) : cleanRows;

  return {
    headers,
    rows: dataRows.map((row) =>
      headers.reduce<ImportedRow>((record, header, index) => {
        record[header] = row[index] || '';
        return record;
      }, {})
    ),
  };
};

export const ImportedFileTable: React.FC<ImportedFileTableProps> = ({
  onRowSelect,
  selectActionLabel = 'Use',
}) => {
  const [fileName, setFileName] = useState('');
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<ImportedRow[]>([]);
  const [rawPdfLines, setRawPdfLines] = useState<string[]>([]);
  const [isParsing, setIsParsing] = useState(false);
  const [error, setError] = useState('');

  const fileType = useMemo(() => {
    if (!fileName) return '';
    return fileName.toLowerCase().endsWith('.pdf') ? 'PDF' : 'Spreadsheet';
  }, [fileName]);

  const parseSpreadsheet = async (file: File) => {
    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: 'array' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const matrix = XLSX.utils.sheet_to_json<Array<string | number>>(sheet, {
      header: 1,
      defval: '',
      blankrows: false,
    });
    return normalizeMatrix(matrix);
  };

  const parsePdf = async (file: File) => {
    const buffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
    const lines: string[] = [];

    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
      const page = await pdf.getPage(pageNumber);
      const content = await page.getTextContent();
      const pageLines = content.items
        .map((item) => ('str' in item ? item.str : ''))
        .join(' ')
        .split(/\r?\n|(?<=\S)\s{4,}(?=\S)/)
        .map((line) => line.trim())
        .filter(Boolean);
      lines.push(...pageLines);
    }

    const matrix = lines.map(splitPdfLine);
    const normalized = normalizeMatrix(matrix);
    return { ...normalized, lines };
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsParsing(true);
    setError('');
    setFileName(file.name);
    setRawPdfLines([]);

    try {
      const lowerName = file.name.toLowerCase();
      const parsed = lowerName.endsWith('.pdf')
        ? await parsePdf(file)
        : await parseSpreadsheet(file);

      setHeaders(parsed.headers);
      setRows(parsed.rows);
      setRawPdfLines('lines' in parsed ? parsed.lines : []);
    } catch (err) {
      console.error('File import failed', err);
      setHeaders([]);
      setRows([]);
      setError('Unable to read this file. Please upload a valid Excel, CSV, or text-based PDF file.');
    } finally {
      setIsParsing(false);
      event.target.value = '';
    }
  };

  const clearImport = () => {
    setFileName('');
    setHeaders([]);
    setRows([]);
    setRawPdfLines([]);
    setError('');
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
      <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
            {fileType === 'PDF' ? <FileText className="w-4 h-4" /> : <FileSpreadsheet className="w-4 h-4" />}
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Import Excel or PDF Details</h3>
            <p className="text-xs text-slate-500">
              {fileName ? `${fileName} • ${rows.length} rows found` : 'Upload a file to list its details in a table'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {fileName && (
            <button
              type="button"
              onClick={clearImport}
              className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
              title="Clear imported file"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <label className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold cursor-pointer transition">
            <Upload className="w-4 h-4" />
            <span>{isParsing ? 'Reading...' : 'Upload File'}</span>
            <input
              type="file"
              accept=".xlsx,.xls,.csv,.pdf,application/pdf,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv"
              onChange={handleFileChange}
              disabled={isParsing}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {error && (
        <div className="m-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-semibold text-rose-700">
          {error}
        </div>
      )}

      {headers.length > 0 && (
        <div className="overflow-x-auto max-h-96">
          <table className="w-full text-left text-xs">
            <thead className="sticky top-0 bg-slate-50 text-slate-600 uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 font-bold">#</th>
                {onRowSelect && <th className="py-3 px-4 font-bold">Action</th>}
                {headers.map((header) => (
                  <th key={header} className="py-3 px-4 font-bold whitespace-nowrap">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((row, rowIndex) => (
                <tr key={`${fileName}-${rowIndex}`} className="hover:bg-slate-50/80">
                  <td className="py-3 px-4 text-slate-400 font-mono">{rowIndex + 1}</td>
                  {onRowSelect && (
                    <td className="py-3 px-4">
                      <button
                        type="button"
                        onClick={() => onRowSelect(row)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-xs font-semibold transition cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{selectActionLabel}</span>
                      </button>
                    </td>
                  )}
                  {headers.map((header) => (
                    <td key={header} className="py-3 px-4 text-slate-800 whitespace-pre-wrap min-w-36">
                      {row[header]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {fileType === 'PDF' && rawPdfLines.length > 0 && headers.length <= 1 && (
        <div className="border-t border-slate-100 p-4">
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Extracted PDF Text</h4>
          <div className="max-h-64 overflow-y-auto rounded-xl bg-slate-50 border border-slate-200 p-3 text-xs text-slate-700 space-y-1">
            {rawPdfLines.map((line, index) => (
              <p key={`${line}-${index}`}>{line}</p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
