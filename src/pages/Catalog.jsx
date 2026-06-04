import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Search, ChevronLeft, ChevronRight, ShoppingBag, MapPin, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { request } from '../utils/request';
import { API_ENDPOINTS } from '../utils/endpoints';

export const Catalog = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(10);

  // Debounce Search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 350);
    return () => clearTimeout(handler);
  }, [search]);

  // Fetch Products
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

  useEffect(() => {
    fetchProducts();
  }, [debouncedSearch, page]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-20 selection:bg-slate-900 selection:text-white">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="p-2 bg-slate-100 rounded-full group-hover:bg-slate-900 group-hover:text-white transition-all">
              <ArrowLeft size={16} />
            </div>
            <span className="text-xs uppercase tracking-widest font-bold">Kembali ke Beranda</span>
          </Link>
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Mamun Socks Logo" className="h-9 w-9 rounded-lg border object-cover" />
            <div>
              <h1 className="text-sm font-black tracking-widest text-slate-950 uppercase">MAMUN SOCKS</h1>
              <div className="flex items-center gap-1 text-[9px] text-slate-400 font-semibold tracking-wider">
                <MapPin size={9} /> KAB. BANDUNG
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 w-full">
        <div className="space-y-8">
          {/* Page Title & Search */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
            <div>
              <h2 className="text-2xl font-black text-slate-900 uppercase tracking-wide">Katalog Kaos Kaki</h2>
              <p className="text-xs text-slate-400 mt-1">Temukan koleksi rajutan kaos kaki premium terbaik dari produsen lokal.</p>
            </div>
            <div className="relative w-full md:max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Cari model, warna, atau merk..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-full text-xs focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all shadow-sm"
              />
            </div>
          </div>

          {/* Product Grid */}
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-x-6 gap-y-10">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="space-y-4 animate-pulse">
                  <div className="aspect-[4/5] bg-slate-200 rounded-2xl" />
                  <div className="h-3 bg-slate-200 rounded-md w-3/4" />
                  <div className="h-3 bg-slate-200 rounded-md w-1/2" />
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-28 bg-white border border-slate-100 rounded-3xl text-slate-400">
              <ShoppingBag size={48} className="stroke-1 mb-4 text-slate-300" />
              <p className="text-xs font-bold uppercase tracking-widest text-slate-700">Produk tidak ditemukan</p>
              <p className="text-[10px] mt-1 text-slate-400">Coba gunakan kata kunci pencarian yang lain.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-x-6 gap-y-10">
              {products.map(product => {
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
                    className="group flex flex-col cursor-pointer bg-white border border-slate-100 rounded-3xl p-3 hover:shadow-xl hover:border-slate-200 transition-all duration-350"
                  >
                    {/* Image */}
                    <div className="aspect-[4/5] overflow-hidden rounded-2xl bg-slate-50 relative border border-slate-100/60 mb-4">
                      <img
                        src={imageSrc}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                      />
                      <div className="absolute top-3 left-3 bg-slate-900 text-white font-extrabold text-[8px] px-2.5 py-1 rounded-full tracking-widest uppercase shadow-sm">
                        LOKAL
                      </div>
                    </div>

                    {/* Details */}
                    <div className="flex-1 flex flex-col justify-between space-y-1">
                      <div>
                        <h3 className="text-xs font-bold text-slate-900 group-hover:text-emerald-600 transition-colors uppercase tracking-wider line-clamp-1">
                          {product.name}
                        </h3>
                        <p className="text-[10px] text-slate-400 font-light line-clamp-2 leading-relaxed mt-1">
                          {product.description || 'Rajutan premium dengan benang berkualitas tinggi.'}
                        </p>
                      </div>

                      <div className="flex items-baseline justify-between pt-2 border-t border-slate-100 mt-3">
                        <span className="text-[11px] font-black text-slate-950 tracking-wider">
                          {priceString}
                        </span>
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                          {product.variants?.length || 0} Model
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-12 pt-6">
              <button
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="p-2 border border-slate-200 bg-white hover:bg-slate-950 hover:text-white rounded-full transition-colors disabled:opacity-30 flex items-center justify-center"
              >
                <ChevronLeft size={14} />
              </button>

              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i + 1)}
                  className={`w-9 h-9 text-[10px] font-bold rounded-full transition-all border ${page === i + 1 ? 'bg-slate-950 border-slate-950 text-white' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-950'}`}
                >
                  {i + 1}
                </button>
              ))}

              <button
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
                className="p-2 border border-slate-200 bg-white hover:bg-slate-950 hover:text-white rounded-full transition-colors disabled:opacity-30 flex items-center justify-center"
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
