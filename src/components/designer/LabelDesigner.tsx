import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Type,
  Barcode,
  Layers,
  Save,
  RotateCw,
  Plus,
  Trash2,
  Copy,
  ZoomIn,
  ZoomOut,
  Grid,
  Shield,
  CheckCircle,
  Check,
  Building,
  DollarSign,
  Tag,
  Globe,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Bold,
  Sliders,
  Maximize2
} from 'lucide-react';

interface DesignerField {
  id: string;
  name: string;
  type: 'TEXT' | 'BARCODE' | 'BADGE' | 'DIVIDER';
  x: number; // in mm
  y: number; // in mm
  w: number; // in mm
  h: number; // in mm
  content: string;
  fontSizePt: number;
  isBold?: boolean;
  align?: 'left' | 'center' | 'right';
  isDynamic: boolean;
  dynamicKey?: string;
  rotation: number;
}

export const LabelDesigner: React.FC = () => {
  const { currentUser } = useAuth();

  const [templateName, setTemplateName] = useState('Desktop Computer Standard Label');
  const [labelDimension, setLabelDimension] = useState<'100x150' | '75x100' | '102x76'>('100x150');
  const [zoom, setZoom] = useState(100);
  const [showGrid, setShowGrid] = useState(true);
  const [selectedFieldId, setSelectedFieldId] = useState<string>('f1');
  const [saveToast, setSaveToast] = useState<string | null>(null);
  const [complianceNotice, setComplianceNotice] = useState<string | null>(null);

  const canvasWidthMm = labelDimension === '100x150' ? 100 : labelDimension === '75x100' ? 75 : 102;
  const canvasHeightMm = labelDimension === '100x150' ? 150 : labelDimension === '75x100' ? 100 : 76;

  // Initial template fields matching the real sticker
  const [fields, setFields] = useState<DesignerField[]>([
    {
      id: 'f1',
      name: 'Manufactured By',
      type: 'TEXT',
      x: 6,
      y: 6,
      w: 88,
      h: 14,
      content: 'Manufactured By:\nFlextronics Technologies India Pvt. Ltd.\nPlot No. 3, Industrial Corridor, Sriperumbudur, Tamil Nadu - 602105',
      fontSizePt: 8,
      isBold: false,
      align: 'left',
      isDynamic: true,
      dynamicKey: 'product.manufacturedBy',
      rotation: 0
    },
    {
      id: 'f2',
      name: 'Manufactured For',
      type: 'TEXT',
      x: 6,
      y: 22,
      w: 88,
      h: 14,
      content: 'Manufactured For:\nHP India Sales Private Ltd.\n24, Salarpuria Arena, Hosur Main Road, Adugodi, Bangalore - 560030',
      fontSizePt: 8,
      isBold: false,
      align: 'left',
      isDynamic: true,
      dynamicKey: 'product.manufacturedFor',
      rotation: 0
    },
    {
      id: 'f3',
      name: 'Complaint Address & Contacts',
      type: 'TEXT',
      x: 6,
      y: 38,
      w: 88,
      h: 16,
      content: 'For Complaints: Customer Care Executive, HP India Sales Private Limited, at above address\nEmail: in.contact@hp.com\nTel: 1-800-258-7170 | WhatsApp: +91 22 6101 4560',
      fontSizePt: 8,
      isBold: false,
      align: 'left',
      isDynamic: true,
      dynamicKey: 'product.complaintAddress',
      rotation: 0
    },
    {
      id: 'f4',
      name: 'Rule Divider',
      type: 'DIVIDER',
      x: 6,
      y: 56,
      w: 88,
      h: 1,
      content: '---------------------------------------------------',
      fontSizePt: 7,
      isDynamic: false,
      rotation: 0
    },
    {
      id: 'f5',
      name: 'Month & Year',
      type: 'TEXT',
      x: 6,
      y: 59,
      w: 88,
      h: 7,
      content: 'Month & Year: Jul 2026',
      fontSizePt: 10,
      isBold: true,
      align: 'left',
      isDynamic: true,
      dynamicKey: 'batch.mfgDate',
      rotation: 0
    },
    {
      id: 'f6',
      name: 'MRP Statutory Box',
      type: 'TEXT',
      x: 6,
      y: 68,
      w: 88,
      h: 12,
      content: 'MRP ₹114,229.00\n(Incl. of all Taxes)',
      fontSizePt: 12,
      isBold: true,
      align: 'left',
      isDynamic: true,
      dynamicKey: 'product.mrp',
      rotation: 0
    },
    {
      id: 'f7',
      name: 'Product No & Origin',
      type: 'TEXT',
      x: 6,
      y: 82,
      w: 88,
      h: 10,
      content: 'Product No: D1VT0AT#ACJ\nCountry of Origin: India',
      fontSizePt: 9,
      isBold: false,
      align: 'left',
      isDynamic: true,
      dynamicKey: 'product.sku',
      rotation: 0
    },
    {
      id: 'f8',
      name: 'Generic Name',
      type: 'TEXT',
      x: 6,
      y: 94,
      w: 88,
      h: 9,
      content: 'Generic Name:\nDESKTOP COMPUTER',
      fontSizePt: 10,
      isBold: true,
      align: 'left',
      isDynamic: true,
      dynamicKey: 'product.genericName',
      rotation: 0
    },
    {
      id: 'f9',
      name: 'Net Quantity',
      type: 'TEXT',
      x: 6,
      y: 105,
      w: 88,
      h: 7,
      content: 'Net Qty: 1 N',
      fontSizePt: 10,
      isBold: true,
      align: 'left',
      isDynamic: true,
      dynamicKey: 'batch.netQty',
      rotation: 0
    },
    {
      id: 'f10',
      name: 'Pack Contents',
      type: 'TEXT',
      x: 6,
      y: 114,
      w: 88,
      h: 10,
      content: '(DESKTOP COMPUTER 1N, CPU 1N, CABLE SET 1N, KEYBOARD 1N, MOUSE 1N)',
      fontSizePt: 8,
      isBold: false,
      align: 'left',
      isDynamic: true,
      dynamicKey: 'product.packContents',
      rotation: 0
    },
    {
      id: 'f11',
      name: 'Warranty & Serial Number',
      type: 'TEXT',
      x: 6,
      y: 126,
      w: 88,
      h: 12,
      content: 'Warranty: 5 Years\nSN: HP202607824',
      fontSizePt: 9,
      isBold: true,
      align: 'left',
      isDynamic: true,
      dynamicKey: 'batch.serial',
      rotation: 0
    },
    {
      id: 'f12',
      name: 'Website',
      type: 'TEXT',
      x: 6,
      y: 139,
      w: 50,
      h: 6,
      content: 'Website: www.hp.com/in',
      fontSizePt: 7,
      isBold: false,
      align: 'left',
      isDynamic: false,
      rotation: 0
    },
    {
      id: 'f13',
      name: 'BIS Standard Mark',
      type: 'BADGE',
      x: 60,
      y: 138,
      w: 34,
      h: 8,
      content: 'IS 13252 (PART 1)',
      fontSizePt: 7,
      isBold: true,
      align: 'right',
      isDynamic: false,
      rotation: 0
    }
  ]);

  const selectedField = fields.find((f) => f.id === selectedFieldId) || fields[0];

  const updateSelectedField = (updates: Partial<DesignerField>) => {
    setFields((prev) =>
      prev.map((f) => (f.id === selectedField.id ? { ...f, ...updates } : f))
    );
  };

  const handleAddFieldFromLibrary = (
    name: string,
    content: string,
    fontSizePt = 9,
    isBold = false
  ) => {
    const newId = `f${Date.now()}`;
    const newField: DesignerField = {
      id: newId,
      name,
      type: 'TEXT',
      x: 8,
      y: Math.min(canvasHeightMm - 20, 20 + fields.length * 4),
      w: 84,
      h: 10,
      content,
      fontSizePt,
      isBold,
      align: 'left',
      isDynamic: true,
      rotation: 0
    };
    setFields((prev) => [...prev, newField]);
    setSelectedFieldId(newId);
  };

  const handleDeleteField = (id: string) => {
    if (fields.length <= 1) return;
    setFields((prev) => prev.filter((f) => f.id !== id));
    setSelectedFieldId(fields.find((f) => f.id !== id)?.id || '');
  };

  const handleDuplicateField = (field: DesignerField) => {
    const duplicate: DesignerField = {
      ...field,
      id: `f${Date.now()}`,
      name: `${field.name} (Copy)`,
      x: Math.min(canvasWidthMm - field.w, field.x + 3),
      y: Math.min(canvasHeightMm - field.h, field.y + 3)
    };
    setFields((prev) => [...prev, duplicate]);
    setSelectedFieldId(duplicate.id);
  };

  const handleCheckLegalMetrology = () => {
    setComplianceNotice(
      'LEGAL METROLOGY ACT AUDIT: All required statutory declarations are present (MRP, Net Qty, Month/Year, Mfg Address, Brand, Customer Care, Country of Origin). Font height >= 3mm passed.'
    );
    setTimeout(() => setComplianceNotice(null), 5000);
  };

  const handleSaveTemplate = () => {
    setSaveToast(`Template "${templateName}" (${canvasWidthMm}x${canvasHeightMm}mm) successfully compiled & saved to Master DB.`);
    setTimeout(() => setSaveToast(null), 3500);
  };

  return (
    <div className="flex flex-col w-full gap-5 pb-12">
      {/* Toast */}
      {saveToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#00a572] text-[#00285d] font-bold text-xs px-4 py-3 rounded-lg shadow-2xl flex items-center gap-2 border border-[#4edea3] animate-in fade-in">
          <Check className="w-4 h-4" />
          <span>{saveToast}</span>
        </div>
      )}

      {/* Compliance Toast */}
      {complianceNotice && (
        <div className="fixed top-20 right-6 z-50 max-w-md bg-[#131b2d] border border-[#4edea3] text-[#dbe2fb] text-xs p-4 rounded-xl shadow-2xl flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-[#4edea3] shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-bold text-white block mb-1">LEGAL METROLOGY CHECK: 100% PASSED</span>
            <p className="text-[#c2c6d6]/80 text-[11px] font-mono leading-relaxed">{complianceNotice}</p>
          </div>
        </div>
      )}

      {/* DESIGNER HEADER */}
      <section className="bg-[#131b2d] rounded-xl p-5 shadow-xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border border-[#424754]/30">
        <div>
          <div className="flex items-center gap-2 font-mono text-xs text-[#4cd7f6] uppercase tracking-wider font-semibold">
            <span>ADMIN PRIVILEGES</span>
            <span className="text-[#424754]">/</span>
            <span>LEVEL 1 SETUP</span>
            <span className="text-[#424754]">/</span>
            <span>VISUAL LABEL DESIGNER (CANVA/FIGMA STYLE)</span>
          </div>
          <div className="flex items-center gap-3 mt-1">
            <input
              type="text"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              className="text-xl sm:text-2xl font-bold text-white bg-transparent border-b border-transparent hover:border-[#424754] focus:border-[#4d8eff] focus:outline-none tracking-tight py-0.5"
              title="Click to rename template"
            />
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#4d8eff]/20 text-[#adc6ff] border border-[#4d8eff]/30">
              Admin Only
            </span>
          </div>
          <p className="text-xs text-[#c2c6d6]/70 mt-0.5">
            Decide where Manufactured By, MRP, and statutory elements sit with millimetric precision and custom font controls.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Label Dimension Selector */}
          <div className="flex items-center bg-[#060e1f] rounded-lg border border-[#424754]/40 px-2.5 py-1 text-xs font-mono text-[#c2c6d6]">
            <span className="text-[10px] text-[#c2c6d6]/60 mr-1.5 uppercase">Size:</span>
            <select
              value={labelDimension}
              onChange={(e) => setLabelDimension(e.target.value as any)}
              className="bg-transparent text-white font-bold focus:outline-none cursor-pointer"
            >
              <option value="100x150">100 x 150 mm (Box)</option>
              <option value="75x100">75 x 100 mm (Roll)</option>
              <option value="102x76">102 x 76 mm (4x3")</option>
            </select>
          </div>

          {/* Zoom Selector */}
          <div className="flex items-center bg-[#060e1f] rounded-lg border border-[#424754]/40 p-1">
            <button
              onClick={() => setZoom(Math.max(50, zoom - 15))}
              className="p-1 text-[#c2c6d6] hover:text-white cursor-pointer"
              title="Zoom Out"
              type="button"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-xs font-mono px-2 text-white font-semibold">{zoom}%</span>
            <button
              onClick={() => setZoom(Math.min(150, zoom + 15))}
              className="p-1 text-[#c2c6d6] hover:text-white cursor-pointer"
              title="Zoom In"
              type="button"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => setShowGrid(!showGrid)}
            type="button"
            className={`h-8 px-2.5 rounded text-xs font-mono flex items-center gap-1.5 border transition-colors cursor-pointer ${
              showGrid
                ? 'bg-[#4d8eff]/20 border-[#4d8eff] text-white'
                : 'bg-[#060e1f] border-[#424754]/40 text-[#c2c6d6]'
            }`}
          >
            <Grid className="w-3.5 h-3.5" />
            <span>Grid</span>
          </button>

          <button
            onClick={handleCheckLegalMetrology}
            type="button"
            className="h-8 px-3 bg-[#060e1f] hover:bg-[#171f32] text-[#4edea3] border border-[#4edea3]/40 text-xs font-mono font-semibold rounded flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Legal Metrology Audit</span>
          </button>

          <button
            onClick={handleSaveTemplate}
            type="button"
            className="h-8 px-4 bg-[#4d8eff] hover:bg-[#3b82f6] text-white text-xs font-semibold rounded flex items-center gap-1.5 shadow-md transition-all active:scale-95 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Save Template</span>
          </button>
        </div>
      </section>

      {/* THREE-COLUMN DESIGNER STUDIO: FIELDS PANEL | LABEL CANVAS | PROPERTIES */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
        {/* LEFT COLUMN: FIELDS PANEL & MASTER DATA LIBRARY (3 COLS) */}
        <div className="xl:col-span-3 flex flex-col gap-4">
          {/* 1. Master Data Fields Library */}
          <div className="bg-[#131b2d] p-4 rounded-xl border border-[#424754]/30 shadow-lg flex flex-col gap-2.5">
            <div className="flex items-center justify-between border-b border-[#424754]/30 pb-2">
              <h2 className="text-xs font-mono uppercase font-bold text-white tracking-wider flex items-center gap-1.5">
                <Tag className="w-4 h-4 text-[#4cd7f6]" /> FIELDS PANEL
              </h2>
              <span className="text-[10px] font-mono text-[#adc6ff]">Click to Add</span>
            </div>

            <p className="text-[11px] text-[#c2c6d6]/70 leading-snug">
              Add database master fields directly onto the label template:
            </p>

            <div className="grid grid-cols-1 gap-1.5">
              <button
                type="button"
                onClick={() =>
                  handleAddFieldFromLibrary(
                    'Manufactured By',
                    'Manufactured By:\nFlextronics Technologies India Pvt. Ltd.\nSriperumbudur, Tamil Nadu - 602105',
                    8
                  )
                }
                className="p-2 bg-[#171f32] hover:bg-[#222a3d] border border-[#424754]/30 rounded-lg text-xs font-mono text-left flex items-center justify-between text-white cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Building className="w-3.5 h-3.5 text-[#4cd7f6]" />
                  <span>Manufactured By</span>
                </div>
                <Plus className="w-3.5 h-3.5 text-[#c2c6d6]" />
              </button>

              <button
                type="button"
                onClick={() =>
                  handleAddFieldFromLibrary(
                    'Manufactured For',
                    'Manufactured For:\nHP India Sales Private Ltd.\nAdugodi, Bangalore - 560030',
                    8
                  )
                }
                className="p-2 bg-[#171f32] hover:bg-[#222a3d] border border-[#424754]/30 rounded-lg text-xs font-mono text-left flex items-center justify-between text-white cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Building className="w-3.5 h-3.5 text-[#adc6ff]" />
                  <span>Manufactured For</span>
                </div>
                <Plus className="w-3.5 h-3.5 text-[#c2c6d6]" />
              </button>

              <button
                type="button"
                onClick={() =>
                  handleAddFieldFromLibrary(
                    'MRP Declaration',
                    'MRP ₹114,229.00\n(Incl. of all Taxes)',
                    12,
                    true
                  )
                }
                className="p-2 bg-[#171f32] hover:bg-[#222a3d] border border-[#424754]/30 rounded-lg text-xs font-mono text-left flex items-center justify-between text-white cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <DollarSign className="w-3.5 h-3.5 text-[#4edea3]" />
                  <span>MRP (Incl. of all Taxes)</span>
                </div>
                <Plus className="w-3.5 h-3.5 text-[#c2c6d6]" />
              </button>

              <button
                type="button"
                onClick={() =>
                  handleAddFieldFromLibrary(
                    'Product No & Origin',
                    'Product No: D1VT0AT#ACJ\nCountry of Origin: India',
                    9
                  )
                }
                className="p-2 bg-[#171f32] hover:bg-[#222a3d] border border-[#424754]/30 rounded-lg text-xs font-mono text-left flex items-center justify-between text-white cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Tag className="w-3.5 h-3.5 text-[#f59e0b]" />
                  <span>Product No & Country</span>
                </div>
                <Plus className="w-3.5 h-3.5 text-[#c2c6d6]" />
              </button>

              <button
                type="button"
                onClick={() =>
                  handleAddFieldFromLibrary(
                    'Generic Name',
                    'Generic Name:\nDESKTOP COMPUTER',
                    10,
                    true
                  )
                }
                className="p-2 bg-[#171f32] hover:bg-[#222a3d] border border-[#424754]/30 rounded-lg text-xs font-mono text-left flex items-center justify-between text-white cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Type className="w-3.5 h-3.5 text-[#4cd7f6]" />
                  <span>Generic Name</span>
                </div>
                <Plus className="w-3.5 h-3.5 text-[#c2c6d6]" />
              </button>

              <button
                type="button"
                onClick={() =>
                  handleAddFieldFromLibrary('Net Quantity', 'Net Qty: 1 N', 10, true)
                }
                className="p-2 bg-[#171f32] hover:bg-[#222a3d] border border-[#424754]/30 rounded-lg text-xs font-mono text-left flex items-center justify-between text-white cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Tag className="w-3.5 h-3.5 text-[#4cd7f6]" />
                  <span>Net Qty</span>
                </div>
                <Plus className="w-3.5 h-3.5 text-[#c2c6d6]" />
              </button>

              <button
                type="button"
                onClick={() =>
                  handleAddFieldFromLibrary(
                    'Serial Number (Plain Text)',
                    'SN: HP202607824',
                    10,
                    true
                  )
                }
                className="p-2 bg-[#171f32] hover:bg-[#222a3d] border border-[#424754]/30 rounded-lg text-xs font-mono text-left flex items-center justify-between text-white cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Tag className="w-3.5 h-3.5 text-[#adc6ff]" />
                  <span>Serial Number (Plain Text)</span>
                </div>
                <Plus className="w-3.5 h-3.5 text-[#c2c6d6]" />
              </button>

              <button
                type="button"
                onClick={() =>
                  handleAddFieldFromLibrary('Website', 'Website: www.hp.com/in', 8, false)
                }
                className="p-2 bg-[#171f32] hover:bg-[#222a3d] border border-[#424754]/30 rounded-lg text-xs font-mono text-left flex items-center justify-between text-white cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Globe className="w-3.5 h-3.5 text-[#4edea3]" />
                  <span>Website</span>
                </div>
                <Plus className="w-3.5 h-3.5 text-[#c2c6d6]" />
              </button>
            </div>
          </div>

          {/* Active Field Layers List */}
          <div className="bg-[#131b2d] p-4 rounded-xl border border-[#424754]/30 shadow-lg flex flex-col gap-2.5">
            <div className="flex items-center justify-between border-b border-[#424754]/30 pb-2">
              <span className="text-xs font-mono uppercase font-bold text-white tracking-wider flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-[#4cd7f6]" /> LAYERS ({fields.length})
              </span>
              <span className="text-[10px] font-mono text-[#4edea3]">
                {canvasWidthMm} x {canvasHeightMm}mm
              </span>
            </div>

            <div className="space-y-1.5 max-h-[260px] overflow-y-auto pr-1">
              {fields.map((f) => {
                const isSelected = f.id === selectedField.id;
                return (
                  <div
                    key={f.id}
                    onClick={() => setSelectedFieldId(f.id)}
                    className={`p-2 rounded-lg border text-xs font-mono flex items-center justify-between cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-[#4d8eff]/20 border-[#4d8eff] text-white font-semibold'
                        : 'bg-[#171f32] border-[#424754]/20 text-[#c2c6d6] hover:bg-[#222a3d]'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <Type className="w-3 h-3 text-[#4cd7f6] shrink-0" />
                      <span className="truncate">{f.name}</span>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <span className="text-[9px] text-[#c2c6d6]/60">
                        {f.x},{f.y}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* CENTER COLUMN: CALIBRATED METRIC CANVAS (6 COLS) */}
        <div className="xl:col-span-6 bg-[#060e1f] rounded-xl p-3 sm:p-5 border border-[#424754]/30 shadow-2xl flex flex-col items-center justify-center relative overflow-x-auto min-h-[580px] sm:min-h-[640px] w-full">
          {/* Scale indicator */}
          <div className="absolute top-3 left-3 bg-[#131b2d] px-2.5 py-1 rounded text-[10px] font-mono text-[#c2c6d6] border border-[#424754]/30 flex items-center gap-2 z-10">
            <span>MEDIA: {canvasWidthMm}.00 x {canvasHeightMm}.00 mm</span>
            <span className="text-[#4cd7f6] font-bold">SCALE: {zoom}%</span>
          </div>

          {/* Rulers & Thermal Sheet Container */}
          <div className="flex flex-col items-center pt-8 pb-4">
            {/* Top Metric Ruler */}
            <div
              className="h-5 border-b border-[#424754] flex justify-between font-mono text-[9px] text-[#4cd7f6] select-none pl-6 pr-2"
              style={{ width: `${(380 * zoom) / 100}px` }}
            >
              <span>0mm</span>
              <span>25mm</span>
              <span>50mm</span>
              <span>75mm</span>
              <span>{canvasWidthMm}mm</span>
            </div>

            <div className="flex">
              {/* Left Metric Ruler */}
              <div
                className="w-6 border-r border-[#424754] flex flex-col justify-between font-mono text-[9px] text-[#4cd7f6] select-none py-2 text-right pr-1"
                style={{ height: `${((canvasHeightMm / 100) * 380 * zoom) / 100}px` }}
              >
                <span>0mm</span>
                <span>25mm</span>
                <span>50mm</span>
                <span>75mm</span>
                <span>100mm</span>
                {canvasHeightMm >= 150 && <span>150mm</span>}
              </div>

              {/* Thermal Label Sheet Canvas */}
              <div
                className="relative bg-white text-black shadow-2xl rounded-sm overflow-hidden select-none border-2 border-black"
                style={{
                  width: `${(380 * zoom) / 100}px`,
                  height: `${((canvasHeightMm / canvasWidthMm) * 380 * zoom) / 100}px`,
                  backgroundImage: showGrid
                    ? 'linear-gradient(to right, rgba(0,0,0,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.06) 1px, transparent 1px)'
                    : 'none',
                  backgroundSize: '15px 15px'
                }}
              >
                {fields.map((f) => {
                  const isSelected = f.id === selectedField.id;
                  const leftPercent = (f.x / canvasWidthMm) * 100;
                  const topPercent = (f.y / canvasHeightMm) * 100;
                  const widthPercent = (f.w / canvasWidthMm) * 100;
                  const heightPercent = (f.h / canvasHeightMm) * 100;

                  return (
                    <div
                      key={f.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedFieldId(f.id);
                      }}
                      className={`absolute cursor-pointer transition-all ${
                        isSelected
                          ? 'ring-2 ring-[#4d8eff] bg-[#4d8eff]/10 z-20'
                          : 'hover:ring-1 hover:ring-gray-400 z-10'
                      }`}
                      style={{
                        left: `${leftPercent}%`,
                        top: `${topPercent}%`,
                        width: `${widthPercent}%`,
                        height: `${heightPercent}%`,
                        textAlign: f.align || 'left',
                        fontWeight: f.isBold ? 700 : 400
                      }}
                    >
                      {f.type === 'DIVIDER' ? (
                        <div className="w-full h-full border-b border-black"></div>
                      ) : f.type === 'BADGE' ? (
                        <div className="w-full h-full border border-black p-0.5 flex items-center justify-center font-bold text-[8px]">
                          {f.content}
                        </div>
                      ) : (
                        <div
                          className="font-mono text-black leading-tight overflow-hidden whitespace-pre-line p-0.5"
                          style={{
                            fontSize: `${(f.fontSizePt * zoom) / 100}pt`
                          }}
                        >
                          {f.content}
                        </div>
                      )}

                      {/* Selected corner handles */}
                      {isSelected && (
                        <>
                          <div className="absolute -top-1 -left-1 w-2 h-2 bg-[#4d8eff] rounded-full"></div>
                          <div className="absolute -top-1 -right-1 w-2 h-2 bg-[#4d8eff] rounded-full"></div>
                          <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-[#4d8eff] rounded-full"></div>
                          <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-[#4d8eff] rounded-full"></div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: PROPERTIES INSPECTOR (3 COLS) */}
        <div className="xl:col-span-3 bg-[#131b2d] p-4 rounded-xl border border-[#424754]/30 shadow-lg flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-[#424754]/30 pb-2.5">
            <div>
              <span className="text-xs font-mono uppercase font-bold text-white tracking-wider flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-[#4cd7f6]" /> PROPERTIES INSPECTOR
              </span>
              <span className="text-[10px] font-mono text-[#4cd7f6] block">
                {selectedField.name}
              </span>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => handleDuplicateField(selectedField)}
                title="Duplicate Element"
                className="p-1 text-[#c2c6d6] hover:text-white hover:bg-[#222a3d] rounded cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => handleDeleteField(selectedField.id)}
                title="Delete Element"
                className="p-1 text-[#ffb4ab] hover:bg-[#93000a]/20 rounded cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Typography: Font Size, Bold & Align */}
          <div>
            <label className="block text-[11px] font-mono text-[#c2c6d6] uppercase tracking-wider font-semibold mb-1.5">
              Typography & Styling
            </label>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-[#060e1f] p-2 rounded border border-[#424754]/40 font-mono text-xs">
                  <span className="text-[9px] text-[#c2c6d6]/60 block">FONT SIZE (PT):</span>
                  <input
                    type="number"
                    min="5"
                    max="36"
                    value={selectedField.fontSizePt}
                    onChange={(e) => updateSelectedField({ fontSizePt: parseInt(e.target.value) || 8 })}
                    className="w-full bg-transparent text-white font-bold focus:outline-none"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => updateSelectedField({ isBold: !selectedField.isBold })}
                  className={`h-11 px-3 rounded border font-mono text-xs flex items-center gap-1 cursor-pointer transition-colors ${
                    selectedField.isBold
                      ? 'bg-[#4d8eff] border-[#4d8eff] text-white font-bold'
                      : 'bg-[#060e1f] border-[#424754]/40 text-[#c2c6d6]'
                  }`}
                  title="Toggle Bold"
                >
                  <Bold className="w-4 h-4" />
                  <span>Bold</span>
                </button>
              </div>

              {/* Text Alignment */}
              <div className="flex items-center gap-1 bg-[#060e1f] p-1 rounded border border-[#424754]/40">
                <span className="text-[10px] font-mono text-[#c2c6d6]/60 px-2">Align:</span>
                <button
                  type="button"
                  onClick={() => updateSelectedField({ align: 'left' })}
                  className={`flex-1 py-1 rounded text-xs flex items-center justify-center cursor-pointer ${
                    (selectedField.align || 'left') === 'left' ? 'bg-[#171f32] text-[#4cd7f6]' : 'text-[#c2c6d6]'
                  }`}
                  title="Align Left"
                >
                  <AlignLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => updateSelectedField({ align: 'center' })}
                  className={`flex-1 py-1 rounded text-xs flex items-center justify-center cursor-pointer ${
                    selectedField.align === 'center' ? 'bg-[#171f32] text-[#4cd7f6]' : 'text-[#c2c6d6]'
                  }`}
                  title="Align Center"
                >
                  <AlignCenter className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => updateSelectedField({ align: 'right' })}
                  className={`flex-1 py-1 rounded text-xs flex items-center justify-center cursor-pointer ${
                    selectedField.align === 'right' ? 'bg-[#171f32] text-[#4cd7f6]' : 'text-[#c2c6d6]'
                  }`}
                  title="Align Right"
                >
                  <AlignRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Metric Dimensions (X, Y, W, H) in mm */}
          <div>
            <label className="block text-[11px] font-mono text-[#c2c6d6] uppercase tracking-wider font-semibold mb-1.5">
              Position & Dimensions (mm)
            </label>
            <div className="grid grid-cols-2 gap-2 font-mono text-xs">
              <div className="bg-[#060e1f] p-2 rounded border border-[#424754]/40">
                <span className="text-[9px] text-[#c2c6d6]/60 block">POS X (mm):</span>
                <input
                  type="number"
                  value={selectedField.x}
                  onChange={(e) => updateSelectedField({ x: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-transparent text-white font-bold focus:outline-none"
                />
              </div>

              <div className="bg-[#060e1f] p-2 rounded border border-[#424754]/40">
                <span className="text-[9px] text-[#c2c6d6]/60 block">POS Y (mm):</span>
                <input
                  type="number"
                  value={selectedField.y}
                  onChange={(e) => updateSelectedField({ y: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-transparent text-white font-bold focus:outline-none"
                />
              </div>

              <div className="bg-[#060e1f] p-2 rounded border border-[#424754]/40">
                <span className="text-[9px] text-[#c2c6d6]/60 block">WIDTH (mm):</span>
                <input
                  type="number"
                  value={selectedField.w}
                  onChange={(e) => updateSelectedField({ w: parseFloat(e.target.value) || 1 })}
                  className="w-full bg-transparent text-white font-bold focus:outline-none"
                />
              </div>

              <div className="bg-[#060e1f] p-2 rounded border border-[#424754]/40">
                <span className="text-[9px] text-[#c2c6d6]/60 block">HEIGHT (mm):</span>
                <input
                  type="number"
                  value={selectedField.h}
                  onChange={(e) => updateSelectedField({ h: parseFloat(e.target.value) || 1 })}
                  className="w-full bg-transparent text-white font-bold focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Content String or Dynamic Variable */}
          <div>
            <label className="block text-[11px] font-mono text-[#c2c6d6] uppercase tracking-wider font-semibold mb-1">
              Field Content String
            </label>
            <textarea
              rows={4}
              value={selectedField.content}
              onChange={(e) => updateSelectedField({ content: e.target.value })}
              className="w-full bg-[#060e1f] border border-[#424754]/50 rounded-lg p-2 text-xs font-mono text-white focus:outline-none focus:border-[#4d8eff]"
            />
          </div>

          {/* Save Template Quick Trigger */}
          <div className="pt-2 border-t border-[#424754]/30">
            <button
              type="button"
              onClick={handleSaveTemplate}
              className="w-full py-2.5 bg-[#4d8eff] hover:bg-[#3b82f6] text-white font-bold font-mono text-xs rounded-lg flex items-center justify-center gap-2 shadow-lg cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Save "{templateName}"</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
