import React, { useState, useEffect } from 'react';
import { ShoppingCart, Search, User, MapPin, Calendar, Clock, ShoppingBag, LogOut, ChevronRight, Package, MessageSquare, Phone, Mail } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { request } from '../utils/request';
import { API_ENDPOINTS } from '../utils/endpoints';
import HeroImage from '../assets/HeroImage.png';

export const MarketplaceHome = ({ user, onLogout, cart }) => {
  const navigate = useNavigate();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [whatsappNumber, setWhatsappNumber] = useState('6281234567890');
  const [contactInfo, setContactInfo] = useState({
    contact_address: 'Sukawangi kaler no 126 jelegong kutawaringin kabupaten bandung',
    contact_email: '',
    contact_phone: ''
  });

  const fetchSettings = async () => {
    try {
      const res = await request.get(API_ENDPOINTS.SETTINGS.GET);
      if (res.success) {
        if (res.data.whatsapp_number) setWhatsappNumber(res.data.whatsapp_number);
        setContactInfo(prev => ({
          ...prev,
          ...res.data
        }));
      }
    } catch (e) {
      console.error('Failed to load settings', e);
    }
  };

  const fetchFeaturedProducts = async () => {
    setLoading(true);
    try {
      // Fetch only the top 4 products for landing showcase
      const res = await request.get(API_ENDPOINTS.PRODUCTS.LIST, {
        params: { page: 1, limit: 4 }
      });
      if (res.success) {
        setFeaturedProducts(res.data);
      }
    } catch (error) {
      console.error('Gagal mengambil produk unggulan.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
    fetchFeaturedProducts();
  }, []);

  return (
    <div className="min-h-screen bg-stone-50/40 flex flex-col pb-20 text-neutral-900 selection:bg-neutral-950 selection:text-white">
      
      {/* Top Navbar */}
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-neutral-100/80 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center gap-3">
            <img src="/logo.png" alt="Mamun Socks Logo" className="h-9 w-9 rounded-lg border border-neutral-100 bg-stone-50 p-0.5 object-cover" />
            <div>
              <h1 className="text-base font-extrabold tracking-widest text-neutral-950 uppercase">MAMUN SOCKS</h1>
              <div className="flex items-center gap-1 text-[9px] text-neutral-400 font-semibold tracking-wider">
                <MapPin size={9} className="text-neutral-400" /> KAB. BANDUNG
              </div>
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center gap-6">
            <nav className="hidden md:flex items-center gap-6 border-r border-neutral-100 pr-6">
              <Link to="/catalog" className="text-xs uppercase tracking-widest font-bold py-2 text-neutral-400 hover:text-neutral-950 transition-colors">
                Katalog Toko
              </Link>
              {user && (
                <Link to="/orders" className="text-xs uppercase tracking-widest font-bold py-2 text-neutral-400 hover:text-neutral-950 transition-colors">
                  Pesanan Saya
                </Link>
              )}
              <Link to="/contact" className="text-xs uppercase tracking-widest font-bold py-2 text-neutral-400 hover:text-neutral-950 transition-colors">
                Hubungi Kami
              </Link>
            </nav>

            {/* Shopping Cart Trigger (redirects to standalone Checkout Page) */}
            <Link
              to="/checkout"
              className="relative p-2 text-neutral-700 hover:text-neutral-950 transition-colors flex items-center justify-center bg-stone-100/50 hover:bg-stone-100 rounded-full"
              title="Keranjang Belanja"
            >
              <ShoppingCart size={17} />
              {cart.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-neutral-950 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                  {cart.reduce((sum, item) => sum + item.quantity, 0)}
                </span>
              )}
            </Link>

            {/* Auth status / CTA */}
            {user ? (
              <div className="flex items-center gap-3 pl-2 border-l border-neutral-100">
                <div className="text-right hidden sm:block">
                  <p className="text-xs font-bold text-neutral-800 truncate max-w-[120px]">{user.name}</p>
                  <p className="text-[9px] text-neutral-400 uppercase tracking-widest font-bold">{user.role}</p>
                </div>
                <button
                  onClick={onLogout}
                  className="p-2 text-neutral-400 hover:text-red-650 bg-stone-100/50 hover:bg-red-50 rounded-full transition-all"
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
        <div className="md:hidden flex border-t border-neutral-100/80 bg-stone-50/50 text-center text-[10px] font-bold uppercase tracking-widest">
          <Link to="/catalog" className="flex-1 py-3 text-neutral-400 hover:text-neutral-950">
            Katalog
          </Link>
          {user && (
            <Link to="/orders" className="flex-1 py-3 text-neutral-400 hover:text-neutral-950">
              Pesanan
            </Link>
          )}
          <Link to="/contact" className="flex-1 py-3 text-neutral-400 hover:text-neutral-950">
            Kontak
          </Link>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex-1 mt-6 w-full space-y-16">
        
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
              Comfort and Quality in Every Single Thread.
            </h2>
            <p className="text-xs sm:text-sm text-white/90 font-light max-w-xl leading-relaxed">
              Menghadirkan kaos kaki rajutan lokal dengan standar kualitas internasional. Menggunakan benang pilihan dan teknologi rajut terkini untuk sirkulasi udara optimal dan daya tahan maksimal.
            </p>
            <div className="flex flex-wrap gap-5 pt-3 text-[10px] font-semibold tracking-wider text-white uppercase border-t border-neutral-800">
              <div className="flex items-center gap-2"><Clock size={13} className="text-white" /> Kirim Maks H+1</div>
              <div className="flex items-center gap-2"><Calendar size={13} className="text-white" /> Setiap Hari Aktif</div>
              <div className="flex items-center gap-2"><Package size={13} className="text-white" /> Rajutan Tebal & Lembut</div>
            </div>
            <div className="pt-4">
              <Link to="/catalog" className="inline-flex items-center gap-1.5 px-6 py-3 bg-white hover:bg-neutral-100 text-neutral-950 text-xs font-black uppercase tracking-widest rounded-full transition-all shadow-md">
                Buka Katalog Toko <ChevronRight size={14} />
              </Link>
            </div>
          </div>
        </div>

        {/* Featured / Curated Grid Section */}
        <div className="space-y-8">
          <div className="flex items-end justify-between border-b border-neutral-100 pb-4">
            <div>
              <h3 className="text-xs font-black text-emerald-600 uppercase tracking-widest">Koleksi Terpopuler</h3>
              <h2 className="text-xl font-extrabold uppercase tracking-wider text-neutral-900 mt-1">Koleksi Rajutan Pilihan</h2>
            </div>
            <Link to="/catalog" className="text-xs text-neutral-500 hover:text-neutral-950 font-bold transition-all flex items-center gap-1">
              Lihat Semua <ChevronRight size={12} />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="space-y-4 animate-pulse">
                  <div className="aspect-[4/5] bg-stone-200 rounded-2xl" />
                  <div className="h-3 bg-stone-200 rounded-md w-3/4" />
                  <div className="h-3 bg-stone-200 rounded-md w-1/2" />
                </div>
              ))}
            </div>
          ) : featuredProducts.length === 0 ? (
            <p className="text-xs text-stone-400 text-center py-10">Belum ada produk untuk ditampilkan.</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {featuredProducts.map(product => {
                const baseImage = product.images?.[0] || '/logo.png';
                const imageSrc = baseImage.startsWith('http') || baseImage.startsWith('/uploads') 
                  ? `https://api.kingcreativestudio.my.id/mamun-socks${baseImage}` 
                  : baseImage;

                // Compute price range
                const variantPrices = product.variants?.map(v => parseFloat(v.price)).filter(p => !isNaN(p)) || [];
                const minPrice = variantPrices.length > 0 ? Math.min(...variantPrices) : parseFloat(product.price);
                const maxPrice = variantPrices.length > 0 ? Math.max(...variantPrices) : parseFloat(product.price);
                const priceString = minPrice === maxPrice
                  ? `Rp ${minPrice.toLocaleString('id-ID')}`
                  : `Rp ${minPrice.toLocaleString('id-ID')} - Rp ${maxPrice.toLocaleString('id-ID')}`;

                return (
                  <div
                    key={product.id}
                    onClick={() => navigate(`/product/${product.id}`)}
                    className="group flex flex-col cursor-pointer bg-white rounded-3xl p-3 border border-neutral-100 hover:shadow-lg transition-all duration-300"
                  >
                    <div className="aspect-[4/5] overflow-hidden rounded-2xl bg-neutral-100 relative mb-4">
                      <img
                        src={imageSrc}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
                      />
                      <div className="absolute top-3 left-3 bg-neutral-950 text-white font-extrabold text-[8px] px-2.5 py-1 rounded-full tracking-widest uppercase">
                        LOKAL
                      </div>
                    </div>
                    <div className="flex-1 flex flex-col justify-between space-y-1">
                      <div>
                        <h4 className="text-xs font-bold text-neutral-950 uppercase tracking-wider line-clamp-1 group-hover:text-emerald-600 transition-colors">
                          {product.name}
                        </h4>
                        <p className="text-[10px] text-neutral-400 font-light line-clamp-2 mt-1">
                          {product.description || 'Rajutan premium dengan benang berkualitas tinggi.'}
                        </p>
                      </div>
                      <div className="flex items-baseline justify-between pt-2 border-t border-neutral-50 mt-3">
                        <span className="text-xs font-black text-neutral-950">{priceString}</span>
                        <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider">{product.variants?.length || 0} Model</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Small contact showcase section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-neutral-100 pt-16">
          <div className="space-y-4">
            <span className="inline-block text-[9px] font-extrabold tracking-widest px-3 py-1 bg-stone-150 text-neutral-600 rounded-full uppercase">
              Informasi Toko
            </span>
            <h3 className="text-2xl font-black uppercase tracking-wider">Lokasi & Operasional</h3>
            <p className="text-xs text-neutral-500 font-light leading-relaxed max-w-md">Kunjungi workshop kami langsung di Bandung atau hubungi kami melalui surel dan telepon untuk pemesanan partai besar (kustom merk/panjang rajutan).</p>
            <div className="pt-2 text-xs space-y-3 font-medium text-neutral-600">
              <div className="flex items-start gap-2">
                <MapPin size={16} className="text-neutral-450 mt-0.5 flex-shrink-0" />
                <span>{contactInfo.contact_address}</span>
              </div>
              {contactInfo.contact_email && (
                <div className="flex items-center gap-2">
                  <Mail size={16} className="text-neutral-450 flex-shrink-0" />
                  <span>{contactInfo.contact_email}</span>
                </div>
              )}
              {contactInfo.contact_phone && (
                <div className="flex items-center gap-2">
                  <Phone size={16} className="text-neutral-450 flex-shrink-0" />
                  <span>{contactInfo.contact_phone}</span>
                </div>
              )}
            </div>
          </div>
          <div className="bg-neutral-900 text-white rounded-3xl p-6 sm:p-8 flex flex-col justify-between space-y-6">
            <div className="space-y-2">
              <h4 className="text-sm font-black uppercase tracking-wider text-emerald-400">Reseller & Partai Besar</h4>
              <p className="text-xs text-neutral-300 font-light leading-relaxed">Dapatkan potongan harga spesial untuk pembelian minimal 10 lusin kaos kaki. Sangat cocok untuk toko olahraga, sekolah, reseller offline, maupun online.</p>
            </div>
            <div>
              <a
                href={`https://wa.me/${whatsappNumber}?text=Halo%20Mamun%20Socks%2C%20saya%20ingin%20bertanya%20mengenai%20pemesanan%20partai%20besar.`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 py-3.5 px-6 rounded-full font-bold uppercase tracking-widest text-[10px] shadow transition-colors"
              >
                <MessageSquare size={14} /> Hubungi via WhatsApp
              </a>
            </div>
          </div>
        </div>

      </main>

    </div>
  );
};
