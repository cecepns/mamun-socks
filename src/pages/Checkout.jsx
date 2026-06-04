import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Trash2, ShoppingBag, MapPin, ClipboardList, User, ArrowLeft, Search, Upload, CheckCircle2, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { request } from '../utils/request';
import { getAssetURL } from '../utils/api';
import { API_ENDPOINTS } from '../utils/endpoints';
import { Header } from '../components/Header';

import anterajaLogo from '../assets/ekspedisi/anteraja.png';
import ideLogo from '../assets/ekspedisi/id.png';
import jneLogo from '../assets/ekspedisi/jne.png';
import jntLogo from '../assets/ekspedisi/jnt.png';
import posLogo from '../assets/ekspedisi/pos.png';
import sicepatLogo from '../assets/ekspedisi/sicepat.png';
import wahanaLogo from '../assets/ekspedisi/wahana.png';

const courierLogos = {
  anteraja: anterajaLogo,
  ide: ideLogo,
  jne: jneLogo,
  jnt: jntLogo,
  pos: posLogo,
  sicepat: sicepatLogo,
  wahana: wahanaLogo
};

export const Checkout = ({ user, cartItems, onUpdateQuantity, onRemoveFromCart, onClearCart, onOrderSuccess, onLogout }) => {
  const location = useLocation();
  const navigate = useNavigate();

  // Determine checkout items: direct Buy Now or general cart
  const directItems = location.state?.directItems || null;
  const itemsToCheckout = directItems || cartItems;

  const [checkoutDate, setCheckoutDate] = useState('');
  const [shippingNotes, setShippingNotes] = useState('');
  const [shippingDetail, setShippingDetail] = useState('');
  const [loading, setLoading] = useState(false);

  // Rajaongkir Search states
  const [destSearch, setDestSearch] = useState('');
  const [destOptions, setDestOptions] = useState([]);
  const [destLoading, setDestLoading] = useState(false);
  const [selectedDestination, setSelectedDestination] = useState(null);

  // Shipping cost states
  const [shippingRates, setShippingRates] = useState([]);
  const [ratesLoading, setRatesLoading] = useState(false);
  const [selectedRate, setSelectedRate] = useState(null);

  // Payment methods states
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [receiptFile, setReceiptFile] = useState(null);
  const [receiptUrl, setReceiptUrl] = useState('');
  const [uploadingReceipt, setUploadingReceipt] = useState(false);

  // Debounced search timer ref
  const searchTimeoutRef = useRef(null);

  // Set default checkout date to today in local YYYY-MM-DD
  useEffect(() => {
    const today = new Date();
    const offset = today.getTimezoneOffset();
    const localToday = new Date(today.getTime() - (offset * 60 * 1000));
    setCheckoutDate(localToday.toISOString().split('T')[0]);

    // Fetch active payment methods
    const fetchPaymentMethods = async () => {
      try {
        const res = await request.get(API_ENDPOINTS.PAYMENT_METHODS.LIST);
        if (res.success) {
          setPaymentMethods(res.data);
          if (res.data.length > 0) {
            setSelectedPayment(res.data[0]);
          }
        }
      } catch (e) {
        console.error('Failed to load payment methods', e);
      }
    };
    fetchPaymentMethods();
  }, []);

  // Search Komerce Rajaongkir Destinations
  const handleDestSearchChange = (e) => {
    const value = e.target.value;
    setDestSearch(value);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (!value.trim()) {
      setDestOptions([]);
      return;
    }

    setDestLoading(true);
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const res = await request.get(`${API_ENDPOINTS.SHIPPING.DESTINATION}?search=${encodeURIComponent(value)}`);
        if (res.success) {
          setDestOptions(res.data);
        }
      } catch (err) {
        console.error('Failed search destination', err);
      } finally {
        setDestLoading(false);
      }
    }, 400);
  };

  // Select destination option & trigger cost lookup
  const handleSelectDestination = async (option) => {
    setSelectedDestination(option);
    setDestSearch(option.label);
    setDestOptions([]);
    setSelectedRate(null);
    setShippingRates([]);

    setRatesLoading(true);
    try {
      const res = await request.post(API_ENDPOINTS.SHIPPING.COST, {
        destination: option.id,
        weight: 1
      });
      if (res.success) {
        // Filter by user required couriers: Jne, sicepat, ide, jnt, anteraja, pos, wahana
        const allowed = ['jne', 'sicepat', 'ide', 'jnt', 'anteraja', 'pos', 'wahana'];
        const filtered = (res.data || []).filter(rate => 
          allowed.includes(rate.code.toLowerCase())
        );
        setShippingRates(filtered);
        if (filtered.length > 0) {
          setSelectedRate(filtered[0]);
        } else {
          toast.error('Ekspedisi yang didukung tidak tersedia untuk lokasi ini.');
        }
      }
    } catch (err) {
      toast.error('Gagal mengambil ongkos kirim.');
      console.error(err);
    } finally {
      setRatesLoading(false);
    }
  };

  // Handle payment receipt upload
  const handleReceiptUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setReceiptFile(file);
    setUploadingReceipt(true);

    const formData = new FormData();
    formData.append('receipt', file);

    try {
      const res = await request.post(API_ENDPOINTS.ORDERS.UPLOAD_RECEIPT, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      if (res.success) {
        setReceiptUrl(res.data.file_path);
        toast.success('Bukti transfer berhasil diunggah.');
      } else {
        toast.error('Gagal mengunggah bukti transfer.');
      }
    } catch (err) {
      toast.error('Error saat mengunggah file.');
      console.error(err);
    } finally {
      setUploadingReceipt(false);
    }
  };

  const productTotal = itemsToCheckout.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0);
  const shippingCost = selectedRate ? parseFloat(selectedRate.cost) : 0;
  const finalTotal = productTotal + shippingCost;

  // Submit checkout
  const handleSubmitCheckout = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error('Silakan masuk terlebih dahulu.');
      navigate('/login');
      return;
    }
    if (itemsToCheckout.length === 0) {
      toast.error('Keranjang belanja Anda kosong.');
      return;
    }
    if (!selectedDestination) {
      toast.error('Tujuan pengiriman wajib dipilih.');
      return;
    }
    if (!selectedRate) {
      toast.error('Pilih ekspedisi pengiriman.');
      return;
    }
    if (!shippingDetail.trim()) {
      toast.error('Alamat detail pengiriman wajib diisi.');
      return;
    }
    if (!selectedPayment) {
      toast.error('Pilih metode pembayaran.');
      return;
    }
    if (!receiptUrl) {
      toast.error('Harap upload bukti transfer terlebih dahulu.');
      return;
    }
    if (!checkoutDate) {
      toast.error('Tanggal checkout wajib diisi.');
      return;
    }

    setLoading(true);
    try {
      const fullAddress = `${selectedDestination.label}, ${shippingDetail.trim()}`;
      const payload = {
        items: itemsToCheckout.map(item => ({
          product_id: item.product_id,
          variant_id: item.variant_id,
          quantity: item.quantity
        })),
        shipping_address: fullAddress,
        notes: shippingNotes,
        order_date: new Date(checkoutDate + 'T12:00:00').toISOString(),
        shipping_cost: shippingCost,
        shipping_courier: selectedRate.name,
        shipping_service: selectedRate.service,
        shipping_etd: selectedRate.etd || '2-3 hari',
        payment_method_id: selectedPayment.id,
        payment_method_name: selectedPayment.name,
        payment_receipt: receiptUrl
      };

      const res = await request.post(API_ENDPOINTS.ORDERS.CREATE, payload);
      if (res.success) {
        toast.success('Pesanan berhasil dibuat!');
        if (!directItems) {
          // If checkout from cart, clear general cart
          onClearCart();
        }
        onOrderSuccess();
        navigate('/orders');
      } else {
        toast.error(res.message || 'Gagal memproses pesanan.');
      }
    } catch (err) {
      toast.error(err.message || 'Terjadi kesalahan saat checkout.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-20 selection:bg-slate-900 selection:text-white">
      {/* Reusable Header */}
      <Header user={user} onLogout={onLogout} cart={cartItems} />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 w-full space-y-6">
        
        {/* Back Button Inside Page Body Content */}
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 group self-start">
          <div className="p-2 bg-white border border-slate-200 rounded-full group-hover:bg-slate-900 group-hover:text-white transition-all shadow-sm">
            <ArrowLeft size={14} />
          </div>
          <span className="text-[10px] uppercase tracking-widest font-extrabold text-slate-500 group-hover:text-slate-950 transition-colors">
            Kembali
          </span>
        </button>

        {itemsToCheckout.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white border border-slate-100 rounded-3xl text-slate-400">
            <ShoppingBag size={56} className="stroke-1 mb-4 text-slate-300 animate-bounce" />
            <p className="text-sm font-bold uppercase tracking-widest text-slate-700">Checkout Anda Kosong</p>
            <Link to="/catalog" className="mt-4 px-6 py-2.5 bg-slate-900 text-white rounded-full text-xs font-bold uppercase tracking-widest">
              Belanja Sekarang
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmitCheckout} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Column: Items and Shipping details */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Items List */}
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 border-b border-slate-100 pb-3">
                  Detail Item Belanja
                </h3>
                <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1.5 scrollbar-thin">
                  {itemsToCheckout.map((item, idx) => {
                    const img = item.image || '/logo.png';
                    const imageSrc = getAssetURL(img);
                    
                    return (
                      <div key={`${item.variant_id}-${idx}`} className="flex items-center justify-between gap-4 p-3.5 bg-slate-50/70 border border-slate-100 rounded-2xl">
                        <img src={imageSrc} alt={item.name} className="w-12 h-14 rounded-xl object-cover border border-slate-100 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider truncate">{item.name}</h4>
                          <p className="text-[10px] text-slate-700 font-semibold capitalize mt-0.5">{item.model} - {item.color}</p>
                          <p className="text-[10px] font-extrabold text-slate-800 mt-1">
                            Rp {parseFloat(item.price).toLocaleString('id-ID')}
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] font-bold text-slate-500 bg-white border border-slate-200 px-3 py-1 rounded-full">
                            {item.quantity} Pasang
                          </span>
                          {!directItems && (
                            <button
                              type="button"
                              onClick={() => onRemoveFromCart(item.variant_id)}
                              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-all"
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Shipping Form */}
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 border-b border-slate-100 pb-3">
                  Tujuan Pengiriman
                </h3>

                <div className="space-y-4">
                  {/* Destination Search Box */}
                  <div className="relative">
                    <label className="block text-[9px] font-bold text-slate-700 uppercase tracking-widest mb-1.5">
                      Cari Kota / Kecamatan Tujuan
                    </label>
                    <div className="relative">
                      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                      <input
                        type="text"
                        value={destSearch}
                        onChange={handleDestSearchChange}
                        placeholder="Contoh: Kutawaringin, Cigadung..."
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all font-semibold"
                      />
                      {destLoading && (
                        <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
                          <Loader2 size={14} className="animate-spin text-slate-400" />
                        </div>
                      )}
                    </div>

                    {/* Options dropdown */}
                    {destOptions.length > 0 && (
                      <div className="absolute left-0 right-0 mt-2 bg-white border border-slate-200 rounded-2xl shadow-xl z-20 max-h-60 overflow-y-auto divide-y divide-slate-50">
                        {destOptions.map(option => (
                          <button
                            key={option.id}
                            type="button"
                            onClick={() => handleSelectDestination(option)}
                            className="w-full text-left px-4 py-3 hover:bg-slate-50 text-xs text-slate-700 font-medium transition-colors"
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Selected destination alert */}
                  {selectedDestination && (
                    <div className="bg-slate-50 border border-slate-150 p-4 rounded-2xl flex items-start gap-2.5">
                      <MapPin size={16} className="text-emerald-600 flex-shrink-0 mt-0.5" />
                      <div className="text-xs">
                        <span className="font-extrabold text-slate-900 uppercase tracking-wide block">Tujuan Pengiriman Terpilih:</span>
                        <span className="text-slate-800 font-semibold block mt-0.5">{selectedDestination.label}</span>
                      </div>
                    </div>
                  )}

                  {/* Shipping Courier Rates */}
                  {ratesLoading ? (
                    <div className="flex items-center justify-center py-6 gap-2">
                      <Loader2 size={18} className="animate-spin text-emerald-600" />
                      <span className="text-xs font-semibold text-slate-500">Mencari opsi pengiriman...</span>
                    </div>
                  ) : (
                    shippingRates.length > 0 && (
                      <div className="space-y-3">
                        <label className="block text-[9px] font-bold text-slate-750 uppercase tracking-widest mb-1">
                          Pilih Layanan Kurir
                        </label>
                        <div className="grid grid-cols-1 gap-3 max-h-56 overflow-y-auto pr-1">
                          {shippingRates.map((rate, idx) => {
                            const courierCode = rate.code.toLowerCase();
                            const logo = courierLogos[courierCode] || null;
                            const isSelected = selectedRate?.code === rate.code && selectedRate?.service === rate.service;

                            return (
                              <label
                                key={`${rate.code}-${rate.service}-${idx}`}
                                className={`flex items-start gap-4 p-4 border rounded-3xl cursor-pointer transition-all ${isSelected ? 'border-slate-900 bg-slate-900/5 shadow-sm' : 'border-slate-200 hover:border-slate-300'}`}
                              >
                                <input
                                  type="radio"
                                  name="shipping_rate"
                                  className="hidden"
                                  checked={isSelected}
                                  onChange={() => setSelectedRate(rate)}
                                />
                                <div className="flex-shrink-0 mt-0.5">
                                  {logo ? (
                                    <img src={logo} alt={rate.name} className="w-14 h-10 object-contain rounded-lg" />
                                  ) : (
                                    <div className="w-14 h-10 bg-slate-100 flex items-center justify-center text-[10px] font-extrabold rounded-lg uppercase">
                                      {rate.code.toUpperCase()}
                                    </div>
                                  )}
                                </div>
                                <div className="flex-1 min-w-0 space-y-1">
                                  <p className="text-xs font-black text-slate-950 uppercase tracking-wider">{rate.name}</p>
                                  <p className="text-[10px] text-slate-700 font-medium leading-relaxed">{rate.service} - {rate.description}</p>
                                  <div className="flex flex-wrap items-center gap-2.5 pt-1.5">
                                    <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                                      Rp {rate.cost.toLocaleString('id-ID')}
                                    </span>
                                    <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider bg-slate-100 px-2 py-0.5 rounded-full">
                                      Estimasi: {rate.etd || '3 hari'}
                                    </span>
                                  </div>
                                </div>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    )
                  )}

                  {/* Detail Address */}
                  <div>
                    <label className="block text-[9px] font-bold text-slate-750 uppercase tracking-widest mb-1.5">
                      Alamat Detail Jalan / RT / RW / No. Rumah
                    </label>
                    <textarea
                      rows="3"
                      value={shippingDetail}
                      onChange={(e) => setShippingDetail(e.target.value)}
                      className="block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all font-medium"
                      placeholder="Contoh: Gang Masjid No. 12, RT 01/RW 04, Sebelah pos ronda"
                      required
                    />
                  </div>

                  {/* Shipping Notes */}
                  <div>
                    <label className="block text-[9px] font-bold text-slate-750 uppercase tracking-widest mb-1.5">
                      Catatan Pengiriman (Opsional)
                    </label>
                    <input
                      type="text"
                      value={shippingNotes}
                      onChange={(e) => setShippingNotes(e.target.value)}
                      className="block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all"
                      placeholder="Contoh: Hubungi nomor sebelum mengirim."
                    />
                  </div>
                </div>

              </div>

            </div>

            {/* Right Column: Checkout Totals & Payment receipt */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Payment Methods */}
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 border-b border-slate-100 pb-3">
                  Metode Pembayaran
                </h3>

                <div className="space-y-4">
                  {paymentMethods.length === 0 ? (
                    <p className="text-xs text-slate-750 font-bold">Metode pembayaran tidak tersedia.</p>
                  ) : (
                    <div className="grid grid-cols-2 gap-3">
                      {paymentMethods.map(pm => {
                        const isSelected = selectedPayment?.id === pm.id;
                        return (
                          <button
                            key={pm.id}
                            type="button"
                            onClick={() => {
                              setSelectedPayment(pm);
                              setReceiptUrl('');
                              setReceiptFile(null);
                            }}
                            className={`p-3 border text-center rounded-2xl font-bold text-xs uppercase tracking-wider transition-all ${isSelected ? 'border-slate-950 bg-slate-950 text-white shadow-md' : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-350'}`}
                          >
                            {pm.name}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* Payment Details Container */}
                  {selectedPayment && (
                    <div className="bg-slate-50 border border-slate-150 p-5 rounded-2xl space-y-4">
                      {selectedPayment.type === 'bank' ? (
                        <div className="space-y-1.5 text-center sm:text-left">
                          <span className="text-[9px] font-bold text-slate-750 uppercase tracking-widest block">Transfer Manual</span>
                          <p className="text-sm font-black text-slate-900 tracking-wide">{selectedPayment.name}</p>
                          <p className="text-xs font-semibold text-slate-750 mt-1">No. Rekening: <span className="font-extrabold text-slate-950">{selectedPayment.account_number}</span></p>
                          <p className="text-xs font-semibold text-slate-750">Atas Nama: <span className="font-extrabold text-slate-950">{selectedPayment.account_name}</span></p>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center space-y-3">
                          <span className="text-[9px] font-bold text-slate-750 uppercase tracking-widest block self-start">QRIS Code</span>
                          <div className="w-40 h-40 bg-white border border-slate-200 rounded-2xl p-2 flex items-center justify-center shadow-inner">
                            {selectedPayment.qr_code_image ? (
                              <img
                                src={getAssetURL(selectedPayment.qr_code_image)}
                                alt="QRIS Code"
                                className="w-full h-full object-contain"
                              />
                            ) : (
                              <div className="text-[10px] text-slate-400">Gambar QRIS tidak tersedia</div>
                            )}
                          </div>
                          <p className="text-[10px] text-slate-750 font-bold uppercase tracking-wider">Pindai kode QR untuk membayar</p>
                        </div>
                      )}

                      {/* Receipt upload field */}
                      <div className="border-t border-slate-200 pt-4 space-y-2">
                        <label className="block text-[9px] font-bold text-slate-750 uppercase tracking-widest">
                          Unggah Bukti Transfer
                        </label>
                        <div className="relative">
                          <input
                            type="file"
                            accept="image/*"
                            id="receipt-upload"
                            onChange={handleReceiptUpload}
                            className="hidden"
                            disabled={uploadingReceipt}
                          />
                          <label
                            htmlFor="receipt-upload"
                            className={`w-full flex items-center justify-center gap-2 border-2 border-dashed rounded-2xl py-4 cursor-pointer transition-all hover:bg-white text-xs font-bold ${receiptUrl ? 'border-emerald-500 text-emerald-600 bg-emerald-50/20' : 'border-slate-350 text-slate-750 bg-white hover:border-slate-900'}`}
                          >
                            {uploadingReceipt ? (
                              <>
                                <Loader2 size={16} className="animate-spin" />
                                Mengunggah...
                              </>
                            ) : receiptUrl ? (
                              <>
                                <CheckCircle2 size={16} className="text-emerald-500" />
                                Bukti Terunggah!
                              </>
                            ) : (
                              <>
                                <Upload size={16} />
                                Pilih Gambar Bukti Transfer
                              </>
                            )}
                          </label>
                        </div>
                        {receiptUrl && (
                          <div className="mt-2 text-center">
                            <a
                              href={getAssetURL(receiptUrl)}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[10px] text-emerald-600 font-bold hover:underline"
                            >
                              Lihat Gambar Bukti Transfer
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Order Summary & Checkout Button */}
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 border-b border-slate-100 pb-3">
                  Ringkasan Pembayaran
                </h3>

                <div className="space-y-3 text-xs font-semibold text-slate-750">
                  <div className="flex justify-between">
                    <span>Total Belanja:</span>
                    <span className="font-extrabold text-slate-950">Rp {productTotal.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Ongkos Kirim ({selectedRate ? selectedRate.name : 'Belum dipilih'}):</span>
                    <span className="font-extrabold text-slate-950">Rp {shippingCost.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-100 pt-3 text-sm font-black text-slate-900">
                    <span>Total Bayar:</span>
                    <span className="text-base text-emerald-600 tracking-wider">Rp {finalTotal.toLocaleString('id-ID')}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || uploadingReceipt}
                  className="w-full mt-6 bg-slate-950 hover:bg-slate-900 disabled:opacity-40 text-white font-bold uppercase tracking-widest py-4 rounded-full flex items-center justify-center gap-2 shadow-lg shadow-slate-950/10 hover:shadow-xl transition-all text-[10px]"
                >
                  {loading ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    'Selesaikan Pemesanan'
                  )}
                </button>
              </div>

            </div>

          </form>
        )}
      </main>
    </div>
  );
};
