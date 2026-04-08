// pages/RegisterPage.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const DISTRICTS = [
  'Chamoli','Uttarkashi','Pithoragarh','Rudraprayag',
  'Tehri','Pauri','Almora','Bageshwar','Champawat',
  'Nainital','Dehradun','Haridwar'
];

export default function RegisterPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '', phone: '', password: '',
    village: '', district: 'Chamoli',
    altitude_meters: 1500, land_size_acres: 1,
    language: 'hi',
  });
  const [loading, setLoading] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/auth/register', {
        ...form,
        altitude_meters: Number(form.altitude_meters),
        land_size_acres: Number(form.land_size_acres),
      });
      login(data, data.token);
      toast.success('पंजीकरण सफल! Registration successful!');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary to-primary/80 px-6 py-10 flex flex-col items-center">
      <div className="text-center mb-6">
        <div className="text-5xl mb-2">🌱</div>
        <h1 className="text-white text-xl font-bold">नया खाता बनाएं</h1>
        <p className="text-white/70 text-sm">Create your farmer account</p>
      </div>

      <div className="card w-full max-w-sm">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="👤 नाम / Name">
            <input className="input-field" value={form.name}
              onChange={e => set('name', e.target.value)} placeholder="राम कुमार" required />
          </Field>

          <Field label="📱 मोबाइल नंबर">
            <input className="input-field" type="tel" value={form.phone}
              onChange={e => set('phone', e.target.value)} placeholder="9876543210" required />
          </Field>

          <Field label="🔒 पासवर्ड">
            <input className="input-field" type="password" value={form.password}
              onChange={e => set('password', e.target.value)} placeholder="••••••••" required />
          </Field>

          <Field label="🏘️ गाँव / Village">
            <input className="input-field" value={form.village}
              onChange={e => set('village', e.target.value)} placeholder="गोपेश्वर" required />
          </Field>

          <Field label="📍 जिला / District">
            <select className="input-field" value={form.district}
              onChange={e => set('district', e.target.value)}>
              {DISTRICTS.map(d => <option key={d}>{d}</option>)}
            </select>
          </Field>

          <Field label={`⛰️ ऊँचाई: ${form.altitude_meters}m`}>
            <input type="range" min="500" max="4000" step="50"
              value={form.altitude_meters}
              onChange={e => set('altitude_meters', e.target.value)}
              className="w-full accent-primary" />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>500m</span><span>4000m</span>
            </div>
          </Field>

          <Field label={`🌾 खेत: ${form.land_size_acres} एकड़`}>
            <input type="range" min="0.5" max="20" step="0.5"
              value={form.land_size_acres}
              onChange={e => set('land_size_acres', e.target.value)}
              className="w-full accent-primary" />
          </Field>

          <Field label="🌐 भाषा / Language">
            <div className="flex gap-3">
              {[['hi','हिंदी'],['en','English']].map(([val, label]) => (
                <button key={val} type="button"
                  onClick={() => set('language', val)}
                  className={`flex-1 py-2 rounded-xl border font-semibold text-sm transition-colors ${
                    form.language === val
                      ? 'bg-primary text-white border-primary'
                      : 'border-gray-200 text-gray-600'
                  }`}>{label}</button>
              ))}
            </div>
          </Field>

          <button className="btn-primary" disabled={loading}>
            {loading ? 'जमा हो रहा है…' : 'पंजीकरण करें'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-4">
          पहले से खाता है?{' '}
          <Link to="/login" className="text-primary font-semibold">लॉगिन करें</Link>
        </p>
      </div>
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
