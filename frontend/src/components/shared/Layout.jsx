// components/shared/Layout.jsx — App shell with mobile bottom nav
import { Outlet, NavLink } from 'react-router-dom';
import { useLang } from '../../context/LangContext';
import { useAuth } from '../../context/AuthContext';
import {
  FaHome, FaCloudSun, FaSeedling, FaBug,
  FaFlask, FaTint, FaStore, FaBell
} from 'react-icons/fa';

const NAV_ITEMS = [
  { to: '/',           icon: FaHome,     key: 'home' },
  { to: '/weather',    icon: FaCloudSun, key: 'weather' },
  { to: '/crops',      icon: FaSeedling, key: 'crops' },
  { to: '/disease',    icon: FaBug,      key: 'disease' },
  { to: '/soil',       icon: FaFlask,    key: 'soil' },
  { to: '/irrigation', icon: FaTint,     key: 'irrigation' },
  { to: '/market',     icon: FaStore,    key: 'market' },
  { to: '/alerts',     icon: FaBell,     key: 'alerts' },
];

export default function Layout() {
  const { t } = useLang();
  const { user } = useAuth();

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Top bar */}
      <header className="bg-primary text-white px-4 py-3 flex items-center justify-between sticky top-0 z-30 shadow-md">
        <div>
          <p className="text-xs opacity-75">{t('home')}</p>
          <h1 className="font-bold text-base leading-tight">🌾 {user?.name || 'किसान'}</h1>
        </div>
        <div className="text-right">
          <p className="text-xs opacity-75">{user?.district}</p>
          <p className="text-xs font-semibold">{user?.altitude_meters}m ऊँचाई</p>
        </div>
      </header>

      {/* Page content */}
      <main className="flex-1 pb-24 overflow-y-auto">
        <Outlet />
      </main>

      {/* Bottom navigation — mobile first */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-30 shadow-lg">
        <div className="grid grid-cols-8 h-16">
          {NAV_ITEMS.map(({ to, icon: Icon, key }) => (
            <NavLink
              key={key}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-0.5 transition-colors ${
                  isActive
                    ? 'text-primary border-t-2 border-primary'
                    : 'text-gray-400'
                }`
              }
            >
              <Icon size={18} />
              <span className="text-[9px] font-medium leading-none">{t(key)}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
