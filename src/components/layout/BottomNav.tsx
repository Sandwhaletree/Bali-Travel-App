import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Map, UtensilsCrossed, MessageCircle, Wallet, Home } from 'lucide-react';

// NOTE: 底部導航列 - 淺色主題，活躍態用彩虹漸層色彩

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
    <nav className="z-50 glass border-t flex-shrink-0"
      style={{ borderColor: 'rgba(132, 94, 194, 0.12)' }}>
      {/* Generic Gradient 頂邊線 */}
      <div className="gradient-stripe h-[2px] w-full opacity-60" />
      <div className="flex items-center justify-around h-16 px-2">
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
                  background: 'linear-gradient(135deg, rgba(132,94,194,0.12), rgba(214,93,177,0.1))',
                  color: '#845ec2',
                  boxShadow: '0 2px 10px rgba(132, 94, 194, 0.2)',
                } : { color: '#b0a8b9' }}
              >
                <Icon size={20} />
              </motion.div>
              <span
                className="text-[10px] font-medium font-[Outfit] transition-colors duration-200"
                style={{ color: isActive ? '#845ec2' : '#b0a8b9' }}
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
