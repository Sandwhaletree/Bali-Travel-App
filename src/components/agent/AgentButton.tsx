import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, X, Send, Loader2, Trash2, Sparkles } from 'lucide-react';
import { processAgentMessage } from '../../services/geminiService';
import { useItineraryStore } from '../../store/itineraryStore';
import type { ChatMessage } from '../../types';
import type { Attraction, FoodPlace } from '../../types';

// NOTE: AI Agent - 採用 Generic Gradient 浮動按鈕 + Highlight 紫光聊天介面

export default function AgentButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { chatHistory, addChatMessage, addAttraction, addFoodPlace, clearChat, itinerary, savedFoods } = useItineraryStore();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };
    addChatMessage(userMsg);
    setInput('');
    setIsLoading(true);
    try {
      const currentAttractions = itinerary.flatMap(d => d.attractions.map(a => a.name));
      const currentFoods = savedFoods.map(f => f.name);
      const action = await processAgentMessage(input, { currentAttractions, currentFoods });
      if (action.type === 'add_attraction' && action.data) {
        const attraction = action.data as Attraction;
        if (attraction.id && attraction.name && attraction.location) addAttraction(attraction);
      } else if (action.type === 'add_food' && action.data) {
        const food = action.data as FoodPlace;
        if (food.id && food.name) addFoodPlace(food);
      }
      addChatMessage({
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: action.message,
        timestamp: new Date(),
      });
    } catch {
      addChatMessage({
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '抱歉，請確認 Gemini API Key 是否已在 .env 設定。',
        timestamp: new Date(),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const quickPrompts = ['推薦烏布必去景點', '附近有什麼好吃的？', '教我說謝謝用印尼語', '幫我規劃三天行程'];

  return (
    <>
      {/* 浮動按鈕：Generic Gradient 六色 */}
      <motion.button
        className="fixed bottom-20 right-4 z-50 w-14 h-14 rounded-full
                   flex items-center justify-center pulse-glow"
        style={{
          background: 'linear-gradient(135deg, #845ec2 0%, #d65db1 40%, #ff6f91 70%, #ff9671 100%)',
          boxShadow: '0 4px 20px rgba(196, 147, 255, 0.4)',
        }}
        onClick={() => setIsOpen(true)}
        whileHover={{ scale: 1.12 }}
        whileTap={{ scale: 0.95 }}
        animate={isOpen ? { scale: 0, opacity: 0, pointerEvents: 'none' } : { scale: 1, opacity: 1 }}
      >
        <Sparkles size={24} color="#fefedf" />
      </motion.button>

      {/* 聊天抽屜 */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            className="fixed inset-0 z-[100] flex flex-col"
            style={{ background: 'rgba(18, 13, 30, 0.97)', backdropFilter: 'blur(24px)' }}
          >
            {/* Generic Gradient 頂部裝飾線 */}
            <div className="gradient-stripe h-[3px] w-full flex-shrink-0" />

            {/* 標題列 */}
            <div className="flex items-center justify-between px-5 pt-10 pb-4 border-b flex-shrink-0"
              style={{ borderColor: 'rgba(196, 147, 255, 0.15)' }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #845ec2, #d65db1)' }}>
                  <Bot size={20} color="#fefedf" />
                </div>
                <div>
                  <h2 className="font-semibold font-[Outfit] text-gradient">Bali 小助理</h2>
                  <p className="text-xs" style={{ color: '#b0a8b9' }}>由 Gemini AI 驅動</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={clearChat}
                  className="p-2 rounded-lg transition-all hover:scale-110"
                  style={{ color: '#b0a8b9' }}>
                  <Trash2 size={18} />
                </button>
                <button onClick={() => setIsOpen(false)}
                  className="p-2 rounded-lg transition-all hover:scale-110"
                  style={{ color: '#b0a8b9' }}>
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* 訊息列表 */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
              {chatHistory.length === 0 && (
                <div className="text-center py-8">
                  <div className="text-5xl mb-4 floating">🌴</div>
                  <p className="font-[Outfit] text-base" style={{ color: '#fefedf' }}>你好！我是 Bali 小助理</p>
                  <p className="text-xs mt-1" style={{ color: '#b0a8b9' }}>問我任何關於巴厘島的問題</p>

                  {/* 快速提示：每個用不同漸層顏色 */}
                  <div className="grid grid-cols-2 gap-2 mt-6">
                    {quickPrompts.map((prompt, i) => {
                      const colors = [
                        'rgba(132, 94, 194, 0.2)',
                        'rgba(214, 93, 177, 0.2)',
                        'rgba(255, 111, 145, 0.2)',
                        'rgba(255, 150, 113, 0.2)',
                      ];
                      const borders = ['rgba(132,94,194,0.4)', 'rgba(214,93,177,0.4)', 'rgba(255,111,145,0.4)', 'rgba(255,150,113,0.4)'];
                      return (
                        <button
                          key={prompt}
                          onClick={() => setInput(prompt)}
                          className="rounded-xl p-3 text-xs text-left transition-all hover:scale-[1.02]"
                          style={{ background: colors[i], border: `1px solid ${borders[i]}`, color: '#fefedf' }}
                        >
                          {prompt}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {chatHistory.map(msg => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} gap-2`}
                >
                  {msg.role === 'assistant' && (
                    <div className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center mt-1"
                      style={{ background: 'linear-gradient(135deg, #845ec2, #d65db1)' }}>
                      <Bot size={14} color="#fefedf" />
                    </div>
                  )}
                  <div
                    className="max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed"
                    style={msg.role === 'user' ? {
                      background: 'linear-gradient(135deg, #845ec2, #d65db1)',
                      color: '#fefedf',
                      borderRadius: '18px 18px 4px 18px',
                    } : {
                      background: 'rgba(132, 94, 194, 0.1)',
                      border: '1px solid rgba(196, 147, 255, 0.2)',
                      color: '#fefedf',
                      borderRadius: '18px 18px 18px 4px',
                    }}
                  >
                    {msg.content}
                  </div>
                </motion.div>
              ))}

              {isLoading && (
                <div className="flex gap-2">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg, #845ec2, #d65db1)' }}>
                    <Bot size={14} color="#fefedf" />
                  </div>
                  <div className="rounded-2xl rounded-tl-sm px-4 py-3 glass">
                    <Loader2 size={16} className="animate-spin" style={{ color: '#c493ff' }} />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* 輸入框 */}
            <div className="px-4 pb-8 pt-3 border-t flex-shrink-0"
              style={{ borderColor: 'rgba(196, 147, 255, 0.15)' }}>
              <div className="flex gap-3 items-end">
                <textarea
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                  placeholder="問我任何事... 例：加烏布猴林到行程"
                  rows={1}
                  className="flex-1 rounded-2xl px-4 py-3 text-sm resize-none outline-none transition-all"
                  style={{
                    background: 'rgba(132, 94, 194, 0.1)',
                    border: '1px solid rgba(196, 147, 255, 0.2)',
                    color: '#fefedf',
                    caretColor: '#c493ff',
                  }}
                />
                <motion.button
                  onClick={sendMessage}
                  disabled={!input.trim() || isLoading}
                  whileTap={{ scale: 0.9 }}
                  className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 transition-all disabled:opacity-40"
                  style={{ background: 'linear-gradient(135deg, #845ec2, #ff6f91)' }}
                >
                  <Send size={18} color="#fefedf" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
