import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { MapPin, Mail, Phone, ArrowLeft, MessageSquare } from 'lucide-react';
import { request } from '../utils/request';
import { API_ENDPOINTS } from '../utils/endpoints';
import { Header } from '../components/Header';

export const Contact = ({ user, cart, onLogout }) => {
  const navigate = useNavigate();
  const [settings, setSettings] = useState({
    contact_address: 'Sukawangi kaler no 126 jelegong kutawaringin kabupaten bandung',
    contact_email: '',
    contact_phone: '',
    whatsapp_number: '6281234567890'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await request.get(API_ENDPOINTS.SETTINGS.GET);
        if (res.success) {
          setSettings(prev => ({
            ...prev,
            ...res.data
          }));
        }
      } catch (err) {
        console.error('Failed to load settings', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-20 selection:bg-slate-900 selection:text-white">
      {/* Reusable Header */}
      <Header user={user} onLogout={onLogout} cart={cart} />

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 w-full space-y-6">
        
        {/* Back Button Inside Page Body Content */}
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 group self-start">
          <div className="p-2 bg-white border border-slate-200 rounded-full group-hover:bg-slate-900 group-hover:text-white transition-all shadow-sm">
            <ArrowLeft size={14} />
          </div>
          <span className="text-[10px] uppercase tracking-widest font-extrabold text-slate-500 group-hover:text-slate-950 transition-colors">
            Kembali
          </span>
        </button>

        <div className="text-center space-y-3 mb-12">
          <span className="inline-block text-[9px] font-extrabold tracking-widest px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full uppercase">
            Hubungi Kami
          </span>
          <h2 className="text-3xl font-black text-slate-900 uppercase tracking-wide">Hubungi & Kunjungi Toko</h2>
          <p className="text-xs text-slate-400 max-w-md mx-auto">Ada pertanyaan atau ingin membeli dalam jumlah partai besar? Hubungi tim kami melalui jalur kontak di bawah ini.</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Address Card */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xl shadow-slate-100/30 flex flex-col items-center text-center space-y-4 hover:-translate-y-1 transition-all duration-300">
              <div className="p-3.5 bg-emerald-50 text-emerald-600 rounded-2xl">
                <MapPin size={24} />
              </div>
              <div className="space-y-1.5 flex-1 flex flex-col justify-between">
                <h3 className="text-sm font-black uppercase tracking-wider text-slate-900">Alamat Toko</h3>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                  {settings.contact_address || 'Sukawangi kaler no 126 jelegong kutawaringin kabupaten bandung'}
                </p>
                <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider block mt-2">Bandung, Indonesia</span>
              </div>
            </div>

            {/* Email Card */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xl shadow-slate-100/30 flex flex-col items-center text-center space-y-4 hover:-translate-y-1 transition-all duration-300">
              <div className="p-3.5 bg-blue-50 text-blue-600 rounded-2xl">
                <Mail size={24} />
              </div>
              <div className="space-y-1.5 flex-1 flex flex-col justify-between">
                <h3 className="text-sm font-black uppercase tracking-wider text-slate-900">Surat Elektronik</h3>
                <p className="text-xs text-slate-500 font-medium break-all">
                  {settings.contact_email || 'Email belum tersedia'}
                </p>
                {settings.contact_email && (
                  <a href={`mailto:${settings.contact_email}`} className="text-[10px] text-blue-600 font-bold uppercase tracking-wider hover:underline block mt-2">
                    Kirim Email
                  </a>
                )}
              </div>
            </div>

            {/* Phone Card */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xl shadow-slate-100/30 flex flex-col items-center text-center space-y-4 hover:-translate-y-1 transition-all duration-300">
              <div className="p-3.5 bg-purple-50 text-purple-600 rounded-2xl">
                <Phone size={24} />
              </div>
              <div className="space-y-1.5 flex-1 flex flex-col justify-between">
                <h3 className="text-sm font-black uppercase tracking-wider text-slate-900">Nomor Telepon</h3>
                <p className="text-xs text-slate-500 font-medium">
                  {settings.contact_phone || 'Telepon belum tersedia'}
                </p>
                {settings.contact_phone && (
                  <a href={`tel:${settings.contact_phone}`} className="text-[10px] text-purple-600 font-bold uppercase tracking-wider hover:underline block mt-2">
                    Hubungi Telepon
                  </a>
                )}
              </div>
            </div>

          </div>
        )}

        {/* WhatsApp Banner */}
        {!loading && (
          <div className="bg-slate-950 text-white rounded-3xl p-6 sm:p-8 mt-12 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl shadow-slate-900/10">
            <div className="space-y-2 text-center sm:text-left">
              <h3 className="text-lg font-black uppercase tracking-wider">Fast Response via WhatsApp</h3>
              <p className="text-xs text-slate-400 font-light leading-relaxed max-w-md">Koneksi langsung dengan admin penjualan kami untuk respon super cepat mengenai stok produk, pengiriman, dan pesanan khusus.</p>
            </div>
            <a
              href={`https://wa.me/${settings.whatsapp_number}?text=Halo%20Mamun%20Socks%2C%20saya%20ingin%20bertanya%20mengenai%20produk%20kaos%20kaki.`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 px-6 py-3 rounded-full text-xs font-bold uppercase tracking-widest text-white shadow-md shadow-emerald-500/10 transition-all"
            >
              <MessageSquare size={14} /> Hubungi WhatsApp
            </a>
          </div>
        )}
      </main>
    </div>
  );
};
