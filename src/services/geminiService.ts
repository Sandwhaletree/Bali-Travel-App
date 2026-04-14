import { GoogleGenerativeAI } from '@google/generative-ai';
import type { Attraction, FoodPlace } from '../types';

// NOTE: Gemini API 服務封裝 - 翻譯、OCR、Agent 皆走此服務

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';

let genAI: GoogleGenerativeAI | null = null;

function getClient(): GoogleGenerativeAI {
  if (!genAI) {
    genAI = new GoogleGenerativeAI(API_KEY);
  }
  return genAI;
}

// === 翻譯 ===
export async function translateText(
  text: string,
  targetLang: 'id' | 'en' | 'zh' = 'id'
): Promise<{ translated: string; pronunciation?: string }> {
  const model = getClient().getGenerativeModel({ model: 'gemini-2.0-flash' });
  const langMap = { id: '印尼語 (Bahasa Indonesia)', en: '英文', zh: '繁體中文' };
  const prompt = `請將以下文字翻譯成${langMap[targetLang]}。
如果翻譯成印尼語，請同時提供發音提示（用中文注音）。
請用 JSON 格式回應：{"translated": "翻譯結果", "pronunciation": "發音（如適用）"}

原文：${text}`;

  const result = await model.generateContent(prompt);
  const raw = result.response.text().trim();
  try {
    const cleaned = raw.replace(/```json\n?|\n?```/g, '');
    return JSON.parse(cleaned);
  } catch {
    return { translated: raw };
  }
}

// === 圖片 OCR 翻譯 (菜單/街景) ===
export async function translateImage(
  base64Data: string,
  mimeType: string
): Promise<{ originalText: string; translation: string; details: string }> {
  const model = getClient().getGenerativeModel({ model: 'gemini-2.0-flash' });
  const prompt = `你是一個旅遊翻譯助理，專門幫助遊覽巴厘島的旅客。
請分析這張圖片中的所有文字，並：
1. 列出原始文字
2. 翻譯成繁體中文
3. 提供有用的說明（如是菜單，說明食材/口味；如是街景，說明重要資訊）

請用 JSON 格式回應：
{
  "originalText": "圖片中的原始文字",
  "translation": "繁體中文翻譯",
  "details": "附加說明"
}`;

  const result = await model.generateContent([
    { text: prompt },
    { inlineData: { data: base64Data, mimeType } },
  ]);
  const raw = result.response.text().trim();
  try {
    const cleaned = raw.replace(/```json\n?|\n?```/g, '');
    return JSON.parse(cleaned);
  } catch {
    return { originalText: '', translation: raw, details: '' };
  }
}

// === AI Agent - 自然語言解析指令 ===
export interface AgentAction {
  type: 'add_attraction' | 'add_food' | 'translate' | 'answer' | 'expense_tip';
  data?: Partial<Attraction> | Partial<FoodPlace>;
  message: string;
}

export async function processAgentMessage(
  userInput: string,
  context: { currentAttractions: string[]; currentFoods: string[] }
): Promise<AgentAction> {
  const model = getClient().getGenerativeModel({ model: 'gemini-2.0-flash' });

  const systemPrompt = `你是「Bali小助理」，專門幫助旅客遊覽巴厘島。
你能幫忙：
1. 推薦景點並加入行程
2. 推薦美食並加入清單
3. 翻譯中文/英文/印尼語
4. 回答巴厘島相關問題
5. 分帳建議

當前行程景點：${context.currentAttractions.join('、') || '（尚無景點）'}
當前美食清單：${context.currentFoods.join('、') || '（尚無美食）'}

回應請用 JSON：
{
  "type": "add_attraction | add_food | translate | answer | expense_tip",
  "data": {
    // 若 type=add_attraction: { id, name, nameId, description, category, location:{lat,lng}, address, googleMapsUrl }
    // 若 type=add_food: { id, name, category, location:{lat,lng}, address, priceRange, mustTry, googleMapsUrl }
    // 其他 type 可為 null
  },
  "message": "給使用者看的友善回覆（繁體中文）"
}

巴厘島常見景點座標範圍：緯度 -8.8 ~ -8.0, 經度 115.0 ~ 115.7`;

  const result = await model.generateContent([
    { text: systemPrompt },
    { text: `使用者說：${userInput}` },
  ]);

  const raw = result.response.text().trim();
  try {
    const cleaned = raw.replace(/```json\n?|\n?```/g, '');
    return JSON.parse(cleaned);
  } catch {
    return { type: 'answer', message: raw };
  }
}
// === 語音辨識翻譯 ===
export async function translateSpeech(text: string): Promise<string> {
  const { translated } = await translateText(text, 'zh');
  return translated;
}
