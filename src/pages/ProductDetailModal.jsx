import React, { useState, useEffect } from 'react';
import { ShoppingCart, Film, Play, Image as ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import { getAssetURL } from '../utils/api';
import { Modal } from '../components/Modals';

export const ProductDetailModal = ({ isOpen, onClose, product, onAddToCart }) => {
  if (!product) return null;

  const [activeMedia, setActiveMedia] = useState('image'); // 'image' or 'video'
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedModel, setSelectedModel] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);

  // Extract models and colors from product variants
  const models = Array.from(new Set(product.variants?.map(v => v.model) || []));
  const colors = Array.from(new Set(product.variants?.map(v => v.color) || []));

  // Initialize selections
  useEffect(() => {
    if (models.length > 0) setSelectedModel(models[0]);
    if (colors.length > 0) setSelectedColor(colors[0]);
    setQuantity(1);
    setActiveImageIndex(0);
    setActiveMedia('image');
  }, [product]);

  // Find currently selected variant
  const selectedVariant = product.variants?.find(
    v => v.model === selectedModel && v.color === selectedColor
  );

  const stockAvailable = selectedVariant ? selectedVariant.stock : 0;

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

    onAddToCart({
      product_id: product.id,
      variant_id: selectedVariant.id,
      name: product.name,
      model: selectedModel,
      color: selectedColor,
      price: selectedVariant.price !== undefined && selectedVariant.price !== null ? selectedVariant.price : product.price,
      quantity: quantity,
      stock: stockAvailable,
      image: product.images?.[0] || '/logo.png'
    });

    toast.success('Dimasukkan ke keranjang!');
    onClose();
  };

  const images = product.images || [];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="" size="lg">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-10 pt-4">

        {/* Media Gallery */}
        <div className="space-y-4">
          <div className="relative aspect-[4/5] w-full rounded-2xl bg-stone-50 overflow-hidden border border-neutral-100 shadow-sm flex items-center justify-center">
            {activeMedia === 'image' ? (
              images.length > 0 ? (
                <img
                  src={getAssetURL(images[activeImageIndex])}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <img src="/logo.png" alt="Placeholder" className="w-1/3 object-contain opacity-40" />
              )
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
                className={`w-14 h-16 rounded-xl border overflow-hidden flex-shrink-0 transition-all ${activeMedia === 'image' && activeImageIndex === idx ? 'border-neutral-950 ring-1 ring-neutral-950 scale-95 shadow-sm' : 'border-neutral-200'}`}
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
                className={`w-14 h-16 rounded-xl border flex flex-col items-center justify-center bg-neutral-950 text-white flex-shrink-0 transition-all ${activeMedia === 'video' ? 'border-neutral-950 ring-1 ring-neutral-950 scale-95 shadow-sm' : 'border-neutral-800'}`}
              >
                <Play size={16} className="text-emerald-400" />
                <span className="text-[8px] tracking-wider uppercase font-bold mt-1">Video</span>
              </button>
            )}
          </div>
        </div>

        {/* Product Details */}
        <div className="flex flex-col justify-between">
          <div className="space-y-6">
            <div>
              <span className="inline-block text-[9px] font-extrabold tracking-widest px-3 py-1 bg-stone-100 border border-neutral-200 text-neutral-600 rounded-full uppercase">
                Premium Collection
              </span>
              <h2 className="text-xl font-black text-neutral-950 uppercase tracking-wider mt-2.5 leading-snug">{product.name}</h2>
              <p className="text-base font-extrabold text-neutral-900 tracking-wider mt-1.5 border-b border-neutral-100 pb-4">
                Rp {parseFloat(selectedVariant && selectedVariant.price !== undefined && selectedVariant.price !== null ? selectedVariant.price : product.price).toLocaleString('id-ID')}
              </p>
            </div>

            <div>
              <h4 className="text-[10px] font-extrabold text-neutral-700 uppercase tracking-widest mb-1.5">Deskripsi</h4>
              <p className="text-xs text-neutral-800 font-medium leading-relaxed whitespace-pre-line">
                {product.description || 'Koleksi kaos kaki berkualitas premium untuk kenyamanan beraktivitas sepanjang hari.'}
              </p>
            </div>

            {/* Variants Selection */}
            <div className="space-y-5">
              <div>
                <label className="block text-[9px] font-extrabold text-neutral-700 uppercase tracking-widest mb-2.5">Model</label>
                <div className="flex flex-wrap gap-2">
                  {models.map(model => (
                    <button
                      key={model}
                      onClick={() => setSelectedModel(model)}
                      className={`px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-full border transition-all ${selectedModel === model ? 'bg-neutral-950 border-neutral-950 text-white shadow-sm' : 'bg-white border-neutral-200 text-neutral-600 hover:border-neutral-950'}`}
                    >
                      {model}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[9px] font-extrabold text-neutral-700 uppercase tracking-widest mb-2.5">Warna</label>
                <div className="flex flex-wrap gap-2">
                  {colors.map(color => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-full border capitalize transition-all ${selectedColor === color ? 'bg-neutral-950 border-neutral-950 text-white shadow-sm' : 'bg-white border-neutral-200 text-neutral-600 hover:border-neutral-950'}`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Inventory Stock Indicator */}
            <div className="bg-stone-50 border border-neutral-100 p-4 rounded-2xl flex items-center justify-between mt-6">
              <div>
                <span className="text-[9px] text-neutral-700 font-bold uppercase tracking-widest">Stok Tersedia</span>
                <p className={`text-sm font-extrabold mt-0.5 ${stockAvailable > 0 ? 'text-neutral-800' : 'text-red-500'}`}>
                  {stockAvailable > 0 ? `${stockAvailable} Pasang` : 'Stok Habis'}
                </p>
              </div>

              {stockAvailable > 0 && (
                <div className="flex items-center border border-neutral-250 bg-white rounded-full overflow-hidden shadow-sm">
                  <button
                    disabled={quantity <= 1}
                    onClick={() => setQuantity(q => q - 1)}
                    className="px-3 py-1.5 hover:bg-stone-50 text-neutral-600 font-bold transition-colors disabled:opacity-30"
                  >
                    -
                  </button>
                  <span className="px-4 text-xs font-bold text-neutral-800">{quantity}</span>
                  <button
                    disabled={quantity >= stockAvailable}
                    onClick={() => setQuantity(q => q + 1)}
                    className="px-3 py-1.5 hover:bg-stone-50 text-neutral-600 font-bold transition-colors disabled:opacity-30"
                  >
                    +
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-neutral-100">
            <button
              onClick={handleAddToCart}
              disabled={stockAvailable <= 0}
              className="w-full flex items-center justify-center gap-2 bg-neutral-950 hover:bg-neutral-900 disabled:bg-stone-200 disabled:text-neutral-400 text-white py-3.5 px-6 rounded-full font-bold uppercase tracking-widest text-[10px] shadow-md shadow-neutral-950/10 hover:shadow-lg transition-all"
            >
              <ShoppingCart size={14} />
              {stockAvailable > 0 ? 'Masukkan Keranjang' : 'Stok Kosong'}
            </button>
          </div>

        </div>

      </div>
    </Modal>
  );
};
