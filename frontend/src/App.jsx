// App.jsx — Root with routing and context providers
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LangProvider } from './context/LangContext';

import LoginPage      from './pages/LoginPage';
import RegisterPage   from './pages/RegisterPage';
import DashboardPage  from './pages/DashboardPage';
import WeatherPage    from './pages/WeatherPage';
import CropsPage      from './pages/CropsPage';
import DiseasePage    from './pages/DiseasePage';
import SoilPage       from './pages/SoilPage';
import IrrigationPage from './pages/IrrigationPage';
import MarketPage     from './pages/MarketPage';
import AlertsPage     from './pages/AlertsPage';
import Layout         from './components/shared/Layout';

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex h-screen items-center justify-center text-primary font-semibold">Loading…</div>;
  return user ? children : <Navigate to="/login" replace />;
}

function PublicRoute({ children }) {
  const { user } = useAuth();
  return user ? <Navigate to="/" replace /> : children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login"    element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />

      <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
        <Route index          element={<DashboardPage />} />
        <Route path="weather"    element={<WeatherPage />} />
        <Route path="crops"      element={<CropsPage />} />
        <Route path="disease"    element={<DiseasePage />} />
        <Route path="soil"       element={<SoilPage />} />
        <Route path="irrigation" element={<IrrigationPage />} />
        <Route path="market"     element={<MarketPage />} />
        <Route path="alerts"     element={<AlertsPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <LangProvider>
          <Toaster position="top-center" toastOptions={{ duration: 3000 }} />
          <AppRoutes />
        </LangProvider>
      </BrowserRouter>
    </AuthProvider>
  );
}
