import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Map, UtensilsCrossed, MessageCircle, Wallet, Thermometer, Wind } from 'lucide-react';
import { useItineraryStore } from '../store/itineraryStore';

// NOTE: 首頁 Dashboard - 淺色主題，強調色保留 Generic Gradient

const quickActions = [
  {
    to: '/explore', icon: Map, label: '行程規劃', desc: '景點 & 地圖',
    gradient: 'linear-gradient(135deg, #845ec2 0%, #d65db1 100%)',
    border: 'rgba(132,94,194,0.3)',
    shadow: '0 6px 24px rgba(132,94,194,0.25)',
  },
  {
    to: '/food', icon: UtensilsCrossed, label: '美食探索', desc: '餐廳 & 推薦',
    gradient: 'linear-gradient(135deg, #d65db1 0%, #ff6f91 100%)',
    border: 'rgba(214,93,177,0.3)',
    shadow: '0 6px 24px rgba(214,93,177,0.25)',
  },
  {
    to: '/language', icon: MessageCircle, label: '語言助理', desc: '翻譯 & 溝通',
    gradient: 'linear-gradient(135deg, #ff6f91 0%, #ff9671 100%)',
    border: 'rgba(255,111,145,0.3)',
    shadow: '0 6px 24px rgba(255,111,145,0.25)',
  },
  {
    to: '/expense', icon: Wallet, label: '旅遊分帳', desc: '記帳 & 結算',
    gradient: 'linear-gradient(135deg, #ff9671 0%, #ffc75f 100%)',
    border: 'rgba(255,150,113,0.3)',
    shadow: '0 6px 24px rgba(255,150,113,0.25)',
  },
];

export default function Dashboard() {
  const { itinerary, selectedDate } = useItineraryStore();
  const todayItinerary = itinerary.find(d => d.date === selectedDate);
  const totalAttractions = itinerary.reduce((acc, d) => acc + d.attractions.length, 0);

  return (
    <div className="min-h-screen px-4 pb-4 bg-app">
      {/* ======== 頂部英雄區 ======== */}
      <div className="relative pt-12 pb-6 overflow-hidden">
        {/* 裝飾光球（淺色版） */}
        <div className="absolute -top-10 -right-10 w-56 h-56 rounded-full blur-3xl opacity-10"
          style={{ background: 'radial-gradient(circle, #845ec2, #d65db1)' }} />
        <div className="absolute top-20 -left-10 w-40 h-40 rounded-full blur-3xl opacity-8"
          style={{ background: 'radial-gradient(circle, #ff6f91, #ff9671)' }} />

        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <p className="text-sm font-[Inter]" style={{ color: '#9b91a8' }}>歡迎來到</p>
          <h1 className="text-4xl font-bold font-[Outfit] mt-1">
            <span className="text-gradient">🌴 峇里島</span>
          </h1>
          <p className="text-sm mt-1 font-[Inter]" style={{ color: '#9b91a8' }}>
            Bali, Indonesia · {new Date().toLocaleDateString('zh-TW', { month: 'long', day: 'numeric', weekday: 'short' })}
          </p>
        </motion.div>

        {/* 漸層裝飾線 */}
        <div className="gradient-stripe h-[2px] w-24 mt-4 rounded-full opacity-70" />

        {/* 天氣卡 */}
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="glass-card rounded-2xl p-4 mt-5 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <span className="text-3xl">☀️</span>
            <div>
              <p className="font-semibold font-[Outfit]" style={{ color: '#1a1528' }}>峇里島今日天氣</p>
              <p className="text-xs" style={{ color: '#9b91a8' }}>熱帶島嶼氣候</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex items-center gap-1 text-sm">
              <Thermometer size={14} style={{ color: '#ff9671' }} />
              <span style={{ color: '#5a5065' }}>28-32°C</span>
            </div>
            <div className="flex items-center gap-1 text-sm">
              <Wind size={14} style={{ color: '#845ec2' }} />
              <span style={{ color: '#5a5065' }}>微風</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ======== 統計卡片列 ======== */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: '行程景點', value: totalAttractions, icon: '🗺️', color: '#845ec2' },
          { label: '今日行程', value: todayItinerary?.attractions.length ?? 0, icon: '📍', color: '#ff6f91' },
          { label: '旅遊天數', value: itinerary.length, icon: '📅', color: '#d97706' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 * i + 0.3 }}
            className="glass-card rounded-2xl p-3 text-center"
          >
            <div className="text-xl mb-1">{stat.icon}</div>
            <div className="text-2xl font-bold font-[Outfit]" style={{ color: stat.color }}>{stat.value}</div>
            <div className="text-xs mt-1 font-[Inter]" style={{ color: '#9b91a8' }}>{stat.label}</div>
          </motion.div>
        ))}
      </div>

      {/* ======== 快速入口 ======== */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <h2 className="text-lg font-semibold font-[Outfit]" style={{ color: '#1a1528' }}>快速功能</h2>
          <div className="gradient-stripe h-[2px] flex-1 rounded-full opacity-40" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          {quickActions.map((action, i) => (
            <Link to={action.to} key={action.to}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * i + 0.5 }}
                whileHover={{ scale: 1.04, y: -2 }}
                whileTap={{ scale: 0.97 }}
                className="rounded-2xl p-5 cursor-pointer relative overflow-hidden"
                style={{
                  background: action.gradient,
                  border: `1px solid ${action.border}`,
                  boxShadow: action.shadow,
                }}
              >
                {/* 右上角裝飾圓 */}
                <div className="absolute -top-4 -right-4 w-16 h-16 rounded-full"
                  style={{ background: 'rgba(255,255,255,0.15)' }} />
                <action.icon size={28} color="#ffffff" className="mb-3 relative z-10" />
                <h3 className="font-bold font-[Outfit] text-base relative z-10 text-white">
                  {action.label}
                </h3>
                <p className="text-xs mt-1 relative z-10" style={{ color: 'rgba(255,255,255,0.85)' }}>
                  {action.desc}
                </p>
              </motion.div>
            </Link>
          ))}
        </div>
      </div>

      {/* ======== 今日行程預覽 ======== */}
      {todayItinerary && todayItinerary.attractions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}
          className="mb-4"
        >
          <div className="flex items-center gap-2 mb-3">
            <h2 className="font-semibold font-[Outfit] text-lg" style={{ color: '#1a1528' }}>今日行程</h2>
            <div className="gradient-stripe h-[2px] flex-1 rounded-full opacity-40" />
          </div>
          <div className="space-y-2">
            {todayItinerary.attractions.slice(0, 3).map((att, i) => (
              <div key={att.id} className="glass-card rounded-xl p-3 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold font-[Outfit] flex-shrink-0"
                  style={{
                    background: `linear-gradient(135deg, #845ec2, #d65db1)`,
                    color: '#ffffff',
                  }}>
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: '#1a1528' }}>{att.name}</p>
                  <p className="text-xs truncate" style={{ color: '#9b91a8' }}>{att.address || att.category}</p>
                </div>
              </div>
            ))}
            {todayItinerary.attractions.length > 3 && (
              <Link to="/explore">
                <p className="text-center text-sm py-2" style={{ color: '#845ec2' }}>
                  查看全部 {todayItinerary.attractions.length} 個景點 →
                </p>
              </Link>
            )}
          </div>
        </motion.div>
      )}

      {/* ======== AI 提示卡 ======== */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}
        className="rounded-2xl p-4 relative overflow-hidden"
        style={{
          background: 'rgba(132, 94, 194, 0.06)',
          border: '1px solid rgba(132, 94, 194, 0.18)',
        }}
      >
        {/* 彩色左側條 */}
        <div className="gradient-stripe absolute left-0 top-0 bottom-0 w-[3px] rounded-l-2xl" />
        <p className="font-semibold text-xs mb-1 pl-1" style={{ color: '#845ec2' }}>💡 AI 旅遊小提示</p>
        <p className="text-xs pl-1" style={{ color: '#5a5065' }}>
          點擊右下角 ✨ 按鈕，用中文告訴 AI「加烏布猴林到行程」，立刻幫你安排！
        </p>
      </motion.div>
    </div>
  );
}
