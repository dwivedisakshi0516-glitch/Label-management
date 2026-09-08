import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Printer,
  Save,
  RotateCcw,
  Eye,
  CheckCircle2,
  Box,
  Layers,
  Calendar,
  IndianRupee,
  Copy,
  Sliders,
  ShieldCheck,
  Building2,
  Headphones,
  Check,
  X,
  Maximize2,
  Edit3,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Category, Product, LabelTemplate, LabelSnapshot, SavedLabel, NavigationPath } from '../types';
import { categoriesApi, productsApi, templatesApi, labelsApi, manufacturersApi, customerCareApi, warrantiesApi } from '../services/api';
import { useToast } from '../context/ToastContext';
import { useSettings } from '../context/SettingsContext';
import { PrintableLabel } from '../components/label/PrintableLabel';
import { ImportedRow } from '../components/import/ImportedFileTable';

interface CreateLabelProps {
  initialLabelData?: SavedLabel | null;
  initialImportRow?: ImportedRow | null;
  onImportApplied?: () => void;
  onNavigateToSaved?: () => void;
  onNavigateToEdit?: () => void;
}

const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 10 }, (_, i) => (CURRENT_YEAR - 2 + i).toString());

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

const PRINTER_TEMPLATE_FIELDS = [
  { key: 'importer_name', label: 'Importers Name & Address', enabled: true, font_size: 9, bold: true, alignment: 'left' as const, order: 14, default_value: '' },
  { key: 'imported_in', label: 'Imported In', enabled: true, font_size: 9, bold: false, alignment: 'left' as const, order: 15, default_value: 'January 2026' },
  { key: 'customer_care_other_numbers', label: 'Customer Care - Other Numbers', enabled: true, font_size: 9, bold: false, alignment: 'left' as const, order: 16, default_value: '' },
  { key: 'recycling_information', label: 'Recycling Information', enabled: true, font_size: 8, bold: false, alignment: 'left' as const, order: 17, default_value: 'For Recycling of your product, please visit: www.brother.in' },
];

const AIO_TEMPLATE_FIELDS = [
  { key: 'manufactured_for_name', label: 'Manufactured For Name', enabled: true, font_size: 10, bold: true, alignment: 'left' as const, order: 14, default_value: 'HP India Sales Private Ltd.' },
  { key: 'manufactured_for_address', label: 'Manufactured For Address', enabled: true, font_size: 10, bold: false, alignment: 'left' as const, order: 15, default_value: 'No.24, Kothari Arena, Hosur Main Road, Adugodi, Bangalore, Karnataka - 560030' },
];

const DESKTOP_TEMPLATE_FIELDS = [
  { key: 'manufactured_for_name', label: 'Manufactured For Name', enabled: true, font_size: 10, bold: true, alignment: 'left' as const, order: 14, default_value: 'HP India Sales Private Ltd.' },
  { key: 'manufactured_for_address', label: 'Manufactured For Address', enabled: true, font_size: 10, bold: false, alignment: 'left' as const, order: 15, default_value: 'No.24, Kothari Arena, Hosur Main Road, Adugodi, Bangalore, Karnataka - 560030' },
  { key: 'generic_note', label: 'Generic Name Note', enabled: true, font_size: 9, bold: false, alignment: 'left' as const, order: 16, default_value: '(EXCLUDING MONITOR)' },
];

const getPrinterCustomDefaults = (product?: Product) => ({
  importer_name: product?.importer_name || 'BROTHER INTERNATIONAL (INDIA) PVT LTD, NOS. 801 AND 802, 8TH FLOOR, ALPHA BUILDING, HIRANANDANI GARDENS, POWAI, MUMBAI - 400 076, MAHARASHTRA',
  imported_in: product?.imported_in || (product?.product_number?.toUpperCase().includes('HL-L5210DN') ? 'January 2025' : product?.product_number?.toUpperCase().includes('DCP-L3560CDW') ? 'July 2026' : 'January 2026'),
  customer_care_other_numbers: product?.customer_care_other_numbers || '1800 209 8904 (OTHER LANDLINE AND MOBILE CUSTOMERS)',
  recycling_information: product?.recycling_information || 'For Recycling of your product, please visit: www.brother.in',
});

const getAioCustomDefaults = () => ({
  manufactured_for_name: 'HP India Sales Private Ltd.',
  manufactured_for_address: 'No.24, Kothari Arena, Hosur Main Road, Adugodi, Bangalore, Karnataka - 560030',
});

const getDesktopCustomDefaults = () => ({
  manufactured_for_name: 'HP India Sales Private Ltd.',
  manufactured_for_address: 'No.24, Kothari Arena, Hosur Main Road, Adugodi, Bangalore, Karnataka - 560030',
  generic_note: '(EXCLUDING MONITOR)',
});

const withPrinterFields = (fields: LabelTemplate['fields'] = [], productNumber = '', genericName = '') => {
  const isPrinterLabel = productNumber.toUpperCase().includes('DCP-') || productNumber.toUpperCase().includes('HL-') || genericName.toUpperCase().includes('PRINTER');
  if (!isPrinterLabel || fields.length > 0) return fields;
  const existingKeys = new Set(fields.map((field) => field.key));
  return [
    ...fields,
    ...PRINTER_TEMPLATE_FIELDS.filter((field) => !existingKeys.has(field.key)),
  ];
};

const withAioFields = (fields: LabelTemplate['fields'] = [], productNumber = '', genericName = '') => {
  const normalizedGenericName = genericName.toUpperCase().replace(/-/g, ' ');
  const isAioLabel = productNumber.toUpperCase().includes('D2UP4PT') || normalizedGenericName.includes('ALL IN ONE COMPUTER');
  if (!isAioLabel || fields.length > 0) return fields;
  const existingKeys = new Set(fields.map((field) => field.key));
  return [
    ...fields,
    ...AIO_TEMPLATE_FIELDS.filter((field) => !existingKeys.has(field.key)),
  ];
};

const withDesktopFields = (fields: LabelTemplate['fields'] = [], categoryName = '', genericName = '') => {
  const category = categoryName.toLowerCase();
  const normalizedGenericName = genericName.toUpperCase().replace(/-/g, ' ');
  const isDesktopLabel = category.includes('desktop') || normalizedGenericName === 'DESKTOP COMPUTER';
  if (!isDesktopLabel || fields.length > 0) return fields;
  const existingKeys = new Set(fields.map((field) => field.key));
  return [
    ...fields,
    ...DESKTOP_TEMPLATE_FIELDS.filter((field) => !existingKeys.has(field.key)),
  ];
};

const getCategoryLayoutStyle = (categoryName = '', productNumber = '', genericName = '') => {
  const category = categoryName.toLowerCase();
  const normalizedGeneric = genericName.toUpperCase().replace(/-/g, ' ');
  if (category.includes('printer')) return 'printer';
  if (category.includes('aio') || normalizedGeneric.includes('ALL IN ONE COMPUTER')) return 'aio';
  if (category.includes('desktop') || normalizedGeneric === 'DESKTOP COMPUTER') return 'desktop';
  if (productNumber.toUpperCase().includes('DCP-') || productNumber.toUpperCase().includes('HL-')) return 'printer';
  return 'standard';
};

const normalizeImportKey = (key: string) => key.toLowerCase().replace(/[^a-z0-9]/g, '');

const getImportedValue = (row: ImportedRow, aliases: string[]) => {
  const normalizedAliases = aliases.map(normalizeImportKey);
  const entry = Object.entries(row).find(([key]) => normalizedAliases.includes(normalizeImportKey(key)));
  return entry ? String(entry[1] ?? '').trim() : '';
};

const parseImportedNumber = (value: string) => {
  const parsed = Number(value.replace(/[^0-9.]/g, ''));
  return Number.isFinite(parsed) ? parsed : 0;
};

export const CreateLabel: React.FC<CreateLabelProps> = ({
  initialLabelData,
  initialImportRow,
  onImportApplied,
  onNavigateToSaved,
  onNavigateToEdit,
}) => {
  const toast = useToast();
  const { settings } = useSettings();

  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [templates, setTemplates] = useState<LabelTemplate[]>([]);

  // Selected Category & Product
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');

  // Editable Snapshot Fields
  const [productName, setProductName] = useState('');
  const [brand, setBrand] = useState('');
  const [productNumber, setProductNumber] = useState('');
  const [manufacturerName, setManufacturerName] = useState('');
  const [manufacturerAddress, setManufacturerAddress] = useState('');
  const [customerCareProfile, setCustomerCareProfile] = useState('');
  const [customerCareAddress, setCustomerCareAddress] = useState('');
  const [customerCareEmail, setCustomerCareEmail] = useState('');
  const [customerCarePhone, setCustomerCarePhone] = useState('');
  const [customerCareTollFree, setCustomerCareTollFree] = useState('');
  const [customerCareWhatsApp, setCustomerCareWhatsApp] = useState('');
  const [customerCareWebsite, setCustomerCareWebsite] = useState('');
  const [warranty, setWarranty] = useState('5 Years');
  const [countryOfOrigin, setCountryOfOrigin] = useState(settings.default_country);
  const [genericName, setGenericName] = useState('');
  const [netQuantity, setNetQuantity] = useState('1 N');
  const [mrp, setMrp] = useState<number | string>(0);
  const [taxText, setTaxText] = useState('Incl. of all Taxes');
  const [packContents, setPackContents] = useState('');
  const [month, setMonth] = useState('Jul');
  const [year, setYear] = useState(CURRENT_YEAR.toString());
  const [copies, setCopies] = useState<number>(1);
  const [widthMm, setWidthMm] = useState<number>(settings.default_label_width);
  const [heightMm, setHeightMm] = useState<number>(settings.default_label_height);
  const [customFieldValues, setCustomFieldValues] = useState<Record<string, string>>({});

  // Field Edit Mode Toggle
  const [isAdvancedEditOpen, setIsAdvancedEditOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);

  useEffect(() => {
    loadInitialMasterData();
  }, []);

  useEffect(() => {
    if (!isLoading && initialImportRow) {
      handleImportedRowSelect(initialImportRow);
      onImportApplied?.();
    }
  }, [isLoading, initialImportRow]);

  const loadInitialMasterData = async () => {
    try {
      setIsLoading(true);
      const [cats, tpls] = await Promise.all([
        categoriesApi.getAll(),
        templatesApi.getAll(),
      ]);
      setCategories(cats);
      setTemplates(tpls);

      const defaultTpl = tpls.find((t) => t.is_default) || tpls[0];
      if (defaultTpl) {
        setSelectedTemplateId(defaultTpl.id);
        setWidthMm(defaultTpl.width_mm || settings.default_label_width);
        setHeightMm(defaultTpl.height_mm || settings.default_label_height);
      } else {
        setWidthMm(settings.default_label_width);
        setHeightMm(settings.default_label_height);
      }

      if (initialLabelData) {
        setSelectedCategoryId(initialLabelData.category_id);
        const prods = await productsApi.getAll({ category_id: initialLabelData.category_id });
        setProducts(prods);
        setSelectedProductId(initialLabelData.product_id);
        const s = initialLabelData.snapshot || {};
        setProductName(s.productName || initialLabelData.product_name || '');
        setBrand(s.brand || '');
        setProductNumber(s.productNumber || '');
        setManufacturerName(s.manufacturerName || '');
        setManufacturerAddress(s.manufacturerAddress || '');
        setCustomerCareProfile(s.customerCareProfile || '');
        setCustomerCareAddress(s.customerCareAddress || '');
        setCustomerCareEmail(s.customerCareEmail || '');
        setCustomerCarePhone(s.customerCarePhone || '');
        setCustomerCareTollFree(s.customerCareTollFree || '');
        setCustomerCareWhatsApp(s.customerCareWhatsApp || '');
        setCustomerCareWebsite(s.customerCareWebsite || '');
        setWarranty(s.warranty || '5 Years');
        setCountryOfOrigin(s.countryOfOrigin || settings.default_country);
        setGenericName(s.genericName || '');
        setNetQuantity(s.netQuantity || '1 N');
        setMrp(initialLabelData.mrp || s.mrp || 0);
        setTaxText(s.taxText || 'Incl. of all Taxes');
        setPackContents(s.packContents || '');
        setCustomFieldValues(
          Object.keys(s)
            .filter((key) => !BUILT_IN_TEMPLATE_KEYS.has(key) && !['width_mm', 'height_mm', 'fields'].includes(key))
            .reduce<Record<string, string>>((values, key) => {
              values[key] = String(s[key] ?? '');
              return values;
            }, {})
        );
        setMonth(initialLabelData.month || s.month || 'Jul');
        setYear(initialLabelData.year || s.year || CURRENT_YEAR.toString());
        setCopies(initialLabelData.copies || 1);
        if (initialLabelData.template_id) {
          setSelectedTemplateId(initialLabelData.template_id);
        }
      } else if (cats.length > 0) {
        const firstCatId = cats[0].id;
        setSelectedCategoryId(firstCatId);
        const prods = await productsApi.getAll({ category_id: firstCatId });
        setProducts(prods);
        if (prods.length > 0) {
          handleProductSelect(prods[0], cats[0], defaultTpl);
        }
      }
    } catch (err) {
      toast.error('Failed to load initial master records.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCategoryChange = async (catId: string) => {
    setSelectedCategoryId(catId);
    setSelectedProductId('');
    const cat = categories.find((c) => c.id === catId);
    try {
      const prods = await productsApi.getAll({ category_id: catId });
      setProducts(prods);
      if (prods.length > 0) {
        const tpl = templates.find((t) => t.category_id === catId) || templates.find((t) => t.id === selectedTemplateId) || templates[0];
        if (tpl) setSelectedTemplateId(tpl.id);
        handleProductSelect(prods[0], cat, tpl);
      } else {
        setGenericName(cat?.default_generic_name || '');
        setCountryOfOrigin(cat?.default_country_of_origin || settings.default_country);
        setNetQuantity(cat?.default_net_qty || '1 N');
        setPackContents(cat?.default_pack_contents || '');
        setWarranty(cat?.default_warranty || '5 Years');
        setMrp(0);
      }
    } catch (err) {
      toast.error('Failed to load products for category.');
    }
  };

  const handleProductSelect = async (prod: Product, cat?: Category, tpl?: LabelTemplate) => {
    const isPrinterProduct = Boolean(cat?.name?.toLowerCase().includes('printer') || prod.category_name?.toLowerCase().includes('printer') || prod.generic_name?.toUpperCase().includes('PRINTER'));
    const isDesktopProduct = Boolean(cat?.name?.toLowerCase().includes('desktop') || prod.generic_name?.toUpperCase().replace(/-/g, ' ') === 'DESKTOP COMPUTER');

    setSelectedProductId(prod.id);
    setProductName(prod.name);
    setBrand(prod.brand || '');
    setProductNumber(prod.product_number || '');
    setMrp(prod.default_mrp || 0);
    setTaxText(prod.tax_text || 'Incl. of all Taxes');
    setGenericName(prod.generic_name || cat?.default_generic_name || prod.name);
    setCountryOfOrigin(prod.country_of_origin || cat?.default_country_of_origin || settings.default_country);
    setNetQuantity(prod.net_quantity || cat?.default_net_qty || '1 N');
    setWarranty(prod.warranty_name || cat?.default_warranty || '5 Years');
    setPackContents(prod.pack_contents || cat?.default_pack_contents || '');
    if (isPrinterProduct) {
      const importedIn = getPrinterCustomDefaults(prod).imported_in;
      const [importedMonth, importedYear] = importedIn.split(' ');
      setMonth(importedMonth || 'January');
      setYear(importedYear || '2026');
      setCustomFieldValues((current) => ({
        ...current,
        ...Object.fromEntries(
          Object.entries(getPrinterCustomDefaults(prod)).filter(([key]) => !current[key])
        ),
      }));
    }
    if (isDesktopProduct) {
      setCustomFieldValues((current) => ({
        ...current,
        ...Object.fromEntries(
          Object.entries(getDesktopCustomDefaults()).filter(([key]) => !current[key])
        ),
      }));
    }

    const activeTpl = tpl || templates.find((t) => t.id === selectedTemplateId) || templates[0];
    if (activeTpl) {
      setWidthMm(activeTpl.width_mm);
      setHeightMm(activeTpl.height_mm);
    }

    if (prod.manufacturer_id) {
      try {
        const mfgs = await manufacturersApi.getAll();
        const mfg = mfgs.find((m) => m.id === prod.manufacturer_id);
        if (mfg) {
          setManufacturerName(mfg.name);
          setManufacturerAddress(prod.manufacturer_address || [mfg.address, mfg.city, mfg.state, mfg.pincode].filter(Boolean).join(', '));
        }
      } catch (e) {
        console.error('Error fetching manufacturer details', e);
      }
    }

    if (prod.customer_care_id) {
      try {
        const ccs = await customerCareApi.getAll();
        const cc = ccs.find((c) => c.id === prod.customer_care_id);
        if (cc) {
          setCustomerCareProfile(cc.profile_name);
          setCustomerCareAddress(cc.complaint_address || '');
          setCustomerCareEmail(cc.email || '');
          setCustomerCarePhone(cc.telephone || '');
          setCustomerCareTollFree(cc.toll_free_number || '');
          setCustomerCareWhatsApp(cc.whatsapp_number || '');
          setCustomerCareWebsite(cc.website || '');
        }
      } catch (e) {
        console.error('Error fetching customer care details', e);
      }
    }
  };

  const handleTemplateChange = (tplId: string) => {
    setSelectedTemplateId(tplId);
    const tpl = templates.find((t) => t.id === tplId);
    if (tpl) {
      setWidthMm(tpl.width_mm);
      setHeightMm(tpl.height_mm);
    }
  };

  const handleImportedRowSelect = async (row: ImportedRow) => {
    const categoryValue = getImportedValue(row, ['category', 'category name', 'label category']);
    const productValue = getImportedValue(row, ['product', 'product name', 'product model', 'model', 'item name']);
    const templateValue = getImportedValue(row, ['template', 'template name', 'label template']);

    const matchedCategory = categories.find((category) =>
      category.name.toLowerCase() === categoryValue.toLowerCase()
    );
    const matchedTemplate = templates.find((template) =>
      template.name.toLowerCase() === templateValue.toLowerCase()
    );

    let availableProducts = products;
    let matchedProduct: Product | undefined;

    if (matchedCategory) {
      setSelectedCategoryId(matchedCategory.id);
      availableProducts = await productsApi.getAll({ category_id: matchedCategory.id });
      setProducts(availableProducts);
      matchedProduct = availableProducts.find((product) =>
        product.name.toLowerCase() === productValue.toLowerCase() ||
        product.product_number?.toLowerCase() === productValue.toLowerCase()
      );
    } else {
      matchedProduct = availableProducts.find((product) =>
        product.name.toLowerCase() === productValue.toLowerCase() ||
        product.product_number?.toLowerCase() === productValue.toLowerCase()
      );
    }

    if (matchedTemplate) {
      handleTemplateChange(matchedTemplate.id);
    } else if (matchedCategory) {
      const categoryTemplate = templates.find((template) => template.category_id === matchedCategory.id);
      if (categoryTemplate) handleTemplateChange(categoryTemplate.id);
    }

    if (matchedProduct) {
      await handleProductSelect(matchedProduct, matchedCategory, matchedTemplate);
    }

    const importedMrp = getImportedValue(row, ['mrp', 'price', 'rate', 'amount']);
    const importedCopies = getImportedValue(row, ['copies', 'print copies', 'quantity', 'qty']);

    setProductName(productValue || matchedProduct?.name || productName);
    setBrand(getImportedValue(row, ['brand', 'made for', 'manufactured for']) || matchedProduct?.brand || brand);
    setProductNumber(getImportedValue(row, ['product number', 'product no', 'part no', 'sku']) || matchedProduct?.product_number || productNumber);
    setManufacturerName(getImportedValue(row, ['manufacturer', 'manufacturer name', 'manufactured by']) || manufacturerName);
    setManufacturerAddress(getImportedValue(row, ['manufacturer address', 'mfg address', 'factory address', 'plant address']) || manufacturerAddress);
    setCustomerCareProfile(getImportedValue(row, ['customer care', 'customer care profile']) || customerCareProfile);
    setCustomerCareAddress(getImportedValue(row, ['complaint address', 'customer care address']) || customerCareAddress);
    setCustomerCareEmail(getImportedValue(row, ['email', 'customer care email']) || customerCareEmail);
    setCustomerCarePhone(getImportedValue(row, ['telephone', 'tel', 'phone', 'customer care phone']) || customerCarePhone);
    setCustomerCareTollFree(getImportedValue(row, ['toll free', 'tollfree', 'other number', 'other numbers', 'customer care other numbers']) || customerCareTollFree);
    setCustomerCareWhatsApp(getImportedValue(row, ['whatsapp', 'whatsapp number']) || customerCareWhatsApp);
    setCustomerCareWebsite(getImportedValue(row, ['website', 'url']) || customerCareWebsite);
    setWarranty(getImportedValue(row, ['warranty', 'warranty coverage']) || warranty);
    setCountryOfOrigin(getImportedValue(row, ['country of origin', 'origin', 'country']) || countryOfOrigin);
    setGenericName(getImportedValue(row, ['generic name', 'generic']) || genericName);
    setNetQuantity(getImportedValue(row, ['net quantity', 'net qty', 'quantity']) || netQuantity);
    setTaxText(getImportedValue(row, ['tax text', 'tax clarification', 'tax']) || taxText);
    setPackContents(getImportedValue(row, ['pack contents', 'contents', 'package contents']) || packContents);
    setMonth(getImportedValue(row, ['month', 'mfg month', 'manufacturing month']) || month);
    setYear(getImportedValue(row, ['year', 'mfg year', 'manufacturing year']) || year);
    if (importedMrp) setMrp(parseImportedNumber(importedMrp));
    if (importedCopies) setCopies(Math.max(1, parseImportedNumber(importedCopies)));

    const activeFields = matchedTemplate?.fields || selectedTemplateFields;
    const importedCustomValues = activeFields
      .filter((field) => field.enabled && !BUILT_IN_TEMPLATE_KEYS.has(field.key))
      .reduce<Record<string, string>>((values, field) => {
        values[field.key] = getImportedValue(row, [field.key, field.label]) || field.default_value || '';
        return values;
      }, {});
    setCustomFieldValues(importedCustomValues);
    setIsAdvancedEditOpen(true);
    toast.success('Imported row loaded into label fields.');
  };

  const selectedCategoryName = categories.find((c) => c.id === selectedCategoryId)?.name || '';
  const selectedTemplateFields = withDesktopFields(
    withAioFields(
      withPrinterFields(
        templates.find((t) => t.id === selectedTemplateId)?.fields || [],
        productNumber,
        genericName
      ),
      productNumber,
      genericName
    ),
    selectedCategoryName,
    genericName
  );
  const customTemplateFields = selectedTemplateFields.filter((field) => field.enabled && !BUILT_IN_TEMPLATE_KEYS.has(field.key));
  const selectedTemplate = templates.find((t) => t.id === selectedTemplateId);
  const layoutStyle =
    selectedTemplate?.category_id === selectedCategoryId
      ? selectedTemplate.layout_style || getCategoryLayoutStyle(selectedCategoryName, productNumber, genericName)
      : getCategoryLayoutStyle(selectedCategoryName, productNumber, genericName);

  // Build live active snapshot from state variables
  const activeSnapshot: LabelSnapshot = {
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
    customerCareTollFree,
    customerCareWhatsApp,
    customerCareWebsite,
    warranty,
    countryOfOrigin,
    genericName,
    netQuantity,
    mrp: Number(mrp) || 0,
    currency: settings.default_currency,
    taxText,
    packContents,
    month,
    year,
    width_mm: Number(widthMm) || settings.default_label_width,
    height_mm: Number(heightMm) || settings.default_label_height,
    fields: selectedTemplateFields,
    layoutStyle,
  };

  const handleSaveLabel = async () => {
    if (!selectedCategoryId) {
      toast.error('Category is required.');
      return;
    }
    if (!selectedProductId) {
      toast.error('Product is required.');
      return;
    }
    if (Number(mrp) < 0) {
      toast.error('MRP cannot be negative.');
      return;
    }

    const cat = categories.find((c) => c.id === selectedCategoryId);
    const prod = products.find((p) => p.id === selectedProductId);

    const payload: Partial<SavedLabel> = {
      category_id: selectedCategoryId,
      category_name: cat?.name || '',
      product_id: selectedProductId,
      product_name: productName || prod?.name || '',
      template_id: selectedTemplateId,
      month,
      year,
      mrp: Number(mrp) || 0,
      copies: Number(copies) || 1,
      snapshot: activeSnapshot,
    };

    setIsSaving(true);
    try {
      await labelsApi.create(payload);
      toast.success('Label snapshot saved successfully!');
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to save label.');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePrint = () => {
    if (!selectedProductId && !productName) {
      toast.error('Please select or specify a product before printing.');
      return;
    }
    window.print();
  };

  const handleReset = () => {
    if (categories.length > 0) {
      handleCategoryChange(categories[0].id);
    }
    setMonth('Jul');
    setYear(CURRENT_YEAR.toString());
    setCopies(1);
    toast.info('Label reset to standard defaults.');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Create & Print Label</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Auto-fill master specifications with the flexibility to edit every single field on the fly
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
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

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: Operator Input Form (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
                  <Box className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">1. Product Selection & Auto-Fill</h3>
              </div>
              <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                <Check className="w-3 h-3" /> Auto-Fill Ready
              </span>
            </div>

            {/* Category & Product Selectors */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 uppercase tracking-wider text-[11px] mb-1.5">
                  Category <span className="text-rose-500">*</span>
                </label>
                <select
                  value={selectedCategoryId}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-hidden"
                >
                  <option value="" disabled>Select Category</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 uppercase tracking-wider text-[11px] mb-1.5">
                  Product Model <span className="text-rose-500">*</span>
                </label>
                <select
                  value={selectedProductId}
                  onChange={(e) => {
                    const p = products.find((prod) => prod.id === e.target.value);
                    if (p) handleProductSelect(p);
                  }}
                  disabled={products.length === 0}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-hidden disabled:opacity-50"
                >
                  {products.length === 0 ? (
                    <option value="">No products in category</option>
                  ) : (
                    products.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))
                  )}
                </select>
              </div>
            </div>

            {/* Template Selector */}
            <div>
              <label className="block font-semibold text-slate-700 uppercase tracking-wider text-[11px] mb-1.5">
                Label Layout & Physical Dimensions
              </label>
              <select
                value={selectedTemplateId}
                onChange={(e) => handleTemplateChange(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-hidden"
              >
                {templates.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.width_mm}×{t.height_mm} mm)
                  </option>
                ))}
              </select>
            </div>

            {/* Changing Data (Month, Year, MRP, Copies) */}
            <div className="pt-2 border-t border-slate-100">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
                2. Operator Variables & Pricing
              </h4>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block font-semibold text-slate-600 text-[10px] uppercase mb-1">
                    Month <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={month}
                    onChange={(e) => setMonth(e.target.value)}
                    className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-hidden"
                  >
                    {MONTHS.map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-600 text-[10px] uppercase mb-1">
                    Year <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-hidden"
                  >
                    {YEARS.map((y) => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-600 text-[10px] uppercase mb-1">
                    MRP ({settings.default_currency}) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    value={mrp}
                    onChange={(e) => setMrp(e.target.value)}
                    className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 font-mono focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-600 text-[10px] uppercase mb-1">
                    Print Copies
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={copies}
                    onChange={(e) => setCopies(Math.max(1, Number(e.target.value)))}
                    className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 font-mono focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-hidden"
                  />
                </div>
              </div>
            </div>

            {/* FULL EDITABLE MASTER FIELDS TOGGLE ACCORDION */}
            <div className="pt-2 border-t border-slate-100">
              <div
                onClick={() => setIsAdvancedEditOpen(!isAdvancedEditOpen)}
                className="flex items-center justify-between p-3 rounded-xl bg-blue-50/70 hover:bg-blue-100/70 border border-blue-100 cursor-pointer transition select-none"
              >
                <div className="flex items-center gap-2">
                  <Edit3 className="w-4 h-4 text-blue-600" />
                  <span className="text-xs font-bold text-blue-900">
                    3. Edit All Field Values Directly
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-blue-600 text-white font-semibold">
                    100% Editable
                  </span>
                </div>
                {isAdvancedEditOpen ? (
                  <ChevronUp className="w-4 h-4 text-blue-600" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-blue-600" />
                )}
              </div>

              {isAdvancedEditOpen && (
                <div className="mt-4 p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Product Model Name</label>
                      <input
                        type="text"
                        value={productName}
                        onChange={(e) => setProductName(e.target.value)}
                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 font-semibold focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Generic Name</label>
                      <input
                        type="text"
                        value={genericName}
                        onChange={(e) => setGenericName(e.target.value)}
                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Brand / Made For</label>
                      <input
                        type="text"
                        value={brand}
                        onChange={(e) => setBrand(e.target.value)}
                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Product Number</label>
                      <input
                        type="text"
                        value={productNumber}
                        onChange={(e) => setProductNumber(e.target.value)}
                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono text-slate-900 focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Warranty</label>
                      <input
                        type="text"
                        value={warranty}
                        onChange={(e) => setWarranty(e.target.value)}
                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Manufacturer Name</label>
                    <input
                      type="text"
                      value={manufacturerName}
                      onChange={(e) => setManufacturerName(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Manufacturer Plant Address</label>
                    <textarea
                      rows={2}
                      value={manufacturerAddress}
                      onChange={(e) => setManufacturerAddress(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Customer Care Profile</label>
                      <input
                        type="text"
                        value={customerCareProfile}
                        onChange={(e) => setCustomerCareProfile(e.target.value)}
                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Telephone</label>
                      <input
                        type="text"
                        value={customerCarePhone}
                        onChange={(e) => setCustomerCarePhone(e.target.value)}
                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Customer Care Other Number</label>
                      <input
                        type="text"
                        value={customerCareTollFree}
                        onChange={(e) => setCustomerCareTollFree(e.target.value)}
                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">WhatsApp</label>
                      <input
                        type="text"
                        value={customerCareWhatsApp}
                        onChange={(e) => setCustomerCareWhatsApp(e.target.value)}
                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Email</label>
                      <input
                        type="text"
                        value={customerCareEmail}
                        onChange={(e) => setCustomerCareEmail(e.target.value)}
                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Website</label>
                      <input
                        type="text"
                        value={customerCareWebsite}
                        onChange={(e) => setCustomerCareWebsite(e.target.value)}
                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Country of Origin</label>
                      <input
                        type="text"
                        value={countryOfOrigin}
                        onChange={(e) => setCountryOfOrigin(e.target.value)}
                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Net Quantity</label>
                      <input
                        type="text"
                        value={netQuantity}
                        onChange={(e) => setNetQuantity(e.target.value)}
                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Pack Contents</label>
                    <textarea
                      rows={2}
                      value={packContents}
                      onChange={(e) => setPackContents(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono text-slate-900 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {customTemplateFields.length > 0 && (
                    <div className="pt-3 border-t border-slate-200 space-y-3">
                      <h4 className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                        Custom Label Fields
                      </h4>
                      {customTemplateFields.map((field) => (
                        <div key={field.key}>
                          <label className="block font-semibold text-slate-700 mb-1">{field.label}</label>
                          <textarea
                            rows={field.key.includes('address') || field.key.includes('information') ? 3 : 2}
                            value={customFieldValues[field.key] ?? field.default_value ?? ''}
                            onChange={(e) =>
                              setCustomFieldValues({
                                ...customFieldValues,
                                [field.key]: e.target.value,
                              })
                            }
                            className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:ring-2 focus:ring-blue-500 leading-relaxed"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={handleSaveLabel}
                disabled={isSaving}
                className="flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-md shadow-blue-500/20 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Saving to Database...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save Label Snapshot</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setIsPreviewModalOpen(true)}
                className="py-3 px-4 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 font-semibold text-xs sm:text-sm rounded-xl transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Eye className="w-4 h-4" />
                <span>Print Preview</span>
              </button>

              <button
                type="button"
                onClick={handlePrint}
                className="py-3 px-5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-md shadow-slate-900/20 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Print ({copies})</span>
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Live Real-Time Sticker Preview (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-100 p-4 rounded-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Live Label Sticker Preview
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-slate-500 font-mono">
                  {widthMm}mm × {heightMm}mm
                </span>
                <button
                  type="button"
                  onClick={() => setIsPreviewModalOpen(true)}
                  className="p-1 text-slate-500 hover:text-blue-600 rounded-md hover:bg-slate-200 transition"
                  title="Expand Print Preview"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Preview Container with subtle 3D hover/tilt effect */}
            <motion.div
              whileHover={{ scale: 1.01 }}
              transition={{ duration: 0.2 }}
              className="flex justify-center items-center py-2 overflow-x-auto"
            >
              <div className="transform origin-top transition-transform">
                <PrintableLabel
                  snapshot={activeSnapshot}
                  copies={1}
                  isPrintMode={false}
                />
              </div>
            </motion.div>

            <p className="text-center text-[10px] text-slate-400 mt-4">
              Live representation conforming to Legal Metrology compliance standards.
            </p>
          </div>
        </div>
      </div>

      {/* Interactive Full Print Preview Modal */}
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
                    {productName || 'Sticker Print Preview'}
                  </h3>
                  <p className="text-[11px] text-slate-500 font-mono">
                    Print Layout ({widthMm}×{heightMm} mm) • Copies: {copies}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsPreviewModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 overflow-auto flex-1 flex flex-col items-center justify-start bg-slate-100/80">
              <div className="shadow-2xl rounded-xs origin-top scale-[0.78]">
                <PrintableLabel
                  snapshot={activeSnapshot}
                  copies={1}
                  isPrintMode={false}
                />
              </div>
              <p className="text-center text-[10px] text-slate-400 -mt-24">
                This exact layout will be dispatched to the physical label printer.
              </p>
            </div>

            <div className="p-4 border-t border-slate-100 flex items-center justify-end gap-2 bg-white">
              <button
                onClick={() => setIsPreviewModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl text-xs transition cursor-pointer"
              >
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

      {/* Hidden Standalone Print Container for Browser Print Window */}
      <div id="printable-label-hidden-root" className="print-hidden-root">
        <PrintableLabel
          snapshot={activeSnapshot}
          copies={copies}
          isPrintMode={true}
        />
      </div>
    </div>
  );
};
