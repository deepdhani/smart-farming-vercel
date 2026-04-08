// pages/SoilPage.jsx
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';

export default function SoilPage() {
  const { lang } = useAuth();
  const [form, setForm] = useState({
    ph: 6.5, moisture_percent: 50, soil_type: 'loamy',
    nitrogen: 'medium', phosphorus: 'medium', potassium: 'medium',
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/soil/', form);
      setResult(data);
    } catch { toast.error('Error'); }
    finally { setLoading(false); }
  };

  const NPK = ['nitrogen','phosphorus','potassium'];
  const NPK_HI = ['नाइट्रोजन','फॉस्फोरस','पोटेशियम'];

  return (
    <div className="px-4 pt-5 space-y-4">
      <h2 className="text-xl font-bold text-gray-800">
        {lang === 'hi' ? '🪨 मिट्टी विश्लेषण' : '🪨 Soil Analysis'}
      </h2>

      <form onSubmit={submit} className="card space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            pH: {form.ph}
          </label>
          <input type="range" min="4" max="9" step="0.1" value={form.ph}
            onChange={e => set('ph', Number(e.target.value))}
            className="w-full accent-primary" />
          <div className="flex justify-between text-xs text-gray-400">
            <span>4 (अम्लीय)</span><span>7 (तटस्थ)</span><span>9 (क्षारीय)</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            {lang === 'hi' ? '💧 नमी' : '💧 Moisture'}: {form.moisture_percent}%
          </label>
          <input type="range" min="0" max="100" value={form.moisture_percent}
            onChange={e => set('moisture_percent', Number(e.target.value))}
            className="w-full accent-primary" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-2">
            {lang === 'hi' ? 'NPK स्तर' : 'NPK Levels'}
          </label>
          {NPK.map((n, i) => (
            <div key={n} className="flex items-center gap-3 mb-2">
              <span className="text-sm w-24 text-gray-700">{lang === 'hi' ? NPK_HI[i] : n}</span>
              <div className="flex gap-2 flex-1">
                {['low','medium','high'].map(level => (
                  <button key={level} type="button"
                    onClick={() => set(n, level)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                      form[n] === level ? 'bg-primary text-white border-primary' : 'border-gray-200 text-gray-600'
                    }`}>
                    {lang === 'hi' ? (level === 'low' ? 'कम' : level === 'medium' ? 'मध्यम' : 'अधिक') : level}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <button className="btn-primary" disabled={loading}>
          {loading ? '…' : (lang === 'hi' ? 'विश्लेषण करें' : 'Analyze')}
        </button>
      </form>

      {result && (
        <div className="space-y-3">
          {result.tips.map((tip, i) => (
            <div key={i} className="card bg-blue-50 border-blue-100 text-sm text-blue-800">{tip}</div>
          ))}
          {result.fertilizer_recommendations.length > 0 && (
            <div className="card">
              <h4 className="font-bold mb-2">{lang === 'hi' ? '🌿 खाद सुझाव' : '🌿 Fertilizer'}</h4>
              {result.fertilizer_recommendations.map((f, i) => (
                <p key={i} className="text-sm text-gray-700 py-1 border-b last:border-0">{f}</p>
              ))}
            </div>
          )}
          <div className="card">
            <h4 className="font-bold mb-2">{lang === 'hi' ? '🔄 फसल चक्र' : '🔄 Crop Rotation'}</h4>
            <p className="text-sm text-gray-700">{result.crop_rotation[0]}</p>
          </div>
        </div>
      )}
    </div>
  );
}
