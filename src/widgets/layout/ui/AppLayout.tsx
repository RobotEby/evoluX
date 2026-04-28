import { Outlet, useLocation } from 'react-router-dom';
import { BottomNav } from '@/widgets/navigation/ui/BottomNav';
import { DesktopSidebar } from '@/widgets/sidebar/ui/DesktopSidebar';
import { cn } from '@/shared/lib/utils';

export function AppLayout() {
  const location = useLocation();
  const isFullscreen =
    location.pathname.startsWith('/onboarding') || location.pathname.startsWith('/em-treino');

  return (
    <div className="min-h-screen bg-background">
      {!isFullscreen && <DesktopSidebar />}
      <main className={cn('min-h-screen', !isFullscreen && 'md:ml-64 pb-20 md:pb-0')}>
        <Outlet />
      </main>
      {!isFullscreen && <BottomNav />}
    </div>
  );
}
