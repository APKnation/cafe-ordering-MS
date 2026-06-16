import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Search, ToggleLeft, ToggleRight, X, Check } from 'lucide-react';
import { getMenuItems, addMenuItem, updateMenuItem, deleteMenuItem } from '../api';

const CATEGORIES = ['ALL', 'COFFEE', 'TEA', 'SNACKS', 'DESSERTS', 'DRINKS', 'FOOD'];

const categoryColors = {
  COFFEE: '#f59e0b', TEA: '#10b981', SNACKS: '#f43f5e',
  DESSERTS: '#c084fc', DRINKS: '#3b82f6', FOOD: '#fb923c', ALL: '#6366f1',
};

const StatBadge = ({ label, value, color }) => (
  <div className="glass rounded-xl p-4 flex flex-col gap-1">
    <div className="text-xs text-slate-400">{label}</div>
    <div className="text-2xl font-bold" style={{ color }}>{value}</div>
  </div>
);

const Modal = ({ title, onClose, children }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
    style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}>
    <div className="glass rounded-2xl w-full max-w-md p-6 shadow-2xl">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-white font-semibold text-lg">{title}</h3>
        <button onClick={onClose} className="text-slate-400 hover:text-white transition-smooth">
          <X size={20} />
        </button>
      </div>
      {children}
    </div>
  </div>
);

const InputField = ({ label, ...props }) => (
  <div>
    <label className="block text-sm font-medium text-slate-300 mb-1.5">{label}</label>
    <input {...props}
      className="w-full px-3 py-2.5 rounded-xl text-white text-sm outline-none transition-smooth"
      style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
      onFocus={e => e.target.style.borderColor = 'rgba(99,102,241,0.7)'}
      onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
    />
  </div>
);

export default function MenuView({ isAdmin }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('ALL');
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', description: '', price: '', category: 'FOOD', isAvailable: true });

  const load = () => {
    setLoading(true);
    getMenuItems()
      .then(setItems)
      .catch(() => setError('Failed to load menu'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => {
    setEditItem(null);
    setForm({ name: '', description: '', price: '', category: 'FOOD', isAvailable: true });
    setShowModal(true);
  };

  const openEdit = (item) => {
    setEditItem(item);
    setForm({ name: item.name, description: item.description || '', price: item.price, category: item.category, isAvailable: item.isAvailable !== false });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.price) return;
    setSaving(true);
    try {
      const payload = { ...form, price: parseFloat(form.price) };
      if (editItem) await updateMenuItem(editItem.id, payload);
      else await addMenuItem(payload);
      setShowModal(false);
      load();
    } catch (e) { setError(e.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this menu item?')) return;
    try { await deleteMenuItem(id); load(); }
    catch (e) { setError(e.message); }
  };

  const filtered = items.filter(i =>
    (category === 'ALL' || i.category === category) &&
    i.name.toLowerCase().includes(search.toLowerCase())
  );

  const available = items.filter(i => i.isAvailable !== false).length;

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-3 rounded-xl text-rose-300 text-sm" style={{ background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.2)' }}>
          ⚠️ {error}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <StatBadge label="Total Items" value={items.length} color="#6366f1" />
        <StatBadge label="Available" value={available} color="#10b981" />
        <StatBadge label="Unavailable" value={items.length - available} color="#f43f5e" />
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-48">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search menu items..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl text-white text-sm outline-none"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }} />
        </div>
        {isAdmin && (
          <button onClick={openAdd}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-medium transition-smooth hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #6366f1, #3b82f6)' }}>
            <Plus size={16} /> Add Item
          </button>
        )}
      </div>

      {/* Category tabs */}
      <div className="flex gap-2 flex-wrap">
        {CATEGORIES.map(cat => (
          <button key={cat} onClick={() => setCategory(cat)}
            className="px-3 py-1.5 rounded-full text-xs font-semibold transition-smooth"
            style={{
              background: category === cat ? categoryColors[cat] : 'rgba(255,255,255,0.06)',
              color: category === cat ? 'white' : '#94a3b8',
              border: `1px solid ${category === cat ? categoryColors[cat] : 'rgba(255,255,255,0.08)'}`,
            }}>
            {cat}
          </button>
        ))}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map(item => (
            <div key={item.id} className="glass rounded-2xl p-5 group hover:bg-white/5 transition-smooth">
              <div className="flex items-start justify-between mb-3">
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold"
                  style={{ background: `${categoryColors[item.category] || '#6366f1'}22`, color: categoryColors[item.category] || '#6366f1' }}>
                  {item.category}
                </span>
                <div className="flex items-center gap-1">
                  {item.isAvailable !== false
                    ? <ToggleRight size={22} className="text-emerald-400" />
                    : <ToggleLeft size={22} className="text-slate-500" />}
                </div>
              </div>
              <h3 className="text-white font-semibold text-base mb-1">{item.name}</h3>
              {item.description && <p className="text-slate-400 text-xs mb-3 line-clamp-2">{item.description}</p>}
              <div className="flex items-center justify-between mt-3">
                <span className="text-indigo-400 font-bold text-lg">${parseFloat(item.price).toFixed(2)}</span>
                {isAdmin && (
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-smooth">
                    <button onClick={() => openEdit(item)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 transition-smooth">
                      <Pencil size={14} />
                    </button>
                    <button onClick={() => handleDelete(item.id)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-smooth">
                      <Trash2 size={14} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
          {filtered.length === 0 && !loading && (
            <div className="col-span-full text-center text-slate-500 py-16">
              No menu items found
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <Modal title={editItem ? 'Edit Menu Item' : 'Add Menu Item'} onClose={() => setShowModal(false)}>
          <div className="space-y-4">
            <InputField label="Item Name *" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Cappuccino" />
            <InputField label="Description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Short description" />
            <InputField label="Price *" type="number" step="0.01" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} placeholder="0.00" />
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Category</label>
              <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-xl text-white text-sm outline-none"
                style={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)' }}>
                {CATEGORIES.filter(c => c !== 'ALL').map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <label className="flex items-center gap-3 cursor-pointer">
              <div onClick={() => setForm(f => ({ ...f, isAvailable: !f.isAvailable }))}
                className="relative w-11 h-6 rounded-full transition-smooth cursor-pointer"
                style={{ background: form.isAvailable ? '#10b981' : '#374151' }}>
                <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${form.isAvailable ? 'left-5' : 'left-0.5'}`} />
              </div>
              <span className="text-sm text-slate-300">Available</span>
            </label>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 rounded-xl text-slate-400 hover:text-white text-sm transition-smooth" style={{ border: '1px solid rgba(255,255,255,0.1)' }}>Cancel</button>
              <button onClick={handleSave} disabled={saving}
                className="flex-1 py-2.5 rounded-xl text-white text-sm font-semibold flex items-center justify-center gap-2 transition-smooth"
                style={{ background: 'linear-gradient(135deg, #6366f1, #3b82f6)' }}>
                {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Check size={14} /> Save</>}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
