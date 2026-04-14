import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Languages, Mic, MicOff, Camera, Upload, Loader2, Volume2, ChevronDown } from 'lucide-react';
import { translateText, translateImage } from '../services/geminiService';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';

// NOTE: 語言助理頁 - ff6f91/ff9671 珊瑚橘主題，三大功能 + 短句庫

type TargetLang = 'id' | 'en' | 'zh';

const PHRASE_SCENARIOS = [
  {
    scene: '點餐 🍽️',
    phrases: [
      { zh: '我要點這個', id: 'Saya mau pesan ini', en: 'I would like to order this', pron: '薩雅 毛 培桑 依尼' },
      { zh: '請給我帳單', id: 'Tolong berikan tagihannya', en: 'Please give me the bill', pron: '多隆 貝里甘 塔吉漢雅' },
      { zh: '不要太辣', id: 'Jangan terlalu pedas', en: 'Not too spicy please', pron: '將剛 特拉魯 培達斯' },
      { zh: '這個多少錢？', id: 'Berapa harganya?', en: 'How much is this?', pron: '貝拉帕 哈爾嘎雅' },
    ],
  },
  {
    scene: '問路 🗺️',
    phrases: [
      { zh: '廁所在哪裡？', id: 'Di mana toiletnya?', en: 'Where is the toilet?', pron: '地 馬那 托伊勒特雅' },
      { zh: '去這裡怎麼走？', id: 'Bagaimana cara ke sana?', en: 'How do I get there?', pron: '巴蓋馬那 查拉 Ke 薩那' },
      { zh: '請叫我計程車', id: 'Tolong panggil taksi', en: 'Please call a taxi', pron: '多隆 龐吉 塔克西' },
    ],
  },
  {
    scene: '購物 🛍️',
    phrases: [
      { zh: '可以便宜一點嗎？', id: 'Bisa kurang sedikit?', en: 'Can you lower the price?', pron: '比薩 庫蘭 色地基' },
      { zh: '我只是看看', id: 'Saya hanya melihat-lihat', en: "I'm just looking", pron: '薩雅 哈雅 默利哈 利哈' },
      { zh: '有沒有其他顏色？', id: 'Ada warna lain?', en: 'Any other colors?', pron: '阿達 瓦爾納 萊因' },
    ],
  },
  {
    scene: '緊急 🚨',
    phrases: [
      { zh: '請幫我叫救護車', id: 'Tolong panggil ambulan', en: 'Please call an ambulance', pron: '多隆 龐吉 安布蘭' },
      { zh: '我迷路了', id: 'Saya tersesat', en: 'I am lost', pron: '薩雅 特色薩' },
      { zh: '請打電話給警察', id: 'Tolong hubungi polisi', en: 'Please call the police', pron: '多隆 胡本基 波里西' },
    ],
  },
];

export default function Language() {
  const [inputText, setInputText] = useState('');
  const [targetLang, setTargetLang] = useState<TargetLang>('id');
  const [translateResult, setTranslateResult] = useState<{ translated: string; pronunciation?: string } | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [activeScene, setActiveScene] = useState<string | null>(null);
  const [ocrResult, setOcrResult] = useState<{ originalText: string; translation: string; details: string } | null>(null);
  const [isOcrLoading, setIsOcrLoading] = useState(false);
  const [speechTranslation, setSpeechTranslation] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { isListening, transcript, startListening, stopListening, isSupported } = useSpeechRecognition();

  const handleTranslate = async () => {
    if (!inputText.trim()) return;
    setIsTranslating(true);
    try {
      const result = await translateText(inputText, targetLang);
      setTranslateResult(result);
    } catch {
      setTranslateResult({ translated: '翻譯失敗，請確認 Gemini API Key 是否已設定' });
    } finally {
      setIsTranslating(false);
    }
  };

  const handleImageUpload = async (file: File) => {
    setIsOcrLoading(true);
    setOcrResult(null);
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64 = (e.target?.result as string).split(',')[1];
        const result = await translateImage(base64, file.type);
        setOcrResult(result);
        setIsOcrLoading(false);
      };
      reader.readAsDataURL(file);
    } catch {
      setIsOcrLoading(false);
    }
  };

  const handleSpeechTranslate = async () => {
    if (!transcript) return;
    setIsTranslating(true);
    try {
      const result = await translateText(transcript, 'zh');
      setSpeechTranslation(result.translated);
    } finally {
      setIsTranslating(false);
    }
  };

  const speak = (text: string, lang: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    window.speechSynthesis.speak(utterance);
  };

  // 各語言選擇器漸層
  const langBtns = [
    { value: 'id' as TargetLang, label: '🇮🇩 印尼語', grad: 'linear-gradient(135deg, #845ec2, #d65db1)' },
    { value: 'en' as TargetLang, label: '🇺🇸 英文',   grad: 'linear-gradient(135deg, #d65db1, #ff6f91)' },
    { value: 'zh' as TargetLang, label: '🇹🇼 中文',   grad: 'linear-gradient(135deg, #ff6f91, #ff9671)' },
  ];

  const sectionTitle = (t: string) => (
    <div className="flex items-center gap-2 mb-3">
      <h2 className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#b0a8b9' }}>{t}</h2>
      <div className="gradient-stripe h-[1px] flex-1 rounded-full opacity-40" />
    </div>
  );

  const cardStyle = {
    background: 'rgba(132, 94, 194, 0.08)',
    border: '1px solid rgba(196, 147, 255, 0.15)',
  };

  const inputStyle = {
    background: 'rgba(75, 68, 83, 0.3)',
    border: '1px solid rgba(196, 147, 255, 0.2)',
    color: '#fefedf',
  };

  return (
    <div className="px-4 pb-4 bg-app min-h-screen">
      <div className="pt-12 pb-5">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold font-[Outfit]" style={{ color: '#fefedf' }}>💬 語言助理</h1>
          <div className="gradient-stripe h-[2px] flex-1 rounded-full opacity-50" />
        </div>
        <p className="text-sm mt-1" style={{ color: '#b0a8b9' }}>中文 ↔ 印尼語 / 英語</p>
      </div>

      {/* === 即時翻譯 === */}
      <section className="mb-5">
        {sectionTitle('即時翻譯')}
        <div className="rounded-2xl p-4 space-y-3" style={cardStyle}>
          {/* 語言選擇 */}
          <div className="flex gap-2">
            {langBtns.map(btn => (
              <button key={btn.value} onClick={() => setTargetLang(btn.value)}
                className="flex-1 py-2 rounded-xl text-xs font-medium transition-all"
                style={targetLang === btn.value
                  ? { background: btn.grad, color: '#fefedf', boxShadow: '0 3px 12px rgba(132,94,194,0.4)' }
                  : { background: 'rgba(75,68,83,0.4)', color: '#b0a8b9', border: '1px solid rgba(176,168,185,0.15)' }
                }>
                {btn.label}
              </button>
            ))}
          </div>

          <textarea value={inputText} onChange={e => setInputText(e.target.value)} placeholder="輸入想翻譯的文字..." rows={3}
            className="w-full rounded-xl px-4 py-3 text-sm resize-none outline-none placeholder-[#b0a8b9]"
            style={inputStyle} />

          <button onClick={handleTranslate} disabled={isTranslating || !inputText.trim()}
            className="w-full py-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-all disabled:opacity-40"
            style={{ background: 'linear-gradient(135deg, #ff6f91, #ff9671)', color: '#fefedf' }}>
            {isTranslating
              ? <><Loader2 size={16} className="animate-spin" /> 翻譯中...</>
              : <><Languages size={16} /> 立即翻譯</>}
          </button>

          {translateResult && (
            <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
              className="rounded-xl p-4" style={{
                background: 'rgba(255, 111, 145, 0.1)',
                border: '1px solid rgba(255,111,145,0.3)',
              }}>
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <p className="font-semibold text-base" style={{ color: '#ff6f91' }}>{translateResult.translated}</p>
                  {translateResult.pronunciation && (
                    <p className="text-xs mt-1" style={{ color: '#b0a8b9' }}>🔊 {translateResult.pronunciation}</p>
                  )}
                </div>
                <button onClick={() => speak(translateResult.translated,
                  targetLang === 'id' ? 'id-ID' : targetLang === 'en' ? 'en-US' : 'zh-TW')}
                  className="p-2 rounded-lg transition-all hover:scale-110 flex-shrink-0"
                  style={{ color: '#ff6f91' }}>
                  <Volume2 size={16} />
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </section>

      {/* === 語音辨識 === */}
      <section className="mb-5">
        {sectionTitle('語音辨識')}
        <div className="rounded-2xl p-4 space-y-3" style={cardStyle}>
          <div className="flex gap-3 items-center">
            <motion.button
              onClick={isListening ? stopListening : startListening}
              disabled={!isSupported}
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              className="w-16 h-16 rounded-full flex items-center justify-center shadow-lg flex-shrink-0 disabled:opacity-40 transition-all"
              style={isListening
                ? { background: 'linear-gradient(135deg, #c34a36, #ff8066)', boxShadow: '0 0 0 0 rgba(195,74,54,0.4)', animation: 'pulse-glow 2s infinite' }
                : { background: 'linear-gradient(135deg, #845ec2, #d65db1)' }
              }>
              {isListening
                ? <MicOff size={24} color="#fefedf" />
                : <Mic size={24} color="#fefedf" />}
            </motion.button>
            <div className="flex-1">
              <p className="font-medium text-sm" style={{ color: '#fefedf' }}>
                {isListening ? '🔴 正在錄音...' : '點擊麥克風開始錄音'}
              </p>
              <p className="text-xs mt-0.5" style={{ color: '#b0a8b9' }}>
                {isSupported ? '預設識別印尼語' : '需使用 Chrome 瀏覽器'}
              </p>
            </div>
          </div>

          {transcript && (
            <div className="rounded-xl p-3"
              style={{ background: 'rgba(75,68,83,0.3)', border: '1px solid rgba(176,168,185,0.15)' }}>
              <p className="text-xs mb-1" style={{ color: '#b0a8b9' }}>辨識結果：</p>
              <p className="text-sm" style={{ color: '#fefedf' }}>{transcript}</p>
              <button onClick={handleSpeechTranslate}
                className="mt-2 w-full py-2 rounded-lg text-xs font-medium transition-all"
                style={{ background: 'rgba(132,94,194,0.2)', border: '1px solid rgba(196,147,255,0.3)', color: '#c493ff' }}>
                翻譯成中文
              </button>
            </div>
          )}
          {speechTranslation && (
            <div className="rounded-xl p-3"
              style={{ background: 'rgba(196,147,255,0.1)', border: '1px solid rgba(196,147,255,0.25)' }}>
              <p className="text-sm" style={{ color: '#fefedf' }}>{speechTranslation}</p>
            </div>
          )}
        </div>
      </section>

      {/* === 拍照翻譯 === */}
      <section className="mb-5">
        {sectionTitle('拍照翻譯（OCR）')}
        <div className="rounded-2xl p-4 space-y-3" style={cardStyle}>
          <input type="file" ref={fileInputRef} accept="image/*" capture="environment" className="hidden"
            onChange={e => e.target.files?.[0] && handleImageUpload(e.target.files[0])} />

          <div className="grid grid-cols-2 gap-3">
            {[
              { label: '拍攝照片', icon: Camera, grad: 'linear-gradient(135deg, #ff6f91, #ff9671)' },
              { label: '上傳圖片', icon: Upload, grad: 'linear-gradient(135deg, #ff9671, #ffc75f)' },
            ].map(btn => (
              <button key={btn.label}
                onClick={() => fileInputRef.current?.click()}
                className="py-4 rounded-xl flex flex-col items-center gap-2 text-sm font-medium transition-all hover:scale-[1.02]"
                style={{
                  background: 'rgba(132,94,194,0.1)',
                  border: '1px solid rgba(196,147,255,0.2)',
                  color: '#d5cabd',
                }}>
                <btn.icon size={22} style={{ color: '#c493ff' }} />
                {btn.label}
              </button>
            ))}
          </div>

          {isOcrLoading && (
            <div className="flex items-center justify-center gap-2 py-4">
              <Loader2 size={20} className="animate-spin" style={{ color: '#ff9671' }} />
              <p className="text-sm" style={{ color: '#b0a8b9' }}>Gemini 正在分析圖片...</p>
            </div>
          )}

          {ocrResult && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
              <div className="rounded-xl p-3"
                style={{ background: 'rgba(75,68,83,0.3)', border: '1px solid rgba(176,168,185,0.1)' }}>
                <p className="text-xs mb-1" style={{ color: '#b0a8b9' }}>📷 原始文字</p>
                <p className="text-sm" style={{ color: '#d5cabd' }}>{ocrResult.originalText}</p>
              </div>
              <div className="rounded-xl p-3"
                style={{ background: 'rgba(255,111,145,0.1)', border: '1px solid rgba(255,111,145,0.3)' }}>
                <p className="text-xs mb-1" style={{ color: '#b0a8b9' }}>🌐 中文翻譯</p>
                <p className="text-sm font-medium" style={{ color: '#ff6f91' }}>{ocrResult.translation}</p>
              </div>
              {ocrResult.details && (
                <div className="rounded-xl p-3"
                  style={{ background: 'rgba(132,94,194,0.08)', border: '1px solid rgba(196,147,255,0.15)' }}>
                  <p className="text-xs mb-1" style={{ color: '#b0a8b9' }}>💡 說明</p>
                  <p className="text-sm" style={{ color: '#d5cabd' }}>{ocrResult.details}</p>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </section>

      {/* === 常用短句庫 === */}
      <section className="mb-4">
        {sectionTitle('常用短句庫')}
        <div className="space-y-3">
          {PHRASE_SCENARIOS.map((scenario, si) => {
            const sceneGrads = [
              { border: 'rgba(132,94,194,0.3)', active: 'rgba(132,94,194,0.15)', text: '#c493ff' },
              { border: 'rgba(214,93,177,0.3)', active: 'rgba(214,93,177,0.12)', text: '#ff8ec0' },
              { border: 'rgba(255,111,145,0.3)', active: 'rgba(255,111,145,0.12)', text: '#ff6f91' },
              { border: 'rgba(195,74,54,0.3)',   active: 'rgba(195,74,54,0.12)',   text: '#ff8066' },
            ];
            const sg = sceneGrads[si];
            const isActive = activeScene === scenario.scene;
            return (
              <div key={scenario.scene} className="rounded-2xl overflow-hidden"
                style={{ border: `1px solid ${sg.border}`, background: isActive ? sg.active : 'rgba(75,68,83,0.2)' }}>
                <button className="w-full px-4 py-3 flex items-center justify-between"
                  onClick={() => setActiveScene(isActive ? null : scenario.scene)}>
                  <span className="font-medium font-[Outfit]" style={{ color: '#fefedf' }}>{scenario.scene}</span>
                  <ChevronDown size={16} style={{ color: sg.text, transform: isActive ? 'rotate(0deg)' : 'rotate(-90deg)', transition: 'transform 0.2s' }} />
                </button>

                <AnimatePresence>
                  {isActive && (
                    <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                      <div className="px-4 pb-4 space-y-2 border-t" style={{ borderColor: sg.border }}>
                        {scenario.phrases.map(phrase => (
                          <div key={phrase.zh} className="rounded-xl p-3"
                            style={{ background: 'rgba(18,13,30,0.5)', border: `1px solid ${sg.border}` }}>
                            <p className="font-medium text-sm mb-1" style={{ color: '#fefedf' }}>{phrase.zh}</p>
                            <div className="flex items-center justify-between gap-2">
                              <div>
                                <p className="text-sm" style={{ color: sg.text }}>{phrase.id}</p>
                                <p className="text-xs" style={{ color: '#b0a8b9' }}>{phrase.en}</p>
                                <p className="text-xs mt-0.5" style={{ color: '#ffc75f' }}>🔊 {phrase.pron}</p>
                              </div>
                              <button onClick={() => speak(phrase.id, 'id-ID')}
                                className="p-2 rounded-lg transition-all hover:scale-110 flex-shrink-0"
                                style={{ color: sg.text, background: sg.active }}>
                                <Volume2 size={16} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
