import type { ReactNode } from 'react';
import BottomNav from './BottomNav';
import AgentButton from '../agent/AgentButton';

interface LayoutProps {
  children: ReactNode;
}

// NOTE: App 框架 - 獨立的手機模擬框，讓畫面集中。
// 手機版和桌機版都會有邊界(padding)，並帶有圓角和陰影，避免內容緊貼線上。
export default function Layout({ children }: LayoutProps) {
  return (
    // 外層：螢幕背景，提供四邊的呼吸空間
    <div className="min-h-screen flex items-center justify-center p-3 sm:p-6" style={{ background: '#e8e4f5' }}>
      {/* App 容器：最大 480px，有圓角與陰影，獨立於背景 */}
      <div
        className="w-full flex flex-col relative bg-app rounded-3xl overflow-hidden"
        style={{
          maxWidth: '480px',
          height: 'calc(100vh - 24px)', // 扣除上下 padding
          maxHeight: '900px', // 桌機最大高度
          background: '#f8f7ff',
          boxShadow: '0 20px 60px rgba(132, 94, 194, 0.15), 0 0 0 1px rgba(132,94,194,0.05)',
        }}
      >
        {/* 滾動內容區塊 */}
        <main className="flex-1 overflow-y-auto pb-6" style={{ scrollbarWidth: 'none' }}>
          {children}
        </main>
        
        {/* 懸浮按鈕：相對於 App 容器定位 */}
        <div className="absolute inset-x-0 bottom-[4.5rem] pointer-events-none">
          <div className="relative w-full h-full">
            <div className="pointer-events-auto">
              <AgentButton />
            </div>
          </div>
        </div>

        {/* 底部導覽：自然排列在 flex-col 最底部 */}
        <BottomNav />
      </div>
    </div>
  );
}
