// NOTE: 旅遊核心資料結構 - 行程、景點、美食統一管理

export interface LatLng {
  lat: number;
  lng: number;
}

export interface Attraction {
  id: string;
  name: string;
  nameId?: string;       // 印尼語名稱
  description: string;
  category: 'temple' | 'beach' | 'culture' | 'nature' | 'shopping' | 'other';
  location: LatLng;
  address?: string;
  rating?: number;
  imageUrl?: string;
  googleMapsUrl?: string;
  visitTime?: string;    // e.g. "09:00"
  duration?: number;     // 分鐘
}

export interface FoodPlace {
  id: string;
  name: string;
  category: 'local' | 'cafe' | 'dessert' | 'seafood' | 'international';
  location: LatLng;
  address?: string;
  priceRange?: '$' | '$$' | '$$$';
  rating?: number;
  mustTry?: string;      // 招牌菜
  googleMapsUrl?: string;
  imageUrl?: string;
}

export interface DayItinerary {
  date: string;          // e.g. "2024-05-01"
  attractions: Attraction[];
}

export type MemberName = 'Sandy' | 'Partner';

export interface Expense {
  id: string;
  title: string;
  amount: number;
  currency: 'IDR' | 'TWD' | 'USD';
  paidBy: MemberName;
  splitType: 'equal' | 'solo' | 'custom';
  participants: MemberName[];
  customRatio?: Record<MemberName, number>;
  date: string;
  category: 'food' | 'transport' | 'admission' | 'hotel' | 'shopping' | 'other';
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}
