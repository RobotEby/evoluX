import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Navigate, Outlet, Route, Routes } from 'react-router-dom';
import { Toaster as Sonner } from '../shared/ui/ui/sonner';
import { Toaster } from '../shared/ui/ui/toaster';
import { TooltipProvider } from '../shared/ui/ui/tooltip';
import { ThemeProvider } from './providers/theme-provider';
import Onboarding from '../pages/onboarding/ui/Onboarding';
import { AppLayout } from '@/widgets/layout/ui/AppLayout';
import Dashboard from '@/pages/dashboard/ui/Dashboard';
import Biblioteca from '@/pages/biblioteca/ui/Biblioteca';
import NotFound from '@/pages/not-found/ui/NotFound';
import { JSX } from 'react/jsx-runtime';
import { getUser } from '@/shared/lib/storage';

function hasCompletedOnboarding() {
  return getUser()?.onboardingComplete === true;
}

function RootRedirect() {
  return <Navigate to={hasCompletedOnboarding() ? '/dashboard' : '/onboarding'} replace />;
}

function RequireOnboarding() {
  return hasCompletedOnboarding() ? <Outlet /> : <Navigate to="/onboarding" replace />;
}

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<RootRedirect />} />
            <Route path="/onboarding" element={<Onboarding />} />

            <Route element={<RequireOnboarding />}>
              <Route element={<AppLayout />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/biblioteca" element={<Biblioteca />} />
              </Route>
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
