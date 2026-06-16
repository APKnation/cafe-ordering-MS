import { useState, useEffect } from 'react';
import {
  Coffee, LayoutDashboard, UtensilsCrossed, Grid3X3,
  ShoppingCart, Receipt, BarChart3, LogOut, Menu, X, ChevronRight, Bell, CalendarClock
} from 'lucide-react';

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, adminOnly: true },
  { id: 'menu', label: 'Menu', icon: UtensilsCrossed, adminOnly: false },
  { id: 'tables', label: 'Tables', icon: Grid3X3, adminOnly: false },
  { id: 'orders', label: 'Orders', icon: ShoppingCart, adminOnly: false },
  { id: 'billing', label: 'Billing', icon: Receipt, adminOnly: false },
  { id: 'reservations', label: 'Reservations', icon: CalendarClock, adminOnly: false },
  { id: 'reports', label: 'Reports', icon: BarChart3, adminOnly: true },
];

export default function Layout({ user, currentPage, onNavigate, onLogout, children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [time, setTime] = useState(new Date());
  const isAdmin = user?.role === 'ROLE_ADMIN';

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const visibleNav = navItems.filter(item => !item.adminOnly || isAdmin);

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#0a0f1e' }}>
      {/* Sidebar */}
      <aside
        className={`flex flex-col transition-all duration-300 ease-in-out shrink-0 ${sidebarOpen ? 'w-64' : 'w-16'}`}
        style={{ background: 'rgba(15,23,42,0.95)', borderRight: '1px solid rgba(255,255,255,0.06)' }}>
        
        {/* Logo area */}
        <div className="flex items-center gap-3 px-4 py-5 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: 'linear-gradient(135deg, #6366f1, #3b82f6)' }}>
            <Coffee size={20} color="white" />
          </div>
          {sidebarOpen && (
            <div>
              <div className="font-bold text-white text-sm leading-tight">Cafe OMS</div>
              <div className="text-xs text-indigo-400 font-medium">Management System</div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 overflow-y-auto">
          {visibleNav.map(item => {
            const Icon = item.icon;
            const active = currentPage === item.id;
            return (
              <button key={item.id} onClick={() => onNavigate(item.id)}
                title={!sidebarOpen ? item.label : ''}
                className={`w-full flex items-center gap-3 px-4 py-3 mb-1 transition-smooth rounded-none text-sm font-medium
                  ${active ? 'sidebar-active text-indigo-300' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'}`}>
                <Icon size={20} className="shrink-0" />
                {sidebarOpen && (
                  <>
                    <span className="flex-1 text-left">{item.label}</span>
                    {active && <ChevronRight size={14} className="text-indigo-400" />}
                  </>
                )}
              </button>
            );
          })}
        </nav>

        {/* User info at bottom */}
        <div className="p-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          {sidebarOpen && (
            <div className="mb-3 px-2">
              <div className="text-xs text-slate-500 mb-1">Signed in as</div>
              <div className="text-sm text-white font-medium truncate">{user?.username}</div>
              <div className={`text-xs font-semibold mt-0.5 ${isAdmin ? 'text-indigo-400' : 'text-emerald-400'}`}>
                {isAdmin ? '⚡ Admin' : '👤 Staff'}
              </div>
            </div>
          )}
          <button onClick={onLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-smooth text-sm"
            title={!sidebarOpen ? 'Logout' : ''}>
            <LogOut size={18} className="shrink-0" />
            {sidebarOpen && 'Logout'}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top navbar */}
        <header className="flex items-center gap-4 px-6 py-4 shrink-0"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(10,15,30,0.8)', backdropFilter: 'blur(12px)' }}>
          <button onClick={() => setSidebarOpen(v => !v)}
            className="text-slate-400 hover:text-white transition-smooth">
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <div className="flex-1">
            <h1 className="text-white font-semibold text-lg capitalize">
              {navItems.find(n => n.id === currentPage)?.label || 'Dashboard'}
            </h1>
            <p className="text-slate-500 text-xs">
              {time.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <div className="text-right">
            <div className="text-white font-mono font-semibold text-sm">
              {time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </div>
          </div>
          <button className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-smooth">
            <Bell size={18} />
          </button>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
