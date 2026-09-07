import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Edit3,
  Save,
  Printer,
  RotateCcw,
  Eye,
  CheckCircle2,
  Box,
  Layers,
  Building2,
  Headphones,
  ShieldCheck,
  Check,
  FileText,
  Sliders,
  Sparkles,
  Maximize2,
  FolderHeart,
  X
} from 'lucide-react';
import { Category, Product, LabelTemplate, LabelSnapshot, SavedLabel } from '../types';
import { categoriesApi, productsApi, templatesApi, labelsApi, manufacturersApi, customerCareApi, warrantiesApi } from '../services/api';
import { useToast } from '../context/ToastContext';
import { PrintableLabel } from '../components/label/PrintableLabel';

interface EditLabelProps {
  labelToEdit?: SavedLabel | null;
  onNavigateToSaved?: () => void;
}

const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 10 }, (_, i) => (CURRENT_YEAR - 2 + i).toString());

const LABEL_SIZE_PRESETS = [
  { label: '4 × 6 in (101.6 × 152.4 mm)', widthMm: 101.6, heightMm: 152.4 },
  { label: '4 × 7 in (101.6 × 177.8 mm)', widthMm: 101.6, heightMm: 177.8 },
  { label: '3 × 5 in (76.2 × 127 mm)', widthMm: 76.2, heightMm: 127 },
  { label: '2 × 4 in (50.8 × 101.6 mm)', widthMm: 50.8, heightMm: 101.6 },
  { label: '100 × 150 mm', widthMm: 100, heightMm: 150 },
  { label: 'Custom Size', widthMm: 0, heightMm: 0 },
];

const BUILT_IN_TEMPLATE_KEYS = new Set([
  'manufactured_by',
  'manufactured_for',
  'for_complaints',
  'email',
  'telephone',
  'whatsapp',
  'month_year',
  'mrp',
  'product_number',
  'country_of_origin',
  'generic_name',
  'net_quantity',
  'pack_contents',
]);

export const EditLabel: React.FC<EditLabelProps> = ({
  labelToEdit,
  onNavigateToSaved,
}) => {
  const toast = useToast();

  const [savedLabelsList, setSavedLabelsList] = useState<SavedLabel[]>([]);
  const [selectedSavedLabelId, setSelectedSavedLabelId] = useState<string>(labelToEdit?.id || '');

  // Form Fields - 100% Fully Editable
  const [productName, setProductName] = useState('HP ProDesk 2 G1a Tower');
  const [categoryName, setCategoryName] = useState('Desktop Computer');
  const [brand, setBrand] = useState('HP');
  const [productNumber, setProductNumber] = useState('HP-PD-2G1A-TW');

  const [manufacturerName, setManufacturerName] = useState('Flextronics Technologies India Pvt. Ltd.');
  const [manufacturerAddress, setManufacturerAddress] = useState('Plot No. 1, Industrial Park, Sandur Road, Sriperumbudur, Tamil Nadu 602105');

  const [customerCareProfile, setCustomerCareProfile] = useState('HP India Customer Care');
  const [customerCareAddress, setCustomerCareAddress] = useState('Building 2, Think Campus, Electronic City Phase 1, Bangalore, Karnataka - 560100');
  const [customerCareEmail, setCustomerCareEmail] = useState('in.contact@hp.com');
  const [customerCarePhone, setCustomerCarePhone] = useState('1-800-425-4999');
  const [customerCareWhatsApp, setCustomerCareWhatsApp] = useState('+91-8867619377');
  const [customerCareWebsite, setCustomerCareWebsite] = useState('www.hp.com/in');

  const [warranty, setWarranty] = useState('5 Years');
  const [countryOfOrigin, setCountryOfOrigin] = useState('India');
  const [genericName, setGenericName] = useState('DESKTOP COMPUTER');
  const [netQuantity, setNetQuantity] = useState('1 N');
  const [mrp, setMrp] = useState<number | string>(114229);
  const [taxText, setTaxText] = useState('Incl. of all Taxes');
  const [packContents, setPackContents] = useState('Desktop Computer 1 N, Central Processing Unit 1 N, Cable Set 1 N, Keyboard 1 N, Mouse 1 N');

  const [month, setMonth] = useState('Jul');
  const [year, setYear] = useState('2026');
  const [copies, setCopies] = useState<number>(1);
  const [widthMm, setWidthMm] = useState<number>(100);
  const [heightMm, setHeightMm] = useState<number>(150);
  const [templateFields, setTemplateFields] = useState<LabelTemplate['fields']>([]);
  const [customFieldValues, setCustomFieldValues] = useState<Record<string, string>>({});

  const [activeTab, setActiveTab] = useState<'product' | 'mfg' | 'customercare' | 'contents'>('product');
  const [isSaving, setIsSaving] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);

  useEffect(() => {
    loadSavedLabels();
  }, []);

  useEffect(() => {
    if (labelToEdit) {
      loadLabelData(labelToEdit);
    }
  }, [labelToEdit]);

  const loadSavedLabels = async () => {
    try {
      const data = await labelsApi.getAll();
      setSavedLabelsList(data);
      if (!labelToEdit && data.length > 0) {
        setSelectedSavedLabelId(data[0].id);
        loadLabelData(data[0]);
      }
    } catch (e) {
      console.error('Error loading saved labels list', e);
    }
  };

  const loadLabelData = (lbl: SavedLabel) => {
    setSelectedSavedLabelId(lbl.id);
    const s = lbl.snapshot || {};
    setProductName(s.productName || lbl.product_name || '');
    setCategoryName(lbl.category_name || '');
    setBrand(s.brand || '');
    setProductNumber(s.productNumber || '');
    setManufacturerName(s.manufacturerName || '');
    setManufacturerAddress(s.manufacturerAddress || '');
    setCustomerCareProfile(s.customerCareProfile || '');
    setCustomerCareAddress(s.customerCareAddress || '');
    setCustomerCareEmail(s.customerCareEmail || '');
    setCustomerCarePhone(s.customerCarePhone || '');
    setCustomerCareWhatsApp(s.customerCareWhatsApp || '');
    setCustomerCareWebsite(s.customerCareWebsite || '');
    setWarranty(s.warranty || '5 Years');
    setCountryOfOrigin(s.countryOfOrigin || 'India');
    setGenericName(s.genericName || '');
    setNetQuantity(s.netQuantity || '1 N');
    setMrp(lbl.mrp || s.mrp || 0);
    setTaxText(s.taxText || 'Incl. of all Taxes');
    setPackContents(s.packContents || '');
    setMonth(lbl.month || s.month || 'Jul');
    setYear(lbl.year || s.year || '2026');
    setCopies(lbl.copies || 1);
    setWidthMm(s.width_mm || 100);
    setHeightMm(s.height_mm || 150);
    setTemplateFields(s.fields || []);
    setCustomFieldValues(
      Object.keys(s)
        .filter((key) => !BUILT_IN_TEMPLATE_KEYS.has(key) && !['width_mm', 'height_mm', 'fields'].includes(key))
        .reduce<Record<string, string>>((values, key) => {
          values[key] = String(s[key] ?? '');
          return values;
        }, {})
    );
  };

  const handleSelectExistingLabel = (labelId: string) => {
    const found = savedLabelsList.find((l) => l.id === labelId);
    if (found) {
      loadLabelData(found);
      toast.info(`Loaded data for "${found.product_name}"`);
    }
  };

  // Build live snapshot from all edited state fields
  const currentSnapshot: LabelSnapshot = {
    ...customFieldValues,
    productName,
    brand,
    productNumber,
    manufacturerName,
    manufacturerAddress,
    customerCareProfile,
    customerCareAddress,
    customerCareEmail,
    customerCarePhone,
    customerCareWhatsApp,
    customerCareWebsite,
    warranty,
    countryOfOrigin,
    genericName,
    netQuantity,
    mrp: Number(mrp) || 0,
    taxText,
    packContents,
    month,
    year,
    width_mm: Number(widthMm) || 100,
    height_mm: Number(heightMm) || 150,
    fields: templateFields,
  };

  const customTemplateFields = templateFields.filter((field) => !BUILT_IN_TEMPLATE_KEYS.has(field.key));

  const selectedPresetValue =
    LABEL_SIZE_PRESETS.find(
      (preset) =>
        preset.widthMm > 0 &&
        Math.abs(preset.widthMm - Number(widthMm)) < 0.1 &&
        Math.abs(preset.heightMm - Number(heightMm)) < 0.1
    )?.label || 'Custom Size';

  const handleLabelSizePresetChange = (presetLabel: string) => {
    const preset = LABEL_SIZE_PRESETS.find((item) => item.label === presetLabel);
    if (!preset || preset.label === 'Custom Size') return;
    setWidthMm(preset.widthMm);
    setHeightMm(preset.heightMm);
  };

  const handleSaveUpdatedLabel = async () => {
    if (!productName.trim()) {
      toast.error('Product Model Name is required.');
      return;
    }
    if (Number(mrp) < 0) {
      toast.error('MRP cannot be negative.');
      return;
    }

    const payload: Partial<SavedLabel> = {
      category_id: 'custom_edited',
      category_name: categoryName || 'Standard',
      product_id: 'custom_edited',
      product_name: productName,
      month,
      year,
      mrp: Number(mrp) || 0,
      copies: Number(copies) || 1,
      snapshot: currentSnapshot,
    };

    setIsSaving(true);
    try {
      await labelsApi.create(payload);
      toast.success('Customized label snapshot saved successfully!');
      loadSavedLabels();
    } catch (err: any) {
      toast.error('Failed to save customized label.');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Edit & Customize Label</h2>
            <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">
              All Fields 100% Editable
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Modify any text, address, compliance details, dimensions or contact parameters with real-time preview
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => setIsPreviewModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer"
          >
            <Eye className="w-4 h-4" />
            <span>Print Preview</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-sm transition cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print ({copies})</span>
          </button>
        </div>
      </div>

      {savedLabelsList.length > 0 && (
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 min-w-0">
            <FolderHeart className="w-4 h-4 text-blue-600 shrink-0" />
            <span className="text-xs font-bold text-slate-800 whitespace-nowrap">Load Saved Label:</span>
            <select
              value={selectedSavedLabelId}
              onChange={(e) => handleSelectExistingLabel(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
            >
              {savedLabelsList.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.product_name} ({l.month} {l.year}) - â‚¹{l.mrp}
                </option>
              ))}
            </select>
          </div>
          <span className="text-[11px] text-slate-400 hidden sm:inline">
            Directly edit loaded values or customize for one-off print
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 space-y-5">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3 overflow-x-auto">
              {[
                ['product', '1. Product & Pricing'],
                ['mfg', '2. Manufacturer Info'],
                ['customercare', '3. Customer Care & Warranty'],
                ['contents', '4. Pack Contents & Size'],
              ].map(([tab, label]) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab as typeof activeTab)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition whitespace-nowrap cursor-pointer ${
                    activeTab === tab
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {activeTab === 'product' && (
              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Product / Model Name <span className="text-rose-500">*</span>
                    </label>
                    <input type="text" value={productName} onChange={(e) => setProductName(e.target.value)} placeholder="e.g. HP ProDesk 2 G1a Tower" className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-hidden" />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">Generic Name</label>
                    <input type="text" value={genericName} onChange={(e) => setGenericName(e.target.value)} placeholder="DESKTOP COMPUTER" className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-hidden" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">Brand / Manufactured For</label>
                    <input type="text" value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="HP" className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-hidden" />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">Product / Part No.</label>
                    <input type="text" value={productNumber} onChange={(e) => setProductNumber(e.target.value)} placeholder="HP-PD-2G1A-TW" className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono text-slate-900 focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-hidden" />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">Category</label>
                    <input type="text" value={categoryName} onChange={(e) => setCategoryName(e.target.value)} placeholder="Desktop Computer" className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-hidden" />
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-100">
                  <div>
                    <label className="block font-semibold text-slate-600 text-[10px] uppercase mb-1">Month</label>
                    <select value={month} onChange={(e) => setMonth(e.target.value)} className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900">
                      {MONTHS.map((m) => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-600 text-[10px] uppercase mb-1">Year</label>
                    <select value={year} onChange={(e) => setYear(e.target.value)} className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900">
                      {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-600 text-[10px] uppercase mb-1">MRP (â‚¹) <span className="text-rose-500">*</span></label>
                    <input type="number" min="0" step="0.01" value={mrp} onChange={(e) => setMrp(e.target.value)} className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 font-mono" />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-600 text-[10px] uppercase mb-1">Print Copies</label>
                    <input type="number" min="1" value={copies} onChange={(e) => setCopies(Math.max(1, Number(e.target.value)))} className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 font-mono" />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">Tax Clarification Text</label>
                  <input type="text" value={taxText} onChange={(e) => setTaxText(e.target.value)} placeholder="Incl. of all Taxes" className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-hidden" />
                </div>

                {customTemplateFields.length > 0 && (
                  <div className="pt-3 border-t border-slate-100 space-y-3">
                    <h4 className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                      Custom Label Fields
                    </h4>
                    {customTemplateFields.map((field) => (
                      <div key={field.key}>
                        <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                          {field.label}
                        </label>
                        <input
                          type="text"
                          value={customFieldValues[field.key] ?? field.default_value ?? ''}
                          onChange={(e) =>
                            setCustomFieldValues({
                              ...customFieldValues,
                              [field.key]: e.target.value,
                            })
                          }
                          className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-hidden"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'mfg' && (
              <div className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">Manufacturer / Facility Name</label>
                  <input type="text" value={manufacturerName} onChange={(e) => setManufacturerName(e.target.value)} placeholder="Flextronics Technologies India Pvt. Ltd." className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-hidden" />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">Complete Factory / Plant Address</label>
                  <textarea rows={3} value={manufacturerAddress} onChange={(e) => setManufacturerAddress(e.target.value)} placeholder="Plot No. 1, Industrial Park, Sandur Road, Sriperumbudur, Tamil Nadu 602105" className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-hidden leading-relaxed" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">Country of Origin</label>
                    <input type="text" value={countryOfOrigin} onChange={(e) => setCountryOfOrigin(e.target.value)} placeholder="India" className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-hidden" />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">Net Quantity</label>
                    <input type="text" value={netQuantity} onChange={(e) => setNetQuantity(e.target.value)} placeholder="1 N" className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-hidden" />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'customercare' && (
              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">Customer Care Profile Name</label>
                    <input type="text" value={customerCareProfile} onChange={(e) => setCustomerCareProfile(e.target.value)} placeholder="HP India Customer Care" className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-hidden" />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">Warranty Coverage</label>
                    <input type="text" value={warranty} onChange={(e) => setWarranty(e.target.value)} placeholder="5 Years" className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-hidden" />
                  </div>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">Customer Complaint Address</label>
                  <textarea rows={2} value={customerCareAddress} onChange={(e) => setCustomerCareAddress(e.target.value)} placeholder="Building 2, Think Campus, Electronic City Phase 1, Bangalore, Karnataka - 560100" className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-hidden" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">Email Address</label>
                    <input type="text" value={customerCareEmail} onChange={(e) => setCustomerCareEmail(e.target.value)} placeholder="in.contact@hp.com" className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-hidden" />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">Telephone (Tel)</label>
                    <input type="text" value={customerCarePhone} onChange={(e) => setCustomerCarePhone(e.target.value)} placeholder="1-800-425-4999" className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-hidden" />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">WhatsApp Number</label>
                    <input type="text" value={customerCareWhatsApp} onChange={(e) => setCustomerCareWhatsApp(e.target.value)} placeholder="+91-8867619377" className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-hidden" />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">Website URL</label>
                    <input type="text" value={customerCareWebsite} onChange={(e) => setCustomerCareWebsite(e.target.value)} placeholder="www.hp.com/in" className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-hidden" />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'contents' && (
              <div className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">Pack Contents (Exact Listing)</label>
                  <textarea rows={3} value={packContents} onChange={(e) => setPackContents(e.target.value)} placeholder="Desktop Computer 1 N, CPU 1 N, Cable Set 1 N, Keyboard 1 N, Mouse 1 N" className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-hidden font-mono leading-relaxed" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <div className="sm:col-span-3">
                    <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">Label Size Preset</label>
                    <select
                      value={selectedPresetValue}
                      onChange={(e) => handleLabelSizePresetChange(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 font-semibold focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    >
                      {LABEL_SIZE_PRESETS.map((preset) => (
                        <option key={preset.label} value={preset.label}>
                          {preset.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">Label Width (mm)</label>
                    <input type="number" min="10" max="500" value={widthMm} onChange={(e) => setWidthMm(Number(e.target.value))} className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 font-mono font-bold" />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">Label Height (mm)</label>
                    <input type="number" min="10" max="500" value={heightMm} onChange={(e) => setHeightMm(Number(e.target.value))} className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 font-mono font-bold" />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">Current Size</label>
                    <div className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 font-mono font-bold">
                      {Number(widthMm).toFixed(1)} × {Number(heightMm).toFixed(1)} mm
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-slate-100">
              <button type="button" onClick={handleSaveUpdatedLabel} disabled={isSaving} className="flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-md shadow-blue-500/20 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50">
                {isSaving ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Saving Customized Label...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save Customized Label</span>
                  </>
                )}
              </button>
              <button type="button" onClick={() => setIsPreviewModalOpen(true)} className="py-3 px-4 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 font-semibold text-xs sm:text-sm rounded-xl transition flex items-center justify-center gap-2 cursor-pointer">
                <Eye className="w-4 h-4" />
                <span>Print Preview</span>
              </button>
              <button type="button" onClick={handlePrint} className="py-3 px-5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-md shadow-slate-900/20 transition flex items-center justify-center gap-2 cursor-pointer">
                <Printer className="w-4 h-4" />
                <span>Print ({copies})</span>
              </button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-100 p-4 rounded-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Live Customized Preview
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-slate-500 font-mono">
                  {widthMm}mm Ã— {heightMm}mm
                </span>
                <button type="button" onClick={() => setIsPreviewModalOpen(true)} className="p-1 text-slate-500 hover:text-blue-600 rounded-md hover:bg-slate-200 transition" title="Expand Fullscreen">
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <motion.div whileHover={{ scale: 1.01 }} transition={{ duration: 0.2 }} className="flex justify-center items-center py-2 overflow-x-auto">
              <div className="transform origin-top transition-transform">
                <PrintableLabel snapshot={currentSnapshot} copies={1} isPrintMode={false} />
              </div>
            </motion.div>

            <p className="text-center text-[10px] text-slate-400 mt-4">
              Direct physical feedback of your customized label edits.
            </p>
          </div>
        </div>
      </div>

      {isPreviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-xl w-full overflow-hidden max-h-[92vh] flex flex-col">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-blue-100 text-blue-700">
                  <Printer className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    {productName || 'Customized Print Layout'}
                  </h3>
                  <p className="text-[11px] text-slate-500 font-mono">
                    Print Layout ({widthMm}Ã—{heightMm} mm) â€¢ Copies: {copies}
                  </p>
                </div>
              </div>
              <button onClick={() => setIsPreviewModalOpen(false)} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 flex flex-col items-center justify-center bg-slate-100/80">
              <div className="shadow-2xl rounded-xs">
                <PrintableLabel snapshot={currentSnapshot} copies={1} isPrintMode={false} />
              </div>
              <p className="text-center text-[10px] text-slate-400 mt-4">
                This exact layout will be dispatched to the physical label printer.
              </p>
            </div>

            <div className="p-4 border-t border-slate-100 flex items-center justify-end gap-2 bg-white">
              <button onClick={() => setIsPreviewModalOpen(false)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl text-xs transition cursor-pointer">
                Close Preview
              </button>
              <button
                onClick={() => {
                  setIsPreviewModalOpen(false);
                  setTimeout(() => {
                    handlePrint();
                  }, 100);
                }}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-xs transition flex items-center gap-1.5 shadow-sm shadow-blue-500/20 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Now ({copies})</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <div id="printable-label-hidden-root" className="hidden">
        <PrintableLabel snapshot={currentSnapshot} copies={copies} isPrintMode={true} />
      </div>
    </div>
  );
};
