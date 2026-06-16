import { useState, useEffect } from 'react';
import { Plus, Trash2, Users, X, Check } from 'lucide-react';
import { getTables, addTable, occupyTable, vacateTable, deleteTable } from '../api';

export default function TablesView({ isAdmin }) {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ tableNumber: '', capacity: 4 });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = () => {
    setLoading(true);
    getTables().then(setTables).catch(e => setError(e.message)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleAdd = async () => {
    if (!form.tableNumber) return;
    setSaving(true);
    try {
      await addTable({ tableNumber: parseInt(form.tableNumber), capacity: parseInt(form.capacity) });
      setShowModal(false);
      setForm({ tableNumber: '', capacity: 4 });
      load();
    } catch (e) { setError(e.message); }
    finally { setSaving(false); }
  };

  const handleOccupy = async (num) => {
    try { await occupyTable(num); load(); } catch (e) { setError(e.message); }
  };

  const handleVacate = async (num) => {
    try { await vacateTable(num); load(); } catch (e) { setError(e.message); }
  };

  const handleDelete = async (num) => {
    if (!confirm(`Delete table ${num}?`)) return;
    try { await deleteTable(num); load(); } catch (e) { setError(e.message); }
  };

  const occupied = tables.filter(t => t.isOccupied).length;

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-3 rounded-xl text-rose-300 text-sm" style={{ background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.2)' }}>
          ⚠️ {error}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="glass rounded-xl p-4">
          <div className="text-xs text-slate-400 mb-1">Total Tables</div>
          <div className="text-2xl font-bold text-indigo-400">{tables.length}</div>
        </div>
        <div className="glass rounded-xl p-4">
          <div className="text-xs text-slate-400 mb-1">Occupied</div>
          <div className="text-2xl font-bold text-rose-400">{occupied}</div>
        </div>
        <div className="glass rounded-xl p-4">
          <div className="text-xs text-slate-400 mb-1">Available</div>
          <div className="text-2xl font-bold text-emerald-400">{tables.length - occupied}</div>
        </div>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-white font-semibold">Table Layout</h2>
        {isAdmin && (
          <button onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-medium"
            style={{ background: 'linear-gradient(135deg, #6366f1, #3b82f6)' }}>
            <Plus size={16} /> Add Table
          </button>
        )}
      </div>

      {/* Table grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {tables.sort((a, b) => a.tableNumber - b.tableNumber).map(table => (
            <div key={table.id} className="rounded-2xl p-5 text-center transition-smooth"
              style={{
                background: table.isOccupied
                  ? 'linear-gradient(135deg, rgba(244,63,94,0.15), rgba(244,63,94,0.05))'
                  : 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(16,185,129,0.05))',
                border: `1px solid ${table.isOccupied ? 'rgba(244,63,94,0.3)' : 'rgba(16,185,129,0.3)'}`,
              }}>
              <div className="text-3xl font-bold mb-1" style={{ color: table.isOccupied ? '#f43f5e' : '#10b981' }}>
                {table.tableNumber}
              </div>
              <div className="flex items-center justify-center gap-1 text-slate-400 text-xs mb-1">
                <Users size={12} /> {table.capacity} seats
              </div>
              <div className={`text-xs font-semibold mb-3 ${table.isOccupied ? 'text-rose-400' : 'text-emerald-400'}`}>
                {table.isOccupied ? '● Occupied' : '● Available'}
              </div>
              <div className="flex flex-col gap-2">
                {!table.isOccupied ? (
                  <button onClick={() => handleOccupy(table.tableNumber)}
                    className="w-full py-1.5 rounded-lg text-xs font-medium text-white transition-smooth hover:opacity-80"
                    style={{ background: 'rgba(244,63,94,0.3)' }}>
                    Mark Occupied
                  </button>
                ) : (
                  <button onClick={() => handleVacate(table.tableNumber)}
                    className="w-full py-1.5 rounded-lg text-xs font-medium text-white transition-smooth hover:opacity-80"
                    style={{ background: 'rgba(16,185,129,0.3)' }}>
                    Mark Vacant
                  </button>
                )}
                {isAdmin && (
                  <button onClick={() => handleDelete(table.tableNumber)}
                    className="w-full py-1.5 rounded-lg text-xs text-slate-400 hover:text-rose-400 transition-smooth"
                    style={{ background: 'rgba(255,255,255,0.04)' }}>
                    <Trash2 size={12} className="inline mr-1" /> Delete
                  </button>
                )}
              </div>
            </div>
          ))}
          {tables.length === 0 && !loading && (
            <div className="col-span-full text-center text-slate-500 py-16">
              No tables added yet. {isAdmin && 'Add your first table.'}
            </div>
          )}
        </div>
      )}

      {/* Add Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}>
          <div className="glass rounded-2xl w-full max-w-sm p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-white font-semibold text-lg">Add Table</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white"><X size={20} /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Table Number *</label>
                <input type="number" value={form.tableNumber}
                  onChange={e => setForm(f => ({ ...f, tableNumber: e.target.value }))}
                  placeholder="e.g. 1" min="1"
                  className="w-full px-3 py-2.5 rounded-xl text-white text-sm outline-none"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Capacity (seats)</label>
                <input type="number" value={form.capacity}
                  onChange={e => setForm(f => ({ ...f, capacity: e.target.value }))}
                  min="1" max="20"
                  className="w-full px-3 py-2.5 rounded-xl text-white text-sm outline-none"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }} />
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 rounded-xl text-slate-400 hover:text-white text-sm" style={{ border: '1px solid rgba(255,255,255,0.1)' }}>Cancel</button>
                <button onClick={handleAdd} disabled={saving}
                  className="flex-1 py-2.5 rounded-xl text-white text-sm font-semibold flex items-center justify-center gap-2"
                  style={{ background: 'linear-gradient(135deg, #6366f1, #3b82f6)' }}>
                  {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Check size={14} /> Add</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
