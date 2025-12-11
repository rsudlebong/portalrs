// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, serverTimestamp } from 'firebase/firestore';

// =========================================================
// !!! GANTI DENGAN KONFIGURASI FIREBASE ANDA YANG VALID !!!
// =========================================================
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};
// =========================================================

const appId = 'portal-rsud'; 
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const getLocalDate = () => {
    const d = new Date();
    const offset = d.getTimezoneOffset() * 60000; 
    const localISOTime = (new Date(d - offset)).toISOString().slice(0, 10);
    return localISOTime;
};

// Data Default Ruangan
export const defaultRooms = [
    { id: 'hcu', name: 'HCU', icon: 'Heart', ttKey: 'hcuTT', pasienKey: 'hcuPasien', bpjsKey: 'hcuBpjs', umumKey: 'hcuUmum', ttLabel: 'TT', color: 'from-blue-500 to-cyan-400', shadow: 'shadow-blue-500/20', text: 'text-blue-600', bg: 'bg-blue-50', defaultTT: 4 },
    { id: 'nicu', name: 'NICU', icon: 'Heart', ttKey: 'nicuInkubator', pasienKey: 'nicuPasien', bpjsKey: 'nicuBpjs', umumKey: 'nicuUmum', ttLabel: 'Ink.', color: 'from-pink-500 to-rose-400', shadow: 'shadow-pink-500/20', text: 'text-pink-600', bg: 'bg-pink-50', defaultTT: 8 },
    { id: 'picu', name: 'PICU', icon: 'Heart', ttKey: 'picuTT', pasienKey: 'picuPasien', bpjsKey: 'picuBpjs', umumKey: 'picuUmum', ttLabel: 'TT', color: 'from-purple-500 to-violet-400', shadow: 'shadow-purple-500/20', text: 'text-purple-600', bg: 'bg-purple-50', defaultTT: 4 },
    { id: 'ranapAnak', name: 'Ranap Anak', icon: 'Home', ttKey: 'ranapAnakTT', pasienKey: 'ranapAnakPasien', bpjsKey: 'ranapAnakBpjs', umumKey: 'ranapAnakUmum', ttLabel: 'TT', color: 'from-orange-400 to-amber-400', shadow: 'shadow-orange-500/20', text: 'text-orange-600', bg: 'bg-orange-50', defaultTT: 10 },
    { id: 'ranapBedah', name: 'Ranap Bedah', icon: 'Home', ttKey: 'ranapBedahTT', pasienKey: 'ranapBedahPasien', bpjsKey: 'ranapBedahBpjs', umumKey: 'ranapBedahUmum', ttLabel: 'TT', color: 'from-emerald-500 to-teal-400', shadow: 'shadow-emerald-500/20', text: 'text-emerald-600', bg: 'bg-emerald-50', defaultTT: 12 },
    { id: 'ranapDalam', name: 'Penyakit Dalam', icon: 'Home', ttKey: 'ranapDalamTT', pasienKey: 'ranapDalamPasien', bpjsKey: 'ranapDalamBpjs', umumKey: 'ranapDalamUmum', ttLabel: 'TT', color: 'from-indigo-500 to-blue-600', shadow: 'shadow-indigo-500/20', text: 'text-indigo-600', bg: 'bg-indigo-50', defaultTT: 15 },
    { id: 'kohort', name: 'Kohort', icon: 'Home', ttKey: 'kohortTT', pasienKey: 'kohortPasien', bpjsKey: 'kohortBpjs', umumKey: 'kohortUmum', ttLabel: 'TT', color: 'from-slate-500 to-gray-400', shadow: 'shadow-slate-500/20', text: 'text-slate-600', bg: 'bg-slate-50', defaultTT: 6 },
    { id: 'ranapVip', name: 'VIP', icon: 'Home', ttKey: 'ranapVipTT', pasienKey: 'ranapVipPasien', bpjsKey: 'ranapVipBpjs', umumKey: 'ranapVipUmum', ttLabel: 'TT', color: 'from-yellow-500 to-amber-500', shadow: 'shadow-yellow-500/20', text: 'text-yellow-600', bg: 'bg-yellow-50', defaultTT: 5 },
    { id: 'ranapKbd', name: 'Kebidanan', icon: 'Home', ttKey: 'ranapKbdTT', pasienKey: 'ranapKbdPasien', bpjsKey: 'ranapKbdBpjs', umumKey: 'ranapKbdUmum', ttLabel: 'TT', color: 'from-red-500 to-pink-500', shadow: 'shadow-red-500/20', text: 'text-red-600', bg: 'bg-red-50', defaultTT: 18 },
];

export const initialReportData = {
  date: getLocalDate(),
  igdPagi: 0, igdSore: 0, igdMalam: 0,
  igdPonekPagi: 0, igdPonekSore: 0, igdPonekMalam: 0,
  operasiTanggal: getLocalDate(), 
  operasiObgynElektif: 0, operasiObgynCito: 0, operasiBedahElektif: 0, operasiBedahCito: 0,
  hdPagi: 0, hdSiang: 0, hdCito: 0,
  kohortUmum: 0,
};

defaultRooms.forEach(room => { if (room.ttKey) { initialReportData[room.ttKey] = room.defaultTT || 0; }});

export { auth, db, appId, serverTimestamp, getLocalDate };
