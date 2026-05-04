import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Navigate, Outlet, Route, Routes } from 'react-router-dom';
import Biblioteca from '@/pages/biblioteca/ui/Biblioteca';
import Calorias from '@/pages/calorias/Calorias';
import Conquistas from '@/pages/conquistas/Conquistas';
import BodyAssessment from '@/pages/corpo/BodyAssessment';
import Dashboard from '@/pages/dashboard/ui/Dashboard';
import FichaDetail from '@/pages/fichas/ui/FichaDetail';
import Fichas from '@/pages/fichas/ui/Fichas';
import NotFound from '@/pages/not-found/ui/NotFound';
import Onboarding from '@/pages/onboarding/ui/Onboarding';
import Perfil from '@/pages/perfil/Perfil';
import Progresso from '@/pages/progresso/ui/Progresso';
import EmTreino from '@/pages/treino/ui/EmTreino';
import Treino from '@/pages/treino/ui/Treino';
import { AppLayout } from '@/widgets/layout/ui/AppLayout';
import { TooltipProvider } from '@radix-ui/react-tooltip';
import { ThemeProvider } from 'next-themes';
import { Toaster as Sonner, Toaster } from '@/shared/ui/ui/toaster';
import Historico from '@/pages/historico/ui/Historico';

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/em-treino/:planId/:dayId" element={<EmTreino />} />
            <Route path="/dashboard" element={<Navigate to="/" replace />} />
            <Route element={<AppLayout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/fichas" element={<Fichas />} />
              <Route path="/fichas/:id" element={<FichaDetail />} />
              <Route path="/treino" element={<Treino />} />
              <Route path="/historico" element={<Historico />} />
              <Route path="/calorias" element={<Calorias />} />
              <Route path="/corpo" element={<BodyAssessment />} />
              <Route path="/conquistas" element={<Conquistas />} />
              <Route path="/progresso" element={<Progresso />} />
              <Route path="/biblioteca" element={<Biblioteca />} />
              <Route path="/perfil" element={<Perfil />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
