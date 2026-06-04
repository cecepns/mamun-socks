import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { KeyRound, User, UserPlus, ArrowLeft, CheckSquare } from 'lucide-react';
import { request } from '../utils/request';
import { API_ENDPOINTS } from '../utils/endpoints';

export const Register = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!username || !password || !name) {
      toast.error('Silakan isi seluruh kolom formulir.');
      return;
    }

    setLoading(true);
    try {
      const res = await request.post(API_ENDPOINTS.AUTH.REGISTER, { username, password, name });
      if (res.success) {
        toast.success(res.message || 'Registrasi berhasil! Silakan login.');
        navigate('/login');
      }
    } catch (err) {
      toast.error(err.message || 'Gagal mendaftar. Username mungkin sudah digunakan.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4 py-12 relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-emerald-600/20 rounded-full filter blur-[80px]" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-teal-600/20 rounded-full filter blur-[80px]" />

      <div className="w-full max-w-md space-y-8 z-10">
        <div className="flex flex-col items-center">
          <img src="/logo.png" alt="Mamun Socks Logo" className="h-20 w-auto rounded-2xl animate-float shadow-xl shadow-emerald-500/10 mb-3" />
          <h2 className="text-3xl font-bold tracking-tight text-white">Buat Akun</h2>
          <p className="mt-2 text-sm text-slate-400">Daftar sebagai pembeli di Mamun Socks</p>
        </div>

        <div className="bg-slate-800/50 border border-slate-700/50 backdrop-blur-xl p-8 rounded-3xl shadow-2xl">
          <Link to="/" className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors mb-6 font-semibold uppercase tracking-wider">
            <ArrowLeft size={14} /> Kembali ke Beranda
          </Link>
          <form className="space-y-5" onSubmit={handleRegister}>
            <div>
              <label className="block text-sm font-medium text-slate-300">Nama Lengkap</label>
              <div className="mt-1.5 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <CheckSquare size={18} />
                </div>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="block w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all text-sm"
                  placeholder="Nama Lengkap anda"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300">Username</label>
              <div className="mt-1.5 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <User size={18} />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="block w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all text-sm"
                  placeholder="Buat username unik"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300">Password</label>
              <div className="mt-1.5 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <KeyRound size={18} />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all text-sm"
                  placeholder="Buat password"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-transparent text-sm font-medium rounded-xl text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-lg shadow-emerald-600/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-emerald-500 disabled:opacity-50 transition-all font-semibold"
            >
              {loading ? (
                <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  Daftar Akun <UserPlus size={16} />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 flex flex-col gap-3 items-center text-sm text-slate-400">
            <div>
              Sudah punya akun?{' '}
              <Link to="/login" className="font-medium text-emerald-400 hover:text-emerald-300">
                Masuk
              </Link>
            </div>
            
            <Link to="/login" className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-400 transition-colors mt-2">
              <ArrowLeft size={12} /> Kembali ke Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
