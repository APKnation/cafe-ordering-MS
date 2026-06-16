import { useState, useEffect } from 'react';
import { 
  getMenuItems, addMenuItem, updateMenuItem, deleteMenuItem 
} from '../api';
import { Plus, Pencil, Trash2, Coffee, UtensilsCrossed, Search, CheckCircle, XCircle, Loader2 } from 'lucide-react';

const CATEGORIES = ['All', 'Coffee', 'Tea', 'Snacks', 'Desserts', 'Meals', 'Beverages'];

export default function MenuView({ isAdmin }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({ name: '', category: '', price: '', available: true, description: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

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
    setForm({ name: '', category: 'Coffee', price: '', available: true, description: '' });
    setShowModal(true);
  };

  const openEdit = (item) => {
    setEditItem(item);
    setForm({ name: item.name, category: item.category, price: item.price, available: item.available, description: item.description || '' });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form, price: parseFloat(form.price) };
      if (editItem) {
        await updateMenuItem(editItem.id, payload);
      } else {
        await addMenuItem(payload);
      }
      setShowModal(false);
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this menu item?')) return;
    try {
      await deleteMenuItem(id);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const filtered = items.filter(item => {
    const matchCat = category === 'All' || item.category === category;
    const matchSearch = item.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const cardColors = {
    Coffee: '#f59e0b', Tea: '#10b981', Snacks: '#f97316',
    Desserts: '#ec4899', Meals: '#3b82f6', Beverages: '#8b5cf6'
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-4 justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Menu Management</h2>
          <p className="text-slate-400 text-sm mt-1">{items.length} items total</p>
        </div>
        {isAdmin && (
          <button onClick={openAdd}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-white text-sm transition-smooth hover:scale-105 active:scale-95"
            style={{ background: 'linear-gradient(135deg, #6366f1, #3b82f6)' }}>
            <Plus size={18} /> Add Item
          </button>
        )}
      </div>

      {error && <div className="p-3 rounded-xl text-rose-300 text-sm" style={{ background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.2)' }}>{error}</div>}

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl flex-1 min-w-48"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <Search size={16} className="text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search items..."
            className="bg-transparent text-white text-sm outline-none flex-1 placeholder-slate-500" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-smooth ${category === cat ? 'text-white' : 'text-slate-400 hover:text-white'}`}
              style={category === cat
                ? { background: 'linear-gradient(135deg, #6366f1, #3b82f6)' }
                : { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={32} className="animate-spin text-indigo-400" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-slate-500">
          <UtensilsCrossed size={48} className="mx-auto mb-4 opacity-30" />
          <p>No menu items found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map(item => (
            <div key={item.id} className="glass rounded-2xl p-5 transition-smooth hover:scale-[1.02] group relative"
              style={{ border: `1px solid ${item.available ? 'rgba(16,185,129,0.2)' : 'rgba(244,63,94,0.2)'}` }}>
              {/* Category pill */}
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full"
                  style={{ background: `${cardColors[item.category] || '#6366f1'}22`, color: cardColors[item.category] || '#6366f1' }}>
                  {item.category}
                </span>
                <div className="flex items-center gap-1">
                  {item.available
                    ? <CheckCircle size={14} className="text-emerald-400" />
                    : <XCircle size={14} className="text-rose-400" />}
                  <span className={`text-xs ${item.available ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {item.available ? 'Available' : 'Unavailable'}
                  </span>
                </div>
              </div>

              {/* Icon */}
              <div className="w-12 h-12 rounded-xl mb-3 flex items-center justify-center"
                style={{ background: `${cardColors[item.category] || '#6366f1'}22` }}>
                <Coffee size={22} style={{ color: cardColors[item.category] || '#6366f1' }} />
              </div>

              <h3 className="text-white font-semibold text-sm mb-1 leading-tight">{item.name}</h3>
              {item.description && <p className="text-slate-500 text-xs mb-3 leading-relaxed line-clamp-2">{item.description}</p>}
              
              <div className="flex items-center justify-between mt-auto">
                <span className="text-lg font-bold" style={{ color: cardColors[item.category] || '#6366f1' }}>
                  ${parseFloat(item.price).toFixed(2)}
                </span>
                {isAdmin && (
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-smooth">
                    <button onClick={() => openEdit(item)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-blue-400 hover:bg-blue-400/20 transition-smooth">
                      <Pencil size={14} />
                    </button>
                    <button onClick={() => handleDelete(item.id)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-rose-400 hover:bg-rose-400/20 transition-smooth">
                      <Trash2 size={14} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}>
          <div className="w-full max-w-md glass rounded-2xl p-6 shadow-2xl">
            <h3 className="text-white font-bold text-lg mb-5">{editItem ? 'Edit Menu Item' : 'Add Menu Item'}</h3>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="text-sm text-slate-300 mb-1.5 block">Name</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  required placeholder="e.g. Cappuccino"
                  className="w-full px-4 py-2.5 rounded-xl text-white text-sm outline-none"
                  style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm text-slate-300 mb-1.5 block">Category</label>
                  <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl text-white text-sm outline-none"
                    style={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)' }}>
                    {CATEGORIES.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm text-slate-300 mb-1.5 block">Price ($)</label>
                  <input value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                    required type="number" step="0.01" min="0" placeholder="0.00"
                    className="w-full px-4 py-2.5 rounded-xl text-white text-sm outline-none"
                    style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }} />
                </div>
              </div>
              <div>
                <label className="text-sm text-slate-300 mb-1.5 block">Description</label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  rows={2} placeholder="Optional description..."
                  className="w-full px-4 py-2.5 rounded-xl text-white text-sm outline-none resize-none"
                  style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }} />
              </div>
              <div className="flex items-center gap-3">
                <button type="button" onClick={() => setForm(f => ({ ...f, available: !f.available }))}
                  className={`w-12 h-6 rounded-full transition-smooth relative ${form.available ? 'bg-emerald-500' : 'bg-slate-600'}`}>
                  <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-smooth ${form.available ? 'left-6' : 'left-0.5'}`} />
                </button>
                <span className="text-sm text-slate-300">Available for ordering</span>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 rounded-xl text-slate-300 text-sm font-medium transition-smooth hover:bg-white/5"
                  style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
                  Cancel
                </button>
                <button type="submit" disabled={saving}
                  className="flex-1 py-2.5 rounded-xl text-white text-sm font-semibold transition-smooth hover:scale-[1.02] disabled:opacity-60"
                  style={{ background: 'linear-gradient(135deg, #6366f1, #3b82f6)' }}>
                  {saving ? 'Saving...' : editItem ? 'Save Changes' : 'Add Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
