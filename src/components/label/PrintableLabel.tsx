import React, { useLayoutEffect, useRef, useState } from 'react';
import { LabelSnapshot, TemplateField } from '../../types';

interface PrintableLabelProps {
  snapshot: LabelSnapshot;
  copies?: number;
  isPrintMode?: boolean;
}

interface AutoFitContentProps {
  children: React.ReactNode;
  observeKey: string;
  minScale?: number;
}

const AutoFitContent: React.FC<AutoFitContentProps> = ({
  children,
  observeKey,
  minScale = 0.25,
}) => {
  const frameRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useLayoutEffect(() => {
    const frame = frameRef.current;
    const content = contentRef.current;
    if (!frame || !content) return;

    const fit = () => {
      const availableWidth = frame.clientWidth;
      const availableHeight = frame.clientHeight;
      const contentWidth = content.scrollWidth;
      const contentHeight = content.scrollHeight;

      if (!availableWidth || !availableHeight || !contentWidth || !contentHeight) {
        setScale(1);
        return;
      }

      const nextScale = Math.min(
        1,
        availableWidth / contentWidth,
        availableHeight / contentHeight
      );
      setScale(Math.max(minScale, Number(nextScale.toFixed(3))));
    };

    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(frame);
    observer.observe(content);
    return () => observer.disconnect();
  }, [observeKey, minScale]);

  return (
    <div ref={frameRef} className="h-full w-full overflow-hidden">
      <div
        ref={contentRef}
        style={{
          width: scale < 1 ? `${100 / scale}%` : '100%',
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
        }}
      >
        {children}
      </div>
    </div>
  );
};

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
  const layoutStyle = String(snapshot.layoutStyle || '').toLowerCase();
  const labelStyle = snapshot.labelStyle || {};
  const isPrinterStyle =
    layoutStyle === 'printer' ||
    String(snapshot.genericName || '').toUpperCase().includes('PRINTER');
  const isAioStyle =
    layoutStyle === 'aio' ||
    String(snapshot.genericName || '').toUpperCase().replace(/-/g, ' ').includes('ALL IN ONE COMPUTER') ||
    String(snapshot.productNumber || '').toUpperCase().includes('D2UP4PT');
  const isDesktopStyle =
    layoutStyle === 'desktop' ||
    String(snapshot.genericName || '').toUpperCase().replace(/-/g, ' ') === 'DESKTOP COMPUTER';
  const labelFontFamily =
    labelStyle.fontFamily ||
    (isPrinterStyle
      ? 'Arial, Helvetica, sans-serif'
      : isAioStyle
        ? '"Arial Narrow", Arial, Helvetica, sans-serif'
        : isDesktopStyle
          ? '"Arial Narrow", "Roboto Condensed", Arial, Helvetica, sans-serif'
          : '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif');
  const currency = snapshot.currency || '₹';

  const baseLabelStyle: React.CSSProperties = {
    fontFamily: labelFontFamily,
    ...(labelStyle.fontWeight ? { fontWeight: labelStyle.fontWeight } : {}),
    ...(labelStyle.fontSizePt ? { fontSize: `${labelStyle.fontSizePt}pt` } : {}),
    ...(labelStyle.lineHeight ? { lineHeight: labelStyle.lineHeight } : {}),
    ...(labelStyle.letterSpacingPx !== undefined ? { letterSpacing: `${labelStyle.letterSpacingPx}px` } : {}),
    ...(labelStyle.wordSpacingPx !== undefined ? { wordSpacing: `${labelStyle.wordSpacingPx}px` } : {}),
    ...(labelStyle.paddingMm !== undefined ? { padding: `${labelStyle.paddingMm}mm` } : {}),
    ...(labelStyle.marginMm !== undefined ? { margin: `${labelStyle.marginMm}mm` } : {}),
    ...(labelStyle.borderWidthPx !== undefined ? { borderWidth: `${labelStyle.borderWidthPx}px` } : {}),
    ...(labelStyle.borderStyle ? { borderStyle: labelStyle.borderStyle } : {}),
    ...(labelStyle.borderColor ? { borderColor: labelStyle.borderColor } : {}),
    ...(labelStyle.borderRadiusMm !== undefined ? { borderRadius: `${labelStyle.borderRadiusMm}mm` } : {}),
  };
  const titleTextStyle: React.CSSProperties = {
    fontFamily: labelFontFamily,
    ...(labelStyle.titleBold !== undefined ? { fontWeight: labelStyle.titleBold ? 800 : 400 } : {}),
    ...(labelStyle.titleItalic !== undefined ? { fontStyle: labelStyle.titleItalic ? 'italic' : 'normal' } : {}),
    ...(labelStyle.titleUnderline !== undefined ? { textDecoration: labelStyle.titleUnderline ? 'underline' : 'none' } : {}),
  };
  const valueTextStyle: React.CSSProperties = {
    fontFamily: labelFontFamily,
    ...(labelStyle.valueBold !== undefined ? { fontWeight: labelStyle.valueBold ? 800 : 400 } : {}),
    ...(labelStyle.valueItalic !== undefined ? { fontStyle: labelStyle.valueItalic ? 'italic' : 'normal' } : {}),
    ...(labelStyle.valueUnderline !== undefined ? { textDecoration: labelStyle.valueUnderline ? 'underline' : 'none' } : {}),
  };
  const configuredLabelValueGapMm =
    typeof labelStyle.labelValueGapMm === 'number' ? labelStyle.labelValueGapMm : undefined;
  const configuredSectionGapMm =
    typeof labelStyle.sectionGapMm === 'number' ? labelStyle.sectionGapMm : undefined;
  const configuredParagraphGapMm =
    typeof labelStyle.paragraphGapMm === 'number' ? labelStyle.paragraphGapMm : undefined;
  const inlineValueStyle: React.CSSProperties = {
    ...valueTextStyle,
    ...(configuredLabelValueGapMm !== undefined ? { marginLeft: `${configuredLabelValueGapMm}mm` } : {}),
  };
  const labelTitle = (text: string) => <span className="font-semibold" style={titleTextStyle}>{text}</span>;
  const labelValue = (text: React.ReactNode) => <span style={inlineValueStyle}>{text}</span>;

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
  const snapshotCustomSections = Array.isArray(snapshot.customSections)
    ? snapshot.customSections.filter((section) => section.heading || section.content)
    : [];
  const hasConfiguredFields = Boolean(snapshot.fields && snapshot.fields.length > 0);
  const isFieldVisible = (fieldKey: string) =>
    !hasConfiguredFields || fields.some((field) => field.key === fieldKey && field.enabled);
  const getFieldLabel = (fieldKey: string, fallback: string) =>
    fields.find((field) => field.key === fieldKey)?.label || fallback;
  const fitObserveKey = JSON.stringify({
    widthMm,
    heightMm,
    layoutStyle,
    productName: snapshot.productName,
    productNumber: snapshot.productNumber,
    genericName: snapshot.genericName,
    mrp: snapshot.mrp,
    fields,
    customSections: snapshotCustomSections,
    labelStyle,
  });

  const renderCustomSections = (className = 'mt-3 space-y-1 text-[8.5pt]') => {
    if (snapshotCustomSections.length === 0) return null;
    return (
      <div className={className}>
        {snapshotCustomSections.map((section, index) => (
          <div key={`${section.heading}-${index}`} className="break-words whitespace-pre-line">
            {section.heading && <span className="font-bold" style={titleTextStyle}>{section.heading}: </span>}
            <span style={valueTextStyle}>{section.content}</span>
          </div>
        ))}
      </div>
    );
  };

  const renderFieldValue = (fieldKey: string, field: TemplateField) => {
    switch (fieldKey) {
      case 'manufactured_by':
        if (!snapshot.manufacturerName && !snapshot.manufacturerAddress) return null;
        return (
          <div key={fieldKey} className="space-y-0.5">
            <div className={`text-slate-900 ${field.bold ? 'font-bold' : 'font-medium'}`} style={titleTextStyle}>
              {field.label}:
            </div>
            <div className="text-slate-800 leading-snug" style={valueTextStyle}>
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
            <div className={`text-slate-900 ${field.bold ? 'font-bold' : 'font-medium'}`} style={titleTextStyle}>
              {field.label}:
            </div>
            <div className="text-slate-800 font-semibold leading-tight" style={valueTextStyle}>
              {snapshot.brand ? `${snapshot.brand} India` : snapshot.productName}
            </div>
          </div>
        );

      case 'for_complaints':
        if (!snapshot.customerCareProfile && !snapshot.customerCareAddress) return null;
        return (
          <div key={fieldKey} className="space-y-0.5">
            <div className={`text-slate-900 ${field.bold ? 'font-bold' : 'font-medium'}`} style={titleTextStyle}>
              {field.label}:
            </div>
            <div className="text-slate-800 leading-tight text-[9pt]" style={valueTextStyle}>
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
            <span className="font-semibold text-slate-900" style={titleTextStyle}>{field.label}: </span>
            <span className="text-slate-800" style={valueTextStyle}>{snapshot.customerCareEmail}</span>
          </div>
        );

      case 'telephone':
        if (!snapshot.customerCarePhone && !snapshot.customerCareTollFree) return null;
        return (
          <div key={fieldKey} className="leading-tight">
            <span className="font-semibold text-slate-900" style={titleTextStyle}>{field.label}: </span>
            <span className="text-slate-800" style={valueTextStyle}>{snapshot.customerCarePhone || snapshot.customerCareTollFree}</span>
          </div>
        );

      case 'whatsapp':
        if (!snapshot.customerCareWhatsApp) return null;
        return (
          <div key={fieldKey} className="leading-tight">
            <span className="font-semibold text-slate-900" style={titleTextStyle}>{field.label}: </span>
            <span className="text-slate-800" style={valueTextStyle}>{snapshot.customerCareWhatsApp}</span>
          </div>
        );

      case 'month_year':
        return (
          <div key={fieldKey} className="leading-tight pt-1">
            <div className="font-semibold text-slate-900" style={titleTextStyle}>{field.label}:</div>
            <div className="text-slate-900 font-bold" style={valueTextStyle}>
              {snapshot.month || 'Jul'} {snapshot.year || '2026'}
            </div>
          </div>
        );

      case 'mrp':
        return (
          <div key={fieldKey} className="py-1 px-2 my-1 border-y-2 border-slate-900 bg-slate-50/50">
            <div className="flex items-baseline justify-between gap-2">
              <span className="font-black text-slate-900 text-[11pt]" style={valueTextStyle}>
                MRP {currency} {Number(snapshot.mrp || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="text-[8pt] text-slate-700 font-medium italic" style={valueTextStyle}>
              {snapshot.taxText || 'Incl. of all Taxes'}
            </div>
          </div>
        );

      case 'product_number':
        if (!snapshot.productNumber && !snapshot.productName) return null;
        return (
          <div key={fieldKey} className="leading-tight">
            <div className="font-semibold text-slate-900" style={titleTextStyle}>{field.label}</div>
            <div className="font-bold text-slate-900" style={valueTextStyle}>
              {snapshot.productNumber || snapshot.productName}
            </div>
          </div>
        );

      case 'country_of_origin':
        return (
          <div key={fieldKey} className="leading-tight">
            <span className="font-semibold text-slate-900" style={titleTextStyle}>{field.label}: </span>
            <span className="text-slate-800" style={valueTextStyle}>{snapshot.countryOfOrigin || 'India'}</span>
          </div>
        );

      case 'generic_name':
        return (
          <div key={fieldKey} className="leading-tight pt-0.5">
            <span className="font-bold text-slate-900" style={titleTextStyle}>{field.label}: </span>
            <span className="font-bold text-slate-900 uppercase" style={valueTextStyle}>
              {snapshot.genericName || snapshot.productName || 'PRODUCT'}
            </span>
          </div>
        );

      case 'net_quantity':
        return (
          <div key={fieldKey} className="leading-tight">
            <span className="font-bold text-slate-900" style={titleTextStyle}>{field.label}: </span>
            <span className="text-slate-900 font-bold" style={valueTextStyle}>{snapshot.netQuantity || '1 N'}</span>
          </div>
        );

      case 'pack_contents':
        if (!snapshot.packContents) return null;
        return (
          <div key={fieldKey} className="pt-1.5 space-y-0.5 border-t border-slate-200">
            <div className="font-bold text-slate-900 text-[9pt] uppercase tracking-wider" style={titleTextStyle}>
              {field.label}:
            </div>
            <div className="text-[8.5pt] text-slate-800 leading-tight" style={valueTextStyle}>
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
              <span className={`${field.bold ? 'font-bold' : 'font-semibold'} text-slate-900`} style={titleTextStyle}>
                {field.label}: 
              </span>
              <span className={`${field.bold ? 'font-bold' : ''} text-slate-800`} style={valueTextStyle}>
                {snapshot[fieldKey] || field.default_value}
              </span>
            </div>
          );
        }
        return null;
    }
  };

  const renderPrinterSticker = (keyIndex: number) => {
    const isLandscapePrinter = heightMm <= 105;
    const printerFontSize = isLandscapePrinter ? '6.8pt' : '8.5pt';
    const printerLineHeight = isLandscapePrinter ? '1.1' : '1.18';
    const printerPadding = isLandscapePrinter ? '5mm 6mm 4mm' : '7mm 6mm 8mm';
    const importerValue = String(snapshot.importer_name || '');
    const importerSplitIndex = importerValue.toUpperCase().indexOf('NOS.');
    const importerName = importerSplitIndex > -1
      ? importerValue.slice(0, importerSplitIndex).replace(/,\s*$/, '').trim()
      : importerValue;
    const importerAddress = importerSplitIndex > -1
      ? importerValue.slice(importerSplitIndex).trim()
      : '';

    return (
      <div
        key={keyIndex}
        className={`bg-white text-black border border-slate-300 rounded-lg overflow-hidden select-none box-border flex flex-col ${
          isPrintMode ? 'print-sticker-page' : 'shadow-xl'
        }`}
        style={{
          width: `${widthMm}mm`,
          height: `${heightMm}mm`,
          minHeight: `${heightMm}mm`,
          boxSizing: 'border-box',
          padding: printerPadding,
          fontSize: printerFontSize,
          lineHeight: printerLineHeight,
          ...baseLabelStyle,
        }}
      >
      <AutoFitContent observeKey={fitObserveKey}>
      <div className={`${isLandscapePrinter ? 'space-y-0.5' : 'space-y-1'} shrink-0`}>
        {isFieldVisible('generic_name') && <div>{labelTitle('Common /Generic Name:')} {labelValue(snapshot.genericName || 'LASER MFC PRINTER')}</div>}
        {isFieldVisible('product_number') && <div>{labelTitle('Product:')} {labelValue(snapshot.productNumber || snapshot.productName || 'DCP-L5660DN')}</div>}
        {isFieldVisible('manufactured_by') && (
          <div>
            {labelTitle('Manufactured & Packed by Address:')} {labelValue(snapshot.manufacturerName || 'BROTHER INDUSTRIES (VIETNAM) LTD.')}
            {snapshot.manufacturerAddress && <div style={valueTextStyle}>{snapshot.manufacturerAddress}</div>}
          </div>
        )}
        {isFieldVisible('country_of_origin') && <div>{labelTitle('Country of Origin:')} {labelValue(snapshot.countryOfOrigin || 'Vietnam')}</div>}
        {isFieldVisible('imported_in') && <div>{labelTitle('Imported In:')} {labelValue(snapshot.imported_in || `${snapshot.month || 'January'} ${snapshot.year || '2026'}`)}</div>}
        {(isFieldVisible('net_quantity') || isFieldVisible('pack_contents')) && (
          <div>
            {labelTitle('Number of units (Quantity):')} {labelValue(`${snapshot.netQuantity || '1N'} - (${snapshot.packContents || '1N Printer, 1N Power Cable, 1N Toner, 1N Drum, 1N Guide'})`)}
          </div>
        )}
        {isFieldVisible('mrp') && (
          <div className={isLandscapePrinter ? 'pt-0.5' : 'pt-1'}>
            {labelTitle('Maximum Retail Price:')} {labelValue(`${currency} ${Number(snapshot.mrp || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })} (${snapshot.taxText || 'Inclusive of all Taxes'})`)}
          </div>
        )}
        {isFieldVisible('importer_name') && (
          <div className={isLandscapePrinter ? 'pt-0.5' : 'pt-1'}>
            {labelTitle('Importers Name & Address:')} {labelValue(importerName)}
            {importerAddress && <div style={valueTextStyle}>{importerAddress}</div>}
          </div>
        )}
        {isFieldVisible('for_complaints') && <div>{labelTitle('For Customer Complaints:')} {labelValue(snapshot.customerCareProfile || 'Customer Care Executive')}</div>}
        {isFieldVisible('for_complaints') && <div>{labelTitle('Name & Address:')} {labelValue(snapshot.customerCareAddress || 'Same as Importer Above')}</div>}
        {isFieldVisible('telephone') && <div className={isLandscapePrinter ? 'pt-0.5' : 'pt-1'}>{labelTitle('Customer Care:')} {labelValue(snapshot.customerCarePhone || '')}</div>}
        {(isFieldVisible('telephone') && (snapshot.customerCareTollFree || snapshot.customer_care_other_numbers)) && (
          <div style={valueTextStyle}>{snapshot.customerCareTollFree || snapshot.customer_care_other_numbers}</div>
        )}
        {isFieldVisible('for_complaints') && <div>{labelTitle('Website:')} {labelValue(snapshot.customerCareWebsite || snapshot.website || 'WWW.BROTHER.IN')}</div>}
        {isFieldVisible('email') && <div>{labelTitle('E-mail:')} {labelValue(snapshot.customerCareEmail || 'CUSTOMERCARE@BROTHER.IN')}</div>}
      </div>

      {isFieldVisible('recycling_information') && (
        <div className={`${isLandscapePrinter ? 'mt-2' : 'mt-4'} font-semibold shrink-0`} style={valueTextStyle}>
          {snapshot.recycling_information || 'For Recycling of your product, please visit: www.brother.in'}
        </div>
      )}
      {renderCustomSections(isLandscapePrinter ? 'mt-1 space-y-0.5 text-[6pt] font-semibold' : 'mt-3 space-y-1 text-[8pt] font-semibold')}
      </AutoFitContent>
      </div>
    );
  };

  const renderAioSticker = (keyIndex: number) => {
    const looksLikeAioProduct =
      String(snapshot.genericName || '').toUpperCase().replace(/-/g, ' ').includes('ALL IN ONE COMPUTER') ||
      String(snapshot.productNumber || '').toUpperCase().includes('D2UP4PT');
    const aioProductNumber = looksLikeAioProduct ? snapshot.productNumber : '';
    const aioGenericName = looksLikeAioProduct ? snapshot.genericName : '';
    const aioMrp = looksLikeAioProduct ? snapshot.mrp : 90000;
    const manufacturedForName = looksLikeAioProduct
      ? 'HP India Sales Private Ltd.'
      : snapshot.manufactured_for_name || `${snapshot.brand || 'HP'} India Sales Private Ltd.`;
    const manufacturerAddress =
      looksLikeAioProduct
        ? 'Plot No.3, PhaseII SIPCOT Industrial Park,DTA Sandavellur C Village,\nSriperumbudur Taluk Kanchipuram\nTamilnadu - 602106'
        : snapshot.manufacturerAddress ||
          'Plot No.3, PhaseII SIPCOT Industrial Park,DTA Sandavellur C Village,\nSriperumbudur Taluk Kanchipuram\nTamilnadu - 602106';
    const manufacturedForAddress =
      looksLikeAioProduct
        ? 'No.24, Kothari Arena,Hosur Main Road,\nAdugodi , Bangalore, Karnataka - 560030'
        : snapshot.manufactured_for_address ||
          'No.24, Kothari Arena,Hosur Main Road,\nAdugodi , Bangalore, Karnataka - 560030';
    const aioPhone = looksLikeAioProduct
      ? '1-800-258-7170'
      : snapshot.customerCarePhone || snapshot.customerCareTollFree || '1-800-258-7170';
    const aioPhoneWithSuffix = aioPhone.toLowerCase().includes('toll free') ? aioPhone : `${aioPhone} (toll free)`;
    const aioComplaintName = looksLikeAioProduct ? 'Customer Care' : snapshot.customerCareProfile || 'Customer Care';
    const aioWhatsApp = looksLikeAioProduct ? '+ 91 22 6101 4560' : snapshot.customerCareWhatsApp || '+ 91 22 6101 4560';
    const isShortAio = heightMm <= 130;
    const isNarrowAio = widthMm <= 68;
    const aioFontSize = isShortAio ? '6.8pt' : isNarrowAio ? '8.35pt' : '7.8pt';
    const aioLineHeight = isShortAio ? '1.13' : '1.2';
    const aioPadding = isShortAio ? '4mm 4mm' : '5.2mm 4.6mm';
    const aioRowLabelWidth = isNarrowAio ? '28mm' : '34mm';
    const sectionGap = isShortAio ? 'mt-1' : 'mt-1.25';
    const packTextSize = isShortAio ? '6.5pt' : '8pt';
    const aioSectionStyle: React.CSSProperties =
      configuredSectionGapMm !== undefined ? { marginTop: `${configuredSectionGapMm}mm` } : {};
    const aioParagraphStyle: React.CSSProperties =
      configuredParagraphGapMm !== undefined ? { marginTop: `${configuredParagraphGapMm}mm` } : {};
    const aioRowStyle: React.CSSProperties =
      configuredLabelValueGapMm !== undefined ? { gap: `${configuredLabelValueGapMm}mm` } : {};
    const customSections = fields
      .filter((field) => field.enabled && !builtInFieldKeys.has(field.key) && !['manufactured_for_name', 'manufactured_for_address'].includes(field.key))
      .map((field) => ({ field, value: snapshot[field.key] || field.default_value }))
      .filter(({ value }) => value);
    const mrpValue = Number(aioMrp || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 }).replace(',', ' ');

    return (
      <div
        key={keyIndex}
        className={`bg-white text-black border border-slate-300 rounded-xl overflow-hidden select-none box-border ${
          isPrintMode ? 'print-sticker-page' : 'shadow-xl'
        }`}
        style={{
          width: `${widthMm}mm`,
          height: `${heightMm}mm`,
          minHeight: `${heightMm}mm`,
          boxSizing: 'border-box',
          padding: aioPadding,
          fontSize: aioFontSize,
          fontWeight: 700,
          lineHeight: aioLineHeight,
          overflowWrap: 'anywhere',
          wordBreak: 'break-word',
          letterSpacing: '0',
          ...baseLabelStyle,
          fontFamily: labelFontFamily,
        }}
      >
        <AutoFitContent observeKey={fitObserveKey}>
        {isFieldVisible('manufactured_by') && (
          <div className="break-words whitespace-pre-line">
            <span style={titleTextStyle}>{getFieldLabel('manufactured_by', 'Manufactured By')}:&nbsp;</span>
            <span style={valueTextStyle}>{snapshot.manufacturerName || 'Flextronics Technologies India Pvt. Ltd.'}</span>
            <div style={valueTextStyle}>{manufacturerAddress}</div>
          </div>
        )}

        {(isFieldVisible('manufactured_for_name') || isFieldVisible('manufactured_for_address')) && (
          <div className={sectionGap} style={aioSectionStyle}>
            {isFieldVisible('manufactured_for_name') && (
              <>
                <span style={titleTextStyle}>{getFieldLabel('manufactured_for_name', 'Manufactured For')}:&nbsp;</span>
                <span style={valueTextStyle}>{manufacturedForName}</span>
              </>
            )}
            {isFieldVisible('manufactured_for_address') && <div style={valueTextStyle}>{manufacturedForAddress}</div>}
          </div>
        )}

        {isFieldVisible('for_complaints') && (
          <div className={sectionGap} style={aioSectionStyle}>
            <span style={titleTextStyle}>{getFieldLabel('for_complaints', 'For Complaints')}:&nbsp;</span>
            <span style={valueTextStyle}>{aioComplaintName} </span>
            <span style={valueTextStyle}>(Same address as above).Email: {snapshot.customerCareEmail || 'in.contact@hp.com'}</span>
          </div>
        )}
        {isFieldVisible('telephone') && <div className={sectionGap} style={aioSectionStyle}><span style={titleTextStyle}>{getFieldLabel('telephone', 'Tel')}: </span>{labelValue(aioPhoneWithSuffix)}</div>}
        {isFieldVisible('whatsapp') && <div className={sectionGap} style={aioSectionStyle}><span style={titleTextStyle}>{getFieldLabel('whatsapp', 'WhatsApp')}: </span>{labelValue(aioWhatsApp)}</div>}

        {isFieldVisible('month_year') && <div className={isShortAio ? 'mt-2' : 'mt-3'} style={aioParagraphStyle}><span style={titleTextStyle}>{getFieldLabel('month_year', 'Month & Year of Manufacture')}:&nbsp;</span>{labelValue(`${snapshot.month || 'Feb'} ${snapshot.year || '2026'}`)}</div>}
        {isFieldVisible('mrp') && (
          <div className="mt-0.5 flex items-baseline gap-2 whitespace-nowrap" style={aioSectionStyle}>
            <span style={titleTextStyle}>{getFieldLabel('mrp', 'MRP')}</span>
            <span
              className={isShortAio ? 'text-[10.5pt] leading-none' : 'text-[14pt] leading-none'}
              style={{ ...valueTextStyle, fontWeight: 650 }}
            >
              {currency}
            </span>
            <span style={valueTextStyle}>{mrpValue}</span>
            <span className={isShortAio ? 'text-[5.3pt]' : 'text-[6.5pt]'} style={valueTextStyle}>Incl.of all Taxes</span>
          </div>
        )}

        {(isFieldVisible('product_number') || isFieldVisible('country_of_origin') || isFieldVisible('generic_name')) && (
          <div className={isShortAio ? 'mt-2 space-y-0.5' : 'mt-3 space-y-1'} style={aioParagraphStyle}>
            {isFieldVisible('product_number') && (
              <div className="flex gap-2" style={aioRowStyle}>
                <span className="shrink-0" style={{ width: aioRowLabelWidth, ...titleTextStyle }}>{getFieldLabel('product_number', 'Product No')} :</span>
                <span className="min-w-0 break-words" style={valueTextStyle}>{aioProductNumber || 'D2UP4PT#ACJ'}</span>
              </div>
            )}
            {isFieldVisible('country_of_origin') && (
              <div className="flex gap-2" style={aioRowStyle}>
                <span className="shrink-0" style={{ width: aioRowLabelWidth, ...titleTextStyle }}>{getFieldLabel('country_of_origin', 'Country of Origin')} :</span>
                <span className="min-w-0 break-words" style={valueTextStyle}>{snapshot.countryOfOrigin || 'India'}</span>
              </div>
            )}
            {isFieldVisible('generic_name') && (
              <div className="flex gap-2" style={aioRowStyle}>
                <span className="shrink-0" style={{ width: aioRowLabelWidth, ...titleTextStyle }}>{getFieldLabel('generic_name', 'Generic Name')} :</span>
                <span className="min-w-0 break-words" style={valueTextStyle}>{aioGenericName || 'ALL IN ONE COMPUTER'}</span>
              </div>
            )}
          </div>
        )}

        {isFieldVisible('net_quantity') && <div className={isShortAio ? 'mt-2 text-[10pt]' : 'mt-4 text-[12pt]'} style={aioParagraphStyle}><span style={titleTextStyle}>{getFieldLabel('net_quantity', 'Net Qty')}:&nbsp;&nbsp;</span>{labelValue(snapshot.netQuantity || '1 N')}</div>}

        {isFieldVisible('pack_contents') && (
          <div className={isShortAio ? 'mt-4 whitespace-pre-line' : 'mt-6 whitespace-pre-line'} style={{ fontSize: packTextSize, lineHeight: isShortAio ? 1.1 : 1.18, ...valueTextStyle, ...aioParagraphStyle }}>
            [{snapshot.packContents || '60.45 CM ALL IN ONE COMPUTER 1N,\nCENTRAL PROCESSING UNIT 1N,\nCABLE SET 1N,\nTOWERSTAND 1N,KEYBOARD 1N,MOUSE 1N'}]
          </div>
        )}

        {customSections.length > 0 && (
          <div className={isShortAio ? 'mt-2 space-y-0.5 text-[6.3pt]' : 'mt-3 space-y-1 text-[7.5pt]'}>
            {customSections.map(({ field, value }) => (
              <div key={field.key}>
                <span style={titleTextStyle}>{field.label}: </span>
                <span style={valueTextStyle}>{value}</span>
              </div>
            ))}
          </div>
        )}
        {renderCustomSections(isShortAio ? 'mt-2 space-y-0.5 text-[6.3pt]' : 'mt-3 space-y-1 text-[7.5pt]')}
        </AutoFitContent>
      </div>
    );
  };

  const renderDesktopSticker = (keyIndex: number) => {
    const isNarrowDesktop = widthMm <= 70;
    const desktopFontSize = isNarrowDesktop ? '9pt' : '10.5pt';
    const desktopLineHeight = isNarrowDesktop ? 1.08 : 1.12;
    const desktopPadding = isNarrowDesktop ? '5mm 4.5mm' : '6mm 5.5mm';
    const labelColumnWidth = isNarrowDesktop ? '28mm' : '34mm';
    const manufacturedForName = snapshot.manufactured_for_name || snapshot.brand || 'HP India Sales Private Ltd.';
    const manufacturedForAddress = snapshot.manufactured_for_address || snapshot.manufacturedForAddress || 'No. 24, Kothari Arena, Hosur Main Road, Adugodi, Banglore,Karnataka - 560030.';
    const complaintText = snapshot.customerCareProfile || 'Customer Care';
    const complaintAddress = snapshot.customerCareAddress || 'Same address as above';
    const genericNote = snapshot.generic_note || '(EXCLUDING MONITOR)';
    const formattedMrp = Number(snapshot.mrp || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 });

    const row = (label: string, value: React.ReactNode, key: string, extraClass = '') => (
      <div key={key} className={`grid grid-cols-[var(--label-col)_1fr] gap-x-2 leading-[inherit] ${extraClass}`}>
        <span className="font-bold" style={titleTextStyle}>{label}</span>
        <span className="min-w-0 break-words" style={valueTextStyle}>{value}</span>
      </div>
    );

    return (
      <div
        key={keyIndex}
        className={`bg-white text-slate-950 border border-slate-300 rounded-lg overflow-hidden select-none box-border ${
          isPrintMode ? 'print-sticker-page' : 'shadow-xl'
        }`}
        style={{
          ['--label-col' as string]: labelColumnWidth,
          width: `${widthMm}mm`,
          height: `${heightMm}mm`,
          minHeight: `${heightMm}mm`,
          boxSizing: 'border-box',
          padding: desktopPadding,
          fontSize: desktopFontSize,
          fontWeight: 700,
          lineHeight: desktopLineHeight,
          letterSpacing: '0',
          overflowWrap: 'anywhere',
          wordBreak: 'break-word',
          ...baseLabelStyle,
        }}
      >
        <AutoFitContent observeKey={fitObserveKey}>
        <div className="flex h-full min-h-0 flex-col justify-between gap-2">
          <div className="space-y-1.5">
            {isFieldVisible('manufactured_by') && (
              <div>
                <span className="font-bold" style={titleTextStyle}>Manufactured By:&nbsp;</span>
                <span style={valueTextStyle}>{snapshot.manufacturerName || 'Flextronics Technologies India Pvt. Ltd.'}</span>
                {snapshot.manufacturerAddress && <span style={valueTextStyle}> {snapshot.manufacturerAddress}</span>}
              </div>
            )}

            {(isFieldVisible('manufactured_for') || isFieldVisible('manufactured_for_name')) && (
              <div>
                <span className="font-bold" style={titleTextStyle}>Manufactured For:&nbsp;</span>
                <span style={valueTextStyle}>{manufacturedForName}</span>
                {manufacturedForAddress && <span style={valueTextStyle}> {manufacturedForAddress}</span>}
              </div>
            )}

            {isFieldVisible('for_complaints') && (
              <div>
                <span className="font-bold" style={titleTextStyle}>For Complaints :&nbsp;</span>
                <span style={valueTextStyle}>{complaintText}</span>
                {complaintAddress && <span style={valueTextStyle}> ({complaintAddress})</span>}
                {snapshot.customerCareEmail && <span style={valueTextStyle}>, Email: {snapshot.customerCareEmail}</span>}
              </div>
            )}

            {isFieldVisible('telephone') && row('Tel:', `${snapshot.customerCarePhone || snapshot.customerCareTollFree || '1-800-258-7170'} (toll free)`, 'telephone')}
            {isFieldVisible('whatsapp') && row('WhatsApp:', snapshot.customerCareWhatsApp || '+91 22 6101 4560', 'whatsapp')}
            {isFieldVisible('month_year') && row('Month & Year of Manufacture :', `${snapshot.month || 'Jul'} ${snapshot.year || '2026'}`, 'month_year')}
            {isFieldVisible('mrp') && (
              <div className="grid grid-cols-[auto_1fr_auto] items-baseline gap-x-2">
                <span className="font-bold" style={titleTextStyle}>MRP</span>
                <span className="font-bold" style={valueTextStyle}>{currency} {formattedMrp}</span>
                <span className="font-normal italic" style={valueTextStyle}>{snapshot.taxText || 'Incl. of all Taxes'}</span>
              </div>
            )}
            {isFieldVisible('product_number') && row('Product no:', snapshot.productNumber || snapshot.productName || 'D1VT0AT#ACJ', 'product_number')}
            {isFieldVisible('country_of_origin') && row('Country of Origin:', snapshot.countryOfOrigin || 'India', 'country_of_origin')}
            {isFieldVisible('generic_name') && row('Generic Name:', snapshot.genericName || 'DESKTOP COMPUTER', 'generic_name')}
            {isFieldVisible('net_quantity') && row('Net Qty:', <>{snapshot.netQuantity || '1 N'} <span className="font-normal italic">{genericNote}</span></>, 'net_quantity')}
          </div>

          {isFieldVisible('pack_contents') && snapshot.packContents && (
            <div className="whitespace-pre-line pt-2 text-[0.92em]" style={valueTextStyle}>
              ({snapshot.packContents})
            </div>
          )}
        </div>
        </AutoFitContent>
      </div>
    );
  };

  const renderStandardSticker = (keyIndex: number) => {
    const isNarrowStandard = widthMm <= 70;
    const standardPadding = isNarrowStandard ? '4mm 4.5mm' : '6mm 7mm';
    const standardFontSize = isNarrowStandard ? '6.8pt' : '9pt';
    const standardLineHeight = isNarrowStandard ? '1.13' : '1.25';
    const standardContentGap = isNarrowStandard ? 'space-y-1' : 'space-y-2';

    return (
    <div
      key={keyIndex}
      className={`bg-white text-slate-900 border-2 border-slate-900 rounded-xs flex flex-col overflow-hidden select-none box-border ${
        isPrintMode ? 'print-sticker-page' : 'shadow-xl'
      }`}
      style={{
        width: `${widthMm}mm`,
        height: `${heightMm}mm`,
        minHeight: `${heightMm}mm`,
        boxSizing: 'border-box',
        padding: standardPadding,
        fontSize: standardFontSize,
        lineHeight: standardLineHeight,
        ...baseLabelStyle,
      }}
    >
      <AutoFitContent observeKey={fitObserveKey}>
      {/* Label Header / Brand Bar */}
      <div
        className={`${standardContentGap} flex-1 min-h-0`}
        style={isNarrowStandard ? ({ zoom: 0.76 } as React.CSSProperties) : undefined}
      >
        {fields
          .filter((f) => f.enabled)
          .map((f) => renderFieldValue(f.key, f))}
        {renderCustomSections()}
      </div>
      </AutoFitContent>

    </div>
    );
  };

  const renderSingleSticker = (keyIndex: number) => isPrinterStyle ? renderPrinterSticker(keyIndex) : isAioStyle ? renderAioSticker(keyIndex) : isDesktopStyle ? renderDesktopSticker(keyIndex) : renderStandardSticker(keyIndex);

  // In print mode, duplicate across copies
  const copiesArray = Array.from({ length: Math.max(1, copies) }, (_, i) => i);

  return (
    <div className={isPrintMode ? 'print-only-area' : 'preview-container flex flex-col items-center'}>
      {copiesArray.map((copyIdx) => renderSingleSticker(copyIdx))}
    </div>
  );
};
