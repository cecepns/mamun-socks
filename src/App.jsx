import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { LayoutDashboard, ShoppingBag, ClipboardList, Users, ArrowUpDown, BarChart3, LogOut, Shield, Menu, X, CreditCard } from 'lucide-react';
import toast from 'react-hot-toast';

import { request } from './utils/request';
import { api } from './utils/api';
import { API_ENDPOINTS } from './utils/endpoints';

import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { MarketplaceHome } from './pages/MarketplaceHome';
import { Catalog } from './pages/Catalog';
import { ProductDetail } from './pages/ProductDetail';
import { Checkout } from './pages/Checkout';
import { Contact } from './pages/Contact';
import { Orders } from './pages/Orders';

import { AdminDashboard } from './pages/AdminDashboard';
import { AdminProducts } from './pages/AdminProducts';
import { AdminOrders } from './pages/AdminOrders';
import { AdminUsers } from './pages/AdminUsers';
import { AdminStockLogs } from './pages/AdminStockLogs';
import { AdminReports } from './pages/AdminReports';
import { AdminPaymentMethods } from './pages/AdminPaymentMethods';

// ==========================================
// ADMIN LAYOUT SIDEBAR CONTAINER
// ==========================================
const AdminLayout = ({ user, onLogout, children, activeTab, setActiveTab }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'orders', label: 'Order / Pesanan', icon: ClipboardList },
    { id: 'products', label: 'Produk Kaos Kaki', icon: ShoppingBag },
    { id: 'stock', label: 'Stok & Opname', icon: ArrowUpDown },
    { id: 'users', label: 'Manajemen User', icon: Users },
    { id: 'payments', label: 'Metode Pembayaran', icon: CreditCard },
    { id: 'reports', label: 'Laporan Penjualan', icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">

      {/* Mobile Top Navbar */}
      <div className="md:hidden bg-slate-900 text-white p-4 flex items-center justify-between shadow-md z-30">
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="Mamun Socks" className="w-8 h-8 rounded-lg bg-white p-0.5" />
          <span className="font-bold text-sm">Mamun Socks Admin</span>
        </div>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-1 text-slate-300 hover:text-white"
        >
          {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Backdrop overlay for mobile menu */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Panel */}
      <aside className={`fixed md:sticky top-0 left-0 bottom-0 z-40 w-64 bg-slate-900 text-white flex flex-col transition-transform duration-300 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'} md:flex shadow-2xl`}>
        {/* Sidebar Header */}
        <div className="p-6 border-b border-slate-800 flex items-center gap-3">
          <img src="/logo.png" alt="Mamun Socks" className="w-10 h-10 rounded-xl bg-white p-0.5" />
          <div>
            <h1 className="text-base font-bold text-white tracking-tight">Mamun Socks</h1>
            <span className="text-[10px] text-emerald-400 font-semibold tracking-wider flex items-center gap-1">
              <Shield size={10} /> ADMIN PANEL
            </span>
          </div>
        </div>

        {/* Sidebar Nav */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {menuItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-semibold rounded-xl transition-all ${isActive ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-700/20' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'}`}
              >
                <Icon size={16} /> {item.label}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/40 flex items-center justify-between gap-3 text-xs">
          <div className="min-w-0">
            <p className="font-bold text-slate-200 truncate">{user.name}</p>
            <p className="text-[10px] text-slate-500 capitalize">@{user.username}</p>
          </div>
          <button
            onClick={onLogout}
            className="p-2 text-slate-400 hover:text-white bg-slate-800/40 hover:bg-slate-800 rounded-xl transition-all"
            title="Keluar"
          >
            <LogOut size={14} />
          </button>
        </div>
      </aside>

      {/* Main Body */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Top Header Controls (Desktop only) */}
        <header className="hidden md:flex bg-white border-b border-slate-100 px-8 py-4 items-center justify-between shadow-sm z-20">
          <div>
            <h2 className="text-sm font-bold text-slate-800 capitalize">
              {menuItems.find(m => m.id === activeTab)?.label || 'Panel'}
            </h2>
            <p className="text-[10px] text-slate-400 font-medium">KAB. BANDUNG - Produsen Kaos Kaki Lokal Premium</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full font-semibold border border-emerald-100">
              Admin Mode
            </span>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          {children}
        </main>
      </div>

    </div>
  );
};

// ==========================================
// APP CORE COMPONENT
// ==========================================
export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [adminTab, setAdminTab] = useState('dashboard');

  // Shared Cart State Hoisted from MarketplaceHome
  const [cart, setCart] = useState(() => {
    try {
      const savedCart = localStorage.getItem('mamun_socks_cart');
      return savedCart ? JSON.parse(savedCart) : [];
    } catch (e) {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('mamun_socks_cart', JSON.stringify(cart));
  }, [cart]);

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

  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const res = await api.get(API_ENDPOINTS.AUTH.PROFILE);
      if (res.data && res.data.success) {
        setUser(res.data.data);
      } else {
        localStorage.removeItem('token');
        setUser(null);
      }
    } catch (e) {
      // Only remove token if it's explicitly an authentication failure (401 Unauthorized or 403 Forbidden)
      if (e.response && (e.response.status === 401 || e.response.status === 403)) {
        localStorage.removeItem('token');
        setUser(null);
      } else {
        // Network offline, 500 server error, timeout, etc. - keep the token in localStorage
        console.error("Authentication check failed due to server or network error:", e);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    const confirmLogout = window.confirm('Apakah anda yakin ingin keluar dari sistem?');
    if (!confirmLogout) return;

    localStorage.removeItem('token');
    setUser(null);
    toast.success('Berhasil keluar.');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        <div className="flex flex-col items-center gap-4">
          <img src="/logo.png" alt="Logo" className="w-16 h-16 rounded-2xl animate-pulse" />
          <div className="h-1.5 w-32 bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 w-1/2 rounded-full" />
          </div>
          <span className="text-xs text-slate-400 font-semibold tracking-wider uppercase">Loading Profile...</span>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Toaster position="top-center" reverseOrder={false} />

      <Routes>
        {/* Auth Pages */}
        <Route
          path="/login"
          element={user ? <Navigate to={user.role === 'admin' ? '/admin' : '/'} replace /> : <Login onLoginSuccess={handleLoginSuccess} />}
        />
        <Route
          path="/register"
          element={user ? <Navigate to="/" replace /> : <Register />}
        />

        {/* Customer Routes */}
        <Route
          path="/"
          element={
            user && user.role === 'admin' ? (
              <Navigate to="/admin" replace />
            ) : (
              <MarketplaceHome 
                user={user} 
                onLogout={handleLogout} 
                cart={cart}
                onUpdateQuantity={handleUpdateCartQty}
                onRemoveFromCart={handleRemoveFromCart}
                onClearCart={handleClearCart}
              />
            )
          }
        />

        <Route
          path="/catalog"
          element={<Catalog user={user} cart={cart} onLogout={handleLogout} />}
        />

        <Route
          path="/product/:id"
          element={<ProductDetail user={user} onAddToCart={handleAddToCart} cart={cart} onLogout={handleLogout} />}
        />

        <Route
          path="/checkout"
          element={
            <Checkout 
              user={user} 
              cartItems={cart} 
              onUpdateQuantity={handleUpdateCartQty} 
              onRemoveFromCart={handleRemoveFromCart} 
              onClearCart={handleClearCart} 
              onOrderSuccess={checkAuth} 
              onLogout={handleLogout}
            />
          }
        />

        <Route
          path="/contact"
          element={<Contact user={user} cart={cart} onLogout={handleLogout} />}
        />

        <Route
          path="/orders"
          element={<Orders user={user} cart={cart} onLogout={handleLogout} />}
        />

        {/* Admin Panels */}
        <Route
          path="/admin"
          element={
            !user ? (
              <Navigate to="/login" replace />
            ) : user.role !== 'admin' ? (
              <Navigate to="/" replace />
            ) : (
              <AdminLayout user={user} onLogout={handleLogout} activeTab={adminTab} setActiveTab={setAdminTab}>
                {adminTab === 'dashboard' && <AdminDashboard navigateToTab={setAdminTab} />}
                {adminTab === 'orders' && <AdminOrders />}
                {adminTab === 'products' && <AdminProducts />}
                {adminTab === 'stock' && <AdminStockLogs />}
                {adminTab === 'users' && <AdminUsers currentUser={user} />}
                {adminTab === 'payments' && <AdminPaymentMethods />}
                {adminTab === 'reports' && <AdminReports />}
              </AdminLayout>
            )
          }
        />

        {/* Fallback routing */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
