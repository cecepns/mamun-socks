import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCart, LogOut, MapPin, Menu, X, Shield, User } from 'lucide-react';

export const Header = ({ user, onLogout, cart }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const cartCount = cart ? cart.reduce((sum, item) => sum + item.quantity, 0) : 0;

  const navLinks = [
    { path: '/catalog', label: 'Katalog Toko' },
    ...(user ? [{ path: '/orders', label: 'Pesanan Saya' }] : []),
    { path: '/contact', label: 'Hubungi Kami' },
    ...(user && user.role === 'admin' ? [{ path: '/admin', label: 'Admin Panel' }] : [])
  ];

  return (
    <header className="bg-white/90 backdrop-blur-md sticky top-0 z-50 border-b border-slate-100 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
        
        {/* Brand & Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <img src="/logo.png" alt="Mamun Socks Logo" className="h-9 w-9 rounded-lg border border-slate-100 bg-stone-50 p-0.5 object-cover" />
          <div>
            <h1 className="text-sm font-extrabold tracking-widest text-slate-950 uppercase">MAMUN SOCKS</h1>
            <div className="flex items-center gap-1 text-[9px] text-slate-400 font-semibold tracking-wider">
              <MapPin size={9} /> KAB. BANDUNG
            </div>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6">
          <nav className="flex items-center gap-6 border-r border-slate-100 pr-6">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`text-xs uppercase tracking-widest font-bold py-1.5 transition-colors ${isActive ? 'text-emerald-600 border-b-2 border-emerald-600' : 'text-slate-400 hover:text-slate-950'}`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Cart Icon */}
          <Link
            to="/checkout"
            className="relative p-2 text-slate-700 hover:text-slate-950 transition-colors flex items-center justify-center bg-slate-50 hover:bg-slate-100 rounded-full"
            title="Keranjang Belanja"
          >
            <ShoppingCart size={17} />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-emerald-600 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                {cartCount}
              </span>
            )}
          </Link>

          {/* User Auth Info */}
          {user ? (
            <div className="flex items-center gap-3 pl-2 border-l border-slate-100">
              <div className="text-right">
                <p className="text-xs font-bold text-slate-800 truncate max-w-[120px]">{user.name}</p>
                <p className="text-[9px] text-slate-400 uppercase tracking-widest font-bold">{user.role}</p>
              </div>
              <button
                onClick={onLogout}
                className="p-2 text-slate-400 hover:text-red-650 bg-slate-50 hover:bg-red-50 rounded-full transition-all"
                title="Keluar"
              >
                <LogOut size={15} />
              </button>
            </div>
          ) : (
            <div className="flex items-center pl-2 border-l border-slate-100">
              <Link
                to="/login"
                className="px-4 py-1.5 bg-slate-950 hover:bg-slate-800 text-white text-[11px] font-bold uppercase tracking-widest rounded-full transition-all shadow-sm"
              >
                Masuk
              </Link>
            </div>
          )}
        </div>

        {/* Mobile controls: Cart icon + Toggle Menu */}
        <div className="flex items-center gap-3 md:hidden">
          <Link
            to="/checkout"
            className="relative p-2 text-slate-700 hover:text-slate-950 transition-colors flex items-center justify-center bg-slate-50 rounded-full"
            title="Keranjang Belanja"
          >
            <ShoppingCart size={16} />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-emerald-600 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Link>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-650 hover:text-slate-950 hover:bg-slate-50 rounded-full transition-colors focus:outline-none"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

      </div>

      {/* Mobile Collapsible Navigation (Toggle Smooth Collapse) */}
      <div 
        className={`md:hidden overflow-hidden transition-all duration-350 ease-in-out border-t border-slate-50 ${mobileMenuOpen ? 'max-h-72 opacity-100 bg-white' : 'max-h-0 opacity-0 pointer-events-none'}`}
      >
        <div className="px-4 py-3 space-y-2.5">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors ${isActive ? 'bg-emerald-50 text-emerald-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-950'}`}
              >
                {link.label}
              </Link>
            );
          })}
          
          {/* Mobile Profile & Auth */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between px-3 text-xs">
            {user ? (
              <>
                <div className="min-w-0">
                  <p className="font-bold text-slate-800 truncate">{user.name}</p>
                  <p className="text-[9px] text-slate-400 uppercase tracking-widest font-bold">{user.role}</p>
                </div>
                <button
                  onClick={() => { setMobileMenuOpen(false); onLogout(); }}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-650 rounded-xl font-bold uppercase tracking-widest text-[9px] transition-all"
                >
                  <LogOut size={12} /> Keluar
                </button>
              </>
            ) : (
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 bg-slate-950 hover:bg-slate-850 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all"
              >
                Masuk ke Akun
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
