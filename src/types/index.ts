export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  badgeId?: string;
  station?: string;
  avatar?: string;
}

export type UserRole = 'ADMIN' | 'OPERATOR' | 'AUDITOR' | 'admin' | 'operator' | 'auditor';

export interface Category {
  id: string;
  name: string;
  code?: string;
  modelsCount?: number;
  active?: boolean;
  hsn?: string;
  targetStandard?: string;
  serialRule?: string;
  eWasteRule?: string;
  description?: string;
  default_warranty?: string;
  default_generic_name?: string;
  default_country_of_origin?: string;
  default_net_qty?: string;
  default_pack_contents?: string;
  product_count?: number;
  created_at?: string;
  updated_at?: string;
}

export interface Manufacturer {
  id: string;
  name: string;
  address: string;
  city?: string;
  state?: string;
  pincode?: string;
  country?: string;
  phone?: string;
  email?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CustomerCare {
  id: string;
  profile_name: string;
  complaint_text?: string;
  complaint_address?: string;
  email?: string;
  telephone?: string;
  toll_free_number?: string;
  whatsapp_number?: string;
  website?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Warranty {
  id: string;
  name: string;
  duration: string;
  created_at?: string;
  updated_at?: string;
}

export interface Product {
  id: string;
  name: string;
  category_id: string;
  category_name?: string;
  brand?: string;
  product_number?: string;
  manufacturer_id: string;
  manufacturer_name?: string;
  manufacturer_address?: string;
  importer_name?: string;
  imported_in?: string;
  customer_care_other_numbers?: string;
  recycling_information?: string;
  customer_care_id?: string;
  customer_care_name?: string;
  warranty_id?: string;
  warranty_name?: string;
  country_of_origin?: string;
  generic_name?: string;
  net_quantity?: string;
  default_mrp: number;
  tax_text?: string;
  pack_contents?: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
}

export interface TemplateField {
  key: string;
  label: string;
  default_value?: string;
  enabled: boolean;
  font_size: number;
  bold: boolean;
  alignment: 'left' | 'center' | 'right';
  order: number;
}

export interface LabelTemplate {
  id: string;
  name: string;
  category_id?: string;
  category_name?: string;
  width_mm?: number;
  height_mm?: number;
  widthMm?: number;
  heightMm?: number;
  fields?: TemplateField[];
  layout_style?: 'standard' | 'printer' | 'aio' | string;
  is_default?: boolean;
  version?: string;
  dimensions?: string;
  dpi?: number;
  mediaType?: string;
  fieldsCount?: number;
  zeroBarcodeEnforced?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ProductModel {
  id: string;
  sku?: string;
  productNo?: string;
  name: string;
  categoryCode: string;
  categoryName: string;
  brand?: string;
  plant?: string;
  plantCode?: string;
  supportContact?: string;
  warranty?: string;
  defaultTemplate?: string;
  status?: string;
  mrp?: string;
  defaultMrp?: string;
  mfgMonthYear?: string;
  powerRating?: string;
  manufacturedBy?: string;
  manufacturedByAddress?: string;
  manufacturedFor?: string;
  manufacturedForAddress?: string;
  complaintAddress?: string;
  email?: string;
  tollFree?: string;
  whatsapp?: string;
  website?: string;
  countryOfOrigin?: string;
  genericName?: string;
  packContents?: string;
  bisCode?: string;
  [key: string]: any;
}

export interface PrintJob {
  id: string;
  productModel: string;
  spec?: string;
  category?: string;
  hsn?: string;
  templateTarget?: string;
  batchQty?: number;
  totalQty?: number;
  status: string;
  mrp?: string;
  mfgDate?: string;
  timestamp?: string;
  checksum?: string;
  [key: string]: any;
}

export interface SnapshotAuditRecord {
  id?: string;
  [key: string]: any;
}

export interface LinePrinterTelemetry {
  [key: string]: any;
}

export interface LabelSnapshot {
  productName?: string;
  brand?: string;
  productNumber?: string;
  manufacturerName?: string;
  manufacturerAddress?: string;
  customerCareProfile?: string;
  customerCareAddress?: string;
  customerCareEmail?: string;
  customerCarePhone?: string;
  customerCareTollFree?: string;
  customerCareWhatsApp?: string;
  customerCareWebsite?: string;
  warranty?: string;
  countryOfOrigin?: string;
  genericName?: string;
  netQuantity?: string;
  defaultMRP?: number;
  mrp?: number;
  currency?: string;
  taxText?: string;
  packContents?: string;
  month?: string;
  year?: string;
  width_mm?: number;
  height_mm?: number;
  fields?: TemplateField[];
  layoutStyle?: 'standard' | 'printer' | 'aio' | string;
  labelStyle?: {
    fontFamily?: string;
    fontWeight?: number | string;
    fontSizePt?: number;
    lineHeight?: number;
    letterSpacingPx?: number;
    wordSpacingPx?: number;
    paddingMm?: number;
    marginMm?: number;
    borderWidthPx?: number;
    borderStyle?: 'solid' | 'dashed' | 'dotted' | 'double' | 'none' | string;
    borderColor?: string;
    borderRadiusMm?: number;
    titleBold?: boolean;
    titleItalic?: boolean;
    titleUnderline?: boolean;
    valueBold?: boolean;
    valueItalic?: boolean;
    valueUnderline?: boolean;
  };
  customSections?: Array<{
    heading: string;
    content: string;
  }>;
  [key: string]: any;
}

export interface SavedLabel {
  id: string;
  category_id: string;
  category_name: string;
  product_id: string;
  product_name: string;
  template_id?: string;
  month: string;
  year: string;
  mrp: number;
  copies: number;
  snapshot: LabelSnapshot;
  created_by?: string;
  created_at?: string;
}

export interface AppSettings {
  id?: string;
  app_name: string;
  company_name: string;
  logo_url?: string;
  default_currency: string;
  default_country: string;
  default_label_width: number;
  default_label_height: number;
  updated_at?: string;
}

export interface DashboardStats {
  total_categories: number;
  total_products: number;
  total_manufacturers: number;
  total_templates: number;
  total_labels_created: number;
  recent_labels: Array<{
    id: string;
    product_name: string;
    category_name: string;
    month: string;
    year: string;
    mrp: number;
    created_at: string;
  }>;
}

export type NavigationPath =
  | 'dashboard'
  | 'categories'
  | 'products'
  | 'manufacturers'
  | 'customer-care'
  | 'warranty'
  | 'templates'
  | 'create-label'
  | 'import-labels'
  | 'edit-label'
  | 'saved-labels'
  | 'settings'
  | 'login'
  | 'template-library'
  | 'manufacturers-plants'
  | 'line-settings';
