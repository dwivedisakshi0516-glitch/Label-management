import React, { useState } from 'react';
import { Category, ProductModel } from '../../types';
import { INITIAL_CATEGORIES, INITIAL_MODELS } from '../../data/mockData';
import { useAuth } from '../../context/AuthContext';
import {
  Network,
  Cpu,
  Plus,
  CheckCircle2,
  AlertCircle,
  Eye,
  Edit2,
  Trash2,
  X,
  Shield,
  Search,
  Check,
  Package,
  Layers,
  ChevronRight
} from 'lucide-react';

interface CustomFieldItem {
  id: string;
  label: string;
  value: string;
}

export const MasterTaxonomyView: React.FC = () => {
  const { currentUser } = useAuth();

  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [models, setModels] = useState<ProductModel[]>(INITIAL_MODELS);
  // Initially null: policy and products are HIDDEN until a category is explicitly selected
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [selectedModelForDrawer, setSelectedModelForDrawer] = useState<ProductModel | null>(null);
  const [searchModel, setSearchModel] = useState('');
  const [feedbackStatus, setFeedbackStatus] = useState<string | null>(null);

  // Modals state
  const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isProductsModalListOpen, setIsProductsModalListOpen] = useState(false);
  const [editingModelId, setEditingModelId] = useState<string | null>(null);

  // New Category State
  const [newCatName, setNewCatName] = useState('');
  const [newCatCode, setNewCatCode] = useState('');
  const [newCatHsn, setNewCatHsn] = useState('8471');
  const [newCatStandard, setNewCatStandard] = useState('IS 13252 Part 1');

  // Product Master State (All Fields Fully Editable by Admin)
  const [targetCatCode, setTargetCatCode] = useState<string>(INITIAL_CATEGORIES[0].code);
  const [modelName, setModelName] = useState('');
  const [modelSku, setModelSku] = useState('');
  const [modelWarranty, setModelWarranty] = useState('5 Years');
  const [modelMrp, setModelMrp] = useState('114,229.00');
  const [modelGenericName, setModelGenericName] = useState('DESKTOP COMPUTER');
  const [modelPackContents, setModelPackContents] = useState(
    'Desktop Computer 1N, CPU 1N, Cable Set 1N, Keyboard 1N, Mouse 1N'
  );
  const [modelCountry, setModelCountry] = useState('India');
  const [mfgBy, setMfgBy] = useState('Flextronics Technologies India Pvt. Ltd.');
  const [mfgByAddr, setMfgByAddr] = useState(
    'Plot No. 3, Industrial Corridor, Sriperumbudur, Tamil Nadu - 602105'
  );
  const [mfgFor, setMfgFor] = useState('HP India Sales Private Limited');
  const [mfgForAddr, setMfgForAddr] = useState(
    '24, Salarpuria Arena, Hosur Main Road, Adugodi, Bangalore - 560030'
  );
  const [complaintAddr, setComplaintAddr] = useState(
    'Customer Care Executive, HP India Sales Private Limited, at above address'
  );
  const [modelEmail, setModelEmail] = useState('in.contact@hp.com');
  const [modelTollFree, setModelTollFree] = useState('1-800-258-7170');
  const [modelWhatsapp, setModelWhatsapp] = useState('+91 22 6101 4560');
  const [modelWebsite, setModelWebsite] = useState('www.hp.com/in');

  // Dynamic Custom Fields list (+ icon to add custom fields and labels title)
  const [customFields, setCustomFields] = useState<CustomFieldItem[]>([]);

  // Selected category object (null if none selected)
  const selectedCategory = categories.find((c) => c.id === selectedCategoryId) || null;

  // Products filtered for the selected category (empty if no category selected)
  const filteredModels = selectedCategory
    ? models.filter((m) => {
        const matchesCategory = m.categoryCode === selectedCategory.code;
        if (!searchModel) return matchesCategory;
        const q = searchModel.toLowerCase();
        return (
          matchesCategory &&
          (m.name.toLowerCase().includes(q) ||
            m.sku.toLowerCase().includes(q) ||
            (m.manufacturedBy && m.manufacturedBy.toLowerCase().includes(q)) ||
            (m.genericName && m.genericName.toLowerCase().includes(q)))
        );
      })
    : [];

  const showToast = (msg: string) => {
    setFeedbackStatus(msg);
    setTimeout(() => setFeedbackStatus(null), 4000);
  };

  // Open Product Modal in Create Mode
  const openAddProductModal = (categoryCode?: string) => {
    setEditingModelId(null);
    setTargetCatCode(categoryCode || selectedCategory?.code || categories[0]?.code || 'CAT-DSK-01');
    setModelName('');
    setModelSku('');
    setModelWarranty('5 Years');
    setModelMrp('114,229.00');
    setModelGenericName('DESKTOP COMPUTER');
    setModelPackContents('Desktop Computer 1N, CPU 1N, Cable Set 1N, Keyboard 1N, Mouse 1N');
    setModelCountry('India');
    setMfgBy('Flextronics Technologies India Pvt. Ltd.');
    setMfgByAddr('Plot No. 3, Industrial Corridor, Sriperumbudur, Tamil Nadu - 602105');
    setMfgFor('HP India Sales Private Limited');
    setMfgForAddr('24, Salarpuria Arena, Hosur Main Road, Adugodi, Bangalore - 560030');
    setComplaintAddr('Customer Care Executive, HP India Sales Private Limited, at above address');
    setModelEmail('in.contact@hp.com');
    setModelTollFree('1-800-258-7170');
    setModelWhatsapp('+91 22 6101 4560');
    setModelWebsite('www.hp.com/in');
    setCustomFields([]);
    setIsProductModalOpen(true);
  };

  // Open Product Modal in Edit Mode
  const openEditProductModal = (m: ProductModel) => {
    setEditingModelId(m.id);
    setTargetCatCode(m.categoryCode);
    setModelName(m.name);
    setModelSku(m.sku);
    setModelWarranty(m.warranty || '5 Years');
    setModelMrp(m.defaultMrp || m.mrp || '114,229.00');
    setModelGenericName(m.genericName || 'DESKTOP COMPUTER');
    setModelPackContents(m.packContents || '');
    setModelCountry(m.countryOfOrigin || 'India');
    setMfgBy(m.manufacturedBy || m.plant || '');
    setMfgByAddr(m.manufacturedByAddress || '');
    setMfgFor(m.manufacturedFor || m.brand || '');
    setMfgForAddr(m.manufacturedForAddress || '');
    setComplaintAddr(m.complaintAddress || '');
    setModelEmail(m.email || '');
    setModelTollFree(m.tollFree || '');
    setModelWhatsapp(m.whatsapp || '');
    setModelWebsite(m.website || '');
    setCustomFields(m.customFields || []);
    setIsProductModalOpen(true);
  };

  // Delete product handler
  const handleDeleteProduct = (modelId: string, modelName: string) => {
    if (window.confirm(`Are you sure you want to delete "${modelName}"?`)) {
      const targetModel = models.find((m) => m.id === modelId);
      setModels((prev) => prev.filter((m) => m.id !== modelId));
      if (targetModel) {
        setCategories((prev) =>
          prev.map((c) =>
            c.code === targetModel.categoryCode
              ? { ...c, modelsCount: Math.max(0, c.modelsCount - 1) }
              : c
          )
        );
      }
      showToast(`Product "${modelName}" deleted successfully.`);
    }
  };

  // Add custom field row
  const handleAddCustomField = () => {
    const newField: CustomFieldItem = {
      id: `custom-${Date.now()}`,
      label: '',
      value: ''
    };
    setCustomFields([...customFields, newField]);
  };

  // Update custom field
  const handleUpdateCustomField = (id: string, key: 'label' | 'value', val: string) => {
    setCustomFields((prev) =>
      prev.map((f) => (f.id === id ? { ...f, [key]: val } : f))
    );
  };

  // Remove custom field
  const handleRemoveCustomField = (id: string) => {
    setCustomFields((prev) => prev.filter((f) => f.id !== id));
  };

  // Save Category
  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName) return;

    const code =
      newCatCode ||
      `CAT-${newCatName.substring(0, 3).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;
    const newCat: Category = {
      id: `cat-${Date.now()}`,
      code,
      name: newCatName,
      modelsCount: 0,
      active: true,
      hsn: newCatHsn || '8471',
      targetStandard: newCatStandard || 'IS 13252 Part 1',
      serialRule: 'OPTIONAL PLAIN TEXT',
      eWasteRule: 'PWM-2022 Mandate'
    };

    setCategories([...categories, newCat]);
    setSelectedCategoryId(newCat.id);
    setIsAddCategoryModalOpen(false);
    setNewCatName('');
    setNewCatCode('');
    showToast(`Category "${newCat.name}" created successfully.`);
  };

  // Save or Update Product
  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modelName || !modelSku) return;

    const matchedCat = categories.find((c) => c.code === targetCatCode) || categories[0];

    const validCustomFields = customFields.filter(
      (f) => f.label.trim() !== '' || f.value.trim() !== ''
    );

    if (editingModelId) {
      setModels((prev) =>
        prev.map((m) => {
          if (m.id === editingModelId) {
            return {
              ...m,
              sku: modelSku,
              name: modelName,
              categoryCode: matchedCat.code,
              categoryName: matchedCat.name,
              plant: mfgBy,
              brand: mfgFor,
              supportContact: modelTollFree,
              warranty: modelWarranty,
              mrp: modelMrp,
              defaultMrp: modelMrp,
              manufacturedBy: mfgBy,
              manufacturedByAddress: mfgByAddr,
              manufacturedFor: mfgFor,
              manufacturedForAddress: mfgForAddr,
              complaintAddress: complaintAddr,
              email: modelEmail,
              tollFree: modelTollFree,
              whatsapp: modelWhatsapp,
              countryOfOrigin: modelCountry,
              genericName: modelGenericName,
              packContents: modelPackContents,
              productNo: modelSku,
              website: modelWebsite,
              customFields: validCustomFields
            };
          }
          return m;
        })
      );
      showToast(`Product "${modelName}" updated successfully.`);
    } else {
      const newM: ProductModel = {
        id: `mod-${Date.now()}`,
        sku: modelSku,
        name: modelName,
        categoryCode: matchedCat.code,
        categoryName: matchedCat.name,
        plant: mfgBy,
        plantCode: 'PLT-IN-TN',
        brand: mfgFor,
        supportContact: modelTollFree,
        warranty: modelWarranty,
        defaultTemplate: 'Desktop Computer Standard Label',
        status: 'ACTIVE',
        mrp: modelMrp,
        mfgMonthYear: 'Jul 2026',
        powerRating: '180W Active PFC',
        weightNetGross: '6.4 kg / 8.1 kg',
        bisCode: 'R-4100123',
        beeRating: 'Grade 5',
        rohsCompliant: true,
        staticSerialLock: '',
        manufacturedBy: mfgBy,
        manufacturedByAddress: mfgByAddr,
        manufacturedFor: mfgFor,
        manufacturedForAddress: mfgForAddr,
        complaintAddress: complaintAddr,
        email: modelEmail,
        tollFree: modelTollFree,
        whatsapp: modelWhatsapp,
        countryOfOrigin: modelCountry,
        genericName: modelGenericName,
        packContents: modelPackContents,
        productNo: modelSku,
        defaultMrp: modelMrp,
        website: modelWebsite,
        customFields: validCustomFields
      };

      setModels([newM, ...models]);
      setCategories((prev) =>
        prev.map((c) => (c.code === matchedCat.code ? { ...c, modelsCount: c.modelsCount + 1 } : c))
      );
      showToast(`Product "${newM.name}" saved! Operator screen will auto-populate these details.`);
    }

    setIsProductModalOpen(false);
  };

  // Reusable Product Card Renderer matching the exact listing layout in the screenshot
  const renderProductCard = (m: ProductModel, isDetailModal = false) => (
    <div
      key={m.id}
      className="bg-[#060e1f] rounded-xl p-4 border border-[#424754]/40 hover:border-[#0284c7]/60 transition-all flex flex-col gap-3 shadow-md"
    >
      {/* Top Row: Title, SKU, MRP, and Right Corner Actions (View, Edit, Delete) */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-mono font-bold text-[#4cd7f6] bg-[#4cd7f6]/10 px-2 py-0.5 rounded border border-[#4cd7f6]/30">
              {m.sku}
            </span>
            <span className="text-xs font-mono text-[#adc6ff] bg-[#adc6ff]/10 px-2 py-0.5 rounded">
              {m.genericName || 'DESKTOP COMPUTER'}
            </span>
            <span className="text-xs font-mono font-bold text-[#4edea3] bg-[#00a572]/15 px-2 py-0.5 rounded">
              ₹ {m.defaultMrp || m.mrp}
            </span>
          </div>
          <h3 className="text-base font-bold text-white mt-1 font-sans">{m.name}</h3>
        </div>

        {/* Right Corner: View Icon, Edit Icon, Delete Icon */}
        <div className="flex items-center gap-1.5 shrink-0">
          {!isDetailModal && (
            <button
              type="button"
              onClick={() => setSelectedModelForDrawer(m)}
              className="p-1.5 bg-[#171f32] hover:bg-[#222a3d] text-slate-300 hover:text-white rounded-lg border border-[#424754]/50 transition-colors cursor-pointer"
              title="View Full Product Details"
              aria-label="View Product Details"
            >
              <Eye className="w-4 h-4 text-[#38bdf8]" />
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              if (isDetailModal) setSelectedModelForDrawer(null);
              openEditProductModal(m);
            }}
            className="p-1.5 bg-[#171f32] hover:bg-[#222a3d] text-slate-300 hover:text-white rounded-lg border border-[#424754]/50 transition-colors cursor-pointer"
            title="Edit All Product Fields"
            aria-label="Edit Product Fields"
          >
            <Edit2 className="w-4 h-4 text-[#f59e0b]" />
          </button>

          {!isDetailModal && (
            <button
              type="button"
              onClick={() => handleDeleteProduct(m.id, m.name)}
              className="p-1.5 bg-[#171f32] hover:bg-red-950/60 text-slate-300 hover:text-red-400 rounded-lg border border-[#424754]/50 hover:border-red-500/50 transition-colors cursor-pointer"
              title="Delete Product Record"
              aria-label="Delete Product"
            >
              <Trash2 className="w-4 h-4 text-red-400" />
            </button>
          )}
        </div>
      </div>

      {/* Middle Row: Detailed Master Specifications Grid (3 Columns) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 text-xs font-mono bg-[#131b2d]/60 p-3 rounded-lg border border-[#424754]/25">
        <div>
          <span className="text-[10px] text-slate-400 block uppercase font-bold">MANUFACTURED BY:</span>
          <span className="text-slate-200 truncate block mt-0.5 font-medium">{m.manufacturedBy || m.plant}</span>
          <span className={`text-[10px] text-slate-400 block ${isDetailModal ? 'mt-0.5' : 'truncate'}`}>
            {m.manufacturedByAddress}
          </span>
        </div>

        <div>
          <span className="text-[10px] text-slate-400 block uppercase font-bold">MANUFACTURED FOR:</span>
          <span className="text-slate-200 truncate block mt-0.5 font-medium">{m.manufacturedFor || m.brand}</span>
          <span className={`text-[10px] text-slate-400 block ${isDetailModal ? 'mt-0.5' : 'truncate'}`}>
            {m.manufacturedForAddress}
          </span>
        </div>

        <div>
          <span className="text-[10px] text-slate-400 block uppercase font-bold">WARRANTY & ORIGIN:</span>
          <span className="text-slate-200 block mt-0.5 font-semibold">
            {m.warranty || '5 Years'} • Origin: {m.countryOfOrigin || 'India'}
          </span>
          <span className={`text-[10px] text-slate-400 block ${isDetailModal ? 'mt-0.5' : 'truncate'}`}>
            Complaints: {m.tollFree || m.email || '1-800-258-7170'}
          </span>
        </div>
      </div>

      {/* Bottom Row: Contents & Custom Fields Chips */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
        <div className="flex items-center gap-1 text-[11px] font-mono text-slate-400 truncate max-w-xl">
          <Package className="w-3.5 h-3.5 text-[#4edea3] shrink-0" />
          <span className="font-semibold text-slate-300">Contents:</span>
          <span className={isDetailModal ? 'text-slate-200' : 'truncate'}>
            {m.packContents || 'Desktop Computer 1N, Cable Set 1N'}
          </span>
        </div>

        {/* Custom Fields Badges */}
        {m.customFields && m.customFields.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap">
            {m.customFields.map((cf) => (
              <span
                key={cf.id}
                className="text-[10px] font-mono bg-[#0284c7]/15 border border-[#0284c7]/40 text-[#38bdf8] px-2 py-0.5 rounded-full"
              >
                <strong>{cf.label}:</strong> {cf.value}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Extended Grievance Redressal info when in View Details Modal */}
      {isDetailModal && (
        <div className="pt-2 border-t border-[#424754]/30 text-xs font-mono bg-[#131b2d]/50 p-3 rounded-lg flex flex-col gap-2">
          <span className="text-[10px] text-[#f59e0b] uppercase font-bold tracking-wider">
            CUSTOMER GRIEVANCE REDRESSAL & CONTACTS:
          </span>
          <p className="text-slate-300 text-[11px] leading-relaxed">{m.complaintAddress}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 pt-1 border-t border-[#424754]/20 text-[11px]">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase">Email:</span>
              <span className="text-white font-semibold">{m.email || 'N/A'}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase">Toll Free:</span>
              <span className="text-white font-semibold">{m.tollFree || 'N/A'}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase">WhatsApp:</span>
              <span className="text-white font-semibold">{m.whatsapp || 'N/A'}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase">Website:</span>
              <span className="text-white font-semibold">{m.website || 'N/A'}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="flex flex-col w-full gap-6 pb-12 font-sans">
      {/* Feedback Toast */}
      {feedbackStatus && (
        <div className="fixed top-20 right-6 z-50 max-w-lg bg-[#131b2d] border border-[#4edea3] text-[#dbe2fb] text-xs p-4 rounded-xl shadow-2xl flex items-start gap-3 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-[#4edea3] shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-white block mb-1">MASTER DATA SYNCHRONIZATION</span>
            <p className="text-[#c2c6d6]/80 text-[11px] font-mono leading-relaxed">{feedbackStatus}</p>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAXONOMY HEADER: SIMPLE ADD CATEGORY & ADD PRODUCT AT RIGHT */}
      {/* ========================================================= */}
      <section className="bg-[#131b2d] rounded-xl p-5 shadow-xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border border-[#424754]/30">
        <div>
          <div className="flex items-center gap-2 font-mono text-xs text-[#adc6ff] uppercase tracking-wider font-semibold">
            <span>ADMIN CONSOLE</span>
            <span className="text-[#424754]">/</span>
            <span>MASTER DATA MANAGEMENT</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight mt-1">
            CATEGORIES & PRODUCT MASTER DATA
          </h1>
          <p className="text-xs text-[#c2c6d6]/70 mt-0.5">
            Configure product master specifications, statutory labeling declarations, and custom regulatory fields.
          </p>
        </div>

        {/* Right Corner: Simple Add Category and Add Product Buttons (No double + signs!) */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setIsAddCategoryModalOpen(true)}
            type="button"
            className="h-9 px-4 bg-[#171f32] hover:bg-[#222a3d] border border-[#424754]/50 text-white text-xs font-semibold rounded-lg flex items-center gap-2 transition-all cursor-pointer shadow-sm"
          >
            <Plus className="w-4 h-4 text-[#4cd7f6]" />
            <span>Add Category</span>
          </button>

          <button
            onClick={() => openAddProductModal()}
            type="button"
            className="h-9 px-4 bg-[#0284c7] hover:bg-[#0369a1] active:scale-95 text-white text-xs font-semibold rounded-lg flex items-center gap-2 transition-all shadow-md cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Product</span>
          </button>
        </div>
      </section>

      {/* ========================================================= */}
      {/* TWO-COLUMN LAYOUT: CATEGORIES & PRODUCT LIST              */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: CATEGORIES (4 COLS) */}
        <div className="xl:col-span-4 flex flex-col gap-4">
          <div className="bg-[#131b2d] p-4 rounded-xl border border-[#424754]/30 shadow-lg flex flex-col gap-3">
            <div className="flex items-center justify-between border-b border-[#424754]/30 pb-2.5">
              <div className="flex items-center gap-2">
                <Network className="w-4 h-4 text-[#4cd7f6]" />
                <h2 className="text-xs font-mono uppercase font-bold text-white tracking-wider">
                  CATEGORIES ({categories.length})
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsAddCategoryModalOpen(true)}
                className="text-[11px] font-mono text-[#4cd7f6] hover:underline flex items-center gap-1 cursor-pointer font-semibold"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Category</span>
              </button>
            </div>

            <div className="space-y-1.5 max-h-[520px] overflow-y-auto pr-1">
              {categories.map((cat) => {
                const isSelected = selectedCategory?.id === cat.id;
                return (
                  <div
                    key={cat.id}
                    className={`w-full p-2.5 rounded-lg border text-left font-mono transition-all flex items-center justify-between gap-2 cursor-pointer ${
                      isSelected
                        ? 'bg-[#0284c7]/20 border-[#0284c7] text-white font-semibold shadow-sm'
                        : 'bg-[#171f32] border-[#424754]/20 text-[#c2c6d6] hover:bg-[#222a3d]'
                    }`}
                    onClick={() => setSelectedCategoryId(cat.id)}
                  >
                    <div className="flex flex-col min-w-0 pr-1 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-[#4cd7f6]">{cat.code}</span>
                        <span className="text-xs font-sans text-white truncate">{cat.name}</span>
                      </div>
                      <span className="text-[10px] text-[#c2c6d6]/60 mt-0.5">
                        HSN {cat.hsn} • {cat.targetStandard}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-xs font-bold text-[#adc6ff] bg-[#060e1f] px-2 py-0.5 rounded">
                        {cat.modelsCount}
                      </span>

                      {/* Quick Icon to view products in modal list directly */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedCategoryId(cat.id);
                          setIsProductsModalListOpen(true);
                        }}
                        className="p-1 rounded bg-[#060e1f] hover:bg-[#38bdf8]/20 text-[#38bdf8] border border-[#38bdf8]/30 transition-colors"
                        title="View Products in Modal List"
                        aria-label="View in Modal List"
                      >
                        <Layers className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ===================================================== */}
          {/* ONLY SHOWN WHEN CATEGORY IS SELECTED: POLICY CARD     */}
          {/* (HIDDEN UNLESS A CATEGORY IS EXPLICITLY SELECTED)     */}
          {/* ===================================================== */}
          {selectedCategory && (
            <div className="bg-[#131b2d] p-4 rounded-xl border border-[#424754]/30 shadow-lg flex flex-col gap-3 animate-in fade-in">
              <div className="flex items-center justify-between border-b border-[#424754]/30 pb-2">
                <h3 className="text-xs font-mono uppercase font-bold text-white tracking-wider flex items-center gap-2">
                  <Shield className="w-4 h-4 text-[#4edea3]" />
                  SELECTED CATEGORY POLICY
                </h3>
                <button
                  type="button"
                  onClick={() => setSelectedCategoryId(null)}
                  className="p-1 text-slate-400 hover:text-white rounded hover:bg-[#222a3d] cursor-pointer"
                  title="Hide Policy & Unselect"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-2 text-xs font-mono">
                <div className="bg-[#060e1f] p-2 rounded border border-[#424754]/30 flex justify-between">
                  <span className="text-[#c2c6d6]/70">CATEGORY:</span>
                  <strong className="text-white">{selectedCategory.name}</strong>
                </div>
                <div className="bg-[#060e1f] p-2 rounded border border-[#424754]/30 flex justify-between">
                  <span className="text-[#c2c6d6]/70">STANDARD:</span>
                  <strong className="text-[#4edea3]">{selectedCategory.targetStandard}</strong>
                </div>
                <div className="bg-[#060e1f] p-2 rounded border border-[#424754]/30 flex justify-between">
                  <span className="text-[#c2c6d6]/70">HSN CODE:</span>
                  <strong className="text-[#adc6ff]">{selectedCategory.hsn}</strong>
                </div>
                <div className="bg-[#060e1f] p-2 rounded border border-[#424754]/30 flex justify-between">
                  <span className="text-[#c2c6d6]/70">SERIAL RULE:</span>
                  <strong className="text-[#4cd7f6]">{selectedCategory.serialRule}</strong>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ======================================================= */}
        {/* RIGHT COLUMN: PRODUCTS UNDER CATEGORY                   */}
        {/* (HIDDEN UNLESS A CATEGORY IS EXPLICITLY SELECTED)       */}
        {/* ======================================================= */}
        <div className="xl:col-span-8 flex flex-col gap-4">
          {selectedCategory ? (
            <div className="bg-[#131b2d] p-5 rounded-xl border border-[#424754]/30 shadow-lg flex flex-col gap-4 animate-in fade-in">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[#424754]/30 pb-3">
                <div>
                  <h2 className="text-sm font-bold text-white uppercase font-mono tracking-wider flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-[#4cd7f6]" />
                    PRODUCTS UNDER "{selectedCategory.name}" ({filteredModels.length})
                  </h2>
                  <span className="text-[10px] font-mono text-[#c2c6d6]/70">
                    Category: {selectedCategory.code} • Standard: {selectedCategory.targetStandard}
                  </span>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  {/* Search input: always visible in the side panel for quick lookup */}
                  <div className="relative flex-1 sm:w-56">
                    <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#c2c6d6]/60" />
                    <input
                      type="text"
                      value={searchModel}
                      onChange={(e) => setSearchModel(e.target.value)}
                      placeholder="Search SKU or Model..."
                      className="w-full bg-[#060e1f] border border-[#424754]/40 rounded-lg text-xs pl-8 pr-3 py-1.5 text-white font-mono placeholder:text-[#c2c6d6]/40 focus:outline-none focus:border-[#4cd7f6]"
                    />
                  </div>

                  {/* Add Product directly to this category */}
                  <button
                    type="button"
                    onClick={() => openAddProductModal(selectedCategory.code)}
                    className="px-3 py-1.5 bg-[#0284c7] hover:bg-[#0369a1] text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all cursor-pointer shrink-0 shadow-sm"
                    title={`Add product to ${selectedCategory.name}`}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Product</span>
                  </button>

                  {/* Open in Modal List (secondary option for full-screen view) */}
                  <button
                    type="button"
                    onClick={() => setIsProductsModalListOpen(true)}
                    className="p-1.5 bg-[#171f32] hover:bg-[#222a3d] border border-[#424754]/50 text-slate-300 hover:text-white rounded-lg transition-colors cursor-pointer shrink-0"
                    title="Open products in full-screen modal list"
                    aria-label="Open Fullscreen Modal List"
                  >
                    <Layers className="w-4 h-4 text-[#38bdf8]" />
                  </button>

                  {/* Hide / Unselect Button */}
                  <button
                    type="button"
                    onClick={() => setSelectedCategoryId(null)}
                    className="p-1.5 text-slate-400 hover:text-white bg-[#171f32] hover:bg-[#222a3d] rounded-lg border border-[#424754]/40 transition-colors cursor-pointer shrink-0"
                    title="Close side view"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Direct Product Listing in Side Container */}
              <div className="space-y-3">
                {filteredModels.map((m) => renderProductCard(m, false))}

                {filteredModels.length === 0 && (
                  <div className="text-center py-12 text-[#c2c6d6]/60 font-mono text-xs flex flex-col items-center gap-3">
                    <AlertCircle className="w-8 h-8 text-slate-500" />
                    <p>No products registered under category "{selectedCategory.name}".</p>
                    <button
                      type="button"
                      onClick={() => openAddProductModal(selectedCategory.code)}
                      className="px-4 py-2 bg-[#0284c7] hover:bg-[#0369a1] text-white text-xs font-semibold rounded-lg flex items-center gap-2 cursor-pointer shadow-md"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Product to this Category</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* =================================================== */
            /* EMPTY/HIDDEN PLACEHOLDER: NO CATEGORY SELECTED      */
            /* =================================================== */
            <div className="bg-[#131b2d]/60 rounded-xl p-8 border border-dashed border-[#424754]/40 flex flex-col items-center justify-center text-center gap-4 py-16">
              <div className="w-14 h-14 rounded-2xl bg-[#060e1f] border border-[#424754]/40 flex items-center justify-center text-[#38bdf8] shadow-inner">
                <Layers className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">No Category Selected</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-md font-mono">
                  Select a category from the list on the left to view its regulatory policy and associated products catalog.
                </p>
              </div>

              {/* Quick Select Category Chips */}
              <div className="flex flex-wrap items-center justify-center gap-2 mt-2 max-w-lg">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategoryId(cat.id)}
                    className="px-3 py-1.5 rounded-lg bg-[#060e1f] hover:bg-[#171f32] border border-[#424754]/40 hover:border-[#38bdf8]/50 text-xs font-mono text-slate-300 hover:text-white flex items-center gap-2 transition-all cursor-pointer shadow-sm"
                  >
                    <span className="text-[#38bdf8] font-bold">{cat.code}</span>
                    <span>{cat.name}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ======================================================= */}
      {/* MODAL LIST: PRODUCTS UNDER CATEGORY (POPUP MODAL LIST)  */}
      {/* ======================================================= */}
      {isProductsModalListOpen && selectedCategory && (
        <div className="fixed inset-0 bg-[#060e1f]/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#131b2d] border border-[#424754]/50 max-w-4xl w-full rounded-2xl p-6 shadow-2xl flex flex-col gap-4 max-h-[90vh] overflow-y-auto animate-in zoom-in-95">
            {/* Modal List Header */}
            <div className="flex items-center justify-between border-b border-[#424754]/30 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#0284c7]/20 border border-[#0284c7]/40 flex items-center justify-center text-[#38bdf8]">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white font-sans flex items-center gap-2">
                    Products Catalog — {selectedCategory.name}
                    <span className="text-xs font-mono text-[#4cd7f6] bg-[#4cd7f6]/15 px-2 py-0.5 rounded">
                      {filteredModels.length} Products
                    </span>
                  </h3>
                  <span className="text-xs font-mono text-slate-400">
                    Policy: {selectedCategory.targetStandard} • Statutory HSN: {selectedCategory.hsn}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => openAddProductModal(selectedCategory.code)}
                  className="px-3 py-1.5 bg-[#0284c7] hover:bg-[#0369a1] text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Product</span>
                </button>

                <button
                  onClick={() => setIsProductsModalListOpen(false)}
                  className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                  type="button"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Category Policy Summary Strip in Modal */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-[#060e1f] p-3 rounded-xl border border-[#424754]/30 text-xs font-mono">
              <div>
                <span className="text-[10px] text-slate-400 block uppercase">Category Code</span>
                <strong className="text-white">{selectedCategory.code}</strong>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block uppercase">Statutory Standard</span>
                <strong className="text-[#4edea3]">{selectedCategory.targetStandard}</strong>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block uppercase">HSN Code</span>
                <strong className="text-[#adc6ff]">{selectedCategory.hsn}</strong>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block uppercase">Serial Rule</span>
                <strong className="text-[#4cd7f6]">{selectedCategory.serialRule}</strong>
              </div>
            </div>

            {/* Search Filter inside Modal */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchModel}
                onChange={(e) => setSearchModel(e.target.value)}
                placeholder="Search products in this category by SKU, name, or manufacturer..."
                className="w-full bg-[#060e1f] border border-slate-700/60 rounded-xl text-xs pl-9 pr-3 py-2 text-white font-mono placeholder:text-slate-500 focus:outline-none focus:border-[#38bdf8]"
              />
            </div>

            {/* Modal Product Cards List */}
            <div className="space-y-3 max-h-[58vh] overflow-y-auto pr-1">
              {filteredModels.map((m) => renderProductCard(m, false))}

              {filteredModels.length === 0 && (
                <div className="text-center py-8 text-slate-400 font-mono text-xs">
                  No products found matching your search.
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2 border-t border-[#424754]/30">
              <button
                type="button"
                onClick={() => setIsProductsModalListOpen(false)}
                className="px-4 py-2 bg-[#222a3d] hover:bg-[#2d3448] text-white rounded-lg cursor-pointer text-xs font-semibold"
              >
                Close Modal List
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================= */}
      {/* VIEW FULL DETAILS MODAL                                 */}
      {/* ======================================================= */}
      {selectedModelForDrawer && (
        <div className="fixed inset-0 bg-[#060e1f]/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#131b2d] border border-[#424754]/50 max-w-3xl w-full rounded-2xl p-6 shadow-2xl flex flex-col gap-4 max-h-[88vh] overflow-y-auto animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-[#424754]/30 pb-3">
              <div className="flex items-center gap-3">
                <Cpu className="w-6 h-6 text-[#4cd7f6]" />
                <div>
                  <h3 className="text-base font-bold text-white font-sans">
                    {selectedModelForDrawer.name} [{selectedModelForDrawer.sku}]
                  </h3>
                  <span className="text-xs font-mono text-[#4edea3]">
                    MASTER DATA RECORD • Category: {selectedModelForDrawer.categoryName || selectedCategory?.name}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedModelForDrawer(null)}
                className="text-[#c2c6d6] hover:text-white p-1 rounded-lg cursor-pointer hover:bg-slate-800 transition-colors"
                type="button"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Rendered exactly like the listing */}
            {renderProductCard(selectedModelForDrawer, true)}

            <div className="flex justify-end gap-2 pt-2 border-t border-[#424754]/30">
              <button
                type="button"
                onClick={() => {
                  const m = selectedModelForDrawer;
                  setSelectedModelForDrawer(null);
                  openEditProductModal(m);
                }}
                className="px-4 py-2 bg-[#f59e0b] hover:bg-[#d97706] text-black font-bold rounded-lg cursor-pointer flex items-center gap-1.5 text-xs shadow-md"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit This Product</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedModelForDrawer(null)}
                className="px-4 py-2 bg-[#222a3d] hover:bg-[#2d3448] text-white rounded-lg cursor-pointer text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================= */}
      {/* ADD CATEGORY MODAL                                      */}
      {/* ======================================================= */}
      {isAddCategoryModalOpen && (
        <div className="fixed inset-0 bg-[#060e1f]/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#131b2d] border border-[#424754]/50 max-w-lg w-full rounded-2xl p-6 shadow-2xl flex flex-col gap-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-[#424754]/30 pb-3">
              <div className="flex items-center gap-2.5">
                <Network className="w-5 h-5 text-[#4cd7f6]" />
                <h3 className="text-base font-bold text-white">Add New Category</h3>
              </div>
              <button
                onClick={() => setIsAddCategoryModalOpen(false)}
                className="text-[#c2c6d6] hover:text-white cursor-pointer"
                type="button"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCategory} className="space-y-3.5 text-xs font-mono">
              <div>
                <label className="block text-[#c2c6d6] uppercase mb-1 font-semibold">Category Name</label>
                <input
                  type="text"
                  required
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  placeholder="e.g. Desktop Computer, AIO, Printer, Scanner"
                  className="w-full bg-[#060e1f] border border-[#424754]/50 rounded-lg p-2.5 text-white focus:outline-none focus:border-[#4cd7f6]"
                />
              </div>

              <div>
                <label className="block text-[#c2c6d6] uppercase mb-1 font-semibold">Category Code (Optional)</label>
                <input
                  type="text"
                  value={newCatCode}
                  onChange={(e) => setNewCatCode(e.target.value)}
                  placeholder="e.g. CAT-DSK-01"
                  className="w-full bg-[#060e1f] border border-[#424754]/50 rounded-lg p-2.5 text-white focus:outline-none focus:border-[#4cd7f6]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#c2c6d6] uppercase mb-1 font-semibold">Statutory HSN Code</label>
                  <input
                    type="text"
                    value={newCatHsn}
                    onChange={(e) => setNewCatHsn(e.target.value)}
                    placeholder="8471"
                    className="w-full bg-[#060e1f] border border-[#424754]/50 rounded-lg p-2.5 text-white focus:outline-none focus:border-[#4cd7f6]"
                  />
                </div>
                <div>
                  <label className="block text-[#c2c6d6] uppercase mb-1 font-semibold">Standard Reference</label>
                  <input
                    type="text"
                    value={newCatStandard}
                    onChange={(e) => setNewCatStandard(e.target.value)}
                    placeholder="IS 13252 Part 1"
                    className="w-full bg-[#060e1f] border border-[#424754]/50 rounded-lg p-2.5 text-white focus:outline-none focus:border-[#4cd7f6]"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#424754]/30">
                <button
                  type="button"
                  onClick={() => setIsAddCategoryModalOpen(false)}
                  className="px-4 py-2 bg-[#222a3d] text-white rounded-lg cursor-pointer hover:bg-[#2d3448]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#0284c7] hover:bg-[#0369a1] text-white font-bold rounded-lg shadow-md cursor-pointer"
                >
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================= */}
      {/* PRODUCT MODAL: ALL FIELDS EDITABLE + CUSTOM FIELDS (+)  */}
      {/* ======================================================= */}
      {isProductModalOpen && (
        <div className="fixed inset-0 bg-[#060e1f]/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#131b2d] border border-[#424754]/50 max-w-3xl w-full rounded-2xl p-6 shadow-2xl flex flex-col gap-4 max-h-[90vh] overflow-y-auto animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-[#424754]/30 pb-3">
              <div>
                <h3 className="text-lg font-bold text-white font-sans">
                  {editingModelId ? 'Edit Product Master Data' : 'Add Product Master Data'}
                </h3>
                <span className="text-xs font-mono text-[#adc6ff]">
                  All fields are fully editable by Admin • Details will auto-populate onto label designer
                </span>
              </div>
              <button
                onClick={() => setIsProductModalOpen(false)}
                className="text-[#c2c6d6] hover:text-white cursor-pointer p-1"
                type="button"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs font-mono">
              {/* Row 1: Target Category (Dropdown Select) & Model Name */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[#38bdf8] uppercase mb-1 font-bold">
                    Target Category (Editable)
                  </label>
                  <select
                    value={targetCatCode}
                    onChange={(e) => setTargetCatCode(e.target.value)}
                    className="w-full bg-[#060e1f] border border-[#424754]/60 rounded-lg p-2.5 text-white focus:outline-none focus:border-[#38bdf8] cursor-pointer"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.code}>
                        {c.name} ({c.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[#c2c6d6] uppercase mb-1 font-semibold">Product / Model Name</label>
                  <input
                    type="text"
                    required
                    value={modelName}
                    onChange={(e) => setModelName(e.target.value)}
                    placeholder="e.g. HP ProDesk 2 G1a Tower"
                    className="w-full bg-[#060e1f] border border-[#424754]/60 rounded-lg p-2.5 text-white focus:outline-none focus:border-[#38bdf8]"
                  />
                </div>
              </div>

              {/* Row 2: Product No/SKU, Warranty, Default MRP, Generic Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <label className="block text-[#c2c6d6] uppercase mb-1 font-semibold">Product No / SKU</label>
                  <input
                    type="text"
                    required
                    value={modelSku}
                    onChange={(e) => setModelSku(e.target.value)}
                    placeholder="e.g. D1VT0AT#ACJ"
                    className="w-full bg-[#060e1f] border border-[#424754]/60 rounded-lg p-2.5 text-white focus:outline-none focus:border-[#38bdf8]"
                  />
                </div>

                <div>
                  <label className="block text-[#c2c6d6] uppercase mb-1 font-semibold">Warranty</label>
                  <input
                    type="text"
                    value={modelWarranty}
                    onChange={(e) => setModelWarranty(e.target.value)}
                    placeholder="e.g. 5 Years"
                    className="w-full bg-[#060e1f] border border-[#424754]/60 rounded-lg p-2.5 text-white focus:outline-none focus:border-[#38bdf8]"
                  />
                </div>

                <div>
                  <label className="block text-[#c2c6d6] uppercase mb-1 font-semibold">Default MRP (₹)</label>
                  <input
                    type="text"
                    value={modelMrp}
                    onChange={(e) => setModelMrp(e.target.value)}
                    placeholder="114,229.00"
                    className="w-full bg-[#060e1f] border border-[#424754]/60 rounded-lg p-2.5 text-white focus:outline-none focus:border-[#38bdf8]"
                  />
                </div>

                <div>
                  <label className="block text-[#c2c6d6] uppercase mb-1 font-semibold">Generic Name</label>
                  <input
                    type="text"
                    value={modelGenericName}
                    onChange={(e) => setModelGenericName(e.target.value)}
                    placeholder="DESKTOP COMPUTER"
                    className="w-full bg-[#060e1f] border border-[#424754]/60 rounded-lg p-2.5 text-white focus:outline-none focus:border-[#38bdf8]"
                  />
                </div>
              </div>

              {/* Row 3: Manufactured By & Manufactured For with full addresses */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-2 border-t border-[#424754]/30">
                <div>
                  <label className="block text-[#adc6ff] uppercase mb-1 font-bold">Manufactured By</label>
                  <input
                    type="text"
                    value={mfgBy}
                    onChange={(e) => setMfgBy(e.target.value)}
                    placeholder="Company Name"
                    className="w-full bg-[#060e1f] border border-[#424754]/60 rounded-lg p-2 text-white focus:outline-none focus:border-[#38bdf8]"
                  />
                  <label className="block text-slate-400 uppercase text-[10px] mt-1.5 mb-0.5">
                    Manufacturer Complete Address
                  </label>
                  <input
                    type="text"
                    value={mfgByAddr}
                    onChange={(e) => setMfgByAddr(e.target.value)}
                    placeholder="Plot No. 3, Industrial Corridor, Sriperumbudur..."
                    className="w-full bg-[#060e1f] border border-[#424754]/60 rounded-lg p-2 text-white focus:outline-none focus:border-[#38bdf8]"
                  />
                </div>

                <div>
                  <label className="block text-[#4cd7f6] uppercase mb-1 font-bold">Manufactured For</label>
                  <input
                    type="text"
                    value={mfgFor}
                    onChange={(e) => setMfgFor(e.target.value)}
                    placeholder="Brand Owner Name"
                    className="w-full bg-[#060e1f] border border-[#424754]/60 rounded-lg p-2 text-white focus:outline-none focus:border-[#38bdf8]"
                  />
                  <label className="block text-slate-400 uppercase text-[10px] mt-1.5 mb-0.5">
                    Brand Owner Complete Address
                  </label>
                  <input
                    type="text"
                    value={mfgForAddr}
                    onChange={(e) => setMfgForAddr(e.target.value)}
                    placeholder="24, Salarpuria Arena, Hosur Main Road..."
                    className="w-full bg-[#060e1f] border border-[#424754]/60 rounded-lg p-2 text-white focus:outline-none focus:border-[#38bdf8]"
                  />
                </div>
              </div>

              {/* Row 4: For Complaints Address, Email, Toll Free, WhatsApp */}
              <div className="pt-2 border-t border-[#424754]/30">
                <label className="block text-[#f59e0b] uppercase mb-1 font-bold">For Complaints Address</label>
                <input
                  type="text"
                  value={complaintAddr}
                  onChange={(e) => setComplaintAddr(e.target.value)}
                  placeholder="Customer Care Executive, HP India Sales Private Limited, at above address"
                  className="w-full bg-[#060e1f] border border-[#424754]/60 rounded-lg p-2 text-white focus:outline-none focus:border-[#38bdf8]"
                />

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mt-2">
                  <div>
                    <label className="block text-slate-400 text-[10px] uppercase mb-0.5">Support Email</label>
                    <input
                      type="text"
                      value={modelEmail}
                      onChange={(e) => setModelEmail(e.target.value)}
                      placeholder="in.contact@hp.com"
                      className="w-full bg-[#060e1f] border border-[#424754]/60 rounded-lg p-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-[10px] uppercase mb-0.5">Toll Free Phone</label>
                    <input
                      type="text"
                      value={modelTollFree}
                      onChange={(e) => setModelTollFree(e.target.value)}
                      placeholder="1-800-258-7170"
                      className="w-full bg-[#060e1f] border border-[#424754]/60 rounded-lg p-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-[10px] uppercase mb-0.5">WhatsApp / Contact</label>
                    <input
                      type="text"
                      value={modelWhatsapp}
                      onChange={(e) => setModelWhatsapp(e.target.value)}
                      placeholder="+91 22 6101 4560"
                      className="w-full bg-[#060e1f] border border-[#424754]/60 rounded-lg p-2 text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Row 5: Pack Contents, Country of Origin, Website */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 border-t border-[#424754]/30">
                <div className="md:col-span-2">
                  <label className="block text-[#c2c6d6] uppercase mb-1 font-semibold">Pack Contents</label>
                  <input
                    type="text"
                    value={modelPackContents}
                    onChange={(e) => setModelPackContents(e.target.value)}
                    placeholder="Desktop Computer 1N, CPU 1N, Cable Set 1N, Keyboard 1N, Mouse 1N"
                    className="w-full bg-[#060e1f] border border-[#424754]/60 rounded-lg p-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-[#c2c6d6] uppercase mb-1 font-semibold">Country of Origin</label>
                  <input
                    type="text"
                    value={modelCountry}
                    onChange={(e) => setModelCountry(e.target.value)}
                    placeholder="India"
                    className="w-full bg-[#060e1f] border border-[#424754]/60 rounded-lg p-2 text-white"
                  />
                </div>
              </div>

              {/* Dynamic Custom Fields */}
              <div className="pt-3 pb-1 border-t border-[#424754]/30">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <span className="text-xs font-bold text-[#38bdf8] uppercase block">
                      Custom Regulatory & Label Fields
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Add any custom fields or labels title required for this product master
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddCustomField}
                    className="py-1.5 px-3 rounded-lg bg-[#171f32] hover:bg-[#222a3d] border border-[#38bdf8]/40 hover:border-[#38bdf8] text-[#38bdf8] text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5 text-[#38bdf8]" />
                    <span>Add Custom Field</span>
                  </button>
                </div>

                {customFields.length > 0 ? (
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {customFields.map((field, idx) => (
                      <div
                        key={field.id}
                        className="flex items-center gap-2 bg-[#060e1f] p-2 rounded-lg border border-[#424754]/40"
                      >
                        <span className="text-[10px] text-slate-500 font-mono w-5 shrink-0">
                          #{idx + 1}
                        </span>
                        <input
                          type="text"
                          value={field.label}
                          onChange={(e) => handleUpdateCustomField(field.id, 'label', e.target.value)}
                          placeholder="Label Title (e.g. BIS REGISTRATION, BEE STAR)"
                          className="w-1/2 bg-[#131b2d] border border-slate-700 rounded p-1.5 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-[#38bdf8]"
                        />
                        <input
                          type="text"
                          value={field.value}
                          onChange={(e) => handleUpdateCustomField(field.id, 'value', e.target.value)}
                          placeholder="Field Value (e.g. R-4100123, Grade 5)"
                          className="w-1/2 bg-[#131b2d] border border-slate-700 rounded p-1.5 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-[#38bdf8]"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveCustomField(field.id)}
                          className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-950/40 rounded transition-colors cursor-pointer shrink-0"
                          title="Remove Field"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-red-400" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-3 bg-[#060e1f]/60 rounded-lg border border-dashed border-[#424754]/40 text-center text-slate-400 text-[11px]">
                    No custom fields added yet. Click <strong className="text-[#38bdf8]">+ Add Custom Field</strong> to specify extra attributes (e.g., BIS Code, BEE Star, E-Waste).
                  </div>
                )}
              </div>

              {/* Form Action Buttons */}
              <div className="flex justify-end gap-2.5 pt-3 border-t border-[#424754]/30">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-4 py-2 bg-[#222a3d] hover:bg-[#2d3448] text-white rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#0284c7] hover:bg-[#0369a1] text-white font-bold rounded-lg shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingModelId ? 'Save Changes' : 'Save Master Product Data'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
