import { Home, Calculator, Table, User } from 'lucide-react';
import type { ViewType } from '../App';
import { useAuthStore } from '../store/useAuthStore';

interface MobileBottomNavProps {
  currentView: ViewType;
  navigateTo: (v: ViewType) => void;
}

export const MobileBottomNav = ({
  currentView,
  navigateTo
}: MobileBottomNavProps) => {
  const { user, profile } = useAuthStore();

  const navItems = [
    { id: 'home', label: 'Home', view: 'home' as const, icon: Home },
    { id: 'calculator', label: 'Calculator', view: 'calculator' as const, icon: Calculator },
    { id: 'results', label: 'Results', view: 'results' as const, icon: Table },
    ...(user && profile ? [{ id: 'profile', label: 'Profile', view: 'profile' as const, icon: User }] : []),
  ];

  return (
    <nav 
      aria-label="Mobile Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#801618] border-t-2 border-black shadow-[0_-4px_10px_rgba(0,0,0,0.25)] pb-[env(safe-area-inset-bottom)]"
    >
      <div className="flex items-center justify-around px-2 py-1 h-16 max-w-md mx-auto gap-1.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.view;
          return (
            <button
              key={item.id}
              onClick={() => navigateTo(item.view)}
              className={`flex flex-col items-center justify-center flex-1 h-full px-1.5 transition-all relative touch-manipulation ${
                isActive
                  ? 'bg-white text-[#801618] rounded-t-lg -translate-y-2 py-2 border-2 border-b-0 border-black shadow-[2px_-2px_0px_0px_#000]'
                  : 'text-white/80 hover:text-white font-bold'
              }`}
            >
              {isActive && (
                <div className="absolute -top-1 left-2.5 right-2.5 h-1 bg-[#801618] rounded-full" />
              )}
              <div className={`p-1 rounded-md ${isActive ? 'text-[#801618]' : ''}`}>
                <Icon size={19} strokeWidth={2.5} />
              </div>
              <span className={`text-[10px] uppercase tracking-tight leading-none ${isActive ? 'font-black text-[#801618]' : 'font-bold'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

