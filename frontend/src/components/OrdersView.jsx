import { useState, useEffect } from 'react';
import { Plus, ChevronDown, ChevronUp, X, Check, ShoppingBag } from 'lucide-react';
import { getOrders, placeOrder, updateOrderStatus, getAvailableMenuItems, getTables } from '../api';

const STATUS_FLOW = ['PENDING', 'PREPARING', 'READY', 'SERVED'];

const STATUS_STYLES = {
  PENDING:   { bg: 'rgba(245,158,11,0.15)',  border: 'rgba(245,158,11,0.3)',  text: '#f59e0b',  label: '⏳ Pending' },
  PREPARING: { bg: 'rgba(59,130,246,0.15)',  border: 'rgba(59,130,246,0.3)',  text: '#3b82f6',  label: '🍳 Preparing' },
  READY:     { bg: 'rgba(16,185,129,0.15)',  border: 'rgba(16,185,129,0.3)',  text: '#10b981',  label: '✅ Ready' },
  SERVED:    { bg: 'rgba(99,102,241,0.15)',  border: 'rgba(99,102,241,0.3)',  text: '#6366f1',  label: '🍽 Served' },
  CANCELLED: { bg: 'rgba(244,63,94,0.15)',   border: 'rgba(244,63,94,0.3)',   text: '#f43f5e',  label: '❌ Cancelled' },
};

export default function OrdersView() {
  const [orders, setOrders] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [filterStatus, setFilterStatus] = useState('ALL');

  // Order form
  const [orderType, setOrderType] = useState('TAKEAWAY');
  const [tableNumber, setTableNumber] = useState('');
  const [selectedItems, setSelectedItems] = useState([]);

  const load = () => {
    setLoading(true);
    Promise.all([getOrders(), getAvailableMenuItems(), getTables()])
      .then(([o, m, t]) => { setOrders(o); setMenuItems(m); setTables(t); })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openNew = () => {
    setOrderType('TAKEAWAY');
    setTableNumber('');
    setSelectedItems([]);
    setShowModal(true);
  };

  const addItem = (item) => {
    setSelectedItems(prev => {
      const exists = prev.find(i => i.menuItemId === item.id);
      if (exists) return prev.map(i => i.menuItemId === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { menuItemId: item.id, name: item.name, price: item.price, quantity: 1 }];
    });
  };

  const removeItem = (menuItemId) => {
    setSelectedItems(prev => prev.filter(i => i.menuItemId !== menuItemId));
  };

  const changeQty = (menuItemId, delta) => {
    setSelectedItems(prev => prev.map(i => i.menuItemId === menuItemId
      ? { ...i, quantity: Math.max(1, i.quantity + delta) } : i));
  };

  const totalAmount = selectedItems.reduce((s, i) => s + i.price * i.quantity, 0);

  const handlePlace = async () => {
    if (selectedItems.length === 0) return;
    if (orderType === 'DINE_IN' && !tableNumber) return;
    setSaving(true);
    try {
      const payload = {
        orderType,
        ...(orderType === 'DINE_IN' ? { tableNumber: parseInt(tableNumber) } : {}),
        items: selectedItems.map(i => ({ menuItemId: i.menuItemId, quantity: i.quantity })),
      };
      await placeOrder(payload);
      setShowModal(false);
      load();
    } catch (e) { setError(e.message); }
    finally { setSaving(false); }
  };

  const nextStatus = (status) => STATUS_FLOW[STATUS_FLOW.indexOf(status) + 1];

  const handleAdvance = async (id, status) => {
    const next = nextStatus(status);
    if (!next) return;
    try { await updateOrderStatus(id, next); load(); }
    catch (e) { setError(e.message); }
  };

  const filtered = filterStatus === 'ALL' ? orders : orders.filter(o => o.status === filterStatus);

  const countByStatus = (s) => orders.filter(o => o.status === s).length;

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-3 rounded-xl text-rose-300 text-sm" style={{ background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.2)' }}>
          ⚠️ {error}
          <button onClick={() => setError('')} className="ml-2 text-rose-400 hover:text-rose-200">✕</button>
        </div>
      )}

      {/* Status summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {STATUS_FLOW.map(s => {
          const st = STATUS_STYLES[s];
          return (
            <div key={s} className="glass rounded-xl p-4 cursor-pointer" style={{ borderLeft: `3px solid ${st.text}` }}
              onClick={() => setFilterStatus(filterStatus === s ? 'ALL' : s)}>
              <div className="text-xs text-slate-400 mb-1">{s}</div>
              <div className="text-2xl font-bold" style={{ color: st.text }}>{countByStatus(s)}</div>
            </div>
          );
        })}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2 flex-wrap">
          {['ALL', ...STATUS_FLOW].map(s => (
            <button key={s} onClick={() => setFilterStatus(s)}
              className="px-3 py-1 rounded-full text-xs font-semibold transition-smooth"
              style={{
                background: filterStatus === s ? (STATUS_STYLES[s]?.text || '#6366f1') : 'rgba(255,255,255,0.06)',
                color: filterStatus === s ? 'white' : '#94a3b8',
              }}>
              {s}
            </button>
          ))}
        </div>
        <button onClick={openNew}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-medium"
          style={{ background: 'linear-gradient(135deg, #6366f1, #3b82f6)' }}>
          <Plus size={16} /> New Order
        </button>
      </div>

      {/* Orders list */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.sort((a, b) => b.id - a.id).map(order => {
            const st = STATUS_STYLES[order.status] || STATUS_STYLES.PENDING;
            const next = nextStatus(order.status);
            const expanded = expandedId === order.id;
            return (
              <div key={order.id} className="glass rounded-2xl overflow-hidden transition-smooth">
                <div className="flex items-center gap-4 p-4 cursor-pointer" onClick={() => setExpandedId(expanded ? null : order.id)}>
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: st.bg, border: `1px solid ${st.border}` }}>
                    <ShoppingBag size={20} style={{ color: st.text }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-white font-semibold">Order #{order.id}</span>
                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold"
                        style={{ background: st.bg, color: st.text, border: `1px solid ${st.border}` }}>
                        {st.label}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-xs"
                        style={{ background: 'rgba(255,255,255,0.06)', color: '#94a3b8' }}>
                        {order.orderType}
                      </span>
                      {order.tableNumber && (
                        <span className="text-xs text-slate-400">Table {order.tableNumber}</span>
                      )}
                    </div>
                    <div className="text-slate-400 text-xs mt-0.5">
                      {order.items?.length || 0} items · ${parseFloat(order.totalAmount || 0).toFixed(2)}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {next && (
                      <button onClick={(e) => { e.stopPropagation(); handleAdvance(order.id, order.status); }}
                        className="px-3 py-1.5 rounded-xl text-xs font-medium text-white transition-smooth hover:opacity-80"
                        style={{ background: STATUS_STYLES[next]?.text }}>
                        → {next}
                      </button>
                    )}
                    {expanded ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
                  </div>
                </div>
                {expanded && order.items && (
                  <div className="px-4 pb-4 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                    <table className="w-full mt-3 text-sm">
                      <thead>
                        <tr className="text-slate-500 text-xs">
                          <th className="text-left py-1">Item</th>
                          <th className="text-right py-1">Qty</th>
                          <th className="text-right py-1">Price</th>
                          <th className="text-right py-1">Subtotal</th>
                        </tr>
                      </thead>
                      <tbody>
                        {order.items.map((item, i) => (
                          <tr key={i} className="text-slate-300 border-t" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
                            <td className="py-2">{item.menuItem?.name || item.name}</td>
                            <td className="text-right">{item.quantity}</td>
                            <td className="text-right">${parseFloat(item.price || 0).toFixed(2)}</td>
                            <td className="text-right font-medium">${(parseFloat(item.price || 0) * item.quantity).toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="border-t" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
                          <td colSpan="3" className="pt-2 text-slate-400 font-medium">Total</td>
                          <td className="pt-2 text-right text-indigo-400 font-bold">${parseFloat(order.totalAmount || 0).toFixed(2)}</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                )}
              </div>
            );
          })}
          {filtered.length === 0 && !loading && (
            <div className="text-center text-slate-500 py-16">No orders found</div>
          )}
        </div>
      )}

      {/* New Order Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}>
          <div className="glass rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
              <h3 className="text-white font-semibold text-lg">New Order</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white"><X size={20} /></button>
            </div>
            <div className="overflow-y-auto flex-1 p-6 space-y-5">
              {/* Order type */}
              <div className="flex gap-3">
                {['TAKEAWAY', 'DINE_IN'].map(type => (
                  <button key={type} onClick={() => setOrderType(type)}
                    className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-smooth"
                    style={{
                      background: orderType === type ? 'linear-gradient(135deg, #6366f1, #3b82f6)' : 'rgba(255,255,255,0.06)',
                      color: orderType === type ? 'white' : '#94a3b8',
                      border: `1px solid ${orderType === type ? 'transparent' : 'rgba(255,255,255,0.1)'}`,
                    }}>
                    {type === 'TAKEAWAY' ? '🛍 Takeaway' : '🍽 Dine-In'}
                  </button>
                ))}
              </div>

              {/* Table selector */}
              {orderType === 'DINE_IN' && (
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Select Table</label>
                  <div className="grid grid-cols-5 gap-2">
                    {tables.filter(t => !t.isOccupied).map(t => (
                      <button key={t.tableNumber} onClick={() => setTableNumber(t.tableNumber.toString())}
                        className="py-2.5 rounded-xl text-sm font-bold transition-smooth"
                        style={{
                          background: tableNumber === t.tableNumber.toString() ? 'rgba(16,185,129,0.3)' : 'rgba(16,185,129,0.08)',
                          border: `1px solid ${tableNumber === t.tableNumber.toString() ? '#10b981' : 'rgba(16,185,129,0.2)'}`,
                          color: '#10b981',
                        }}>
                        {t.tableNumber}
                      </button>
                    ))}
                    {tables.filter(t => !t.isOccupied).length === 0 && (
                      <p className="col-span-5 text-slate-500 text-sm">No vacant tables available</p>
                    )}
                  </div>
                </div>
              )}

              {/* Menu items */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Menu Items</label>
                <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-1">
                  {menuItems.map(item => (
                    <button key={item.id} onClick={() => addItem(item)}
                      className="text-left p-3 rounded-xl transition-smooth hover:bg-indigo-500/10"
                      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                      <div className="text-white text-xs font-medium truncate">{item.name}</div>
                      <div className="text-indigo-400 text-xs font-bold">${parseFloat(item.price).toFixed(2)}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Selected items */}
              {selectedItems.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Order Summary</label>
                  <div className="space-y-2">
                    {selectedItems.map(item => (
                      <div key={item.menuItemId} className="flex items-center gap-3 p-3 rounded-xl"
                        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                        <div className="flex-1 text-sm text-white truncate">{item.name}</div>
                        <div className="flex items-center gap-2">
                          <button onClick={() => changeQty(item.menuItemId, -1)}
                            className="w-6 h-6 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 flex items-center justify-center transition-smooth">−</button>
                          <span className="text-white text-sm w-5 text-center">{item.quantity}</span>
                          <button onClick={() => changeQty(item.menuItemId, 1)}
                            className="w-6 h-6 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 flex items-center justify-center transition-smooth">+</button>
                        </div>
                        <div className="text-indigo-400 text-sm font-bold w-16 text-right">
                          ${(item.price * item.quantity).toFixed(2)}
                        </div>
                        <button onClick={() => removeItem(item.menuItemId)}
                          className="text-slate-500 hover:text-rose-400 transition-smooth ml-1">
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between items-center mt-3 pt-3 border-t" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
                    <span className="text-slate-300 font-medium text-sm">Total</span>
                    <span className="text-indigo-400 font-bold text-lg">${totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3 p-6 border-t" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
              <button onClick={() => setShowModal(false)} className="flex-1 py-3 rounded-xl text-slate-400 hover:text-white text-sm" style={{ border: '1px solid rgba(255,255,255,0.1)' }}>Cancel</button>
              <button onClick={handlePlace} disabled={saving || selectedItems.length === 0}
                className="flex-1 py-3 rounded-xl text-white text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg, #6366f1, #3b82f6)' }}>
                {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Check size={16} /> Place Order</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
