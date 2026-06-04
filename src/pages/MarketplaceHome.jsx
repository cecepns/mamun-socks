import React, { useState, useEffect } from 'react';
import { ShoppingCart, Search, User, MapPin, Calendar, Clock, ShoppingBag, LogOut, ChevronLeft, ChevronRight, Package, ClipboardList } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { request } from '../utils/request';
import { API_ENDPOINTS } from '../utils/endpoints';
import { ProductDetailModal } from './ProductDetailModal';
import { CartModal } from './CartModal';
import HeroImage from '../assets/HeroImage.png';

export const MarketplaceHome = ({ user, onLogout }) => {
  // Products listing states
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(10);

  // Cart states
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Selected product modal
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Active view: 'shop' or 'orders'
  const [activeTab, setActiveTab] = useState('shop');
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [orderPage, setOrderPage] = useState(1);
  const [orderTotalPages, setOrderTotalPages] = useState(1);
  const [whatsappNumber, setWhatsappNumber] = useState('6281234567890');

  const fetchSettings = async () => {
    try {
      const res = await request.get(API_ENDPOINTS.SETTINGS.GET);
      if (res.success && res.data.whatsapp_number) {
        setWhatsappNumber(res.data.whatsapp_number);
      }
    } catch (e) {
      console.error('Failed to load settings', e);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  // 1. Debounce Search (minimal 300ms)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // Reset to page 1 on new search
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);

  // 2. Fetch Products
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await request.get(API_ENDPOINTS.PRODUCTS.LIST, {
        params: { search: debouncedSearch, page, limit }
      });
      if (res.success) {
        setProducts(res.data);
        setTotalPages(res.pagination.totalPages || 1);
      }
    } catch (error) {
      toast.error('Gagal mengambil produk.');
    } finally {
      setLoading(false);
    }
  };

  // 3. Fetch Orders
  const fetchOrders = async () => {
    if (!user) return;
    setOrdersLoading(true);
    try {
      const res = await request.get(API_ENDPOINTS.ORDERS.LIST, {
        params: { page: orderPage, limit: 10 }
      });
      if (res.success) {
        setOrders(res.data);
        setOrderTotalPages(res.pagination.totalPages || 1);
      }
    } catch (error) {
      toast.error('Gagal mengambil data pesanan.');
    } finally {
      setOrdersLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [debouncedSearch, page]);

  useEffect(() => {
    if (activeTab === 'orders') {
      fetchOrders();
    }
  }, [activeTab, orderPage]);

  // Cart operations
  const handleAddToCart = (item) => {
    setCart(prevCart => {
      const existingIdx = prevCart.findIndex(i => i.variant_id === item.variant_id);
      if (existingIdx > -1) {
        const newCart = [...prevCart];
        const newQty = newCart[existingIdx].quantity + item.quantity;
        newCart[existingIdx].quantity = Math.min(newQty, item.stock);
        return newCart;
      }
      return [...prevCart, item];
    });
  };

  const handleUpdateCartQty = (variantId, newQty) => {
    setCart(prevCart => prevCart.map(item => {
      if (item.variant_id === variantId) {
        return { ...item, quantity: Math.min(newQty, item.stock) };
      }
      return item;
    }));
  };

  const handleRemoveFromCart = (variantId) => {
    setCart(prevCart => prevCart.filter(item => item.variant_id !== variantId));
    toast.success('Item dihapus dari keranjang.');
  };

  const handleClearCart = () => {
    setCart([]);
  };

  return (
    <div className="min-h-screen bg-stone-50/40 flex flex-col pb-24 text-neutral-900 selection:bg-neutral-900 selection:text-white">

      {/* Top Navbar */}
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-neutral-100/80 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">

          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Mamun Socks Logo" className="h-9 w-9 rounded-lg border border-neutral-100 bg-stone-50 p-0.5 object-cover" />
            <div>
              <h1 className="text-base font-extrabold tracking-widest text-neutral-950 uppercase">MAMUN SOCKS</h1>
              <div className="flex items-center gap-1 text-[9px] text-neutral-400 font-semibold tracking-wider">
                <MapPin size={9} className="text-neutral-400" /> KAB. BANDUNG
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center gap-6">
            {user && (
              <nav className="hidden md:flex items-center gap-6 border-r border-neutral-100 pr-6">
                <button
                  onClick={() => setActiveTab('shop')}
                  className={`text-xs uppercase tracking-widest font-bold py-2 relative transition-all ${activeTab === 'shop' ? 'text-neutral-950 border-b-2 border-neutral-950' : 'text-neutral-400 hover:text-neutral-950'}`}
                >
                  Toko
                </button>
                <button
                  onClick={() => setActiveTab('orders')}
                  className={`text-xs uppercase tracking-widest font-bold py-2 relative transition-all ${activeTab === 'orders' ? 'text-neutral-950 border-b-2 border-neutral-950' : 'text-neutral-400 hover:text-neutral-950'}`}
                >
                  Pesanan Saya
                </button>
              </nav>
            )}

            {/* Shopping Cart Trigger */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 text-neutral-700 hover:text-neutral-950 transition-colors flex items-center justify-center bg-stone-100/50 hover:bg-stone-100 rounded-full"
            >
              <ShoppingCart size={17} />
              {cart.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-neutral-950 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                  {cart.reduce((sum, item) => sum + item.quantity, 0)}
                </span>
              )}
            </button>

            {/* Auth status / CTA */}
            {user ? (
              <div className="flex items-center gap-3 pl-2 border-l border-neutral-100">
                <div className="text-right hidden sm:block">
                  <p className="text-xs font-bold text-neutral-800 truncate max-w-[120px]">{user.name}</p>
                  <p className="text-[9px] text-neutral-400 uppercase tracking-widest font-bold">{user.role}</p>
                </div>
                <button
                  onClick={onLogout}
                  className="p-2 text-neutral-400 hover:text-red-600 bg-stone-100/50 hover:bg-red-50 rounded-full transition-all"
                  title="Keluar"
                >
                  <LogOut size={15} />
                </button>
              </div>
            ) : (
              <div className="flex items-center pl-2 border-l border-neutral-100">
                <Link
                  to="/login"
                  className="px-4 py-1.5 bg-neutral-950 hover:bg-neutral-800 text-white text-[11px] font-bold uppercase tracking-widest rounded-full transition-all shadow-sm"
                >
                  Masuk
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Small Navigation for Mobile */}
        {user && (
          <div className="md:hidden flex border-t border-neutral-100/80 bg-stone-50/50">
            <button
              onClick={() => setActiveTab('shop')}
              className={`flex-1 py-3 text-center text-[10px] font-bold uppercase tracking-widest ${activeTab === 'shop' ? 'bg-white text-neutral-950 border-b-2 border-neutral-950' : 'text-neutral-400'}`}
            >
              Toko
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`flex-1 py-3 text-center text-[10px] font-bold uppercase tracking-widest ${activeTab === 'orders' ? 'bg-white text-neutral-950 border-b-2 border-neutral-950' : 'text-neutral-400'}`}
            >
              Pesanan Saya
            </button>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex-1 mt-6 w-full">
        {activeTab === 'shop' ? (

          /* ==========================================
             SHOP / PRODUCT CATALOG
             ========================================== */
          <div className="space-y-8">

            {/* Premium Editorial Hero Section */}
            <div className="bg-neutral-950 text-white relative overflow-hidden py-16 px-6 sm:px-12 rounded-3xl shadow-xl shadow-neutral-950/5">
              {/* Background Image with low opacity */}
              <img
                src={HeroImage}
                alt="Hero Background"
                className="absolute inset-0 w-full h-full object-cover opacity-25 pointer-events-none"
              />
              {/* Subtle ambient light */}
              <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-emerald-500/10 rounded-full filter blur-[120px] pointer-events-none" />

              <div className="max-w-3xl space-y-6 relative z-10">
                <span className="text-[9px] tracking-widest font-extrabold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3.5 py-1 rounded-full uppercase">
                  Kualitas Premium Lokal
                </span>
                <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-[1.1] text-white">
                  Crafted for Premium Comfort, Built for Daily Quality.
                </h2>
                <p className="text-xs sm:text-sm text-white/90 font-light max-w-xl leading-relaxed">
                  Menghadirkan kaos kaki lokal dengan standar kualitas internasional. Mulai dari rajutan benang terbaik, tingkat ketahanan tinggi, hingga desain minimalis modern yang menunjang mobilitas harian Anda.
                </p>
                <div className="flex flex-wrap gap-5 pt-3 text-[10px] font-semibold tracking-wider text-white uppercase border-t border-neutral-800">
                  <div className="flex items-center gap-2"><Clock size={13} className="text-white" /> Kirim Maks H+1</div>
                  <div className="flex items-center gap-2"><Calendar size={13} className="text-white" /> Setiap Hari Aktif</div>
                  <div className="flex items-center gap-2"><Package size={13} className="text-white" /> Stok Diperbarui Berkala</div>
                </div>
              </div>
            </div>

            {/* Search and Filters Header */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 py-2">
              <div className="relative flex-1 sm:max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={16} />
                <input
                  type="text"
                  placeholder="Cari koleksi kaos kaki..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-white border border-neutral-200/70 rounded-full text-xs placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-950 focus:border-neutral-950 transition-all shadow-sm"
                />
              </div>
              <div className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider text-right self-end sm:self-center">
                Halaman {page} dari {totalPages}
              </div>
            </div>

            {/* Products Grid */}
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="space-y-4 shimmer-wrapper">
                    <div className="aspect-[4/5] bg-neutral-200 rounded-2xl" />
                    <div className="h-3 bg-neutral-200 rounded-md w-3/4" />
                    <div className="h-3 bg-neutral-200 rounded-md w-1/2" />
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 bg-white border border-neutral-100 rounded-3xl text-neutral-400">
                <ShoppingBag size={42} className="stroke-1 mb-4 text-neutral-300 animate-pulse" />
                <p className="text-xs font-bold uppercase tracking-widest text-neutral-700">Koleksi tidak ditemukan</p>
                <p className="text-[10px] mt-1 text-neutral-400 font-medium">Coba gunakan kata kunci pencarian yang lain.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
                {products.map(product => {
                  const baseImage = product.images?.[0] || '/logo.png';

                  // Compute price range from variants
                  const variantPrices = product.variants?.map(v => parseFloat(v.price)).filter(p => !isNaN(p)) || [];
                  const minPrice = variantPrices.length > 0 ? Math.min(...variantPrices) : parseFloat(product.price);
                  const maxPrice = variantPrices.length > 0 ? Math.max(...variantPrices) : parseFloat(product.price);
                  const priceString = minPrice === maxPrice
                    ? `Rp ${minPrice.toLocaleString('id-ID')}`
                    : `Rp ${minPrice.toLocaleString('id-ID')} - Rp ${maxPrice.toLocaleString('id-ID')}`;

                  return (
                    <div
                      key={product.id}
                      onClick={() => { setSelectedProduct(product); setIsDetailOpen(true); }}
                      className="group flex flex-col cursor-pointer"
                    >
                      {/* Product Image Frame */}
                      <div className="aspect-[4/5] overflow-hidden rounded-2xl bg-neutral-100 relative shadow-sm border border-neutral-100/50 transition-all duration-300 group-hover:shadow-md">
                        <img
                          src={baseImage.startsWith('http') || baseImage.startsWith('/uploads') ? `https://api.kingcreativestudio.my.id/mamun-socks${baseImage}` : baseImage}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700 ease-out"
                        />
                        <div className="absolute top-3 left-3 bg-neutral-950 text-white font-extrabold text-[8px] px-2.5 py-1 rounded-full tracking-widest uppercase shadow">
                          LOKAL
                        </div>
                      </div>

                      {/* Product Meta */}
                      <div className="pt-4 flex-1 flex flex-col justify-between space-y-1">
                        <div>
                          <h3 className="text-xs font-bold text-neutral-900 group-hover:text-neutral-700 transition-colors uppercase tracking-wider line-clamp-1">
                            {product.name}
                          </h3>
                          <p className="text-[10px] text-neutral-400 font-light line-clamp-2 leading-relaxed mt-1">
                            {product.description || 'Premium local socks design.'}
                          </p>
                        </div>

                        <div className="flex items-baseline justify-between pt-2 border-t border-neutral-100/65 mt-auto">
                          <span className="text-xs font-extrabold text-neutral-950 tracking-wider">
                            {priceString}
                          </span>
                          <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest">
                            {product.variants?.length || 0} Model
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-12 pt-6">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                  className="p-2.5 border border-neutral-200 bg-white hover:bg-neutral-950 hover:text-white rounded-full transition-colors disabled:opacity-30 disabled:hover:bg-white disabled:hover:text-neutral-950 flex items-center justify-center"
                >
                  <ChevronLeft size={14} />
                </button>

                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setPage(i + 1)}
                    className={`w-9 h-9 text-[10px] font-bold rounded-full transition-all border ${page === i + 1 ? 'bg-neutral-950 border-neutral-950 text-white' : 'bg-white border-neutral-200 text-neutral-600 hover:border-neutral-950'}`}
                  >
                    {i + 1}
                  </button>
                ))}

                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage(page + 1)}
                  className="p-2.5 border border-neutral-200 bg-white hover:bg-neutral-950 hover:text-white rounded-full transition-colors disabled:opacity-30 disabled:hover:bg-white disabled:hover:text-neutral-950 flex items-center justify-center"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            )}
          </div>

        ) : (

          /* ==========================================
             TRACK CUSTOMER ORDERS
             ========================================== */
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-neutral-100 shadow-sm">
              <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-800 flex items-center gap-2.5 border-b border-neutral-100 pb-4 mb-6">
                <Package size={17} className="text-neutral-900" /> Histori Pesanan Saya
              </h3>

              {ordersLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-32 bg-stone-50 border border-neutral-100 rounded-2xl shimmer-wrapper" />
                  ))}
                </div>
              ) : orders.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-neutral-400">
                  <ClipboardList size={36} className="stroke-1 mb-3 text-neutral-300" />
                  <p className="text-xs font-bold uppercase tracking-widest text-neutral-600">Belum ada pesanan</p>
                  <p className="text-[10px] text-neutral-400 mt-1">Daftar pesanan Anda akan muncul di bagian ini.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {orders.map(order => {
                    const statusLabels = {
                      pending: { text: 'Menunggu Konfirmasi', class: 'bg-amber-50 text-amber-800 border-amber-100/70' },
                      processing: { text: 'Diproses', class: 'bg-blue-50 text-blue-800 border-blue-100/70' },
                      completed: { text: 'Selesai', class: 'bg-emerald-50 text-emerald-800 border-emerald-100/70' },
                      cancelled: { text: 'Dibatalkan', class: 'bg-red-50 text-red-850 border-red-100/70' }
                    };

                    const status = statusLabels[order.status] || { text: order.status, class: 'bg-neutral-100 text-neutral-700' };

                    return (
                      <div key={order.id} className="border border-neutral-200/70 rounded-2xl overflow-hidden shadow-sm bg-white hover:border-neutral-300 transition-all">

                        {/* Order Header */}
                        <div className="bg-neutral-50/50 px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-neutral-100 text-xs">
                          <div>
                            <span className="text-neutral-400 text-[10px] font-bold tracking-wider uppercase block">ID PESANAN</span>
                            <p className="font-extrabold text-neutral-900 tracking-wider mt-0.5">{order.order_number}</p>
                          </div>
                          <div>
                            <span className="text-neutral-400 text-[10px] font-bold tracking-wider uppercase block text-left sm:text-right">TANGGAL TRANSAKSI</span>
                            <p className="font-semibold text-neutral-700 mt-0.5">
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
                        <div className="px-6 py-3 divide-y divide-neutral-100/60">
                          {order.items?.map((item, idx) => (
                            <div key={idx} className="py-3.5 flex items-center justify-between gap-4">
                              <div className="flex items-center gap-3">
                                <img
                                  src={item.product_images?.[0]?.startsWith('http') || item.product_images?.[0]?.startsWith('/uploads') ? `https://api.kingcreativestudio.my.id/mamun-socks${item.product_images[0]}` : item.product_images?.[0] || '/logo.png'}
                                  alt=""
                                  className="w-10 h-12 rounded-lg object-cover border border-neutral-100 flex-shrink-0"
                                />
                                <div>
                                  <h5 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">{item.product_name}</h5>
                                  <p className="text-[10px] text-neutral-400 capitalize font-medium mt-0.5">{item.model} - {item.color} x {item.quantity} pcs</p>
                                </div>
                              </div>
                              <span className="text-xs font-bold text-neutral-900 tracking-wider">
                                Rp {(parseFloat(item.price) * item.quantity).toLocaleString('id-ID')}
                              </span>
                            </div>
                          ))}
                        </div>

                        {/* Order Footer */}
                        <div className="bg-neutral-50/20 border-t border-neutral-100 px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                          <div>
                            <span className="text-neutral-400 text-[10px] font-bold tracking-wider uppercase block">Alamat Kirim</span>
                            <p className="text-neutral-600 mt-0.5 line-clamp-1">{order.shipping_address}</p>
                          </div>
                          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end border-t border-neutral-150 sm:border-0 pt-3 sm:pt-0">
                            <span className="text-neutral-500 font-bold uppercase tracking-wider">Total Pesanan:</span>
                            <span className="text-sm font-extrabold text-neutral-950 tracking-wider">
                              Rp {parseFloat(order.total_amount).toLocaleString('id-ID')}
                            </span>
                          </div>
                        </div>

                      </div>
                    );
                  })}
                </div>
              )}

              {/* Order Pagination */}
              {orderTotalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8">
                  <button
                    disabled={orderPage <= 1}
                    onClick={() => setOrderPage(orderPage - 1)}
                    className="p-2 border border-neutral-200 bg-white hover:bg-neutral-950 hover:text-white rounded-full transition-colors disabled:opacity-30 flex items-center justify-center"
                  >
                    <ChevronLeft size={14} />
                  </button>
                  {[...Array(orderTotalPages)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setOrderPage(i + 1)}
                      className={`w-9 h-9 text-[10px] font-bold rounded-full border transition-all ${orderPage === i + 1 ? 'bg-neutral-950 border-neutral-950 text-white' : 'bg-white border-neutral-200 text-neutral-600 hover:border-neutral-950'}`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    disabled={orderPage >= orderTotalPages}
                    onClick={() => setOrderPage(orderPage + 1)}
                    className="p-2 border border-neutral-200 bg-white hover:bg-neutral-950 hover:text-white rounded-full transition-colors disabled:opacity-30 flex items-center justify-center"
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* MODALS */}
      <ProductDetailModal
        isOpen={isDetailOpen}
        onClose={() => { setIsDetailOpen(false); setSelectedProduct(null); }}
        product={selectedProduct}
        onAddToCart={handleAddToCart}
      />

      <CartModal
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cart}
        onUpdateQuantity={handleUpdateCartQty}
        onRemoveFromCart={handleRemoveFromCart}
        onClearCart={handleClearCart}
        onOrderSuccess={fetchOrders}
        user={user}
      />

      {/* Floating WhatsApp Button */}
      <a
        href={`https://wa.me/${whatsappNumber}?text=Halo%20Mamun%20Socks%2C%20saya%20ingin%20bertanya%20mengenai%20produk%20kaos%20kaki.`}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 bg-emerald-500 hover:bg-emerald-600 text-white p-4 rounded-full shadow-2xl hover:shadow-emerald-500/20 hover:scale-105 active:scale-95 transition-all z-40 flex items-center justify-center group"
        title="Hubungi via WhatsApp"
      >
        <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
          <path d="M12.012 2c-5.506 0-9.988 4.47-9.988 9.972 0 1.764.462 3.42 1.265 4.876l-1.291 4.722 4.846-1.268a9.92 9.92 0 0 0 4.168.938h.004c5.506 0 9.988-4.47 9.988-9.972C22 6.47 17.518 2 12.012 2zm0 18.286c-1.579 0-3.13-.42-4.492-1.22l-.322-.192-2.858.748.765-2.784-.212-.336a8.212 8.212 0 0 1-1.263-4.398c0-4.542 3.704-8.238 8.263-8.238 4.558 0 8.262 3.696 8.262 8.242 0 4.542-3.704 8.238-8.263 8.238zm4.536-6.19c-.248-.124-1.47-.723-1.696-.807-.226-.083-.39-.124-.554.124-.164.248-.633.807-.775.972-.142.164-.284.185-.532.062-.248-.124-1.047-.385-1.996-1.23-.738-.657-1.236-1.47-1.38-1.72-.144-.247-.015-.38.11-.502.112-.11.248-.288.372-.433.124-.144.165-.247.248-.412.083-.165.04-.31-.02-.433-.06-.124-.554-1.336-.76-1.83-.2-.486-.4-.42-.553-.42-.143-.004-.308-.004-.473-.004a.91.91 0 0 0-.66.31c-.226.247-.864.845-.864 2.06 0 1.217.886 2.392.99 2.557.123.164 1.742 2.66 4.22 3.727.59.254 1.05.406 1.41.52.593.189 1.133.162 1.56.098.476-.072 1.47-.6 1.676-1.176.206-.577.206-1.072.144-1.176-.062-.104-.227-.164-.474-.288z" />
        </svg>
      </a>

    </div>
  );
};
