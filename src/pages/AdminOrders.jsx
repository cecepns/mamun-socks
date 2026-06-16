import React, { useState, useEffect } from 'react';
import { Search, Eye, ClipboardList, Clock, CheckCircle, XCircle, ChevronLeft, ChevronRight, Printer, Link2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { request } from '../utils/request';
import { getAssetURL } from '../utils/api';
import { API_ENDPOINTS } from '../utils/endpoints';
import { Modal } from '../components/Modals';
import { OrderInvoice } from '../components/OrderInvoice';

export const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit, setLimit] = useState(10);

  // Selected Order for Detail Modal
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [showInvoice, setShowInvoice] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);

  const calcProfit = (order) => {
    if (!order?.items) return 0;
    return order.items.reduce((sum, item) => {
      const sell = parseFloat(item.price) * item.quantity;
      const cost = parseFloat(item.cost_price || 0) * item.quantity;
      return sum + (sell - cost);
    }, 0);
  };

  const copyOrderLink = (orderNumber) => {
    const link = `${window.location.origin}/pesanan/${orderNumber}`;
    navigator.clipboard.writeText(link);
    toast.success('Link pesanan disalin!');
  };

  // Debounced Search Trigger
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await request.get(API_ENDPOINTS.ORDERS.LIST, {
        params: { search: debouncedSearch, status: statusFilter, page, limit }
      });
      if (res.success) {
        setOrders(res.data);
        setTotalPages(res.pagination.totalPages || 1);
      }
    } catch (error) {
      toast.error('Gagal mengambil data pesanan.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [debouncedSearch, statusFilter, page, limit]);

  const handleUpdateStatus = async (orderId, targetStatus) => {
    const confirmAction = window.confirm(`Ubah status pesanan ini menjadi "${targetStatus.toUpperCase()}"? Hal ini akan mempengaruhi ketersediaan stok produk.`);
    if (!confirmAction) return;

    setStatusLoading(true);
    const statusToast = toast.loading('Memproses perubahan status...');
    try {
      const res = await request.put(API_ENDPOINTS.ORDERS.STATUS(orderId), { status: targetStatus });
      if (res.success) {
        toast.success(res.message || 'Status pesanan berhasil diperbarui!', { id: statusToast });
        setIsDetailOpen(false);
        fetchOrders();
      }
    } catch (error) {
      toast.error(error.message || 'Gagal mengubah status pesanan.', { id: statusToast });
    } finally {
      setStatusLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6">
      
      <div>
        <h2 className="text-lg font-bold text-slate-800">Manajemen Transaksi</h2>
        <p className="text-xs text-slate-500">Pantau pesanan masuk, konfirmasi order (ACC), dan pengiriman kaos kaki.</p>
      </div>

      {/* Filters and search layout */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-slate-50 pt-4">
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
          <input
            type="text"
            placeholder="Cari ID Pesanan (ORD-...) atau pelanggan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
          />
        </div>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-none"
        >
          <option value="">Semua Status</option>
          <option value="pending">Menunggu Konfirmasi (Pending)</option>
          <option value="processing">Diproses (Confirmed)</option>
          <option value="completed">Selesai (ACCed)</option>
          <option value="cancelled">Dibatalkan</option>
        </select>

        {/* Limit control */}
        <div className="flex items-center gap-2 text-xs text-slate-500 justify-end w-full">
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

      {/* Orders Grid Table */}
      {loading ? (
        <div className="space-y-3 py-6 shimmer-wrapper">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-slate-50 border border-slate-100 rounded-2xl" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16 text-slate-400 text-xs">
          Belum ada data pesanan yang sesuai dengan filter.
        </div>
      ) : (
        <div className="overflow-x-auto border border-slate-100 rounded-2xl">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                <th className="p-4">ID PESANAN</th>
                <th className="p-4">PELANGGAN</th>
                <th className="p-4">TANGGAL TRANSAKSI</th>
                <th className="p-4">TOTAL</th>
                <th className="p-4">STATUS</th>
                <th className="p-4 text-center">AKSI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {orders.map(order => {
                const statusStyles = {
                  pending: 'bg-yellow-50 text-yellow-700 border-yellow-100',
                  processing: 'bg-blue-50 text-blue-700 border-blue-100',
                  completed: 'bg-emerald-50 text-emerald-700 border-emerald-100',
                  cancelled: 'bg-red-50 text-red-700 border-red-100'
                };
                return (
                  <tr key={order.id} className="hover:bg-slate-50/50 text-slate-700">
                    <td className="p-4 font-bold text-slate-800 text-xs">{order.order_number}</td>
                    <td className="p-4">
                      <div>
                        <span className="font-semibold text-slate-800 block">{order.customer_name}</span>
                        <span className="text-[10px] text-slate-400">@{order.customer_username}</span>
                      </div>
                    </td>
                    <td className="p-4 font-medium text-slate-600">
                      {new Date(order.order_date).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </td>
                    <td className="p-4 font-semibold text-slate-800">
                      Rp {parseFloat(order.total_amount).toLocaleString('id-ID')}
                    </td>
                    <td className="p-4">
                      <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusStyles[order.status] || 'bg-slate-50 text-slate-500 border-slate-200'}`}>
                        {order.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex justify-center">
                        <button
                          onClick={() => { setSelectedOrder(order); setIsDetailOpen(true); }}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-[10px] font-bold transition-all border border-emerald-150"
                        >
                          <Eye size={12} /> Detail
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination controls */}
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

      {/* ORDER DETAILS MODAL */}
      <Modal
        isOpen={isDetailOpen}
        onClose={() => { setIsDetailOpen(false); setSelectedOrder(null); }}
        title={`Detail Transaksi: ${selectedOrder?.order_number}`}
        size="lg"
      >
        {selectedOrder && (
          <div className="space-y-6 text-xs">
            
            {/* Split Info Panel */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 p-4 border border-slate-100 rounded-2xl">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Informasi Pembeli</p>
                <p className="text-slate-800 font-semibold mt-1 text-sm">{selectedOrder.customer_name}</p>
                <p className="text-slate-500 mt-0.5">Username: @{selectedOrder.customer_username}</p>
                {selectedOrder.recipient_name && (
                  <p className="text-slate-700 mt-2 font-medium">Penerima: {selectedOrder.recipient_name} ({selectedOrder.recipient_phone})</p>
                )}
                <p className="text-slate-500 mt-2">
                  Tanggal: {new Date(selectedOrder.order_date).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>

              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Alamat & Pengiriman</p>
                <p className="text-slate-700 mt-1 font-medium">{selectedOrder.shipping_address}</p>
                {selectedOrder.shipping_courier && (
                  <div className="mt-2 text-[10px] bg-white p-2 border border-slate-100 rounded-lg space-y-1">
                    <p className="font-semibold text-slate-800 uppercase tracking-wider">Ekspedisi</p>
                    <p className="text-slate-600 font-bold">{selectedOrder.shipping_courier}</p>
                    <p className="text-slate-500">{selectedOrder.shipping_service} ({selectedOrder.shipping_etd})</p>
                  </div>
                )}
                {selectedOrder.notes && (
                  <div className="mt-2 text-slate-550 bg-white p-2 border border-slate-100 rounded-lg">
                    <span className="font-semibold text-slate-655">Catatan:</span> {selectedOrder.notes}
                  </div>
                )}
              </div>

              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Pembayaran & Bukti Transfer</p>
                <p className="text-slate-800 font-bold mt-1">{selectedOrder.payment_method_name || 'Transfer Manual'}</p>
                {selectedOrder.payment_receipt ? (
                  <div className="mt-2 space-y-2">
                    <div className="w-24 h-28 bg-white border border-slate-200 rounded-lg overflow-hidden p-0.5 shadow-sm">
                      <img
                        src={getAssetURL(selectedOrder.payment_receipt)}
                        alt="Bukti Transfer"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <a
                      href={getAssetURL(selectedOrder.payment_receipt)}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-[9px] text-emerald-600 font-bold hover:underline uppercase tracking-wider"
                    >
                      Buka Gambar Penuh
                    </a>
                  </div>
                ) : (
                  <p className="text-slate-400 mt-2 font-medium italic">Bukti transfer belum diunggah</p>
                )}
              </div>
            </div>

            {/* Actions bar */}
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => copyOrderLink(selectedOrder.order_number)}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[10px] font-bold flex items-center gap-1">
                <Link2 size={12} /> Salin Link Pesanan
              </button>
              <button type="button" onClick={() => setShowInvoice(true)}
                className="px-3 py-1.5 bg-slate-900 text-white rounded-lg text-[10px] font-bold flex items-center gap-1">
                <Printer size={12} /> Cetak Invoice
              </button>
            </div>

            {/* Items table */}
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Item yang Dipesan</p>
              <div className="border border-slate-100 rounded-xl overflow-hidden bg-white">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 font-semibold text-slate-500">
                      <th className="p-3">SKU</th>
                      <th className="p-3">Nama Produk</th>
                      <th className="p-3">Varian (Model - Warna)</th>
                      <th className="p-3 text-right">Harga</th>
                      <th className="p-3 text-right">Modal</th>
                      <th className="p-3 text-center">Jumlah</th>
                      <th className="p-3 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {selectedOrder.items?.map((item, idx) => (
                      <tr key={idx} className="text-slate-700">
                        <td className="p-3 font-mono text-[10px]">{item.sku || item.variant_sku || '-'}</td>
                        <td className="p-3 font-semibold text-slate-800">{item.product_name}</td>
                        <td className="p-3 capitalize">{item.model} - {item.color}</td>
                        <td className="p-3 text-right">Rp {parseFloat(item.price).toLocaleString('id-ID')}</td>
                        <td className="p-3 text-right text-slate-500">Rp {parseFloat(item.cost_price || 0).toLocaleString('id-ID')}</td>
                        <td className="p-3 text-center font-semibold">{item.quantity} pasang</td>
                        <td className="p-3 text-right font-semibold text-slate-800">
                          Rp {(parseFloat(item.price) * item.quantity).toLocaleString('id-ID')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex flex-col items-end gap-1.5 mt-4 p-4 bg-emerald-50/50 border border-emerald-100/50 rounded-xl text-xs font-semibold">
                <div className="flex justify-between w-64 text-slate-600">
                  <span>Subtotal Belanja:</span>
                  <span>Rp {(parseFloat(selectedOrder.total_amount) - parseFloat(selectedOrder.shipping_cost || 0)).toLocaleString('id-ID')}</span>
                </div>
                {selectedOrder.shipping_cost > 0 && (
                  <div className="flex justify-between w-64 text-slate-600">
                    <span>Ongkos Kirim:</span>
                    <span>Rp {parseFloat(selectedOrder.shipping_cost).toLocaleString('id-ID')}</span>
                  </div>
                )}
                <div className="flex justify-between w-64 border-t border-emerald-200/50 pt-2 font-bold text-slate-900 text-sm">
                  <span className="text-emerald-700">Total Pembayaran:</span>
                  <span className="text-emerald-700">Rp {parseFloat(selectedOrder.total_amount).toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between w-64 text-blue-700 font-bold">
                  <span>Estimasi Untung:</span>
                  <span>Rp {calcProfit(selectedOrder).toLocaleString('id-ID')}</span>
                </div>
                {selectedOrder.shipping_cod ? (
                  <p className="text-[10px] text-amber-600 w-64 text-right">* Ongkir COD — dibayar penerima saat terima paket</p>
                ) : null}
              </div>
            </div>

            {/* Status Change Toggles (Admin Actions) */}
            <div className="border-t border-slate-100 pt-6">
              <p className="text-[10px] font-bold text-slate-400 uppercase mb-3">Tindakan Persetujuan & Status Order (ACC)</p>
              <div className="flex flex-wrap gap-2">
                
                <button
                  type="button"
                  disabled={selectedOrder.status === 'processing' || statusLoading}
                  onClick={() => handleUpdateStatus(selectedOrder.id, 'processing')}
                  className={`px-4 py-2 border rounded-xl font-bold flex items-center gap-1.5 transition-all ${selectedOrder.status === 'processing' ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                >
                  <Clock size={14} /> Proses & Kirim (Deduct Stock)
                </button>

                <button
                  type="button"
                  disabled={selectedOrder.status === 'completed' || statusLoading}
                  onClick={() => handleUpdateStatus(selectedOrder.id, 'completed')}
                  className={`px-4 py-2 border rounded-xl font-bold flex items-center gap-1.5 transition-all ${selectedOrder.status === 'completed' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                >
                  <CheckCircle size={14} /> Selesai / ACC (Deduct Stock if not yet)
                </button>

                <button
                  type="button"
                  disabled={selectedOrder.status === 'cancelled' || statusLoading}
                  onClick={() => handleUpdateStatus(selectedOrder.id, 'cancelled')}
                  className={`px-4 py-2 border rounded-xl font-bold flex items-center gap-1.5 transition-all ${selectedOrder.status === 'cancelled' ? 'bg-red-50 border-red-200 text-red-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                >
                  <XCircle size={14} /> Batalkan Pesanan (Restore Stock)
                </button>

              </div>
              <p className="text-[10px] text-slate-400 mt-2 leading-relaxed">
                * Keterangan: Mengubah status ke **Proses** atau **Selesai** akan otomatis mengurangi stok varian yang dipesan. 
                Membatalkan pesanan yang sudah diproses akan mengembalikan stok semula.
              </p>
            </div>

            {/* Close Button */}
            <div className="border-t border-slate-100 pt-4 flex justify-end">
              <button
                type="button"
                onClick={() => { setIsDetailOpen(false); setSelectedOrder(null); }}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-all"
              >
                Tutup
              </button>
            </div>

          </div>
        )}
      </Modal>

      {/* Invoice Modal */}
      <Modal
        isOpen={showInvoice && !!selectedOrder}
        onClose={() => setShowInvoice(false)}
        title={`Invoice ${selectedOrder?.order_number}`}
        size="lg"
      >
        {selectedOrder && <OrderInvoice order={selectedOrder} onClose={() => setShowInvoice(false)} />}
      </Modal>

    </div>
  );
};
