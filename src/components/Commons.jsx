// src/components/Commons.jsx
import React from 'react';
import { AlertCircle, Trash2, Home, Settings, ChevronRight } from 'lucide-react';

// --- Error Boundary untuk menangkap crash ---
export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center h-screen bg-red-50 p-4 text-center">
          <div>
            <h1 className="text-2xl font-bold text-red-600 mb-2">Terjadi Kesalahan Sistem</h1>
            <p className="text-red-800 mb-4">Mohon muat ulang halaman. Jika berlanjut, hubungi IT.</p>
            <pre className="bg-white p-2 rounded border border-red-200 text-xs text-left overflow-auto max-w-lg mx-auto">
              {this.state.error && this.state.error.toString()}
            </pre>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded shadow hover:bg-red-700"
            >
              Muat Ulang
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// --- Modern Card ---
export const ModernCard = ({ children, className = "", title, icon: Icon, action, headerColor = "border-slate-100", titleColor="text-slate-800", isAdminMode }) => (
    <div className={`relative bg-white rounded-xl shadow-sm border transition-all hover:shadow-md ${className} ${isAdminMode ? 'border-dashed border-2 border-emerald-400 bg-emerald-50/30' : 'border-slate-200'}`}>
        {(title || Icon) && (
            <div className={`flex items-center justify-between px-5 py-4 border-b ${headerColor}`}>
                <div className="flex items-center space-x-3">
                    {Icon && <Icon className={`w-5 h-5 ${titleColor}`}/>}
                    {title && <h3 className={`font-black text-sm uppercase tracking-wider ${titleColor}`}>{title}</h3>}
                </div>
                {action}
            </div>
        )}
        <div className="p-5">{children}</div>
    </div>
);

// --- Number Input ---
export const NumberInput = ({ label, name, value, onChange, min = 0, accentColor = "text-slate-700" }) => (
  <div className="flex flex-col bg-slate-50 rounded-lg border border-slate-200 px-3 py-2 transition-all hover:bg-white hover:border-emerald-300 hover:shadow-sm">
    <span className="text-[10px] font-black text-black uppercase mb-0.5 tracking-wider">{label}</span>
    <input
        type="number"
        id={name}
        name={name}
        value={value || 0}
        onChange={(e) => onChange(name, parseInt(e.target.value) || min)}
        min={min}
        className={`w-full bg-transparent text-xl font-bold ${accentColor} focus:outline-none placeholder-slate-400`}
        placeholder="0"
    />
  </div>
);

// --- Fungsi Format Laporan ---
export const formatReportText = (data, rooms) => {
    const date = new Date(data.date);
    const formattedDate = date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    const opDate = new Date(data.operasiTanggal);
    const opDateFormatted = `${opDate.getDate()}/${opDate.getMonth() + 1}/${opDate.getFullYear()}`;
    
    let totalRanap = 0;
    let textRuangan = "";

    rooms.forEach(room => {
        const pasien = data[room.pasienKey] || 0;
        const bpjs = data[room.bpjsKey] || 0;
        const umum = room.umumKey ? (data[room.umumKey] || 0) : '-';
        const tt = data[room.ttKey] || 0;
        totalRanap += pasien;
        textRuangan += `\n*${room.name}* (${room.ttLabel}: ${tt})\nPasien : ${pasien} (BPJS: ${bpjs}${room.umumKey ? `, Umum: ${umum}` : ''})`;
    });

    const totalOperasi = (data.operasiObgynElektif || 0) + (data.operasiObgynCito || 0) + (data.operasiBedahElektif || 0) + (data.operasiBedahCito || 0);
    const totalHD = (data.hdPagi || 0) + (data.hdSiang || 0) + (data.hdCito || 0);

    return `*Laporan Pasien Tgl ${formattedDate}*\n\n*IGD*\nPagi : ${data.igdPagi} | Sore : ${data.igdSore} | Malam : ${data.igdMalam}\n${textRuangan}\n\n*Total Pasien Ranap:* ${totalRanap}\n\n*Kamar Operasi* (${opDateFormatted})\nObgyn (Elektif: ${data.operasiObgynElektif}, CITO: ${data.operasiObgynCito})\nBedah (Elektif: ${data.operasiBedahElektif}, CITO: ${data.operasiBedahCito})\nTTL pasien: ${totalOperasi}\n\n*IGD PONEK*\nPagi : ${data.igdPonekPagi} | Sore : ${data.igdPonekSore} | Malam: ${data.igdPonekMalam}\n\n*Unit HD* (4 Mesin)\nPagi: ${data.hdPagi}, Siang: ${data.hdSiang}, Cito: ${data.hdCito}\nTotal: ${totalHD}\nTerima kasih.`;
};
