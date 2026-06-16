import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ShoppingCart, ShoppingBag, ArrowLeft, Play, MapPin, Check, Tag } from 'lucide-react';
import toast from 'react-hot-toast';
import { request } from '../utils/request';
import { getAssetURL } from '../utils/api';
import { API_ENDPOINTS } from '../utils/endpoints';
import { Header } from '../components/Header';
import { QuantityInput } from '../components/QuantityInput';

export const ProductDetail = ({ user, onAddToCart, cart, onLogout }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  const [activeMedia, setActiveMedia] = useState('image'); // 'image' or 'video'
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedModel, setSelectedModel] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);

  // Fetch product detail
  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const res = await request.get(API_ENDPOINTS.PRODUCTS.DETAIL(id));
        if (res.success) {
          setProduct(res.data);
          // Set initial variants
          const models = Array.from(new Set(res.data.variants?.map(v => v.model) || []));
          const colors = Array.from(new Set(res.data.variants?.map(v => v.color) || []));
          if (models.length > 0) setSelectedModel(models[0]);
          if (colors.length > 0) setSelectedColor(colors[0]);
        } else {
          toast.error('Produk tidak ditemukan.');
          navigate('/catalog');
        }
      } catch (error) {
        toast.error('Gagal mengambil detail produk.');
        navigate('/catalog');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 animate-pulse">
          <div className="w-12 h-12 rounded-xl bg-slate-200" />
          <div className="h-4 w-32 bg-slate-200 rounded" />
        </div>
      </div>
    );
  }

  if (!product) return null;

  const models = Array.from(new Set(product.variants?.map(v => v.model) || []));
  const colors = Array.from(new Set(product.variants?.map(v => v.color) || []));

  // Find currently selected variant
  const selectedVariant = product.variants?.find(
    v => v.model === selectedModel && v.color === selectedColor
  );

  const stockAvailable = selectedVariant ? selectedVariant.stock : 0;
  const currentPrice = selectedVariant && selectedVariant.price !== undefined && selectedVariant.price !== null 
    ? parseFloat(selectedVariant.price) 
    : parseFloat(product.price);

  const resolvePriceForQty = (qty) => {
    const tiers = selectedVariant?.pricing_tiers || [];
    const match = tiers.find(t => qty >= t.min_qty && qty <= t.max_qty);
    if (match) return parseFloat(match.price);
    return currentPrice;
  };

  const displayPrice = resolvePriceForQty(quantity);
  const variantImage = selectedVariant?.image || product.images?.[0] || '/logo.png';
  const itemWeight = parseFloat(selectedVariant?.weight) || parseFloat(product.weight) || 100;

  const buildCartItem = (qty) => ({
    product_id: product.id,
    variant_id: selectedVariant.id,
    name: product.name,
    model: selectedModel,
    color: selectedColor,
    price: resolvePriceForQty(qty),
    quantity: qty,
    stock: stockAvailable,
    weight: itemWeight,
    sku: selectedVariant.sku,
    image: variantImage,
    base_price: currentPrice,
    pricing_tiers: selectedVariant.pricing_tiers || []
  });

  const handleAddToCart = () => {
    if (!selectedVariant) {
      toast.error('Silakan pilih variasi model dan warna terlebih dahulu.');
      return;
    }
    if (stockAvailable <= 0) {
      toast.error('Maaf, stok varian ini sedang habis.');
      return;
    }
    if (quantity > stockAvailable) {
      toast.error(`Kuantitas melebihi stok yang tersedia (${stockAvailable} pcs).`);
      return;
    }

    onAddToCart(buildCartItem(quantity));

    toast.success('Dimasukkan ke keranjang!');
  };

  const handleBuyNow = () => {
    if (!selectedVariant) {
      toast.error('Silakan pilih variasi model dan warna terlebih dahulu.');
      return;
    }
    if (stockAvailable <= 0) {
      toast.error('Maaf, stok varian ini sedang habis.');
      return;
    }
    if (quantity > stockAvailable) {
      toast.error(`Kuantitas melebihi stok yang tersedia (${stockAvailable} pcs).`);
      return;
    }

    if (!user) {
      toast.error('Silakan masuk terlebih dahulu untuk memproses pembelian.');
      navigate('/login');
      return;
    }

    const buyNowItem = buildCartItem(quantity);

    navigate('/checkout', { state: { directItems: [buyNowItem] } });
  };

  const images = product.images || [];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-20 selection:bg-slate-900 selection:text-white">
      {/* Reusable Header */}
      <Header user={user} onLogout={onLogout} cart={cart} />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 w-full space-y-4">
        {/* Back Button Inside Page Body Content */}
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 group self-start">
          <div className="p-2 bg-white border border-slate-200 rounded-full group-hover:bg-slate-900 group-hover:text-white transition-all shadow-sm">
            <ArrowLeft size={14} />
          </div>
          <span className="text-[10px] uppercase tracking-widest font-extrabold text-slate-500 group-hover:text-slate-950 transition-colors">
            Kembali ke Halaman Sebelumnya
          </span>
        </button>

        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-100 shadow-xl shadow-slate-100/40">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 sm:gap-12">
            
            {/* Gallery */}
            <div className="space-y-4">
              <div className="relative aspect-[4/5] w-full rounded-2xl bg-slate-50 overflow-hidden border border-slate-100 flex items-center justify-center">
                {activeMedia === 'image' ? (
                  <img
                    src={selectedVariant?.image ? getAssetURL(selectedVariant.image) : (images.length > 0 ? getAssetURL(images[activeImageIndex]) : '/logo.png')}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  product.video && (
                    <video
                      src={getAssetURL(product.video)}
                      controls
                      autoPlay
                      className="w-full h-full object-contain"
                    />
                  )
                )}
              </div>

              {/* Thumbnails */}
              <div className="flex gap-2.5 overflow-x-auto pb-1.5 scrollbar-thin">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => { setActiveMedia('image'); setActiveImageIndex(idx); }}
                    className={`w-14 h-16 rounded-xl border overflow-hidden flex-shrink-0 transition-all ${activeMedia === 'image' && activeImageIndex === idx ? 'border-slate-900 ring-2 ring-slate-900/10 scale-95 shadow-sm' : 'border-slate-200'}`}
                  >
                    <img
                      src={getAssetURL(img)}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}

                {product.video && (
                  <button
                    onClick={() => setActiveMedia('video')}
                    className={`w-14 h-16 rounded-xl border flex flex-col items-center justify-center bg-slate-900 text-white flex-shrink-0 transition-all ${activeMedia === 'video' ? 'border-slate-900 ring-2 ring-slate-900/10 scale-95 shadow-sm' : 'border-slate-800'}`}
                  >
                    <Play size={16} className="text-emerald-400" />
                    <span className="text-[8px] tracking-wider uppercase font-bold mt-1">Video</span>
                  </button>
                )}
              </div>
            </div>

            {/* Info */}
            <div className="flex flex-col justify-between">
              <div className="space-y-6">
                <div>
                  <span className="inline-block text-[9px] font-extrabold tracking-widest px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-100 uppercase">
                    Kualitas Premium Rajut
                  </span>
                  <h2 className="text-2xl font-black text-slate-900 uppercase tracking-wider mt-3 leading-snug">{product.name}</h2>
                  <p className="text-xl font-black text-emerald-600 tracking-wider mt-2 pb-4 border-b border-slate-100">
                    Rp {displayPrice.toLocaleString('id-ID')}
                    {displayPrice !== currentPrice && (
                      <span className="text-xs text-slate-400 line-through ml-2">Rp {currentPrice.toLocaleString('id-ID')}</span>
                    )}
                  </p>
                  {selectedVariant?.sku && (
                    <p className="text-[10px] text-slate-500 font-mono">SKU: {selectedVariant.sku}</p>
                  )}
                </div>

                <div>
                  <h4 className="text-[10px] font-extrabold text-slate-700 uppercase tracking-widest mb-1.5">Deskripsi</h4>
                  <p className="text-xs text-slate-800 font-medium leading-relaxed whitespace-pre-line">
                    {product.description || 'Koleksi kaos kaki berkualitas premium untuk kenyamanan beraktivitas sepanjang hari.'}
                  </p>
                </div>

                {/* Variants */}
                <div className="space-y-5">
                  <div>
                    <label className="block text-[9px] font-extrabold text-slate-700 uppercase tracking-widest mb-2">Pilih Model</label>
                    <div className="flex flex-wrap gap-2">
                      {models.map(model => (
                        <button
                          key={model}
                          onClick={() => setSelectedModel(model)}
                          className={`px-4 py-2 text-[10px] font-bold uppercase tracking-widest rounded-full border transition-all ${selectedModel === model ? 'bg-slate-900 border-slate-900 text-white shadow-sm' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-900'}`}
                        >
                          {model}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[9px] font-extrabold text-slate-700 uppercase tracking-widest mb-2">Pilih Warna</label>
                    <div className="flex flex-wrap gap-2">
                      {colors.map(color => (
                        <button
                          key={color}
                          onClick={() => setSelectedColor(color)}
                          className={`px-4 py-2 text-[10px] font-bold uppercase tracking-widest rounded-full border capitalize transition-all ${selectedColor === color ? 'bg-slate-900 border-slate-900 text-white shadow-sm' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-900'}`}
                        >
                          {color}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Wholesale tiers */}
                {selectedVariant?.pricing_tiers?.length > 0 && (
                  <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl">
                    <p className="text-[9px] font-extrabold text-amber-800 uppercase tracking-widest mb-2 flex items-center gap-1">
                      <Tag size={10} /> Harga Grosir
                    </p>
                    <div className="space-y-1">
                      {selectedVariant.pricing_tiers.map((tier, i) => (
                        <p key={i} className="text-[10px] text-amber-900 font-semibold">
                          {tier.min_qty} — {tier.max_qty >= 999999 ? '∞' : tier.max_qty} pasang: Rp {parseFloat(tier.price).toLocaleString('id-ID')}
                        </p>
                      ))}
                    </div>
                  </div>
                )}

                {/* Stock Selector */}
                <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl flex items-center justify-between mt-6">
                  <div>
                    <span className="text-[9px] text-slate-750 font-bold uppercase tracking-widest">Stok Tersedia</span>
                    <p className={`text-xs font-extrabold mt-0.5 ${stockAvailable > 0 ? 'text-slate-800' : 'text-red-500'}`}>
                      {stockAvailable > 0 ? `${stockAvailable} Pasang` : 'Stok Habis'}
                    </p>
                  </div>

                  {stockAvailable > 0 && (
                    <QuantityInput
                      value={quantity}
                      onChange={setQuantity}
                      min={1}
                      max={stockAvailable}
                    />
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-10 pt-6 border-t border-slate-100">
                <button
                  onClick={handleAddToCart}
                  disabled={stockAvailable <= 0}
                  className="w-full flex items-center justify-center gap-2 bg-white border border-slate-900 text-slate-900 hover:bg-slate-50 disabled:bg-slate-100 disabled:border-slate-200 disabled:text-slate-450 py-3.5 px-6 rounded-full font-bold uppercase tracking-widest text-[10px] shadow-sm transition-all"
                >
                  <ShoppingCart size={14} />
                  Masukkan Keranjang
                </button>
                <button
                  onClick={handleBuyNow}
                  disabled={stockAvailable <= 0}
                  className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-200 disabled:text-slate-400 text-white py-3.5 px-6 rounded-full font-bold uppercase tracking-widest text-[10px] shadow-md shadow-emerald-600/10 hover:shadow-lg transition-all"
                >
                  Beli Langsung
                </button>
              </div>

            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
