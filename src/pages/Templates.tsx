import React, { useState, useEffect } from 'react';
import {
  FileCode2,
  Plus,
  Edit2,
  Trash2,
  X,
  ArrowUp,
  ArrowDown,
  CheckSquare,
  Square,
  Sparkles,
  Sliders,
  Maximize2,
  Eye,
  Printer
} from 'lucide-react';
import { LabelTemplate, TemplateField, Category, LabelSnapshot } from '../types';
import { templatesApi, categoriesApi } from '../services/api';
import { useToast } from '../context/ToastContext';
import { DeleteModal } from '../components/common/DeleteModal';
import { PrintableLabel } from '../components/label/PrintableLabel';

const DEFAULT_TEMPLATE_FIELDS: TemplateField[] = [
  { key: 'manufactured_by', label: 'Manufactured By', enabled: true, font_size: 11, bold: true, alignment: 'left', order: 1 },
  { key: 'manufactured_for', label: 'Manufactured For', enabled: true, font_size: 11, bold: true, alignment: 'left', order: 2 },
  { key: 'for_complaints', label: 'For Complaints', enabled: true, font_size: 11, bold: true, alignment: 'left', order: 3 },
  { key: 'email', label: 'Email', enabled: true, font_size: 10, bold: false, alignment: 'left', order: 4 },
  { key: 'telephone', label: 'Tel', enabled: true, font_size: 10, bold: false, alignment: 'left', order: 5 },
  { key: 'whatsapp', label: 'WhatsApp', enabled: true, font_size: 10, bold: false, alignment: 'left', order: 6 },
  { key: 'month_year', label: 'Month & Year of Manufacture', enabled: true, font_size: 11, bold: true, alignment: 'left', order: 7 },
  { key: 'mrp', label: 'MRP (Incl. of all Taxes)', enabled: true, font_size: 13, bold: true, alignment: 'left', order: 8 },
  { key: 'product_number', label: 'Product No.', enabled: true, font_size: 11, bold: true, alignment: 'left', order: 9 },
  { key: 'country_of_origin', label: 'Country of Origin', enabled: true, font_size: 10, bold: false, alignment: 'left', order: 10 },
  { key: 'generic_name', label: 'Generic Name', enabled: true, font_size: 11, bold: true, alignment: 'left', order: 11 },
  { key: 'net_quantity', label: 'Net Qty', enabled: true, font_size: 10, bold: false, alignment: 'left', order: 12 },
  { key: 'pack_contents', label: 'Pack Contents', enabled: true, font_size: 10, bold: false, alignment: 'left', order: 13 }
];

const SAMPLE_SNAPSHOT_DATA: LabelSnapshot = {
  productName: 'HP ProDesk 2 G1a Tower',
  brand: 'HP',
  productNumber: 'HP-PD-2G1A-TW',
  manufacturerName: 'Flextronics Technologies India Pvt. Ltd.',
  manufacturerAddress: 'Plot No. 1, Industrial Park, Sandur Road, Sriperumbudur, Tamil Nadu 602105',
  customerCareProfile: 'HP India Customer Care',
  customerCareAddress: 'Building 2, Think Campus, Electronic City Phase 1, Bangalore, Karnataka - 560100',
  customerCareEmail: 'in.contact@hp.com',
  customerCarePhone: '1-800-425-4999',
  customerCareWhatsApp: '+91-8867619377',
  customerCareWebsite: 'www.hp.com/in',
  warranty: '5 Years',
  countryOfOrigin: 'India',
  genericName: 'DESKTOP COMPUTER',
  netQuantity: '1 N',
  mrp: 114229.0,
  taxText: 'Incl. of all Taxes',
  packContents: 'Desktop Computer 1 N, Central Processing Unit 1 N, Cable Set 1 N, Keyboard 1 N, Mouse 1 N',
  month: 'Jul',
  year: '2026',
};

const toFieldKey = (label: string) =>
  label
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '') || `custom_field_${Date.now()}`;

const DEFAULT_FIELD_KEYS = new Set(DEFAULT_TEMPLATE_FIELDS.map((field) => field.key));

export const Templates: React.FC = () => {
  const toast = useToast();
  const [templates, setTemplates] = useState<LabelTemplate[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<LabelTemplate | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Preview Modal State
  const [previewSnapshot, setPreviewSnapshot] = useState<LabelSnapshot | null>(null);
  const [previewTitle, setPreviewTitle] = useState<string>('');

  // Delete State
  const [deleteTarget, setDeleteTarget] = useState<LabelTemplate | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form Fields
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [widthMm, setWidthMm] = useState<number>(100);
  const [heightMm, setHeightMm] = useState<number>(150);
  const [fields, setFields] = useState<TemplateField[]>(DEFAULT_TEMPLATE_FIELDS);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [tpls, cats] = await Promise.all([
        templatesApi.getAll(),
        categoriesApi.getAll(),
      ]);
      setTemplates(tpls);
      setCategories(cats);
    } catch (err) {
      toast.error('Failed to load templates.');
    } finally {
      setIsLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingTemplate(null);
    setName('');
    setCategoryId('');
    setWidthMm(100);
    setHeightMm(150);
    setFields(DEFAULT_TEMPLATE_FIELDS.map((f, i) => ({ ...f, order: i + 1 })));
    setIsModalOpen(true);
  };

  const openEditModal = (tpl: LabelTemplate) => {
    setEditingTemplate(tpl);
    setName(tpl.name);
    setCategoryId(tpl.category_id || '');
    setWidthMm(tpl.width_mm || 100);
    setHeightMm(tpl.height_mm || 150);
    setFields(
      tpl.fields && tpl.fields.length > 0
        ? [...tpl.fields].sort((a, b) => a.order - b.order)
        : DEFAULT_TEMPLATE_FIELDS.map((f, i) => ({ ...f, order: i + 1 }))
    );
    setIsModalOpen(true);
  };

  const openCardPreview = (tpl: LabelTemplate) => {
    const customPreviewValues = (tpl.fields || [])
      .filter((field) => !DEFAULT_FIELD_KEYS.has(field.key))
      .reduce<Record<string, string>>((values, field) => {
        values[field.key] = field.default_value || `${field.label} Value`;
        return values;
      }, {});

    setPreviewTitle(tpl.name);
    setPreviewSnapshot({
      ...SAMPLE_SNAPSHOT_DATA,
      ...customPreviewValues,
      width_mm: tpl.width_mm || 100,
      height_mm: tpl.height_mm || 150,
      fields: tpl.fields || DEFAULT_TEMPLATE_FIELDS,
    });
  };

  const openCurrentEditorPreview = () => {
    const currentFields = fields.map((f, idx) => ({ ...f, order: idx + 1 }));
    const customPreviewValues = currentFields
      .filter((field) => !DEFAULT_FIELD_KEYS.has(field.key))
      .reduce<Record<string, string>>((values, field) => {
        values[field.key] = field.default_value || `${field.label} Value`;
        return values;
      }, {});

    setPreviewTitle(name || 'Template Preview');
    setPreviewSnapshot({
      ...SAMPLE_SNAPSHOT_DATA,
      ...customPreviewValues,
      width_mm: Number(widthMm) || 100,
      height_mm: Number(heightMm) || 150,
      fields: currentFields,
    });
  };

  const moveField = (index: number, direction: 'up' | 'down') => {
    const newFields = [...fields];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newFields.length) return;

    const temp = newFields[index];
    newFields[index] = newFields[targetIndex];
    newFields[targetIndex] = temp;

    // re-index order
    newFields.forEach((f, idx) => {
      f.order = idx + 1;
    });

    setFields(newFields);
  };

  const updateFieldProperty = (index: number, property: keyof TemplateField, value: any) => {
    const newFields = [...fields];
    newFields[index] = { ...newFields[index], [property]: value };
    setFields(newFields);
  };

  const addCustomField = () => {
    const nextNumber = fields.filter((field) => field.key.startsWith('custom_field')).length + 1;
    setFields([
      ...fields,
      {
        key: `custom_field_${nextNumber}`,
        label: `Custom Field ${nextNumber}`,
        enabled: true,
        font_size: 10,
        bold: false,
        alignment: 'left',
        default_value: '',
        order: fields.length + 1,
      },
    ]);
  };

  const removeField = (index: number) => {
    const newFields = fields.filter((_, fieldIndex) => fieldIndex !== index);
    setFields(newFields.map((field, idx) => ({ ...field, order: idx + 1 })));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Template Name is required.');
      return;
    }
    if (widthMm <= 0 || heightMm <= 0) {
      toast.error('Dimensions must be greater than 0.');
      return;
    }
    const normalizedFields = fields.map((field, idx) => ({
      ...field,
      key: toFieldKey(field.key || field.label),
      label: field.label.trim() || `Field ${idx + 1}`,
      order: idx + 1,
    }));
    const uniqueKeys = new Set(normalizedFields.map((field) => field.key));
    if (uniqueKeys.size !== normalizedFields.length) {
      toast.error('Field keys must be unique.');
      return;
    }

    const cat = categories.find((c) => c.id === categoryId);
    const payload: Partial<LabelTemplate> = {
      name: name.trim(),
      category_id: categoryId,
      category_name: cat ? cat.name : 'Universal / All Categories',
      width_mm: Number(widthMm),
      height_mm: Number(heightMm),
      fields: normalizedFields,
      is_default: editingTemplate ? editingTemplate.is_default : false,
    };

    setIsSaving(true);
    try {
      if (editingTemplate) {
        await templatesApi.update(editingTemplate.id, payload);
        toast.success(`Template "${name}" updated successfully.`);
      } else {
        await templatesApi.create(payload);
        toast.success(`Template "${name}" created successfully.`);
      }
      setIsModalOpen(false);
      loadData();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to save template.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await templatesApi.delete(deleteTarget.id);
      toast.success(`Template "${deleteTarget.name}" deleted.`);
      setDeleteTarget(null);
      loadData();
    } catch (err: any) {
      toast.error('Failed to delete template.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Label Templates</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure label dimensions (mm), enabled fields, typography sizing, and print block hierarchies
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold shadow-sm shadow-blue-500/20 transition cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Create Template</span>
        </button>
      </div>

      {/* Templates Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {isLoading ? (
          <div className="col-span-full py-12 text-center text-slate-400">
            <div className="flex items-center justify-center gap-2">
              <span className="w-5 h-5 border-2 border-blue-600/30 border-t-blue-600 rounded-full animate-spin" />
              <span>Loading label templates...</span>
            </div>
          </div>
        ) : templates.length === 0 ? (
          <div className="col-span-full bg-white p-12 rounded-2xl border border-slate-200 text-center text-slate-400">
            <FileCode2 className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="font-semibold text-slate-700 text-sm">No Templates Configured</p>
            <p className="text-xs text-slate-400 mt-1">Create your first custom compliance layout.</p>
            <button
              onClick={openCreateModal}
              className="mt-4 px-4 py-2 bg-blue-600 text-white font-semibold rounded-xl text-xs hover:bg-blue-700 transition"
            >
              + Create Template
            </button>
          </div>
        ) : (
          templates.map((tpl) => (
            <div
              key={tpl.id}
              className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition p-5 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 tracking-tight">{tpl.name}</h3>
                    <p className="text-xs text-blue-600 font-medium">{tpl.category_name || 'Universal'}</p>
                  </div>
                  {tpl.is_default && (
                    <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold">
                      DEFAULT
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-4 bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Physical Size</span>
                    <span className="font-bold text-slate-800">{tpl.width_mm} × {tpl.height_mm} mm</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Active Fields</span>
                    <span className="font-bold text-slate-800">
                      {tpl.fields ? tpl.fields.filter((f) => f.enabled).length : 0} of {tpl.fields?.length || 0}
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Field Preview Order</span>
                  <div className="flex flex-wrap gap-1">
                    {(tpl.fields || []).filter((f) => f.enabled).slice(0, 5).map((f) => (
                      <span
                        key={f.key}
                        className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[10px] font-medium truncate max-w-[120px]"
                      >
                        {f.label}
                      </span>
                    ))}
                    {(tpl.fields || []).filter((f) => f.enabled).length > 5 && (
                      <span className="px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded text-[10px]">
                        +{(tpl.fields || []).filter((f) => f.enabled).length - 5} more
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 mt-4 border-t border-slate-100">
                <button
                  onClick={() => openCardPreview(tpl)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-semibold transition cursor-pointer"
                  title="See Print Preview"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Preview</span>
                </button>
                <button
                  onClick={() => openEditModal(tpl)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Configure</span>
                </button>
                {!tpl.is_default && (
                  <button
                    onClick={() => setDeleteTarget(tpl)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                    title="Delete Template"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Configure / Edit Template Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-3xl w-full overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {editingTemplate ? 'Configure Label Template' : 'Create New Label Template'}
                </h3>
                <p className="text-xs text-slate-400">Order fields, customize labels, and set physical sticker size</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={openCurrentEditorPreview}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold rounded-xl text-xs border border-blue-200 transition cursor-pointer shadow-xs"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Preview Print Sticker</span>
                </button>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-5 overflow-y-auto flex-1 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Template Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Standard Compliance Label (100x150mm)"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Associated Category
                  </label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-hidden"
                  >
                    <option value="">Universal / All Categories</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <div>
                  <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Label Width (mm) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="10"
                    max="500"
                    required
                    value={widthMm}
                    onChange={(e) => setWidthMm(Number(e.target.value))}
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 font-mono font-bold focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Label Height (mm) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="10"
                    max="500"
                    required
                    value={heightMm}
                    onChange={(e) => setHeightMm(Number(e.target.value))}
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 font-mono font-bold focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Field Layout Configuration Table */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
                    Label Fields & Layout Order
                  </h4>
                  <button
                    type="button"
                    onClick={addCustomField}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-semibold transition cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Field</span>
                  </button>
                </div>

                <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
                  {fields.map((f, idx) => (
                    <div
                      key={f.key}
                      className={`p-3 flex items-center justify-between gap-3 transition ${
                        f.enabled ? 'bg-white' : 'bg-slate-50/70 opacity-60'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <button
                          type="button"
                          onClick={() => updateFieldProperty(idx, 'enabled', !f.enabled)}
                          className="text-blue-600 hover:text-blue-800 transition cursor-pointer"
                        >
                          {f.enabled ? (
                            <CheckSquare className="w-5 h-5" />
                          ) : (
                            <Square className="w-5 h-5 text-slate-400" />
                          )}
                        </button>
                        <div className="min-w-0">
                          <input
                            type="text"
                            value={f.label}
                            onChange={(e) => updateFieldProperty(idx, 'label', e.target.value)}
                            className="font-semibold text-slate-800 text-xs bg-transparent border-b border-transparent hover:border-slate-300 focus:border-blue-500 focus:bg-white px-1 py-0.5 rounded focus:outline-hidden"
                          />
                          {DEFAULT_FIELD_KEYS.has(f.key) ? (
                            <span className="text-[10px] text-slate-400 block font-mono pl-1">
                              key: {f.key}
                            </span>
                          ) : (
                            <div className="space-y-1 mt-1">
                              <input
                                type="text"
                                value={f.key}
                                onChange={(e) => updateFieldProperty(idx, 'key', toFieldKey(e.target.value))}
                                className="text-[10px] text-slate-500 block font-mono bg-slate-50 border border-slate-200 rounded px-1 py-0.5 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                                aria-label="Custom field key"
                              />
                              <input
                                type="text"
                                value={f.default_value || ''}
                                onChange={(e) => updateFieldProperty(idx, 'default_value', e.target.value)}
                                placeholder="Default value"
                                className="text-[11px] text-slate-700 block bg-white border border-slate-200 rounded px-2 py-1 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                                aria-label="Custom field default value"
                              />
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <div className="flex items-center gap-1.5">
                          <label className="text-[10px] text-slate-500 font-semibold">Size:</label>
                          <select
                            value={f.font_size}
                            onChange={(e) => updateFieldProperty(idx, 'font_size', Number(e.target.value))}
                            className="px-2 py-1 bg-slate-50 border border-slate-200 rounded text-xs text-slate-700"
                          >
                            <option value={9}>9 pt</option>
                            <option value={10}>10 pt</option>
                            <option value={11}>11 pt</option>
                            <option value={12}>12 pt</option>
                            <option value={13}>13 pt</option>
                            <option value={14}>14 pt</option>
                          </select>
                        </div>

                        <label className="flex items-center gap-1 text-[11px] font-semibold text-slate-700 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={f.bold}
                            onChange={(e) => updateFieldProperty(idx, 'bold', e.target.checked)}
                            className="rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                          />
                          <span>Bold</span>
                        </label>

                        <div className="flex items-center gap-1 pl-2 border-l border-slate-200">
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() => moveField(idx, 'up')}
                            className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded disabled:opacity-30 cursor-pointer"
                            title="Move Up"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            disabled={idx === fields.length - 1}
                            onClick={() => moveField(idx, 'down')}
                            className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded disabled:opacity-30 cursor-pointer"
                            title="Move Down"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                          {!DEFAULT_FIELD_KEYS.has(f.key) && (
                            <button
                              type="button"
                              onClick={() => removeField(idx)}
                              className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded cursor-pointer"
                              title="Remove Field"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={openCurrentEditorPreview}
                  className="px-4 py-2 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Eye className="w-4 h-4" />
                  <span>Preview Label Sticker</span>
                </button>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-5 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition shadow-sm shadow-blue-500/20 flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isSaving ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <span>Save Template</span>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Live Sticker Print Preview Modal */}
      {previewSnapshot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-xl w-full overflow-hidden max-h-[92vh] flex flex-col">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-blue-100 text-blue-700">
                  <Printer className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{previewTitle}</h3>
                  <p className="text-[11px] text-slate-500 font-mono">
                    Print Representation ({previewSnapshot.width_mm}×{previewSnapshot.height_mm} mm)
                  </p>
                </div>
              </div>
              <button
                onClick={() => setPreviewSnapshot(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 flex flex-col items-center justify-center bg-slate-100/80">
              <div className="shadow-2xl rounded-xs">
                <PrintableLabel
                  snapshot={previewSnapshot}
                  copies={1}
                  isPrintMode={false}
                />
              </div>
              <p className="text-center text-[10px] text-slate-400 mt-4">
                Exact physical 1:1 proportion preview with Legal Metrology compliance layout.
              </p>
            </div>

            <div className="p-4 border-t border-slate-100 flex items-center justify-end gap-2 bg-white">
              <button
                onClick={() => setPreviewSnapshot(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl text-xs transition cursor-pointer"
              >
                Close Preview
              </button>
              <button
                onClick={() => {
                  window.print();
                }}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl text-xs transition flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Test Print</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      <DeleteModal
        isOpen={!!deleteTarget}
        title="Delete Template"
        itemName={deleteTarget?.name}
        isDeleting={isDeleting}
        onConfirm={handleDeleteConfirm}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
};
