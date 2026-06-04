import React, { useState, useEffect } from 'react';
import { CreditCard, Plus, Edit2, Trash2, ToggleLeft, ToggleRight, X, Upload, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { request } from '../utils/request';
import { getAssetURL } from '../utils/api';
import { API_ENDPOINTS } from '../utils/endpoints';
import { Modal } from '../components/Modals';

export const AdminPaymentMethods = () => {
  const [methods, setMethods] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'bank',
    account_number: '',
    account_name: '',
    qr_code_image: ''
  });
  const [uploadingQr, setUploadingQr] = useState(false);

  const fetchMethods = async () => {
    setLoading(true);
    try {
      const res = await request.get(API_ENDPOINTS.PAYMENT_METHODS.ADMIN_LIST);
      if (res.success) {
        setMethods(res.data);
      }
    } catch (err) {
      toast.error('Gagal mengambil data metode pembayaran.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMethods();
  }, []);

  const openCreateModal = () => {
    setEditingId(null);
    setFormData({
      name: '',
      type: 'bank',
      account_number: '',
      account_name: '',
      qr_code_image: ''
    });
    setIsOpen(true);
  };

  const openEditModal = (method) => {
    setEditingId(method.id);
    setFormData({
      name: method.name,
      type: method.type,
      account_number: method.account_number || '',
      account_name: method.account_name || '',
      qr_code_image: method.qr_code_image || ''
    });
    setIsOpen(true);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingQr(true);
    const fd = new FormData();
    fd.append('images', file);

    try {
      const res = await request.post(API_ENDPOINTS.UPLOAD, fd, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      if (res.success && res.data.images?.length > 0) {
        setFormData(prev => ({
          ...prev,
          qr_code_image: res.data.images[0]
        }));
        toast.success('Gambar QRIS berhasil diunggah.');
      } else {
        toast.error('Gagal mengunggah gambar.');
      }
    } catch (err) {
      toast.error('Gagal mengunggah file.');
      console.error(err);
    } finally {
      setUploadingQr(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Nama metode pembayaran wajib diisi.');
      return;
    }

    if (formData.type === 'bank') {
      if (!formData.account_number.trim() || !formData.account_name.trim()) {
        toast.error('Nomor rekening dan Nama pemilik rekening wajib diisi.');
        return;
      }
    } else {
      if (!formData.qr_code_image) {
        toast.error('Gambar QRIS wajib diunggah.');
        return;
      }
    }

    try {
      if (editingId) {
        // Update
        const res = await request.put(API_ENDPOINTS.PAYMENT_METHODS.UPDATE(editingId), formData);
        if (res.success) {
          toast.success('Metode pembayaran berhasil diperbarui.');
          setIsOpen(false);
          fetchMethods();
        }
      } else {
        // Create
        const res = await request.post(API_ENDPOINTS.PAYMENT_METHODS.CREATE, formData);
        if (res.success) {
          toast.success('Metode pembayaran berhasil ditambahkan.');
          setIsOpen(false);
          fetchMethods();
        }
      }
    } catch (err) {
      toast.error(err.message || 'Gagal menyimpan data.');
    }
  };

  const handleToggleActive = async (method) => {
    try {
      const payload = {
        name: method.name,
        type: method.type,
        account_number: method.account_number,
        account_name: method.account_name,
        qr_code_image: method.qr_code_image,
        is_active: method.is_active === 1 ? 0 : 1
      };
      const res = await request.put(API_ENDPOINTS.PAYMENT_METHODS.UPDATE(method.id), payload);
      if (res.success) {
        toast.success(`Status metode pembayaran diubah.`);
        fetchMethods();
      }
    } catch (err) {
      toast.error('Gagal mengubah status.');
    }
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm('Apakah Anda yakin ingin menghapus metode pembayaran ini?');
    if (!confirmDelete) return;

    try {
      const res = await request.delete(API_ENDPOINTS.PAYMENT_METHODS.DELETE(id));
      if (res.success) {
        toast.success('Metode pembayaran dihapus.');
        fetchMethods();
      }
    } catch (err) {
      toast.error('Gagal menghapus data.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-5">
        <div>
          <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <CreditCard size={18} className="text-emerald-600" /> Metode Pembayaran Toko
          </h2>
          <p className="text-[10px] text-slate-400 font-medium">Atur nomor rekening transfer manual dan kode QRIS toko Anda.</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold py-2 px-4 rounded-xl shadow transition-all"
        >
          <Plus size={14} /> Tambah Metode
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <div className="h-8 w-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : methods.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-3xl border border-slate-100 shadow-sm text-slate-400">
          <CreditCard size={40} className="mx-auto mb-3 stroke-1" />
          <p className="text-xs font-bold uppercase tracking-wider text-slate-700">Belum ada metode pembayaran</p>
          <p className="text-[10px] text-slate-400 mt-1">Metode pembayaran diperlukan agar pembeli dapat melakukan transfer.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {methods.map(method => (
            <div
              key={method.id}
              className={`bg-white border rounded-3xl p-5 shadow-sm space-y-4 transition-all hover:shadow-md ${method.is_active === 1 ? 'border-slate-100' : 'border-slate-200 opacity-60'}`}
            >
              <div className="flex items-center justify-between">
                <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest ${method.type === 'bank' ? 'bg-blue-50 text-blue-700' : 'bg-purple-50 text-purple-700'}`}>
                  {method.type === 'bank' ? 'Transfer Bank' : 'QRIS Code'}
                </span>
                
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleToggleActive(method)}
                    className="p-1.5 text-slate-400 hover:text-slate-600 transition-colors"
                    title={method.is_active === 1 ? 'Nonaktifkan' : 'Aktifkan'}
                  >
                    {method.is_active === 1 ? (
                      <ToggleRight className="text-emerald-600" size={20} />
                    ) : (
                      <ToggleLeft className="text-slate-300" size={20} />
                    )}
                  </button>
                  <button
                    onClick={() => openEditModal(method)}
                    className="p-1.5 text-slate-400 hover:text-slate-900 transition-colors"
                    title="Ubah"
                  >
                    <Edit2 size={13} />
                  </button>
                  <button
                    onClick={() => handleDelete(method.id)}
                    className="p-1.5 text-slate-400 hover:text-red-650 transition-colors"
                    title="Hapus"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              {method.type === 'bank' ? (
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-slate-900">{method.name}</h4>
                  <p className="text-xs text-slate-500 font-semibold">Rek: <span className="font-extrabold text-slate-950">{method.account_number}</span></p>
                  <p className="text-xs text-slate-500 font-semibold">A.N: <span className="font-extrabold text-slate-950">{method.account_name}</span></p>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-slate-50 border rounded-xl p-1 flex items-center justify-center">
                    {method.qr_code_image ? (
                      <img
                        src={getAssetURL(method.qr_code_image)}
                        alt="QRIS"
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <span className="text-[8px] text-slate-400">QRIS</span>
                    )}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{method.name}</h4>
                    <p className="text-[10px] text-slate-400 mt-1 uppercase font-semibold tracking-wider">Dynamic QR Code</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title={editingId ? 'Ubah Metode Pembayaran' : 'Tambah Metode Pembayaran'} size="md">
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Nama Metode / Bank</label>
            <input
              type="text"
              placeholder="Contoh: Bank Central Asia (BCA) atau QRIS Shopee"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-medium"
              required
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Tipe Pembayaran</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value, account_number: '', account_name: '', qr_code_image: '' }))}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-semibold"
            >
              <option value="bank">Transfer Bank</option>
              <option value="qris">QRIS Code</option>
            </select>
          </div>

          {formData.type === 'bank' ? (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Nomor Rekening</label>
                <input
                  type="text"
                  placeholder="Contoh: 802347239"
                  value={formData.account_number}
                  onChange={(e) => setFormData(prev => ({ ...prev, account_number: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-medium"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Atas Nama Pemilik</label>
                <input
                  type="text"
                  placeholder="Contoh: Mamun Socks"
                  value={formData.account_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, account_name: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-medium"
                  required
                />
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Unggah Gambar QRIS</label>
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  id="qr-upload"
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={uploadingQr}
                />
                <label
                  htmlFor="qr-upload"
                  className={`w-full flex items-center justify-center gap-2 border-2 border-dashed rounded-2xl py-6 cursor-pointer transition-all hover:bg-slate-50 text-xs font-semibold ${formData.qr_code_image ? 'border-emerald-500 text-emerald-600 bg-emerald-50/20' : 'border-slate-300 text-slate-500 bg-white'}`}
                >
                  {uploadingQr ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Mengunggah Gambar QRIS...
                    </>
                  ) : formData.qr_code_image ? (
                    'Gambar QRIS Terunggah! Klik untuk ganti.'
                  ) : (
                    <>
                      <Upload size={16} />
                      Pilih File Code QRIS
                    </>
                  )}
                </label>
              </div>
              {formData.qr_code_image && (
                <div className="flex justify-center p-2 bg-slate-50 rounded-2xl border">
                  <img
                    src={getAssetURL(formData.qr_code_image)}
                    alt="Preview QRIS"
                    className="w-32 h-32 object-contain"
                  />
                </div>
              )}
            </div>
          )}

          <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4 mt-6">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-4 py-2 border rounded-xl text-xs font-semibold hover:bg-slate-50 transition-all"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={uploadingQr}
              className="px-5 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow transition-all"
            >
              {editingId ? 'Simpan Perubahan' : 'Tambah Metode'}
            </button>
          </div>

        </form>
      </Modal>

    </div>
  );
};
