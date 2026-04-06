import { NavLink, useLocation } from 'react-router-dom';
import { Home, Dumbbell, Play, TrendingUp, BookOpen } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

const tabs = [
  { to: '/dashboard', icon: Home, label: 'Home' },
  { to: '/fichas', icon: Dumbbell, label: 'Fichas' },
  { to: '/treino', icon: Play, label: 'Treino' },
  { to: '/progresso', icon: TrendingUp, label: 'Progresso' },
  { to: '/biblioteca', icon: BookOpen, label: 'Biblioteca' },
];

export function BottomNav() {
  const location = useLocation();

  if (location.pathname.startsWith('/onboarding') || location.pathname.startsWith('/em-treino')) {
    return null;
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass safe-bottom border-t border-border/50 md:hidden">
      <div className="flex items-center justify-around px-2 pt-2 pb-1">
        {tabs.map(({ to, icon: Icon, label }) => {
          const isActive =
            to === '/' ? location.pathname === '/' : location.pathname.startsWith(to);
          return (
            <NavLink
              key={to}
              to={to}
              className={cn(
                'flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-colors touch-target',
                isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Icon
                className={cn('h-5 w-5', isActive && 'drop-shadow-[0_0_6px_hsl(199,89%,48%)]')}
              />
              <span className="text-[10px] font-medium">{label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
