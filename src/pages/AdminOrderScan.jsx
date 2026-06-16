import React, { useState } from 'react';
import { Search, Package, ClipboardList, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { request } from '../utils/request';
import { API_ENDPOINTS } from '../utils/endpoints';

export const AdminOrderScan = () => {
  const [searchType, setSearchType] = useState('sku');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleSearch = async (e) => {
    e?.preventDefault();
    if (!query.trim()) {
      toast.error('Masukkan SKU atau nomor pesanan.');
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const params = searchType === 'sku' ? { sku: query.trim() } : { order_number: query.trim() };
      const res = await request.get(API_ENDPOINTS.LOOKUP, { params });
      if (res.success) {
        setResult(res);
      } else {
        toast.error('Data tidak ditemukan.');
      }
    } catch (err) {
      toast.error(err.message || 'Data tidak ditemukan.');
    } finally {
      setLoading(false);
    }
  };

  const statusLabel = {
    pending: 'Pending',
    processing: 'Diproses',
    completed: 'Selesai',
    cancelled: 'Dibatalkan'
  };

  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6">
      <div>
        <h2 className="text-lg font-bold text-slate-800">Cek Pesanan & SKU</h2>
        <p className="text-xs text-slate-500">Scan atau ketik SKU / nomor pesanan untuk melihat detail barang dan status proses.</p>
      </div>

      <form onSubmit={handleSearch} className="space-y-4 border-t border-slate-50 pt-4">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setSearchType('sku')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${searchType === 'sku' ? 'bg-emerald-600 text-white' : 'bg-slate-50 text-slate-600 border border-slate-200'}`}
          >
            Cek SKU
          </button>
          <button
            type="button"
            onClick={() => setSearchType('order')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${searchType === 'order' ? 'bg-emerald-600 text-white' : 'bg-slate-50 text-slate-600 border border-slate-200'}`}
          >
            Cek Pesanan
          </button>
        </div>

        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={searchType === 'sku' ? 'Contoh: MSK-001-0001' : 'Contoh: ORD-20260617-1234'}
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold flex items-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
            Cari
          </button>
        </div>
      </form>

      {result?.type === 'sku' && result.data?.variant && (
        <div className="space-y-4">
          <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl">
            <div className="flex items-start gap-3">
              <Package className="text-emerald-600 flex-shrink-0" size={20} />
              <div className="text-xs space-y-1">
                <p className="font-bold text-slate-900 text-sm">{result.data.variant.product_name}</p>
                <p className="text-slate-600 capitalize">{result.data.variant.model} — {result.data.variant.color}</p>
                <p className="font-mono font-bold text-emerald-700">SKU: {result.data.variant.sku}</p>
                <p>Stok: <strong>{result.data.variant.stock}</strong> | Harga: Rp {parseFloat(result.data.variant.price).toLocaleString('id-ID')}</p>
                {parseFloat(result.data.variant.cost_price) > 0 && (
                  <p className="text-slate-500">Harga Modal: Rp {parseFloat(result.data.variant.cost_price).toLocaleString('id-ID')}</p>
                )}
              </div>
            </div>
          </div>

          {result.data.recent_orders?.length > 0 && (
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Pesanan Terkait SKU Ini</p>
              <div className="border border-slate-100 rounded-xl overflow-hidden">
                <table className="w-full text-xs">
                  <thead className="bg-slate-50 text-slate-500">
                    <tr>
                      <th className="p-3 text-left">No. Pesanan</th>
                      <th className="p-3 text-left">Penerima</th>
                      <th className="p-3 text-center">Qty</th>
                      <th className="p-3 text-left">Status</th>
                      <th className="p-3 text-left">Tanggal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {result.data.recent_orders.map((oi, idx) => (
                      <tr key={idx} className="text-slate-700">
                        <td className="p-3 font-bold">{oi.order_number}</td>
                        <td className="p-3">{oi.recipient_name || '-'}</td>
                        <td className="p-3 text-center">{oi.quantity}</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 bg-slate-100 rounded-full text-[10px] font-bold uppercase">
                            {statusLabel[oi.status] || oi.status}
                          </span>
                        </td>
                        <td className="p-3">{new Date(oi.order_date).toLocaleDateString('id-ID')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {result?.type === 'order' && result.data && (
        <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl space-y-3">
          <div className="flex items-start gap-3">
            <ClipboardList className="text-blue-600 flex-shrink-0" size={20} />
            <div className="text-xs space-y-1 flex-1">
              <p className="font-bold text-slate-900 text-sm">{result.data.order_number}</p>
              <p>Penerima: <strong>{result.data.recipient_name}</strong> — {result.data.recipient_phone}</p>
              <p>Status: <span className="font-bold uppercase">{statusLabel[result.data.status]}</span></p>
              <p>Total: Rp {parseFloat(result.data.total_amount).toLocaleString('id-ID')}</p>
            </div>
          </div>
          <div className="border-t border-blue-100 pt-3 space-y-2">
            {result.data.items?.map((item, idx) => (
              <div key={idx} className="flex justify-between text-xs">
                <span>{item.product_name} ({item.model}-{item.color}) {item.sku && `[${item.sku}]`}</span>
                <span className="font-bold">{item.quantity}x</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
