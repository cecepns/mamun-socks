import React, { useState, useEffect } from 'react';
import { Calendar, BarChart3, TrendingUp, Package, Medal } from 'lucide-react';
import toast from 'react-hot-toast';
import { request } from '../utils/request';
import { API_ENDPOINTS } from '../utils/endpoints';

export const AdminReports = () => {
  const [range, setRange] = useState('7days'); // '7days', '30days'
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const res = await request.get(API_ENDPOINTS.REPORTS.SALES, { params: { range } });
      if (res.success) {
        setReportData(res.data);
      }
    } catch (error) {
      toast.error('Gagal mengambil laporan penjualan.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [range]);

  if (loading) {
    return (
      <div className="space-y-6 shimmer-wrapper">
        <div className="h-96 bg-white border border-slate-100 rounded-3xl" />
        <div className="h-96 bg-white border border-slate-100 rounded-3xl" />
      </div>
    );
  }

  // Calculate totals from range
  const chartPoints = reportData?.chartData || [];
  const topProducts = reportData?.topProducts || [];
  const totalRevenue = chartPoints.reduce((sum, p) => sum + parseFloat(p.revenue || 0), 0);
  const totalOrders = chartPoints.reduce((sum, p) => sum + parseInt(p.total_orders || 0), 0);

  // Maximum value for chart scaling
  const maxRevenue = Math.max(...chartPoints.map(p => parseFloat(p.revenue || 0)), 1);

  return (
    <div className="space-y-8">
      
      {/* Range controls & KPIs */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <BarChart3 className="text-emerald-600" size={20} /> Laporan Penjualan Kaos Kaki
          </h2>
          <p className="text-xs text-slate-500">Analisis performa omzet penjualan dan produk terlaris di Mamun Socks.</p>
        </div>

        {/* Range Selector */}
        <div className="flex bg-slate-100 p-1 rounded-xl w-full md:w-auto">
          <button
            onClick={() => setRange('7days')}
            className={`flex-1 md:flex-initial px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${range === '7days' ? 'bg-white text-emerald-950 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
          >
            7 Hari Terakhir
          </button>
          <button
            onClick={() => setRange('30days')}
            className={`flex-1 md:flex-initial px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${range === '30days' ? 'bg-white text-emerald-950 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
          >
            30 Hari Terakhir
          </button>
        </div>
      </div>

      {/* Aggregate metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-emerald-800 to-emerald-950 p-6 rounded-3xl text-white shadow-lg relative overflow-hidden flex flex-col justify-between h-36">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full filter blur-xl" />
          <span className="text-[10px] font-bold tracking-wider uppercase opacity-80">Total Omzet Penjualan ({range === '7days' ? '7 Hari' : '30 Hari'})</span>
          <div>
            <p className="text-3xl font-extrabold">Rp {totalRevenue.toLocaleString('id-ID')}</p>
            <p className="text-[10px] opacity-75 mt-1">Hanya mencakup transaksi berstatus Diproses (Processing) & Selesai (Completed)</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between h-36">
          <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">Volume Transaksi Berhasil</span>
          <div>
            <p className="text-3xl font-extrabold text-slate-800">{totalOrders} Pesanan</p>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
              <TrendingUp size={14} className="text-emerald-600" />
              Rata-rata keranjang: Rp {totalOrders > 0 ? Math.round(totalRevenue / totalOrders).toLocaleString('id-ID') : 0}
            </p>
          </div>
        </div>
      </div>

      {/* CSS-based Bar Chart */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6">
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Grafik Penjualan Harian</h3>
        
        {chartPoints.length === 0 ? (
          <p className="text-xs text-slate-400 py-16 text-center">Belum ada grafik penjualan untuk rentang waktu ini.</p>
        ) : (
          <div>
            {/* Chart Area */}
            <div className="h-64 flex items-end gap-3 md:gap-5 border-b border-slate-100 pb-2 overflow-x-auto">
              {chartPoints.map((point, idx) => {
                const heightPercentage = Math.max((parseFloat(point.revenue) / maxRevenue) * 100, 3); // min height of 3%
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center min-w-[50px] group">
                    <span className="text-[9px] font-bold text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-50 border border-slate-100 px-1 py-0.5 rounded shadow mb-1">
                      Rp{Math.round(point.revenue/1000)}k
                    </span>
                    <div 
                      style={{ height: `${heightPercentage}%` }}
                      className="w-full bg-gradient-to-t from-emerald-700 to-emerald-500 rounded-t-lg shadow group-hover:from-emerald-600 group-hover:to-emerald-400 transition-all duration-300"
                    />
                  </div>
                );
              })}
            </div>
            {/* Dates Labels */}
            <div className="flex gap-3 md:gap-5 pt-2 text-[9px] font-bold text-slate-400 overflow-x-auto">
              {chartPoints.map((point, idx) => {
                const dateObj = new Date(point.date);
                const label = dateObj.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
                return (
                  <span key={idx} className="flex-1 text-center min-w-[50px] truncate">
                    {label}
                  </span>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Top Product Variants Table */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
          <Medal size={16} className="text-yellow-500" /> Peringkat Varian Kaos Kaki Terlaris
        </h3>
        
        {topProducts.length === 0 ? (
          <p className="text-xs text-slate-400 py-6 text-center">Belum ada data varian yang terjual.</p>
        ) : (
          <div className="overflow-x-auto border border-slate-50 rounded-2xl">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                  <th className="p-3 text-center">RANK</th>
                  <th className="p-3">NAMA KAOS KAKI</th>
                  <th className="p-3">VARIAN (MODEL - WARNA)</th>
                  <th className="p-3 text-center">JUMLAH TERJUAL</th>
                  <th className="p-3 text-right">OMZET KONTRIBUSI</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-slate-700">
                {topProducts.map((prod, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50">
                    <td className="p-3 text-center font-bold text-slate-400">
                      {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : idx + 1}
                    </td>
                    <td className="p-3 font-semibold text-slate-800">{prod.product_name}</td>
                    <td className="p-3 capitalize">{prod.model} - {prod.color}</td>
                    <td className="p-3 text-center font-bold text-slate-800">{prod.quantity_sold} pcs</td>
                    <td className="p-3 text-right font-bold text-emerald-600">
                      Rp {parseFloat(prod.revenue).toLocaleString('id-ID')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};
