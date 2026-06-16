import { useState, useEffect } from 'react';
import { DollarSign, ShoppingCart, Grid3X3, UtensilsCrossed, TrendingUp, Clock } from 'lucide-react';
import { getOrders, getTables, getMenuItems, getRevenueAnalysis, getPeakTimes } from '../api';

const StatCard = ({ icon: Icon, label, value, color, trend }) => (
  <div className="glass rounded-2xl p-5 flex items-start gap-4">
    <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0" style={{ background: `${color}20` }}>
      <Icon size={24} style={{ color }} />
    </div>
    <div className="flex-1 min-w-0">
      <div className="text-slate-400 text-xs mb-1">{label}</div>
      <div className="text-2xl font-bold text-white">{value}</div>
      {trend && <div className="text-xs mt-1" style={{ color }}>{trend}</div>}
    </div>
  </div>
);

export default function DashboardView() {
  const [orders, setOrders] = useState([]);
  const [tables, setTables] = useState([]);
  const [menu, setMenu] = useState([]);
  const [revenue, setRevenue] = useState(null);
  const [peakTimes, setPeakTimes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      getOrders().catch(() => []),
      getTables().catch(() => []),
      getMenuItems().catch(() => []),
      getRevenueAnalysis().catch(() => null),
      getPeakTimes().catch(() => ({})),
    ]).then(([o, t, m, r, pt]) => {
      setOrders(o);
      setTables(t);
      setMenu(m);
      setRevenue(r);
      const sorted = Object.entries(pt || {})
        .map(([h, c]) => ({ hour: parseInt(h), count: c }))
        .sort((a, b) => b.count - a.count);
      setPeakTimes(sorted.slice(0, 3));
    }).finally(() => setLoading(false));
  }, []);

  const activeOrders = orders.filter(o => !['SERVED', 'CANCELLED'].includes(o.status));
  const occupiedTables = tables.filter(t => t.isOccupied).length;
  const availableItems = menu.filter(m => m.available).length;
  const todayRevenue = revenue?.totalRevenue || 0;

  const statusGroups = ['PENDING', 'PREPARING', 'READY', 'SERVED'].map(s => ({
    status: s,
    count: orders.filter(o => o.status === s).length,
  }));

  const STATUS_COLORS = { PENDING: '#f59e0b', PREPARING: '#3b82f6', READY: '#10b981', SERVED: '#6366f1' };

  return (
    <div className="space-y-6">
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard icon={DollarSign} label="Total Revenue" value={`$${parseFloat(todayRevenue).toFixed(2)}`} color="#6366f1" trend={`${revenue?.orderCount || 0} paid orders`} />
            <StatCard icon={ShoppingCart} label="Active Orders" value={activeOrders.length} color="#f59e0b" trend={`${orders.length} total`} />
            <StatCard icon={Grid3X3} label="Tables" value={`${occupiedTables} / ${tables.length}`} color="#f43f5e" trend={`${tables.length - occupiedTables} available`} />
            <StatCard icon={UtensilsCrossed} label="Menu Items" value={availableItems} color="#10b981" trend={`${menu.length} total`} />
          </div>

          {/* Order status overview */}
          <div className="glass rounded-2xl p-6">
            <h3 className="text-white font-semibold mb-4">Order Status Overview</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {statusGroups.map(({ status, count }) => (
                <div key={status} className="text-center p-4 rounded-xl" style={{
                  background: `${STATUS_COLORS[status]}10`,
                  border: `1px solid ${STATUS_COLORS[status]}30`,
                }}>
                  <div className="text-3xl font-bold mb-1" style={{ color: STATUS_COLORS[status] }}>{count}</div>
                  <div className="text-xs text-slate-400 capitalize">{status.toLowerCase()}</div>
                </div>
              ))}
            </div>
            {/* Progress bar */}
            {orders.length > 0 && (
              <div className="mt-4 flex h-2 rounded-full overflow-hidden gap-0.5">
                {statusGroups.filter(s => s.count > 0).map(({ status, count }) => (
                  <div key={status} style={{
                    flex: count,
                    background: STATUS_COLORS[status],
                    minWidth: 4,
                  }} title={`${status}: ${count}`} />
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Table availability */}
            <div className="glass rounded-2xl p-5">
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <Grid3X3 size={16} className="text-indigo-400" /> Table Status
              </h3>
              {tables.length === 0 ? (
                <div className="text-center text-slate-500 text-sm py-8">No tables configured</div>
              ) : (
                <div className="grid grid-cols-5 gap-2">
                  {tables.sort((a, b) => a.tableNumber - b.tableNumber).map(t => (
                    <div key={t.id} className="aspect-square rounded-xl flex items-center justify-center text-sm font-bold"
                      style={{
                        background: t.isOccupied ? 'rgba(244,63,94,0.15)' : 'rgba(16,185,129,0.15)',
                        border: `1px solid ${t.isOccupied ? 'rgba(244,63,94,0.3)' : 'rgba(16,185,129,0.3)'}`,
                        color: t.isOccupied ? '#f43f5e' : '#10b981',
                      }}>
                      {t.tableNumber}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Peak hours & recent activity */}
            <div className="glass rounded-2xl p-5">
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <Clock size={16} className="text-amber-400" /> Peak Hours
              </h3>
              {peakTimes.length === 0 ? (
                <div className="text-center text-slate-500 text-sm py-8">No order data yet</div>
              ) : (
                <div className="space-y-3">
                  {peakTimes.map(({ hour, count }, i) => (
                    <div key={i}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-300">{String(hour).padStart(2, '0')}:00 – {String(hour + 1).padStart(2, '0')}:00</span>
                        <span className="text-amber-400 font-semibold">{count} orders</span>
                      </div>
                      <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                        <div className="h-full rounded-full" style={{
                          width: `${Math.round((count / (peakTimes[0]?.count || 1)) * 100)}%`,
                          background: 'linear-gradient(90deg, #f59e0b, #f97316)',
                        }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Recent orders quick view */}
              <h3 className="text-white font-semibold mt-6 mb-3 flex items-center gap-2">
                <TrendingUp size={16} className="text-blue-400" /> Recent Orders
              </h3>
              <div className="space-y-2">
                {orders.slice(0, 4).reverse().map(o => (
                  <div key={o.id} className="flex items-center justify-between text-xs p-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)' }}>
                    <span className="text-slate-300">Order #{o.id} · {o.orderType}</span>
                    <span className="font-medium" style={{ color: STATUS_COLORS[o.status] || '#94a3b8' }}>{o.status}</span>
                  </div>
                ))}
                {orders.length === 0 && <div className="text-slate-500 text-xs text-center py-2">No orders yet</div>}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
