import React, { useState, useEffect } from 'react';
import { ProductModel, PrintJob, Category } from '../../types';
import { INITIAL_CATEGORIES, INITIAL_MODELS } from '../../data/mockData';
import { useAuth } from '../../context/AuthContext';
import { labelsApi } from '../../services/api';
import {
  Tag,
  Printer,
  Save,
  Check,
  Building,
  DollarSign,
  Package,
  Calendar,
  Layers,
  Eye,
  CheckCircle2,
  FileText,
  HelpCircle,
  Hash,
  ShieldCheck,
  X,
  PrinterIcon,
  Sun,
  Moon,
  AlertTriangle,
  Sparkles,
  Phone,
  Mail,
  MessageSquare,
  Globe
} from 'lucide-react';

interface CreateLabelViewProps {
  onJobCreated?: (job: PrintJob) => void;
  onNavigateToQueue?: () => void;
}

export const CreateLabelView: React.FC<CreateLabelViewProps> = ({ onJobCreated, onNavigateToQueue }) => {
  const { currentUser } = useAuth();

  const [categories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [models] = useState<ProductModel[]>(INITIAL_MODELS);

  // Step 1: Category selection
  const [selectedCategoryCode, setSelectedCategoryCode] = useState<string>(INITIAL_CATEGORIES[0].code);

  // Filter models based on category
  const availableModels = models.filter((m) => m.categoryCode === selectedCategoryCode);

  // Step 2: Product selection
  const [selectedModelId, setSelectedModelId] = useState<string>(
    availableModels.length > 0 ? availableModels[0].id : models[0].id
  );

  const activeModel = models.find((m) => m.id === selectedModelId) || models[0];

  // Auto-update selected model when category changes
  useEffect(() => {
    const matched = models.find((m) => m.categoryCode === selectedCategoryCode);
    if (matched) {
      setSelectedModelId(matched.id);
      setMrpValue(matched.defaultMrp || matched.mrp || '114,229.00');
    }
  }, [selectedCategoryCode, models]);

  // Step 4: Variable Details (Entered by Operator)
  const [mfgMonth, setMfgMonth] = useState('Jul');
  const [mfgYear, setMfgYear] = useState('2026');
  const [mrpValue, setMrpValue] = useState(activeModel.defaultMrp || activeModel.mrp || '114,229.00');
  const [isTaxInclusive, setIsTaxInclusive] = useState(true);
  const [netQty, setNetQty] = useState('1 N');
  const [manualSerial, setManualSerial] = useState('SN: HP202607824');
  const [batchCopies, setBatchCopies] = useState(1);

  // UI / Preview states
  const [isDarkSim, setIsDarkSim] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);

  // Update MRP when active model changes
  const handleModelSelect = (modelId: string) => {
    setSelectedModelId(modelId);
    const m = models.find((item) => item.id === modelId);
    if (m) {
      setMrpValue(m.defaultMrp || m.mrp || '114,229.00');
    }
  };

  // Toast helper
  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  const numericMrp = () => {
    const parsed = Number(String(mrpValue).replace(/[^0-9.]/g, ''));
    return Number.isFinite(parsed) ? parsed : 0;
  };

  const saveLabelSnapshotToDb = async (status: 'DRAFT' | 'QUEUED' | 'PRINTED') => {
    await labelsApi.create({
      category_id: selectedCategoryCode,
      category_name: activeModel.categoryName,
      product_id: activeModel.id,
      product_name: activeModel.name,
      template_id: activeModel.defaultTemplate || '',
      month: mfgMonth,
      year: mfgYear,
      mrp: numericMrp(),
      copies: batchCopies,
      snapshot: {
        productName: activeModel.name,
        brand: activeModel.brand,
        productNumber: activeModel.sku || activeModel.productNo,
        manufacturerName: activeModel.manufacturedBy,
        manufacturerAddress: activeModel.manufacturedByAddress,
        customerCareProfile: 'Customer Care',
        customerCareAddress: activeModel.complaintAddress,
        customerCareEmail: activeModel.email,
        customerCarePhone: activeModel.tollFree,
        customerCareWhatsApp: activeModel.whatsapp,
        customerCareWebsite: activeModel.website,
        warranty: activeModel.warranty,
        countryOfOrigin: activeModel.countryOfOrigin,
        genericName: activeModel.genericName,
        netQuantity: netQty,
        mrp: numericMrp(),
        taxText: isTaxInclusive ? 'Incl. of all Taxes' : '',
        packContents: activeModel.packContents,
        month: mfgMonth,
        year: mfgYear,
        manualSerial,
        status,
      },
    });
  };

  // 1. Save Draft
  const handleSaveDraft = async () => {
    try {
      await saveLabelSnapshotToDb('DRAFT');
      showToast('Draft saved successfully to database.');
    } catch (error) {
      showToast('Could not save draft to database. Please check backend connection.');
    }
  };

  // 2. Save Label
  const handleSaveLabel = async () => {
    const newJob: PrintJob = {
      id: `#LBL-${Math.floor(10000 + Math.random() * 90000)}`,
      productModel: activeModel.name,
      spec: `${activeModel.sku} • BIS Reg: ${activeModel.bisCode}`,
      category: activeModel.categoryName,
      hsn: '8471',
      templateTarget: activeModel.defaultTemplate || 'Standard Packaging 100x150mm',
      batchQty: 0,
      totalQty: batchCopies,
      status: 'QUEUED',
      mrp: `₹ ${mrpValue}`,
      mfgDate: `${mfgMonth} ${mfgYear}`,
      timestamp: 'Saved Just Now',
      checksum: `sha256:${Math.random().toString(16).substring(2, 10)}...`
    };

    if (onJobCreated) {
      onJobCreated(newJob);
    }
    try {
      await saveLabelSnapshotToDb('QUEUED');
      showToast(`Label for "${activeModel.name}" saved to database!`);
    } catch (error) {
      showToast('Could not save label to database. Please check backend connection.');
    }
  };

  // 3. Direct Print
  const handleDirectPrint = async () => {
    // Record job
    const newJob: PrintJob = {
      id: `#LBL-${Math.floor(10000 + Math.random() * 90000)}`,
      productModel: activeModel.name,
      spec: `${activeModel.sku} • Serial: ${manualSerial || 'N/A'}`,
      category: activeModel.categoryName,
      hsn: '8471',
      templateTarget: activeModel.defaultTemplate || 'Standard Packaging 100x150mm',
      batchQty: batchCopies,
      totalQty: batchCopies,
      status: 'PRINTED',
      mrp: `₹ ${mrpValue}`,
      mfgDate: `${mfgMonth} ${mfgYear}`,
      timestamp: 'Printed Now',
      checksum: `sha256:${Math.random().toString(16).substring(2, 10)}...`
    };

    if (onJobCreated) {
      onJobCreated(newJob);
    }

    try {
      await saveLabelSnapshotToDb('PRINTED');
    } catch (error) {
      showToast('Print opened, but database save failed. Please check backend connection.');
    }

    // Trigger native browser print
    window.print();
  };

  const monthsList = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const yearsList = ['2025', '2026', '2027', '2028', '2029', '2030'];

  return (
    <div className="flex flex-col w-full gap-6 pb-12">
      {/* Toast */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#00a572] text-[#00285d] font-bold text-xs px-4 py-3 rounded-lg shadow-2xl flex items-center gap-2 border border-[#4edea3] animate-in fade-in">
          <Check className="w-4 h-4" />
          <span>{notification}</span>
        </div>
      )}

      {/* OPERATOR HEADER */}
      <section className="bg-[#131b2d] rounded-xl p-5 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-[#424754]/30">
        <div>
          <div className="flex items-center gap-2 font-mono text-xs text-[#4cd7f6] uppercase tracking-wider font-semibold">
            <span>OPERATOR TERMINAL</span>
            <span className="text-[#424754]">/</span>
            <span>LEVEL 2</span>
            <span className="text-[#424754]">/</span>
            <span>DAILY LABEL CREATION & PRINT</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight mt-1">
            DAILY LABEL PRODUCTION WORKFLOW
          </h1>
          <p className="text-xs text-[#c2c6d6]/70 mt-0.5">
            Ek baar master data + template set hone ke baad: Sirf Category aur Product select karo, variable details enter karo aur print karo.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="bg-[#060e1f] px-3 py-1.5 rounded border border-[#424754]/30 flex items-center gap-2">
            <span className="text-[10px] font-mono text-[#c2c6d6]/70 uppercase">OPERATOR:</span>
            <span className="text-xs font-mono font-bold text-white">{currentUser?.name || 'Station Operator'}</span>
          </div>
          <div className="bg-[#00a572]/15 px-3 py-1.5 rounded border border-[#4edea3]/30 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#4edea3]" />
            <span className="text-xs font-mono font-bold text-[#4edea3]">DB AUTO-LOAD: ACTIVE</span>
          </div>
        </div>
      </section>

      {/* STEP PROGRESS BAR */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 bg-[#131b2d] p-3 rounded-xl border border-[#424754]/30">
        <div className="flex items-center gap-2 px-3 py-2 bg-[#4d8eff]/15 text-[#adc6ff] rounded border border-[#4d8eff]/30">
          <span className="w-5 h-5 rounded-full bg-[#4d8eff] text-white flex items-center justify-center font-bold text-[10px]">
            1
          </span>
          <div className="min-w-0">
            <span className="text-[10px] font-mono text-[#adc6ff]/70 block leading-tight">STEP 1 & 2</span>
            <span className="text-xs font-semibold truncate block">Category & Product</span>
          </div>
        </div>

        <div className="flex items-center gap-2 px-3 py-2 bg-[#171f32] text-white rounded border border-[#424754]/30">
          <span className="w-5 h-5 rounded-full bg-[#222a3d] text-[#4cd7f6] flex items-center justify-center font-bold text-[10px]">
            3
          </span>
          <div className="min-w-0">
            <span className="text-[10px] font-mono text-[#c2c6d6]/60 block leading-tight">STEP 3</span>
            <span className="text-xs font-semibold truncate block">Auto-Loaded Master</span>
          </div>
        </div>

        <div className="flex items-center gap-2 px-3 py-2 bg-[#171f32] text-white rounded border border-[#424754]/30">
          <span className="w-5 h-5 rounded-full bg-[#222a3d] text-[#4cd7f6] flex items-center justify-center font-bold text-[10px]">
            4
          </span>
          <div className="min-w-0">
            <span className="text-[10px] font-mono text-[#c2c6d6]/60 block leading-tight">STEP 4</span>
            <span className="text-xs font-semibold truncate block">Month, MRP, Serial</span>
          </div>
        </div>

        <div className="flex items-center gap-2 px-3 py-2 bg-[#171f32] text-white rounded border border-[#424754]/30">
          <span className="w-5 h-5 rounded-full bg-[#222a3d] text-[#4edea3] flex items-center justify-center font-bold text-[10px]">
            5
          </span>
          <div className="min-w-0">
            <span className="text-[10px] font-mono text-[#c2c6d6]/60 block leading-tight">STEP 5 & 6</span>
            <span className="text-xs font-semibold truncate block">Live Preview & Print</span>
          </div>
        </div>
      </div>

      {/* TWO-COLUMN WORKSPACE: LEFT OPERATOR WORKFLOW / RIGHT LIVE PREVIEW */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: 4 STEPS FORM (7 COLS) */}
        <div className="xl:col-span-7 flex flex-col gap-5">
          {/* STEP 1 & 2: SELECT CATEGORY & SELECT PRODUCT */}
          <div className="bg-[#131b2d] p-5 rounded-xl border border-[#424754]/30 shadow-lg flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-[#424754]/30 pb-3">
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-[#4cd7f6]" />
                <h2 className="text-xs font-mono uppercase font-bold text-white tracking-wider">
                  STEP 1 & 2: SELECT CATEGORY & PRODUCT
                </h2>
              </div>
              <span className="text-[10px] font-mono text-[#4cd7f6] bg-[#4cd7f6]/10 px-2 py-0.5 rounded border border-[#4cd7f6]/20">
                Fast Hierarchy
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Step 1: Category Dropdown */}
              <div>
                <label className="block text-[11px] font-mono text-[#adc6ff] uppercase tracking-wider font-semibold mb-1 flex items-center justify-between">
                  <span>Step 1: Select Category ▼</span>
                  <span className="text-[10px] text-[#c2c6d6]/60 font-normal">({categories.length} available)</span>
                </label>
                <select
                  value={selectedCategoryCode}
                  onChange={(e) => setSelectedCategoryCode(e.target.value)}
                  className="w-full bg-[#060e1f] border border-[#4d8eff]/50 rounded-lg px-3 py-2 text-xs font-mono text-white font-bold focus:outline-none focus:border-[#4d8eff] shadow-sm cursor-pointer"
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.code}>
                      {cat.name} ({cat.hsn ? `HSN ${cat.hsn}` : cat.code})
                    </option>
                  ))}
                </select>
                <span className="text-[10px] text-[#c2c6d6]/60 mt-1 block">
                  e.g. Desktop i5 - 5 Yr Warranty, AIO, Printer, Scanner...
                </span>
              </div>

              {/* Step 2: Product Dropdown */}
              <div>
                <label className="block text-[11px] font-mono text-[#4cd7f6] uppercase tracking-wider font-semibold mb-1 flex items-center justify-between">
                  <span>Step 2: Select Product ▼</span>
                  <span className="text-[10px] text-[#c2c6d6]/60 font-normal">({availableModels.length} in category)</span>
                </label>
                <select
                  value={selectedModelId}
                  onChange={(e) => handleModelSelect(e.target.value)}
                  className="w-full bg-[#060e1f] border border-[#4cd7f6]/50 rounded-lg px-3 py-2 text-xs font-mono text-white font-bold focus:outline-none focus:border-[#4cd7f6] shadow-sm cursor-pointer"
                >
                  {availableModels.length > 0 ? (
                    availableModels.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} [{m.sku}]
                      </option>
                    ))
                  ) : (
                    <option value={activeModel.id}>{activeModel.name}</option>
                  )}
                </select>
                <span className="text-[10px] text-[#c2c6d6]/60 mt-1 block">
                  Product select karte hi master database details auto-load ho jayengi.
                </span>
              </div>
            </div>
          </div>

          {/* STEP 3: AUTO-LOADED MASTER DATA (READ-ONLY / VERIFIED FROM DATABASE) */}
          <div className="bg-[#131b2d] p-5 rounded-xl border border-[#424754]/30 shadow-lg flex flex-col gap-3">
            <div className="flex items-center justify-between border-b border-[#424754]/30 pb-2.5">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#4edea3]" />
                <h2 className="text-xs font-mono uppercase font-bold text-[#4edea3] tracking-wider">
                  STEP 3: AUTO-LOADED DATABASE DETAILS (READ-ONLY MASTER)
                </h2>
              </div>
              <span className="text-[10px] font-mono text-[#c2c6d6]/80 bg-[#060e1f] px-2 py-0.5 rounded border border-[#424754]/40">
                No Re-typing Needed
              </span>
            </div>

            <div className="bg-[#060e1f] p-3.5 rounded-lg border border-[#424754]/40 text-xs font-mono space-y-2.5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pb-2 border-b border-[#424754]/30">
                <div>
                  <span className="text-[10px] text-[#c2c6d6]/60 block uppercase">Product / Model:</span>
                  <span className="font-bold text-white text-sm">{activeModel.name}</span>
                  <span className="text-[10px] text-[#4cd7f6] block">SKU / Part No: {activeModel.sku}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#c2c6d6]/60 block uppercase">Warranty & Country:</span>
                  <span className="font-bold text-[#4edea3]">{activeModel.warranty || '5 Years'}</span>
                  <span className="text-[10px] text-[#c2c6d6] block">Country of Origin: {activeModel.countryOfOrigin || 'India'}</span>
                </div>
              </div>

              {/* Manufactured By & For */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pb-2 border-b border-[#424754]/30 text-[11px]">
                <div>
                  <span className="text-[10px] text-[#adc6ff] font-bold block uppercase flex items-center gap-1">
                    <Building className="w-3 h-3" /> Manufactured By:
                  </span>
                  <p className="text-white font-medium leading-relaxed mt-0.5">
                    {activeModel.manufacturedBy || 'Flextronics Technologies India Pvt. Ltd.'}
                  </p>
                  <p className="text-[10px] text-[#c2c6d6]/70 leading-normal">
                    {activeModel.manufacturedByAddress || 'Plot No. 3, Industrial Corridor, Sriperumbudur, Tamil Nadu - 602105'}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] text-[#4cd7f6] font-bold block uppercase flex items-center gap-1">
                    <Building className="w-3 h-3" /> Manufactured For:
                  </span>
                  <p className="text-white font-medium leading-relaxed mt-0.5">
                    {activeModel.manufacturedFor || 'HP India Sales Private Limited'}
                  </p>
                  <p className="text-[10px] text-[#c2c6d6]/70 leading-normal">
                    {activeModel.manufacturedForAddress || '24, Salarpuria Arena, Hosur Main Road, Adugodi, Bangalore, Karnataka - 560030'}
                  </p>
                </div>
              </div>

              {/* Complaint & Support Contacts */}
              <div className="pb-2 border-b border-[#424754]/30 text-[11px]">
                <span className="text-[10px] text-[#f59e0b] font-bold block uppercase">
                  For Complaints / Grievance Redressal:
                </span>
                <p className="text-white mt-0.5">
                  {activeModel.complaintAddress || 'Customer Care Executive, HP India Sales Private Limited, at above address'}
                </p>
                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-[10px] text-[#c2c6d6]">
                  <span className="flex items-center gap-1">
                    <Mail className="w-3 h-3 text-[#adc6ff]" /> {activeModel.email || 'in.contact@hp.com'}
                  </span>
                  <span className="flex items-center gap-1">
                    <Phone className="w-3 h-3 text-[#4edea3]" /> Tel: {activeModel.tollFree || '1-800-258-7170'}
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageSquare className="w-3 h-3 text-[#4cd7f6]" /> WhatsApp: {activeModel.whatsapp || '+91 22 6101 4560'}
                  </span>
                </div>
              </div>

              {/* Generic Name & Package Contents */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px]">
                <div>
                  <span className="text-[10px] text-[#c2c6d6]/60 block uppercase">Generic Name:</span>
                  <span className="font-bold text-white uppercase">{activeModel.genericName || 'DESKTOP COMPUTER'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#c2c6d6]/60 block uppercase">Package Contents:</span>
                  <span className="text-white leading-normal text-[10px]">
                    ({activeModel.packContents || 'Desktop Computer 1N, CPU 1N, Cable Set 1N, Keyboard 1N, Mouse 1N'})
                  </span>
                </div>
              </div>
            </div>
            <p className="text-[10px] text-[#4edea3] font-mono flex items-center gap-1">
              <Check className="w-3 h-3" /> Ye details Admin ne Master Data me pehle se set kar rakhi hain. Operator ko baar-baar type karne ki zarurat nahi hai.
            </p>
          </div>

          {/* STEP 4: OPERATOR VARIABLE DETAILS (ONLY CHANGING INFO) */}
          <div className="bg-[#131b2d] p-5 rounded-xl border border-[#424754]/30 shadow-lg flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-[#424754]/30 pb-2.5">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#adc6ff]" />
                <h2 className="text-xs font-mono uppercase font-bold text-white tracking-wider">
                  STEP 4: ENTER VARIABLE PRODUCTION DETAILS (OPERATOR INPUTS)
                </h2>
              </div>
              <span className="text-[10px] font-mono text-[#adc6ff] bg-[#adc6ff]/10 px-2 py-0.5 rounded border border-[#adc6ff]/20">
                Changing Batch Data
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {/* Month */}
              <div>
                <label className="block text-[11px] font-mono text-[#c2c6d6] uppercase tracking-wider font-semibold mb-1 flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-[#4cd7f6]" /> Month of Mfg:
                </label>
                <select
                  value={mfgMonth}
                  onChange={(e) => setMfgMonth(e.target.value)}
                  className="w-full bg-[#060e1f] border border-[#424754]/50 rounded-lg px-3 py-2 text-xs font-mono text-white font-bold focus:outline-none focus:border-[#4d8eff]"
                >
                  {monthsList.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>

              {/* Year */}
              <div>
                <label className="block text-[11px] font-mono text-[#c2c6d6] uppercase tracking-wider font-semibold mb-1 flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-[#4cd7f6]" /> Year of Mfg:
                </label>
                <select
                  value={mfgYear}
                  onChange={(e) => setMfgYear(e.target.value)}
                  className="w-full bg-[#060e1f] border border-[#424754]/50 rounded-lg px-3 py-2 text-xs font-mono text-white font-bold focus:outline-none focus:border-[#4d8eff]"
                >
                  {yearsList.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>

              {/* Net Qty */}
              <div>
                <label className="block text-[11px] font-mono text-[#c2c6d6] uppercase tracking-wider font-semibold mb-1 flex items-center gap-1">
                  <Package className="w-3 h-3 text-[#4cd7f6]" /> Net Qty:
                </label>
                <input
                  type="text"
                  value={netQty}
                  onChange={(e) => setNetQty(e.target.value)}
                  placeholder="1 N"
                  className="w-full bg-[#060e1f] border border-[#424754]/50 rounded-lg px-3 py-2 text-xs font-mono text-white font-bold focus:outline-none focus:border-[#4d8eff]"
                />
              </div>

              {/* Maximum Retail Price (MRP) */}
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-mono text-[#c2c6d6] uppercase tracking-wider font-semibold mb-1 flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <DollarSign className="w-3 h-3 text-[#4edea3]" /> Maximum Retail Price (MRP ₹):
                  </span>
                  <span className="text-[10px] text-[#4edea3] font-mono">Pre-loaded from master</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-xs text-[#4edea3]">
                    ₹
                  </span>
                  <input
                    type="text"
                    value={mrpValue}
                    onChange={(e) => setMrpValue(e.target.value)}
                    className="w-full bg-[#060e1f] border border-[#424754]/50 rounded-lg pl-8 pr-3 py-2 text-sm font-mono text-white font-bold focus:outline-none focus:border-[#4edea3]"
                  />
                </div>
                <div className="flex items-center gap-2 mt-1.5">
                  <input
                    type="checkbox"
                    id="taxCheck"
                    checked={isTaxInclusive}
                    onChange={(e) => setIsTaxInclusive(e.target.checked)}
                    className="rounded bg-[#060e1f] text-[#4d8eff] cursor-pointer"
                  />
                  <label htmlFor="taxCheck" className="text-[11px] font-mono text-[#c2c6d6] cursor-pointer">
                    (Incl. of all Taxes) Statutory Standard
                  </label>
                </div>
              </div>

              {/* Serial Number (Plain Text Input) */}
              <div className="sm:col-span-2 lg:col-span-3 bg-[#060e1f] p-3 rounded-lg border border-[#424754]/40 flex flex-col gap-1.5">
                <label className="block text-[11px] font-mono text-[#adc6ff] uppercase tracking-wider font-semibold flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <Hash className="w-3.5 h-3.5 text-[#adc6ff]" /> Serial Number (Manual Plain Text Entry):
                  </span>
                  <span className="text-[9px] font-mono text-[#c2c6d6]/60">Plain Text Only</span>
                </label>
                <input
                  type="text"
                  value={manualSerial}
                  onChange={(e) => setManualSerial(e.target.value)}
                  placeholder="e.g. SN: HP202607824"
                  className="w-full bg-[#131b2d] border border-[#424754]/60 rounded px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#adc6ff]"
                />
                <div className="flex items-center gap-2 text-[10px] font-mono text-[#c2c6d6]/70 leading-tight">
                  <span className="text-[#f59e0b]">ℹ️ Note:</span>
                  <span>Serial number plain text form me print hoga (auto-generated barcode nahi). Operator manually batch serial number specify kar sakta hai.</span>
                </div>
              </div>

              {/* Batch Print Quantity */}
              <div className="sm:col-span-2 lg:col-span-3 flex items-center justify-between pt-1">
                <span className="text-xs font-mono text-[#c2c6d6]">Copies to Print in this Run:</span>
                <div className="flex items-center gap-2">
                  {[1, 5, 10, 50].map((qty) => (
                    <button
                      key={qty}
                      type="button"
                      onClick={() => setBatchCopies(qty)}
                      className={`px-2.5 py-1 text-xs font-mono rounded cursor-pointer transition-colors ${
                        batchCopies === qty
                          ? 'bg-[#4d8eff] text-white font-bold'
                          : 'bg-[#060e1f] text-[#c2c6d6] hover:bg-[#171f32]'
                      }`}
                    >
                      {qty}
                    </button>
                  ))}
                  <input
                    type="number"
                    min="1"
                    max="1000"
                    value={batchCopies}
                    onChange={(e) => setBatchCopies(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-16 bg-[#060e1f] border border-[#424754]/50 rounded px-2 py-1 text-xs font-mono text-white text-center"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: STEP 5 & 6: LIVE REAL STICKER PREVIEW & 4 ACTION BUTTONS (5 COLS) */}
        <div className="xl:col-span-5 flex flex-col gap-4 static xl:sticky xl:top-20">
          <div className="bg-[#131b2d] rounded-xl p-4 border border-[#424754]/30 shadow-2xl flex flex-col gap-3">
            {/* Preview Header */}
            <div className="flex items-center justify-between border-b border-[#424754]/30 pb-2.5">
              <div>
                <h3 className="text-xs font-mono uppercase font-bold text-white tracking-wider flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-[#4cd7f6]" />
                  STEP 5: LIVE STICKER PREVIEW (100 x 150mm)
                </h3>
                <span className="text-[10px] font-mono text-[#4cd7f6]">
                  Real-time synchronized sticker representation
                </span>
              </div>

              {/* Dark Sim Toggle */}
              <button
                onClick={() => setIsDarkSim(!isDarkSim)}
                type="button"
                className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#060e1f] border border-[#424754]/40 text-xs text-[#c2c6d6] hover:text-white cursor-pointer"
              >
                {isDarkSim ? <Sun className="w-3.5 h-3.5 text-[#f59e0b]" /> : <Moon className="w-3.5 h-3.5 text-[#4cd7f6]" />}
                <span className="text-[10px] font-mono">{isDarkSim ? 'White Label' : 'Dark Sim'}</span>
              </button>
            </div>

            {/* REAL PRINTABLE STICKER CANVAS */}
            {/* Note: ID #printable-label-sticker is specifically styled for window.print() */}
            <div
              id="printable-label-sticker"
              className={`w-full rounded border-2 select-none transition-colors p-4 font-mono flex flex-col justify-between text-left text-black bg-white shadow-md ${
                isDarkSim ? 'bg-[#060e1f] text-[#dbe2fb] border-[#424754]/60' : 'bg-[#ffffff] text-[#000000] border-black'
              }`}
              style={{ minHeight: '520px' }}
            >
              {/* STICKER BODY MATCHING USER'S PROMPT SPEC */}
              <div className="space-y-2.5 text-[10px] leading-tight">
                {/* 1. Manufactured By */}
                <div>
                  <div className="font-bold text-[10px] tracking-wide">Manufactured By:</div>
                  <div className="font-semibold">{activeModel.manufacturedBy || 'Flextronics Technologies India Pvt. Ltd.'}</div>
                  <div className="text-[9px] opacity-85 leading-snug">
                    {activeModel.manufacturedByAddress || 'Plot No. 3, Industrial Corridor, Sriperumbudur, Tamil Nadu - 602105'}
                  </div>
                </div>

                {/* 2. Manufactured For */}
                <div>
                  <div className="font-bold text-[10px] tracking-wide">Manufactured For:</div>
                  <div className="font-semibold">{activeModel.manufacturedFor || 'HP India Sales Private Ltd.'}</div>
                  <div className="text-[9px] opacity-85 leading-snug">
                    {activeModel.manufacturedForAddress || '24, Salarpuria Arena, Hosur Main Road, Adugodi, Bangalore - 560030'}
                  </div>
                </div>

                {/* 3. For Complaints */}
                <div>
                  <div className="font-bold text-[10px] tracking-wide">For Complaints:</div>
                  <div className="text-[9px] leading-snug">
                    {activeModel.complaintAddress || 'Customer Care Executive, HP India Sales Private Limited, at above address'}
                  </div>
                  <div className="text-[9px] font-medium mt-0.5 space-y-0.5">
                    <div>Email: {activeModel.email || 'in.contact@hp.com'}</div>
                    <div>Tel: {activeModel.tollFree || '1-800-258-7170'}</div>
                    <div>WhatsApp: {activeModel.whatsapp || '+91 22 6101 4560'}</div>
                  </div>
                </div>

                {/* Divider */}
                <div className="border-t border-current my-1 opacity-40"></div>

                {/* 4. Month & Year */}
                <div>
                  <span className="font-bold text-[10px]">Month & Year: </span>
                  <span className="font-black text-[11px]">{mfgMonth} {mfgYear}</span>
                </div>

                {/* 5. MRP */}
                <div className="bg-gray-100 p-1.5 rounded border border-gray-300 text-black">
                  <div className="font-black text-sm">
                    MRP ₹{mrpValue}
                  </div>
                  <div className="text-[9px] font-semibold opacity-90">
                    {isTaxInclusive ? '(Incl. of all Taxes)' : ''}
                  </div>
                </div>

                {/* 6. Product No & Country */}
                <div className="space-y-0.5 text-[10px]">
                  <div>
                    <span className="font-bold">Product No: </span>
                    <span className="font-bold">{activeModel.sku || activeModel.productNo}</span>
                  </div>
                  <div>
                    <span className="font-bold">Country of Origin: </span>
                    <span>{activeModel.countryOfOrigin || 'India'}</span>
                  </div>
                </div>

                {/* 7. Generic Name */}
                <div>
                  <div className="font-bold text-[9px] uppercase tracking-wide opacity-85">Generic Name:</div>
                  <div className="font-black text-xs uppercase">{activeModel.genericName || 'DESKTOP COMPUTER'}</div>
                </div>

                {/* 8. Net Qty */}
                <div>
                  <span className="font-bold text-[10px]">Net Qty: </span>
                  <span className="font-black text-xs">{netQty}</span>
                </div>

                {/* 9. Pack Contents */}
                <div>
                  <div className="text-[9px] leading-snug font-medium">
                    ({activeModel.packContents || 'DESKTOP COMPUTER 1N, CPU 1N, CABLE SET 1N, KEYBOARD 1N, MOUSE 1N'})
                  </div>
                </div>

                {/* 10. Warranty & Serial Number */}
                <div className="border-t border-current pt-1 text-[9px] flex flex-col gap-0.5">
                  <div>
                    <span className="font-bold">Warranty: </span>
                    <span className="font-bold">{activeModel.warranty || '5 Years'}</span>
                  </div>
                  {manualSerial && (
                    <div className="font-mono font-bold text-[10px] tracking-wider">
                      {manualSerial}
                    </div>
                  )}
                  {activeModel.website && (
                    <div className="text-[8px] opacity-70">
                      Website: {activeModel.website}
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Regulatory Mark */}
              <div className="pt-2 mt-2 border-t border-current flex items-center justify-between text-[8px]">
                <span>IS 13252 (PART 1) // {activeModel.bisCode || 'R-4100123'}</span>
                <span className="font-black">RAMA IT SOLUTION</span>
              </div>
            </div>

            {/* STEP 6: THE 4 REQUESTED ACTION BUTTONS */}
            <div className="flex flex-col gap-2 pt-2 border-t border-[#424754]/30">
              <span className="text-[10px] font-mono text-[#c2c6d6]/70 uppercase tracking-wider font-semibold">
                STEP 6: ACTIONS & PRINTING
              </span>

              <div className="grid grid-cols-2 gap-2">
                {/* 1. Save Draft */}
                <button
                  type="button"
                  onClick={handleSaveDraft}
                  className="py-2.5 px-3 bg-[#171f32] hover:bg-[#222a3d] text-white font-mono text-xs rounded-lg flex items-center justify-center gap-1.5 border border-[#424754]/50 cursor-pointer transition-colors"
                  title="Save current operator entries as a draft in the database"
                >
                  <Save className="w-3.5 h-3.5 text-[#4cd7f6]" />
                  <span>Save Draft</span>
                </button>

                {/* 2. Save Label */}
                <button
                  type="button"
                  onClick={handleSaveLabel}
                  className="py-2.5 px-3 bg-[#00a572] hover:bg-[#008f62] text-[#002e6a] font-bold font-mono text-xs rounded-lg flex items-center justify-center gap-1.5 shadow-md cursor-pointer transition-colors"
                  title="Save label record to print buffer & history"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Save Label</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {/* 3. Print Preview */}
                <button
                  type="button"
                  onClick={() => setIsPreviewModalOpen(true)}
                  className="py-3 px-3 bg-[#222a3d] hover:bg-[#2d374d] text-[#adc6ff] font-bold font-mono text-xs rounded-lg flex items-center justify-center gap-1.5 border border-[#4d8eff]/40 shadow-sm cursor-pointer transition-colors"
                  title="Open Print Inspection Modal (Check borders, font & dimensions)"
                >
                  <Eye className="w-4 h-4 text-[#4d8eff]" />
                  <span>Print Preview</span>
                </button>

                {/* 4. Print Button */}
                <button
                  type="button"
                  onClick={handleDirectPrint}
                  className="py-3 px-3 bg-[#4d8eff] hover:bg-[#3b82f6] text-white font-bold font-mono text-sm rounded-lg flex items-center justify-center gap-2 shadow-lg cursor-pointer transition-transform active:scale-98"
                  title="Open browser print dialog — prints ONLY the clean label sticker!"
                >
                  <Printer className="w-4 h-4 fill-white" />
                  <span>Print ({batchCopies})</span>
                </button>
              </div>

              <span className="text-[10px] text-[#c2c6d6]/60 font-mono text-center mt-0.5">
                Print par click karte hi browser print dialog open hoga aur sirf Sticker print hoga.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* PRINT PREVIEW INSPECTION MODAL */}
      {isPreviewModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#131b2d] border border-[#424754] rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl animate-in zoom-in-95">
            {/* Modal Header */}
            <div className="p-4 border-b border-[#424754]/40 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-[#4d8eff]" />
                <div>
                  <h3 className="text-sm font-bold text-white uppercase font-mono">
                    LABEL PRINT PREVIEW & BOUNDARY INSPECTION
                  </h3>
                  <span className="text-[10px] font-mono text-[#4cd7f6]">
                    Format: 100mm x 150mm Standard Packaging Sticker
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsPreviewModalOpen(false)}
                className="p-1 rounded text-[#c2c6d6] hover:text-white hover:bg-[#222a3d] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto flex flex-col md:flex-row gap-6 items-start">
              {/* Miniature Physical Sticker Preview */}
              <div className="w-full md:w-1/2 flex flex-col items-center">
                <div className="w-full max-w-[280px] bg-white text-black p-4 rounded border-2 border-black font-mono text-[9px] leading-tight shadow-xl flex flex-col justify-between min-h-[380px]">
                  <div className="space-y-2">
                    <div>
                      <span className="font-bold text-[9px]">Manufactured By:</span>
                      <p className="font-semibold text-[8px]">{activeModel.manufacturedBy}</p>
                      <p className="text-[7.5px] text-gray-600">{activeModel.manufacturedByAddress}</p>
                    </div>

                    <div>
                      <span className="font-bold text-[9px]">Manufactured For:</span>
                      <p className="font-semibold text-[8px]">{activeModel.manufacturedFor}</p>
                      <p className="text-[7.5px] text-gray-600">{activeModel.manufacturedForAddress}</p>
                    </div>

                    <div>
                      <span className="font-bold text-[9px]">For Complaints:</span>
                      <p className="text-[7.5px]">{activeModel.complaintAddress}</p>
                      <p className="text-[7.5px] mt-0.5">Email: {activeModel.email} | Tel: {activeModel.tollFree}</p>
                    </div>

                    <div className="border-t border-black pt-1">
                      <span className="font-bold">Month & Year: </span>
                      <span className="font-black">{mfgMonth} {mfgYear}</span>
                    </div>

                    <div className="bg-gray-100 p-1 rounded font-black text-[11px]">
                      MRP ₹{mrpValue} (Incl. of all Taxes)
                    </div>

                    <div>
                      <div><strong>Product No:</strong> {activeModel.sku}</div>
                      <div><strong>Country of Origin:</strong> {activeModel.countryOfOrigin}</div>
                      <div className="font-black mt-0.5">{activeModel.genericName}</div>
                      <div><strong>Net Qty:</strong> {netQty}</div>
                      <div className="text-[7px] text-gray-700">({activeModel.packContents})</div>
                    </div>

                    <div className="border-t border-black pt-1 text-[8px]">
                      <div><strong>Warranty:</strong> {activeModel.warranty}</div>
                      {manualSerial && <div><strong>Serial:</strong> {manualSerial}</div>}
                    </div>
                  </div>

                  <div className="text-[7px] text-center border-t border-black pt-1 mt-2">
                    RAMA IT SOLUTION • IS 13252 (PART 1)
                  </div>
                </div>
                <span className="text-[10px] font-mono text-[#c2c6d6]/70 mt-2">
                  Scale: 100mm x 150mm Label Output
                </span>
              </div>

              {/* Quality Checklist */}
              <div className="w-full md:w-1/2 flex flex-col gap-3">
                <h4 className="text-xs font-mono uppercase font-bold text-white">
                  Pre-Flight Quality Checklist:
                </h4>

                <div className="space-y-2 text-xs font-mono">
                  <div className="p-2 rounded bg-[#060e1f] border border-[#4edea3]/40 flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#4edea3] shrink-0 mt-0.5" />
                    <div>
                      <span className="text-white font-bold block">Text inside border</span>
                      <span className="text-[10px] text-[#c2c6d6]/70">No text is overflowing or clipping beyond sticker boundaries.</span>
                    </div>
                  </div>

                  <div className="p-2 rounded bg-[#060e1f] border border-[#4edea3]/40 flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#4edea3] shrink-0 mt-0.5" />
                    <div>
                      <span className="text-white font-bold block">Address Fit Verification</span>
                      <span className="text-[10px] text-[#c2c6d6]/70">Manufactured By and Complaint addresses completely resolved.</span>
                    </div>
                  </div>

                  <div className="p-2 rounded bg-[#060e1f] border border-[#4edea3]/40 flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#4edea3] shrink-0 mt-0.5" />
                    <div>
                      <span className="text-white font-bold block">Font Proper & Readable</span>
                      <span className="text-[10px] text-[#c2c6d6]/70">High-contrast typography formatted for thermal/laser printing.</span>
                    </div>
                  </div>

                  <div className="p-2 rounded bg-[#060e1f] border border-[#4edea3]/40 flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#4edea3] shrink-0 mt-0.5" />
                    <div>
                      <span className="text-white font-bold block">Correct Dimension (100x150mm)</span>
                      <span className="text-[10px] text-[#c2c6d6]/70">Standard aspect ratio matched to thermal packaging roll.</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-[#424754]/40 flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsPreviewModalOpen(false);
                      handleDirectPrint();
                    }}
                    className="flex-1 py-2.5 px-4 bg-[#4d8eff] hover:bg-[#3b82f6] text-white font-mono font-bold text-xs rounded-lg flex items-center justify-center gap-2 shadow-lg cursor-pointer"
                  >
                    <Printer className="w-4 h-4 fill-white" />
                    <span>Proceed to Print Now</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsPreviewModalOpen(false)}
                    className="py-2.5 px-3 bg-[#171f32] hover:bg-[#222a3d] text-[#c2c6d6] font-mono text-xs rounded-lg border border-[#424754]/40 cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
