// pages/DashboardPage.jsx — Home dashboard
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';
import api from '../utils/api';
import {
  FaCloudSun, FaSeedling, FaBug, FaFlask,
  FaTint, FaStore, FaBell, FaSignOutAlt
} from 'react-icons/fa';

const MODULES = [
  { to: '/weather',    icon: FaCloudSun, label_hi: 'मौसम',    label_en: 'Weather',    color: 'bg-sky-50 text-sky-600 border-sky-200' },
  { to: '/crops',      icon: FaSeedling, label_hi: 'फसल सुझाव', label_en: 'Crops',    color: 'bg-green-50 text-green-700 border-green-200' },
  { to: '/disease',    icon: FaBug,      label_hi: 'रोग पहचान', label_en: 'Disease',  color: 'bg-red-50 text-red-600 border-red-200' },
  { to: '/soil',       icon: FaFlask,    label_hi: 'मिट्टी',   label_en: 'Soil',      color: 'bg-amber-50 text-amber-700 border-amber-200' },
  { to: '/irrigation', icon: FaTint,     label_hi: 'सिंचाई',   label_en: 'Irrigation', color: 'bg-blue-50 text-blue-600 border-blue-200' },
  { to: '/market',     icon: FaStore,    label_hi: 'बाज़ार भाव', label_en: 'Market',   color: 'bg-purple-50 text-purple-600 border-purple-200' },
  { to: '/alerts',     icon: FaBell,     label_hi: 'सूचनाएं',  label_en: 'Alerts',    color: 'bg-orange-50 text-orange-600 border-orange-200' },
];

export default function DashboardPage() {
  const { user, logout, lang } = useAuth();
  const { t } = useLang();
  const [weather, setWeather] = useState(null);
  const [alerts, setAlerts]   = useState([]);

  // Fetch weather snapshot for dashboard
  useEffect(() => {
    if (!user?.district) return;
    api.get(`/weather/${user.district}`)
      .then(r => setWeather(r.data))
      .catch(() => {});

    if (user?.id) {
      api.get(`/alerts/${user.id}`)
        .then(r => setAlerts(r.data.alerts.filter(a => !a.read)))
        .catch(() => {});
    }
  }, [user]);

  const greeting = lang === 'hi'
    ? `नमस्ते, ${user?.name?.split(' ')[0]}! 🙏`
    : `Hello, ${user?.name?.split(' ')[0]}! 👋`;

  return (
    <div className="px-4 pt-5 pb-6 space-y-5">
      {/* Greeting */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-800">{greeting}</h2>
          <p className="text-sm text-gray-500">
            {user?.village}, {user?.district} · {user?.altitude_meters}m
          </p>
        </div>
        <button onClick={logout}
          className="flex flex-col items-center text-gray-400 hover:text-red-500 transition-colors">
          <FaSignOutAlt size={18} />
          <span className="text-[10px] mt-0.5">{t('logout')}</span>
        </button>
      </div>

      {/* Weather snapshot */}
      {weather && (
        <div className="bg-gradient-to-r from-primary to-primary/70 rounded-2xl p-4 text-white">
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-xs opacity-80">{lang === 'hi' ? 'आज का मौसम' : "Today's Weather"}</p>
              <p className="text-3xl font-bold">{weather.weather.temp}°C</p>
              <p className="text-sm opacity-90 capitalize">{weather.weather.description}</p>
            </div>
            <div className="text-right space-y-1 text-sm">
              <p>💧 {weather.weather.humidity}%</p>
              <p>💨 {weather.weather.wind_speed} km/h</p>
            </div>
          </div>
          {weather.insights?.[0] && (
            <div className="bg-white/20 rounded-xl px-3 py-2 text-sm font-medium">
              {weather.insights[0]}
            </div>
          )}
        </div>
      )}

      {/* Unread alerts badge */}
      {alerts.length > 0 && (
        <Link to="/alerts" className="flex items-center gap-3 bg-orange-50 border border-orange-200 rounded-2xl p-3">
          <FaBell className="text-orange-500" size={20} />
          <div>
            <p className="font-semibold text-orange-800 text-sm">
              {alerts.length} {lang === 'hi' ? 'नई सूचनाएं' : 'new alerts'}
            </p>
            <p className="text-xs text-orange-600">{lang === 'hi' ? 'देखें' : 'Tap to view'}</p>
          </div>
        </Link>
      )}

      {/* Module grid */}
      <div>
        <h3 className="section-title">{lang === 'hi' ? 'सेवाएं' : 'Services'}</h3>
        <div className="grid grid-cols-2 gap-3">
          {MODULES.map(({ to, icon: Icon, label_hi, label_en, color }) => (
            <Link key={to} to={to}
              className={`flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border ${color} active:scale-95 transition-transform`}>
              <Icon size={28} />
              <span className="text-sm font-semibold text-center">
                {lang === 'hi' ? label_hi : label_en}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* Land info */}
      <div className="card flex justify-between text-center">
        <Stat label={lang === 'hi' ? 'खेत' : 'Land'} value={`${user?.land_size_acres} एकड़`} />
        <Stat label={lang === 'hi' ? 'ऊँचाई' : 'Altitude'} value={`${user?.altitude_meters}m`} />
        <Stat label={lang === 'hi' ? 'भाषा' : 'Language'} value={lang === 'hi' ? 'हिंदी' : 'English'} />
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div>
      <p className="text-xs text-gray-400">{label}</p>
      <p className="font-bold text-gray-800 text-sm">{value}</p>
    </div>
  );
}
