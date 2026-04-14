import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Attraction, FoodPlace, DayItinerary, ChatMessage } from '../types';
import { SANDY_BALI_ITINERARY } from '../data/baliItinerary';

// NOTE: 行程狀態 store - 預設帶入 Sandy 峇里島行程
// version: 2 會清除舊 localStorage 快取，強制從新的預設值重建

interface ItineraryState {
  itinerary: DayItinerary[];
  savedFoods: FoodPlace[];
  chatHistory: ChatMessage[];
  selectedDate: string;

  addAttraction: (attraction: Attraction, date?: string) => void;
  removeAttraction: (attractionId: string, date: string) => void;
  updateAttraction: (attraction: Attraction, date: string) => void;
  addFoodPlace: (food: FoodPlace) => void;
  removeFoodPlace: (foodId: string) => void;
  addChatMessage: (msg: ChatMessage) => void;
  setSelectedDate: (date: string) => void;
  clearChat: () => void;
  importItinerary: (days: DayItinerary[]) => void;
}

// NOTE: 預設直接帶入 Sandy 行程，不再需要手動匯入
const DEFAULT_DATE = '2026-04-17'; // DAY 1 為預設顯示

export const useItineraryStore = create<ItineraryState>()(
  persist(
    (set, get) => ({
      itinerary: SANDY_BALI_ITINERARY,
      savedFoods: [],
      chatHistory: [],
      selectedDate: DEFAULT_DATE,

      addAttraction: (attraction, date) => {
        const targetDate = date || get().selectedDate;
        set(state => {
          const existing = state.itinerary.find(d => d.date === targetDate);
          if (existing) {
            // 若景點已存在則跳過（以 id 判斷）
            if (existing.attractions.find(a => a.id === attraction.id)) return state;
            return {
              itinerary: state.itinerary.map(d =>
                d.date === targetDate
                  ? { ...d, attractions: [...d.attractions, attraction] }
                  : d
              ),
            };
          }
          return {
            itinerary: [...state.itinerary, { date: targetDate, attractions: [attraction] }],
          };
        });
      },

      removeAttraction: (attractionId, date) => {
        set(state => ({
          itinerary: state.itinerary.map(d =>
            d.date === date
              ? { ...d, attractions: d.attractions.filter(a => a.id !== attractionId) }
              : d
          ),
        }));
      },

      addFoodPlace: (food) => {
        set(state => {
          if (state.savedFoods.find(f => f.id === food.id)) return state;
          return { savedFoods: [...state.savedFoods, food] };
        });
      },

      removeFoodPlace: (foodId) => {
        set(state => ({ savedFoods: state.savedFoods.filter(f => f.id !== foodId) }));
      },

      addChatMessage: (msg) => {
        set(state => ({ chatHistory: [...state.chatHistory, msg] }));
      },

      setSelectedDate: (date) => set({ selectedDate: date }),

      updateAttraction: (attraction, date) =>
        set(state => ({
          itinerary: state.itinerary.map(d =>
            d.date === date
              ? { ...d, attractions: d.attractions.map(a => a.id === attraction.id ? attraction : a) }
              : d
          ),
        })),

      clearChat: () => set({ chatHistory: [] }),

      importItinerary: (days) =>
        set({
          itinerary: days,
          selectedDate: days.find(d => d.date >= '2026-04-17')?.date ?? days[0]?.date ?? DEFAULT_DATE,
        }),
    }),
    {
      name: 'bali-travel-itinerary',
      // NOTE: version 2 清除所有舊 v1 快取，確保預設行程正確載入
      version: 2,
    }
  )
);
