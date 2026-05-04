import { NavLink, useLocation } from 'react-router-dom';
import {
  Home,
  Dumbbell,
  Play,
  TrendingUp,
  BookOpen,
  Zap,
  User,
  Apple,
  Scale,
  Trophy,
} from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { ThemeToggle } from '@/features/theme-toggle/ui/ThemeToggle';

const links = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/fichas', icon: Dumbbell, label: 'Minhas Fichas' },
  { to: '/treino', icon: Play, label: 'Treinar' },
  { to: '/calorias', icon: Apple, label: 'Calorias' },
  { to: '/corpo', icon: Scale, label: 'Corpo' },
  { to: '/progresso', icon: TrendingUp, label: 'Progresso' },
  { to: '/conquistas', icon: Trophy, label: 'Conquistas' },
  { to: '/biblioteca', icon: BookOpen, label: 'Biblioteca' },
  { to: '/perfil', icon: User, label: 'Perfil' },
];

export function DesktopSidebar() {
  const location = useLocation();

  if (location.pathname.startsWith('/onboarding') || location.pathname.startsWith('/em-treino')) {
    return null;
  }

  return (
    <aside className="hidden md:flex flex-col w-64 h-screen fixed left-0 top-0 bg-card border-r border-border p-4 gap-2">
      <div className="flex items-center gap-2 px-3 py-4 mb-4">
        <Zap className="h-7 w-7 text-primary" />
        <h1 className="text-xl font-display font-bold tracking-tight">EVOLUX</h1>
      </div>

      <nav className="flex flex-col gap-1 flex-1">
        {links.map(({ to, icon: Icon, label }) => {
          const isActive =
            to === '/' ? location.pathname === '/' : location.pathname.startsWith(to);
          return (
            <NavLink
              key={to}
              to={to}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm font-medium',
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <Icon className="h-5 w-5" />
              {label}
            </NavLink>
          );
        })}
      </nav>

      <div className="border-t border-border pt-3">
        <ThemeToggle />
      </div>
    </aside>
  );
}
