import { useState, useEffect } from 'react';
import { getTables, addTable, occupyTable, vacateTable, deleteTable } from '../api';
import { Plus, Trash2, Users, Loader2, CheckCircle, XCircle } from 'lucide-react';

export default function TablesView({ isAdmin }) {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ tableNumber: '', capacity: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = () => {
    setLoading(true);
    getTables()
      .then(setTables)
      .catch(() => setError('Failed to load tables'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await addTable({ tableNumber: parseInt(form.tableNumber), capacity: parseInt(form.capacity) });
      setShowModal(false);
      setForm({ tableNumber: '', capacity: '' });
      load();
    } catch (err) { setError(err.message); }
    finally { setSaving(false); }
  };

  const handleOccupy = async (tableNumber) => {
    try { await occupyTable(tableNumber); load(); }
    catch (err) { setError(err.message); }
  };

  const handleVacate = async (tableNumber) => {
    try { await vacateTable(tableNumber); load(); }
    catch (err) { setError(err.message); }
  };

  const handleDelete = async (tableNumber) => {
    if (!confirm(`Delete table #${tableNumber}?`)) return;
    try { await deleteTable(tableNumber); load(); }
    catch (err) { setError(err.message); }
  };

  const occupied = tables.filter(t => t.isOccupied).length;
  const vacant = tables.length - occupied;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-4 justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Table Management</h2>
          <p className="text-slate-400 text-sm mt-1">{tables.length} tables total</p>
        </div>
        {isAdmin && (
          <button onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-white text-sm transition-smooth hover:scale-105"
            style={{ background: 'linear-gradient(135deg, #6366f1, #3b82f6)' }}>
            <Plus size={18} /> Add Table
          </button>
        )}
      </div>

      {error && <div className="p-3 rounded-xl text-rose-300 text-sm" style={{ background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.2)' }}>{error}</div>}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Tables', value: tables.length, color: '#6366f1' },
          { label: 'Occupied', value: occupied, color: '#f59e0b' },
          { label: 'Available', value: vacant, color: '#10b981' },
        ].map(stat => (
          <div key={stat.label} className="glass rounded-2xl p-5">
            <div className="text-3xl font-bold mb-1" style={{ color: stat.color }}>{stat.value}</div>
            <div className="text-slate-400 text-sm">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Tables grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={32} className="animate-spin text-indigo-400" />
        </div>
      ) : tables.length === 0 ? (
        <div className="text-center py-20 text-slate-500">
          <Users size={48} className="mx-auto mb-4 opacity-30" />
          <p>No tables added yet</p>
          {isAdmin && <p className="text-xs mt-2">Click "Add Table" to get started</p>}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {tables.map(table => (
            <div key={table.id} className="glass rounded-2xl p-5 flex flex-col items-center text-center transition-smooth hover:scale-[1.03] group"
              style={{ border: `2px solid ${table.isOccupied ? 'rgba(245,158,11,0.4)' : 'rgba(16,185,129,0.3)'}` }}>
              {/* Table visual */}
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3 font-bold text-xl"
                style={{
                  background: table.isOccupied
                    ? 'linear-gradient(135deg, rgba(245,158,11,0.2), rgba(234,88,12,0.2))'
                    : 'linear-gradient(135deg, rgba(16,185,129,0.2), rgba(5,150,105,0.2))',
                  color: table.isOccupied ? '#f59e0b' : '#10b981'
                }}>
                {table.tableNumber}
              </div>

              <div className="text-white font-semibold text-sm mb-0.5">Table {table.tableNumber}</div>
              <div className="flex items-center gap-1 text-slate-400 text-xs mb-3">
                <Users size={12} /> {table.capacity} seats
              </div>

              {/* Status badge */}
              <div className={`flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full mb-4 ${table.isOccupied ? 'text-amber-400' : 'text-emerald-400'}`}
                style={{ background: table.isOccupied ? 'rgba(245,158,11,0.1)' : 'rgba(16,185,129,0.1)' }}>
                {table.isOccupied ? <XCircle size={12} /> : <CheckCircle size={12} />}
                {table.isOccupied ? 'Occupied' : 'Available'}
              </div>

              {/* Actions */}
              <div className="w-full space-y-2">
                {!table.isOccupied ? (
                  <button onClick={() => handleOccupy(table.tableNumber)}
                    className="w-full py-1.5 rounded-lg text-xs font-semibold text-amber-300 transition-smooth hover:bg-amber-500/20"
                    style={{ border: '1px solid rgba(245,158,11,0.3)' }}>
                    Mark Occupied
                  </button>
                ) : (
                  <button onClick={() => handleVacate(table.tableNumber)}
                    className="w-full py-1.5 rounded-lg text-xs font-semibold text-emerald-300 transition-smooth hover:bg-emerald-500/20"
                    style={{ border: '1px solid rgba(16,185,129,0.3)' }}>
                    Mark Vacant
                  </button>
                )}
                {isAdmin && (
                  <button onClick={() => handleDelete(table.tableNumber)}
                    className="w-full py-1.5 rounded-lg text-xs font-semibold text-rose-400 transition-smooth hover:bg-rose-500/20 opacity-0 group-hover:opacity-100"
                    style={{ border: '1px solid rgba(244,63,94,0.3)' }}>
                    <Trash2 size={12} className="inline mr-1" /> Delete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Table Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}>
          <div className="w-full max-w-sm glass rounded-2xl p-6">
            <h3 className="text-white font-bold text-lg mb-5">Add New Table</h3>
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="text-sm text-slate-300 mb-1.5 block">Table Number</label>
                <input value={form.tableNumber} onChange={e => setForm(f => ({ ...f, tableNumber: e.target.value }))}
                  type="number" min="1" required placeholder="e.g. 5"
                  className="w-full px-4 py-2.5 rounded-xl text-white text-sm outline-none"
                  style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }} />
              </div>
              <div>
                <label className="text-sm text-slate-300 mb-1.5 block">Seating Capacity</label>
                <input value={form.capacity} onChange={e => setForm(f => ({ ...f, capacity: e.target.value }))}
                  type="number" min="1" max="20" required placeholder="e.g. 4"
                  className="w-full px-4 py-2.5 rounded-xl text-white text-sm outline-none"
                  style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }} />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 rounded-xl text-slate-300 text-sm font-medium transition-smooth hover:bg-white/5"
                  style={{ border: '1px solid rgba(255,255,255,0.1)' }}>Cancel</button>
                <button type="submit" disabled={saving}
                  className="flex-1 py-2.5 rounded-xl text-white text-sm font-semibold transition-smooth disabled:opacity-60"
                  style={{ background: 'linear-gradient(135deg, #6366f1, #3b82f6)' }}>
                  {saving ? 'Adding...' : 'Add Table'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
