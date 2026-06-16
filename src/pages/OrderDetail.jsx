import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Loader2, Package, MapPin, Phone, User } from 'lucide-react';
import { request } from '../utils/request';
import { getAssetURL } from '../utils/api';
import { API_ENDPOINTS } from '../utils/endpoints';
import { Header } from '../components/Header';
import { OrderInvoice } from '../components/OrderInvoice';

export const OrderDetail = ({ user, cart, onLogout }) => {
  const { orderNumber } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrder = async () => {
      setLoading(true);
      try {
        const res = await request.get(API_ENDPOINTS.ORDERS.VIEW(orderNumber));
        if (res.success) {
          setOrder(res.data);
        } else {
          setError('Pesanan tidak ditemukan.');
        }
      } catch (e) {
        setError('Gagal memuat data pesanan.');
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderNumber]);

  const statusLabel = {
    pending: 'Menunggu Konfirmasi',
    processing: 'Sedang Diproses',
    completed: 'Selesai',
    cancelled: 'Dibatalkan'
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <Header user={user} onLogout={onLogout} cart={cart} />
      <main className="max-w-3xl mx-auto px-4 mt-8 space-y-6">
        <Link to="/" className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-slate-900">
          <ArrowLeft size={14} /> Kembali
        </Link>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-emerald-600" size={32} />
          </div>
        ) : error ? (
          <div className="text-center py-16 text-slate-500 text-sm">{error}</div>
        ) : order && (
          <>
            <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">No. Pesanan</p>
                  <h1 className="text-xl font-black text-slate-900">{order.order_number}</h1>
                </div>
                <span className="text-[10px] font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 uppercase">
                  {statusLabel[order.status] || order.status}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="flex items-start gap-2">
                  <User size={14} className="text-slate-400 mt-0.5" />
                  <div>
                    <p className="font-bold text-slate-800">{order.recipient_name || order.customer_name}</p>
                    <p className="text-slate-500 flex items-center gap-1 mt-0.5"><Phone size={10} /> {order.recipient_phone || '-'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin size={14} className="text-slate-400 mt-0.5" />
                  <p className="text-slate-700">{order.shipping_address}</p>
                </div>
              </div>

              {order.payment_receipt && (
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Bukti Transfer</p>
                  <a href={getAssetURL(order.payment_receipt)} target="_blank" rel="noreferrer">
                    <img src={getAssetURL(order.payment_receipt)} alt="Bukti" className="w-32 h-40 object-cover rounded-xl border border-slate-200" />
                  </a>
                </div>
              )}

              <div className="border-t border-slate-100 pt-4 space-y-3">
                <p className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1"><Package size={12} /> Item Pesanan</p>
                {order.items?.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl text-xs">
                    <div>
                      <p className="font-bold text-slate-800">{item.product_name}</p>
                      <p className="text-slate-500 capitalize">{item.model} - {item.color} {item.sku ? `• ${item.sku}` : ''}</p>
                      <p className="text-slate-600">{item.quantity} pasang × Rp {parseFloat(item.price).toLocaleString('id-ID')}</p>
                    </div>
                    <p className="font-bold text-slate-900">Rp {(parseFloat(item.price) * item.quantity).toLocaleString('id-ID')}</p>
                  </div>
                ))}
              </div>
            </div>

            <OrderInvoice order={order} />
          </>
        )}
      </main>
    </div>
  );
};
