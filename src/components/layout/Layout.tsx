import type { ReactNode } from 'react';
import BottomNav from './BottomNav';
import AgentButton from '../agent/AgentButton';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-app flex flex-col">
      <main className="flex-1 pb-20 overflow-y-auto">
        {children}
      </main>
      <AgentButton />
      <BottomNav />
    </div>
  );
}
