// pages/DiseasePage.jsx — Plant disease detection via image upload
import { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { FaCamera, FaUpload } from 'react-icons/fa';

export default function DiseasePage() {
  const { lang } = useAuth();
  const { t }    = useLang();
  const inputRef = useRef(null);

  const [preview,  setPreview]  = useState(null);
  const [file,     setFile]     = useState(null);
  const [result,   setResult]   = useState(null);
  const [loading,  setLoading]  = useState(false);

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    setResult(null);
    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target.result);
    reader.readAsDataURL(f);
  };

  const handleAnalyze = async () => {
    if (!file) return;
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const { data } = await api.post('/disease-detect/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setResult(data);
    } catch {
      toast.error(lang === 'hi' ? 'विश्लेषण विफल' : 'Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  const severityColor = {
    low:    'bg-yellow-50 border-yellow-200 text-yellow-800',
    medium: 'bg-orange-50 border-orange-200 text-orange-800',
    high:   'bg-red-50 border-red-200 text-red-800',
  };

  return (
    <div className="px-4 pt-5 space-y-4">
      <h2 className="text-xl font-bold text-gray-800">
        {lang === 'hi' ? '🔬 रोग पहचान' : '🔬 Disease Detection'}
      </h2>
      <p className="text-sm text-gray-500">
        {lang === 'hi'
          ? 'पौधे की पत्ती की फोटो अपलोड करें'
          : 'Upload a photo of the plant leaf'}
      </p>

      {/* Upload zone */}
      <div
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-colors min-h-48 ${
          preview ? 'border-primary/40' : 'border-gray-300 hover:border-primary'
        }`}
      >
        {preview ? (
          <img src={preview} alt="preview" className="w-full h-56 object-cover rounded-2xl" />
        ) : (
          <div className="text-center py-10 px-4">
            <FaCamera size={40} className="text-gray-300 mx-auto mb-3" />
            <p className="font-semibold text-gray-600">
              {lang === 'hi' ? 'फोटो चुनें' : 'Choose Photo'}
            </p>
            <p className="text-xs text-gray-400 mt-1">JPG / PNG</p>
          </div>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
      />

      {preview && (
        <div className="flex gap-3">
          <button
            onClick={() => { setPreview(null); setFile(null); setResult(null); }}
            className="flex-1 py-3 border border-gray-200 rounded-xl text-gray-600 font-semibold active:scale-95 transition-transform"
          >
            {lang === 'hi' ? 'हटाएं' : 'Remove'}
          </button>
          <button
            onClick={handleAnalyze}
            disabled={loading}
            className="flex-1 btn-primary"
          >
            {loading
              ? (lang === 'hi' ? 'विश्लेषण हो रहा है…' : 'Analyzing…')
              : (lang === 'hi' ? '🔍 विश्लेषण करें' : '🔍 Analyze')}
          </button>
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="space-y-3">
          {/* Disease name + confidence */}
          <div className={`card border ${result.is_healthy ? 'bg-green-50 border-green-200' : severityColor[result.severity]}`}>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-lg">{result.disease}</h3>
              <span className={`badge ${result.is_healthy ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {result.confidence}%
              </span>
            </div>
            {result.is_healthy ? (
              <p className="text-green-700 font-medium">
                ✅ {lang === 'hi' ? 'पौधा स्वस्थ है!' : 'Plant looks healthy!'}
              </p>
            ) : (
              <div className="text-xs font-medium">
                {lang === 'hi' ? 'गंभीरता' : 'Severity'}: {result.severity}
              </div>
            )}
          </div>

          {!result.is_healthy && (
            <>
              {/* Chemical treatment */}
              <div className="card">
                <h4 className="font-bold text-gray-700 mb-2">
                  💊 {lang === 'hi' ? 'उपचार' : 'Treatment'}
                </h4>
                <p className="text-sm text-gray-700">{result.treatment}</p>
              </div>

              {/* Organic remedy */}
              <div className="card bg-green-50 border-green-100">
                <h4 className="font-bold text-green-800 mb-2">
                  🌿 {lang === 'hi' ? 'जैविक उपाय' : 'Organic Remedy'}
                </h4>
                <p className="text-sm text-green-800">{result.organic_remedy}</p>
              </div>
            </>
          )}

          {/* Retake */}
          <button
            onClick={() => { setPreview(null); setFile(null); setResult(null); }}
            className="w-full py-3 border border-gray-200 rounded-xl text-gray-600 font-semibold"
          >
            {lang === 'hi' ? '📷 नई फोटो लें' : '📷 Try Another Photo'}
          </button>
        </div>
      )}
    </div>
  );
}
