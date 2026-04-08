// pages/MarketPage.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const CROPS = ['potato','apple','rajma','pea','garlic','barley','buckwheat','tomato'];

export default function MarketPage() {
  const { lang } = useAuth();
  const [prices, setPrices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all(CROPS.map(c => api.get(`/market/${c}`)))
      .then(results => setPrices(results.map(r => r.data)))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64 text-primary font-semibold">Loading…</div>;

  return (
    <div className="px-4 pt-5 space-y-4">
      <h2 className="text-xl font-bold text-gray-800">
        {lang === 'hi' ? '🏪 मंडी भाव' : '🏪 Mandi Prices'}
      </h2>
      <p className="text-xs text-gray-400">
        {lang === 'hi' ? 'रुपये प्रति क्विंटल (₹/qtl)' : 'Price in ₹ per quintal'}
      </p>

      <div className="space-y-2">
        {prices.map((p, i) => p.price_per_quintal && (
          <div key={i} className="card flex items-center justify-between">
            <div>
              <p className="font-bold text-gray-800 capitalize">{p.crop}</p>
              <p className="text-xs text-gray-500">{p.best_market}</p>
            </div>
            <div className="text-right">
              <p className="font-bold text-lg text-primary">₹{p.price_per_quintal}</p>
              <p className="text-xs">{p.trend}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="card bg-amber-50 border-amber-100 text-sm text-amber-800">
        {lang === 'hi'
          ? '💡 सुझाव: सेब और लहसुन में सबसे अच्छा भाव है।'
          : '💡 Tip: Apple and garlic have the best prices right now.'}
      </div>
    </div>
  );
}
