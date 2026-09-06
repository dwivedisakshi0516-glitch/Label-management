import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';
import { RitLogo } from '../common/RitLogo';
import {
  User,
  Lock,
  Eye,
  EyeOff,
  Shield,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ChevronRight,
  ArrowRight,
  Fingerprint,
  ScanLine,
  Cpu,
  KeyRound,
  ShieldCheck,
  Building2,
  Radio,
  Printer
} from 'lucide-react';

interface LoginPageProps {
  onSuccess?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onSuccess }) => {
  const { login, register, users } = useAuth();

  // "when we click on logo, the login should be open then"
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [usernameOrEmail, setUsernameOrEmail] = useState('marcus@apexlabels.internal');
  const [password, setPassword] = useState('MasterPass2026!');
  const [showPassword, setShowPassword] = useState(false);
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regRole, setRegRole] = useState<UserRole>('OPERATOR');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Quick fill demo credentials
  const fillDemoRole = (role: 'ADMIN' | 'OPERATOR') => {
    setErrorMessage('');
    const targetUser = users.find((u) => u.role === role);
    if (targetUser) {
      setUsernameOrEmail(targetUser.email);
      setPassword('MasterPass2026!');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    setTimeout(() => {
      if (isRegisterMode) {
        if (!regName || !regEmail) {
          setErrorMessage('Please provide your full name and enterprise email.');
          setIsSubmitting(false);
          return;
        }
        const registered = register(
          regName,
          regEmail,
          regRole,
          regRole === 'ADMIN'
            ? 'HQ Master Data Management Center'
            : 'Plant Line 4 / Packaging Floor'
        );
        if (registered) {
          setSuccessMessage(`Account created! Authenticated as ${regRole}.`);
          setTimeout(() => {
            if (onSuccess) onSuccess();
          }, 700);
        } else {
          setErrorMessage('An account with this email already exists.');
        }
      } else {
        if (!usernameOrEmail) {
          setErrorMessage('Please enter your username or enterprise email.');
          setIsSubmitting(false);
          return;
        }

        const match = users.find(
          (u) =>
            u.email.toLowerCase() === usernameOrEmail.toLowerCase() ||
            u.name.toLowerCase() === usernameOrEmail.toLowerCase()
        );

        if (match) {
          login(match.email, password);
          setSuccessMessage(`Welcome, ${match.name}! Entering workspace...`);
          setTimeout(() => {
            if (onSuccess) onSuccess();
          }, 700);
        } else {
          const directSuccess = login(usernameOrEmail, password);
          if (directSuccess) {
            setSuccessMessage('Credentials verified. Opening workspace...');
            setTimeout(() => {
              if (onSuccess) onSuccess();
            }, 700);
          } else {
            setErrorMessage('Invalid credentials. Use Quick Fill below for instant access.');
          }
        }
      }
      setIsSubmitting(false);
    }, 450);
  };

  return (
    <div
      id="unified-login-root"
      className="min-h-screen w-full flex flex-col items-center justify-between p-4 sm:p-8 md:p-12 relative overflow-x-hidden font-sans select-none"
      style={{
        backgroundColor: '#f8fafc',
        backgroundImage:
          'radial-gradient(#e2e8f0 1.2px, transparent 1.2px), radial-gradient(circle at 50% 30%, rgba(2, 132, 199, 0.05) 0%, transparent 65%), linear-gradient(to bottom, #ffffff 0%, #f8fafc 60%, #f1f5f9 100%)',
        backgroundSize: '24px 24px, 100% 100%, 100% 100%'
      }}
    >
      {/* Top Enterprise Security Status Bar */}
      <header className="w-full max-w-4xl flex items-center justify-between gap-4 py-2 px-4 rounded-2xl bg-white/80 border border-[#e2e8f0] shadow-sm backdrop-blur-md z-10">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 font-mono text-xs font-bold text-[#071530]">
            <span className="w-2.5 h-2.5 rounded-full bg-[#0284c7] animate-ping" />
            <span className="tracking-widest uppercase">RAMA IT SOLUTION</span>
            <span className="text-slate-300">•</span>
            <span className="text-slate-500 font-medium hidden sm:inline">TERMINAL v4.8</span>
          </div>
        </div>

        {/* Status Indicators & Custom SVG Badges */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-[11px] font-mono">
            <Radio className="w-3 h-3 text-[#0284c7] animate-pulse" />
            <span>Line 4 Online</span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#e0f2fe] border border-[#bae6fd] text-[#0369a1] text-[11px] font-mono font-semibold">
            <ShieldCheck className="w-3.5 h-3.5 text-[#0284c7]" />
            <span>IS 13252 Compliant</span>
          </div>
        </div>
      </header>

      {/* ========================================================= */}
      {/* MAIN SINGLE UNIFIED CONTAINER (CENTERPIECE)                */}
      {/* ========================================================= */}
      <main className="my-auto py-8 w-full max-w-lg flex flex-col items-center justify-center relative z-10">
        {!isLoginOpen ? (
          /* ======================================================= */
          /* STATE 1: THE DITTO RIT LOGO BOX (CLICK TO OPEN LOGIN)   */
          /* ======================================================= */
          <div
            id="rit-logo-interactive-card"
            onClick={() => setIsLoginOpen(true)}
            className="group w-full max-w-md cursor-pointer transition-all duration-500 transform hover:-translate-y-1.5 active:scale-[0.99] relative"
          >
            {/* Animated Laser Gradient Border Effect (CSS Animation) */}
            <div className="absolute -inset-[3px] rounded-[36px] bg-gradient-to-r from-[#0284c7] via-[#38bdf8] to-[#1e40af] opacity-75 group-hover:opacity-100 blur-[6px] group-hover:blur-[12px] transition-all duration-500 animate-laser-border" />

            {/* Pulsing Outer Glow Aura */}
            <div className="absolute -inset-2 rounded-[40px] bg-sky-400/20 blur-2xl group-hover:bg-sky-400/35 transition-all duration-500" />

            {/* Inner Logo Card (Off-White Canvas matching image.png DITTO) */}
            <div className="relative bg-white rounded-[32px] p-8 sm:p-12 shadow-[0_20px_50px_rgba(7,21,48,0.09)] border border-white/80 backdrop-blur-xl flex flex-col items-center text-center">
              {/* Corner Tech Grid SVG Accents */}
              <div className="absolute top-4 left-4 text-slate-300 pointer-events-none">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M2 10V2H10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
              <div className="absolute bottom-4 right-4 text-slate-300 pointer-events-none">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M22 14V22H14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>

              {/* Security Shield SVG Icon Badge */}
              <div className="mb-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-50 border border-slate-200 text-slate-600 text-xs font-mono">
                <Fingerprint className="w-3.5 h-3.5 text-[#0284c7] animate-pulse" />
                <span>Enterprise Authentication Node</span>
              </div>

              {/* The DITTO RIT Monogram in Full Fidelity */}
              <div className="w-full flex justify-center py-2 transition-transform duration-500 group-hover:scale-105">
                <RitLogo
                  variant="mark"
                  size="3xl"
                  theme="light"
                  glow={false}
                />
              </div>

              {/* DITTO Typography Exactly Matching image.png */}
              <div className="mt-6 flex flex-col items-center">
                {/* "R I T" */}
                <h1 className="text-4xl sm:text-5xl font-black tracking-[0.32em] text-[#071530] uppercase leading-none font-sans">
                  R I T
                </h1>

                {/* "IDEAS DRIVE PROGRESS" */}
                <p className="mt-3.5 text-xs sm:text-sm font-semibold tracking-[0.38em] sm:tracking-[0.45em] text-[#2f3e58] uppercase font-sans">
                  IDEAS DRIVE PROGRESS
                </p>

                {/* Company Name Sub-header */}
                <div className="mt-4 pt-3 border-t border-slate-100 w-full flex flex-col items-center">
                  <span className="text-xs sm:text-sm font-mono font-bold tracking-widest text-[#0f224a] uppercase">
                    RAMA IT SOLUTION
                  </span>
                </div>
              </div>

              {/* Interactive "Click to Open Login" Animated Action Pill */}
              <div className="mt-8 w-full">
                <div className="w-full py-3 px-6 rounded-full bg-gradient-to-r from-[#071530] via-[#0f2552] to-[#1e40af] text-white text-xs sm:text-sm font-semibold tracking-wider flex items-center justify-center gap-2 shadow-[0_8px_20px_rgba(7,21,48,0.25)] group-hover:shadow-[0_12px_28px_rgba(2,132,199,0.4)] transition-all duration-300">
                  <KeyRound className="w-4 h-4 text-[#38bdf8] animate-bounce" />
                  <span>CLICK LOGO TO LOGIN</span>
                  <ArrowRight className="w-4 h-4 text-[#38bdf8] group-hover:translate-x-1.5 transition-transform" />
                </div>
                <p className="text-[11px] font-mono text-slate-400 mt-2">
                  Touch or click anywhere on this card to open secure terminal
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* ======================================================= */
          /* STATE 2: THE EXPANDED LOGIN TERMINAL BOX               */
          /* ======================================================= */
          <div
            id="rit-login-box-card"
            className="w-full max-w-md relative animate-in fade-in zoom-in-95 duration-400"
          >
            {/* Animated Multi-Color Neon Glowing Border Frame */}
            <div className="absolute -inset-[2.5px] rounded-[32px] overflow-hidden pointer-events-none">
              <div className="absolute -inset-2 bg-gradient-to-tr from-[#0284c7] via-[#38bdf8] to-[#1d4ed8] opacity-80 blur-[4px] animate-laser-border" />
              <div className="absolute -inset-4 bg-gradient-to-r from-sky-400/30 via-blue-500/20 to-cyan-400/30 blur-xl" />
            </div>

            {/* Inner Terminal Container */}
            <div className="relative bg-white border border-slate-200/90 rounded-[30px] p-6 sm:p-8 shadow-2xl backdrop-blur-xl flex flex-col justify-between">
              {/* Header with Clickable Logo to return or inspect */}
              <div className="flex flex-col items-center text-center pb-4 border-b border-slate-100">
                {/* Clicking on the small logo at top allows toggling back to logo view */}
                <button
                  type="button"
                  onClick={() => setIsLoginOpen(false)}
                  className="group flex flex-col items-center hover:opacity-95 transition-all cursor-pointer"
                  title="Click to view full corporate logo showcase"
                >
                  <RitLogo
                    variant="mark"
                    size="md"
                    theme="light"
                    glow={false}
                  />
                  <div className="flex items-center gap-1 text-[11px] font-mono font-bold tracking-widest text-[#071530] uppercase mt-1">
                    <span>RIT</span>
                    <span className="text-slate-300">•</span>
                    <span className="text-[#0284c7]">RAMA IT SOLUTION</span>
                  </div>
                </button>

                {/* Login Title with Electric Cyan Accent */}
                <div className="mt-3 flex items-center gap-2">
                  <ScanLine className="w-5 h-5 text-[#0284c7]" />
                  <h2 className="text-2xl font-bold tracking-tight text-[#071530]">
                    {isRegisterMode ? 'Operator Enrollment' : 'Terminal Authentication'}
                  </h2>
                </div>
                <p className="text-xs font-mono text-slate-500 mt-1">
                  {isRegisterMode
                    ? 'Register credentials for Plant Line 4 operations'
                    : 'Enter authorized operator credentials to access workspace'}
                </p>
              </div>

              {/* Error Message */}
              {errorMessage && (
                <div className="my-3 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Success Message */}
              {successMessage && (
                <div className="my-3 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span className="font-semibold">{successMessage}</span>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4 pt-2">
                {isRegisterMode ? (
                  <>
                    {/* Full Name */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-mono text-slate-600 uppercase tracking-wider block font-semibold">
                        Full Legal Name
                      </label>
                      <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus-within:border-[#0284c7] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#0284c7]/20 transition-all">
                        <User className="w-4 h-4 text-[#0284c7] shrink-0" />
                        <input
                          type="text"
                          required
                          value={regName}
                          onChange={(e) => setRegName(e.target.value)}
                          placeholder="e.g. Marcus Vance"
                          className="w-full bg-transparent text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Email */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-mono text-slate-600 uppercase tracking-wider block font-semibold">
                        Enterprise Email
                      </label>
                      <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus-within:border-[#0284c7] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#0284c7]/20 transition-all">
                        <Building2 className="w-4 h-4 text-[#0284c7] shrink-0" />
                        <input
                          type="email"
                          required
                          value={regEmail}
                          onChange={(e) => setRegEmail(e.target.value)}
                          placeholder="marcus@apexlabels.internal"
                          className="w-full bg-transparent text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Role Selection */}
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-mono text-slate-600 uppercase tracking-wider block font-semibold">
                        Role Assignment
                      </label>
                      <div className="grid grid-cols-2 gap-2 font-mono text-xs">
                        <button
                          type="button"
                          onClick={() => setRegRole('ADMIN')}
                          className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                            regRole === 'ADMIN'
                              ? 'bg-[#e0f2fe] border-[#0284c7] text-[#0369a1] font-bold shadow-sm'
                              : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          👑 Level 1 Admin
                        </button>
                        <button
                          type="button"
                          onClick={() => setRegRole('OPERATOR')}
                          className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                            regRole === 'OPERATOR'
                              ? 'bg-[#e0f2fe] border-[#0284c7] text-[#0369a1] font-bold shadow-sm'
                              : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          ⚙️ Level 2 Operator
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    {/* User Name / ID Input with SVG Icon */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-mono text-slate-600 uppercase tracking-wider block font-semibold">
                        Operator ID / Enterprise Email
                      </label>
                      <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus-within:border-[#0284c7] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#0284c7]/20 transition-all">
                        <User className="w-4 h-4 text-[#0284c7] shrink-0" />
                        <input
                          type="text"
                          required
                          value={usernameOrEmail}
                          onChange={(e) => setUsernameOrEmail(e.target.value)}
                          placeholder="Operator ID or Email"
                          className="w-full bg-transparent text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none font-sans"
                        />
                      </div>
                    </div>

                    {/* Password Input with SVG Lock & Toggle */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-mono text-slate-600 uppercase tracking-wider block font-semibold">
                        Terminal Master Passcode
                      </label>
                      <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus-within:border-[#0284c7] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#0284c7]/20 transition-all">
                        <Lock className="w-4 h-4 text-[#0284c7] shrink-0" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Passcode"
                          className="w-full bg-transparent text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none font-sans"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="text-slate-400 hover:text-slate-700 transition-colors p-1 cursor-pointer"
                          title={showPassword ? 'Hide password' : 'Show password'}
                        >
                          {showPassword ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* 1-Click Quick Demo Profiles */}
                    <div className="pt-1">
                      <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 mb-1.5">
                        <span className="flex items-center gap-1 text-[#0284c7] font-semibold">
                          <Sparkles className="w-3 h-3" /> Quick Demo Fill:
                        </span>
                        <span>Auto-populates credentials</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 font-mono text-xs">
                        <button
                          type="button"
                          onClick={() => fillDemoRole('ADMIN')}
                          className="py-1.5 px-2.5 rounded-lg bg-slate-100 hover:bg-[#e0f2fe] border border-slate-200 hover:border-[#0284c7] text-[#071530] text-[11px] font-medium transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <span>👑</span>
                          <span>Admin Pass</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => fillDemoRole('OPERATOR')}
                          className="py-1.5 px-2.5 rounded-lg bg-slate-100 hover:bg-[#e0f2fe] border border-slate-200 hover:border-[#0284c7] text-[#071530] text-[11px] font-medium transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <span>⚙️</span>
                          <span>Operator Pass</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}

                {/* Submit Pill Button with CSS Neon Glow */}
                <div className="pt-2 flex justify-center">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-2.5 px-6 rounded-full bg-gradient-to-r from-[#071530] via-[#0f2552] to-[#1e40af] hover:from-[#0284c7] hover:to-[#0f2552] text-white font-mono font-bold text-sm tracking-wider shadow-[0_4px_16px_rgba(2,132,199,0.35)] hover:shadow-[0_6px_24px_rgba(2,132,199,0.55)] active:scale-[0.98] transition-all duration-300 cursor-pointer flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center gap-2">
                        <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Authenticating...</span>
                      </span>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4 text-[#38bdf8]" />
                        <span>{isRegisterMode ? 'CREATE ACCOUNT' : 'LOGIN TO WORKSPACE'}</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Bottom Navigation Links */}
                <div className="flex items-center justify-between pt-2 text-xs font-mono text-slate-500">
                  <button
                    type="button"
                    onClick={() =>
                      alert(
                        'Password Recovery: Select Quick Demo Fill buttons above for instant pre-configured login.'
                      )
                    }
                    className="hover:text-[#0284c7] hover:underline cursor-pointer"
                  >
                    Forgot Password?
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsRegisterMode(!isRegisterMode);
                      setErrorMessage('');
                    }}
                    className="text-[#0284c7] hover:text-[#0369a1] font-bold hover:underline cursor-pointer"
                  >
                    {isRegisterMode ? 'Back to Login' : 'Enroll New Account'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>

      {/* Bottom Industrial Certifications & Compliance Footer */}
      <footer className="w-full max-w-4xl pt-4 pb-2 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono text-slate-500 z-10">
        <div className="flex items-center gap-3 text-[11px]">
          <span className="flex items-center gap-1 text-slate-600">
            <Cpu className="w-3.5 h-3.5 text-[#0284c7]" />
            Hardware Encrypted
          </span>
          <span>•</span>
          <span className="flex items-center gap-1 text-slate-600">
            <Printer className="w-3.5 h-3.5 text-[#0284c7]" />
            ZPL / TSPL Direct
          </span>
          <span>•</span>
          <span>PWM 2022 Certified</span>
        </div>

        <div className="text-[11px] text-slate-600 font-semibold">
          © {new Date().getFullYear()} RAMA IT SOLUTION • ALL RIGHTS RESERVED
        </div>
      </footer>
    </div>
  );
};
