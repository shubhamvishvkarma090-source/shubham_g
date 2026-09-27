import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import LevelDashboard from './pages/LevelDashboard/LevelDashboard.jsx';
import ActivityPage from './pages/ActivityPage/ActivityPage.jsx';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, refetchOnWindowFocus: false, staleTime: 30_000 },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/Lvl-Dashboard" replace />} />
          <Route path="/Lvl-Dashboard" element={<LevelDashboard />} />
          <Route path="/Lvl-Dashboard/activity" element={<ActivityPage />} />
          <Route path="*" element={<Navigate to="/Lvl-Dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
