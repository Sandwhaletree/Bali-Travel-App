import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Attraction, FoodPlace, DayItinerary, ChatMessage } from '../types';

// NOTE: 行程狀態 store - 景點、美食、AI對話訊息統一管理，使用 LocalStorage 持久化

interface ItineraryState {
  itinerary: DayItinerary[];
  savedFoods: FoodPlace[];
  chatHistory: ChatMessage[];
  selectedDate: string;

  addAttraction: (attraction: Attraction, date?: string) => void;
  removeAttraction: (attractionId: string, date: string) => void;
  addFoodPlace: (food: FoodPlace) => void;
  removeFoodPlace: (foodId: string) => void;
  addChatMessage: (msg: ChatMessage) => void;
  setSelectedDate: (date: string) => void;
  clearChat: () => void;
}

const today = new Date().toISOString().split('T')[0];

export const useItineraryStore = create<ItineraryState>()(
  persist(
    (set, get) => ({
      itinerary: [{ date: today, attractions: [] }],
      savedFoods: [],
      chatHistory: [],
      selectedDate: today,

      addAttraction: (attraction, date) => {
        const targetDate = date || get().selectedDate;
        set(state => {
          const existing = state.itinerary.find(d => d.date === targetDate);
          if (existing) {
            // 若景點已存在則跳過
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

      clearChat: () => set({ chatHistory: [] }),
    }),
    { name: 'bali-travel-itinerary' }
  )
);
