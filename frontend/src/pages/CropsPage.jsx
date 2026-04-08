// pages/CropsPage.jsx
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';
import api from '../utils/api';
import toast from 'react-hot-toast';

const SOIL_TYPES = ['loamy','clay','sandy','clay-loam','sandy-loam','red'];
const SEASONS    = [
  { val: 'kharif', hi: 'खरीफ (जून–नवंबर)', en: 'Kharif (Jun–Nov)' },
  { val: 'rabi',   hi: 'रबी (नवंबर–अप्रैल)', en: 'Rabi (Nov–Apr)' },
  { val: 'zaid',   hi: 'जायद (अप्रैल–जून)', en: 'Zaid (Apr–Jun)' },
];

export default function CropsPage() {
  const { user, lang } = useAuth();
  const { t } = useLang();
  const [form, setForm] = useState({
    soil_type: 'loamy', season: 'kharif',
    altitude_meters: user?.altitude_meters || 1500,
    temperature: 18, rainfall_mm: 900,
  });
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/crop-recommend/', {
        ...form,
        altitude_meters: Number(form.altitude_meters),
        temperature: Number(form.temperature),
        rainfall_mm: Number(form.rainfall_mm),
      });
      setResults(data);
    } catch {
      toast.error(lang === 'hi' ? 'कुछ गलत हुआ' : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-4 pt-5 space-y-4">
      <h2 className="text-xl font-bold text-gray-800">
        {lang === 'hi' ? '🌱 फसल सुझाव' : '🌱 Crop Recommendation'}
      </h2>

      <form onSubmit={handleSubmit} className="card space-y-4">
        <Field label={lang === 'hi' ? '🪨 मिट्टी का प्रकार' : '🪨 Soil Type'}>
          <select className="input-field" value={form.soil_type}
            onChange={e => set('soil_type', e.target.value)}>
            {SOIL_TYPES.map(s => <option key={s}>{s}</option>)}
          </select>
        </Field>

        <Field label={lang === 'hi' ? '📅 मौसम' : '📅 Season'}>
          <div className="space-y-2">
            {SEASONS.map(s => (
              <label key={s.val} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                form.season === s.val ? 'border-primary bg-green-50' : 'border-gray-200'
              }`}>
                <input type="radio" name="season" value={s.val}
                  checked={form.season === s.val}
                  onChange={() => set('season', s.val)}
                  className="accent-primary" />
                <span className="text-sm font-medium">{lang === 'hi' ? s.hi : s.en}</span>
              </label>
            ))}
          </div>
        </Field>

        <Field label={`⛰️ ऊँचाई: ${form.altitude_meters}m`}>
          <input type="range" min="500" max="4000" step="50"
            value={form.altitude_meters}
            onChange={e => set('altitude_meters', e.target.value)}
            className="w-full accent-primary" />
          <div className="flex justify-between text-xs text-gray-400">
            <span>500m</span><span>4000m</span>
          </div>
        </Field>

        <Field label={`🌡️ ${lang === 'hi' ? 'तापमान' : 'Temperature'}: ${form.temperature}°C`}>
          <input type="range" min="-5" max="40" step="1"
            value={form.temperature}
            onChange={e => set('temperature', e.target.value)}
            className="w-full accent-primary" />
        </Field>

        <button className="btn-primary" disabled={loading}>
          {loading ? (lang === 'hi' ? 'विश्लेषण हो रहा है…' : 'Analyzing…') : (lang === 'hi' ? 'फसल सुझाएं' : 'Get Recommendations')}
        </button>
      </form>

      {results && (
        <div className="space-y-3">
          <h3 className="section-title">
            {lang === 'hi' ? '✅ सुझाई गई फसलें' : '✅ Recommended Crops'}
            <span className="text-sm font-normal text-gray-500 ml-2">({results.total_found} found)</span>
          </h3>

          {results.recommendations.length === 0 ? (
            <div className="card text-center text-gray-500">{t('no_result')}</div>
          ) : (
            results.recommendations.map((r, i) => (
              <div key={i} className={`card border-l-4 ${
                i === 0 ? 'border-l-primary' : 'border-l-gray-200'
              }`}>
                <div className="flex items-start justify-between mb-1">
                  <h4 className="font-bold text-gray-800">{r.name}</h4>
                  {i === 0 && (
                    <span className="badge bg-green-100 text-green-700">
                      {lang === 'hi' ? 'सर्वोत्तम' : 'Best'}
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 mb-2">{r.description}</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-gray-50 rounded-lg p-2">
                    <p className="text-gray-400">{lang === 'hi' ? 'बुवाई का समय' : 'Sowing Time'}</p>
                    <p className="font-semibold">{r.sowing_time}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-2">
                    <p className="text-gray-400">{lang === 'hi' ? 'अनुमानित उत्पादन' : 'Expected Yield'}</p>
                    <p className="font-semibold">{r.expected_yield}</p>
                  </div>
                </div>
              </div>
            ))
          )}

          {results.ml_suggestion && (
            <div className="card bg-purple-50 border-purple-100">
              <p className="text-xs text-purple-600 font-semibold mb-1">🤖 AI Model Suggestion</p>
              <p className="font-bold text-purple-800">{results.ml_suggestion}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-600 mb-1">{label}</label>
      {children}
    </div>
  );
}
