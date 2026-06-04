import React, { useState, useEffect } from 'react';
import { Search, ClipboardList, Plus, Calendar, Edit2, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { request } from '../utils/request';
import { API_ENDPOINTS } from '../utils/endpoints';
import { Modal } from '../components/Modals';

export const AdminStockLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit, setLimit] = useState(10);

  // Manual Adjustment Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  
  // Lists for dropdown selections
  const [productsList, setProductsList] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [selectedVariantId, setSelectedVariantId] = useState('');
  const [targetStock, setTargetStock] = useState('');
  const [adjustmentDate, setAdjustmentDate] = useState('');
  const [notes, setNotes] = useState('');

  // Debounced search handler
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await request.get(API_ENDPOINTS.STOCK.LOGS, {
        params: { search: debouncedSearch, page, limit }
      });
      if (res.success) {
        setLogs(res.data);
        setTotalPages(res.pagination.totalPages || 1);
      }
    } catch (error) {
      toast.error('Gagal mengambil riwayat mutasi stok.');
    } finally {
      setLoading(false);
    }
  };

  const fetchProductsForDropdown = async () => {
    try {
      const res = await request.get(API_ENDPOINTS.PRODUCTS.LIST, { params: { limit: 100 } });
      if (res.success) {
        setProductsList(res.data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [debouncedSearch, page, limit]);

  useEffect(() => {
    if (isModalOpen) {
      fetchProductsForDropdown();
      const today = new Date();
      const offset = today.getTimezoneOffset();
      const localToday = new Date(today.getTime() - (offset*60*1000));
      setAdjustmentDate(localToday.toISOString().split('T')[0]);
      setSelectedProductId('');
      setSelectedVariantId('');
      setTargetStock('');
      setNotes('');
    }
  }, [isModalOpen]);

  // Handle selected product's variants list
  const activeProduct = productsList.find(p => p.id === parseInt(selectedProductId));
  const variantsList = activeProduct ? activeProduct.variants || [] : [];

  const handleAdjustSubmit = async (e) => {
    e.preventDefault();
    if (!selectedVariantId || targetStock === '' || !adjustmentDate) {
      toast.error('Silakan isi varian produk, jumlah stok target, dan tanggal penyesuaian.');
      return;
    }

    setModalLoading(true);
    try {
      const payload = {
        variant_id: parseInt(selectedVariantId),
        new_stock: parseInt(targetStock),
        notes: notes || 'Manual Stock Opname Adjustment',
        adjustment_date: new Date(adjustmentDate + 'T12:00:00').toISOString()
      };

      const res = await request.post(API_ENDPOINTS.STOCK.ADJUST, payload);
      if (res.success) {
        toast.success(res.message || 'Stok berhasil disinkronkan!');
        setIsModalOpen(false);
        fetchLogs();
      }
    } catch (error) {
      toast.error(error.message || 'Gagal mengubah stok.');
    } finally {
      setModalLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Mutasi & Stok Opname</h2>
          <p className="text-xs text-slate-500">Audit pencatatan keluar-masuk stok barang, penyesuaian manual, dan opname fisik.</p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow shadow-emerald-600/10 transition-all"
        >
          <Plus size={16} /> Stok Opname Manual
        </button>
      </div>

      {/* Filters and search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-50 pt-4">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
          <input
            type="text"
            placeholder="Cari produk, model, catatan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
          />
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500 justify-end w-full sm:w-auto">
          <span>Limit</span>
          <select
            value={limit}
            onChange={(e) => { setLimit(parseInt(e.target.value)); setPage(1); }}
            className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs outline-none"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
          <span>data</span>
        </div>
      </div>

      {/* Logs Table */}
      {loading ? (
        <div className="space-y-3 py-6 shimmer-wrapper">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-slate-50 border border-slate-100 rounded-2xl" />
          ))}
        </div>
      ) : logs.length === 0 ? (
        <div className="text-center py-16 text-slate-400 text-xs">
          Belum ada riwayat mutasi stok.
        </div>
      ) : (
        <div className="overflow-x-auto border border-slate-100 rounded-2xl">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                <th className="p-4">TANGGAL MUTASI</th>
                <th className="p-4">PRODUK (VARIAN)</th>
                <th className="p-4">JENIS</th>
                <th className="p-4">KUANTITAS</th>
                <th className="p-4">CATATAN / REFERENSI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {logs.map(log => {
                const badgeStyles = {
                  in: 'bg-emerald-50 text-emerald-700 border-emerald-100',
                  out: 'bg-red-50 text-red-700 border-red-100',
                  adjustment: 'bg-blue-50 text-blue-700 border-blue-100'
                };
                return (
                  <tr key={log.id} className="hover:bg-slate-50/50 text-slate-700">
                    <td className="p-4 font-medium text-slate-600">
                      {new Date(log.log_date).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}{' '}
                      <span className="text-[10px] text-slate-400">
                        {new Date(log.log_date).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="font-semibold text-slate-800 block">{log.product_name}</span>
                      <span className="text-[10px] text-slate-500 capitalize">{log.model} - {log.color}</span>
                    </td>
                    <td className="p-4">
                      <span className={`inline-block text-[10px] font-bold px-2.5 py-0.5 rounded-full border uppercase ${badgeStyles[log.type] || 'bg-slate-50 border-slate-200 text-slate-600'}`}>
                        {log.type}
                      </span>
                    </td>
                    <td className="p-4 font-bold text-slate-800">
                      {log.type === 'out' ? '-' : '+'}{log.quantity} pcs
                    </td>
                    <td className="p-4 text-slate-600 max-w-xs truncate" title={log.reference}>
                      {log.reference || '-'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Table Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-1.5 pt-4">
          <button
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
            className="p-2 border border-slate-200 bg-white hover:bg-slate-50 rounded-xl transition-colors disabled:opacity-40"
          >
            <ChevronLeft size={14} />
          </button>
          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              onClick={() => setPage(i + 1)}
              className={`w-8 h-8 text-xs font-semibold rounded-xl border transition-all ${page === i + 1 ? 'bg-emerald-600 border-emerald-600 text-white shadow' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'}`}
            >
              {i + 1}
            </button>
          ))}
          <button
            disabled={page >= totalPages}
            onClick={() => setPage(page + 1)}
            className="p-2 border border-slate-200 bg-white hover:bg-slate-50 rounded-xl transition-colors disabled:opacity-40"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      )}

      {/* ADJUSTMENT DIALOG MODAL */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Pencatatan Stok Opname (Manual)" size="md">
        <form onSubmit={handleAdjustSubmit} className="space-y-4 text-xs">
          
          <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-2xl flex gap-3 text-amber-800">
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-amber-600 mt-0.5" />
            <div>
              <span className="font-bold">Peringatan Sinkron Tanggal:</span>
              <p className="mt-0.5 leading-relaxed text-[10px]">
                Sistem menerapkan validasi sinkron tanggal maju. Tanggal transaksi manual tidak boleh mundur lebih awal dari transaksi terbaru di database.
              </p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">1. Pilih Kaos Kaki</label>
            <select
              value={selectedProductId}
              onChange={(e) => { setSelectedProductId(e.target.value); setSelectedVariantId(''); }}
              className="block w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              required
            >
              <option value="">-- Pilih Produk --</option>
              {productsList.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          {selectedProductId && (
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">2. Pilih Kombinasi Variasi (Model - Warna)</label>
              <select
                value={selectedVariantId}
                onChange={(e) => setSelectedVariantId(e.target.value)}
                className="block w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                required
              >
                <option value="">-- Pilih Variasi --</option>
                {variantsList.map(v => (
                  <option key={v.id} value={v.id}>
                    {v.model} - {v.color} (Stok Saat Ini: {v.stock} pcs)
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">3. Jumlah Stok Fisik Baru (Opname)</label>
              <input
                type="number"
                value={targetStock}
                onChange={(e) => setTargetStock(e.target.value)}
                className="block w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="Contoh: 15"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">4. Tanggal Penyesuaian</label>
              <input
                type="date"
                value={adjustmentDate}
                onChange={(e) => setAdjustmentDate(e.target.value)}
                className="block w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">5. Catatan / Alasan Opname</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="block w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none"
              placeholder="Contoh: Selisih hitung stok, rusak 2 pasang, dll."
              required
            />
          </div>

          <div className="border-t border-slate-100 pt-4 mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl font-bold transition-all"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={modalLoading}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold shadow transition-all flex items-center justify-center min-w-[80px]"
            >
              {modalLoading ? (
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                'Simpan Opname'
              )}
            </button>
          </div>

        </form>
      </Modal>

    </div>
  );
};
