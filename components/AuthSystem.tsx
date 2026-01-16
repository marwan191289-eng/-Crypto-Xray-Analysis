
import React, { useState } from 'react';
import { Lock, Mail, ChevronRight, User, ShieldCheck, Globe, Zap, Clock, Terminal } from 'lucide-react';
import { Language } from '../translations';

interface AuthProps {
  onAuthSuccess: (user: any) => void;
  onGuestAccess: () => void;
  lang: Language;
  t: any;
}

const BRAND_LOGO_URL = "https://raw.githubusercontent.com/MarwanNegm/BullBearEye/main/logo.png";
const LOCAL_LOGO = "./logo.png";
const EMERGENCY_LOGO = "https://cdn-icons-png.flaticon.com/512/2091/2091665.png";

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

    // --- Developer Master Access Bypass ---
    if (email === 'admin@tradexray.com' && password === 'G8-MASTER-ARCHITECT-2025') {
      onAuthSuccess({
        email: 'admin@tradexray.com',
        id: 'ARCHITECT-001',
        role: 'DEVELOPER',
        accessLevel: 'G8-CLEARANCE'
      });
      return;
    }

    // Simple local simulation for other users
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

  const handleLogoError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const target = e.target as HTMLImageElement;
    if (target.src.includes('logo.png') && target.src !== BRAND_LOGO_URL) {
      target.src = BRAND_LOGO_URL;
    } else if (target.src === BRAND_LOGO_URL) {
      target.src = EMERGENCY_LOGO;
    } else {
      target.style.display = 'none';
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6 md:p-12 overflow-hidden">
      {/* Background with Grid & Blur */}
      <div className="absolute inset-0 bg-[#010204]/90 backdrop-blur-3xl"></div>
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:100px_100px] opacity-40"></div>
      
      {/* Floating Blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px] animate-pulse delay-1000"></div>

      <div className="relative w-full max-w-lg z-10">
        <div className="cyber-card rounded-[3.5rem] p-10 md:p-14 border border-white/10 shadow-[0_0_100px_rgba(0,0,0,0.8)] overflow-hidden">
          {/* Header */}
          <div className="flex flex-col items-center text-center mb-10">
            <div className="w-24 h-24 bg-slate-900 rounded-3xl flex items-center justify-center mb-8 shadow-[0_0_40px_rgba(0,229,255,0.3)] animate-bounce-slow border-2 border-accent/20 relative overflow-hidden group">
              <img 
                src={LOCAL_LOGO} 
                alt="BullBearEye" 
                className="w-full h-full object-contain p-1"
                onError={handleLogoError}
              />
              <div className="absolute inset-0 bg-accent/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </div>
            <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter mb-2 hologram-effect">
              {t.welcomeTitle}
            </h2>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-4">
              {t.welcomeSubtitle}
            </p>
            <div className="h-px w-24 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
          </div>

          {/* Form */}
          <form onSubmit={handleAuth} className="space-y-6">
            <div className="relative group">
              <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-accent transition-colors" />
              <input 
                type="email" 
                placeholder={t.emailPlaceholder}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-black/40 border border-white/5 rounded-2xl py-5 pl-16 pr-6 text-sm font-bold text-white focus:outline-none focus:border-accent/40 focus:bg-black/60 transition-all placeholder:text-slate-700"
              />
            </div>
            
            <div className="relative group">
              <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-accent transition-colors" />
              <input 
                type="password" 
                placeholder={t.passwordPlaceholder}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-black/40 border border-white/5 rounded-2xl py-5 pl-16 pr-6 text-sm font-bold text-white focus:outline-none focus:border-accent/40 focus:bg-black/60 transition-all placeholder:text-slate-700"
              />
            </div>

            {error && (
              <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center gap-3">
                <Zap className="w-4 h-4 text-rose-500" />
                <span className="text-[10px] font-black text-rose-400 uppercase tracking-widest">{error}</span>
              </div>
            )}

            <button type="submit" className="w-full py-5 bg-gradient-to-r from-accent to-accent-green rounded-2xl text-black font-black text-[13px] uppercase tracking-[0.2em] italic flex items-center justify-center gap-3 transition-all hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(0,229,255,0.2)]">
              {isLogin ? t.login : t.signup}
              <ChevronRight className={`w-5 h-5 ${lang === 'ar' ? 'rotate-180' : ''}`} />
            </button>
          </form>

          {/* Footer Actions */}
          <div className="mt-10 pt-10 border-t border-white/5 flex flex-col gap-6">
            <button 
              onClick={() => setIsLogin(!isLogin)} 
              className="text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-white transition-colors"
            >
              {isLogin ? t.noAccount : t.hasAccount}
            </button>
            
            <div className="flex items-center gap-4">
              <div className="h-px flex-1 bg-white/5"></div>
              <span className="text-[8px] font-black text-slate-700 uppercase tracking-[0.4em]">OR</span>
              <div className="h-px flex-1 bg-white/5"></div>
            </div>

            <button 
              onClick={onGuestAccess}
              className="w-full py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl flex items-center justify-center gap-3 text-[10px] font-black text-slate-400 uppercase tracking-widest transition-all"
            >
              <Clock className="w-4 h-4" />
              {t.guestMode}
            </button>
          </div>
        </div>

        <div className="mt-8 flex items-center justify-center gap-6 opacity-30">
          <div className="flex items-center gap-2"><ShieldCheck className="w-3 h-3" /><span className="text-[8px] font-black uppercase">Encrypted</span></div>
          <div className="flex items-center gap-2"><Globe className="w-3 h-3" /><span className="text-[8px] font-black uppercase">Global G8</span></div>
        </div>
      </div>
    </div>
  );
};

export default AuthSystem;
