import React, { useState, useEffect } from 'react';
import { Trash2, ShoppingBag, MapPin, ClipboardList, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Modal } from '../components/Modals';
import { request } from '../utils/request';
import { API_ENDPOINTS } from '../utils/endpoints';

export const CartModal = ({ isOpen, onClose, cartItems, onUpdateQuantity, onRemoveFromCart, onClearCart, onOrderSuccess, user }) => {
  const navigate = useNavigate();
  const [shippingAddress, setShippingAddress] = useState('');
  const [notes, setNotes] = useState('');

  // Region Selection states
  const [provinces, setProvinces] = useState([]);
  const [selectedProvince, setSelectedProvince] = useState('');
  const [regencies, setRegencies] = useState([]);
  const [selectedRegency, setSelectedRegency] = useState('');
  const [districts, setDistricts] = useState([]);
  const [selectedDistrict, setSelectedDistrict] = useState('');

  const fetchProvinces = async () => {
    try {
      const response = await fetch('https://wilayah.id/api/provinces.json');
      const result = await response.json();
      if (result && result.data) {
        setProvinces(result.data);
      }
    } catch (e) {
      console.error('Gagal mengambil data provinsi', e);
    }
  };

  const fetchRegencies = async (provCode) => {
    try {
      const response = await fetch(`https://wilayah.id/api/regencies/${provCode}.json`);
      const result = await response.json();
      if (result && result.data) {
        setRegencies(result.data);
      }
    } catch (e) {
      console.error('Gagal mengambil data kabupaten', e);
    }
  };

  const fetchDistricts = async (regencyCode) => {
    try {
      const response = await fetch(`https://wilayah.id/api/districts/${regencyCode}.json`);
      const result = await response.json();
      if (result && result.data) {
        setDistricts(result.data);
      }
    } catch (e) {
      console.error('Gagal mengambil data kecamatan', e);
    }
  };

  const handleProvinceChange = (e) => {
    const code = e.target.value;
    setSelectedProvince(code);
    setSelectedRegency('');
    setRegencies([]);
    setSelectedDistrict('');
    setDistricts([]);
    if (code) {
      fetchRegencies(code);
    }
  };

  const handleRegencyChange = (e) => {
    const code = e.target.value;
    setSelectedRegency(code);
    setSelectedDistrict('');
    setDistricts([]);
    if (code) {
      fetchDistricts(code);
    }
  };

  // Custom Order Date - helps test the Date Sync Constraint ("tidak boleh mundur 1 tanggal")
  const [orderDate, setOrderDate] = useState('');
  const [loading, setLoading] = useState(false);

  // Set default date to today in local timezone format (YYYY-MM-DD)
  useEffect(() => {
    if (isOpen) {
      const today = new Date();
      const offset = today.getTimezoneOffset();
      const localToday = new Date(today.getTime() - (offset * 60 * 1000));
      setOrderDate(localToday.toISOString().split('T')[0]);

      // Load provinces and reset regions
      fetchProvinces();
      setSelectedProvince('');
      setRegencies([]);
      setSelectedRegency('');
      setDistricts([]);
      setSelectedDistrict('');
    }
  }, [isOpen]);

  const totalAmount = cartItems.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0);

  const handleCheckout = async (e) => {
    e.preventDefault();
    if (cartItems.length === 0) {
      toast.error('Keranjang belanja anda kosong.');
      return;
    }
    if (!selectedProvince) {
      toast.error('Silakan pilih provinsi terlebih dahulu.');
      return;
    }
    if (!selectedRegency) {
      toast.error('Silakan pilih kabupaten/kota terlebih dahulu.');
      return;
    }
    if (!selectedDistrict) {
      toast.error('Silakan pilih kecamatan terlebih dahulu.');
      return;
    }
    if (!shippingAddress.trim()) {
      toast.error('Alamat detail pengiriman wajib diisi.');
      return;
    }
    if (!orderDate) {
      toast.error('Tanggal pesanan wajib dipilih.');
      return;
    }

    setLoading(true);
    try {
      const provinceName = provinces.find(p => p.code === selectedProvince)?.name || '';
      const regencyName = regencies.find(r => r.code === selectedRegency)?.name || '';
      const districtName = districts.find(d => d.code === selectedDistrict)?.name || '';
      const fullAddress = `${provinceName}, ${regencyName}, ${districtName}, ${shippingAddress.trim()}`;

      // Structure checkout payload
      const payload = {
        items: cartItems.map(item => ({
          product_id: item.product_id,
          variant_id: item.variant_id,
          quantity: item.quantity
        })),
        shipping_address: fullAddress,
        notes: notes,
        order_date: new Date(orderDate + 'T12:00:00').toISOString() // set midday to avoid timezone edge issues
      };

      const res = await request.post(API_ENDPOINTS.ORDERS.CREATE, payload);
      if (res.success) {
        toast.success(res.message || 'Pesanan berhasil dibuat!');
        onClearCart();
        setShippingAddress('');
        setSelectedProvince('');
        setRegencies([]);
        setSelectedRegency('');
        setDistricts([]);
        setSelectedDistrict('');
        setNotes('');
        onOrderSuccess();
        onClose();
      }
    } catch (error) {
      toast.error(error.message || 'Gagal memproses pesanan.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Keranjang Belanja" size="lg">
      {cartItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-neutral-400">
          <ShoppingBag size={52} className="stroke-1 mb-4 text-neutral-300 animate-pulse" />
          <p className="text-xs font-bold uppercase tracking-widest text-neutral-700">Keranjang Belanja Kosong</p>
          <p className="text-[10px] mt-1 text-neutral-400 font-medium">Pilih beberapa produk kaos kaki terbaik kami terlebih dahulu.</p>
        </div>
      ) : (
        <form onSubmit={handleCheckout} className="grid grid-cols-1 lg:grid-cols-5 gap-8 pt-2">

          {/* Cart items list */}
          <div className="lg:col-span-3 space-y-4">
            <h4 className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest border-b border-neutral-100 pb-2.5">Daftar Item</h4>
            <div className="space-y-3 max-h-[45vh] overflow-y-auto pr-1.5 scrollbar-thin">
              {cartItems.map((item, idx) => (
                <div key={`${item.variant_id}-${idx}`} className="flex items-center justify-between gap-4 p-3 bg-neutral-50/60 border border-neutral-100 rounded-2xl hover:bg-neutral-50 transition-colors">
                  <img
                    src={item.image.startsWith('http') || item.image.startsWith('/uploads') ? `https://api.kingcreativestudio.my.id/mamun-socks${item.image}` : item.image}
                    alt={item.name}
                    className="w-12 h-14 rounded-xl object-cover border border-neutral-100 flex-shrink-0"
                  />

                  <div className="flex-1 min-w-0">
                    <h5 className="text-xs font-bold text-neutral-900 uppercase tracking-wider truncate">{item.name}</h5>
                    <p className="text-[10px] text-neutral-400 capitalize mt-0.5">{item.model} - {item.color}</p>
                    <p className="text-[10px] font-extrabold text-neutral-950 mt-1 tracking-wider">
                      Rp {parseFloat(item.price).toLocaleString('id-ID')}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center border border-neutral-200 bg-white rounded-full overflow-hidden shadow-sm">
                      <button
                        type="button"
                        disabled={item.quantity <= 1}
                        onClick={() => onUpdateQuantity(item.variant_id, item.quantity - 1)}
                        className="px-2.5 py-1 text-neutral-600 hover:bg-stone-50 disabled:opacity-30 text-xs font-bold transition-all"
                      >
                        -
                      </button>
                      <span className="px-2 text-[10px] font-bold text-neutral-850">{item.quantity}</span>
                      <button
                        type="button"
                        disabled={item.quantity >= item.stock}
                        onClick={() => onUpdateQuantity(item.variant_id, item.quantity + 1)}
                        className="px-2.5 py-1 text-neutral-600 hover:bg-stone-50 disabled:opacity-30 text-xs font-bold transition-all"
                      >
                        +
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => onRemoveFromCart(item.variant_id)}
                      className="p-2 text-neutral-400 hover:text-red-650 hover:bg-red-50 rounded-full transition-colors"
                      title="Hapus"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-stone-50 border border-neutral-150 p-6 rounded-2xl flex items-center justify-between mt-6">
              <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Total Belanja:</span>
              <span className="text-sm font-black text-neutral-900 tracking-wider">
                Rp {totalAmount.toLocaleString('id-ID')}
              </span>
            </div>
          </div>

          {/* Checkout parameters */}
          {user ? (
            <div className="lg:col-span-2 space-y-5">
              <h4 className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest border-b border-neutral-100 pb-2.5">Informasi Checkout</h4>

              <div className="space-y-4">
                {/* Provinsi Select */}
                <div>
                  <label className="block text-[9px] font-bold text-neutral-450 uppercase tracking-widest mb-1.5">
                    Provinsi
                  </label>
                  <select
                    value={selectedProvince}
                    onChange={handleProvinceChange}
                    className="block w-full px-4 py-2.5 bg-white border border-neutral-200 rounded-2xl text-xs focus:outline-none focus:ring-1 focus:ring-neutral-950 focus:border-neutral-950 transition-all font-semibold"
                    required
                  >
                    <option value="">Pilih Provinsi</option>
                    {provinces.map(p => (
                      <option key={p.code} value={p.code}>{p.name}</option>
                    ))}
                  </select>
                </div>

                {/* Kabupaten/Kota Select */}
                <div>
                  <label className="block text-[9px] font-bold text-neutral-450 uppercase tracking-widest mb-1.5">
                    Kabupaten / Kota
                  </label>
                  <select
                    value={selectedRegency}
                    onChange={handleRegencyChange}
                    disabled={!selectedProvince}
                    className="block w-full px-4 py-2.5 bg-white border border-neutral-200 rounded-2xl text-xs focus:outline-none focus:ring-1 focus:ring-neutral-950 focus:border-neutral-950 transition-all font-semibold disabled:bg-stone-50 disabled:text-neutral-450"
                    required
                  >
                    <option value="">Pilih Kabupaten / Kota</option>
                    {regencies.map(r => (
                      <option key={r.code} value={r.code}>{r.name}</option>
                    ))}
                  </select>
                </div>

                {/* Kecamatan Select */}
                <div>
                  <label className="block text-[9px] font-bold text-neutral-450 uppercase tracking-widest mb-1.5">
                    Kecamatan
                  </label>
                  <select
                    value={selectedDistrict}
                    onChange={(e) => setSelectedDistrict(e.target.value)}
                    disabled={!selectedRegency}
                    className="block w-full px-4 py-2.5 bg-white border border-neutral-200 rounded-2xl text-xs focus:outline-none focus:ring-1 focus:ring-neutral-950 focus:border-neutral-950 transition-all font-semibold disabled:bg-stone-50 disabled:text-neutral-450"
                    required
                  >
                    <option value="">Pilih Kecamatan</option>
                    {districts.map(d => (
                      <option key={d.code} value={d.code}>{d.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="flex items-center gap-1.5 text-[9px] font-bold text-neutral-450 uppercase tracking-widest mb-1.5">
                    <MapPin size={13} className="text-neutral-400" />
                    Alamat Detail Jalan / RT / RW
                  </label>
                  <textarea
                    rows="3"
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    className="block w-full px-4 py-2.5 bg-white border border-neutral-200 rounded-2xl text-xs focus:outline-none focus:ring-1 focus:ring-neutral-950 focus:border-neutral-950 transition-all"
                    placeholder="Contoh: Jl. Sukamaju No. 12, RT 02/03, Kel. Bojong"
                    required
                  ></textarea>
                </div>

                <div>
                  <label className="flex items-center gap-1.5 text-[9px] font-bold text-neutral-450 uppercase tracking-widest mb-1.5">
                    <ClipboardList size={13} className="text-neutral-400" />
                    Catatan (Opsional)
                  </label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="block w-full px-4 py-2.5 bg-white border border-neutral-200 rounded-2xl text-xs focus:outline-none focus:ring-1 focus:ring-neutral-950 focus:border-neutral-950 transition-all"
                    placeholder="Contoh: Titip di satpam depan"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || cartItems.length === 0}
                className="w-full mt-6 bg-neutral-950 hover:bg-neutral-900 text-white font-bold uppercase tracking-widest py-3.5 px-4 rounded-full flex items-center justify-center gap-2 shadow-md shadow-neutral-950/10 hover:shadow-lg transition-all disabled:opacity-50 text-[10px]"
              >
                {loading ? (
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  'Proses Checkout'
                )}
              </button>
            </div>
          ) : (
            <div className="lg:col-span-2 space-y-6 flex flex-col items-center justify-center p-8 bg-neutral-50 border border-neutral-100 rounded-3xl text-center self-start">
              <div className="bg-neutral-950 text-white p-3.5 rounded-full shadow-md shadow-neutral-950/15">
                <User size={24} />
              </div>
              <div className="space-y-2">
                <h4 className="text-xs font-black uppercase tracking-widest text-neutral-950">Mulai Pemesanan</h4>
                <p className="text-[10px] text-neutral-400 font-light leading-relaxed">
                  Silakan masuk ke akun Anda terlebih dahulu untuk memproses pesanan dan melacak pengiriman Anda.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  navigate('/login');
                }}
                className="w-full bg-neutral-950 hover:bg-neutral-900 text-white font-bold uppercase tracking-widest py-3.5 px-4 rounded-full flex items-center justify-center gap-2 shadow-md shadow-neutral-950/10 hover:shadow-lg transition-all text-[10px]"
              >
                Masuk untuk Checkout
              </button>
            </div>
          )}

        </form>
      )}
    </Modal>
  );
};
