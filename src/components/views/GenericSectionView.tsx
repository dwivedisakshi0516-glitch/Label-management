import React, { useState } from 'react';
import { NavigationPath } from '../../types';
import { useAuth } from '../../context/AuthContext';
import {
  Library,
  Factory,
  CheckCircle2,
  Headphones,
  ShieldCheck,
  ArrowLeftRight,
  ScrollText,
  Sliders,
  Check,
  Download,
  Upload,
  RefreshCw,
  Search,
  ExternalLink
} from 'lucide-react';
import { INITIAL_TEMPLATES } from '../../data/mockData';

interface GenericSectionViewProps {
  section: NavigationPath;
  onNavigateToDesigner?: () => void;
}

export const GenericSectionView: React.FC<GenericSectionViewProps> = ({
  section,
  onNavigateToDesigner
}) => {
  const { currentUser } = useAuth();
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  if (section === 'template-library') {
    return (
      <div className="flex flex-col gap-6 pb-12">
        <section className="bg-[#131b2d] rounded-xl p-5 shadow-xl flex items-center justify-between border border-[#424754]/30">
          <div>
            <div className="flex items-center gap-2 font-mono text-xs text-[#4cd7f6] uppercase tracking-wider font-semibold">
              <span>DESIGN STUDIO</span>
              <span className="text-[#424754]">/</span>
              <span>TEMPLATES</span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight mt-1">
              PRODUCTION TEMPLATE LIBRARY
            </h1>
            <p className="text-xs text-[#c2c6d6]/70 mt-0.5">
              Approved industrial label specs compiled for thermal high-speed output.
            </p>
          </div>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {INITIAL_TEMPLATES.map((tmpl) => (
            <div
              key={tmpl.id}
              className="bg-[#131b2d] p-5 rounded-xl border border-[#424754]/30 shadow-lg flex flex-col justify-between gap-4 font-mono text-xs"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-base font-bold font-sans text-white">{tmpl.name}</span>
                  <span className="px-2 py-0.5 rounded bg-[#4d8eff]/20 text-[#adc6ff] text-[10px] font-bold">
                    {tmpl.version}
                  </span>
                </div>
                <div className="text-[#4cd7f6] text-xs mt-1">
                  {tmpl.dimensions} • {tmpl.dpi} DPI
                </div>
                <p className="text-[#c2c6d6]/70 mt-2 text-[11px]">
                  Media: {tmpl.mediaType} • {tmpl.fieldsCount} statutory field bindings
                </p>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-[#424754]/30">
                <span className="text-[10px] text-[#4edea3]">
                  {tmpl.zeroBarcodeEnforced ? '✓ Zero-Barcode Enforced' : 'Standard GS1 Barcode'}
                </span>
                <button
                  onClick={onNavigateToDesigner}
                  type="button"
                  className="px-3 py-1.5 bg-[#171f32] hover:bg-[#222a3d] text-white rounded border border-[#424754]/40"
                >
                  Edit in Designer
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (section === 'manufacturers-plants') {
    const plants = [
      { id: 'p1', name: 'Foxconn Plant 08', code: 'PLT-IN-TN', location: 'Sriperumbudur, Tamil Nadu', capacity: '12,000 Units/Day', status: 'ACTIVE' },
      { id: 'p2', name: 'Pegatron Plant 3', code: 'PLT-TW-KH', location: 'Kaohsiung Harbor Tech Zone', capacity: '8,500 Units/Day', status: 'ACTIVE' },
      { id: 'p3', name: 'Wistron Austin Hub', code: 'PLT-US-TX', location: 'Austin, Texas Logistics Center', capacity: '5,000 Units/Day', status: 'ACTIVE' },
      { id: 'p4', name: 'Brother Industries Hub', code: 'PLT-IN-CHE', location: 'Chennai Industrial Corridor', capacity: '4,200 Units/Day', status: 'ACTIVE' },
      { id: 'p5', name: 'Canon India Manufacturing', code: 'PLT-IN-NOI', location: 'Noida Phase II Export Zone', capacity: '3,100 Units/Day', status: 'ACTIVE' }
    ];

    return (
      <div className="flex flex-col gap-6 pb-12">
        <section className="bg-[#131b2d] rounded-xl p-5 shadow-xl border border-[#424754]/30">
          <h1 className="text-2xl font-bold text-white tracking-tight">
            MANUFACTURING FACILITIES & PLANTS
          </h1>
          <p className="text-xs text-[#c2c6d6]/70 mt-0.5 font-mono">
            Direct physical assembly facilities registered under statutory BIS declarations.
          </p>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {plants.map((p) => (
            <div key={p.id} className="bg-[#131b2d] p-5 rounded-xl border border-[#424754]/30 shadow-lg flex flex-col justify-between gap-3 font-mono text-xs">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-white font-bold font-sans text-sm">{p.name}</span>
                  <span className="text-[10px] text-[#4edea3] font-bold bg-[#00a572]/20 px-2 py-0.5 rounded">
                    {p.status}
                  </span>
                </div>
                <span className="text-[#4cd7f6] text-xs mt-0.5 block">{p.code}</span>
                <p className="text-[#c2c6d6]/80 text-[11px] mt-2">{p.location}</p>
              </div>

              <div className="pt-2 border-t border-[#424754]/20 flex justify-between items-center text-[10px] text-[#c2c6d6]/60">
                <span>RATED CAPACITY:</span>
                <span className="text-white font-bold">{p.capacity}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (section === 'line-settings') {
    return (
      <div className="flex flex-col gap-6 pb-12">
        <section className="bg-[#131b2d] rounded-xl p-5 shadow-xl border border-[#424754]/30">
          <h1 className="text-2xl font-bold text-white tracking-tight">
            LINE 04 HARDWARE CONFIGURATION & SETTINGS
          </h1>
          <p className="text-xs text-[#c2c6d6]/70 mt-0.5 font-mono">
            Low-level Zebra ZPL-II engine parameters and network TCP communication protocol.
          </p>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-mono text-xs">
          <div className="bg-[#131b2d] p-5 rounded-xl border border-[#424754]/30 shadow-lg flex flex-col gap-3">
            <h2 className="text-xs uppercase font-bold text-white tracking-wider border-b border-[#424754]/30 pb-2">
              PRINTER ENGINE & HEAD CALIBRATION
            </h2>
            <div className="space-y-3">
              <div>
                <label className="text-[#c2c6d6]/70 block mb-1">PRINTER IP ADDRESS & PORT</label>
                <input
                  type="text"
                  defaultValue="192.168.10.42:9100"
                  className="w-full bg-[#060e1f] border border-[#424754]/40 rounded p-2 text-white"
                />
              </div>

              <div>
                <label className="text-[#c2c6d6]/70 block mb-1">BURN DARKNESS INDEX (0.0 - 30.0)</label>
                <input
                  type="text"
                  defaultValue="22.0 (High Density Thermal Resin)"
                  className="w-full bg-[#060e1f] border border-[#424754]/40 rounded p-2 text-white"
                />
              </div>

              <div>
                <label className="text-[#c2c6d6]/70 block mb-1">FEED VELOCITY (INCHES/SEC)</label>
                <input
                  type="text"
                  defaultValue="6.0 ips (152 mm/sec)"
                  className="w-full bg-[#060e1f] border border-[#424754]/40 rounded p-2 text-white"
                />
              </div>
            </div>
          </div>

          <div className="bg-[#131b2d] p-5 rounded-xl border border-[#424754]/30 shadow-lg flex flex-col gap-3">
            <h2 className="text-xs uppercase font-bold text-white tracking-wider border-b border-[#424754]/30 pb-2">
              TELEMETRY & SENSOR THRESHOLDS
            </h2>
            <div className="space-y-3">
              <div>
                <label className="text-[#c2c6d6]/70 block mb-1">THERMAL HEAD OVERHEAT WARNING</label>
                <input
                  type="text"
                  defaultValue="48.0°C (Auto-Throttle Throttling)"
                  className="w-full bg-[#060e1f] border border-[#424754]/40 rounded p-2 text-white"
                />
              </div>

              <div>
                <label className="text-[#c2c6d6]/70 block mb-1">MEDIA SENSOR MODE</label>
                <input
                  type="text"
                  defaultValue="Transmissive Black-Mark Die-Cut"
                  className="w-full bg-[#060e1f] border border-[#424754]/40 rounded p-2 text-white"
                />
              </div>

              <div>
                <label className="text-[#c2c6d6]/70 block mb-1">CRYPTOGRAPHIC CHECKSUM RECORDING</label>
                <input
                  type="text"
                  defaultValue="SHA-256 Distributed Immutable Ledger"
                  className="w-full bg-[#060e1f] border border-[#424754]/40 rounded p-2 text-[#4edea3]"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Default section view for remaining sections
  return (
    <div className="flex flex-col gap-6 pb-12 font-mono">
      <section className="bg-[#131b2d] rounded-xl p-5 shadow-xl border border-[#424754]/30">
        <h1 className="text-2xl font-bold text-white tracking-tight uppercase font-sans">
          {section.replace(/-/g, ' ')}
        </h1>
        <p className="text-xs text-[#c2c6d6]/70 mt-0.5">
          Enterprise operational node synchronized with Austin Delta-09 Master Controller.
        </p>
      </section>

      <div className="bg-[#131b2d] p-8 rounded-xl border border-[#424754]/30 shadow-xl flex flex-col items-center justify-center text-center gap-3">
        <CheckCircle2 className="w-10 h-10 text-[#4edea3]" />
        <h2 className="text-base font-bold text-white font-sans">Node Online & Synchronized</h2>
        <p className="text-xs text-[#c2c6d6]/70 max-w-md">
          This system section is active and bound to the central relational database. All changes are logged into the immutable cryptographic audit ledger.
        </p>
      </div>
    </div>
  );
};
