// src/modules/PatientReportModule.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { getFirestore, collection, query, onSnapshot, addDoc, setDoc, doc, deleteDoc, where, getDocs } from 'firebase/firestore';
import { 
  Trash2, Copy, FileText, Loader2, Save, Calendar, Users, Home, Heart, Settings, 
  Activity, ArrowLeft, AlertCircle, Clock, CheckCircle, List,
  ChevronRight, Plus, X, Lock, Unlock, Menu, ShieldCheck
} from 'lucide-react';
import { ModernCard, NumberInput, formatReportText } from '../components/Commons';
import { auth, db, appId, defaultRooms, initialReportData, serverTimestamp, getLocalDate } from '../firebase'; 


const iconMap = { 'Heart': Heart, 'Home': Home };

const PatientReportModule = ({ user, onBack }) => {
  const [report, setReport] = useState(initialReportData);
  const [rooms, setRooms] = useState(defaultRooms); 
  const [generatedText, setGeneratedText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [savedReports, setSavedReports] = useState([]);
  const [activeTab, setActiveTab] = useState('input'); 
  const [isTtSettingsOpen, setIsTtSettingsOpen] = useState(false);
  const [isReportSubmittedToday, setIsReportSubmittedToday] = useState(false);
  
  // ADMIN
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [showChangeCreds, setShowChangeCreds] = useState(false); 
  const [adminInputUsername, setAdminInputUsername] = useState(''); 
  const [adminInputPassword, setAdminInputPassword] = useState(''); 
  const [adminCredentials, setAdminCredentials] = useState({ username: 'admin', password: 'admin123' }); 
  
  const [showAddRoom, setShowAddRoom] = useState(false);
  const [newRoomData, setNewRoomData] = useState({ name: '', id: '', hasUmum: true });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); 
  
  const missingReportAlerts = useMemo(() => {
    const now = new Date();
    const currentHour = now.getHours();
    if (currentHour < 10) return [];
    return rooms.filter(room => {
        const val = report[room.pasienKey];
        return val === undefined || val === 0;
    }).map(room => room.name);
  }, [report, rooms]);

  useEffect(() => {
      const unsubRooms = onSnapshot(doc(db, 'artifacts', appId, 'public', 'data', 'config', 'rooms'), (docSnap) => {
          if (docSnap.exists()) {
              const rawList = docSnap.data().list || [];
              const uniqueRooms = [];
              const seenIds = new Set();
              rawList.forEach(r => { if (r.id && !seenIds.has(r.id)) { seenIds.add(r.id); uniqueRooms.push(r); }});
              setRooms(uniqueRooms);
              
              const newDefaults = {};
              uniqueRooms.forEach(r => { newDefaults[r.ttKey] = r.defaultTT || 0; });
              setReport(prev => ({ ...newDefaults, ...prev }));
          } else {
              setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'config', 'rooms'), { list: defaultRooms });
          }
      });

      const unsubCreds = onSnapshot(doc(db, 'artifacts', appId, 'public', 'data', 'config', 'admin_settings'), (docSnap) => {
          if (docSnap.exists()) setAdminCredentials(docSnap.data());
          else setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'config', 'admin_settings'), { username: 'admin', password: 'admin123' });
      });
      return () => { unsubRooms(); unsubCreds(); };
  }, []);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'artifacts', appId, 'users', user.uid, 'hospital_reports'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      list.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      setSavedReports(list.slice(0, 10));
    });
    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    const checkStatus = async () => {
      if (!user) return;
      const today = new Date().toISOString().substring(0, 10);
      const q = query(collection(db, 'artifacts', appId, 'users', user.uid, 'hospital_reports'), where('date', '==', today));
      const snap = await getDocs(q);
      setIsReportSubmittedToday(snap.docs.length > 0);
    };
    checkStatus();
  }, [user, savedReports]);

  const handleInputChange = (name, value) => setReport(prev => ({ ...prev, [name]: value }));
  const handleGenerate = () => { setGeneratedText(formatReportText(report, rooms)); setActiveTab('report'); };

  const handleSave = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'hospital_reports'), { ...report, userId: user.uid, createdAt: serverTimestamp() });
      alert('Laporan berhasil disimpan!'); setActiveTab('history');
    } catch (e) { console.error(e); alert('Gagal menyimpan'); }
    setIsLoading(false);
  };

  const handleDelete = async (id) => { if (window.confirm('Hapus laporan ini?')) await deleteDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'hospital_reports', id)); };

  const handleAdminLogin = (e) => {
      e.preventDefault();
      if (adminInputUsername === adminCredentials.username && adminInputPassword === adminCredentials.password) {
          setIsAdmin(true); setShowAdminLogin(false); setAdminInputUsername(''); setAdminInputPassword('');
          alert("Login Admin Berhasil!");
      } else { alert("Username atau Password Salah!"); }
  };

  const handleUpdateCredentials = async () => {
      if (!adminInputUsername || !adminInputPassword) return alert("Isi semua field");
      try {
          await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'config', 'admin_settings'), { username: adminInputUsername, password: adminInputPassword });
          alert("Kredensial diubah!"); setShowChangeCreds(false); setAdminInputUsername(''); setAdminInputPassword('');
      } catch (error) { console.error(error); alert("Gagal update."); }
  };

  const deleteRoom = async (roomId, roomName) => {
      if (!window.confirm(`Hapus ruangan ${roomName}?`)) return;
      try {
          const updatedRooms = rooms.filter(r => r.id !== roomId);
          await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'config', 'rooms'), { list: updatedRooms });
      } catch (error) { console.error(error); }
  };

  const addRoom = async () => {
      if (!newRoomData.name || !newRoomData.id) return alert("Nama dan ID wajib diisi");
      const id = newRoomData.id.replace(/\s+/g, '');
      if (rooms.some(r => r.id === id)) return alert("ID sudah ada!");
      const newRoom = {
          id: id, name: newRoomData.name, icon: 'Home', ttKey: `${id}TT`, pasienKey: `${id}Pasien`, bpjsKey: `${id}Bpjs`,
          umumKey: newRoomData.hasUmum ? `${id}Umum` : null, ttLabel: 'TT', color: 'from-slate-500 to-slate-600', shadow: 'shadow-slate-500/20', text: 'text-slate-600', bg: 'bg-slate-50'
      };
      await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'config', 'rooms'), { list: [...rooms, newRoom] });
      setShowAddRoom(false); setNewRoomData({ name: '', id: '', hasUmum: true });
  };

  const sidebarItems = [
    { id: 'input', label: 'Input Data', icon: Home },
    { id: 'dashboard', label: 'Dashboard', icon: Activity },
    { id: 'report', label: 'Preview', icon: FileText },
    { id: 'history', label: 'Riwayat', icon: List },
  ];

  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
      {isMobileMenuOpen && <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setIsMobileMenuOpen(false)} />}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 transform transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0`}>
         <div className="p-6 border-b border-slate-100 flex items-center justify-between md:justify-start space-x-3">
             <div className="flex items-center space-x-3">
                <div className="p-2 bg-emerald-600 rounded-lg shadow-lg shadow-emerald-500/30"><Users className="w-6 h-6 text-white"/></div>
                <span className="font-black text-slate-800 text-lg">SIPAS</span>
             </div>
             <button onClick={() => setIsMobileMenuOpen(false)} className="md:hidden text-slate-400"><X className="w-6 h-6"/></button>
         </div>
         <nav className="flex-1 p-4 space-y-2 overflow-y-auto h-[calc(100vh-80px)]">
             <div className="mb-4">
                 <p className="px-4 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">MENU LAPORAN</p>
                 {sidebarItems.map(item => (
                    <button key={item.id} onClick={() => { setActiveTab(item.id); setIsMobileMenuOpen(false); }} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${activeTab === item.id ? 'bg-emerald-600 text-white shadow-md shadow-emerald-200' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'}`}>
                        <item.icon className={`w-5 h-5 ${activeTab === item.id ? 'text-white' : 'text-slate-400'}`}/><span className="uppercase font-bold text-xs tracking-wide">{item.label}</span>
                    </button>
                 ))}
             </div>
             <div>
                <p className="px-4 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">APLIKASI</p>
                <button onClick={onBack} className="w-full flex items-center space-x-3 px-4 py-3 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all">
                    <ArrowLeft className="w-5 h-5"/><span className="uppercase font-bold text-xs tracking-wide">KEMBALI KE MENU</span>
                </button>
             </div>
         </nav>
      </aside>

      <div className="flex-1 flex flex-col h-full overflow-hidden relative w-full">
        <div className="md:hidden bg-white/90 backdrop-blur-md sticky top-0 z-30 border-b border-slate-200 px-4 py-3 shadow-sm flex items-center justify-between flex-shrink-0">
            <div className="flex items-center space-x-3">
                <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 bg-slate-100 rounded-full text-slate-600 hover:bg-slate-200"><Menu className="w-5 h-5"/></button>
                <span className="font-black text-slate-800 text-lg">SIPAS</span>
            </div>
            <div className="flex items-center space-x-2">
                {isReportSubmittedToday && <span className="bg-emerald-100 text-emerald-700 p-1.5 rounded-full"><CheckCircle className="w-5 h-5"/></span>}
                <button onClick={() => isAdmin ? setIsAdmin(false) : setShowAdminLogin(true)} className={`p-2 rounded-full transition-colors ${isAdmin ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-400'}`}>
                    {isAdmin ? <Unlock className="w-5 h-5"/> : <Lock className="w-5 h-5"/>}
                </button>
            </div>
        </div>

        <main className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-8 overflow-y-auto pb-24 md:pb-8">
            <div className="hidden md:flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-black text-emerald-800 tracking-tight uppercase">{sidebarItems.find(i => i.id === activeTab)?.label}</h1>
                    <p className="text-slate-500 mt-1 uppercase text-xs font-bold tracking-wider">SISTEM INFORMASI PASIEN & LAPORAN HARIAN</p>
                </div>
                <div className="flex items-center space-x-3">
                    {isReportSubmittedToday ? <span className="flex items-center bg-green-100 text-green-700 px-4 py-2 rounded-xl text-sm font-bold border border-green-200 shadow-sm uppercase"><CheckCircle className="w-4 h-4 mr-2"/>SUDAH LAPOR</span> : <span className="flex items-center bg-amber-50 text-amber-700 px-4 py-2 rounded-xl text-sm font-bold border border-amber-200 uppercase"><Clock className="w-4 h-4 mr-2"/>BELUM LAPOR</span>}
                    <button onClick={() => isAdmin ? setIsAdmin(false) : setShowAdminLogin(true)} className={`p-2 rounded-full transition-colors border ${isAdmin ? 'bg-red-50 text-red-600 border-red-200' : 'bg-white text-slate-400 border-slate-200 hover:border-slate-300'}`} title={isAdmin ? "Keluar Admin" : "Masuk Admin"}>{isAdmin ? <Unlock className="w-5 h-5"/> : <Lock className="w-5 h-5"/>}</button>
                </div>
            </div>

            {activeTab === 'input' && (
                <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
                    
                    {/* ALERT: MISSING REPORTS (If > 10:00) */}
                    {missingReportAlerts.length > 0 && (
                         <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start space-x-4 animate-in slide-in-from-top-4 fade-in duration-500 mb-6">
                            <div className="p-2 bg-white rounded-full shadow-sm"><AlertCircle className="w-6 h-6 text-red-600"/></div>
                            <div className="flex-1">
                                <h3 className="text-sm font-black text-red-900 uppercase">PERHATIAN: SUDAH LEWAT JAM 10.00 WIB</h3>
                                <p className="text-xs font-bold text-red-700 mt-1 mb-2 uppercase">RUANGAN BERIKUT BELUM MENGISI LAPORAN:</p>
                                <div className="flex flex-wrap gap-2">
                                    {missingReportAlerts.map(roomName => (
                                        <span key={roomName} className="px-2 py-1 bg-white border border-red-100 text-red-700 text-[10px] font-black uppercase rounded-md shadow-sm">
                                            {roomName}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {isAdmin && (
                        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 p-4 rounded-xl flex flex-col sm:flex-row items-center justify-between shadow-sm gap-4">
                            <div><h3 className="font-black text-emerald-800 flex items-center uppercase text-sm"><Settings className="w-4 h-4 mr-2"/>MODE ADMIN AKTIF</h3></div>
                            <div className="flex gap-2">
                                <button onClick={() => setShowChangeCreds(true)} className="px-4 py-2 bg-white text-emerald-700 border border-emerald-200 rounded-lg font-bold text-xs shadow-sm hover:bg-emerald-50 flex items-center uppercase"><Lock className="w-4 h-4 mr-2"/> GANTI PASSWORD</button>
                                <button onClick={() => setShowAddRoom(true)} className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-bold text-xs shadow hover:bg-emerald-700 flex items-center uppercase"><Plus className="w-4 h-4 mr-2"/> TAMBAH RUANGAN</button>
                            </div>
                        </div>
                    )}

                    {(showAddRoom || showAdminLogin || showChangeCreds) && (
                        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
                            {showAddRoom && (
                                <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl animate-in zoom-in-90 relative">
                                    <div className="flex justify-between items-center mb-4"><h3 className="text-lg font-black text-slate-800 uppercase">TAMBAH RUANGAN</h3><button onClick={() => setShowAddRoom(false)}><X className="w-5 h-5"/></button></div>
                                    <div className="space-y-3">
                                        <div><label className="text-xs font-bold text-slate-500 uppercase">NAMA RUANGAN</label><input placeholder="CONTOH: RUANG MELATI" className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none uppercase font-bold text-sm" value={newRoomData.name} onChange={e => setNewRoomData({...newRoomData, name: e.target.value})} /></div>
                                        <div><label className="text-xs font-bold text-slate-500 uppercase">ID UNIK</label><input placeholder="CONTOH: MELATI" className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none uppercase font-bold text-sm" value={newRoomData.id} onChange={e => setNewRoomData({...newRoomData, id: e.target.value})} /></div>
                                        <label className="flex items-center space-x-3 p-3 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer"><input type="checkbox" className="w-5 h-5 text-emerald-600 rounded" checked={newRoomData.hasUmum} onChange={e => setNewRoomData({...newRoomData, hasUmum: e.target.checked})} /><span className="text-xs font-bold text-slate-700 uppercase">TERIMA PASIEN UMUM?</span></label>
                                        <button onClick={addRoom} className="w-full py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 shadow-lg shadow-emerald-200 uppercase text-sm">SIMPAN RUANGAN</button>
                                    </div>
                                </div>
                            )}
                            {showAdminLogin && (
                                <form onSubmit={handleAdminLogin} className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl animate-in zoom-in-90 relative">
                                    <div className="flex justify-between items-center mb-4"><h3 className="text-lg font-black text-slate-800 uppercase">LOGIN ADMIN</h3><button type="button" onClick={() => setShowAdminLogin(false)}><X className="w-5 h-5"/></button></div>
                                    <p className="text-xs text-slate-500 mb-2">Username: <b>admin</b> | Password: <b>admin123</b></p>
                                    <div className="space-y-3">
                                        <div><label className="text-xs font-bold text-slate-500 uppercase">USERNAME</label><input type="text" className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none font-bold text-sm" value={adminInputUsername} onChange={e => setAdminInputUsername(e.target.value)} /></div>
                                        <div><label className="text-xs font-bold text-slate-500 uppercase">PASSWORD</label><input type="password" className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none font-bold text-sm" value={adminInputPassword} onChange={e => setAdminInputPassword(e.target.value)} /></div>
                                    </div>
                                    <button type="submit" className="w-full mt-4 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 shadow-lg shadow-emerald-200 uppercase text-sm">MASUK</button>
                                </form>
                            )}
                            {showChangeCreds && (
                                <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl animate-in zoom-in-90 relative">
                                    <div className="flex justify-between items-center mb-4"><h3 className="text-lg font-black text-slate-800 uppercase">UBAH AKUN ADMIN</h3><button onClick={() => setShowChangeCreds(false)}><X className="w-5 h-5"/></button></div>
                                    <div className="space-y-3">
                                        <div><label className="text-xs font-bold text-slate-500 uppercase">USERNAME BARU</label><input type="text" className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none font-bold text-sm" value={adminInputUsername} onChange={e => setAdminInputUsername(e.target.value)} /></div>
                                        <div><label className="text-xs font-bold text-slate-500 uppercase">PASSWORD BARU</label><input type="text" className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none font-bold text-sm" value={adminInputPassword} onChange={e => setAdminInputPassword(e.target.value)} /></div>
                                        <button onClick={handleUpdateCredentials} className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 uppercase text-sm">SIMPAN PERUBAHAN</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-1">
                            <ModernCard title="TANGGAL LAPORAN" icon={Calendar} headerColor="border-emerald-100" titleColor="text-emerald-700">
                                <input type="date" value={report.date} onChange={(e) => handleInputChange('date', e.target.value)} className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 p-3 font-medium outline-none" />
                            </ModernCard>
                        </div>
                        <div className="md:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                            <button onClick={() => setIsTtSettingsOpen(!isTtSettingsOpen)} className="w-full p-5 bg-white hover:bg-slate-50 flex justify-between items-center transition-colors group">
                                <div className="flex items-center space-x-3"><div className="p-2 bg-orange-50 text-orange-600 rounded-lg group-hover:bg-orange-100 transition-colors"><Settings className="w-5 h-5"/></div><span className="font-black text-emerald-800 text-sm uppercase tracking-wide">KONFIGURASI KAPASITAS (TT)</span></div>
                                <div className="flex items-center text-slate-400 text-xs font-medium"><span className="mr-2 hidden sm:block uppercase font-bold">{isTtSettingsOpen ? 'TUTUP' : 'UBAH KAPASITAS'}</span><ChevronRight className={`w-5 h-5 transition-transform duration-300 ${isTtSettingsOpen ? 'rotate-90' : ''}`}/></div>
                            </button>
                            {isTtSettingsOpen && (
                                <div className="p-5 border-t border-slate-100 bg-slate-50/50 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 animate-slide-down">
                                    {rooms.map(room => (<NumberInput key={room.ttKey} label={room.name} name={room.ttKey} value={report[room.ttKey]} onChange={handleInputChange} />))}
                                </div>
                            )}
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        <div className="md:col-span-2 lg:col-span-3 xl:col-span-4">
                            <ModernCard title="IGD & PONEK" icon={Activity} headerColor="border-emerald-100" titleColor="text-emerald-700">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div><h4 className="text-xs font-black text-emerald-700 uppercase mb-3 tracking-widest">KUNJUNGAN IGD</h4><div className="grid grid-cols-3 gap-3"><NumberInput label="PAGI" name="igdPagi" value={report.igdPagi} onChange={handleInputChange} /><NumberInput label="SORE" name="igdSore" value={report.igdSore} onChange={handleInputChange} /><NumberInput label="MALAM" name="igdMalam" value={report.igdMalam} onChange={handleInputChange} /></div></div>
                                    <div><h4 className="text-xs font-black text-emerald-700 uppercase mb-3 tracking-widest">IGD PONEK</h4><div className="grid grid-cols-3 gap-3"><NumberInput label="PAGI" name="igdPonekPagi" value={report.igdPonekPagi} onChange={handleInputChange} /><NumberInput label="SORE" name="igdPonekSore" value={report.igdPonekSore} onChange={handleInputChange} /><NumberInput label="MALAM" name="igdPonekMalam" value={report.igdPonekMalam} onChange={handleInputChange} /></div></div>
                                </div>
                            </ModernCard>
                        </div>
                        {rooms.map((room) => {
                            const IconComp = iconMap[room.icon] || Home;
                            const roomTextColor = "text-emerald-700";
                            return (
                            <div key={room.id} className="h-full">
                                <ModernCard title={room.name} icon={IconComp} titleColor={roomTextColor} headerColor="border-emerald-100" isAdminMode={isAdmin} action={isAdmin && <button onClick={() => deleteRoom(room.id, room.name)} className="p-1.5 bg-red-50 text-red-500 rounded hover:bg-red-100 transition-colors"><Trash2 className="w-3.5 h-3.5"/></button>}>
                                    <div className="grid grid-cols-3 gap-3">
                                        <NumberInput label="TOTAL" name={room.pasienKey} value={report[room.pasienKey]} onChange={handleInputChange} />
                                        <NumberInput label="BPJS" name={room.bpjsKey} value={report[room.bpjsKey]} onChange={handleInputChange} />
                                        {room.umumKey ? <NumberInput label="UMUM" name={room.umumKey} value={report[room.umumKey]} onChange={handleInputChange} /> : <div className="flex items-center justify-center h-full bg-slate-50 rounded-lg border border-slate-100 opacity-50"><span className="text-[10px] font-bold text-slate-300 uppercase">N/A</span></div>}
                                    </div>
                                </ModernCard>
                            </div>
                        )})}
                    </div>

                    <div className="hidden md:flex justify-end space-x-4 pt-8 pb-8">
                        <button onClick={handleGenerate} className="px-8 py-3 bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 rounded-xl font-bold shadow-sm flex items-center transition-all uppercase text-xs tracking-wider">
                            <FileText className="w-5 h-5 mr-2" /> PREVIEW LAPORAN
                        </button>
                        <button onClick={handleSave} disabled={isLoading} className="px-8 py-3 bg-emerald-600 text-white hover:bg-emerald-700 rounded-xl font-bold shadow-lg shadow-emerald-500/30 flex items-center transition-all disabled:opacity-70 uppercase text-xs tracking-wider">
                            {isLoading ? <Loader2 className="animate-spin w-5 h-5"/> : <Save className="w-5 h-5 mr-2" />} SIMPAN DATA
                        </button>
                    </div>
                    
                    <div className="md:hidden fixed bottom-[60px] left-0 right-0 p-4 bg-white/90 backdrop-blur-lg border-t border-slate-200 flex space-x-4 z-40">
                        <button onClick={handleGenerate} className="flex-1 py-3 bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 rounded-xl font-bold shadow-sm flex justify-center items-center transition-all uppercase text-xs">
                            <FileText className="w-5 h-5 mr-2" /> PREVIEW
                        </button>
                        <button onClick={handleSave} disabled={isLoading} className="flex-1 py-3 bg-emerald-600 text-white hover:bg-emerald-700 rounded-xl font-bold shadow-lg shadow-emerald-500/30 flex justify-center items-center transition-all disabled:opacity-70 uppercase text-xs">
                            {isLoading ? <Loader2 className="animate-spin w-5 h-5"/> : <Save className="w-5 h-5 mr-2" />} SIMPAN
                        </button>
                    </div>

                    <div className="h-32 md:h-0"></div>
                </div>
            )}
            
            {activeTab === 'dashboard' && (
                <div className="space-y-4 animate-fade-in-up">
                    <div className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white p-6 rounded-3xl shadow-xl shadow-emerald-600/20 relative overflow-hidden">
                        <div className="relative z-10"><h3 className="text-emerald-100 font-bold text-sm tracking-widest uppercase">TOTAL PASIEN RAWAT INAP</h3><p className="text-5xl font-extrabold my-3 tracking-tight">{rooms.reduce((sum, r) => sum + (report[r.pasienKey] || 0), 0)}</p></div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {rooms.map(room => {
                            const bor = (report[room.ttKey] || 0) > 0 ? ((report[room.pasienKey] / report[room.ttKey]) * 100).toFixed(0) : 0;
                            const isHigh = bor > 85;
                            return (
                            <div key={room.id} className={`relative overflow-hidden group p-5 rounded-3xl transition-all duration-300 hover:scale-[1.03] hover:shadow-xl bg-gradient-to-br ${room.color} ${room.shadow} text-white`}>
                                <div className="flex justify-between items-start mb-3 relative z-10"><div className="flex items-center space-x-2"><div className="p-1.5 bg-white/20 backdrop-blur-md rounded-lg">{iconMap[room.icon] ? React.createElement(iconMap[room.icon], { className: "w-3.5 h-3.5 text-white" }) : <Home className="w-3.5 h-3.5 text-white"/>}</div><span className="text-xs font-black text-white/90 uppercase truncate tracking-wide">{room.name}</span></div><span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isHigh ? 'bg-red-500 text-white animate-pulse' : 'bg-white/20 text-white border border-white/30'}`}>{bor}%</span></div>
                                <div className="flex items-baseline space-x-1 relative z-10"><span className="text-3xl font-black text-white">{report[room.pasienKey] || 0}</span><span className="text-xs text-white/80 font-bold uppercase">PASIEN</span></div>
                                <div className="mt-3 w-full bg-black/20 h-1.5 rounded-full overflow-hidden relative z-10"><div className={`h-full rounded-full ${isHigh ? 'bg-red-400' : 'bg-white'}`} style={{width: `${Math.min(bor, 100)}%`}}></div></div>
                            </div>
                        )})}
                    </div>
                </div>
            )}
            
            {activeTab === 'report' && (
                <div className="space-y-4 animate-fade-in-up">
                    <div className="bg-slate-900 text-emerald-400 p-5 rounded-2xl shadow-lg font-mono text-xs whitespace-pre-wrap leading-relaxed overflow-x-auto border border-slate-700 uppercase">{generatedText || "TEKAN TOMBOL 'PREVIEW' PADA MENU INPUT UNTUK MELIHAT DRAFT LAPORAN."}</div>
                    <button onClick={() => {navigator.clipboard.writeText(generatedText); alert('DISALIN!')}} className="w-full bg-emerald-600 text-white py-4 rounded-2xl shadow-lg shadow-emerald-500/30 font-bold flex justify-center items-center hover:bg-emerald-700 transition-colors uppercase text-sm tracking-wider"><Copy className="w-5 h-5 mr-2"/> SALIN TEKS KE CLIPBOARD</button>
                </div>
            )}
            
            {activeTab === 'history' && (
                <div className="max-w-4xl mx-auto grid gap-4 animate-in fade-in zoom-in-95 duration-300">
                    {savedReports.map(item => (
                        <div key={item.id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex justify-between items-center hover:shadow-md transition-shadow">
                            <div><div className="font-bold text-slate-800 flex items-center uppercase text-sm"><Calendar className="w-3.5 h-3.5 mr-2 text-blue-500"/>{new Date(item.date).toLocaleDateString('id-ID', {weekday: 'long', day:'numeric', month:'long', year:'numeric'})}</div><div className="text-xs text-slate-400 mt-1 flex items-center font-bold"><Clock className="w-3 h-3 mr-1"/>{new Date(item.createdAt?.seconds * 1000).toLocaleTimeString('id-ID', {hour:'2-digit', minute:'2-digit'})} WIB<span className="mx-2">•</span><span>OLEH: {item.userId ? item.userId.slice(0,4)+'...' : 'ANONIM'}</span></div></div>
                            <div className="flex space-x-2"><button onClick={() => {setReport(item); setActiveTab('input')}} className="p-2.5 bg-yellow-50 text-yellow-600 rounded-xl hover:bg-yellow-100 transition-colors"><FileText className="w-4 h-4"/></button><button onClick={() => handleDelete(item.id)} className="p-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors"><Trash2 className="w-4 h-4"/></button></div>
                        </div>
                    ))}
                </div>
            )}
        </main>
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 pb-safe z-50">
            <div className="flex justify-around p-1">
                {sidebarItems.map(item => (
                    <button key={item.id} onClick={() => setActiveTab(item.id)} className={`flex-1 flex flex-col items-center py-2 rounded-lg transition-colors ${activeTab === item.id ? 'text-emerald-600' : 'text-slate-400'}`}><item.icon className={`w-6 h-6 mb-1 ${activeTab === item.id ? 'fill-emerald-100' : ''}`}/><span className="text-[10px] font-bold uppercase">{item.label}</span></button>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
};

export default PatientReportModule;
