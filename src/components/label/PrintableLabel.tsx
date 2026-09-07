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
  const layoutStyle = String(snapshot.layoutStyle || '').toLowerCase();
  const labelStyle = snapshot.labelStyle || {};
  const isPrinterStyle =
    layoutStyle === 'printer' ||
    String(snapshot.genericName || '').toUpperCase().includes('LASER MFC PRINTER') ||
    Boolean(snapshot.barcode_text);
  const isAioStyle =
    layoutStyle === 'aio' ||
    String(snapshot.genericName || '').toUpperCase().replace(/-/g, ' ').includes('ALL IN ONE COMPUTER') ||
    String(snapshot.productNumber || '').toUpperCase().includes('D2UP4PT');
  const currency = snapshot.currency || '₹';

  const baseLabelStyle: React.CSSProperties = {
    ...(labelStyle.fontFamily ? { fontFamily: labelStyle.fontFamily } : {}),
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
    ...(labelStyle.titleBold !== undefined ? { fontWeight: labelStyle.titleBold ? 800 : 400 } : {}),
    ...(labelStyle.titleItalic !== undefined ? { fontStyle: labelStyle.titleItalic ? 'italic' : 'normal' } : {}),
    ...(labelStyle.titleUnderline !== undefined ? { textDecoration: labelStyle.titleUnderline ? 'underline' : 'none' } : {}),
  };
  const valueTextStyle: React.CSSProperties = {
    ...(labelStyle.valueBold !== undefined ? { fontWeight: labelStyle.valueBold ? 800 : 400 } : {}),
    ...(labelStyle.valueItalic !== undefined ? { fontStyle: labelStyle.valueItalic ? 'italic' : 'normal' } : {}),
    ...(labelStyle.valueUnderline !== undefined ? { textDecoration: labelStyle.valueUnderline ? 'underline' : 'none' } : {}),
  };
  const labelTitle = (text: string) => <span className="font-semibold" style={titleTextStyle}>{text}</span>;
  const labelValue = (text: React.ReactNode) => <span style={valueTextStyle}>{text}</span>;

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
            <div className="font-mono font-bold text-slate-900" style={valueTextStyle}>
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
            <div className="text-[8.5pt] text-slate-800 leading-tight font-sans" style={valueTextStyle}>
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

  const barcodeValue = String(snapshot.barcode_text || '8C5L5L00145');
  const barcodeBars = Array.from({ length: 64 }, (_, index) => {
    const code = barcodeValue.charCodeAt(index % barcodeValue.length) || 49;
    return 1 + ((code + index) % 4);
  });

  const renderPrinterSticker = (keyIndex: number) => {
    const isLandscapePrinter = heightMm <= 105;
    const printerFontSize = isLandscapePrinter ? '6.8pt' : '8.5pt';
    const printerLineHeight = isLandscapePrinter ? '1.1' : '1.18';
    const printerPadding = isLandscapePrinter ? '5mm 6mm 4mm' : '7mm 6mm 8mm';
    const barcodeHeight = isLandscapePrinter ? 24 : 42;
    const barcodeTextSize = isLandscapePrinter ? '5.8pt' : '8pt';

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
          fontFamily: 'Arial, Helvetica, sans-serif',
          fontSize: printerFontSize,
          lineHeight: printerLineHeight,
          ...baseLabelStyle,
        }}
      >
      <div className={`${isLandscapePrinter ? 'space-y-0.5' : 'space-y-1'} shrink-0`}>
        <div>{labelTitle('Common /Generic Name:')} {labelValue(snapshot.genericName || 'LASER MFC PRINTER')}</div>
        <div>{labelTitle('Product:')} {labelValue(snapshot.productNumber || snapshot.productName || 'DCP-L5660DN')}</div>
        <div>
          {labelTitle('Manufactured & Packed by Address:')} {labelValue(snapshot.manufacturerName || 'BROTHER INDUSTRIES (VIETNAM) LTD.')}
          {snapshot.manufacturerAddress && <div style={valueTextStyle}>{snapshot.manufacturerAddress}</div>}
        </div>
        <div>{labelTitle('Country of Origin:')} {labelValue(snapshot.countryOfOrigin || 'Vietnam')}</div>
        <div>{labelTitle('Imported In:')} {labelValue(snapshot.imported_in || `${snapshot.month || 'January'} ${snapshot.year || '2026'}`)}</div>
        <div>
          {labelTitle('Number of units (Quantity):')} {labelValue(`${snapshot.netQuantity || '1N'} - (${snapshot.packContents || '1N Printer, 1N Power Cable, 1N Toner, 1N Drum, 1N Guide'})`)}
        </div>
        <div className={isLandscapePrinter ? 'pt-0.5' : 'pt-1'}>
          {labelTitle('Maximum Retail Price:')} {labelValue(`${currency} ${Number(snapshot.mrp || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })} (${snapshot.taxText || 'Inclusive of all Taxes'})`)}
        </div>
        <div className={isLandscapePrinter ? 'pt-0.5' : 'pt-1'}>{labelTitle('Importers Name & Address:')} {labelValue(snapshot.importer_name || '')}</div>
        <div>{labelTitle('For Customer Complaints:')} {labelValue(snapshot.customerCareProfile || 'Customer Care Executive')}</div>
        <div>{labelTitle('Name & Address:')} {labelValue(snapshot.customerCareAddress || 'Same as Importer Above')}</div>
        <div className={isLandscapePrinter ? 'pt-0.5' : 'pt-1'}>{labelTitle('Customer Care:')} {labelValue(snapshot.customerCarePhone || '')}</div>
        {(snapshot.customerCareTollFree || snapshot.customer_care_other_numbers) && (
          <div style={valueTextStyle}>{snapshot.customerCareTollFree || snapshot.customer_care_other_numbers}</div>
        )}
        <div>{labelTitle('Website:')} {labelValue(snapshot.customerCareWebsite || snapshot.website || 'WWW.BROTHER.IN')}</div>
        <div>{labelTitle('E-mail:')} {labelValue(snapshot.customerCareEmail || 'CUSTOMERCARE@BROTHER.IN')}</div>
        <div className={isLandscapePrinter ? 'pt-0.5' : 'pt-1'}>{labelTitle('Barcode:')}</div>
      </div>

      <div className={isLandscapePrinter ? 'mt-1 flex flex-col items-center shrink-0' : 'mt-1 flex flex-col items-center shrink-0'}>
        <div className="flex items-end gap-px bg-white px-1" style={{ height: `${barcodeHeight}px` }}>
          {barcodeBars.map((barWidth, index) => (
            <span
              key={index}
              className="block bg-black"
              style={{
                width: `${isLandscapePrinter ? Math.max(1, barWidth - 1) : barWidth}px`,
                height: `${index % 7 === 0 ? barcodeHeight : barcodeHeight - 6 + (index % 5)}px`,
              }}
            />
          ))}
        </div>
        <div className="font-mono tracking-[0.25em] mt-0.5" style={{ fontSize: barcodeTextSize }}>* {barcodeValue.split('').join(' ')} *</div>
      </div>

      <div className={`${isLandscapePrinter ? 'mt-2' : 'mt-4'} font-semibold shrink-0`} style={valueTextStyle}>
        {snapshot.recycling_information || 'For Recycling of your product, please visit: www.brother.in'}
      </div>
      {renderCustomSections(isLandscapePrinter ? 'mt-1 space-y-0.5 text-[6pt] font-semibold' : 'mt-3 space-y-1 text-[8pt] font-semibold')}
      </div>
    );
  };

  const renderAioSticker = (keyIndex: number) => {
    const manufacturedForName = snapshot.manufactured_for_name || `${snapshot.brand || 'HP'} India Sales Private Ltd.`;
    const manufacturedForAddress = snapshot.manufactured_for_address || 'No.24, Kothari Arena, Hosur Main Road, Adugodi, Bangalore, Karnataka - 560030';
    const isShortAio = heightMm <= 130;
    const isNarrowAio = widthMm <= 68;
    const aioFontSize = isShortAio ? '6.8pt' : isNarrowAio ? '8.1pt' : '7.8pt';
    const aioLineHeight = isShortAio ? '1.13' : '1.18';
    const aioPadding = isShortAio ? '4mm 4mm' : '5mm 4.6mm';
    const aioRowLabelWidth = isNarrowAio ? '28mm' : '34mm';
    const sectionGap = isShortAio ? 'mt-1' : 'mt-1.5';
    const packTextSize = isShortAio ? '6.5pt' : '7.8pt';
    const customSections = fields
      .filter((field) => field.enabled && !builtInFieldKeys.has(field.key) && !['manufactured_for_name', 'manufactured_for_address'].includes(field.key))
      .map((field) => ({ field, value: snapshot[field.key] || field.default_value }))
      .filter(({ value }) => value);
    const mrpValue = Number(snapshot.mrp || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 });

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
          fontFamily: '"Arial Narrow", Arial, Helvetica, sans-serif',
          fontSize: aioFontSize,
          fontWeight: 700,
          lineHeight: aioLineHeight,
          overflowWrap: 'anywhere',
          wordBreak: 'break-word',
          letterSpacing: '0',
          ...baseLabelStyle,
        }}
      >
        <div className="break-words">
          <span style={titleTextStyle}>Manufactured By:&nbsp;</span>
          <span style={valueTextStyle}>{snapshot.manufacturerName || 'Flextronics Technologies India Pvt. Ltd.'}</span>
          {snapshot.manufacturerAddress && <div style={valueTextStyle}>{snapshot.manufacturerAddress}</div>}
        </div>

        <div className={sectionGap}>
          <span style={titleTextStyle}>Manufactured For:&nbsp;</span>
          <span style={valueTextStyle}>{manufacturedForName}</span>
          <div style={valueTextStyle}>{manufacturedForAddress}</div>
        </div>

        <div className={sectionGap}>
          <span style={titleTextStyle}>For Complaints:&nbsp;</span>
          <span style={valueTextStyle}>{snapshot.customerCareProfile || 'Customer Care'} </span>
          <span style={valueTextStyle}>(Same address as above).Email: {snapshot.customerCareEmail || 'in.contact@hp.com'}</span>
        </div>
        <div className={sectionGap}><span style={titleTextStyle}>Tel: </span>{labelValue(`${snapshot.customerCarePhone || snapshot.customerCareTollFree || '1-800-258-7170'} (toll free)`)}</div>
        <div className={sectionGap}><span style={titleTextStyle}>WhatsApp: </span>{labelValue(snapshot.customerCareWhatsApp || '+ 91 22 6101 4560')}</div>

        <div className={isShortAio ? 'mt-2' : 'mt-3'}><span style={titleTextStyle}>Month & Year of Manufacture:&nbsp;</span>{labelValue(`${snapshot.month || 'Feb'} ${snapshot.year || '2026'}`)}</div>
        <div className="mt-0.5 flex items-baseline gap-2 whitespace-nowrap">
          <span style={titleTextStyle}>MRP</span>
          <span className={isShortAio ? 'text-[11pt] leading-none' : 'text-[15pt] leading-none'} style={valueTextStyle}>{currency}</span>
          <span style={valueTextStyle}>{mrpValue}</span>
          <span className={isShortAio ? 'text-[5.3pt]' : 'text-[6.5pt]'} style={valueTextStyle}>Incl.of all Taxes</span>
        </div>

        <div className={isShortAio ? 'mt-2 space-y-0.5' : 'mt-3 space-y-1'}>
          <div className="flex gap-2">
            <span className="shrink-0" style={{ width: aioRowLabelWidth, ...titleTextStyle }}>Product No :</span>
            <span className="min-w-0 break-words" style={valueTextStyle}>{snapshot.productNumber || 'D2UP4PT#ACJ'}</span>
          </div>
          <div className="flex gap-2">
            <span className="shrink-0" style={{ width: aioRowLabelWidth, ...titleTextStyle }}>Country of Origin :</span>
            <span className="min-w-0 break-words" style={valueTextStyle}>{snapshot.countryOfOrigin || 'India'}</span>
          </div>
          <div className="flex gap-2">
            <span className="shrink-0" style={{ width: aioRowLabelWidth, ...titleTextStyle }}>Generic Name :</span>
            <span className="min-w-0 break-words" style={valueTextStyle}>{snapshot.genericName || 'ALL IN ONE COMPUTER'}</span>
          </div>
        </div>

        <div className={isShortAio ? 'mt-2 text-[10pt]' : 'mt-4 text-[12pt]'}><span style={titleTextStyle}>Net Qty:&nbsp;&nbsp;</span>{labelValue(snapshot.netQuantity || '1 N')}</div>

        <div className={isShortAio ? 'mt-4 whitespace-pre-line' : 'mt-6 whitespace-pre-line'} style={{ fontSize: packTextSize, lineHeight: isShortAio ? 1.1 : 1.18, ...valueTextStyle }}>
          [{snapshot.packContents || '60.45 CM ALL IN ONE COMPUTER 1N,\nCENTRAL PROCESSING UNIT 1N,\nCABLE SET 1N,\nTOWERSTAND 1N,KEYBOARD 1N,MOUSE 1N'}]
        </div>

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
      </div>
    );
  };

  const renderSingleSticker = (keyIndex: number) => isPrinterStyle ? renderPrinterSticker(keyIndex) : isAioStyle ? renderAioSticker(keyIndex) : (
    <div
      key={keyIndex}
      className={`bg-white text-slate-900 border-2 border-slate-900 rounded-xs flex flex-col justify-between overflow-hidden select-none box-border ${
        isPrintMode ? 'print-sticker-page' : 'shadow-xl'
      }`}
      style={{
        width: `${widthMm}mm`,
        height: `${heightMm}mm`,
        minHeight: `${heightMm}mm`,
        boxSizing: 'border-box',
        padding: '6mm 7mm',
        fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        fontSize: '9pt',
        lineHeight: '1.25',
        ...baseLabelStyle,
      }}
    >
      {/* Label Header / Brand Bar */}
      <div className="space-y-2 flex-1">
        {fields
          .filter((f) => f.enabled)
          .map((f) => renderFieldValue(f.key, f))}
        {renderCustomSections()}
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
