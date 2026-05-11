'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Home, PieChart, Plus, BarChart2, Bell } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getUnreadCount } from '@/lib/premiumStorage';

const navItems = [
  { href: '/dashboard', label: 'Home',      Icon: Home },
  { href: '/budget',    label: 'Budget',    Icon: PieChart },
  { href: '/transactions', label: 'Add',    Icon: Plus, fab: true },
  { href: '/tracking',  label: 'Tracking',  Icon: BarChart2 },
  { href: '/notifications', label: 'Alerts', Icon: Bell, badge: true },
];

export function BottomNav() {
  const pathname = usePathname();
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    setUnread(getUnreadCount());
    const id = setInterval(() => setUnread(getUnreadCount()), 10000);
    return () => clearInterval(id);
  }, []);

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-30 border-t"
      style={{
        background: '#FFFFFF',
        borderColor: '#E5E7EB',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
        {navItems.map(({ href, label, Icon, fab, badge }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className="flex-1 flex flex-col items-center justify-center min-h-[44px] gap-0.5 relative cursor-pointer"
            >
              <motion.div whileTap={{ scale: 0.88 }} className="flex flex-col items-center gap-0.5 relative">
                {fab ? (
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center -mt-6 shadow-lg"
                    style={{ background: 'linear-gradient(135deg, #EC4899 0%, #8B5CF6 100%)' }}
                  >
                    <Icon size={22} color="#FFFFFF" strokeWidth={2.5} />
                  </div>
                ) : (
                  <>
                    <span className="relative">
                      <Icon
                        size={22}
                        strokeWidth={active ? 2.5 : 1.8}
                        style={{ color: active ? '#EC4899' : '#9CA3AF' }}
                        fill={active ? 'rgba(236,72,153,0.12)' : 'none'}
                      />
                      {badge && unread > 0 && (
                        <span
                          className="absolute -top-1 -right-1 w-4 h-4 text-white text-[9px] font-bold rounded-full flex items-center justify-center"
                          style={{ background: '#EC4899' }}
                        >
                          {unread > 9 ? '9+' : unread}
                        </span>
                      )}
                    </span>
                    <span
                      className="text-[10px] font-medium transition-colors"
                      style={{ fontFamily: "'Inter', sans-serif", color: active ? '#EC4899' : '#9CA3AF' }}
                    >
                      {label}
                    </span>
                  </>
                )}
                {active && !fab && (
                  <motion.div
                    layoutId="nav-dot"
                    className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                    style={{ background: '#EC4899' }}
                  />
                )}
              </motion.div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
