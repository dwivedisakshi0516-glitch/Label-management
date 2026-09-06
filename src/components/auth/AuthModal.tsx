import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';
import { RitLogo } from '../common/RitLogo';
import { Shield, User, Lock, Key, AlertCircle, CheckCircle2, ChevronRight, X, Building, Cpu } from 'lucide-react';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    setAuthModalOpen,
    authMode,
    setAuthMode,
    login,
    register,
    users,
    switchUser,
    currentUser
  } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>('OPERATOR');
  const [station, setStation] = useState('Plant Austin / Line 4 / Box Packaging');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  if (!isAuthModalOpen) return null;

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    if (!email) {
      setErrorMessage('Please provide your operator email or select a demo profile.');
      return;
    }
    const success = login(email, password);
    if (!success) {
      setErrorMessage('Unrecognized operator credentials. Try one of the quick profiles or register a new identity.');
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    if (!name || !email) {
      setErrorMessage('Full name and work email are required.');
      return;
    }
    const success = register(name, email, role, station);
    if (!success) {
      setErrorMessage('An operator with this email is already registered.');
    } else {
      setSuccessMessage(`Registered as ${role} and authenticated successfully.`);
      setTimeout(() => {
        setSuccessMessage('');
      }, 2000);
    }
  };

  const handleQuickSelect = (userId: string) => {
    switchUser(userId);
    setAuthModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#060e1f]/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
      <div className="bg-[#131b2d] border border-[#424754]/40 max-w-xl w-full rounded-xl shadow-2xl overflow-y-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="p-5 bg-[#171f32] border-b border-[#424754]/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[#060e1f] border border-[#38bdf8]/30">
              <RitLogo variant="mark" size="sm" theme="dark" glow={true} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold text-white tracking-tight">RAMA IT SOLUTION</span>
                <span className="text-[10px] font-mono uppercase bg-[#222a3d] text-[#38bdf8] px-2 py-0.5 rounded">v4.8 Ent</span>
              </div>
              <p className="text-xs text-[#c2c6d6]/70">RIT Terminal Authentication // Line 4 Packaging Floor</p>
            </div>
          </div>
          {currentUser && (
            <button
              onClick={() => setAuthModalOpen(false)}
              className="p-1.5 rounded-lg text-[#c2c6d6] hover:bg-[#222a3d] hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Demo Fast Switcher Strip */}
        <div className="bg-[#0b1325] p-3.5 border-b border-[#424754]/20">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono uppercase font-bold text-[#4cd7f6] tracking-wider flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5" /> Fast Demo Role Switcher
            </span>
            <span className="text-[11px] text-[#c2c6d6]/60">Click profile to login instantly:</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {users.slice(0, 3).map((u) => {
              const isCurrent = currentUser?.id === u.id;
              const roleBg =
                u.role === 'ADMIN'
                  ? 'border-[#adc6ff]/40 bg-[#adc6ff]/10 text-[#adc6ff]'
                  : u.role === 'OPERATOR'
                  ? 'border-[#4cd7f6]/40 bg-[#4cd7f6]/10 text-[#4cd7f6]'
                  : 'border-[#4edea3]/40 bg-[#4edea3]/10 text-[#4edea3]';

              return (
                <button
                  key={u.id}
                  onClick={() => handleQuickSelect(u.id)}
                  type="button"
                  className={`p-2 rounded-lg border text-left transition-all ${
                    isCurrent
                      ? 'ring-1 ring-[#adc6ff] bg-[#171f32]'
                      : 'border-[#424754]/40 bg-[#131b2d]/60 hover:bg-[#171f32]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded uppercase ${roleBg}">
                      {u.role}
                    </span>
                    <span className="text-[9px] font-mono text-[#c2c6d6]/60">{u.badgeId}</span>
                  </div>
                  <div className="text-xs font-semibold text-white mt-1 truncate">{u.name}</div>
                  <div className="text-[10px] text-[#c2c6d6]/60 truncate">{u.email}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Switcher: Login vs Register */}
        <div className="flex border-b border-[#424754]/30 bg-[#0e1729]">
          <button
            type="button"
            onClick={() => {
              setAuthMode('login');
              setErrorMessage('');
            }}
            className={`flex-1 py-2.5 text-xs font-semibold text-center transition-colors border-b-2 ${
              authMode === 'login'
                ? 'border-[#4d8eff] text-white bg-[#131b2d]'
                : 'border-transparent text-[#c2c6d6]/70 hover:text-white'
            }`}
          >
            Operator Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setAuthMode('register');
              setErrorMessage('');
            }}
            className={`flex-1 py-2.5 text-xs font-semibold text-center transition-colors border-b-2 ${
              authMode === 'register'
                ? 'border-[#4d8eff] text-white bg-[#131b2d]'
                : 'border-transparent text-[#c2c6d6]/70 hover:text-white'
            }`}
          >
            Register New Operator / Role
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6">
          {errorMessage && (
            <div className="mb-4 p-3 bg-[#93000a]/20 border border-[#ffb4ab]/30 rounded-lg flex items-start gap-2 text-xs text-[#ffb4ab]">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-4 p-3 bg-[#00a572]/20 border border-[#4edea3]/30 rounded-lg flex items-start gap-2 text-xs text-[#4edea3]">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          {authMode === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-mono text-[#c2c6d6] uppercase tracking-wider font-semibold mb-1">
                  Corporate / Operator Email
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#c2c6d6]/60" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="marcus.vance@apexindustrial.com"
                    className="w-full pl-9 pr-3 py-2 bg-[#060e1f] border border-[#424754]/50 rounded-lg text-sm text-white placeholder:text-[#c2c6d6]/40 focus:outline-none focus:border-[#4d8eff]"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-mono text-[#c2c6d6] uppercase tracking-wider font-semibold">
                    Station Security PIN / Password
                  </label>
                  <span className="text-[10px] text-[#4cd7f6] hover:underline cursor-pointer">
                    PIN override demo: any value
                  </span>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#c2c6d6]/60" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2 bg-[#060e1f] border border-[#424754]/50 rounded-lg text-sm text-white placeholder:text-[#c2c6d6]/40 focus:outline-none focus:border-[#4d8eff]"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-[#4d8eff] hover:bg-[#3b82f6] text-white font-semibold text-sm rounded-lg flex items-center justify-center gap-2 shadow-lg transition-colors"
              >
                <span>Authorize & Enter Terminal</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono text-[#c2c6d6] uppercase tracking-wider font-semibold mb-1">
                    Operator Full Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Alex Morgan"
                    className="w-full px-3 py-2 bg-[#060e1f] border border-[#424754]/50 rounded-lg text-sm text-white placeholder:text-[#c2c6d6]/40 focus:outline-none focus:border-[#4d8eff]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono text-[#c2c6d6] uppercase tracking-wider font-semibold mb-1">
                    Work Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="alex.m@apexindustrial.com"
                    className="w-full px-3 py-2 bg-[#060e1f] border border-[#424754]/50 rounded-lg text-sm text-white placeholder:text-[#c2c6d6]/40 focus:outline-none focus:border-[#4d8eff]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-[#c2c6d6] uppercase tracking-wider font-semibold mb-1.5">
                  Terminal Authorization Role
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole('ADMIN')}
                    className={`p-2.5 rounded-lg border text-left transition-all ${
                      role === 'ADMIN'
                        ? 'border-[#adc6ff] bg-[#adc6ff]/15 text-white ring-1 ring-[#adc6ff]'
                        : 'border-[#424754]/40 bg-[#060e1f] text-[#c2c6d6] hover:bg-[#171f32]'
                    }`}
                  >
                    <div className="font-bold text-xs flex items-center justify-between">
                      <span>ADMIN</span>
                      <Cpu className="w-3.5 h-3.5 text-[#adc6ff]" />
                    </div>
                    <div className="text-[10px] text-[#c2c6d6]/70 mt-1">Full designer, master taxonomy, and line controls.</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole('OPERATOR')}
                    className={`p-2.5 rounded-lg border text-left transition-all ${
                      role === 'OPERATOR'
                        ? 'border-[#4cd7f6] bg-[#4cd7f6]/15 text-white ring-1 ring-[#4cd7f6]'
                        : 'border-[#424754]/40 bg-[#060e1f] text-[#c2c6d6] hover:bg-[#171f32]'
                    }`}
                  >
                    <div className="font-bold text-xs flex items-center justify-between">
                      <span>OPERATOR</span>
                      <User className="w-3.5 h-3.5 text-[#4cd7f6]" />
                    </div>
                    <div className="text-[10px] text-[#c2c6d6]/70 mt-1">Step-by-step label creation, quick print, queue feed.</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole('AUDITOR')}
                    className={`p-2.5 rounded-lg border text-left transition-all ${
                      role === 'AUDITOR'
                        ? 'border-[#4edea3] bg-[#4edea3]/15 text-white ring-1 ring-[#4edea3]'
                        : 'border-[#424754]/40 bg-[#060e1f] text-[#c2c6d6] hover:bg-[#171f32]'
                    }`}
                  >
                    <div className="font-bold text-xs flex items-center justify-between">
                      <span>AUDITOR</span>
                      <Shield className="w-3.5 h-3.5 text-[#4edea3]" />
                    </div>
                    <div className="text-[10px] text-[#c2c6d6]/70 mt-1">Snapshot checksums, delta analyzer, metrology QC.</div>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono text-[#c2c6d6] uppercase tracking-wider font-semibold mb-1">
                  Assigned Plant & Line Station
                </label>
                <div className="relative">
                  <Building className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#c2c6d6]/60" />
                  <input
                    type="text"
                    value={station}
                    onChange={(e) => setStation(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-[#060e1f] border border-[#424754]/50 rounded-lg text-sm text-white focus:outline-none focus:border-[#4d8eff]"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-[#4edea3] hover:bg-[#00a572] text-[#002e6a] font-bold text-sm rounded-lg flex items-center justify-center gap-2 shadow-lg transition-colors"
              >
                <span>Register & Issue Hardware Badge</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* Role Permissions Legend */}
          <div className="mt-5 pt-4 border-t border-[#424754]/30 grid grid-cols-3 gap-2 text-[10px] font-mono text-[#c2c6d6]/70">
            <div className="bg-[#0b1325] p-2 rounded">
              <span className="text-[#adc6ff] font-bold block">ADMIN PERMS:</span>
              <span className="text-[#c2c6d6]">Full access • Designer • Master Schema • Audit</span>
            </div>
            <div className="bg-[#0b1325] p-2 rounded">
              <span className="text-[#4cd7f6] font-bold block">OPERATOR PERMS:</span>
              <span className="text-[#c2c6d6]">Label Creation • Spooling • 1:1 Calibration</span>
            </div>
            <div className="bg-[#0b1325] p-2 rounded">
              <span className="text-[#4edea3] font-bold block">AUDITOR PERMS:</span>
              <span className="text-[#c2c6d6]">Snapshot verification • Delta Analyzer • Audit logs</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
