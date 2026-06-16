import { useState, useEffect } from 'react';
import { Receipt, CreditCard, Smartphone, Banknote, X, Printer, Check } from 'lucide-react';
import { getOrders, generateBill, payBill, getReceipt } from '../api';

const PAYMENT_METHODS = [
  { id: 'CASH', label: 'Cash', icon: Banknote, color: '#10b981' },
  { id: 'CARD', label: 'Card', icon: CreditCard, color: '#3b82f6' },
  { id: 'MOBILE_MONEY', label: 'Mobile Money', icon: Smartphone, color: '#f59e0b' },
];

export default function BillingView() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [bill, setBill] = useState(null);
  const [discount, setDiscount] = useState('');
  const [isPercentage, setIsPercentage] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [receipt, setReceipt] = useState('');
  const [saving, setSaving] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [step, setStep] = useState('select'); // select | bill | pay | receipt

  const load = () => {
    setLoading(true);
    getOrders()
      .then(data => setOrders(data.filter(o => o.status !== 'CANCELLED')))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleSelectOrder = (order) => {
    setSelectedOrder(order);
    setBill(order.bill || null);
    setStep(order.bill ? (order.bill.status === 'PAID' ? 'receipt' : 'pay') : 'bill');
    setDiscount('');
    setIsPercentage(false);
    setReceipt('');
  };

  const handleGenerateBill = async () => {
    setSaving(true);
    try {
      const d = discount ? parseFloat(discount) : null;
      const b = await generateBill(selectedOrder.id, d, isPercentage);
      setBill(b);
      setStep('pay');
      load();
    } catch (e) { setError(e.message); }
    finally { setSaving(false); }
  };

  const handlePayBill = async () => {
    setSaving(true);
    try {
      const b = await payBill(bill.id, paymentMethod);
      setBill(b);
      const r = await getReceipt(bill.id);
      setReceipt(r);
      setStep('receipt');
      load();
    } catch (e) { setError(e.message); }
    finally { setSaving(false); }
  };

  const handleViewReceipt = async (billId) => {
    try {
      const r = await getReceipt(billId);
      setReceipt(r);
      setShowReceipt(true);
    } catch (e) { setError(e.message); }
  };

  const paidOrders = orders.filter(o => o.bill?.status === 'PAID');
  const pendingOrders = orders.filter(o => !o.bill || o.bill.status !== 'PAID');

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-3 rounded-xl text-rose-300 text-sm flex items-center justify-between"
          style={{ background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.2)' }}>
          ⚠️ {error}
          <button onClick={() => setError('')} className="text-rose-400 hover:text-rose-200 ml-2">✕</button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="glass rounded-xl p-4">
          <div className="text-xs text-slate-400 mb-1">Pending Bills</div>
          <div className="text-2xl font-bold text-amber-400">{pendingOrders.length}</div>
        </div>
        <div className="glass rounded-xl p-4">
          <div className="text-xs text-slate-400 mb-1">Paid Today</div>
          <div className="text-2xl font-bold text-emerald-400">{paidOrders.length}</div>
        </div>
        <div className="glass rounded-xl p-4">
          <div className="text-xs text-slate-400 mb-1">Revenue Today</div>
          <div className="text-2xl font-bold text-indigo-400">
            ${paidOrders.reduce((s, o) => s + parseFloat(o.bill?.finalAmount || 0), 0).toFixed(2)}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Orders list */}
        <div className="space-y-3">
          <h2 className="text-white font-semibold text-sm uppercase tracking-wider">Orders</h2>
          {loading ? (
            <div className="flex items-center justify-center py-10">
              <div className="w-6 h-6 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
            </div>
          ) : (
            <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
              {orders.sort((a, b) => b.id - a.id).map(order => {
                const paid = order.bill?.status === 'PAID';
                const hasBill = !!order.bill;
                const selected = selectedOrder?.id === order.id;
                return (
                  <button key={order.id} onClick={() => handleSelectOrder(order)}
                    className="w-full text-left p-4 rounded-xl transition-smooth"
                    style={{
                      background: selected ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.04)',
                      border: selected ? '1px solid rgba(99,102,241,0.5)' : '1px solid rgba(255,255,255,0.08)',
                    }}>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-white font-medium text-sm">Order #{order.id}</span>
                        <span className="ml-2 text-xs text-slate-400">{order.orderType}</span>
                        {order.tableNumber && <span className="ml-2 text-xs text-slate-500">· Table {order.tableNumber}</span>}
                      </div>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full`}
                        style={{
                          background: paid ? 'rgba(16,185,129,0.15)' : hasBill ? 'rgba(245,158,11,0.15)' : 'rgba(148,163,184,0.1)',
                          color: paid ? '#10b981' : hasBill ? '#f59e0b' : '#94a3b8',
                        }}>
                        {paid ? '✓ Paid' : hasBill ? 'Awaiting Payment' : 'No Bill'}
                      </span>
                    </div>
                    <div className="text-slate-400 text-xs mt-1">
                      {order.items?.length || 0} items · <span className="text-indigo-400 font-medium">${parseFloat(order.totalAmount || 0).toFixed(2)}</span>
                    </div>
                    {paid && (
                      <button onClick={(e) => { e.stopPropagation(); handleViewReceipt(order.bill.id); }}
                        className="mt-2 flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 transition-smooth">
                        <Printer size={12} /> View Receipt
                      </button>
                    )}
                  </button>
                );
              })}
              {orders.length === 0 && <div className="text-center text-slate-500 py-10">No orders found</div>}
            </div>
          )}
        </div>

        {/* Right: Bill panel */}
        <div>
          {!selectedOrder ? (
            <div className="glass rounded-2xl flex flex-col items-center justify-center text-center p-12 h-64">
              <Receipt size={40} className="text-slate-600 mb-3" />
              <p className="text-slate-400 text-sm">Select an order to manage billing</p>
            </div>
          ) : (
            <div className="glass rounded-2xl p-6 space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="text-white font-semibold">Order #{selectedOrder.id}</h3>
                <button onClick={() => setSelectedOrder(null)} className="text-slate-400 hover:text-white">
                  <X size={18} />
                </button>
              </div>

              {/* Items summary */}
              <div className="space-y-2">
                {(selectedOrder.items || []).map((item, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span className="text-slate-300">{item.menuItem?.name || item.name} × {item.quantity}</span>
                    <span className="text-slate-400">${(parseFloat(item.price || 0) * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 space-y-1" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Subtotal</span>
                  <span className="text-white">${parseFloat(selectedOrder.totalAmount || 0).toFixed(2)}</span>
                </div>
                {bill && (
                  <>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Tax (10%)</span>
                      <span className="text-amber-400">+${parseFloat(bill.taxAmount || 0).toFixed(2)}</span>
                    </div>
                    {parseFloat(bill.discountAmount || 0) > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Discount</span>
                        <span className="text-emerald-400">-${parseFloat(bill.discountAmount).toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-base font-bold pt-2 border-t" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
                      <span className="text-white">Total</span>
                      <span className="text-indigo-400">${parseFloat(bill.finalAmount || 0).toFixed(2)}</span>
                    </div>
                  </>
                )}
              </div>

              {/* Step: Generate Bill */}
              {step === 'bill' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-slate-300 mb-2">Discount (optional)</label>
                    <div className="flex gap-2">
                      <input type="number" value={discount} onChange={e => setDiscount(e.target.value)}
                        placeholder="0" min="0"
                        className="flex-1 px-3 py-2 rounded-xl text-white text-sm outline-none"
                        style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }} />
                      <button onClick={() => setIsPercentage(p => !p)}
                        className="px-3 py-2 rounded-xl text-sm font-medium transition-smooth"
                        style={{
                          background: isPercentage ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.06)',
                          color: isPercentage ? '#6366f1' : '#94a3b8',
                          border: `1px solid ${isPercentage ? 'rgba(99,102,241,0.4)' : 'rgba(255,255,255,0.1)'}`,
                        }}>
                        {isPercentage ? '% Percent' : '$ Flat'}
                      </button>
                    </div>
                  </div>
                  <button onClick={handleGenerateBill} disabled={saving}
                    className="w-full py-3 rounded-xl text-white font-semibold flex items-center justify-center gap-2 transition-smooth"
                    style={{ background: 'linear-gradient(135deg, #6366f1, #3b82f6)' }}>
                    {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Receipt size={16} /> Generate Bill</>}
                  </button>
                </div>
              )}

              {/* Step: Pay */}
              {step === 'pay' && bill && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-slate-300 mb-2">Payment Method</label>
                    <div className="grid grid-cols-3 gap-2">
                      {PAYMENT_METHODS.map(m => {
                        const Icon = m.icon;
                        return (
                          <button key={m.id} onClick={() => setPaymentMethod(m.id)}
                            className="flex flex-col items-center gap-1 p-3 rounded-xl transition-smooth"
                            style={{
                              background: paymentMethod === m.id ? `${m.color}22` : 'rgba(255,255,255,0.04)',
                              border: `1px solid ${paymentMethod === m.id ? m.color : 'rgba(255,255,255,0.08)'}`,
                            }}>
                            <Icon size={18} style={{ color: paymentMethod === m.id ? m.color : '#94a3b8' }} />
                            <span className="text-xs" style={{ color: paymentMethod === m.id ? m.color : '#94a3b8' }}>{m.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <button onClick={handlePayBill} disabled={saving}
                    className="w-full py-3 rounded-xl text-white font-semibold flex items-center justify-center gap-2 transition-smooth"
                    style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
                    {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Check size={16} /> Confirm Payment</>}
                  </button>
                </div>
              )}

              {/* Step: Receipt */}
              {step === 'receipt' && (
                <div className="space-y-3">
                  <div className="p-4 rounded-xl text-center" style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)' }}>
                    <Check size={24} className="text-emerald-400 mx-auto mb-1" />
                    <p className="text-emerald-400 font-medium text-sm">Payment Successful</p>
                  </div>
                  {receipt && (
                    <button onClick={() => setShowReceipt(true)}
                      className="w-full py-2.5 rounded-xl text-indigo-400 text-sm font-medium flex items-center justify-center gap-2 transition-smooth hover:bg-indigo-500/10"
                      style={{ border: '1px solid rgba(99,102,241,0.3)' }}>
                      <Printer size={16} /> View Receipt
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Receipt Modal */}
      {showReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)' }}>
          <div className="glass rounded-2xl w-full max-w-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold">Receipt</h3>
              <button onClick={() => setShowReceipt(false)} className="text-slate-400 hover:text-white"><X size={20} /></button>
            </div>
            <pre className="text-xs text-slate-300 overflow-x-auto whitespace-pre-wrap font-mono leading-relaxed p-4 rounded-xl"
              style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.06)' }}>
              {receipt}
            </pre>
            <button onClick={() => { window.print(); }}
              className="w-full mt-4 py-2.5 rounded-xl text-white text-sm font-medium flex items-center justify-center gap-2 transition-smooth"
              style={{ background: 'linear-gradient(135deg, #6366f1, #3b82f6)' }}>
              <Printer size={16} /> Print Receipt
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
