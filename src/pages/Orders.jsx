import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ClipboardList, ArrowLeft, MapPin, ChevronLeft, ChevronRight, Package, Truck, CreditCard, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';
import { request } from '../utils/request';
import { getAssetURL } from '../utils/api';
import { API_ENDPOINTS } from '../utils/endpoints';
import { Header } from '../components/Header';

export const Orders = ({ user, cart, onLogout }) => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Re-verify login status
  useEffect(() => {
    if (!user) {
      toast.error('Silakan masuk terlebih dahulu untuk melihat pesanan Anda.');
      navigate('/login');
    }
  }, [user, navigate]);

  const fetchOrders = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await request.get(API_ENDPOINTS.ORDERS.LIST, {
        params: { page, limit: 10 }
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
  }, [page, user]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-20 selection:bg-slate-900 selection:text-white">
      {/* Reusable Header */}
      <Header user={user} onLogout={onLogout} cart={cart} />

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 w-full space-y-6">
        
        {/* Back Button Inside Page Body Content */}
        <Link to="/" className="flex items-center gap-2 group self-start">
          <div className="p-2 bg-white border border-slate-200 rounded-full group-hover:bg-slate-900 group-hover:text-white transition-all shadow-sm">
            <ArrowLeft size={14} />
          </div>
          <span className="text-[10px] uppercase tracking-widest font-extrabold text-slate-500 group-hover:text-slate-955 transition-colors">
            Kembali ke Beranda
          </span>
        </Link>

        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-xl shadow-slate-100/35">
          <h2 className="text-sm font-black uppercase tracking-wider text-slate-800 flex items-center gap-2.5 border-b border-slate-100 pb-4 mb-6">
            <ClipboardList size={18} className="text-slate-900" /> Histori Pesanan Saya
          </h2>

          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-32 bg-slate-50 border border-slate-100 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <Package size={42} className="stroke-1 mb-3 text-slate-300" />
              <p className="text-xs font-bold uppercase tracking-widest text-slate-600">Belum ada pesanan</p>
              <p className="text-[10px] text-slate-400 mt-1">Daftar transaksi belanja Anda akan muncul di bagian ini.</p>
              <Link to="/catalog" className="mt-4 px-6 py-2 bg-slate-900 text-white rounded-full text-[10px] font-bold uppercase tracking-widest">
                Mulai Belanja
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map(order => {
                const statusLabels = {
                  pending: { text: 'Menunggu Konfirmasi', class: 'bg-amber-50 text-amber-800 border-amber-100/70' },
                  processing: { text: 'Diproses', class: 'bg-blue-50 text-blue-800 border-blue-100/70' },
                  completed: { text: 'Selesai', class: 'bg-emerald-50 text-emerald-800 border-emerald-100/70' },
                  cancelled: { text: 'Dibatalkan', class: 'bg-red-50 text-red-805 border-red-100/70' }
                };

                const status = statusLabels[order.status] || { text: order.status, class: 'bg-slate-100 text-slate-700' };

                return (
                  <div key={order.id} className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm bg-white hover:border-slate-300 transition-all">
                    
                    {/* Header Order */}
                    <div className="bg-slate-50/50 px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 text-xs">
                      <div>
                        <span className="text-slate-700 text-[10px] font-bold tracking-wider uppercase block">ID PESANAN</span>
                        <p className="font-extrabold text-slate-900 tracking-wider mt-0.5">{order.order_number}</p>
                      </div>
                      <div>
                        <span className="text-slate-700 text-[10px] font-bold tracking-wider uppercase block">TANGGAL TRANSAKSI</span>
                        <p className="font-semibold text-slate-700 mt-0.5">
                          {new Date(order.order_date).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                      </div>
                      <div>
                        <span className={`inline-block text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border ${status.class}`}>
                          {status.text}
                        </span>
                      </div>
                    </div>

                    {/* Order Items */}
                    <div className="px-6 py-3 divide-y divide-slate-100/60">
                      {order.items?.map((item, idx) => {
                        const img = item.product_images?.[0] || '/logo.png';
                        const imageSrc = getAssetURL(img);
                        
                        return (
                          <div key={idx} className="py-3 flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={imageSrc}
                                alt=""
                                className="w-10 h-12 rounded-lg object-cover border border-slate-100 flex-shrink-0"
                              />
                              <div>
                                <h5 className="text-xs font-bold text-slate-900 uppercase tracking-wider">{item.product_name}</h5>
                                <p className="text-[10px] text-slate-600 capitalize font-semibold mt-0.5">{item.model} - {item.color} x {item.quantity} pasang</p>
                              </div>
                            </div>
                            <span className="text-xs font-bold text-slate-900 tracking-wider">
                              Rp {(parseFloat(item.price) * item.quantity).toLocaleString('id-ID')}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Shipping & Payment summary */}
                    <div className="bg-slate-50/20 border-t border-slate-100 px-6 py-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-medium text-slate-600 border-b">
                      <div className="space-y-1">
                        <span className="text-[9px] font-bold text-slate-700 uppercase tracking-widest block">Alamat Pengiriman</span>
                        <p className="text-slate-800 font-semibold">{order.shipping_address}</p>
                      </div>
                      <div className="space-y-2">
                        {order.shipping_courier && (
                          <div className="flex items-center gap-1.5 text-xs text-slate-700">
                            <Truck size={14} className="text-slate-600" />
                            <span>Kurir: <span className="font-bold text-slate-950">{order.shipping_courier}</span> ({order.shipping_service})</span>
                          </div>
                        )}
                        {order.payment_method_name && (
                          <div className="flex items-center gap-1.5 text-xs text-slate-700">
                            <CreditCard size={14} className="text-slate-600" />
                            <span>Bayar: <span className="font-bold text-slate-950">{order.payment_method_name}</span></span>
                          </div>
                        )}
                        {order.payment_receipt && (
                          <div className="pt-0.5">
                            <a
                              href={getAssetURL(order.payment_receipt)}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-[10px] text-emerald-600 font-bold hover:underline"
                            >
                              Lihat Bukti Transfer <ExternalLink size={10} />
                            </a>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Order Total Footer */}
                    <div className="bg-slate-50/10 px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                      <div>
                        {order.notes && (
                          <p className="text-slate-800 font-semibold">Catatan: "{order.notes}"</p>
                        )}
                      </div>
                      <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                        <span className="text-slate-750 font-bold uppercase tracking-wider">Total Pembayaran:</span>
                        <span className="text-sm font-extrabold text-slate-950 tracking-wider">
                          Rp {parseFloat(order.total_amount).toLocaleString('id-ID')}
                        </span>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          )}

          {/* Orders Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <button
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="p-2 border border-slate-200 bg-white hover:bg-slate-50 rounded-full transition-colors disabled:opacity-30 flex items-center justify-center"
              >
                <ChevronLeft size={14} />
              </button>
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i + 1)}
                  className={`w-9 h-9 text-[10px] font-bold rounded-full border transition-all ${page === i + 1 ? 'bg-slate-950 border-slate-950 text-white' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-950'}`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
                className="p-2 border border-slate-200 bg-white hover:bg-slate-50 rounded-full transition-colors disabled:opacity-30 flex items-center justify-center"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
