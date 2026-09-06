import React, { useState } from 'react';
import { INITIAL_MODELS } from '../../data/mockData';
import { ProductModel } from '../../types';
import { Zap, Printer, X, Check, ShieldCheck } from 'lucide-react';

interface QuickPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPrintSuccess: (msg: string) => void;
}

export const QuickPrintModal: React.FC<QuickPrintModalProps> = ({
  isOpen,
  onClose,
  onPrintSuccess
}) => {
  const [selectedModelId, setSelectedModelId] = useState<string>(INITIAL_MODELS[0].id);
  const [quantity, setQuantity] = useState(1);
  const [darkness, setDarkness] = useState('22.0');

  if (!isOpen) return null;

  const model = INITIAL_MODELS.find((m) => m.id === selectedModelId) || INITIAL_MODELS[0];

  const handleExecutePrint = (e: React.FormEvent) => {
    e.preventDefault();
    onPrintSuccess(
      `Quick Print Executed: ${quantity} x [${model.sku}] dispatched directly to Zebra ZT411 printhead.`
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-[#060e1f]/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-[#131b2d] border border-[#424754]/50 max-w-md w-full rounded-xl p-5 shadow-2xl flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-[#424754]/30 pb-3">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-[#4d8eff] fill-current" />
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                Floor Quick Print Terminal
              </h3>
              <p className="text-[11px] font-mono text-[#c2c6d6]/70">
                1-Click Direct Thermal Label Dispenser
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-[#c2c6d6] hover:text-white" type="button">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleExecutePrint} className="space-y-4 font-mono text-xs">
          <div>
            <label className="block text-[11px] text-[#c2c6d6] uppercase font-semibold mb-1">
              Select Product SKU
            </label>
            <select
              value={selectedModelId}
              onChange={(e) => setSelectedModelId(e.target.value)}
              className="w-full bg-[#060e1f] border border-[#424754]/50 rounded-lg p-2.5 text-white font-medium focus:outline-none focus:border-[#4d8eff]"
            >
              {INITIAL_MODELS.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.sku})
                </option>
              ))}
            </select>
          </div>

          <div className="bg-[#060e1f] p-3 rounded-lg border border-[#424754]/30 space-y-1 text-[11px]">
            <div className="flex justify-between">
              <span className="text-[#c2c6d6]/70">TEMPLATE:</span>
              <strong className="text-white">{model.defaultTemplate}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-[#c2c6d6]/70">STATUTORY MRP:</span>
              <strong className="text-[#4edea3]">₹ {model.mrp}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-[#c2c6d6]/70">BIS REGISTRATION:</span>
              <strong className="text-[#adc6ff]">{model.bisCode}</strong>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] text-[#c2c6d6] uppercase font-semibold mb-1">
                Print Quantity
              </label>
              <input
                type="number"
                min={1}
                max={500}
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                className="w-full bg-[#060e1f] border border-[#424754]/50 rounded-lg p-2 text-white font-bold"
              />
            </div>

            <div>
              <label className="block text-[11px] text-[#c2c6d6] uppercase font-semibold mb-1">
                Burn Darkness
              </label>
              <select
                value={darkness}
                onChange={(e) => setDarkness(e.target.value)}
                className="w-full bg-[#060e1f] border border-[#424754]/50 rounded-lg p-2 text-white"
              >
                <option value="18.0">18.0 (Light Thermal)</option>
                <option value="22.0">22.0 (Standard Direct)</option>
                <option value="26.0">26.0 (Heavy Synthetic)</option>
              </select>
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2 border-t border-[#424754]/30">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-[#222a3d] hover:bg-[#2d3448] text-white rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#4d8eff] hover:bg-[#3b82f6] text-white font-bold rounded flex items-center gap-1.5 shadow-md"
            >
              <Printer className="w-4 h-4" />
              <span>Print {quantity} Label(s) Now</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
