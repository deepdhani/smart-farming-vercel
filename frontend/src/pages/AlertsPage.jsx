// pages/AlertsPage.jsx
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

export default function AlertsPage() {
  const { user, lang } = useAuth();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    api.get(`/alerts/${user.id}`)
      .then(r => setAlerts(r.data.alerts))
      .finally(() => setLoading(false));
  }, [user]);

  const markRead = async (id) => {
    await api.patch(`/alerts/${id}/read`);
    setAlerts(a => a.map(x => x.id === id ? { ...x, read: true } : x));
  };

  // Show demo alerts if none exist
  const displayAlerts = alerts.length > 0 ? alerts : DEMO_ALERTS;

  if (loading) return (
    <div className="flex items-center justify-center h-64 text-primary font-semibold">Loading…</div>
  );

  return (
    <div className="px-4 pt-5 space-y-4">
      <h2 className="text-xl font-bold text-gray-800">
        {lang === 'hi' ? '🔔 सूचनाएं' : '🔔 Alerts'}
      </h2>

      {displayAlerts.length === 0 ? (
        <div className="card text-center text-gray-400 py-10">
          {lang === 'hi' ? 'कोई सूचना नहीं' : 'No alerts'}
        </div>
      ) : (
        <div className="space-y-2">
          {displayAlerts.map((a, i) => (
            <div key={i}
              onClick={() => a.id && markRead(a.id)}
              className={`card cursor-pointer transition-opacity ${a.read ? 'opacity-60' : ''}`}>
              <div className="flex items-start gap-3">
                <span className="text-2xl">{a.icon || '📢'}</span>
                <div className="flex-1">
                  <p className={`text-sm font-semibold ${a.read ? 'text-gray-500' : 'text-gray-800'}`}>
                    {lang === 'hi' ? (a.message_hi || a.message) : a.message}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">{a.time || 'अभी'}</p>
                </div>
                {!a.read && <span className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const DEMO_ALERTS = [
  {
    icon: '❄️',
    message: 'Frost warning tonight — cover your potato crop',
    message_hi: 'आज रात पाले की चेतावनी — आलू की फसल ढकें',
    time: '2 घंटे पहले', read: false,
  },
  {
    icon: '📈',
    message: 'Apple prices rising in Delhi APMC market',
    message_hi: 'दिल्ली APMC मंडी में सेब के भाव बढ़ रहे हैं',
    time: '5 घंटे पहले', read: false,
  },
  {
    icon: '🌧️',
    message: 'Heavy rain expected tomorrow — delay sowing',
    message_hi: 'कल भारी बारिश की संभावना — बुवाई टालें',
    time: 'कल', read: true,
  },
];
