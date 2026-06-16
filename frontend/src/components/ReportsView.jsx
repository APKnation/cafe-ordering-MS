import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts';
import { TrendingUp, DollarSign, ShoppingCart, Tag, Clock } from 'lucide-react';
import { getSalesReport, getBestSellers, getRevenueAnalysis, getPeakTimes, getTableTurnover } from '../api';

const PERIODS = ['daily', 'weekly', 'monthly'];

const StatCard = ({ icon: Icon, label, value, color, sub }) => (
  <div className="glass rounded-2xl p-5">
    <div className="flex items-start justify-between mb-3">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${color}20` }}>
        <Icon size={20} style={{ color }} />
      </div>
    </div>
    <div className="text-2xl font-bold text-white mb-0.5">{value}</div>
    <div className="text-slate-400 text-xs">{label}</div>
    {sub && <div className="text-xs mt-1" style={{ color }}>{sub}</div>}
  </div>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-dark rounded-xl p-3 text-xs shadow-xl">
        <div className="text-slate-300 mb-1">{label}</div>
        {payload.map((p, i) => (
          <div key={i} style={{ color: p.color }}>{p.name}: {typeof p.value === 'number' ? p.value.toFixed ? p.value.toFixed(2) : p.value : p.value}</div>
        ))}
      </div>
    );
  }
  return null;
};

export default function ReportsView() {
  const [period, setPeriod] = useState('daily');
  const [report, setReport] = useState(null);
  const [revenue, setRevenue] = useState(null);
  const [bestSellers, setBestSellers] = useState([]);
  const [peakTimes, setPeakTimes] = useState([]);
  const [turnover, setTurnover] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    Promise.all([
      getSalesReport(period),
      getRevenueAnalysis(),
      getBestSellers(),
      getPeakTimes().catch(() => ({})),
      getTableTurnover().catch(() => null),
    ]).then(([r, rev, bs, pt, to]) => {
      setReport(r);
      setRevenue(rev);
      setBestSellers(bs || []);
      // Convert peak times object {hour: count} to array
      const ptArr = Object.entries(pt || {}).map(([hour, count]) => ({
        hour: `${String(hour).padStart(2, '0')}:00`,
        orders: count,
      })).sort((a, b) => a.hour.localeCompare(b.hour));
      setPeakTimes(ptArr);
      setTurnover(to);
    }).catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [period]);

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-3 rounded-xl text-rose-300 text-sm" style={{ background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.2)' }}>
          ⚠️ {error}
        </div>
      )}

      {/* Period selector */}
      <div className="flex gap-2">
        {PERIODS.map(p => (
          <button key={p} onClick={() => setPeriod(p)}
            className="px-4 py-2 rounded-xl text-sm font-medium capitalize transition-smooth"
            style={{
              background: period === p ? 'linear-gradient(135deg, #6366f1, #3b82f6)' : 'rgba(255,255,255,0.06)',
              color: period === p ? 'white' : '#94a3b8',
            }}>
            {p}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* Stats grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard icon={DollarSign} label={`${period} Revenue`} value={`$${parseFloat(report?.totalRevenue || 0).toFixed(2)}`} color="#6366f1" />
            <StatCard icon={ShoppingCart} label="Orders" value={report?.orderCount || 0} color="#3b82f6" />
            <StatCard icon={TrendingUp} label="Tax Collected" value={`$${parseFloat(report?.taxCollected || 0).toFixed(2)}`} color="#f59e0b" />
            <StatCard icon={Tag} label="Discounts Given" value={`$${parseFloat(report?.discountGiven || 0).toFixed(2)}`} color="#10b981" />
          </div>

          {/* All-time revenue */}
          {revenue && (
            <div className="glass rounded-2xl p-5">
              <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">All-Time Revenue Overview</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div><div className="text-xs text-slate-400 mb-1">Total Revenue</div><div className="text-xl font-bold text-indigo-400">${parseFloat(revenue.totalRevenue || 0).toFixed(2)}</div></div>
                <div><div className="text-xs text-slate-400 mb-1">Total Orders</div><div className="text-xl font-bold text-blue-400">{revenue.orderCount || 0}</div></div>
                <div><div className="text-xs text-slate-400 mb-1">Tax Collected</div><div className="text-xl font-bold text-amber-400">${parseFloat(revenue.taxCollected || 0).toFixed(2)}</div></div>
                <div><div className="text-xs text-slate-400 mb-1">Avg Order Value</div>
                  <div className="text-xl font-bold text-emerald-400">
                    ${revenue.orderCount ? (parseFloat(revenue.totalRevenue) / revenue.orderCount).toFixed(2) : '0.00'}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Peak Hours Chart */}
            <div className="glass rounded-2xl p-5">
              <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
                <Clock size={16} className="text-indigo-400" /> Peak Hours
              </h3>
              {peakTimes.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={peakTimes}>
                    <XAxis dataKey="hour" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="orders" name="Orders" fill="url(#barGrad)" radius={[6, 6, 0, 0]} />
                    <defs>
                      <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#6366f1" />
                        <stop offset="100%" stopColor="#3b82f6" />
                      </linearGradient>
                    </defs>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-48 text-slate-500 text-sm">No peak time data yet</div>
              )}
            </div>

            {/* Best Sellers */}
            <div className="glass rounded-2xl p-5">
              <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
                <TrendingUp size={16} className="text-emerald-400" /> Best Sellers
              </h3>
              {bestSellers.length > 0 ? (
                <div className="space-y-3">
                  {bestSellers.slice(0, 8).map((item, i) => {
                    const maxQty = bestSellers[0]?.quantitySold || 1;
                    const pct = Math.round((item.quantitySold / maxQty) * 100);
                    return (
                      <div key={i}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-slate-300 font-medium">
                            <span className="text-slate-500 mr-2">#{i + 1}</span>{item.itemName}
                          </span>
                          <span className="text-indigo-400 font-semibold">{item.quantitySold} sold</span>
                        </div>
                        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                          <div className="h-full rounded-full transition-all"
                            style={{
                              width: `${pct}%`,
                              background: i === 0 ? '#f59e0b' : i === 1 ? '#94a3b8' : i === 2 ? '#f97316' : '#6366f1',
                            }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex items-center justify-center h-48 text-slate-500 text-sm">No sales data yet</div>
              )}
            </div>
          </div>

          {/* Table Turnover */}
          {turnover !== null && (
            <div className="glass rounded-2xl p-5 flex items-center gap-6">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(59,130,246,0.15)' }}>
                <Clock size={28} className="text-blue-400" />
              </div>
              <div>
                <div className="text-xs text-slate-400 mb-1 uppercase tracking-wider">Average Table Turnover</div>
                <div className="text-3xl font-bold text-blue-400">{turnover ? Math.round(turnover) : 0} <span className="text-base font-normal text-slate-400">minutes</span></div>
                <div className="text-xs text-slate-500 mt-0.5">Average duration from seat to served for dine-in orders</div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
