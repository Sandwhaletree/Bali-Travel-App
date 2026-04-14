import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Trash2, Navigation, Download, Edit2, X,
  Clock, MapPin, AlertTriangle, Grid, List,
} from 'lucide-react';
import { useItineraryStore } from '../store/itineraryStore';
import { SANDY_BALI_ITINERARY } from '../data/baliItinerary';
import type { Attraction } from '../types';

// ── 分類設定 ──────────────────────────────────────────────────
const CAT: Record<string, { label: string; emoji: string; color: string; bg: string; border: string; bar: string }> = {
  hotel:    { label: '住宿',     emoji: '🏨', color: '#845ec2', bg: 'rgba(132,94,194,0.08)',  border: 'rgba(132,94,194,0.25)',  bar: '#845ec2' },
  food:     { label: '美食',     emoji: '🍽️', color: '#ff6f91', bg: 'rgba(255,111,145,0.08)', border: 'rgba(255,111,145,0.25)', bar: '#ff6f91' },
  beach:    { label: '海灘景點', emoji: '🏖️', color: '#4a9af5', bg: 'rgba(74,154,245,0.08)',  border: 'rgba(74,154,245,0.25)',  bar: '#4a9af5' },
  shopping: { label: '購物',     emoji: '🛍️', color: '#d65db1', bg: 'rgba(214,93,177,0.08)',  border: 'rgba(214,93,177,0.25)',  bar: '#d65db1' },
  activity: { label: '活動體驗', emoji: '💆', color: '#2ec4b6', bg: 'rgba(46,196,182,0.08)',  border: 'rgba(46,196,182,0.25)',  bar: '#2ec4b6' },
  temple:   { label: '寺廟',     emoji: '🛕', color: '#ff9671', bg: 'rgba(255,150,113,0.08)', border: 'rgba(255,150,113,0.25)', bar: '#ff9671' },
  nature:   { label: '自然',     emoji: '🌿', color: '#4dab6d', bg: 'rgba(77,171,109,0.08)',  border: 'rgba(77,171,109,0.25)',  bar: '#4dab6d' },
  culture:  { label: '文化',     emoji: '🎭', color: '#e8a020', bg: 'rgba(232,160,32,0.08)',  border: 'rgba(232,160,32,0.25)',  bar: '#e8a020' },
  transport:{ label: '交通',     emoji: '🚗', color: '#9b91a8', bg: 'rgba(155,145,168,0.08)', border: 'rgba(155,145,168,0.25)', bar: '#9b91a8' },
  other:    { label: '其他',     emoji: '📍', color: '#9b91a8', bg: 'rgba(155,145,168,0.08)', border: 'rgba(155,145,168,0.25)', bar: '#9b91a8' },
};

const DAY_GRADS = [
  'linear-gradient(135deg,#9b91a8,#b0a8b9)',   // 事前準備（灰）
  'linear-gradient(135deg,#845ec2,#d65db1)',   // DAY 1
  'linear-gradient(135deg,#d65db1,#ff6f91)',   // DAY 2
  'linear-gradient(135deg,#ff6f91,#ff9671)',   // DAY 3
  'linear-gradient(135deg,#ff9671,#ffc75f)',   // DAY 4
  'linear-gradient(135deg,#ffc75f,#f9f871)',   // DAY 5
];

// NOTE: 行程第一天（不含事前準備）
const TRIP_START = '2026-04-17';

// 計算顯示用的天數標籤
function getDayChip(date: string, allDates: string[]) {
  if (date < TRIP_START) {
    const { mmdd, wd } = fmtDay(date);
    return { top: '📋', mid: '事前準備', sub: mmdd + '(' + wd + ')', gradIdx: 0, isPrep: true };
  }
  const travelDays = allDates.filter(d => d >= TRIP_START);
  const dayNum = travelDays.indexOf(date) + 1;
  const { mmdd, wd } = fmtDay(date);
  return { top: `DAY ${dayNum}`, mid: mmdd, sub: `(${wd})`, gradIdx: dayNum, isPrep: false };
}

const EMPTY_FORM = {
  name: '', category: 'other' as Attraction['category'],
  visitTime: '', address: '', description: '',
};

function fmtDay(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00');
  return {
    mmdd: d.toLocaleDateString('zh-TW', { month: 'numeric', day: 'numeric' }),
    wd: d.toLocaleDateString('zh-TW', { weekday: 'short' }),
  };
}

function mapUrl(a: Attraction) {
  if (a.googleMapsUrl) return a.googleMapsUrl;
  return `https://www.google.com/maps/search/?api=1&query=${a.location.lat},${a.location.lng}`;
}

// ── 分類標籤元件 ───────────────────────────────────────────────
function CatBadge({ cat }: { cat: string }) {
  const c = CAT[cat] ?? CAT.other;
  return (
    <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0"
      style={{ background: c.bg, color: c.color, border: `1px solid ${c.border}` }}>
      {c.emoji} {c.label}
    </span>
  );
}

// ── 主元件 ────────────────────────────────────────────────────
export default function Explore() {
  const { itinerary, selectedDate, setSelectedDate,
    addAttraction, removeAttraction, updateAttraction, importItinerary } = useItineraryStore();

  const [tab, setTab] = useState<'timeline' | 'overview'>('timeline');
  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editTarget, setEditTarget] = useState<Attraction | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [showImport, setShowImport] = useState(false);
  const [delTarget, setDelTarget] = useState<Attraction | null>(null);
  const [catFilter, setCatFilter] = useState('all');

  const todayItems = itinerary.find(d => d.date === selectedDate)?.attractions ?? [];
  const allItems = itinerary.flatMap((d, i) =>
    d.attractions.map(a => ({ ...a, _date: d.date, _dayIdx: i })));

  // 統計
  const statsData = [
    { v: itinerary.length,                                        label: '天數', color: '#845ec2' },
    { v: allItems.length,                                         label: '行程', color: '#d65db1' },
    { v: allItems.filter(a => a.category === 'hotel').length,     label: '住宿', color: '#4a9af5' },
    { v: allItems.filter(a => a.category === 'food').length,      label: '美食', color: '#ff6f91' },
  ];

  const openAdd = () => {
    setIsEdit(false); setEditTarget(null); setForm({ ...EMPTY_FORM }); setShowModal(true);
  };
  const openEdit = (a: Attraction) => {
    setIsEdit(true); setEditTarget(a);
    setForm({ name: a.name, category: a.category, visitTime: a.visitTime ?? '', address: a.address ?? '', description: a.description ?? '' });
    setShowModal(true);
  };
  const handleSave = () => {
    if (!form.name.trim()) return;
    const base: Attraction = {
      id: editTarget?.id ?? Date.now().toString(),
      name: form.name.trim(),
      category: form.category,
      location: editTarget?.location ?? { lat: -8.4095, lng: 115.1889 },
      description: form.description,
      address: form.address,
      visitTime: form.visitTime || undefined,
      googleMapsUrl: `https://www.google.com/maps/search/${encodeURIComponent(form.name + ' ' + form.address + ' Bali')}`,
    };
    isEdit ? updateAttraction(base, selectedDate) : addAttraction(base, selectedDate);
    setShowModal(false);
  };

  const overviewFiltered = catFilter === 'all' ? allItems : allItems.filter(a => a.category === catFilter);

  return (
    <div className="min-h-screen bg-app pb-28">
      {/* ── Header ── */}
      <div className="px-4 pt-12 pb-3">
        <div className="flex items-center gap-2 mb-1">
          <h1 className="text-2xl font-bold font-[Outfit]" style={{ color: '#1a1528' }}>🗺️ 行程規劃</h1>
          <div className="gradient-stripe h-[2px] flex-1 rounded-full opacity-40" />
          <button onClick={() => setShowImport(true)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-medium"
            style={{ background: 'linear-gradient(135deg,#845ec2,#d65db1)', color: '#fff', boxShadow: '0 2px 8px rgba(132,94,194,0.35)' }}>
            <Download size={13} /> 匯入行程
          </button>
        </div>
      </div>

      {/* ── Tab 切換 ── */}
      <div className="px-4 flex gap-2 mb-4">
        {[{ k: 'timeline', l: '🗓 行程時間軸' }, { k: 'overview', l: '🗂 全覽規劃' }].map(t => (
          <button key={t.k} onClick={() => setTab(t.k as 'timeline' | 'overview')}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-all"
            style={tab === t.k
              ? { background: 'linear-gradient(135deg,#845ec2,#d65db1)', color: '#fff', boxShadow: '0 3px 12px rgba(132,94,194,0.3)' }
              : { background: '#fff', color: '#5a5065', border: '1px solid rgba(132,94,194,0.15)' }}>
            {t.l}
          </button>
        ))}
      </div>

      {/* ══════════ TAB 1: 行程時間軸 ══════════ */}
      {tab === 'timeline' && (
        <div className="px-4">
          {/* 日期選擇器 */}
          <div className="flex gap-2 overflow-x-auto pb-2 mb-4" style={{ scrollbarWidth: 'none' }}>
            {itinerary.map((day) => {
              const allDates = itinerary.map(d => d.date);
              const chip = getDayChip(day.date, allDates);
              const isAct = day.date === selectedDate;
              return (
                <button key={day.date} onClick={() => setSelectedDate(day.date)}
                  className="flex-shrink-0 flex flex-col items-center px-4 py-2.5 rounded-2xl min-w-[72px] transition-all"
                  style={isAct
                    ? { background: DAY_GRADS[Math.min(chip.gradIdx, DAY_GRADS.length - 1)], color: '#fff', boxShadow: '0 4px 14px rgba(132,94,194,0.3)' }
                    : { background: '#fff', color: '#5a5065', border: '1px solid rgba(132,94,194,0.15)' }}>
                  <span className="text-xs font-bold">{chip.top}</span>
                  <span className="text-[11px] mt-0.5">{chip.mid}</span>
                  <span className="text-[10px] opacity-75">{chip.sub}</span>
                </button>
              );
            })}
          </div>

          {/* 當天 header + 新增鈕 */}
          {(() => {
            const allDates = itinerary.map(d => d.date);
            const chip = getDayChip(selectedDate, allDates);
            const { mmdd, wd } = fmtDay(selectedDate);
            return (
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-xs font-medium" style={{ color: '#9b91a8' }}>
                    {chip.isPrep ? '📋 事前準備' : `${chip.top} · ${mmdd} (${wd})`}
                  </p>
                  <p className="text-base font-semibold font-[Outfit]" style={{ color: '#1a1528' }}>
                    {todayItems.length} 個行程安排
                  </p>
                </div>
                <button onClick={openAdd}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium"
                  style={{ background: 'linear-gradient(135deg,#845ec2,#d65db1)', color: '#fff', boxShadow: '0 2px 8px rgba(132,94,194,0.3)' }}>
                  <Plus size={15} /> 新增
                </button>
              </div>
            );
          })()}

          {/* 行程卡片列表 */}
          <div className="space-y-3">
            {todayItems.length === 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="text-center py-14 rounded-2xl"
                style={{ background: '#fff', border: '1px solid rgba(132,94,194,0.1)' }}>
                <p className="text-3xl mb-2">📅</p>
                <p className="font-medium" style={{ color: '#5a5065' }}>今日還沒有行程</p>
                <p className="text-sm mt-1" style={{ color: '#9b91a8' }}>點擊「新增」加入景點、住宿或美食</p>
              </motion.div>
            )}

            {todayItems.map((att, i) => {
              const c = CAT[att.category] ?? CAT.other;
              return (
                <motion.div key={att.id}
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.04 * i }}
                  className="rounded-2xl overflow-hidden relative bg-white"
                  style={{ border: `1px solid ${c.border}`, boxShadow: `0 2px 12px ${c.bg}` }}>
                  {/* Left color bar */}
                  <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl" style={{ background: c.bar }} />
                  <div className="p-4 pl-5">
                    {/* 上排：分類標籤 + 時間 + 操作按鈕 */}
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <CatBadge cat={att.category} />
                      {att.visitTime && (
                        <span className="text-xs flex items-center gap-1" style={{ color: '#9b91a8' }}>
                          <Clock size={11} /> {att.visitTime}
                        </span>
                      )}
                      <div className="ml-auto flex items-center gap-1.5">
                        <a href={mapUrl(att)} target="_blank" rel="noreferrer"
                          className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium transition-all hover:scale-105"
                          style={{ background: 'rgba(132,94,194,0.07)', color: '#845ec2', border: '1px solid rgba(132,94,194,0.18)' }}>
                          <Navigation size={11} /> 地圖
                        </a>
                        <button onClick={() => openEdit(att)}
                          className="p-1.5 rounded-lg transition-all hover:scale-110"
                          style={{ background: 'rgba(255,199,95,0.15)', color: '#a07000' }}>
                          <Edit2 size={13} />
                        </button>
                        <button onClick={() => setDelTarget(att)}
                          className="p-1.5 rounded-lg transition-all hover:scale-110"
                          style={{ background: 'rgba(255,111,145,0.1)', color: '#ff6f91' }}>
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                    {/* 名稱 */}
                    <p className="font-semibold font-[Outfit] text-base" style={{ color: '#1a1528' }}>{att.name}</p>
                    {/* 地址 */}
                    {att.address && (
                      <p className="text-xs flex items-center gap-1 mt-1" style={{ color: '#9b91a8' }}>
                        <MapPin size={11} /> {att.address}
                      </p>
                    )}
                    {/* 備註 */}
                    {att.description && (
                      <p className="text-sm mt-1.5" style={{ color: '#5a5065' }}>{att.description}</p>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* ══════════ TAB 2: 全覽規劃 ══════════ */}
      {tab === 'overview' && (
        <div className="px-4">
          {/* 統計列 */}
          <div className="grid grid-cols-4 gap-2 mb-4">
            {statsData.map(s => (
              <div key={s.label} className="rounded-xl p-3 text-center bg-white"
                style={{ border: '1px solid rgba(132,94,194,0.12)' }}>
                <p className="font-bold text-xl font-[Outfit]" style={{ color: s.color }}>{s.v}</p>
                <p className="text-xs" style={{ color: '#9b91a8' }}>{s.label}</p>
              </div>
            ))}
          </div>

          {/* 分類篩選 */}
          <div className="flex gap-2 overflow-x-auto pb-2 mb-4" style={{ scrollbarWidth: 'none' }}>
            <button onClick={() => setCatFilter('all')}
              className="flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-medium transition-all"
              style={catFilter === 'all'
                ? { background: 'linear-gradient(135deg,#845ec2,#d65db1)', color: '#fff' }
                : { background: '#fff', color: '#5a5065', border: '1px solid rgba(132,94,194,0.15)' }}>
              全部 ({allItems.length})
            </button>
            {Object.entries(CAT).map(([id, c]) => {
              const cnt = allItems.filter(a => a.category === id).length;
              if (cnt === 0) return null;
              return (
                <button key={id} onClick={() => setCatFilter(id)}
                  className="flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-medium transition-all"
                  style={catFilter === id
                    ? { background: c.bar, color: '#fff' }
                    : { background: '#fff', color: c.color, border: `1px solid ${c.border}` }}>
                  {c.emoji} {c.label} ({cnt})
                </button>
              );
            })}
          </div>

          {/* 依天分組列表 */}
          <div className="space-y-4">
            {itinerary.map((day, idx) => {
              const items = catFilter === 'all'
                ? day.attractions
                : day.attractions.filter(a => a.category === catFilter);
              if (items.length === 0) return null;
              const { mmdd, wd } = fmtDay(day.date);
              return (
                <motion.div key={day.date} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * idx }}
                  className="rounded-2xl overflow-hidden"
                  style={{ border: '1px solid rgba(132,94,194,0.12)', boxShadow: '0 2px 10px rgba(132,94,194,0.06)' }}>
                  {/* Day header - gradient */}
                  <div className="px-4 py-3 flex items-center"
                    style={{ background: DAY_GRADS[Math.min(getDayChip(day.date, itinerary.map(d => d.date)).gradIdx, DAY_GRADS.length - 1)] }}>
                    {(() => {
                      const chip = getDayChip(day.date, itinerary.map(d => d.date));
                      return (
                        <>
                          <span className="text-sm font-bold text-white">{chip.isPrep ? '📋 事前準備' : chip.top}</span>
                          <span className="text-xs text-white opacity-90 ml-2">{chip.mid} {chip.sub}</span>
                        </>
                      );
                    })()}
                    <span className="ml-auto text-xs text-white opacity-80">{items.length} 個</span>
                    {/* 切換到該天的時間軸 */}
                    <button onClick={() => { setSelectedDate(day.date); setTab('timeline'); }}
                      className="ml-2 text-xs text-white opacity-80 underline underline-offset-2 hover:opacity-100">
                      查看詳情 →
                    </button>
                  </div>
                  {/* 景點列表 */}
                  <div className="divide-y bg-white" style={{ borderColor: 'rgba(132,94,194,0.08)' }}>
                    {items.map(att => {
                      const c = CAT[att.category] ?? CAT.other;
                      return (
                        <div key={att.id} className="px-4 py-3 flex items-center gap-3">
                          <span className="text-base flex-shrink-0">{c.emoji}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate" style={{ color: '#1a1528' }}>{att.name}</p>
                            {att.address && (
                              <p className="text-xs truncate" style={{ color: '#9b91a8' }}>{att.address}</p>
                            )}
                          </div>
                          <CatBadge cat={att.category} />
                          {/* Google Maps 跳轉 */}
                          <a href={mapUrl(att)} target="_blank" rel="noreferrer"
                            className="p-1.5 rounded-lg flex-shrink-0 transition-all hover:scale-110"
                            style={{ background: 'rgba(132,94,194,0.08)', color: '#845ec2' }}
                            title="在 Google Maps 查看">
                            <Navigation size={14} />
                          </a>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              );
            })}

            {overviewFiltered.length === 0 && (
              <div className="text-center py-14 rounded-2xl bg-white"
                style={{ border: '1px solid rgba(132,94,194,0.1)' }}>
                <p className="text-2xl mb-2">🔍</p>
                <p style={{ color: '#9b91a8' }}>此分類目前沒有行程</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══════════ Modal: 新增 / 編輯 ══════════ */}
      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
            style={{ background: 'rgba(26,21,40,0.55)', backdropFilter: 'blur(6px)' }}
            onClick={() => setShowModal(false)}>
            <motion.div
              initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-md rounded-t-3xl sm:rounded-3xl p-6"
              style={{ background: '#fff', boxShadow: '0 -4px 40px rgba(132,94,194,0.2)' }}>
              <div className="gradient-stripe h-[3px] w-full rounded-full mb-4" />
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold font-[Outfit] text-lg" style={{ color: '#1a1528' }}>
                  {isEdit ? '✏️ 編輯行程' : '➕ 新增行程'}
                </h2>
                <button onClick={() => setShowModal(false)} className="p-2 rounded-xl"
                  style={{ background: '#f8f7ff', color: '#9b91a8' }}>
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-3">
                {/* 分類選擇 */}
                <div>
                  <p className="text-xs font-medium mb-2" style={{ color: '#5a5065' }}>分類標籤</p>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(CAT).map(([id, c]) => (
                      <button key={id} onClick={() => setForm(f => ({ ...f, category: id as Attraction['category'] }))}
                        className="px-2.5 py-1 rounded-lg text-xs font-medium transition-all"
                        style={form.category === id
                          ? { background: c.bar, color: '#fff', boxShadow: `0 2px 8px ${c.bg}` }
                          : { background: c.bg, color: c.color, border: `1px solid ${c.border}` }}>
                        {c.emoji} {c.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 景點名稱 */}
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="* 名稱（必填）"
                  className="w-full rounded-xl px-4 py-3 text-sm outline-none"
                  style={{ background: '#f8f7ff', border: '1px solid rgba(132,94,194,0.2)', color: '#1a1528' }} />

                {/* 時間 */}
                <input value={form.visitTime} onChange={e => setForm(f => ({ ...f, visitTime: e.target.value }))}
                  placeholder="時間（例：09:00 或 下午）"
                  className="w-full rounded-xl px-4 py-3 text-sm outline-none"
                  style={{ background: '#f8f7ff', border: '1px solid rgba(132,94,194,0.2)', color: '#1a1528' }} />

                {/* 地址 */}
                <input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                  placeholder="地址（選填）"
                  className="w-full rounded-xl px-4 py-3 text-sm outline-none"
                  style={{ background: '#f8f7ff', border: '1px solid rgba(132,94,194,0.2)', color: '#1a1528' }} />

                {/* 備註 */}
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="備註說明（選填）" rows={2}
                  className="w-full rounded-xl px-4 py-3 text-sm outline-none resize-none"
                  style={{ background: '#f8f7ff', border: '1px solid rgba(132,94,194,0.2)', color: '#1a1528' }} />

                {/* 儲存按鈕 */}
                <button onClick={handleSave}
                  className="w-full py-3 rounded-xl font-semibold transition-all hover:scale-[1.01]"
                  style={{ background: 'linear-gradient(135deg,#845ec2,#d65db1)', color: '#fff', boxShadow: '0 4px 16px rgba(132,94,194,0.4)' }}>
                  {isEdit ? '儲存修改' : '加入行程'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══════════ Modal: 刪除確認 ══════════ */}
      <AnimatePresence>
        {delTarget && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center px-6"
            style={{ background: 'rgba(26,21,40,0.55)', backdropFilter: 'blur(6px)' }}
            onClick={() => setDelTarget(null)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-xs rounded-3xl p-6 bg-white"
              style={{ boxShadow: '0 12px 40px rgba(255,111,145,0.2)' }}>
              <div className="text-center mb-4">
                <div className="w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center"
                  style={{ background: 'rgba(255,111,145,0.12)' }}>
                  <Trash2 size={22} style={{ color: '#ff6f91' }} />
                </div>
                <p className="font-semibold font-[Outfit]" style={{ color: '#1a1528' }}>確定要刪除？</p>
                <p className="text-sm mt-1" style={{ color: '#5a5065' }}>「{delTarget.name}」</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setDelTarget(null)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-medium"
                  style={{ background: '#f8f7ff', color: '#5a5065', border: '1px solid rgba(132,94,194,0.15)' }}>
                  取消
                </button>
                <button onClick={() => { removeAttraction(delTarget.id, selectedDate); setDelTarget(null); }}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
                  style={{ background: 'linear-gradient(135deg,#c34a36,#ff8066)', color: '#fff' }}>
                  確認刪除
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ══════════ Modal: 匯入確認 ══════════ */}
      <AnimatePresence>
        {showImport && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center px-6"
            style={{ background: 'rgba(26,21,40,0.6)', backdropFilter: 'blur(8px)' }}
            onClick={() => setShowImport(false)}>
            <motion.div initial={{ scale: 0.88, y: 16 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.88, y: 16 }}
              onClick={e => e.stopPropagation()}
              className="rounded-3xl p-6 w-full max-w-sm bg-white"
              style={{ boxShadow: '0 12px 40px rgba(132,94,194,0.2)' }}>
              <div className="gradient-stripe h-[3px] w-full rounded-full mb-4" />
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(132,94,194,0.1)' }}>
                  <AlertTriangle size={20} style={{ color: '#845ec2' }} />
                </div>
                <div>
                  <h3 className="font-bold font-[Outfit] text-base" style={{ color: '#1a1528' }}>匯入 Sandy 峇里島行程</h3>
                  <p className="text-xs mt-0.5" style={{ color: '#9b91a8' }}>4/17 ～ 4/21 · 5天 · 20 個行程</p>
                </div>
              </div>
              {/* 預覽 */}
              <div className="rounded-xl p-3 mb-4 space-y-1.5"
                style={{ background: '#f8f7ff', border: '1px solid rgba(132,94,194,0.12)' }}>
                {SANDY_BALI_ITINERARY.map((day, i) => {
                  const { mmdd, wd } = fmtDay(day.date);
                  return (
                    <div key={day.date} className="flex items-start gap-2">
                      <span className="text-xs font-bold w-24 flex-shrink-0" style={{ color: '#845ec2' }}>
                        DAY {i + 1} {mmdd}({wd})
                      </span>
                      <span className="text-xs leading-relaxed" style={{ color: '#5a5065' }}>
                        {day.attractions.slice(0, 3).map(a => a.name).join('・')}
                        {day.attractions.length > 3 && ` +${day.attractions.length - 3}`}
                      </span>
                    </div>
                  );
                })}
              </div>
              <p className="text-xs mb-4" style={{ color: '#9b91a8' }}>
                ⚠️ 匯入後將<span style={{ color: '#c34a36', fontWeight: 600 }}>覆蓋</span>現有行程，景點標記同步更新。
              </p>
              <div className="flex gap-2">
                <button onClick={() => setShowImport(false)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-medium"
                  style={{ background: '#f8f7ff', color: '#5a5065', border: '1px solid rgba(132,94,194,0.15)' }}>
                  取消
                </button>
                <button onClick={() => { importItinerary(SANDY_BALI_ITINERARY); setShowImport(false); }}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold hover:scale-[1.01] transition-all"
                  style={{ background: 'linear-gradient(135deg,#845ec2,#d65db1)', color: '#fff', boxShadow: '0 4px 15px rgba(132,94,194,0.4)' }}>
                  📂 確認匯入
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
