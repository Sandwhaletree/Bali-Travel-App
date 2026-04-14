import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Map, UtensilsCrossed, MessageCircle, Wallet, Home } from 'lucide-react';

// NOTE: 底部導航列 - 採用 Classy Palette + Highlight 紫光活躍態

const navItems = [
  { path: '/',         icon: Home,            label: '首頁' },
  { path: '/explore',  icon: Map,             label: '行程' },
  { path: '/food',     icon: UtensilsCrossed, label: '美食' },
  { path: '/language', icon: MessageCircle,   label: '語言' },
  { path: '/expense',  icon: Wallet,          label: '分帳' },
];

export default function BottomNav() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass border-t"
      style={{ borderColor: 'rgba(196, 147, 255, 0.2)' }}>
      {/* Generic Gradient 頂邊線 */}
      <div className="gradient-stripe h-[2px] w-full opacity-70" />
      <div className="flex items-center justify-around h-16 px-2 max-w-xl mx-auto">
        {navItems.map(({ path, icon: Icon, label }) => {
          const isActive = location.pathname === path;
          return (
            <NavLink
              key={path}
              to={path}
              className="flex flex-col items-center gap-1 px-3 py-1 rounded-xl transition-all duration-200"
            >
              <motion.div
                animate={isActive ? { scale: 1.15, y: -2 } : { scale: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                className="p-2 rounded-xl transition-all duration-200"
                style={isActive ? {
                  background: 'rgba(196, 147, 255, 0.15)',
                  color: '#c493ff',
                  boxShadow: '0 0 12px rgba(196, 147, 255, 0.3)',
                } : { color: 'rgba(176, 168, 185, 0.6)' }}
              >
                <Icon size={20} />
              </motion.div>
              <span
                className="text-[10px] font-medium font-[Outfit] transition-colors duration-200"
                style={{ color: isActive ? '#c493ff' : 'rgba(176, 168, 185, 0.5)' }}
              >
                {label}
              </span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
