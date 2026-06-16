import React, { useRef } from 'react';
import { Printer } from 'lucide-react';

const formatRp = (n) => `Rp ${parseFloat(n || 0).toLocaleString('id-ID')}`;

export const OrderInvoice = ({ order, onClose }) => {
  const printRef = useRef(null);

  const handlePrint = () => {
    const content = printRef.current;
    if (!content) return;
    const win = window.open('', '_blank');
    win.document.write(`
      <html><head><title>Invoice ${order.order_number}</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 24px; color: #111; font-size: 12px; }
        h1 { font-size: 18px; margin: 0 0 4px; }
        table { width: 100%; border-collapse: collapse; margin-top: 16px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background: #f5f5f5; }
        .right { text-align: right; }
        .total { font-weight: bold; font-size: 14px; margin-top: 12px; }
        .meta { margin: 8px 0; line-height: 1.6; }
      </style></head><body>${content.innerHTML}</body></html>
    `);
    win.document.close();
    win.focus();
    win.print();
  };

  const productTotal = parseFloat(order.product_total) || order.items?.reduce((s, i) => s + parseFloat(i.price) * i.quantity, 0) || 0;
  const shippingCost = parseFloat(order.shipping_cost) || 0;

  return (
    <div className="space-y-4">
      <div ref={printRef} className="bg-white p-6 border border-slate-100 rounded-2xl text-xs">
        <div className="flex items-start justify-between border-b border-slate-100 pb-4 mb-4">
          <div>
            <h1 className="text-lg font-black text-slate-900 uppercase">Mamun Socks</h1>
            <p className="text-slate-500 mt-1">Invoice / Nota Pesanan</p>
          </div>
          <div className="text-right">
            <p className="font-bold text-slate-900">{order.order_number}</p>
            <p className="text-slate-500">{new Date(order.order_date).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 meta">
          <div>
            <p className="font-bold text-slate-400 uppercase text-[10px]">Penerima</p>
            <p className="font-semibold text-slate-900">{order.recipient_name || order.customer_name}</p>
            <p className="text-slate-600">{order.recipient_phone || '-'}</p>
          </div>
          <div>
            <p className="font-bold text-slate-400 uppercase text-[10px]">Alamat Pengiriman</p>
            <p className="text-slate-700">{order.shipping_address}</p>
          </div>
        </div>

        {order.shipping_courier && (
          <p className="meta text-slate-600">
            <strong>Ekspedisi:</strong> {order.shipping_courier} — {order.shipping_service}
            {order.shipping_cod ? ' (COD Ongkir)' : ''}
          </p>
        )}

        <table>
          <thead>
            <tr>
              <th>SKU</th>
              <th>Produk</th>
              <th>Varian</th>
              <th className="right">Harga</th>
              <th className="right">Qty</th>
              <th className="right">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {order.items?.map((item, idx) => (
              <tr key={idx}>
                <td>{item.sku || '-'}</td>
                <td>{item.product_name}</td>
                <td className="capitalize">{item.model} - {item.color}</td>
                <td className="right">{formatRp(item.price)}</td>
                <td className="right">{item.quantity}</td>
                <td className="right">{formatRp(parseFloat(item.price) * item.quantity)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-4 space-y-1 text-right">
          <p>Subtotal: <strong>{formatRp(productTotal)}</strong></p>
          {order.shipping_cod ? (
            <p>Ongkir: <strong>COD (bayar saat terima)</strong></p>
          ) : shippingCost > 0 ? (
            <p>Ongkir: <strong>{formatRp(shippingCost)}</strong></p>
          ) : null}
          <p className="total text-emerald-700">Total Dibayar: {formatRp(order.total_amount)}</p>
        </div>

        {order.notes && <p className="mt-4 text-slate-500"><strong>Catatan:</strong> {order.notes}</p>}
        <p className="mt-6 text-[10px] text-slate-400 text-center">Terima kasih telah berbelanja di Mamun Socks — Kab. Bandung</p>
      </div>

      <div className="flex justify-end gap-2">
        {onClose && (
          <button type="button" onClick={onClose} className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600">
            Tutup
          </button>
        )}
        <button
          type="button"
          onClick={handlePrint}
          className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold flex items-center gap-2"
        >
          <Printer size={14} /> Cetak Invoice
        </button>
      </div>
    </div>
  );
};
