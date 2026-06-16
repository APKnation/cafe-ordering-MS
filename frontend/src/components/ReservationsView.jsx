import { useState, useEffect } from 'react';
import { Calendar, CheckCircle, XCircle, Clock, Search } from 'lucide-react';
import { getReservations, updateReservationStatus } from '../api';

export default function ReservationsView() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('ALL');

  const loadReservations = () => {
    setLoading(true);
    getReservations()
      .then(setReservations)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadReservations();
  }, []);

  const handleUpdateStatus = async (id, status) => {
    try {
      await updateReservationStatus(id, status);
      loadReservations();
    } catch (err) {
      console.error("Failed to update status", err);
    }
  };

  const filteredReservations = reservations
    .filter(r => filter === 'ALL' || r.status === filter)
    .filter(r => r.customerName.toLowerCase().includes(search.toLowerCase()) || r.phone.includes(search));

  const pendingCount = reservations.filter(r => r.status === 'PENDING').length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          {['ALL', 'PENDING', 'CONFIRMED', 'CANCELLED'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className="px-4 py-2 rounded-xl text-sm font-semibold transition-smooth"
              style={{
                background: filter === f ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.05)',
                color: filter === f ? '#818cf8' : '#94a3b8',
                border: `1px solid ${filter === f ? 'rgba(99,102,241,0.3)' : 'transparent'}`
              }}>
              {f} {f === 'PENDING' && pendingCount > 0 && `(${pendingCount})`}
            </button>
          ))}
        </div>
        <div className="relative w-64">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search name or phone..."
            className="w-full pl-9 pr-4 py-2 rounded-xl text-white text-sm outline-none"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }} />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
        </div>
      ) : (
        <div className="glass rounded-2xl overflow-hidden border border-white/5">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-slate-400 text-sm">
                <th className="p-4 font-medium">Customer</th>
                <th className="p-4 font-medium">Date & Time</th>
                <th className="p-4 font-medium">Guests</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredReservations.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-slate-500">No reservations found</td>
                </tr>
              ) : (
                filteredReservations.map(res => (
                  <tr key={res.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-smooth">
                    <td className="p-4">
                      <div className="font-semibold text-white">{res.customerName}</div>
                      <div className="text-xs text-slate-400">{res.phone}</div>
                      {res.specialRequests && <div className="text-xs text-indigo-300 mt-1">Note: {res.specialRequests}</div>}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2 text-sm text-slate-300">
                        <Calendar size={14} className="text-indigo-400" />
                        {new Date(res.reservationTime).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-300 mt-1">
                        <Clock size={14} className="text-amber-400" />
                        {new Date(res.reservationTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>
                    <td className="p-4 text-white font-medium">{res.guests} <span className="text-slate-500 text-sm font-normal">people</span></td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold"
                        style={{
                          background: res.status === 'CONFIRMED' ? 'rgba(16,185,129,0.1)' : res.status === 'CANCELLED' ? 'rgba(244,63,94,0.1)' : 'rgba(245,158,11,0.1)',
                          color: res.status === 'CONFIRMED' ? '#34d399' : res.status === 'CANCELLED' ? '#fb7185' : '#fbbf24'
                        }}>
                        {res.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2">
                        {res.status === 'PENDING' && (
                          <>
                            <button onClick={() => handleUpdateStatus(res.id, 'CONFIRMED')}
                              className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white transition-smooth" title="Confirm">
                              <CheckCircle size={18} />
                            </button>
                            <button onClick={() => handleUpdateStatus(res.id, 'CANCELLED')}
                              className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white transition-smooth" title="Cancel">
                              <XCircle size={18} />
                            </button>
                          </>
                        )}
                        {res.status === 'CONFIRMED' && (
                          <button onClick={() => handleUpdateStatus(res.id, 'CANCELLED')}
                            className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white transition-smooth" title="Cancel">
                            <XCircle size={18} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
