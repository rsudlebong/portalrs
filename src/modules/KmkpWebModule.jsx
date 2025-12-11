// src/modules/KmkpWebModule.jsx
import React from 'react';
import { ArrowLeft, ExternalLink, ShieldCheck } from 'lucide-react';

const KmkpWebModule = ({ onBack }) => {
    const URL_KMKP = "https://biolink.info/kmkprslebong";
    return (<div className="flex flex-col h-screen bg-slate-100 font-sans"><div className="bg-white text-slate-800 px-6 py-4 shadow-sm border-b border-slate-200 flex items-center justify-between sticky top-0 z-50"><div className="flex items-center space-x-4"><button onClick={onBack} className="p-2 bg-slate-100 rounded-xl hover:bg-slate-200 transition text-slate-600"><ArrowLeft className="w-5 h-5"/></button><div><h2 className="text-xl font-black leading-tight text-purple-600 tracking-tight">KMKP</h2><p className="text-xs font-bold text-slate-400 uppercase tracking-wider">KOMITE MUTU & KESELAMATAN PASIEN</p></div></div><a href={URL_KMKP} target="_blank" rel="noopener noreferrer" className="p-2.5 bg-purple-50 text-purple-600 rounded-xl hover:bg-purple-100 transition shadow-sm" title="Buka Tab Baru"><ExternalLink className="w-5 h-5"/></a></div><div className="flex-1 relative w-full h-full bg-white overflow-hidden shadow-inner"><iframe src={URL_KMKP} title="KMKP RSUD Lebong" className="absolute inset-0 w-full h-full border-0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" sandbox="allow-forms allow-scripts allow-same-origin allow-popups allow-downloads"/></div></div>);
};

export default KmkpWebModule;
