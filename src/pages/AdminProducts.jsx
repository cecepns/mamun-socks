import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Search, Video, Image as ImageIcon, ChevronLeft, ChevronRight, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { request } from '../utils/request';
import { getAssetURL } from '../utils/api';
import { API_ENDPOINTS } from '../utils/endpoints';
import { Modal } from '../components/Modals';

export const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit, setLimit] = useState(10);

  // Form Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null); // null means "Create Mode"
  const [modalLoading, setModalLoading] = useState(false);

  // Form Fields State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [weight, setWeight] = useState('100');
  const [length, setLength] = useState('');
  const [width, setWidth] = useState('');
  const [height, setHeight] = useState('');
  const [images, setImages] = useState([]);
  const [video, setVideo] = useState('');
  const [variants, setVariants] = useState([]); // [{id, model, color, stock}]

  // Real-time Debounced Search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);

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
      toast.error('Gagal mengambil data produk.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [debouncedSearch, page, limit]);

  // Open modal for Create
  const handleOpenCreate = () => {
    setEditingProduct(null);
    setName('');
    setDescription('');
    setPrice('');
    setWeight('100');
    setLength('');
    setWidth('');
    setHeight('');
    setImages([]);
    setVideo('');
    setVariants([{ sku: '', model: 'Nike', color: 'merah', price: 8000, cost_price: 5000, stock: 10, weight: '', length: '', width: '', height: '', pricing_tiers: [] }]);
    setIsModalOpen(true);
  };

  // Open modal for Edit
  const handleOpenEdit = (product) => {
    setEditingProduct(product);
    setName(product.name);
    setDescription(product.description || '');
    setPrice(product.price);
    setWeight(product.weight || '100');
    setLength(product.length || '');
    setWidth(product.width || '');
    setHeight(product.height || '');
    setImages(product.images || []);
    setVideo(product.video || '');
    setVariants(product.variants?.map(v => ({
      id: v.id,
      sku: v.sku,
      model: v.model,
      color: v.color,
      price: v.price,
      cost_price: v.cost_price || 0,
      stock: v.stock,
      image: v.image || '',
      weight: v.weight || '',
      length: v.length || '',
      width: v.width || '',
      height: v.height || '',
      pricing_tiers: v.pricing_tiers || []
    })) || []);
    setIsModalOpen(true);
  };

  // Handle Multi-Image Upload to backend
  const handleMediaUpload = async (e) => {
    const files = e.target.files;
    if (!files.length) return;

    const formData = new FormData();
    for (let file of files) {
      if (file.type.startsWith('video/')) {
        formData.append('video', file);
      } else {
        formData.append('images', file);
      }
    }

    const uploadToast = toast.loading('Mengunggah file...');
    try {
      // Call direct upload API
      const res = await request.post(API_ENDPOINTS.UPLOAD, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.success) {
        if (res.data.images?.length) {
          setImages(prev => [...prev, ...res.data.images]);
        }
        if (res.data.video) {
          setVideo(res.data.video);
        }
        toast.success('Media diunggah!', { id: uploadToast });
      }
    } catch (err) {
      toast.error(err.message || 'Gagal mengunggah media.', { id: uploadToast });
    }
  };

  // Variant helper functions
  const addVariantRow = () => {
    setVariants([...variants, { sku: '', model: '', color: '', price: price || 0, cost_price: 0, stock: 0, image: '', weight: '', length: '', width: '', height: '', pricing_tiers: [] }]);
  };

  const removeVariantRow = (idx) => {
    setVariants(variants.filter((_, i) => i !== idx));
  };

  const updateVariantRow = (idx, field, val) => {
    setVariants(variants.map((v, i) => {
      if (i === idx) {
        return { ...v, [field]: val };
      }
      return v;
    }));
  };

  const handleVariantImageUpload = async (idx, e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('images', file);
    try {
      const res = await request.post(API_ENDPOINTS.UPLOAD, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      if (res.success && res.data.images?.[0]) {
        updateVariantRow(idx, 'image', res.data.images[0]);
        toast.success('Gambar variasi diunggah.');
      }
    } catch (err) {
      toast.error('Gagal mengunggah gambar variasi.');
    }
  };

  const addTierRow = (variantIdx) => {
    setVariants(variants.map((v, i) => {
      if (i !== variantIdx) return v;
      return { ...v, pricing_tiers: [...(v.pricing_tiers || []), { min_qty: 12, max_qty: 49, price: v.price || 0 }] };
    }));
  };

  const updateTierRow = (variantIdx, tierIdx, field, val) => {
    setVariants(variants.map((v, i) => {
      if (i !== variantIdx) return v;
      const tiers = [...(v.pricing_tiers || [])];
      tiers[tierIdx] = { ...tiers[tierIdx], [field]: val };
      return { ...v, pricing_tiers: tiers };
    }));
  };

  const removeTierRow = (variantIdx, tierIdx) => {
    setVariants(variants.map((v, i) => {
      if (i !== variantIdx) return v;
      return { ...v, pricing_tiers: v.pricing_tiers.filter((_, ti) => ti !== tierIdx) };
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !price) {
      toast.error('Nama dan harga dasar produk wajib diisi.');
      return;
    }
    if (variants.length === 0) {
      toast.error('Produk wajib memiliki minimal 1 variasi kombinasi.');
      return;
    }

    // Validate that variants do not contain empty models/colors/prices
    for (let variant of variants) {
      if (!variant.model.trim() || !variant.color.trim()) {
        toast.error('Semua kolom Model dan Warna variasi wajib diisi.');
        return;
      }
      const vPrice = parseFloat(variant.price);
      if (isNaN(vPrice) || vPrice < 0) {
        toast.error('Harga variasi wajib berupa angka positif.');
        return;
      }
    }

    // Check unique combinations locally first
    const combinations = variants.map(v => `${v.model.trim().toLowerCase()}-${v.color.trim().toLowerCase()}`);
    const uniqueCombinations = new Set(combinations);
    if (combinations.length !== uniqueCombinations.size) {
      toast.error('Terdapat duplikasi variasi (model & warna yang sama).');
      return;
    }

    setModalLoading(true);
    try {
      const payload = {
        name,
        description,
        price: parseFloat(price),
        weight: parseFloat(weight) || 100,
        length: length ? parseFloat(length) : null,
        width: width ? parseFloat(width) : null,
        height: height ? parseFloat(height) : null,
        images,
        video,
        variants: variants.map(v => ({
          id: v.id,
          sku: (v.sku || '').trim() || null,
          model: v.model.trim(),
          color: v.color.trim(),
          price: parseFloat(v.price) || parseFloat(price) || 0,
          cost_price: parseFloat(v.cost_price) || 0,
          stock: parseInt(v.stock) || 0,
          image: v.image || null,
          weight: v.weight ? parseFloat(v.weight) : null,
          length: v.length ? parseFloat(v.length) : null,
          width: v.width ? parseFloat(v.width) : null,
          height: v.height ? parseFloat(v.height) : null,
          pricing_tiers: (v.pricing_tiers || []).map(t => ({
            min_qty: parseInt(t.min_qty),
            max_qty: parseInt(t.max_qty),
            price: parseFloat(t.price)
          }))
        }))
      };

      if (editingProduct) {
        // Edit Mode
        const res = await request.put(API_ENDPOINTS.PRODUCTS.UPDATE(editingProduct.id), payload);
        if (res.success) {
          toast.success('Produk berhasil diperbarui.');
          setIsModalOpen(false);
          fetchProducts();
        }
      } else {
        // Create Mode
        const res = await request.post(API_ENDPOINTS.PRODUCTS.CREATE, payload);
        if (res.success) {
          toast.success('Produk berhasil didaftarkan.');
          setIsModalOpen(false);
          fetchProducts();
        }
      }
    } catch (error) {
      toast.error(error.message || 'Gagal menyimpan produk.');
    } finally {
      setModalLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm('Apakah anda yakin ingin menghapus produk ini?');
    if (!confirmDelete) return;

    try {
      const res = await request.delete(API_ENDPOINTS.PRODUCTS.DELETE(id));
      if (res.success) {
        toast.success('Produk berhasil dihapus.');
        fetchProducts();
      }
    } catch (error) {
      toast.error(error.message || 'Gagal menghapus produk.');
    }
  };

  const removeImage = (indexToRemove) => {
    setImages(images.filter((_, idx) => idx !== indexToRemove));
  };

  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6">

      {/* Header controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Katalog Kaos Kaki</h2>
          <p className="text-xs text-slate-500">Kelola informasi produk, video, gambar, dan varian stok.</p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-emerald-600/10 hover:shadow-emerald-600/20 transition-all"
        >
          <Plus size={16} /> Tambah Produk
        </button>
      </div>

      {/* Filter and limits */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-50 pt-4">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
          <input
            type="text"
            placeholder="Cari produk..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
          />
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500 w-full sm:w-auto justify-end">
          <span>Tampilkan</span>
          <select
            value={limit}
            onChange={(e) => { setLimit(parseInt(e.target.value)); setPage(1); }}
            className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs outline-none"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
          <span>data</span>
        </div>
      </div>

      {/* Table grid */}
      {loading ? (
        <div className="space-y-3 py-6 shimmer-wrapper">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-slate-50 border border-slate-100 rounded-2xl" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-16 text-slate-400 text-xs">
          Produk belum didaftarkan di katalog.
        </div>
      ) : (
        <div className="overflow-x-auto border border-slate-100 rounded-2xl">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                <th className="p-4">PRODUK</th>
                <th className="p-4">HARGA DASAR</th>
                <th className="p-4">KOMBINASI VARIASI</th>
                <th className="p-4">TOTAL STOK</th>
                <th className="p-4 text-center">AKSI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {products.map(product => {
                const totalStock = product.variants?.reduce((sum, v) => sum + v.stock, 0) || 0;
                const baseImage = product.images?.[0] || '/logo.png';
                return (
                  <tr key={product.id} className="hover:bg-slate-50/50 text-slate-700">
                    <td className="p-4 flex items-center gap-3">
                      <img
                        src={getAssetURL(baseImage)}
                        alt=""
                        className="w-10 h-10 rounded-lg object-cover border border-slate-100"
                      />
                      <div>
                        <span className="font-bold text-slate-800 text-sm block">{product.name}</span>
                        <span className="text-[10px] text-slate-400 line-clamp-1">{product.description || '-'}</span>
                      </div>
                    </td>
                    <td className="p-4 font-semibold text-slate-800">
                      Rp {parseFloat(product.price).toLocaleString('id-ID')}
                    </td>
                    <td className="p-4">
                      <div className="flex flex-wrap gap-1">
                        {product.variants?.map((v, i) => (
                          <span key={i} className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md text-[9px] capitalize">
                            {v.model} ({v.color}: {v.stock} pcs - Rp {parseFloat(v.price || 0).toLocaleString('id-ID')})
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`font-bold text-xs ${totalStock < 10 ? 'text-red-500 bg-red-50 border border-red-100 px-2 py-0.5 rounded-lg' : 'text-slate-800'}`}>
                        {totalStock} pcs
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleOpenEdit(product)}
                          className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Hapus"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Table Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-1.5 pt-4">
          <button
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
            className="p-2 border border-slate-200 bg-white hover:bg-slate-50 rounded-xl transition-colors disabled:opacity-40"
          >
            <ChevronLeft size={14} />
          </button>
          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              onClick={() => setPage(i + 1)}
              className={`w-8 h-8 text-xs font-semibold rounded-xl border transition-all ${page === i + 1 ? 'bg-emerald-600 border-emerald-600 text-white shadow' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'}`}
            >
              {i + 1}
            </button>
          ))}
          <button
            disabled={page >= totalPages}
            onClick={() => setPage(page + 1)}
            className="p-2 border border-slate-200 bg-white hover:bg-slate-50 rounded-xl transition-colors disabled:opacity-40"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      )}

      {/* CREATE & EDIT FORM MODAL */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProduct ? 'Edit Produk Kaos Kaki' : 'Tambah Produk Baru'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Left Column: Core Fields */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Nama Kaos Kaki</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="block w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  placeholder="Contoh: Kaos Kaki Bola Premium"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Harga Dasar (Rp)</label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="block w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  placeholder="8000"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Berat (gram)</label>
                <input
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="block w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  placeholder="100"
                />
                <p className="text-[10px] text-slate-400 mt-1">Digunakan untuk hitung ongkir (Raja Ongkir pakai gram).</p>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Panjang (cm)</label>
                  <input
                    type="number"
                    value={length}
                    onChange={(e) => setLength(e.target.value)}
                    className="block w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    placeholder="20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Lebar (cm)</label>
                  <input
                    type="number"
                    value={width}
                    onChange={(e) => setWidth(e.target.value)}
                    className="block w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    placeholder="15"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Tinggi (cm)</label>
                  <input
                    type="number"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    className="block w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    placeholder="10"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Deskripsi</label>
                <textarea
                  rows="3"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="block w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  placeholder="Detail bahan, kelebihan, ukuran..."
                ></textarea>
              </div>
            </div>

            {/* Right Column: Media uploads */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Unggah Media (Gambar / Video)</label>
                <div className="border-2 border-dashed border-slate-200 rounded-2xl p-4 text-center hover:border-emerald-500 transition-colors relative cursor-pointer bg-slate-50/50">
                  <input
                    type="file"
                    multiple
                    onChange={handleMediaUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="flex flex-col items-center justify-center gap-1 text-slate-400">
                    <Plus size={20} />
                    <span className="text-xs font-semibold">Pilih Gambar atau Video</span>
                    <span className="text-[10px]">Maks 5 Gambar, 1 Video</span>
                  </div>
                </div>
              </div>

              {/* Uploaded Files Previews */}
              {images.length > 0 && (
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Daftar Gambar</label>
                  <div className="flex flex-wrap gap-2">
                    {images.map((img, idx) => (
                      <div key={idx} className="relative w-12 h-12 rounded-lg border border-slate-200 overflow-hidden flex-shrink-0">
                        <img
                          src={getAssetURL(img)}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(idx)}
                          className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 transition-colors shadow flex items-center justify-center"
                        >
                          <X size={8} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {video && (
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Video Tersemat</label>
                  <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-xl border border-slate-100">
                    <Video size={16} className="text-emerald-600" />
                    <span className="text-xs text-slate-600 truncate flex-1">{video}</span>
                    <button
                      type="button"
                      onClick={() => setVideo('')}
                      className="text-xs text-red-500 font-bold hover:underline"
                    >
                      Batal
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* Variants section (Model + Color Combinations) */}
          <div className="border-t border-slate-100 pt-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Spesifikasi Model & Warna (Variasi)</h4>
                <p className="text-[10px] text-slate-400">Atur harga, stok, berat & volume per kombinasi model dan warna.</p>
              </div>
              <button
                type="button"
                onClick={addVariantRow}
                className="flex items-center gap-1 text-[10px] text-emerald-600 hover:text-emerald-500 font-bold bg-emerald-50 border border-emerald-100 px-2 py-1 rounded-lg"
              >
                <Plus size={12} /> Tambah Kombinasi
              </button>
            </div>

            <div className="space-y-3">
              {variants.map((v, idx) => (
                <div key={idx} className="p-3 bg-slate-50 border border-slate-100 rounded-2xl space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="flex-1 grid grid-cols-2 sm:grid-cols-6 gap-3">
                      <div>
                        <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">SKU</label>
                        <input type="text" value={v.sku || ''} onChange={(e) => updateVariantRow(idx, 'sku', e.target.value)}
                          className="block w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono" placeholder="Auto jika kosong" />
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">Model</label>
                        <input type="text" value={v.model} onChange={(e) => updateVariantRow(idx, 'model', e.target.value)}
                          className="block w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs" placeholder="Nike" required />
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">Warna</label>
                        <input type="text" value={v.color} onChange={(e) => updateVariantRow(idx, 'color', e.target.value)}
                          className="block w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs" placeholder="merah" required />
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">Harga Jual</label>
                        <input type="number" value={v.price} onChange={(e) => updateVariantRow(idx, 'price', e.target.value)}
                          className="block w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold" required />
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">Harga Modal</label>
                        <input type="number" value={v.cost_price} onChange={(e) => updateVariantRow(idx, 'cost_price', e.target.value)}
                          className="block w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs" placeholder="HPP" />
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">Stok</label>
                        <input type="number" value={v.stock} onChange={(e) => updateVariantRow(idx, 'stock', e.target.value)}
                          className="block w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold" required />
                      </div>
                    </div>
                    <button type="button" disabled={variants.length <= 1} onClick={() => removeVariantRow(idx)}
                      className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg disabled:opacity-30">
                      <Trash2 size={12} />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pl-0 sm:pl-0">
                    <div>
                      <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">Berat (gram)</label>
                      <input type="number" value={v.weight || ''} onChange={(e) => updateVariantRow(idx, 'weight', e.target.value)}
                        className="block w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs" placeholder="Default produk" />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">Panjang (cm)</label>
                      <input type="number" value={v.length || ''} onChange={(e) => updateVariantRow(idx, 'length', e.target.value)}
                        className="block w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs" placeholder="Default produk" />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">Lebar (cm)</label>
                      <input type="number" value={v.width || ''} onChange={(e) => updateVariantRow(idx, 'width', e.target.value)}
                        className="block w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs" placeholder="Default produk" />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">Tinggi (cm)</label>
                      <input type="number" value={v.height || ''} onChange={(e) => updateVariantRow(idx, 'height', e.target.value)}
                        className="block w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs" placeholder="Default produk" />
                    </div>
                  </div>

                  <div className="flex items-center gap-3 flex-wrap">
                    <label className="text-[10px] font-bold text-emerald-600 cursor-pointer hover:underline">
                      + Gambar Variasi
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => handleVariantImageUpload(idx, e)} />
                    </label>
                    {v.image && <img src={getAssetURL(v.image)} alt="" className="w-8 h-8 rounded object-cover border" />}
                    <button type="button" onClick={() => addTierRow(idx)} className="text-[10px] font-bold text-amber-600 hover:underline">+ Tier Grosir</button>
                  </div>

                  {(v.pricing_tiers || []).map((tier, ti) => (
                    <div key={ti} className="flex items-center gap-2 pl-2 border-l-2 border-amber-200">
                      <input type="number" value={tier.min_qty} onChange={(e) => updateTierRow(idx, ti, 'min_qty', e.target.value)}
                        className="w-16 px-2 py-1 text-xs border rounded-lg" placeholder="Min" />
                      <span className="text-xs text-slate-400">—</span>
                      <input type="number" value={tier.max_qty} onChange={(e) => updateTierRow(idx, ti, 'max_qty', e.target.value)}
                        className="w-16 px-2 py-1 text-xs border rounded-lg" placeholder="Max" />
                      <span className="text-xs text-slate-500">pcs =</span>
                      <input type="number" value={tier.price} onChange={(e) => updateTierRow(idx, ti, 'price', e.target.value)}
                        className="w-24 px-2 py-1 text-xs border rounded-lg font-semibold" placeholder="Harga" />
                      <button type="button" onClick={() => removeTierRow(idx, ti)} className="text-red-400 hover:text-red-600"><Trash2 size={10} /></button>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Form Actions */}
          <div className="border-t border-slate-100 pt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl text-xs font-semibold transition-all"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={modalLoading}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow shadow-emerald-600/10 transition-all flex items-center justify-center min-w-[80px]"
            >
              {modalLoading ? (
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                'Simpan'
              )}
            </button>
          </div>

        </form>
      </Modal>

    </div>
  );
};
