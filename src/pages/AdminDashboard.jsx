import React, { useState, useEffect } from 'react';
import { ShoppingBag, TrendingUp, AlertTriangle, ClipboardList, Package } from 'lucide-react';
import toast from 'react-hot-toast';
import { request } from '../utils/request';
import { API_ENDPOINTS } from '../utils/endpoints';

export const AdminDashboard = ({ navigateToTab }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [savingSettings, setSavingSettings] = useState(false);

  const fetchStatsAndSettings = async () => {
    setLoading(true);
    try {
      const [statsRes, settingsRes] = await Promise.all([
        request.get(API_ENDPOINTS.REPORTS.DASHBOARD),
        request.get(API_ENDPOINTS.SETTINGS.GET)
      ]);
      
      if (statsRes.success) {
        setStats(statsRes.data);
      }
      if (settingsRes.success && settingsRes.data.whatsapp_number) {
        setWhatsappNumber(settingsRes.data.whatsapp_number);
      }
    } catch (error) {
      toast.error('Gagal mengambil data dashboard.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    if (!whatsappNumber.trim()) {
      toast.error('Nomor WhatsApp tidak boleh kosong.');
      return;
    }
    
    setSavingSettings(true);
    try {
      const res = await request.put(API_ENDPOINTS.SETTINGS.UPDATE, {
        whatsapp_number: whatsappNumber.trim()
      });
      if (res.success) {
        toast.success('Nomor WhatsApp berhasil disimpan.');
      }
    } catch (err) {
      toast.error(err.message || 'Gagal menyimpan pengaturan.');
    } finally {
      setSavingSettings(false);
    }
  };

  useEffect(() => {
    fetchStatsAndSettings();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 shimmer-wrapper">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 bg-white border border-slate-100 rounded-3xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-96 bg-white border border-slate-100 rounded-3xl" />
          <div className="h-96 bg-white border border-slate-100 rounded-3xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Total Pendapatan</span>
            <p className="text-2xl font-bold text-slate-800">
              Rp {stats?.totalRevenue.toLocaleString('id-ID')}
            </p>
          </div>
          <div className="p-3.5 bg-emerald-50 rounded-2xl text-emerald-600">
            <TrendingUp size={24} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Total Transaksi</span>
            <p className="text-2xl font-bold text-slate-800">{stats?.totalOrders} Order</p>
          </div>
          <div className="p-3.5 bg-blue-50 rounded-2xl text-blue-600">
            <ShoppingBag size={24} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Peringatan Stok</span>
            <p className="text-2xl font-bold text-slate-800">{stats?.lowStockCount} Varian</p>
          </div>
          <div className="p-3.5 bg-red-50 rounded-2xl text-red-600">
            <AlertTriangle size={24} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Kategori Lokasi</span>
            <p className="text-2xl font-bold text-slate-800">KAB. BANDUNG</p>
          </div>
          <div className="p-3.5 bg-teal-50 rounded-2xl text-teal-600">
            <Package size={24} />
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Recent Orders List */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <ClipboardList size={18} className="text-emerald-600" /> Transaksi Terbaru
              </h3>
              <button 
                onClick={() => navigateToTab('orders')}
                className="text-xs text-emerald-600 hover:text-emerald-500 font-bold transition-all"
              >
                Lihat Semua
              </button>
            </div>

            {stats?.recentOrders?.length === 0 ? (
              <p className="text-sm text-slate-400 py-6 text-center">Belum ada transaksi di toko ini.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 font-semibold">
                      <th className="pb-3 text-xs">ID PESANAN</th>
                      <th className="pb-3 text-xs">PELANGGAN</th>
                      <th className="pb-3 text-xs">TOTAL</th>
                      <th className="pb-3 text-xs">STATUS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {stats?.recentOrders?.map(order => {
                      const statusStyles = {
                        pending: 'bg-yellow-50 text-yellow-700 border-yellow-100',
                        processing: 'bg-blue-50 text-blue-700 border-blue-100',
                        completed: 'bg-emerald-50 text-emerald-700 border-emerald-100',
                        cancelled: 'bg-red-50 text-red-700 border-red-100'
                      };
                      return (
                        <tr key={order.id} className="text-slate-700">
                          <td className="py-3.5 font-bold text-slate-800 text-xs">{order.order_number}</td>
                          <td className="py-3.5 text-xs">{order.customer_name}</td>
                          <td className="py-3.5 text-xs font-semibold">Rp {parseFloat(order.total_amount).toLocaleString('id-ID')}</td>
                          <td className="py-3.5">
                            <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusStyles[order.status] || 'bg-slate-50 text-slate-500 border-slate-200'}`}>
                              {order.status.toUpperCase()}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Low Stock Checklist */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2 mb-6">
              <AlertTriangle size={18} className="text-red-500" /> Peringatan Stok Tipis
            </h3>

            {stats?.lowStockItems?.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">Semua stok kaos kaki aman (di atas 10 pcs).</p>
            ) : (
              <div className="space-y-4 max-h-[30vh] overflow-y-auto pr-1">
                {stats?.lowStockItems?.map(item => (
                  <div key={item.id} className="flex items-center justify-between p-3 bg-red-50/30 border border-red-100/30 rounded-2xl">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-800 truncate">{item.product_name}</p>
                      <p className="text-[10px] text-slate-500 capitalize">{item.model} - {item.color}</p>
                    </div>
                    <span className="text-xs font-bold text-red-600 bg-red-50 border border-red-100 px-2.5 py-0.5 rounded-lg flex-shrink-0">
                      Sisa: {item.stock} pcs
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <button
            onClick={() => navigateToTab('stock')}
            className="w-full mt-6 py-2.5 border border-red-200 text-red-600 hover:bg-red-50 font-bold text-xs rounded-xl transition-all text-center"
          >
            Lakukan Stok Opname
          </button>
        </div>

      </div>

      {/* Settings Panel */}
      <div className="max-w-md bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
          <svg className="w-5 h-5 text-emerald-600 fill-current" viewBox="0 0 24 24">
            <path d="M12.012 2c-5.506 0-9.988 4.47-9.988 9.972 0 1.764.462 3.42 1.265 4.876l-1.291 4.722 4.846-1.268a9.92 9.92 0 0 0 4.168.938h.004c5.506 0 9.988-4.47 9.988-9.972C22 6.47 17.518 2 12.012 2zm0 18.286c-1.579 0-3.13-.42-4.492-1.22l-.322-.192-2.858.748.765-2.784-.212-.336a8.212 8.212 0 0 1-1.263-4.398c0-4.542 3.704-8.238 8.263-8.238 4.558 0 8.262 3.696 8.262 8.242 0 4.542-3.704 8.238-8.263 8.238zm4.536-6.19c-.248-.124-1.47-.723-1.696-.807-.226-.083-.39-.124-.554.124-.164.248-.633.807-.775.972-.142.164-.284.185-.532.062-.248-.124-1.047-.385-1.996-1.23-.738-.657-1.236-1.47-1.38-1.72-.144-.247-.015-.38.11-.502.112-.11.248-.288.372-.433.124-.144.165-.247.248-.412.083-.165.04-.31-.02-.433-.06-.124-.554-1.336-.76-1.83-.2-.486-.4-.42-.553-.42-.143-.004-.308-.004-.473-.004a.91.91 0 0 0-.66.31c-.226.247-.864.845-.864 2.06 0 1.217.886 2.392.99 2.557.123.164 1.742 2.66 4.22 3.727.59.254 1.05.406 1.41.52.593.189 1.133.162 1.56.098.476-.072 1.47-.6 1.676-1.176.206-.577.206-1.072.144-1.176-.062-.104-.227-.164-.474-.288z" />
          </svg>
          Pengaturan WhatsApp Toko
        </h3>
        <form onSubmit={handleSaveSettings} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Nomor WhatsApp Penerima</label>
            <input 
              type="text"
              placeholder="Contoh: 6281234567890"
              value={whatsappNumber}
              onChange={(e) => setWhatsappNumber(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
            />
            <p className="text-[10px] text-slate-400 mt-1">Masukkan kode negara di awal (contoh: 62 untuk Indonesia) tanpa spasi atau tanda +.</p>
          </div>
          <button
            type="submit"
            disabled={savingSettings}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold py-2.5 px-4 rounded-xl flex items-center justify-center transition-all disabled:opacity-50"
          >
            {savingSettings ? 'Menyimpan...' : 'Simpan Nomor'}
          </button>
        </form>
      </div>

    </div>
  );
};
