import React, { useState, useEffect } from 'react';
import { PrintJob } from '../../types';
import { INITIAL_JOBS, INITIAL_TELEMETRY } from '../../data/mockData';
import { useAuth } from '../../context/AuthContext';
import {
  Gauge,
  Layers,
  PlusCircle,
  PenTool,
  Plus,
  Ruler,
  CheckCircle,
  Eye,
  Printer,
  FileCode,
  RotateCcw,
  RotateCw,
  Box,
  Thermometer,
  Cable,
  HardDrive,
  RefreshCw,
  Filter,
  Check,
  AlertTriangle,
  X
} from 'lucide-react';

interface DashboardViewProps {
  onNavigateToOperatorFlow: () => void;
  onNavigateToDesigner: () => void;
  onNavigateToMasterData: () => void;
  searchFilter: string;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigateToOperatorFlow,
  onNavigateToDesigner,
  onNavigateToMasterData,
  searchFilter
}) => {
  const { canPerform } = useAuth();

  // 3D Carton state
  const [angleMode, setAngleMode] = useState<'isometric' | 'front' | 'top'>('isometric');
  const [rx, setRx] = useState(-22);
  const [ry, setRy] = useState(38);
  const [isAutoSpinning, setIsAutoSpinning] = useState(false);

  // Jobs state
  const [jobs, setJobs] = useState<PrintJob[]>(INITIAL_JOBS);
  const [selectedJobForModal, setSelectedJobForModal] = useState<PrintJob | null>(null);
  const [activeModalType, setActiveModalType] = useState<'INSPECT' | 'ZPL' | 'CALIBRATE' | 'SPOOL_ALERT' | null>(null);
  const [modalTitle, setModalTitle] = useState('');
  const [modalContent, setModalContent] = useState('');
  const [feedNotification, setFeedNotification] = useState<string | null>(null);

  // Auto spin timer
  useEffect(() => {
    let interval: any;
    if (isAutoSpinning) {
      interval = setInterval(() => {
        setRy((prev) => (prev + 1) % 360);
      }, 50);
    }
    return () => clearInterval(interval);
  }, [isAutoSpinning]);

  // Set carton angle preset
  const handleAnglePreset = (mode: 'isometric' | 'front' | 'top') => {
    setIsAutoSpinning(false);
    setAngleMode(mode);
    if (mode === 'isometric') {
      setRx(-22);
      setRy(38);
    } else if (mode === 'front') {
      setRx(0);
      setRy(0);
    } else if (mode === 'top') {
      setRx(-85);
      setRy(0);
    }
  };

  const handleManualRotate = (delta: number) => {
    setIsAutoSpinning(false);
    setRy((prev) => prev + delta);
  };

  const handleFeed1X = () => {
    setFeedNotification('Direct feed executed: Blank calibration label advanced on Zebra ZT411.');
    setTimeout(() => setFeedNotification(null), 3500);
  };

  const handleInspectJob = (job: PrintJob) => {
    setSelectedJobForModal(job);
    setActiveModalType('INSPECT');
    setModalTitle(`JOB INSPECTION // ${job.id}`);
    setModalContent(`JOB PROFILE: ${job.productModel}
------------------------------------------------------------
Batch Reference: BATCH-TX-2026-04
Verification Hash: 8f9b1c7a20e4b1049281a8f9a2e8c149a0c
Compliance Status: BIS Mandatory Schema PASSED (IS 13252 Part 1)
Legal Metrology Declaration: 100% verified against Master DB
Outer Box Dimension Fit: 420 x 310 x 280 mm Shipper Corrugate
Affix Orientation: Front Panel Co-Planar Center-Datum
Optical DPI: 300 DPI (12.0 dots/mm)
Status: ${job.status}`);
  };

  const handleShowZpl = (job: PrintJob) => {
    setSelectedJobForModal(job);
    setActiveModalType('ZPL');
    setModalTitle(`RAW ZPL-II STREAM [${job.id}]`);
    setModalContent(`^XA
^PW800
^LL1200
^LH0,0
^FO40,50^A0N,36,36^FD${job.productModel}^FS
^FO40,95^A0N,22,22^FD${job.spec}^FS
^FO40,125^GB720,2,2^FS
^FO40,145^A0N,24,24^FDMAXIMUM RETAIL PRICE (INCL. OF ALL TAXES): ${job.mrp}^FS
^FO40,175^A0N,20,20^FDNET QUANTITY: 1 UNIT // MFD: ${job.mfgDate}^FS
^FO40,210^A0N,18,18^FDMFG BY: FOXCONN IND. PLANT 08 // BIS: R-4100123^FS
^FO40,245^BY2,3,80^BCN,80,Y,N,N^FD8901030829104^FS
^FO40,360^GB720,2,2^FS
^FO40,380^A0N,18,18^FDSTATUTORY ZERO-BARCODE POLICY APPLIED // APEX VALIDATED^FS
^XZ`);
  };

  const handleReSpool = (job: PrintJob) => {
    setSelectedJobForModal(job);
    setActiveModalType('SPOOL_ALERT');
    setModalTitle(`DIRECT SPOOL CONFIRMATION [${job.id}]`);
    setModalContent(`[PRINT ENGINE TRANSMISSION ACK]
>> Target Job: ${job.id} (${job.productModel})
>> Physical Line: Zebra ZT411 Industrial (TCP/9100)
>> ByteStream Size: 1,024 bytes (ZPL II)
>> Spool Buffer Status: Enqueued in line hardware buffer
>> 0 Print Head Faults. Ready for label affix.`);
  };

  const handleTriggerCalibration = () => {
    setActiveModalType('CALIBRATE');
    setModalTitle('1:1 METRIC CALIBRATION DISPATCH');
    setModalContent(`[CALIBRATION ROUTINE INITIATED]
>> Protocol: ZPL II Calibrate (300.0 DPI Optical Sensor)
>> Target Dimensions: 100.00mm x 150.00mm
>> Optical Feed Sensor: Transmissive / Black Mark Die-Cut
>> Slew Speed: 6.0 ips (152 mm/sec)
>> Burn Darkness: 22.0
>> Result: Calibration pattern dispatched to Austin Plant Line 04.
>> Tolerance Delta: ±0.00mm verified via line photogate.`);
  };

  const filteredJobs = jobs.filter((j) => {
    if (!searchFilter) return true;
    const q = searchFilter.toLowerCase();
    return (
      j.id.toLowerCase().includes(q) ||
      j.productModel.toLowerCase().includes(q) ||
      j.spec.toLowerCase().includes(q) ||
      j.templateTarget.toLowerCase().includes(q)
    );
  });

  return (
    <div className="flex flex-col w-full gap-6 pb-12">
      {/* Toast feed notification */}
      {feedNotification && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#00a572] text-[#00285d] font-bold text-xs px-4 py-3 rounded-lg shadow-2xl flex items-center gap-2 border border-[#4edea3]">
          <Check className="w-4 h-4" />
          <span>{feedNotification}</span>
        </div>
      )}

      {/* INDUSTRIAL CLUSTER TERMINAL HEADER */}
      <section className="bg-[#131b2d] rounded-xl p-5 shadow-xl relative overflow-hidden border border-[#424754]/30">
        <div className="absolute -right-24 -top-24 w-96 h-96 bg-[#4d8eff]/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Industrial Packaging Terminal 09
            </h1>
            <p className="text-xs font-mono text-[#c2c6d6]/70">
              Station 09 • Automated Master Label Dispatch & Telemetry
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Latency Pill */}
            <div className="bg-[#060e1f] px-3.5 py-2 rounded flex items-center gap-2.5 border border-[#424754]/30 shadow-inner">
              <span className="text-[#4cd7f6] text-xs font-mono font-bold">⚡</span>
              <div className="flex flex-col">
                <span className="text-[10px] font-mono uppercase text-[#c2c6d6]/70">SYNC LATENCY</span>
                <span className="text-xs font-mono text-[#4cd7f6] font-bold">
                  12ms <span className="text-[#c2c6d6]/50 font-normal">(PEER 99.98%)</span>
                </span>
              </div>
            </div>

            {/* Line Status Pulse */}
            <div className="bg-[#4d8eff]/10 px-3.5 py-2 rounded flex items-center gap-2 text-[#adc6ff] border border-[#4d8eff]/20">
              <Box className="w-4 h-4 text-[#4d8eff]" />
              <span className="font-mono text-xs font-semibold">LINE 09 DIRECT PASS</span>
            </div>
          </div>
        </div>
      </section>

      {/* ACTION BAR */}
      <section className="bg-[#171f32] rounded-lg p-3 shadow-md flex flex-wrap items-center justify-between gap-3 border border-[#424754]/30">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onNavigateToDesigner}
            type="button"
            className="h-8 px-3.5 bg-[#4d8eff] hover:bg-[#3b82f6] text-white text-xs font-semibold rounded flex items-center gap-1.5 transition-colors cursor-pointer shadow-md"
          >
            <PenTool className="w-4 h-4 text-white" />
            <span>Launch Visual Designer</span>
          </button>

          <button
            onClick={onNavigateToMasterData}
            type="button"
            className="h-8 px-3 bg-[#222a3d] hover:bg-[#2d3448] text-white text-xs font-medium rounded flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4 text-[#4edea3]" />
            <span>Add Product Master</span>
          </button>

          <button
            onClick={handleTriggerCalibration}
            type="button"
            className="h-8 px-3 bg-[#060e1f] hover:bg-[#222a3d] text-[#c2c6d6] hover:text-white text-xs font-medium rounded flex items-center gap-1.5 transition-colors border border-[#424754]/30 cursor-pointer"
          >
            <Ruler className="w-4 h-4 text-[#4cd7f6]" />
            <span>Test Print Calibration (1:1 mm)</span>
          </button>
        </div>

        <div className="flex items-center gap-3 font-mono text-xs text-[#c2c6d6]">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-[#4cd7f6]"></span>
            <span>
              OPTICAL DPI: <strong className="text-white">300 DPI</strong>
            </span>
          </div>
          <span className="text-[#424754]">•</span>
          <div>
            ENGINE: <strong className="text-[#4edea3]">ZEBRA-ZPL V4</strong>
          </div>
        </div>
      </section>

      {/* 6 KPI METRIC TILES */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
        {/* Tile 1 */}
        <div className="bg-[#131b2d] p-3.5 rounded-lg shadow-lg relative overflow-hidden border border-[#424754]/30">
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-[#4cd7f6]"></div>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase text-[#c2c6d6]/70">TAXONOMY SCOPE</span>
            <Layers className="w-4 h-4 text-[#4cd7f6]" />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-3xl font-bold text-white">08</span>
            <span className="text-[10px] font-mono text-[#4cd7f6] font-semibold">ACTIVE</span>
          </div>
          <p className="mt-1 text-xs text-[#c2c6d6]/70 font-mono truncate">IT Peripherals & Telecom</p>
        </div>

        {/* Tile 2 */}
        <div className="bg-[#131b2d] p-3.5 rounded-lg shadow-lg relative overflow-hidden border border-[#424754]/30">
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-[#adc6ff]"></div>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase text-[#c2c6d6]/70">ERP SYNCHRONICITY</span>
            <Box className="w-4 h-4 text-[#adc6ff]" />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-3xl font-bold text-white">42</span>
            <span className="text-[10px] font-mono text-[#adc6ff] font-semibold">MODELS</span>
          </div>
          <p className="mt-1 text-xs text-[#4edea3] font-mono truncate">100% Relational Match</p>
        </div>

        {/* Tile 3 */}
        <div className="bg-[#131b2d] p-3.5 rounded-lg shadow-lg relative overflow-hidden border border-[#424754]/30">
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-[#4edea3]"></div>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase text-[#c2c6d6]/70">LAYOUT REVISIONS</span>
            <PenTool className="w-4 h-4 text-[#4edea3]" />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-3xl font-bold text-white">14</span>
            <span className="text-[10px] font-mono text-[#4edea3] font-semibold">TEMPLATES</span>
          </div>
          <p className="mt-1 text-xs text-[#c2c6d6]/70 font-mono truncate">Rev 4.8 Dual Spec Auto</p>
        </div>

        {/* Tile 4 */}
        <div className="bg-[#131b2d] p-3.5 rounded-lg shadow-lg relative overflow-hidden border border-[#424754]/30">
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-[#03b5d3]"></div>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase text-[#c2c6d6]/70">DAILY RUN CYCLE</span>
            <FileCode className="w-4 h-4 text-[#4cd7f6]" />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-3xl font-bold text-white">128</span>
            <span className="text-[10px] font-mono text-[#4cd7f6] font-semibold">CREATED</span>
          </div>
          <p className="mt-1 text-xs text-[#4edea3] font-mono truncate">+14.2% Operator Batch</p>
        </div>

        {/* Tile 5 */}
        <div className="bg-[#131b2d] p-3.5 rounded-lg shadow-lg relative overflow-hidden border border-[#424754]/30">
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-[#4d8eff]"></div>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase text-[#c2c6d6]/70">OUTPUT ENGINE</span>
            <Printer className="w-4 h-4 text-[#adc6ff]" />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-3xl font-bold text-white">340</span>
            <span className="text-[10px] font-mono text-[#adc6ff] font-semibold">PRINTED</span>
          </div>
          <p className="mt-1 text-xs text-[#c2c6d6]/70 font-mono truncate">ZT411 Hi-Speed Verified</p>
        </div>

        {/* Tile 6 */}
        <div className="bg-[#131b2d] p-3.5 rounded-lg shadow-lg relative overflow-hidden border border-[#424754]/30">
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-[#00a572]"></div>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase text-[#c2c6d6]/70">BUFFER DISPATCH</span>
            <HardDrive className="w-4 h-4 text-[#4edea3]" />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-3xl font-bold text-white">04</span>
            <span className="text-[10px] font-mono text-[#4edea3] font-semibold">IN QUEUE</span>
          </div>
          <p className="mt-1 text-xs text-[#4edea3] font-mono truncate">0 Errors • 0ms Delay</p>
        </div>
      </section>

      {/* DATA PROPAGATION & INTEGRITY PIPELINE */}
      <section className="bg-[#131b2d] p-5 rounded-xl shadow-xl flex flex-col gap-3 border border-[#424754]/30">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <Layers className="w-5 h-5 text-[#4cd7f6]" />
            <div>
              <h2 className="text-sm font-bold text-white tracking-tight">
                DATA PROPAGATION & INTEGRITY PIPELINE
              </h2>
              <span className="text-xs font-mono text-[#c2c6d6]/70">
                Cascading master inheritance with zero-loss schema isolation
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-[#060e1f] px-3 py-1 rounded border border-[#424754]/30">
            <span className="h-2 w-2 rounded-full bg-[#4edea3] animate-pulse"></span>
            <span className="text-xs font-mono text-white">FLOW STATUS: ALL NODES SYNCHRONIZED</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
          {/* Step 1 */}
          <div className="bg-[#171f32] p-2.5 rounded-lg flex flex-col justify-between h-24 border border-[#424754]/20 hover:border-[#4cd7f6]/40 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold text-[#4cd7f6]">01. CATEGORY</span>
              <CheckCircle className="w-3.5 h-3.5 text-[#4cd7f6]" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-white">IT Peripherals</span>
              <span className="text-[10px] font-mono text-[#c2c6d6]/70">HSN Code 8471</span>
            </div>
            <div className="w-full bg-[#060e1f] h-1 rounded-full overflow-hidden">
              <div className="bg-[#4cd7f6] h-full w-full"></div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="bg-[#171f32] p-2.5 rounded-lg flex flex-col justify-between h-24 border border-[#424754]/20 hover:border-[#4cd7f6]/40 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold text-[#4cd7f6]">02. PRODUCT</span>
              <CheckCircle className="w-3.5 h-3.5 text-[#4cd7f6]" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-white">HP ProDesk 2</span>
              <span className="text-[10px] font-mono text-[#c2c6d6]/70">SKU #8819-TX</span>
            </div>
            <div className="w-full bg-[#060e1f] h-1 rounded-full overflow-hidden">
              <div className="bg-[#4cd7f6] h-full w-full"></div>
            </div>
          </div>

          {/* Step 3 */}
          <div className="bg-[#171f32] p-2.5 rounded-lg flex flex-col justify-between h-24 border border-[#424754]/20 hover:border-[#4cd7f6]/40 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold text-[#4cd7f6]">03. TEMPLATE</span>
              <CheckCircle className="w-3.5 h-3.5 text-[#4cd7f6]" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-white">Dual BIS Outer</span>
              <span className="text-[10px] font-mono text-[#c2c6d6]/70">100 x 150mm Std</span>
            </div>
            <div className="w-full bg-[#060e1f] h-1 rounded-full overflow-hidden">
              <div className="bg-[#4cd7f6] h-full w-full"></div>
            </div>
          </div>

          {/* Step 4 */}
          <div className="bg-[#171f32] p-2.5 rounded-lg flex flex-col justify-between h-24 border border-[#424754]/20 hover:border-[#4cd7f6]/40 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold text-[#4cd7f6]">04. MASTER DATA</span>
              <CheckCircle className="w-3.5 h-3.5 text-[#4cd7f6]" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-white">Plant Austin 4</span>
              <span className="text-[10px] font-mono text-[#c2c6d6]/70">Mfg Lic #R-410</span>
            </div>
            <div className="w-full bg-[#060e1f] h-1 rounded-full overflow-hidden">
              <div className="bg-[#4cd7f6] h-full w-full"></div>
            </div>
          </div>

          {/* Step 5 */}
          <div className="bg-[#171f32] p-2.5 rounded-lg flex flex-col justify-between h-24 border border-[#424754]/20 hover:border-[#adc6ff]/40 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold text-[#adc6ff]">05. OVERRIDES</span>
              <CheckCircle className="w-3.5 h-3.5 text-[#adc6ff]" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-white">Operator Locked</span>
              <span className="text-[10px] font-mono text-[#c2c6d6]/70">0 Custom Edits</span>
            </div>
            <div className="w-full bg-[#060e1f] h-1 rounded-full overflow-hidden">
              <div className="bg-[#4d8eff] h-full w-full"></div>
            </div>
          </div>

          {/* Step 6 */}
          <div className="bg-[#171f32] p-2.5 rounded-lg flex flex-col justify-between h-24 border border-[#424754]/20 hover:border-[#4edea3]/40 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold text-[#4edea3]">06. 3D FIT CHECK</span>
              <CheckCircle className="w-3.5 h-3.5 text-[#4edea3]" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-white">Tolerance: 0.1mm</span>
              <span className="text-[10px] font-mono text-[#4edea3]">Carton Affix OK</span>
            </div>
            <div className="w-full bg-[#060e1f] h-1 rounded-full overflow-hidden">
              <div className="bg-[#4edea3] h-full w-full"></div>
            </div>
          </div>

          {/* Step 7 */}
          <div className="bg-[#171f32] p-2.5 rounded-lg flex flex-col justify-between h-24 border border-[#424754]/20 hover:border-[#4edea3]/40 transition-colors">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold text-[#4edea3]">07. PRINT SPOOL</span>
              <Printer className="w-3.5 h-3.5 text-[#4edea3]" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-white">Direct ZPL II</span>
              <span className="text-[10px] font-mono text-[#4edea3]">Engine Ready</span>
            </div>
            <div className="w-full bg-[#060e1f] h-1 rounded-full overflow-hidden">
              <div className="bg-[#4edea3] h-full w-full"></div>
            </div>
          </div>
        </div>
      </section>

      {/* SPLIT SECTION: 3D PACKAGING SIMULATION HERO & REAL-TIME DIAGNOSTIC */}
      <section className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch">
        {/* LEFT: 3D PACKAGING CARTON HERO (7 COLS) */}
        <div className="xl:col-span-7 bg-[#131b2d] rounded-xl p-5 shadow-xl flex flex-col justify-between border border-[#424754]/30 relative overflow-hidden">
          {/* Top Bar of 3D Panel */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#424754]/30 z-10">
            <div className="flex items-center gap-2.5">
              <Box className="w-5 h-5 text-[#4cd7f6]" />
              <div>
                <h3 className="text-sm font-bold text-white">3D PACKAGING AFFIX SIMULATION</h3>
                <span className="text-xs font-mono text-[#c2c6d6]/70">
                  Real-scale 100x150mm Label on Industrial Shipper Carton (420x310x280mm)
                </span>
              </div>
            </div>

            {/* Dynamic Angle Buttons & Auto Spin */}
            <div className="flex items-center gap-1 bg-[#060e1f] p-1 rounded border border-[#424754]/40">
              <button
                onClick={() => handleAnglePreset('isometric')}
                type="button"
                className={`px-2.5 py-1 rounded text-xs font-mono transition-all ${
                  angleMode === 'isometric'
                    ? 'bg-[#4d8eff] text-white font-bold shadow'
                    : 'text-[#c2c6d6] hover:text-white hover:bg-[#222a3d]'
                }`}
              >
                Isometric
              </button>
              <button
                onClick={() => handleAnglePreset('front')}
                type="button"
                className={`px-2.5 py-1 rounded text-xs font-mono transition-all ${
                  angleMode === 'front'
                    ? 'bg-[#4d8eff] text-white font-bold shadow'
                    : 'text-[#c2c6d6] hover:text-white hover:bg-[#222a3d]'
                }`}
              >
                Front 1:1
              </button>
              <button
                onClick={() => handleAnglePreset('top')}
                type="button"
                className={`px-2.5 py-1 rounded text-xs font-mono transition-all ${
                  angleMode === 'top'
                    ? 'bg-[#4d8eff] text-white font-bold shadow'
                    : 'text-[#c2c6d6] hover:text-white hover:bg-[#222a3d]'
                }`}
              >
                Top Flap
              </button>
              <button
                onClick={() => setIsAutoSpinning(!isAutoSpinning)}
                type="button"
                className={`px-2.5 py-1 rounded text-xs font-mono transition-all ${
                  isAutoSpinning
                    ? 'bg-[#4edea3] text-[#002e6a] font-bold'
                    : 'text-[#c2c6d6] hover:text-white hover:bg-[#222a3d]'
                }`}
              >
                {isAutoSpinning ? 'Pause Spin' : 'Auto Spin'}
              </button>
            </div>
          </div>

          {/* 3D Canvas Perspective Area */}
          <div className="relative w-full h-[380px] flex items-center justify-center overflow-hidden my-3 select-none bg-[#060e1f] rounded-lg border border-[#424754]/20 [perspective:1200px]">
            {/* Ruler Guides Overlay */}
            <div className="absolute inset-0 pointer-events-none opacity-25 flex flex-col justify-between p-3 font-mono text-[10px] text-[#4cd7f6]">
              <div className="flex justify-between">
                <span>0mm</span>
                <span>100mm</span>
                <span>200mm</span>
                <span>300mm</span>
                <span>420mm [W]</span>
              </div>
              <div className="h-full border-r border-dashed border-[#4cd7f6]/40 ml-auto mr-16"></div>
              <div className="flex justify-between">
                <span>BASE_DATUM: XYZ-0</span>
                <span>SCALE 1:2.4 METRIC</span>
                <span>TOLERANCE ±0.2%</span>
              </div>
            </div>

            {/* 3D Box Transformation Wrapper */}
            <div
              className="relative transition-transform duration-500 ease-out preserve-3d scale-[0.82] sm:scale-100 origin-center"
              style={{
                width: '300px',
                height: '220px',
                transform: `rotateX(${rx}deg) rotateY(${ry}deg) rotateZ(0deg)`
              }}
            >
              {/* Front Face: Shipper Corrugate */}
              <div
                className="absolute inset-0 bg-[#251f1a] border border-[#59432f] shadow-2xl flex flex-col justify-between p-3.5"
                style={{ transform: 'translateZ(90px)', backfaceVisibility: 'hidden' }}
              >
                <div className="flex justify-between items-start opacity-75">
                  <span className="text-[10px] font-mono text-[#f59e0b] font-bold tracking-widest uppercase">
                    CORRUGATE GRADE 44-ECT
                  </span>
                  <span className="text-[10px] font-mono text-[#f59e0b]">SHIP-420-STD</span>
                </div>

                {/* Affixed 100x150mm Physical Label Specimen */}
                <div
                  onClick={() => handleInspectJob(jobs[0])}
                  className="mx-auto w-[180px] h-[135px] bg-white text-black p-2 rounded shadow-md flex flex-col justify-between transition-transform duration-200 hover:scale-105 cursor-pointer"
                  title="Click to inspect affixed label"
                >
                  <div className="border-b border-gray-300 pb-1 flex justify-between items-start">
                    <div>
                      <div className="text-[10px] font-black uppercase leading-tight">HP ProDesk 2 G1a</div>
                      <div className="text-[8px] text-gray-600 font-mono">MODEL: TPC-W043-MT</div>
                    </div>
                    <span className="px-1 py-0.2 bg-black text-white text-[7px] font-mono font-bold rounded">
                      BIS
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-1 text-[7px] font-mono leading-tight text-gray-800">
                    <div>
                      <span className="text-gray-500 block">NET QTY:</span>
                      <strong>1 UNIT</strong>
                    </div>
                    <div>
                      <span className="text-gray-500 block">MRP INCL:</span>
                      <strong className="text-blue-700">₹64,999.00</strong>
                    </div>
                    <div className="col-span-2">
                      <span className="text-gray-500 block">MFG FOR:</span>
                      <span className="truncate block font-semibold">HP India Sales Pvt Ltd</span>
                    </div>
                  </div>

                  {/* Simulated GS1 Barcode Graphic */}
                  <div className="pt-0.5 flex flex-col items-center">
                    <div className="w-full flex justify-between h-4 items-end gap-[1px]">
                      <span className="bg-black w-1 h-full"></span>
                      <span className="bg-black w-0.5 h-full"></span>
                      <span className="bg-black w-1 h-3/4"></span>
                      <span className="bg-black w-2 h-full"></span>
                      <span className="bg-black w-0.5 h-full"></span>
                      <span className="bg-black w-1 h-full"></span>
                      <span className="bg-black w-2 h-full"></span>
                      <span className="bg-black w-0.5 h-3/4"></span>
                      <span className="bg-black w-1 h-full"></span>
                      <span className="bg-black w-1.5 h-full"></span>
                      <span className="bg-black w-0.5 h-full"></span>
                      <span className="bg-black w-2 h-full"></span>
                    </div>
                    <span className="text-[7px] font-mono tracking-widest mt-0.5">8901030829104</span>
                  </div>
                </div>

                {/* Carton Markings */}
                <div className="flex justify-between items-end text-[#a8713a]/80 font-mono text-[9px] uppercase">
                  <span>☂ ↑ ♲ THIS SIDE UP</span>
                  <span>420 x 310 x 280 mm</span>
                </div>
              </div>

              {/* Box Face: Right Side */}
              <div
                className="absolute inset-0 bg-[#1a1512] border border-[#433120] flex flex-col justify-between p-3"
                style={{
                  transform: 'rotateY(90deg) translateZ(150px)',
                  width: '180px',
                  left: '60px'
                }}
              >
                <div className="text-[8px] font-mono text-[#d97706] uppercase">SIDE CARRIER PANEL</div>
                <div className="h-10 w-24 mx-auto border border-dashed border-[#b45309]/50 rounded flex items-center justify-center text-[#d97706]/70 text-[8px] font-mono">
                  BARCODE-128
                </div>
                <span className="text-[8px] font-mono text-[#a8713a]/50">GROSS WT: 9.40 KG</span>
              </div>

              {/* Box Face: Top Flap */}
              <div
                className="absolute inset-0 bg-[#2f2822] border border-[#59432f] flex items-center justify-center p-2"
                style={{
                  transform: 'rotateX(90deg) translateZ(110px)',
                  height: '180px',
                  top: '20px'
                }}
              >
                <div className="border-b-2 border-[#16120e] w-full flex items-center justify-center py-1">
                  <span className="text-[8px] font-mono text-[#d97706] tracking-widest uppercase bg-[#2f2822] px-2">
                    REINFORCED SECURITY TAPE VERIFIED
                  </span>
                </div>
              </div>
            </div>

            {/* Orbit Readout & Direct Controls */}
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between pointer-events-none">
              <div className="pointer-events-auto bg-[#060e1f]/90 backdrop-blur-md px-3 py-1.5 rounded flex items-center gap-2 text-xs font-mono text-white border border-[#424754]/30">
                <span className="text-[#4cd7f6]">3D ORBIT:</span>
                <span className="text-[#4cd7f6] font-bold">
                  {rx}° / {ry}°
                </span>
              </div>

              <div className="pointer-events-auto flex items-center gap-1">
                <button
                  onClick={() => handleManualRotate(-15)}
                  title="Rotate Left"
                  className="p-1.5 bg-[#171f32] hover:bg-[#222a3d] text-white rounded border border-[#424754]/40"
                  type="button"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleManualRotate(15)}
                  title="Rotate Right"
                  className="p-1.5 bg-[#171f32] hover:bg-[#222a3d] text-white rounded border border-[#424754]/40"
                  type="button"
                >
                  <RotateCw className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleAnglePreset('isometric')}
                  title="Reset Angle"
                  className="p-1.5 bg-[#171f32] hover:bg-[#222a3d] text-white rounded border border-[#424754]/40 text-xs font-mono"
                  type="button"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>

          {/* Carton Metrology Readout Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-1">
            <div className="bg-[#171f32] p-2 rounded flex flex-col border border-[#424754]/20">
              <span className="text-[10px] font-mono uppercase text-[#c2c6d6]/70">CARTON ASPECT</span>
              <span className="text-xs font-mono text-white font-semibold">1 : 1.35 RELATIVE</span>
            </div>
            <div className="bg-[#171f32] p-2 rounded flex flex-col border border-[#424754]/20">
              <span className="text-[10px] font-mono uppercase text-[#c2c6d6]/70">AFFIX ACCURACY</span>
              <span className="text-xs font-mono text-[#4edea3] font-semibold">99.9% CO-PLANAR</span>
            </div>
            <div className="bg-[#171f32] p-2 rounded flex flex-col border border-[#424754]/20">
              <span className="text-[10px] font-mono uppercase text-[#c2c6d6]/70">EDGE CLEARANCE</span>
              <span className="text-xs font-mono text-[#4cd7f6] font-semibold">X: 42mm | Y: 35mm</span>
            </div>
            <div className="bg-[#171f32] p-2 rounded flex flex-col border border-[#424754]/20">
              <span className="text-[10px] font-mono uppercase text-[#c2c6d6]/70">PRINT DENSITY</span>
              <span className="text-xs font-mono text-white font-semibold">12.0 DOTS/MM</span>
            </div>
          </div>
        </div>

        {/* RIGHT: COMPLIANCE & LINE PRINTER TELEMETRY (5 COLS) */}
        <div className="xl:col-span-5 flex flex-col gap-4">
          {/* Compliance Block */}
          <div className="bg-[#131b2d] p-5 rounded-xl shadow-xl flex flex-col gap-3 border border-[#424754]/30">
            <div className="flex items-center justify-between border-b border-[#424754]/30 pb-2.5">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-[#4edea3]" />
                <h3 className="text-sm font-bold text-white">COMPLIANCE & VERIFICATION</h3>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#4edea3]/10 text-[#4edea3] font-bold">
                ALL PASS
              </span>
            </div>

            <div className="flex flex-col gap-2.5">
              {/* Item 1 */}
              <div className="bg-[#171f32] p-3 rounded-lg flex flex-col gap-1 border border-[#424754]/20">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-white">Zero Barcode / Zero Serial Generator</span>
                  <span className="px-2 py-0.5 rounded bg-[#4edea3]/20 text-[#4edea3] text-[10px] font-mono font-bold">
                    PASSED
                  </span>
                </div>
                <p className="text-[11px] font-mono text-[#c2c6d6]/80 leading-relaxed">
                  Pure human-readable legal text compliance confirmed. No synthetic non-standard barcode symbologies detected outside BIS mandate.
                </p>
              </div>

              {/* Item 2 */}
              <div className="bg-[#171f32] p-3 rounded-lg flex flex-col gap-1 border border-[#424754]/20">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-white">1:1 Metric Print Calibration</span>
                  <span className="px-2 py-0.5 rounded bg-[#4edea3]/20 text-[#4edea3] text-[10px] font-mono font-bold">
                    100% VERIFIED
                  </span>
                </div>
                <div className="w-full bg-[#060e1f] h-2 rounded-full overflow-hidden mt-1">
                  <div className="bg-[#4edea3] h-full w-full"></div>
                </div>
                <div className="flex justify-between text-[10px] font-mono text-[#c2c6d6]/70 mt-1">
                  <span>X-Scale: 100.00mm (0.00Δ)</span>
                  <span>Y-Scale: 150.00mm (0.00Δ)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Physical Line Printer Status */}
          <div className="bg-[#131b2d] p-5 rounded-xl shadow-xl flex flex-col gap-3 flex-1 justify-between border border-[#424754]/30">
            <div className="flex items-center justify-between border-b border-[#424754]/30 pb-2.5">
              <div className="flex items-center gap-2">
                <Printer className="w-5 h-5 text-[#4cd7f6]" />
                <div>
                  <h3 className="text-sm font-bold text-white">PHYSICAL LINE PRINTER STATUS</h3>
                  <span className="text-[11px] font-mono text-[#c2c6d6]/70">
                    Zebra ZT411 Industrial (Austin Pack-Line 04)
                  </span>
                </div>
              </div>
              <span className="h-2.5 w-2.5 rounded-full bg-[#4edea3] animate-pulse"></span>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {/* Ribbon */}
              <div className="bg-[#171f32] p-3 rounded-lg flex flex-col justify-between border border-[#424754]/20">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase text-[#c2c6d6]/70">THERMAL RIBBON</span>
                  <span className="text-[#4cd7f6] text-xs">87%</span>
                </div>
                <div className="my-1">
                  <span className="text-xl font-bold text-white">87%</span>
                  <span className="text-[10px] font-mono text-[#4edea3] block">Wax/Resin Optimal</span>
                </div>
                <div className="w-full bg-[#060e1f] h-1.5 rounded-full overflow-hidden">
                  <div className="bg-[#4cd7f6] h-full w-[87%]"></div>
                </div>
              </div>

              {/* Roll */}
              <div className="bg-[#171f32] p-3 rounded-lg flex flex-col justify-between border border-[#424754]/20">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase text-[#c2c6d6]/70">ROLL CAPACITY</span>
                  <span className="text-[#4edea3] text-xs">72%</span>
                </div>
                <div className="my-1">
                  <span className="text-xl font-bold text-white">1,420</span>
                  <span className="text-[10px] font-mono text-[#c2c6d6]/70 block">Units Remaining</span>
                </div>
                <div className="w-full bg-[#060e1f] h-1.5 rounded-full overflow-hidden">
                  <div className="bg-[#4edea3] h-full w-[72%]"></div>
                </div>
              </div>

              {/* Head Temp */}
              <div className="bg-[#171f32] p-3 rounded-lg flex flex-col justify-between border border-[#424754]/20">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase text-[#c2c6d6]/70">HEAD TEMP</span>
                  <Thermometer className="w-3.5 h-3.5 text-[#adc6ff]" />
                </div>
                <div className="mt-1">
                  <span className="text-xl font-bold text-white">34.2°C</span>
                  <span className="text-[10px] font-mono text-[#4edea3] block">STABLE (NOM: 35°C)</span>
                </div>
              </div>

              {/* Port & IP */}
              <div className="bg-[#171f32] p-3 rounded-lg flex flex-col justify-between border border-[#424754]/20">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase text-[#c2c6d6]/70">INTERFACE PROTOCOL</span>
                  <Cable className="w-3.5 h-3.5 text-[#4cd7f6]" />
                </div>
                <div className="mt-1">
                  <span className="text-xl font-bold text-[#4cd7f6]">TCP/9100</span>
                  <span className="text-[10px] font-mono text-[#c2c6d6]/70 block">IP: 192.168.10.42</span>
                </div>
              </div>
            </div>

            {/* Quick Feed Action */}
            <div className="bg-[#171f32] p-2 rounded-lg flex items-center justify-between border border-[#424754]/20">
              <div className="flex items-center gap-2 px-2">
                <CheckCircle className="w-4 h-4 text-[#4edea3]" />
                <span className="text-xs font-mono text-white">DIRECT FEED READY // 0 PRINT FAULTS</span>
              </div>
              <button
                onClick={handleFeed1X}
                type="button"
                className="h-7 px-4 bg-[#4cd7f6] hover:bg-[#acedff] text-[#003640] text-xs font-mono font-bold rounded transition-colors shadow"
              >
                FEED 1X
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* LIVE BATCH EXECUTION LEDGER */}
      <section className="bg-[#131b2d] rounded-xl p-5 shadow-xl flex flex-col gap-4 border border-[#424754]/30">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#424754]/30 pb-3">
          <div className="flex items-center gap-2.5">
            <Printer className="w-5 h-5 text-[#4d8eff]" />
            <div>
              <h3 className="text-sm font-bold text-white">LIVE BATCH EXECUTION LEDGER</h3>
              <span className="text-xs font-mono text-[#c2c6d6]/70">
                High-throughput serialized jobs with cryptographically checked ZPL output
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-1.5 px-3 py-1 bg-[#171f32] rounded border border-[#424754]/30 text-xs font-mono text-white">
              <RefreshCw className="w-3.5 h-3.5 text-[#4cd7f6] animate-spin" />
              <span>Auto-Poll: 2s</span>
            </div>
          </div>
        </div>

        {/* Ledger Table */}
        <div className="overflow-x-auto rounded-lg">
          <table className="w-full text-left font-mono text-xs">
            <thead>
              <tr className="bg-[#060e1f] text-[#c2c6d6]/80 uppercase text-[10px] border-b border-[#424754]/40">
                <th className="py-2.5 px-3">Job ID</th>
                <th className="py-2.5 px-3">Product Model & Spec</th>
                <th className="py-2.5 px-3">Category / HSN</th>
                <th className="py-2.5 px-3">Template Target</th>
                <th className="py-2.5 px-3">Batch Qty</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#424754]/20">
              {filteredJobs.map((job) => {
                const statusColor =
                  job.status === 'PRINTED'
                    ? 'bg-[#4edea3]/20 text-[#4edea3]'
                    : job.status === 'VERIFIED'
                    ? 'bg-[#4cd7f6]/20 text-[#4cd7f6]'
                    : 'bg-[#4d8eff]/20 text-[#adc6ff]';

                return (
                  <tr key={job.id} className="hover:bg-[#171f32]/70 transition-colors">
                    <td className="py-3 px-3 text-[#4cd7f6] font-bold">{job.id}</td>
                    <td className="py-3 px-3">
                      <div className="flex flex-col">
                        <span className="text-white font-semibold text-xs font-sans">{job.productModel}</span>
                        <span className="text-[#c2c6d6]/70 text-[10px]">{job.spec}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-[#c2c6d6]">{job.category}</td>
                    <td className="py-3 px-3 text-white">{job.templateTarget}</td>
                    <td className="py-3 px-3 text-white">
                      <span className="font-bold text-[#4edea3]">{job.batchQty}</span> / {job.totalQty}
                    </td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${statusColor}`}>
                        {job.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleInspectJob(job)}
                          title="Inspect Job Metadata"
                          className="p-1 text-[#c2c6d6] hover:text-white hover:bg-[#222a3d] rounded"
                          type="button"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleReSpool(job)}
                          title="Re-Spool to Line 04"
                          className="p-1 text-[#4cd7f6] hover:text-white hover:bg-[#222a3d] rounded"
                          type="button"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleShowZpl(job)}
                          title="View Raw ZPL II Stream"
                          className="px-1.5 py-0.5 text-[10px] font-bold text-[#adc6ff] hover:bg-[#222a3d] rounded"
                          type="button"
                        >
                          ZPL
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Ledger Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-[#c2c6d6]/70 text-xs font-mono pt-1">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#4edea3]"></span>
            <span>SPOOL PROCESSOR: THREAD #08 ALIVE • MEM CONSUMPTION: 142MB</span>
          </div>
          <span>SHOWING {filteredJobs.length} OF {jobs.length} ACTIVE PRODUCTION JOBS</span>
        </div>
      </section>

      {/* MODAL POPUP FOR INSPECT / ZPL / CALIBRATION */}
      {activeModalType && (
        <div className="fixed inset-0 bg-[#060e1f]/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#131b2d] border border-[#424754]/40 max-w-xl w-full rounded-xl p-5 shadow-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-[#424754]/30 pb-3">
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <FileCode className="w-4 h-4 text-[#4cd7f6]" />
                <span>{modalTitle}</span>
              </div>
              <button
                onClick={() => setActiveModalType(null)}
                className="text-[#c2c6d6] hover:text-white"
                type="button"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="font-mono text-xs text-[#dbe2fb] bg-[#060e1f] p-4 rounded-lg max-h-80 overflow-y-auto whitespace-pre-wrap border border-[#424754]/30">
              {modalContent}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setActiveModalType(null)}
                className="h-8 px-4 bg-[#222a3d] hover:bg-[#2d3448] text-white text-xs font-mono rounded"
                type="button"
              >
                Close
              </button>
              {activeModalType === 'ZPL' && (
                <button
                  onClick={() => {
                    navigator.clipboard?.writeText(modalContent);
                    alert('ZPL stream copied to clipboard');
                  }}
                  className="h-8 px-4 bg-[#4d8eff] hover:bg-[#3b82f6] text-white text-xs font-mono rounded font-semibold"
                  type="button"
                >
                  Copy ZPL
                </button>
              )}
              {activeModalType !== 'ZPL' && (
                <button
                  onClick={() => setActiveModalType(null)}
                  className="h-8 px-4 bg-[#4d8eff] hover:bg-[#3b82f6] text-white text-xs font-mono rounded font-semibold"
                  type="button"
                >
                  Acknowledge
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
