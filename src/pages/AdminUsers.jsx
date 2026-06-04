import React, { useState, useEffect } from 'react';
import { Search, ShieldAlert, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { request } from '../utils/request';
import { API_ENDPOINTS } from '../utils/endpoints';

export const AdminUsers = ({ currentUser }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(10);

  // Debounced search handler
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await request.get(API_ENDPOINTS.USERS.LIST, {
        params: { search: debouncedSearch, page, limit }
      });
      if (res.success) {
        setUsers(res.data);
        setTotalPages(res.pagination.totalPages || 1);
      }
    } catch (error) {
      toast.error('Gagal mengambil data pengguna.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [debouncedSearch, page]);

  const handleRoleChange = async (userId, targetRole) => {
    if (userId === currentUser.id) {
      toast.error('Anda tidak dapat mengubah peran akun Anda sendiri.');
      return;
    }

    try {
      const res = await request.put(API_ENDPOINTS.USERS.ROLE(userId), { role: targetRole });
      if (res.success) {
        toast.success('Peran pengguna berhasil diperbarui!');
        fetchUsers();
      }
    } catch (error) {
      toast.error(error.message || 'Gagal merubah peran.');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (userId === currentUser.id) {
      toast.error('Anda tidak dapat menghapus akun Anda sendiri.');
      return;
    }

    const confirmDelete = window.confirm('Apakah anda yakin ingin menghapus akun pengguna ini?');
    if (!confirmDelete) return;

    try {
      const res = await request.delete(API_ENDPOINTS.USERS.DELETE(userId));
      if (res.success) {
        toast.success('Pengguna berhasil dihapus.');
        fetchUsers();
      }
    } catch (error) {
      toast.error(error.message || 'Gagal menghapus pengguna.');
    }
  };

  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6">
      
      <div>
        <h2 className="text-lg font-bold text-slate-800">Manajemen Pengguna</h2>
        <p className="text-xs text-slate-500">Kelola akun terdaftar, otorisasi peran (Role Admin / Customer), dan hak akses.</p>
      </div>

      <div className="flex border-t border-slate-50 pt-4">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
          <input
            type="text"
            placeholder="Cari nama atau username..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
          />
        </div>
      </div>

      {loading ? (
        <div className="space-y-3 py-6 shimmer-wrapper">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-16 bg-slate-50 border border-slate-100 rounded-2xl" />
          ))}
        </div>
      ) : users.length === 0 ? (
        <div className="text-center py-16 text-slate-400 text-xs">
          Tidak ada pengguna terdaftar yang cocok.
        </div>
      ) : (
        <div className="overflow-x-auto border border-slate-100 rounded-2xl">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                <th className="p-4">NAMA</th>
                <th className="p-4">USERNAME</th>
                <th className="p-4">PERAN (ROLE)</th>
                <th className="p-4">TANGGAL REGISTER</th>
                <th className="p-4 text-center">AKSI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {users.map(user => (
                <tr key={user.id} className="hover:bg-slate-50/50 text-slate-700">
                  <td className="p-4 font-bold text-slate-800">{user.name}</td>
                  <td className="p-4 font-mono text-slate-500">@{user.username}</td>
                  <td className="p-4">
                    <select
                      value={user.role}
                      disabled={user.id === currentUser.id}
                      onChange={(e) => handleRoleChange(user.id, e.target.value)}
                      className={`px-2.5 py-1 text-xs font-semibold rounded-lg border outline-none capitalize ${user.role === 'admin' ? 'bg-purple-50 text-purple-700 border-purple-100' : 'bg-slate-50 text-slate-700 border-slate-200'}`}
                    >
                      <option value="customer">Customer</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td className="p-4 text-slate-500 font-medium">
                    {new Date(user.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </td>
                  <td className="p-4">
                    <div className="flex justify-center">
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        disabled={user.id === currentUser.id}
                        className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-30"
                        title="Hapus Akun"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* User Pagination */}
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

    </div>
  );
};
