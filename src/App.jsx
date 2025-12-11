# Atau: Mengedit file SIPAS
nano src/modules/PatientReportModule.jsx// src/App.jsx
import React, { useState, useEffect } from 'react';
import { signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { Activity, Users, Package, ShieldCheck, ArrowLeft, ChevronRight } from 'lucide-react';

// Import komponen modular
import { ErrorBoundary } from './components/Commons';
import PatientReportModule from './modules/PatientReportModule';
import SimasWebModule from './modules/SimasWebModule';
import KmkpWebModule from './modules/KmkpWebModule';
import { auth } from './firebase';

export default function App() {
  const [user, setUser] = useState(null);
  const [currentModule, setCurrentModule] = useState('home'); 
  const [isAuthReady, setIsAuthReady] = useState(false);

  useEffect(() => {
    const initAuth = async () => { 
        try { 
            await signInAnonymously(auth);
        } catch (error) { 
            console.error("Auth Error:", error); 
        } finally { 
            setIsAuthReady(true); 
        } 
    };
    initAuth();
    return onAuthStateChanged(auth, (u) => { setUser(u); setIsAuthReady(true); });
  }, []);

  if (!isAuthReady) return (<div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 space-y-4"><div className="relative"><div className="w-16 h-16 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div><div className="absolute inset-0 flex items-center justify-center"><Activity className="w-6 h-6 text-emerald-600"/></div></div><p className="text-slate-500 font-medium animate-pulse">Memuat Portal RS...</p></div>);

  return (
    <ErrorBoundary>
      {currentModule === 'patient' && <PatientReportModule user={user} onBack={() => setCurrentModule('home')} />}
      {currentModule === 'simas' && <SimasWebModule onBack={() => setCurrentModule('home')} />}
      {currentModule === 'kmkp' && <KmkpWebModule onBack={() => setCurrentModule('home')} />}
      {currentModule === 'home' && (
      <div className="min-h-screen bg-slate-50 font-sans p-6 flex flex-col items-center justify-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-emerald-100/50 to-transparent -z-10"></div><div className="absolute top-20 right-20 w-64 h-64 bg-emerald-200/20 rounded-full blur-3xl -z-10"></div><div className="absolute bottom-20 left-20 w-80 h-80 bg-blue-200/20 rounded-full blur-3xl -z-10"></div>
        <div className="w-full max-w-4xl z-10"><div className="text-center mb-12"><div className="inline-flex p-4 bg-white rounded-3xl shadow-xl shadow-blue-200 mb-6 animate-in zoom-in duration-500"><Activity className="w-12 h-12 text-blue-600" /></div><h1 className="text-5xl md:text-6xl font-black text-slate-800 tracking-tight mb-4">PORTAL <span className="text-blue-600">RSUD</span></h1><p className="text-lg text-slate-500 font-medium max-w-lg mx-auto leading-relaxed">PUSAT INTEGRASI DATA, LAPORAN, DAN LAYANAN DIGITAL RSUD LEBONG</p></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-4">
            <button onClick={() => setCurrentModule('patient')} className="group relative bg-white p-8 rounded-[2rem] shadow-sm hover:shadow-2xl hover:shadow-emerald-500/10 transition-all duration-300 border border-slate-100 text-left overflow-hidden hover:-translate-y-1"><div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-bl-[5rem] transition-transform group-hover:scale-110 origin-top-right"></div><div className="relative z-10"><div className="w-14 h-14 bg-emerald-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/30 group-hover:scale-110 transition-transform duration-300"><Users className="w-7 h-7 text-white" /></div><h3 className="text-2xl font-bold text-slate-800 mb-2 group-hover:text-emerald-600 transition-colors">SIPAS</h3><p className="text-slate-500 mb-6 font-medium leading-relaxed uppercase text-xs tracking-wider">SISTEM INFORMASI PASIEN</p><div className="flex items-center text-emerald-600 font-bold group-hover:translate-x-2 transition-transform">Buka Aplikasi <ChevronRight className="ml-2 w-5 h-5"/></div></div></button>
            <button onClick={() => setCurrentModule('simas')} className="group relative bg-white p-8 rounded-[2rem] shadow-sm hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 border border-slate-100 text-left overflow-hidden hover:-translate-y-1"><div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-[5rem] transition-transform group-hover:scale-110 origin-top-right"></div><div className="relative z-10"><div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform duration-300"><Package className="w-7 h-7 text-white" /></div><h3 className="text-2xl font-bold text-slate-800 mb-2 group-hover:text-blue-600 transition-colors">SIMAS</h3><p className="text-slate-500 mb-6 font-medium leading-relaxed uppercase text-xs tracking-wider">SISTEM INVENTARIS MANAJEMEN ASET</p><div className="flex items-center text-blue-600 font-bold group-hover:translate-x-2 transition-transform">Buka Aplikasi <ChevronRight className="ml-2 w-5 h-5"/></div></div></button>
            <button onClick={() => setCurrentModule('kmkp')} className="group relative bg-white p-8 rounded-[2rem] shadow-sm hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-300 border border-slate-100 text-left overflow-hidden hover:-translate-y-1"><div className="absolute top-0 right-0 w-32 h-32 bg-purple-50 rounded-bl-[5rem] transition-transform group-hover:scale-110 origin-top-right"></div><div className="relative z-10"><div className="w-14 h-14 bg-purple-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-purple-500/30 group-hover:scale-110 transition-transform duration-300"><ShieldCheck className="w-7 h-7 text-white" /></div><h3 className="text-2xl font-bold text-slate-800 mb-2 group-hover:text-purple-600 transition-colors">KMKP</h3><p className="text-slate-500 mb-6 font-medium leading-relaxed uppercase text-xs tracking-wider">KOMITE MUTU & KESELAMATAN PASIEN</p><div className="flex items-center text-purple-600 font-bold group-hover:translate-x-2 transition-transform">Buka Aplikasi <ChevronRight className="ml-2 w-5 h-5"/></div></div></button>
        </div>
        <div className="text-center mt-12 pb-6"><p className="text-xs font-bold text-slate-300 uppercase tracking-widest">&copy; 2025 IT RSUD Lebong • v1</p></div></div>
      </div>
      )}
    </ErrorBoundary>
  );
}
