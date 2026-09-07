import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Key,
  Lock,
  Mail,
  Eye,
  EyeOff,
  Radio,
  ShieldCheck,
  CheckCircle2,
  X,
  Cpu,
  Printer,
  Sparkles,
  ArrowRight,
  Fingerprint
} from 'lucide-react';
import { RitLogo } from '../components/common/RitLogo';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

interface LoginProps {
  onSuccess: () => void;
}

export const Login: React.FC<LoginProps> = ({ onSuccess }) => {
  const { login } = useAuth();
  const toast = useToast();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [email, setEmail] = useState('ramaIT@yopmail.com');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast.error('Please enter both email and password.');
      return;
    }

    setIsLoading(true);
    try {
      await login(email.trim(), password);
      toast.success('Enterprise Terminal Authentication Successful!');
      onSuccess();
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'Authentication failed. Please verify credentials.';
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemoLogin = async () => {
    setIsLoading(true);
    try {
      setEmail('ramaIT@yopmail.com');
      setPassword('');
      toast.info('Admin email filled. Enter the admin password to continue.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#f4f7fb] text-slate-800 flex flex-col justify-between p-4 sm:p-6 relative overflow-hidden font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* Precision Dot Matrix Grid Background */}
      <div
        className="absolute inset-0 pointer-events-none opacity-40"
        style={{
          backgroundImage: 'radial-gradient(#94a3b8 1.2px, transparent 1.2px)',
          backgroundSize: '24px 24px',
        }}
      />

      {/* Atmospheric Soft Radiant Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[500px] bg-sky-200/50 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[350px] h-[350px] bg-blue-300/30 rounded-full blur-[100px] pointer-events-none" />

      {/* ============================================================
          TOP STATUS BAR PILL
          ============================================================ */}
      <div className="relative z-10 flex items-center justify-center pt-2">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap items-center justify-between gap-3 sm:gap-6 px-4 py-2 bg-white/90 backdrop-blur-md rounded-full border border-sky-200/80 shadow-sm shadow-blue-500/5 text-xs font-semibold text-slate-700 max-w-2xl w-full"
        >
          {/* Brand & Terminal Identifier */}
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
            <span className="font-bold tracking-wider text-slate-900">RAMA IT SOLUTION</span>
            <span className="text-slate-300">•</span>
            <span className="text-slate-500 font-mono text-[11px]">TERMINAL v4.8</span>
          </div>

          {/* Status Indicators */}
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[11px] font-medium border border-blue-100">
              <Radio className="w-3 h-3 text-blue-600 animate-pulse" />
              Line 4 Online
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-800 text-[11px] font-medium border border-sky-100">
              <ShieldCheck className="w-3.5 h-3.5 text-sky-600" />
              IS 13252 Compliant
            </span>
          </div>
        </motion.div>
      </div>

      {/* ============================================================
          CENTER 3D GLASS CARD & LOGO NODE
          ============================================================ */}
      <div className="relative z-10 flex-1 flex items-center justify-center py-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          whileHover={{
            rotateY: 2,
            rotateX: -2,
            boxShadow: '0 25px 50px -12px rgba(14, 116, 144, 0.25)',
          }}
          style={{ perspective: 1200 }}
          onClick={() => setIsFormOpen(true)}
          className="relative w-full max-w-[430px] sm:max-w-[460px] bg-white/95 backdrop-blur-xl rounded-[36px] border border-sky-100 shadow-[0_20px_60px_-15px_rgba(30,58,138,0.18)] p-8 sm:p-10 cursor-pointer group transition-all duration-300 select-none"
        >
          {/* Engineering Corner Brackets */}
          <div className="absolute top-5 left-5 text-slate-300 font-mono text-xs select-none">⌜</div>
          <div className="absolute top-5 right-5 text-slate-300 font-mono text-xs select-none">⌝</div>
          <div className="absolute bottom-5 left-5 text-slate-300 font-mono text-xs select-none">⌞</div>
          <div className="absolute bottom-5 right-5 text-slate-300 font-mono text-xs select-none">⌟</div>

          {/* Node Badge */}
          <div className="flex justify-center mb-6">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-50 border border-slate-200/80 text-[11px] font-semibold text-slate-600 shadow-xs">
              <Fingerprint className="w-3.5 h-3.5 text-sky-600" />
              Enterprise Authentication Node
            </span>
          </div>

          {/* 3D RIT Monogram & Brand Typography */}
          <div className="py-2 transform group-hover:scale-105 transition-transform duration-300">
            <RitLogo
              variant="full"
              size="2xl"
              theme="light"
              showCompanyText={true}
              companyName="RAMA IT SOLUTION"
              tagline="IDEAS DRIVE PROGRESS"
              glow={true}
            />
          </div>

          {/* Main Glowing Action Button */}
          <div className="mt-8">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsFormOpen(true);
              }}
              className="w-full py-3.5 px-5 bg-gradient-to-r from-[#0c2452] via-[#123b82] to-[#1e4da1] hover:from-[#091b3f] hover:to-[#174088] text-white font-bold text-xs uppercase tracking-widest rounded-2xl shadow-lg shadow-blue-900/25 flex items-center justify-center gap-2.5 transition-all transform group-hover:shadow-blue-600/30 group-hover:-translate-y-0.5 cursor-pointer"
            >
              <Key className="w-4 h-4 text-sky-300" />
              <span>CLICK LOGO TO LOGIN</span>
              <ArrowRight className="w-4 h-4 text-sky-300" />
            </button>

            <p className="text-center text-[10px] text-slate-400 font-mono mt-3">
              Touch or click anywhere on this card to open secure terminal
            </p>
          </div>
        </motion.div>
      </div>

      {/* ============================================================
          INTERACTIVE LOGIN CREDENTIALS MODAL / TERMINAL DRAWER
          ============================================================ */}
      <AnimatePresence>
        {isFormOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 15 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 p-7 sm:p-8 overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#0c2452] to-[#1e4da1] flex items-center justify-center text-white shadow-md shadow-blue-900/20">
                    <Key className="w-5 h-5 text-sky-300" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 tracking-tight">
                      Security Terminal Login
                    </h3>
                    <p className="text-xs text-slate-400 font-medium">
                      Enter credentials for JWT encrypted access
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsFormOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Login Form */}
              <form onSubmit={handleSubmit} className="py-5 space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    User Email / Operator ID
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="ramaIT@yopmail.com"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-11 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 cursor-pointer select-none text-slate-600">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                    />
                    <span>Remember terminal token</span>
                  </label>
                  <span className="text-[11px] font-mono text-emerald-600 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> 256-Bit SSL
                  </span>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-2 py-3 px-4 bg-gradient-to-r from-[#0c2452] via-[#123b82] to-[#1e4da1] hover:from-[#091b3f] hover:to-[#174088] text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md shadow-blue-900/20 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Authenticating...</span>
                    </>
                  ) : (
                    <>
                      <span>Authorize Terminal Access</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Quick Demo Helper */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between bg-slate-50/80 -mx-7 sm:-mx-8 -mb-7 sm:-mb-8 p-4 px-7 sm:px-8">
                <div>
                  <p className="text-[11px] font-bold text-slate-800">Demo Admin Account</p>
                  <p className="text-[10px] text-slate-500 font-mono">ramaIT@yopmail.com</p>
                </div>
                <button
                  type="button"
                  onClick={handleQuickDemoLogin}
                  disabled={isLoading}
                  className="px-3 py-1.5 bg-sky-100 hover:bg-sky-200 text-sky-800 font-semibold rounded-lg text-xs transition cursor-pointer"
                >
                  1-Click Sign In
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ============================================================
          BOTTOM COMPLIANCE FOOTER
          ============================================================ */}
      <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] font-medium text-slate-400 border-t border-slate-200/60 pt-3 max-w-6xl w-full mx-auto">
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 font-mono text-[10px]">
          <span className="flex items-center gap-1 text-slate-500">
            <Cpu className="w-3 h-3 text-sky-600" />
            Hardware Encrypted
          </span>
          <span>•</span>
          <span className="flex items-center gap-1 text-slate-500">
            <Printer className="w-3 h-3 text-sky-600" />
            ZPL / TSPL Direct
          </span>
          <span>•</span>
          <span className="text-slate-500">PWM 2022 Certified</span>
        </div>

        <div className="font-mono text-[10px] text-slate-500 tracking-wider text-center">
          © 2026 RAMA IT SOLUTION • ALL RIGHTS RESERVED
        </div>
      </div>
    </div>
  );
};
