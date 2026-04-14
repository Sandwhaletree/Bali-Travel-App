import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, ArrowRightLeft, QrCode, X } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useExpenseStore } from '../store/expenseStore';
import type { Expense, MemberName } from '../types';

// NOTE: 旅遊分帳頁 - ffc75f/f9f871 金黃主題，Classy 按鈕色

const CATEGORIES = [
  { id: 'food',      label: '餐飲', emoji: '🍽️' },
  { id: 'transport', label: '交通', emoji: '🚗' },
  { id: 'admission', label: '票券', emoji: '🎫' },
  { id: 'hotel',     label: '住宿', emoji: '🏨' },
  { id: 'shopping',  label: '購物', emoji: '🛍️' },
  { id: 'other',     label: '其他', emoji: '📦' },
];

const CURRENCY_OPTIONS = [
  { value: 'IDR', label: 'IDR' },
  { value: 'TWD', label: 'TWD' },
  { value: 'USD', label: 'USD' },
];

// 每個分類對應漸層色段（Generic Gradient 均勻分配）
const catColors: Record<string, string> = {
  food:      '#c493ff',
  transport: '#d65db1',
  admission: '#ff6f91',
  hotel:     '#ff9671',
  shopping:  '#ffc75f',
  other:     '#b0a8b9',
};

export default function Expense() {
  const { expenses, members, addExpense, removeExpense, getBalances, getTotalByMember } = useExpenseStore();
  const [showAddForm, setShowAddForm] = useState(false);
  const [showQR, setShowQR] = useState(false);

  const [form, setForm] = useState({
    title: '',
    amount: '',
    currency: 'IDR' as Expense['currency'],
    paidBy: 'Sandy' as MemberName,
    splitType: 'equal' as Expense['splitType'],
    participants: ['Sandy', 'Partner'] as MemberName[],
    category: 'food' as Expense['category'],
  });

  const totals = getTotalByMember();

  const handleAdd = () => {
    if (!form.title || !form.amount) return;
    const expense: Expense = {
      id: Date.now().toString(),
      title: form.title,
      amount: parseFloat(form.amount),
      currency: form.currency,
      paidBy: form.paidBy,
      splitType: form.splitType,
      participants: form.participants,
      date: new Date().toISOString(),
      category: form.category,
    };
    addExpense(expense);
    setForm({ title: '', amount: '', currency: 'IDR', paidBy: 'Sandy', splitType: 'equal', participants: ['Sandy', 'Partner'], category: 'food' });
    setShowAddForm(false);
  };

  const formatAmount = (amount: number, currency: string) => {
    if (currency === 'IDR') return `Rp ${amount.toLocaleString()}`;
    if (currency === 'TWD') return `NT$ ${amount.toLocaleString()}`;
    return `$${amount.toFixed(2)}`;
  };

  const shareUrl = `${window.location.origin}?shared=${encodeURIComponent(JSON.stringify({
    expenses: expenses.slice(0, 20),
    generated: new Date().toISOString(),
  }))}`;

  const inputStyle = {
    background: '#f8f7ff',
    border: '1px solid rgba(132, 147, 255, 0.2)',
    color: '#1a1528',
    outline: 'none',
  };

  const cardStyle = {
    background: '#ffffff',
    border: '1px solid rgba(132, 94, 194, 0.12)',
    boxShadow: '0 2px 12px rgba(132,94,194,0.07)',
  };

  return (
    <div className="px-4 pb-4 bg-app min-h-screen">
      {/* 標題 */}
      <div className="pt-12 pb-4 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold font-[Outfit]" style={{ color: '#1a1528' }}>💰 旅遊分帳</h1>
            <div className="gradient-stripe h-[2px] w-16 rounded-full opacity-60" />
          </div>
          <p className="text-sm mt-1" style={{ color: '#b0a8b9' }}>Sandy & Partner</p>
        </div>
        <button onClick={() => setShowQR(true)}
          className="p-3 rounded-xl transition-all hover:scale-110"
          style={{ background: 'rgba(132,94,194,0.15)', border: '1px solid rgba(196,147,255,0.25)', color: '#c493ff' }}>
          <QrCode size={20} />
        </button>
      </div>

      {/* 餘額摘要卡 */}
      <div className="rounded-2xl p-4 mb-5" style={cardStyle}>
        {/* 漸層頂線 */}
        <div className="gradient-stripe h-[2px] w-full rounded-full opacity-70 mb-4" />
        <h2 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: '#b0a8b9' }}>結算摘要</h2>
        <div className="grid grid-cols-2 gap-3 mb-4">
          {members.map((member, i) => (
            <div key={member} className="rounded-xl p-3"
              style={{
                background: i === 0
                  ? 'rgba(132,94,194,0.15)'
                  : 'rgba(214,93,177,0.15)',
                border: i === 0
                  ? '1px solid rgba(132,94,194,0.3)'
                  : '1px solid rgba(214,93,177,0.3)',
              }}>
              <p className="text-xs mb-1" style={{ color: '#b0a8b9' }}>{member} 已付</p>
              <p className="font-bold font-[Outfit] text-lg"
                style={{ color: i === 0 ? '#c493ff' : '#ff8ec0' }}>
                Rp {(totals[member] || 0).toLocaleString()}
              </p>
            </div>
          ))}
        </div>

        {/* 轉帳建議 */}
        <div className="border-t pt-3" style={{ borderColor: 'rgba(196,147,255,0.15)' }}>
          <p className="text-xs mb-2" style={{ color: '#b0a8b9' }}>💸 轉帳建議</p>
          {(() => {
            const bals = getBalances();
            const sandyBal = bals['Sandy'] || 0;
            const partnerBal = bals['Partner'] || 0;

            if (Math.abs(sandyBal) < 1 && Math.abs(partnerBal) < 1) {
              return (
                <p className="text-sm" style={{ color: '#c493ff' }}>✅ 已平衡，無需轉帳！</p>
              );
            }
            const debtor = sandyBal < 0 ? 'Sandy' : 'Partner';
            const creditor = sandyBal < 0 ? 'Partner' : 'Sandy';
            const amount = Math.abs(sandyBal < 0 ? sandyBal : partnerBal);
            return (
              <div className="flex items-center gap-2 rounded-xl p-3"
                style={{ background: 'rgba(195,74,54,0.15)', border: '1px solid rgba(255,128,102,0.3)' }}>
                <ArrowRightLeft size={14} style={{ color: '#ff8066' }} />
                <p className="text-sm" style={{ color: '#1a1528' }}>
                  {debtor} 需轉
                  <span className="font-bold mx-1" style={{ color: '#ff8066' }}>Rp {amount.toLocaleString()}</span>
                  給 {creditor}
                </p>
              </div>
            );
          })()}
        </div>
      </div>

      {/* 新增按鈕 */}
      <button
        onClick={() => setShowAddForm(!showAddForm)}
        className="w-full mb-4 py-3 rounded-2xl font-semibold font-[Outfit] flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99]"
        style={{
          background: 'linear-gradient(135deg, #845ec2 0%, #d65db1 50%, #ff6f91 100%)',
          color: '#ffffff',
          boxShadow: '0 4px 20px rgba(132,94,194,0.4)',
        }}>
        <Plus size={20} /> 新增消費
      </button>

      {/* 新增表單 */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mb-4">
            <div className="rounded-2xl p-4 space-y-3" style={cardStyle}>
              <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                placeholder="消費名稱（例：晚餐）"
                className="w-full rounded-xl px-4 py-3 text-sm placeholder-[#b0a8b9]"
                style={inputStyle} />

              {/* 金額 + 幣別 */}
              <div className="flex gap-2">
                <input value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))}
                  placeholder="金額" type="number"
                  className="flex-1 rounded-xl px-4 py-3 text-sm placeholder-[#b0a8b9]"
                  style={inputStyle} />
                <select value={form.currency} onChange={e => setForm(p => ({ ...p, currency: e.target.value as Expense['currency'] }))}
                  className="rounded-xl px-3 py-3 text-sm"
                  style={{ ...inputStyle, background: '#ffffff' }}>
                  {CURRENCY_OPTIONS.map(c => <option key={c.value} value={c.value} className="bg-gray-900">{c.label}</option>)}
                </select>
              </div>

              {/* 分類 */}
              <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
                {CATEGORIES.map(cat => (
                  <button key={cat.id}
                    onClick={() => setForm(p => ({ ...p, category: cat.id as Expense['category'] }))}
                    className="flex-shrink-0 px-3 py-1.5 rounded-xl text-xs transition-all"
                    style={form.category === cat.id ? {
                      background: `${catColors[cat.id]}25`,
                      border: `1px solid ${catColors[cat.id]}80`,
                      color: catColors[cat.id],
                    } : {
                      background: 'rgba(75,68,83,0.3)',
                      border: '1px solid rgba(176,168,185,0.15)',
                      color: '#b0a8b9',
                    }}>
                    {cat.emoji} {cat.label}
                  </button>
                ))}
              </div>

              {/* 付款人 */}
              <div>
                <p className="text-xs mb-2" style={{ color: '#b0a8b9' }}>誰付錢？</p>
                <div className="flex gap-2">
                  {members.map((m, i) => (
                    <button key={m} onClick={() => setForm(p => ({ ...p, paidBy: m }))}
                      className="flex-1 py-2 rounded-xl text-sm transition-all"
                      style={form.paidBy === m ? {
                        background: i === 0 ? 'rgba(132,94,194,0.25)' : 'rgba(214,93,177,0.25)',
                        border: i === 0 ? '1px solid rgba(132,94,194,0.5)' : '1px solid rgba(214,93,177,0.5)',
                        color: i === 0 ? '#c493ff' : '#ff8ec0',
                      } : {
                        background: 'rgba(75,68,83,0.3)',
                        border: '1px solid rgba(176,168,185,0.15)',
                        color: '#b0a8b9',
                      }}>
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              {/* 分帳方式 */}
              <div>
                <p className="text-xs mb-2" style={{ color: '#b0a8b9' }}>分帳方式</p>
                <div className="flex gap-2">
                  {[{ value: 'equal', label: '🤝 AA 均分' }, { value: 'solo', label: '💳 自費' }].map(opt => (
                    <button key={opt.value} onClick={() => setForm(p => ({ ...p, splitType: opt.value as Expense['splitType'] }))}
                      className="flex-1 py-2 rounded-xl text-sm transition-all"
                      style={form.splitType === opt.value ? {
                        background: 'rgba(255,199,95,0.2)',
                        border: '1px solid rgba(255,199,95,0.5)',
                        color: '#ffc75f',
                      } : {
                        background: 'rgba(75,68,83,0.3)',
                        border: '1px solid rgba(176,168,185,0.15)',
                        color: '#b0a8b9',
                      }}>
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <button onClick={handleAdd}
                className="w-full py-3 rounded-xl font-medium transition-all"
                style={{ background: 'linear-gradient(135deg, #c34a36, #ff8066)', color: '#ffffff' }}>
                確認新增
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 消費記錄 */}
      <div className="flex items-center gap-2 mb-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#b0a8b9' }}>消費記錄</h2>
        <div className="gradient-stripe h-[1px] flex-1 rounded-full opacity-40" />
      </div>
      {expenses.length === 0 && (
        <div className="text-center py-8 rounded-2xl" style={cardStyle}>
          <p className="text-4xl mb-2">🧾</p>
          <p className="text-sm" style={{ color: '#9b91a8' }}>尚無消費記錄</p>
        </div>
      )}
      <div className="space-y-2">
        {[...expenses].reverse().map(exp => {
          const cat = CATEGORIES.find(c => c.id === exp.category);
          const color = catColors[exp.category] || '#b0a8b9';
          return (
            <motion.div key={exp.id}
              initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
              className="rounded-xl p-3 flex items-center gap-3 relative overflow-hidden"
              style={{ background: '#ffffff', border: '1px solid rgba(132,94,194,0.12)', boxShadow: '0 1px 6px rgba(132,94,194,0.06)' }}>
              {/* 左側彩色細條 */}
              <div className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-xl"
                style={{ background: color }} />
              <span className="text-xl ml-1">{cat?.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium" style={{ color: '#1a1528' }}>{exp.title}</p>
                <p className="text-xs" style={{ color: '#9b91a8' }}>
                  {exp.paidBy} 付 · {exp.splitType === 'equal' ? 'AA均分' : '自費'} · {new Date(exp.date).toLocaleDateString('zh-TW')}
                </p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="font-semibold text-sm" style={{ color }}>{formatAmount(exp.amount, exp.currency)}</p>
              </div>
              <button onClick={() => removeExpense(exp.id)}
                className="p-1.5 rounded-lg transition-all hover:scale-110"
                style={{ color: '#ff8066' }}>
                <Trash2 size={14} />
              </button>
            </motion.div>
          );
        })}
      </div>

      {/* QR Code Modal */}
      <AnimatePresence>
        {showQR && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center px-6"
            style={{ background: 'rgba(18,13,30,0.85)', backdropFilter: 'blur(10px)' }}
            onClick={() => setShowQR(false)}>
            <motion.div initial={{ scale: 0.85, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.85, y: 20 }}
              className="rounded-3xl p-6 w-full max-w-sm" style={{ background: '#ffffff', border: '1px solid rgba(132,94,194,0.15)', boxShadow: '0 8px 32px rgba(132,94,194,0.15)' }}
              onClick={e => e.stopPropagation()}>
              {/* 漸層頂線 */}
              <div className="gradient-stripe h-[3px] w-full rounded-full mb-5" />
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-bold font-[Outfit] text-lg" style={{ color: '#1a1528' }}>📱 QR 碼分享</h3>
                <button onClick={() => setShowQR(false)}
                  className="p-2 rounded-lg transition-all hover:scale-110" style={{ color: '#b0a8b9' }}>
                  <X size={18} />
                </button>
              </div>
              <div className="bg-white rounded-2xl p-4 flex items-center justify-center mb-4">
                <QRCodeSVG value={shareUrl} size={200} />
              </div>
              <p className="text-xs text-center" style={{ color: '#b0a8b9' }}>掃描 QR 碼，夥伴可查看分帳記錄</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
