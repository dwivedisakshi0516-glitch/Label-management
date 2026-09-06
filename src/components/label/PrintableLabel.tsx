import React from 'react';
import { LabelSnapshot, TemplateField } from '../../types';

interface PrintableLabelProps {
  snapshot: LabelSnapshot;
  copies?: number;
  isPrintMode?: boolean;
}

export const PrintableLabel: React.FC<PrintableLabelProps> = ({
  snapshot,
  copies = 1,
  isPrintMode = false,
}) => {
  const builtInFieldKeys = new Set([
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
  const widthMm = snapshot.width_mm || 100;
  const heightMm = snapshot.height_mm || 150;
  const currency = snapshot.currency || '₹';

  const fields: TemplateField[] =
    snapshot.fields && snapshot.fields.length > 0
      ? [...snapshot.fields].sort((a, b) => a.order - b.order)
      : [
          { key: 'manufactured_by', label: 'Manufactured By', enabled: true, font_size: 10, bold: true, alignment: 'left', order: 1 },
          { key: 'manufactured_for', label: 'Manufactured For', enabled: true, font_size: 10, bold: true, alignment: 'left', order: 2 },
          { key: 'for_complaints', label: 'For Complaints', enabled: true, font_size: 10, bold: true, alignment: 'left', order: 3 },
          { key: 'email', label: 'Email', enabled: true, font_size: 9, bold: false, alignment: 'left', order: 4 },
          { key: 'telephone', label: 'Tel', enabled: true, font_size: 9, bold: false, alignment: 'left', order: 5 },
          { key: 'whatsapp', label: 'WhatsApp', enabled: true, font_size: 9, bold: false, alignment: 'left', order: 6 },
          { key: 'month_year', label: 'Month & Year of Manufacture', enabled: true, font_size: 10, bold: true, alignment: 'left', order: 7 },
          { key: 'mrp', label: 'MRP', enabled: true, font_size: 12, bold: true, alignment: 'left', order: 8 },
          { key: 'product_number', label: 'Product No.', enabled: true, font_size: 10, bold: true, alignment: 'left', order: 9 },
          { key: 'country_of_origin', label: 'Country of Origin', enabled: true, font_size: 9, bold: false, alignment: 'left', order: 10 },
          { key: 'generic_name', label: 'Generic Name', enabled: true, font_size: 10, bold: true, alignment: 'left', order: 11 },
          { key: 'net_quantity', label: 'Net Qty', enabled: true, font_size: 9, bold: false, alignment: 'left', order: 12 },
          { key: 'pack_contents', label: 'Pack Contents', enabled: true, font_size: 9, bold: false, alignment: 'left', order: 13 },
        ];

  const renderFieldValue = (fieldKey: string, field: TemplateField) => {
    switch (fieldKey) {
      case 'manufactured_by':
        if (!snapshot.manufacturerName && !snapshot.manufacturerAddress) return null;
        return (
          <div key={fieldKey} className="space-y-0.5">
            <div className={`text-slate-900 ${field.bold ? 'font-bold' : 'font-medium'}`}>
              {field.label}:
            </div>
            <div className="text-slate-800 leading-snug">
              {snapshot.manufacturerName && <div className="font-semibold">{snapshot.manufacturerName}</div>}
              {snapshot.manufacturerAddress && (
                <div className="text-[9pt] text-slate-700 leading-tight">{snapshot.manufacturerAddress}</div>
              )}
            </div>
          </div>
        );

      case 'manufactured_for':
        if (!snapshot.brand && !snapshot.productName) return null;
        return (
          <div key={fieldKey} className="space-y-0.5">
            <div className={`text-slate-900 ${field.bold ? 'font-bold' : 'font-medium'}`}>
              {field.label}:
            </div>
            <div className="text-slate-800 font-semibold leading-tight">
              {snapshot.brand ? `${snapshot.brand} India` : snapshot.productName}
            </div>
          </div>
        );

      case 'for_complaints':
        if (!snapshot.customerCareProfile && !snapshot.customerCareAddress) return null;
        return (
          <div key={fieldKey} className="space-y-0.5">
            <div className={`text-slate-900 ${field.bold ? 'font-bold' : 'font-medium'}`}>
              {field.label}:
            </div>
            <div className="text-slate-800 leading-tight text-[9pt]">
              {snapshot.customerCareProfile && (
                <div className="font-semibold">{snapshot.customerCareProfile}</div>
              )}
              {snapshot.customerCareAddress && (
                <div className="text-slate-700">{snapshot.customerCareAddress}</div>
              )}
            </div>
          </div>
        );

      case 'email':
        if (!snapshot.customerCareEmail) return null;
        return (
          <div key={fieldKey} className="leading-tight">
            <span className="font-semibold text-slate-900">{field.label}: </span>
            <span className="text-slate-800">{snapshot.customerCareEmail}</span>
          </div>
        );

      case 'telephone':
        if (!snapshot.customerCarePhone && !snapshot.customerCareTollFree) return null;
        return (
          <div key={fieldKey} className="leading-tight">
            <span className="font-semibold text-slate-900">{field.label}: </span>
            <span className="text-slate-800">{snapshot.customerCarePhone || snapshot.customerCareTollFree}</span>
          </div>
        );

      case 'whatsapp':
        if (!snapshot.customerCareWhatsApp) return null;
        return (
          <div key={fieldKey} className="leading-tight">
            <span className="font-semibold text-slate-900">{field.label}: </span>
            <span className="text-slate-800">{snapshot.customerCareWhatsApp}</span>
          </div>
        );

      case 'month_year':
        return (
          <div key={fieldKey} className="leading-tight pt-1">
            <div className="font-semibold text-slate-900">{field.label}:</div>
            <div className="text-slate-900 font-bold">
              {snapshot.month || 'Jul'} {snapshot.year || '2026'}
            </div>
          </div>
        );

      case 'mrp':
        return (
          <div key={fieldKey} className="py-1 px-2 my-1 border-y-2 border-slate-900 bg-slate-50/50">
            <div className="flex items-baseline justify-between gap-2">
              <span className="font-black text-slate-900 text-[11pt]">
                MRP {currency} {Number(snapshot.mrp || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="text-[8pt] text-slate-700 font-medium italic">
              {snapshot.taxText || 'Incl. of all Taxes'}
            </div>
          </div>
        );

      case 'product_number':
        if (!snapshot.productNumber && !snapshot.productName) return null;
        return (
          <div key={fieldKey} className="leading-tight">
            <div className="font-semibold text-slate-900">{field.label}</div>
            <div className="font-mono font-bold text-slate-900">
              {snapshot.productNumber || snapshot.productName}
            </div>
          </div>
        );

      case 'country_of_origin':
        return (
          <div key={fieldKey} className="leading-tight">
            <span className="font-semibold text-slate-900">{field.label}: </span>
            <span className="text-slate-800">{snapshot.countryOfOrigin || 'India'}</span>
          </div>
        );

      case 'generic_name':
        return (
          <div key={fieldKey} className="leading-tight pt-0.5">
            <span className="font-bold text-slate-900">{field.label}: </span>
            <span className="font-bold text-slate-900 uppercase">
              {snapshot.genericName || snapshot.productName || 'PRODUCT'}
            </span>
          </div>
        );

      case 'net_quantity':
        return (
          <div key={fieldKey} className="leading-tight">
            <span className="font-bold text-slate-900">{field.label}: </span>
            <span className="text-slate-900 font-bold">{snapshot.netQuantity || '1 N'}</span>
          </div>
        );

      case 'pack_contents':
        if (!snapshot.packContents) return null;
        return (
          <div key={fieldKey} className="pt-1.5 space-y-0.5 border-t border-slate-200">
            <div className="font-bold text-slate-900 text-[9pt] uppercase tracking-wider">
              {field.label}:
            </div>
            <div className="text-[8.5pt] text-slate-800 leading-tight font-sans">
              ({snapshot.packContents})
            </div>
          </div>
        );

      default:
        if (!builtInFieldKeys.has(fieldKey) && (snapshot[fieldKey] || field.default_value)) {
          return (
            <div
              key={fieldKey}
              className="leading-tight"
              style={{ fontSize: `${field.font_size || 10}pt`, textAlign: field.alignment }}
            >
              <span className={`${field.bold ? 'font-bold' : 'font-semibold'} text-slate-900`}>
                {field.label}: 
              </span>
              <span className={`${field.bold ? 'font-bold' : ''} text-slate-800`}>
                {snapshot[fieldKey] || field.default_value}
              </span>
            </div>
          );
        }
        return null;
    }
  };

  const renderSingleSticker = (keyIndex: number) => (
    <div
      key={keyIndex}
      className={`bg-white text-slate-900 border-2 border-slate-900 rounded-xs flex flex-col justify-between overflow-hidden select-none box-border ${
        isPrintMode ? 'print-sticker-page' : 'shadow-xl'
      }`}
      style={{
        width: `${widthMm}mm`,
        minHeight: `${heightMm}mm`,
        padding: '6mm 7mm',
        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        fontSize: '9pt',
        lineHeight: '1.25',
      }}
    >
      {/* Label Header / Brand Bar */}
      <div className="space-y-2 flex-1">
        {fields
          .filter((f) => f.enabled)
          .map((f) => renderFieldValue(f.key, f))}
      </div>

    </div>
  );

  // In print mode, duplicate across copies
  const copiesArray = Array.from({ length: Math.max(1, copies) }, (_, i) => i);

  return (
    <div className={isPrintMode ? 'print-only-area' : 'preview-container flex flex-col items-center'}>
      {copiesArray.map((copyIdx) => renderSingleSticker(copyIdx))}
    </div>
  );
};
