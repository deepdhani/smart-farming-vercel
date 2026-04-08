// pages/WeatherPage.jsx
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';
import api from '../utils/api';

export default function WeatherPage() {
  const { user, lang } = useAuth();
  const { t } = useLang();
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/weather/${user.district}`)
      .then(r => setData(r.data))
      .finally(() => setLoading(false));
  }, [user.district]);

  if (loading) return <PageLoader label={t('loading')} />;

  const w = data?.weather;

  return (
    <div className="px-4 pt-5 space-y-4">
      <h2 className="text-xl font-bold text-gray-800">
        {lang === 'hi' ? '🌤️ मौसम जानकारी' : '🌤️ Weather Info'}
      </h2>
      <p className="text-sm text-gray-500">{user.district} · {user.altitude_meters}m</p>

      {/* Main weather card */}
      <div className="bg-gradient-to-br from-sky-400 to-primary rounded-2xl p-5 text-white">
        <p className="text-5xl font-bold">{w.temp}°C</p>
        <p className="capitalize mt-1 opacity-90">{w.description}</p>
        <div className="grid grid-cols-3 gap-3 mt-4">
          <WeatherStat label={t('humidity')} value={`${w.humidity}%`} icon="💧" />
          <WeatherStat label={t('wind')}     value={`${w.wind_speed} km/h`} icon="💨" />
          <WeatherStat label={lang === 'hi' ? 'अनुभव' : 'Feels'} value={`${w.feels_like}°C`} icon="🌡️" />
        </div>
      </div>

      {/* Smart farming insights */}
      <div className="card">
        <h3 className="section-title">
          {lang === 'hi' ? '💡 कृषि सुझाव' : '💡 Farming Insights'}
        </h3>
        <div className="space-y-2">
          {data.insights.map((insight, i) => (
            <div key={i} className="bg-green-50 border border-green-100 rounded-xl px-3 py-2 text-sm text-green-800 font-medium">
              {insight}
            </div>
          ))}
        </div>
      </div>

      {/* Altitude note */}
      <div className="card bg-amber-50 border-amber-100">
        <p className="text-sm text-amber-800">
          ⛰️ {lang === 'hi'
            ? `आपकी ऊँचाई ${user.altitude_meters}m पर पाला पड़ने का खतरा अधिक होता है। रात में फसल को ढकें।`
            : `At ${user.altitude_meters}m altitude, frost risk is higher. Cover crops on cold nights.`}
        </p>
      </div>
    </div>
  );
}

function WeatherStat({ label, value, icon }) {
  return (
    <div className="bg-white/20 rounded-xl p-2 text-center">
      <p className="text-lg">{icon}</p>
      <p className="text-xs opacity-80">{label}</p>
      <p className="font-bold text-sm">{value}</p>
    </div>
  );
}

function PageLoader({ label }) {
  return (
    <div className="flex items-center justify-center h-64 text-primary font-semibold">
      {label}
    </div>
  );
}
