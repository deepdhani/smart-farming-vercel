// pages/IrrigationPage.jsx
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';

export default function IrrigationPage() {
  const { lang } = useAuth();
  const [form, setForm] = useState({
    crop: 'potato', soil_moisture_percent: 45,
    temperature: 20, rain_expected: false,
    days_since_last_irrigation: 2,
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const CROPS = ['potato','apple','rajma','pea','wheat','garlic','tomato'];

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/irrigation/', form);
      setResult(data);
    } catch { toast.error('Error'); }
    finally { setLoading(false); }
  };

  return (
    <div className="px-4 pt-5 space-y-4">
      <h2 className="text-xl font-bold text-gray-800">
        {lang === 'hi' ? '💧 सिंचाई सलाह' : '💧 Irrigation Advice'}
      </h2>

      <form onSubmit={submit} className="card space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            {lang === 'hi' ? 'फसल' : 'Crop'}
          </label>
          <select className="input-field" value={form.crop}
            onChange={e => setForm(f => ({ ...f, crop: e.target.value }))}>
            {CROPS.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            {lang === 'hi' ? `मिट्टी की नमी: ${form.soil_moisture_percent}%` : `Soil Moisture: ${form.soil_moisture_percent}%`}
          </label>
          <input type="range" min="0" max="100"
            value={form.soil_moisture_percent}
            onChange={e => setForm(f => ({ ...f, soil_moisture_percent: Number(e.target.value) }))}
            className="w-full accent-primary" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            {lang === 'hi' ? `पिछली सिंचाई: ${form.days_since_last_irrigation} दिन पहले` : `Last irrigation: ${form.days_since_last_irrigation} days ago`}
          </label>
          <input type="range" min="0" max="14"
            value={form.days_since_last_irrigation}
            onChange={e => setForm(f => ({ ...f, days_since_last_irrigation: Number(e.target.value) }))}
            className="w-full accent-primary" />
        </div>

        <label className="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" checked={form.rain_expected}
            onChange={e => setForm(f => ({ ...f, rain_expected: e.target.checked }))}
            className="w-5 h-5 accent-primary" />
          <span className="text-sm font-medium text-gray-700">
            {lang === 'hi' ? '🌧️ आज बारिश की संभावना है' : '🌧️ Rain expected today'}
          </span>
        </label>

        <button className="btn-primary" disabled={loading}>
          {loading ? '…' : (lang === 'hi' ? 'सलाह लें' : 'Get Advice')}
        </button>
      </form>

      {result && (
        <div className="space-y-3">
          <div className={`card text-center ${result.irrigate_today ? 'bg-blue-50 border-blue-200' : 'bg-green-50 border-green-200'}`}>
            <p className="text-3xl mb-2">{result.irrigate_today ? '💧' : '✅'}</p>
            <p className="font-bold text-lg">{result.message}</p>
          </div>
          <div className="card">
            <h4 className="font-bold mb-2">{lang === 'hi' ? '💡 पानी बचाने के सुझाव' : '💡 Water Saving Tips'}</h4>
            {result.water_saving_tips.map((tip, i) => (
              <p key={i} className="text-sm text-gray-700 py-1.5 border-b last:border-0">{tip}</p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
