import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Star, MapPin, Navigation, Plus, BookmarkCheck, DollarSign } from 'lucide-react';
import { useItineraryStore } from '../store/itineraryStore';
import type { FoodPlace } from '../types';

// NOTE: 美食探索頁 - d65db1/ff6f91 粉紅主題，每道菜有漸層卡片

const BALI_FOODS: FoodPlace[] = [
  {
    id: 'nasi-goreng', name: 'Nasi Goreng', category: 'local',
    location: { lat: -8.4095, lng: 115.1889 }, priceRange: '$',
    rating: 4.8, mustTry: '峇里島炒飯，加荷包蛋必點',
    googleMapsUrl: 'https://www.google.com/maps/search/nasi+goreng+bali', address: '各地攤販均有',
  },
  {
    id: 'babi-guling', name: 'Babi Guling', category: 'local',
    location: { lat: -8.5069, lng: 115.2625 }, priceRange: '$$',
    rating: 4.9, mustTry: '峇里島烤乳豬，Ibu Oka 最有名',
    googleMapsUrl: 'https://www.google.com/maps/search/babi+guling+ibu+oka+ubud', address: '烏布 Ibu Oka',
  },
  {
    id: 'bebek-betutu', name: 'Bebek Betutu', category: 'local',
    location: { lat: -8.4095, lng: 115.1889 }, priceRange: '$$',
    rating: 4.7, mustTry: '香料燉鴨，慢烹8小時',
    googleMapsUrl: 'https://www.google.com/maps/search/bebek+betutu+bali', address: '全島餐廳',
  },
  {
    id: 'jimbaran-seafood', name: 'Jimbaran 海鮮', category: 'seafood',
    location: { lat: -8.7997, lng: 115.1604 }, priceRange: '$$$',
    rating: 4.8, mustTry: '夕陽沙灘海鮮大餐，必選龍蝦',
    googleMapsUrl: 'https://www.google.com/maps/search/jimbaran+seafood+bali', address: 'Jimbaran 海灘',
  },
  {
    id: 'plecing-kangkung', name: 'Plecing Kangkung', category: 'local',
    location: { lat: -8.4095, lng: 115.1889 }, priceRange: '$',
    rating: 4.5, mustTry: '峇里島涼拌空心菜，辣醬超下飯',
    googleMapsUrl: 'https://www.google.com/maps/search/plecing+kangkung+bali', address: '各地路邊攤',
  },
  {
    id: 'kopi-bali', name: 'Kopi Bali ☕', category: 'cafe',
    location: { lat: -8.5069, lng: 115.2625 }, priceRange: '$',
    rating: 4.6, mustTry: '峇里島黑咖啡，沖泡直喝不過濾',
    googleMapsUrl: 'https://www.google.com/maps/search/kopi+bali+ubud', address: '烏布咖啡館',
  },
  {
    id: 'dadar-gulung', name: 'Dadar Gulung', category: 'dessert',
    location: { lat: -8.4095, lng: 115.1889 }, priceRange: '$',
    rating: 4.4, mustTry: '斑斕椰絲卷，街頭點心必吃',
    googleMapsUrl: 'https://www.google.com/maps/search/dadar+gulung+bali', address: '傳統市場',
  },
  {
    id: 'satay-lilit', name: 'Satay Lilit', category: 'local',
    location: { lat: -8.4095, lng: 115.1889 }, priceRange: '$',
    rating: 4.7, mustTry: '峇里島香茅串燒，魚肉混椰絲',
    googleMapsUrl: 'https://www.google.com/maps/search/satay+lilit+bali', address: '各地餐廳',
  },
];

const CATEGORIES = [
  { id: 'all', label: '全部', emoji: '🍽️' },
  { id: 'local', label: '當地料理', emoji: '🇮🇩' },
  { id: 'seafood', label: '海鮮', emoji: '🦞' },
  { id: 'cafe', label: '咖啡廳', emoji: '☕' },
  { id: 'dessert', label: '甜點', emoji: '🍡' },
];

// NOTE: 每個分類用不同漸層 - 對應 Generic Gradient 六色
const categoryGrad: Record<string, { bg: string; border: string; text: string }> = {
  local:   { bg: 'rgba(132,94,194,0.15)', border: 'rgba(132,94,194,0.35)', text: '#c493ff' },
  seafood: { bg: 'rgba(214,93,177,0.15)', border: 'rgba(214,93,177,0.35)', text: '#ff8ec0' },
  cafe:    { bg: 'rgba(255,150,113,0.15)', border: 'rgba(255,150,113,0.35)', text: '#ffc75f' },
  dessert: { bg: 'rgba(255,199,95,0.12)', border: 'rgba(255,199,95,0.3)', text: '#ffc75f' },
};

const priceMap = { '$': '平價', '$$': '中等', '$$$': '高級' };

export default function Food() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const { savedFoods, addFoodPlace, removeFoodPlace } = useItineraryStore();

  const filtered = BALI_FOODS.filter(f => {
    const matchCat = activeCategory === 'all' || f.category === activeCategory;
    const matchSearch = f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (f.mustTry || '').includes(searchQuery);
    return matchCat && matchSearch;
  });

  const isSaved = (id: string) => savedFoods.some(f => f.id === id);

  const filterGrads = [
    'linear-gradient(135deg, #845ec2, #4b4453)',
    'linear-gradient(135deg, #845ec2, #d65db1)',
    'linear-gradient(135deg, #d65db1, #ff6f91)',
    'linear-gradient(135deg, #ff9671, #ffc75f)',
    'linear-gradient(135deg, #ffc75f, #f9f871)',
  ];

  return (
    <div className="px-4 pb-4 bg-app min-h-screen">
      {/* 標題 */}
      <div className="pt-12 pb-4">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold font-[Outfit]" style={{ color: '#fefedf' }}>🍜 美食探索</h1>
          <div className="gradient-stripe h-[2px] flex-1 rounded-full opacity-50" />
        </div>
        <p className="text-sm mt-1" style={{ color: '#b0a8b9' }}>巴厘島必吃美食清單</p>
      </div>

      {/* 搜尋列 */}
      <div className="relative mb-4">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: '#b0a8b9' }} />
        <input
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="搜尋美食..."
          className="w-full rounded-2xl pl-10 pr-4 py-3 text-sm placeholder-[#b0a8b9] outline-none"
          style={{
            background: 'rgba(132, 94, 194, 0.1)',
            border: '1px solid rgba(196, 147, 255, 0.2)',
            color: '#fefedf',
          }}
        />
      </div>

      {/* 分類篩選 */}
      <div className="flex gap-2 overflow-x-auto pb-3 mb-4" style={{ scrollbarWidth: 'none' }}>
        {CATEGORIES.map((cat, i) => {
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className="flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all"
              style={isActive ? {
                background: filterGrads[i],
                color: '#fefedf',
                boxShadow: '0 4px 15px rgba(132,94,194,0.4)',
              } : {
                background: 'rgba(75,68,83,0.35)',
                color: '#b0a8b9',
                border: '1px solid rgba(176,168,185,0.15)',
              }}
            >
              <span>{cat.emoji}</span> {cat.label}
            </button>
          );
        })}
      </div>

      {/* 已收藏提示 */}
      {savedFoods.length > 0 && (
        <div className="rounded-2xl p-3 mb-4 flex items-center gap-2"
          style={{ background: 'rgba(132,94,194,0.1)', border: '1px solid rgba(196,147,255,0.2)' }}>
          <BookmarkCheck size={16} style={{ color: '#c493ff' }} />
          <p className="text-xs" style={{ color: '#d5cabd' }}>已收藏 <span style={{ color: '#c493ff' }}>{savedFoods.length}</span> 道美食</p>
        </div>
      )}

      {/* 美食卡片 */}
      <div className="space-y-3">
        {filtered.map((food, i) => {
          const cg = categoryGrad[food.category] || categoryGrad.local;
          const saved = isSaved(food.id);
          return (
            <motion.div
              key={food.id}
              initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 * i }}
              className="rounded-2xl overflow-hidden relative"
              style={{ background: cg.bg, border: `1px solid ${cg.border}` }}
            >
              {/* 左側彩色邊條 */}
              <div className="absolute left-0 top-0 bottom-0 w-[3px] gradient-stripe-45 rounded-l-2xl" />

              <div className="p-4 pl-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold font-[Outfit] text-base" style={{ color: '#fefedf' }}>{food.name}</h3>
                      <span className="text-xs px-2 py-0.5 rounded-full"
                        style={{ background: cg.bg, border: `1px solid ${cg.border}`, color: cg.text }}>
                        {CATEGORIES.find(c => c.id === food.category)?.emoji}
                      </span>
                    </div>
                    <p className="text-sm" style={{ color: '#d5cabd' }}>{food.mustTry}</p>

                    <div className="flex items-center gap-3 mt-2 flex-wrap">
                      {food.rating && (
                        <div className="flex items-center gap-1">
                          <Star size={12} style={{ color: '#ffc75f', fill: '#ffc75f' }} />
                          <span className="text-xs" style={{ color: '#d5cabd' }}>{food.rating}</span>
                        </div>
                      )}
                      {food.priceRange && (
                        <div className="flex items-center gap-1">
                          <DollarSign size={12} style={{ color: '#c493ff' }} />
                          <span className="text-xs" style={{ color: '#d5cabd' }}>{food.priceRange} {priceMap[food.priceRange]}</span>
                        </div>
                      )}
                      {food.address && (
                        <div className="flex items-center gap-1">
                          <MapPin size={12} style={{ color: '#b0a8b9' }} />
                          <span className="text-xs" style={{ color: '#b0a8b9' }}>{food.address}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* 操作按鈕 */}
                <div className="flex gap-2 mt-3">
                  {food.googleMapsUrl && (
                    <a href={food.googleMapsUrl} target="_blank" rel="noreferrer"
                      className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-medium transition-all hover:scale-[1.02]"
                      style={{
                        background: 'rgba(132,94,194,0.2)',
                        border: '1px solid rgba(196,147,255,0.3)',
                        color: '#c493ff',
                      }}>
                      <Navigation size={14} /> Maps 導航
                    </a>
                  )}
                  <button
                    onClick={() => saved ? removeFoodPlace(food.id) : addFoodPlace(food)}
                    className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-medium transition-all hover:scale-[1.02]"
                    style={saved ? {
                      background: 'rgba(196,147,255,0.2)',
                      border: '1px solid rgba(196,147,255,0.4)',
                      color: '#c493ff',
                    } : {
                      background: 'rgba(75,68,83,0.4)',
                      border: '1px solid rgba(176,168,185,0.15)',
                      color: '#b0a8b9',
                    }}
                  >
                    {saved
                      ? <><BookmarkCheck size={14} /> 已收藏</>
                      : <><Plus size={14} /> 加入清單</>}
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
