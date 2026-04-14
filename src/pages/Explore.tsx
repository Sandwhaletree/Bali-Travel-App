import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';
import { MapPin, Plus, Trash2, Navigation, Calendar } from 'lucide-react';
import { useItineraryStore } from '../store/itineraryStore';
import type { Attraction } from '../types';

// NOTE: 行程規劃頁 - Purple/Pink 主題 Google Maps + Classy 按鈕

const MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
const BALI_CENTER = { lat: -8.4095, lng: 115.1889 };

const categoryEmoji: Record<string, string> = {
  temple: '🛕', beach: '🏖️', culture: '🎭', nature: '🌿', shopping: '🛍️', other: '📍',
};

const mapStyles = [
  { elementType: 'geometry', stylers: [{ color: '#120d1e' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#c493ff' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#120d1e' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#1a0d2e' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#845ec2' }] },
  { featureType: 'road', elementType: 'geometry.fill', stylers: [{ color: '#4b4453' }] },
  { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#1e1428' }] },
  { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#2d1a3d' }] },
  { featureType: 'landscape', elementType: 'geometry', stylers: [{ color: '#1a1028' }] },
  { featureType: 'transit', elementType: 'geometry', stylers: [{ color: '#2a1a3e' }] },
];

export default function Explore() {
  const { itinerary, selectedDate, setSelectedDate, addAttraction, removeAttraction } = useItineraryStore();
  const [selectedMarker, setSelectedMarker] = useState<Attraction | null>(null);
  const [showAddPanel, setShowAddPanel] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const todayItinerary = itinerary.find(d => d.date === selectedDate);
  const allAttractions = itinerary.flatMap(d => d.attractions);
  const [newAttraction, setNewAttraction] = useState({
    name: '', category: 'temple' as Attraction['category'], address: '', description: '',
  });

  const handleMapLoad = useCallback(() => { setMapLoaded(true); }, []);

  const handleAddManual = () => {
    if (!newAttraction.name) return;
    const attraction: Attraction = {
      id: Date.now().toString(),
      name: newAttraction.name,
      category: newAttraction.category,
      location: BALI_CENTER,
      address: newAttraction.address,
      description: newAttraction.description,
      googleMapsUrl: `https://www.google.com/maps/search/${encodeURIComponent(newAttraction.name + ' Bali')}`,
    };
    addAttraction(attraction, selectedDate);
    setNewAttraction({ name: '', category: 'temple', address: '', description: '' });
    setShowAddPanel(false);
  };

  const inputStyle = {
    background: 'rgba(132, 94, 194, 0.1)',
    border: '1px solid rgba(196, 147, 255, 0.2)',
    color: '#fefedf',
    outline: 'none',
  };

  return (
    <div className="h-screen flex flex-col bg-app">
      {/* 頂部標題 */}
      <div className="px-4 pt-12 pb-3 flex-shrink-0">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold font-[Outfit]" style={{ color: '#fefedf' }}>🗺️ 行程規劃</h1>
          <div className="gradient-stripe h-[2px] flex-1 rounded-full opacity-50" />
        </div>
        <p className="text-sm mt-1" style={{ color: '#b0a8b9' }}>點擊地圖標記查看景點資訊</p>
      </div>

      {/* 日期選擇器 */}
      <div className="px-4 pb-3 flex-shrink-0">
        <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
          {itinerary.map((day, idx) => {
            const isActive = day.date === selectedDate;
            const gradColors = [
              'linear-gradient(135deg, #845ec2, #d65db1)',
              'linear-gradient(135deg, #d65db1, #ff6f91)',
              'linear-gradient(135deg, #ff6f91, #ff9671)',
              'linear-gradient(135deg, #ff9671, #ffc75f)',
            ];
            return (
              <button
                key={day.date}
                onClick={() => setSelectedDate(day.date)}
                className="flex-shrink-0 px-4 py-2 rounded-xl text-sm font-[Outfit] transition-all"
                style={isActive ? {
                  background: gradColors[idx % gradColors.length],
                  color: '#fefedf',
                  boxShadow: '0 4px 15px rgba(132,94,194,0.4)',
                } : {
                  background: 'rgba(75, 68, 83, 0.4)',
                  color: '#b0a8b9',
                  border: '1px solid rgba(176,168,185,0.2)',
                }}
              >
                <Calendar size={12} className="inline mr-1" />
                {new Date(day.date).toLocaleDateString('zh-TW', { month: 'short', day: 'numeric' })} Day{idx + 1}
              </button>
            );
          })}
          <button
            onClick={() => {
              const lastDate = itinerary[itinerary.length - 1]?.date || selectedDate;
              const next = new Date(lastDate);
              next.setDate(next.getDate() + 1);
              setSelectedDate(next.toISOString().split('T')[0]);
            }}
            className="flex-shrink-0 px-3 py-2 rounded-xl text-sm transition-all"
            style={{ background: 'rgba(75,68,83,0.3)', color: '#b0a8b9', border: '1px solid rgba(176,168,185,0.15)' }}
          >
            + 新增天
          </button>
        </div>
      </div>

      {/* Google Maps */}
      <div className="flex-1 relative min-h-0 mx-4 rounded-2xl overflow-hidden">
        {!MAPS_API_KEY ? (
          <div className="h-full glass-card flex items-center justify-center rounded-2xl">
            <div className="text-center">
              <MapPin size={36} className="mx-auto mb-3" style={{ color: '#c493ff' }} />
              <p className="font-[Outfit] font-semibold" style={{ color: '#fefedf' }}>地圖尚未啟用</p>
              <p className="text-sm mt-1" style={{ color: '#b0a8b9' }}>請在 .env 設定 Google Maps API Key</p>
              <div className="gradient-stripe h-[2px] w-24 mx-auto mt-3 rounded-full opacity-60" />
            </div>
          </div>
        ) : (
          <LoadScript googleMapsApiKey={MAPS_API_KEY} onLoad={handleMapLoad}>
            {mapLoaded && (
              <GoogleMap
                mapContainerStyle={{ width: '100%', height: '100%' }}
                center={BALI_CENTER}
                zoom={11}
                options={{ styles: mapStyles, disableDefaultUI: true, zoomControl: true }}
              >
                {allAttractions.map(att => (
                  <Marker
                    key={att.id}
                    position={att.location}
                    onClick={() => setSelectedMarker(att)}
                    label={{ text: categoryEmoji[att.category] || '📍', fontSize: '20px' }}
                  />
                ))}
                {selectedMarker && (
                  <InfoWindow position={selectedMarker.location} onCloseClick={() => setSelectedMarker(null)}>
                    <div className="p-1 min-w-[180px]">
                      <h3 className="font-bold text-sm text-gray-800">{selectedMarker.name}</h3>
                      <p className="text-xs text-gray-500 mt-1">{selectedMarker.description}</p>
                      {selectedMarker.googleMapsUrl && (
                        <a href={selectedMarker.googleMapsUrl} target="_blank" rel="noreferrer"
                          className="text-purple-600 text-xs mt-2 flex items-center gap-1">
                          <Navigation size={10} /> Google Maps 導航
                        </a>
                      )}
                    </div>
                  </InfoWindow>
                )}
              </GoogleMap>
            )}
          </LoadScript>
        )}
      </div>

      {/* 底部景點清單 */}
      <div className="flex-shrink-0 glass border-t max-h-[40vh]"
        style={{ borderColor: 'rgba(196, 147, 255, 0.15)' }}>
        <div className="px-4 py-3 flex items-center justify-between">
          <p className="font-semibold font-[Outfit] text-sm" style={{ color: '#fefedf' }}>
            今日景點
            <span className="ml-2 badge-purple rounded-full px-2 py-0.5 text-xs">
              {todayItinerary?.attractions.length ?? 0}
            </span>
          </p>
          <button
            onClick={() => setShowAddPanel(!showAddPanel)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-medium btn-primary transition-all"
            style={{
              background: 'linear-gradient(135deg, #845ec2, #d65db1)',
              color: '#fefedf',
            }}
          >
            <Plus size={14} /> 手動新增
          </button>
        </div>

        {/* 新增表單 */}
        <AnimatePresence>
          {showAddPanel && (
            <motion.div
              initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden px-4 pb-3"
            >
              <div className="glass-card rounded-xl p-3 space-y-2">
                <input value={newAttraction.name}
                  onChange={e => setNewAttraction(p => ({ ...p, name: e.target.value }))}
                  placeholder="景點名稱"
                  className="w-full rounded-lg px-3 py-2 text-sm placeholder-[#b0a8b9]"
                  style={inputStyle} />
                <input value={newAttraction.address}
                  onChange={e => setNewAttraction(p => ({ ...p, address: e.target.value }))}
                  placeholder="地址（選填）"
                  className="w-full rounded-lg px-3 py-2 text-sm placeholder-[#b0a8b9]"
                  style={inputStyle} />
                <select value={newAttraction.category}
                  onChange={e => setNewAttraction(p => ({ ...p, category: e.target.value as Attraction['category'] }))}
                  className="w-full rounded-lg px-3 py-2 text-sm"
                  style={{ ...inputStyle, background: 'rgba(75,68,83,0.5)' }}>
                  <option value="temple">🛕 寺廟</option>
                  <option value="beach">🏖️ 海灘</option>
                  <option value="culture">🎭 文化</option>
                  <option value="nature">🌿 自然</option>
                  <option value="shopping">🛍️ 購物</option>
                  <option value="other">📍 其他</option>
                </select>
                <button onClick={handleAddManual}
                  className="w-full py-2 rounded-lg text-sm font-medium"
                  style={{ background: 'linear-gradient(135deg, #845ec2, #d65db1)', color: '#fefedf' }}>
                  加入行程
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 景點清單 */}
        <div className="overflow-y-auto max-h-48 px-4 pb-4 space-y-2">
          {!todayItinerary?.attractions.length && (
            <p className="text-sm text-center py-4" style={{ color: '#4b4453' }}>
              尚無景點 — 用 ✨ AI 助理快速新增！
            </p>
          )}
          {todayItinerary?.attractions.map((att) => (
            <motion.div key={att.id}
              initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3 rounded-xl p-3"
              style={{ background: 'rgba(75,68,83,0.25)', border: '1px solid rgba(196,147,255,0.1)' }}
            >
              <span className="text-xl">{categoryEmoji[att.category] || '📍'}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate" style={{ color: '#fefedf' }}>{att.name}</p>
                <p className="text-xs truncate" style={{ color: '#b0a8b9' }}>{att.address || att.description}</p>
              </div>
              <div className="flex gap-1">
                {att.googleMapsUrl && (
                  <a href={att.googleMapsUrl} target="_blank" rel="noreferrer"
                    className="p-1.5 rounded-lg transition-all hover:scale-110" style={{ color: '#c493ff' }}>
                    <Navigation size={14} />
                  </a>
                )}
                <button onClick={() => removeAttraction(att.id, selectedDate)}
                  className="p-1.5 rounded-lg transition-all hover:scale-110" style={{ color: '#ff8066' }}>
                  <Trash2 size={14} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
