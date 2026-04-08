// pages/LoginPage.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate  = useNavigate();
  const [form, setForm] = useState({ phone: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', form);
      login(data, data.token);
      toast.success('स्वागत है! Welcome back!');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary to-primary/80 flex flex-col items-center justify-center px-6">
      {/* Logo area */}
      <div className="text-center mb-8">
        <div className="text-6xl mb-3">🌾</div>
        <h1 className="text-white text-2xl font-bold">स्मार्ट कृषि सहायक</h1>
        <p className="text-white/70 text-sm mt-1">Smart Farming Assistant</p>
        <p className="text-white/60 text-xs mt-1">उत्तराखंड · हिमालयी किसानों के लिए</p>
      </div>

      {/* Form card */}
      <div className="card w-full max-w-sm">
        <h2 className="text-lg font-bold text-gray-800 mb-5 text-center">लॉगिन करें</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">📱 मोबाइल नंबर</label>
            <input
              className="input-field"
              type="tel"
              placeholder="9876543210"
              value={form.phone}
              onChange={e => setForm({ ...form, phone: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">🔒 पासवर्ड</label>
            <input
              className="input-field"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>
          <button className="btn-primary mt-2" disabled={loading}>
            {loading ? 'लोड हो रहा है…' : 'लॉगिन करें'}
          </button>
        </form>
        <p className="text-center text-sm text-gray-500 mt-4">
          नया खाता?{' '}
          <Link to="/register" className="text-primary font-semibold">पंजीकरण करें</Link>
        </p>
      </div>
    </div>
  );
}
