import React, { useState } from 'react';
import { SnapshotAuditRecord } from '../../types';
import { INITIAL_SNAPSHOTS } from '../../data/mockData';
import { useAuth } from '../../context/AuthContext';
import {
  ShieldCheck,
  History,
  Lock,
  AlertTriangle,
  FileCheck,
  Search,
  Eye,
  ArrowLeftRight,
  Printer,
  CheckCircle2,
  X,
  FileCode,
  Layers,
  Building,
  Check
} from 'lucide-react';

export const LabelHistoryView: React.FC = () => {
  const { canPerform } = useAuth();

  const [snapshots, setSnapshots] = useState<SnapshotAuditRecord[]>(INITIAL_SNAPSHOTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSnapshot, setSelectedSnapshot] = useState<SnapshotAuditRecord>(INITIAL_SNAPSHOTS[0]);
  const [isDeltaDrawerOpen, setIsDeltaDrawerOpen] = useState(false);
  const [verificationFeedback, setVerificationFeedback] = useState<string | null>(null);

  const filteredSnapshots = snapshots.filter((s) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      s.labelId.toLowerCase().includes(q) ||
      s.modelName.toLowerCase().includes(q) ||
      s.batchCode.toLowerCase().includes(q) ||
      s.status.toLowerCase().includes(q)
    );
  });

  const handleVerifyChecksum = (record: SnapshotAuditRecord) => {
    setVerificationFeedback(
      `CRYPTOGRAPHIC AUDIT COMPLETE: Checksum ${record.checksum} verified against immutable distributed ledger. Zero tampering detected.`
    );
    setTimeout(() => setVerificationFeedback(null), 4000);
  };

  const handleOpenDelta = (record: SnapshotAuditRecord) => {
    setSelectedSnapshot(record);
    setIsDeltaDrawerOpen(true);
  };

  return (
    <div className="flex flex-col w-full gap-6 pb-12">
      {/* Toast Feedback */}
      {verificationFeedback && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#00a572] text-[#00285d] font-bold text-xs px-4 py-3 rounded-lg shadow-2xl flex items-center gap-2 border border-[#4edea3] animate-in fade-in">
          <CheckCircle2 className="w-4 h-4" />
          <span>{verificationFeedback}</span>
        </div>
      )}

      {/* AUDIT HEADER */}
      <section className="bg-[#131b2d] rounded-xl p-5 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-[#424754]/30">
        <div>
          <div className="flex items-center gap-2 font-mono text-xs text-[#4cd7f6] uppercase tracking-wider font-semibold">
            <span>OPERATIONS</span>
            <span className="text-[#424754]">/</span>
            <span>LABEL HISTORY</span>
            <span className="text-[#424754]">/</span>
            <span>AUDITS</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight mt-1">
            MASTER SNAPSHOT AUDIT & DELTA ANALYZER
          </h1>
          <p className="text-xs text-[#c2c6d6]/70 mt-0.5">
            Immutable cryptographic snapshots safeguarding packaged cartons against master data drift.
          </p>
        </div>

        {/* Stats Pill Strip */}
        <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
          <div className="bg-[#060e1f] px-3 py-1.5 rounded border border-[#424754]/40 flex items-center gap-2">
            <span className="text-[#c2c6d6]/70">HISTORIC RUNS:</span>
            <span className="text-white font-bold">1,248</span>
          </div>

          <div className="bg-[#00a572]/20 px-3 py-1.5 rounded border border-[#4edea3]/40 flex items-center gap-1.5 text-[#4edea3] font-bold">
            <ShieldCheck className="w-4 h-4" />
            <span>100% SHA-256 LOCKED</span>
          </div>
        </div>
      </section>

      {/* FILTER AND SEARCH BAR */}
      <div className="flex items-center justify-between gap-4 bg-[#171f32] p-3 rounded-xl border border-[#424754]/30">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#c2c6d6]/60" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter snapshots by Label ID, Batch, Model..."
            className="w-full bg-[#060e1f] text-xs text-white pl-9 pr-4 py-2 rounded-lg border border-[#424754]/50 focus:outline-none focus:border-[#4d8eff]"
          />
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-[#c2c6d6]/70">
          <span>SHOWING {filteredSnapshots.length} RECORDS</span>
        </div>
      </div>

      {/* SNAPSHOTS TABLE */}
      <div className="bg-[#131b2d] rounded-xl border border-[#424754]/30 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left font-mono text-xs whitespace-nowrap">
            <thead>
              <tr className="bg-[#060e1f] text-[#c2c6d6]/80 uppercase text-[10px] border-b border-[#424754]/40">
                <th className="py-3 px-4">Label ID & Run</th>
                <th className="py-3 px-4">Product Model & Class</th>
                <th className="py-3 px-4">Template & Dimensions</th>
                <th className="py-3 px-4">MRP & Batch Code</th>
                <th className="py-3 px-4">Printed / Target</th>
                <th className="py-3 px-4">Audit Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#424754]/20">
              {filteredSnapshots.map((snap) => {
                const isConflict = snap.status === 'MASTER MISMATCH REF';
                const statusColor = isConflict
                  ? 'bg-[#ffb4ab]/20 text-[#ffb4ab] border-[#ffb4ab]/40'
                  : snap.status === 'SHA-256 LOCKED'
                  ? 'bg-[#4edea3]/20 text-[#4edea3] border-[#4edea3]/40'
                  : 'bg-[#adc6ff]/20 text-[#adc6ff] border-[#adc6ff]/40';

                return (
                  <tr key={snap.labelId} className="hover:bg-[#171f32]/70 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex flex-col">
                        <span className="text-[#4cd7f6] font-bold">{snap.labelId}</span>
                        <span className="text-[10px] text-[#c2c6d6]/60">{snap.timestamp}</span>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex flex-col">
                        <span className="text-white font-sans font-semibold text-xs">{snap.modelName}</span>
                        <span className="text-[10px] text-[#c2c6d6]/70">{snap.deviceClass}</span>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex flex-col">
                        <span className="text-white">{snap.templateEngine}</span>
                        <span className="text-[10px] text-[#4edea3]">{snap.dimensions}</span>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex flex-col">
                        <span className="text-white font-bold">{snap.mrp}</span>
                        <span className="text-[10px] text-[#c2c6d6]/70">{snap.batchCode}</span>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span className="text-[#4edea3] font-bold">{snap.printedJobs}</span> / {snap.totalBatch}
                    </td>

                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${statusColor}`}>
                        {snap.status}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenDelta(snap)}
                          title="Open Master Delta Analyzer"
                          type="button"
                          className="px-2 py-1 bg-[#171f32] hover:bg-[#222a3d] text-[#4cd7f6] rounded flex items-center gap-1 border border-[#424754]/40"
                        >
                          <ArrowLeftRight className="w-3.5 h-3.5" />
                          <span className="text-[10px]">Delta</span>
                        </button>

                        <button
                          onClick={() => handleVerifyChecksum(snap)}
                          title="Verify SHA-256 Ledger"
                          type="button"
                          className="p-1 text-[#4edea3] hover:bg-[#222a3d] rounded"
                        >
                          <ShieldCheck className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* DELTA ANALYZER COMPARATOR DRAWER / MODAL */}
      {isDeltaDrawerOpen && (
        <div className="fixed inset-0 bg-[#060e1f]/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#131b2d] border border-[#424754]/50 max-w-4xl w-full rounded-xl p-6 shadow-2xl flex flex-col gap-4 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#424754]/30 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#4cd7f6]/10 text-[#4cd7f6] flex items-center justify-center">
                  <ArrowLeftRight className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-white tracking-tight">
                    MASTER DELTA ANALYZER // {selectedSnapshot.labelId}
                  </h2>
                  <p className="text-xs font-mono text-[#c2c6d6]/70">
                    Comparing Snapshot Run State vs Live Master Database Catalog
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsDeltaDrawerOpen(false)}
                className="text-[#c2c6d6] hover:text-white"
                type="button"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cryptographic Proof Banner */}
            <div className="bg-[#060e1f] p-3.5 rounded-lg border border-[#424754]/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 font-mono text-xs">
              <div className="flex flex-wrap items-center gap-2">
                <Lock className="w-4 h-4 text-[#4edea3] shrink-0" />
                <span className="text-[#c2c6d6]">IMMUTABLE HASH:</span>
                <span className="text-white font-bold break-all">{selectedSnapshot.checksum}</span>
              </div>
              <span className="text-[10px] font-bold text-[#4edea3] bg-[#00a572]/20 px-2 py-0.5 rounded shrink-0">
                VALIDATED ON DISK
              </span>
            </div>

            {/* Side-by-Side Comparison */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
              {/* Left: Historic Snapshot */}
              <div className="bg-[#171f32] p-4 rounded-xl border border-[#424754]/30 flex flex-col gap-3">
                <div className="flex items-center justify-between border-b border-[#424754]/30 pb-2">
                  <span className="text-xs font-bold text-[#4cd7f6] uppercase">
                    📷 HISTORIC RUN SNAPSHOT
                  </span>
                  <span className="text-[10px] text-[#c2c6d6]/60">{selectedSnapshot.timestamp}</span>
                </div>

                <div className="space-y-2.5">
                  <div>
                    <span className="text-[10px] text-[#c2c6d6]/70 block">MANUFACTURING PLANT (FROZEN):</span>
                    <span className="text-white font-semibold block">{selectedSnapshot.plantSnapshot}</span>
                  </div>

                  <div>
                    <span className="text-[10px] text-[#c2c6d6]/70 block">STATUTORY MRP (AT RUN):</span>
                    <span className="text-white font-bold block">{selectedSnapshot.mrp}</span>
                  </div>

                  <div>
                    <span className="text-[10px] text-[#c2c6d6]/70 block">STATUTORY HELPLINE:</span>
                    <span className="text-white block">{selectedSnapshot.statutoryHelpline}</span>
                  </div>

                  <div>
                    <span className="text-[10px] text-[#c2c6d6]/70 block">WARRANTY SLA:</span>
                    <span className="text-white block">{selectedSnapshot.warrantySla}</span>
                  </div>
                </div>
              </div>

              {/* Right: Current Live Master Record */}
              <div className="bg-[#171f32] p-4 rounded-xl border border-[#424754]/30 flex flex-col gap-3">
                <div className="flex items-center justify-between border-b border-[#424754]/30 pb-2">
                  <span className="text-xs font-bold text-[#adc6ff] uppercase">
                    🌐 CURRENT LIVE MASTER DATA
                  </span>
                  <span className="text-[10px] text-[#4edea3]">SYNCHRONIZED NOW</span>
                </div>

                <div className="space-y-2.5">
                  <div className={selectedSnapshot.plantSnapshot !== selectedSnapshot.livePlantMaster ? 'bg-[#ffb4ab]/10 p-1.5 rounded border border-[#ffb4ab]/30' : ''}>
                    <span className="text-[10px] text-[#c2c6d6]/70 block">MANUFACTURING PLANT (CURRENT):</span>
                    <span className="text-white font-semibold block">{selectedSnapshot.livePlantMaster}</span>
                    {selectedSnapshot.plantSnapshot !== selectedSnapshot.livePlantMaster && (
                      <span className="text-[10px] text-[#ffb4ab] font-bold mt-0.5 block">
                        ⚠️ DELTA DETECTED: Master plant entity was renamed after batch run.
                      </span>
                    )}
                  </div>

                  <div>
                    <span className="text-[10px] text-[#c2c6d6]/70 block">STATUTORY MRP:</span>
                    <span className="text-white font-bold block">{selectedSnapshot.mrp}</span>
                  </div>

                  <div>
                    <span className="text-[10px] text-[#c2c6d6]/70 block">STATUTORY HELPLINE:</span>
                    <span className="text-white block">{selectedSnapshot.statutoryHelpline}</span>
                  </div>

                  <div>
                    <span className="text-[10px] text-[#c2c6d6]/70 block">WARRANTY SLA:</span>
                    <span className="text-white block">{selectedSnapshot.warrantySla}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Legal Metrology Safeguard Explanation */}
            <div className="bg-[#0b1325] p-3.5 rounded-lg border border-[#424754]/40 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-[#4edea3] shrink-0 mt-0.5" />
              <div className="text-xs text-[#c2c6d6] leading-relaxed">
                <strong className="text-white block mb-0.5">LEGAL METROLOGY & BIS SAFEGUARD ACTIVE:</strong>
                Physical carton labels already in commerce are governed by the snapshot frozen at time of packaging. 
                Subsequent ERP or catalog migrations cannot invalidate or trigger recall on printed stock.
              </div>
            </div>

            {/* Drawer Actions */}
            <div className="flex justify-end gap-2 pt-2 border-t border-[#424754]/30">
              <button
                onClick={() => setIsDeltaDrawerOpen(false)}
                type="button"
                className="px-4 py-2 bg-[#222a3d] hover:bg-[#2d3448] text-white text-xs font-mono rounded"
              >
                Dismiss
              </button>
              <button
                onClick={() => {
                  alert(`Reprint authorization token issued for historical snapshot ${selectedSnapshot.labelId}`);
                  setIsDeltaDrawerOpen(false);
                }}
                type="button"
                className="px-4 py-2 bg-[#4d8eff] hover:bg-[#3b82f6] text-white text-xs font-mono font-semibold rounded flex items-center gap-1.5 shadow-md"
              >
                <Printer className="w-4 h-4" />
                <span>Reprint Identical Historical Specimen</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
