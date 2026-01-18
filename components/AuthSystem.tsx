
import React, { useState } from 'react';
import { Lock, Mail, ChevronRight, User, ShieldCheck, Globe, Zap, Clock, Terminal, ScanEye, AlertTriangle } from 'lucide-react';
import { Language } from '../translations';
import Logo from './Logo';

interface AuthProps {
  onAuthSuccess: (user: any) => void;
  onGuestAccess: () => void;
  lang: Language;
  t: any;
}

const AuthSystem: React.FC<AuthProps> = ({ onAuthSuccess, onGuestAccess, lang, t }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Operator credentials required.');
      return;
    }

    if (email === 'admin@tradexray.com' && password === 'G8-MASTER-ARCHITECT-2025') {
      onAuthSuccess({
        email: 'admin@tradexray.com',
        id: 'ARCHITECT-001',
        role: 'DEVELOPER',
        accessLevel: 'G8-CLEARANCE'
      });
      return;
    }

    const users = JSON.parse(localStorage.getItem('g8_users') || '[]');
    
    if (isLogin) {
      const found = users.find((u: any) => u.email === email && u.password === password);
      if (found) {
        onAuthSuccess(found);
      } else {
        setError('Invalid security key or operator ID.');
      }
    } else {
      if (users.find((u: any) => u.email === email)) {
        setError('Operator ID already registered in G8.');
      } else {
        const newUser = { email, password, id: Math.random().toString(36).substring(7), role: 'OPERATOR' };
        users.push(newUser);
        localStorage.setItem('g8_users', JSON.stringify(users));
        onAuthSuccess(newUser);
      }
    }
  };

  const handleGuestEntry = () => {
    const TRIAL_DURATION = 60 * 60 * 1000; // 60 Minutes
    const storedStart = localStorage.getItem('g8_guest_start_ts');

    if (storedStart) {
      const startTime = parseInt(storedStart, 10);
      const elapsed = Date.now() - startTime;

      if (elapsed > TRIAL_DURATION) {
        setError('TRIAL EXPIRED: Guest access is limited to 60 minutes per terminal. Authorization required.');
        return;
      }
    } else {
      // First time entry
      localStorage.setItem('g8_guest_start_ts', Date.now().toString());
    }

    onGuestAccess();
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6 md:p-12 overflow-hidden bg-[#00050A]">
      {/* Cinematic Background Layers */}
      <div className="absolute inset-0 bg-[#010204]/80 backdrop-blur-3xl z-0"></div>
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,229,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,229,255,0.03)_1px,transparent_1px)] bg-[size:60px_60px] opacity-20 z-0 animate-[pulse_8s_infinite]"></div>
      
      {/* Ambient Orbs */}
      <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[150px] animate-pulse pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[120px] animate-pulse delay-1000 pointer-events-none"></div>

      <div className="relative w-full max-w-[500px] z-10">
        <div className="bg-[#080c14]/80 backdrop-blur-xl rounded-[3rem] p-10 md:p-14 border border-white/5 shadow-[0_0_80px_rgba(0,0,0,0.6)] relative overflow-hidden group">
          
          {/* Subtle Scanning Line */}
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-accent/50 to-transparent animate-[scan_4s_linear_infinite] opacity-50 pointer-events-none"></div>

          <div className="flex flex-col items-center text-center mb-12">
            
            <div className="w-24 h-24 mb-8 relative group/logo">
                <div className="absolute inset-0 bg-accent/20 rounded-full blur-xl group-hover/logo:blur-2xl transition-all duration-500 opacity-50"></div>
                <div className="relative w-full h-full bg-[#0B1221] rounded-3xl border border-white/10 flex items-center justify-center shadow-2xl p-5 group-hover/logo:scale-105 transition-transform duration-500">
                    <Logo className="w-full h-full object-contain drop-shadow-[0_0_15px_rgba(0,229,255,0.3)]" />
                </div>
            </div>

            {/* Branding Text */}
            <div className="space-y-2 relative">
                <h1 className="text-3xl md:text-4xl font-black uppercase italic tracking-tighter leading-none whitespace-nowrap text-navy-gold mb-2">
                  Bull & Bear Eye
                </h1>
                
                <div className="flex flex-col items-center gap-1">
                   <h2 className="text-xl font-black uppercase tracking-[0.3em] text-transparent bg-clip-text bg-gradient-to-r from-[#00F0FF] to-[#0099FF] drop-shadow-[0_0_10px_rgba(0,240,255,0.5)] animate-pulse">
                      TradeXray
                   </h2>
                   
                   <h3 className="text-lg font-black uppercase tracking-[0.3em] text-transparent bg-clip-text bg-gradient-to-r from-[#D946EF] to-[#8B5CF6] drop-shadow-[0_0_10px_rgba(217,70,239,0.5)] animate-pulse delay-100">
                      Alpha Eye
                   </h3>
                </div>

                <div className="flex flex-col items-center gap-1 mt-2">
                    <p className="text-[9px] font-black uppercase tracking-[0.6em] text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-200 to-white drop-shadow-[0_0_20px_rgba(0,240,255,1)] animate-pulse whitespace-nowrap mt-4">
                      See Inside The Price
                    </p>
                </div>
            </div>
          </div>

          <form onSubmit={handleAuth} className="space-y-5 relative z-20">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                <Mail className="w-4 h-4 text-slate-500 group-focus-within:text-accent transition-colors duration-300" />
              </div>
              <input 
                type="email" 
                placeholder={t.emailPlaceholder}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#020617] border border-white/5 rounded-2xl py-4 pl-12 pr-6 text-xs font-bold text-white focus:outline-none focus:border-accent/50 focus:bg-[#050b1a] focus:shadow-[0_0_20px_rgba(0,229,255,0.1)] transition-all placeholder:text-slate-700 placeholder:uppercase placeholder:tracking-wider"
              />
            </div>
            
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                <Lock className="w-4 h-4 text-slate-500 group-focus-within:text-accent transition-colors duration-300" />
              </div>
              <input 
                type="password" 
                placeholder={t.passwordPlaceholder}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#020617] border border-white/5 rounded-2xl py-4 pl-12 pr-6 text-xs font-bold text-white focus:outline-none focus:border-accent/50 focus:bg-[#050b1a] focus:shadow-[0_0_20px_rgba(0,229,255,0.1)] transition-all placeholder:text-slate-700 placeholder:uppercase placeholder:tracking-wider"
              />
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center gap-3 animate-[fadeIn_0.3s_ease-out] relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-rose-500 animate-pulse"></div>
                <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
                <span className="text-[9px] font-black text-rose-400 uppercase tracking-wide leading-tight">{error}</span>
              </div>
            )}

            <button type="submit" className="w-full py-4 bg-gradient-to-r from-accent to-blue-600 rounded-2xl text-black font-black text-[11px] uppercase tracking-[0.2em] italic flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_30px_rgba(0,229,255,0.25)] hover:shadow-[0_0_50px_rgba(0,229,255,0.4)] relative overflow-hidden group/btn">
              <span className="relative z-10 flex items-center gap-2">
                {isLogin ? t.login : t.signup}
                <ChevronRight className={`w-4 h-4 ${lang === 'ar' ? 'rotate-180' : ''}`} />
              </span>
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300"></div>
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-white/5 flex flex-col gap-5">
            <button 
              onClick={() => setIsLogin(!isLogin)} 
              className="text-[9px] font-black text-slate-500 uppercase tracking-widest hover:text-white transition-colors text-center"
            >
              {isLogin ? t.noAccount : t.hasAccount}
            </button>
            
            <div className="flex items-center gap-4 opacity-50">
              <div className="h-px flex-1 bg-white/10"></div>
              <span className="text-[7px] font-black text-slate-600 uppercase tracking-[0.4em]">OR</span>
              <div className="h-px flex-1 bg-white/10"></div>
            </div>

            <button 
              onClick={handleGuestEntry}
              className="w-full py-3.5 bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 rounded-2xl flex items-center justify-center gap-2 text-[9px] font-black text-slate-400 hover:text-white uppercase tracking-widest transition-all group/guest relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover/guest:animate-[scan_1s_linear_infinite]"></div>
              <Clock className="w-3.5 h-3.5 group-hover/guest:text-accent transition-colors relative z-10" />
              <span className="relative z-10">{t.guestMode}</span>
            </button>
          </div>
        </div>

        <div className="mt-8 flex items-center justify-center gap-6 opacity-30">
          <div className="flex items-center gap-1.5"><ShieldCheck className="w-3 h-3" /><span className="text-[8px] font-black uppercase">AES-256</span></div>
          <div className="flex items-center gap-1.5"><Globe className="w-3 h-3" /><span className="text-[8px] font-black uppercase">Global Node</span></div>
        </div>
      </div>
    </div>
  );
};

export default AuthSystem;
