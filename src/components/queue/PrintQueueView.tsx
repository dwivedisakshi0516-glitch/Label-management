import React, { useState } from 'react';
import { PrintJob } from '../../types';
import { INITIAL_JOBS } from '../../data/mockData';
import { useAuth } from '../../context/AuthContext';
import {
  Printer,
  Play,
  Pause,
  RotateCcw,
  CheckCircle,
  AlertTriangle,
  FileText,
  Clock,
  Trash2,
  HardDrive,
  Zap,
  Check
} from 'lucide-react';

export const PrintQueueView: React.FC = () => {
  const { canPerform } = useAuth();
  const [jobs, setJobs] = useState<PrintJob[]>(INITIAL_JOBS);
  const [isPaused, setIsPaused] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const handleTogglePause = () => {
    setIsPaused(!isPaused);
    setToast(isPaused ? 'Line 04 Print Queue resumed.' : 'Line 04 Print Queue paused.');
    setTimeout(() => setToast(null), 3000);
  };

  const handleFlushQueue = () => {
    if (confirm('Flush all pending packets in physical printer buffer?')) {
      setJobs((prev) => prev.filter((j) => j.status === 'PRINTED'));
      setToast('Buffer flushed. Pending spools cleared.');
      setTimeout(() => setToast(null), 3000);
    }
  };

  const handlePrintNow = (jobId: string) => {
    setJobs((prev) =>
      prev.map((j) => (j.id === jobId ? { ...j, status: 'PRINTED', batchQty: j.totalQty } : j))
    );
    setToast(`Job ${jobId} dispatched to Zebra ZT411 printhead.`);
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <div className="flex flex-col w-full gap-6 pb-12">
      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#00a572] text-[#00285d] font-bold text-xs px-4 py-3 rounded-lg shadow-2xl flex items-center gap-2 border border-[#4edea3] animate-in fade-in">
          <Check className="w-4 h-4" />
          <span>{toast}</span>
        </div>
      )}

      {/* QUEUE HEADER */}
      <section className="bg-[#131b2d] rounded-xl p-5 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-[#424754]/30">
        <div>
          <div className="flex items-center gap-2 font-mono text-xs text-[#4cd7f6] uppercase tracking-wider font-semibold">
            <span>OPERATIONS</span>
            <span className="text-[#424754]">/</span>
            <span>HARDWARE BUFFER</span>
            <span className="text-[#424754]">/</span>
            <span>PRINT QUEUE</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight mt-1">
            LINE 04 HARDWARE PRINT SPOOLER
          </h1>
          <p className="text-xs text-[#c2c6d6]/70 mt-0.5">
            Real-time direct byte-stream buffer to Zebra ZT411 Industrial thermal head.
          </p>
        </div>

        {/* Queue Control Buttons */}
        <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
          <button
            onClick={handleTogglePause}
            type="button"
            className={`h-8 px-3.5 rounded flex items-center gap-1.5 font-bold transition-all ${
              isPaused
                ? 'bg-[#4edea3] hover:bg-[#00a572] text-[#002e6a]'
                : 'bg-[#ffb4ab]/20 hover:bg-[#ffb4ab]/30 text-[#ffb4ab] border border-[#ffb4ab]/40'
            }`}
          >
            {isPaused ? <Play className="w-3.5 h-3.5 fill-current" /> : <Pause className="w-3.5 h-3.5 fill-current" />}
            <span>{isPaused ? 'Resume Spool' : 'Pause Queue'}</span>
          </button>

          <button
            onClick={handleFlushQueue}
            type="button"
            className="h-8 px-3 bg-[#060e1f] hover:bg-[#222a3d] text-[#ffb4ab] border border-[#ffb4ab]/30 rounded flex items-center gap-1.5 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Flush Buffer</span>
          </button>
        </div>
      </section>

      {/* Telemetry Metric Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 font-mono text-xs">
        <div className="bg-[#131b2d] p-3.5 rounded-xl border border-[#424754]/30 flex flex-col justify-between">
          <span className="text-[10px] text-[#c2c6d6]/70 uppercase">BUFFER CONSUMPTION</span>
          <span className="text-xl font-bold text-white mt-1">4 Spool Packets</span>
          <span className="text-[10px] text-[#4edea3]">Memory: 1,024 KB Used</span>
        </div>

        <div className="bg-[#131b2d] p-3.5 rounded-xl border border-[#424754]/30 flex flex-col justify-between">
          <span className="text-[10px] text-[#c2c6d6]/70 uppercase">ETHERNET LATENCY</span>
          <span className="text-xl font-bold text-[#4cd7f6] mt-1">12 ms</span>
          <span className="text-[10px] text-[#c2c6d6]/70">TCP Port 9100</span>
        </div>

        <div className="bg-[#131b2d] p-3.5 rounded-xl border border-[#424754]/30 flex flex-col justify-between">
          <span className="text-[10px] text-[#c2c6d6]/70 uppercase">DISPATCH ENGINE</span>
          <span className="text-xl font-bold text-white mt-1">ZPL-II Stream</span>
          <span className="text-[10px] text-[#4edea3]">Direct Photogate Sync</span>
        </div>

        <div className="bg-[#131b2d] p-3.5 rounded-xl border border-[#424754]/30 flex flex-col justify-between">
          <span className="text-[10px] text-[#c2c6d6]/70 uppercase">LINE STATUS</span>
          <span className="text-xl font-bold text-[#4edea3] mt-1">
            {isPaused ? 'PAUSED' : 'STREAMING'}
          </span>
          <span className="text-[10px] text-[#c2c6d6]/70">Zebra ZT411 Ready</span>
        </div>
      </div>

      {/* QUEUE JOBS LIST */}
      <div className="bg-[#131b2d] rounded-xl border border-[#424754]/30 shadow-xl overflow-hidden">
        <div className="p-4 border-b border-[#424754]/30 flex items-center justify-between">
          <span className="text-xs font-mono uppercase font-bold text-white tracking-wider flex items-center gap-2">
            <Printer className="w-4 h-4 text-[#4cd7f6]" /> ACTIVE ENQUEUED PRINT PACKETS ({jobs.length})
          </span>
          <span className="text-[10px] font-mono text-[#4edea3]">FIFO PRIORITY ORDER</span>
        </div>

        <div className="divide-y divide-[#424754]/20">
          {jobs.map((job, idx) => {
            const isFinished = job.status === 'PRINTED';
            const progress = isFinished ? 100 : Math.round((job.batchQty / job.totalQty) * 100);

            return (
              <div
                key={job.id}
                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#171f32]/60 transition-colors font-mono text-xs"
              >
                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded bg-[#060e1f] text-[#4cd7f6] flex items-center justify-center font-bold text-xs">
                    {idx + 1}
                  </span>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-white font-bold font-sans text-sm">{job.productModel}</span>
                      <span className="text-[#4cd7f6] font-bold text-xs">{job.id}</span>
                      <span className="px-2 py-0.5 rounded bg-[#060e1f] text-[#c2c6d6] text-[10px]">
                        {job.templateTarget}
                      </span>
                    </div>

                    <div className="text-[11px] text-[#c2c6d6]/70 mt-0.5">
                      {job.spec} • MRP: {job.mrp} • MFD: {job.mfgDate}
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full max-w-xs sm:w-64 bg-[#060e1f] h-1.5 rounded-full overflow-hidden mt-2">
                      <div
                        className={`h-full ${isFinished ? 'bg-[#4edea3]' : 'bg-[#4d8eff]'}`}
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-[#424754]/20">
                  <div className="text-left sm:text-right">
                    <span className="text-white font-bold text-sm block">
                      {job.batchQty} / {job.totalQty} Units
                    </span>
                    <span className="text-[10px] text-[#c2c6d6]/60">{progress}% complete</span>
                  </div>

                  <div>
                    {job.status !== 'PRINTED' ? (
                      <button
                        onClick={() => handlePrintNow(job.id)}
                        type="button"
                        className="px-3 py-1.5 bg-[#4d8eff] hover:bg-[#3b82f6] text-white rounded font-bold text-xs flex items-center gap-1.5 shadow"
                      >
                        <Zap className="w-3.5 h-3.5 fill-white" />
                        <span>Dispatch Now</span>
                      </button>
                    ) : (
                      <span className="px-3 py-1 rounded bg-[#00a572]/20 text-[#4edea3] font-bold text-xs flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Completed</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
