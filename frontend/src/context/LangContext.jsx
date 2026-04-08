// context/LangContext.jsx — Hindi / English i18n
import { createContext, useContext } from 'react';
import { useAuth } from './AuthContext';

// All UI strings in both languages
const strings = {
  // Nav
  home:        { hi: 'होम',       en: 'Home' },
  weather:     { hi: 'मौसम',      en: 'Weather' },
  crops:       { hi: 'फसल',      en: 'Crops' },
  disease:     { hi: 'रोग',       en: 'Disease' },
  soil:        { hi: 'मिट्टी',    en: 'Soil' },
  irrigation:  { hi: 'सिंचाई',    en: 'Irrigation' },
  market:      { hi: 'बाज़ार',    en: 'Market' },
  alerts:      { hi: 'सूचनाएं',   en: 'Alerts' },
  profile:     { hi: 'प्रोफाइल',  en: 'Profile' },
  logout:      { hi: 'लॉग आउट', en: 'Logout' },

  // Auth
  login:       { hi: 'लॉगिन करें',    en: 'Login' },
  register:    { hi: 'पंजीकरण करें',  en: 'Register' },
  phone:       { hi: 'मोबाइल नंबर',   en: 'Phone Number' },
  password:    { hi: 'पासवर्ड',        en: 'Password' },
  name:        { hi: 'नाम',           en: 'Name' },
  village:     { hi: 'गाँव',          en: 'Village' },
  district:    { hi: 'जिला',          en: 'District' },
  altitude:    { hi: 'ऊँचाई (मीटर)', en: 'Altitude (m)' },
  land_size:   { hi: 'खेत (एकड़)',    en: 'Land (acres)' },

  // Weather
  temp:        { hi: 'तापमान',        en: 'Temperature' },
  humidity:    { hi: 'आर्द्रता',       en: 'Humidity' },
  wind:        { hi: 'हवा',           en: 'Wind' },
  insights:    { hi: 'सुझाव',         en: 'Insights' },

  // General
  loading:     { hi: 'लोड हो रहा है…', en: 'Loading…' },
  submit:      { hi: 'जमा करें',       en: 'Submit' },
  result:      { hi: 'परिणाम',         en: 'Result' },
  upload:      { hi: 'फोटो अपलोड करें', en: 'Upload Photo' },
  analyzing:   { hi: 'विश्लेषण हो रहा है…', en: 'Analyzing…' },
  no_result:   { hi: 'कोई परिणाम नहीं', en: 'No results found' },
};

const LangContext = createContext(null);

export function LangProvider({ children }) {
  const { lang } = useAuth();

  // t('home') → "होम" or "Home"
  const t = (key) => strings[key]?.[lang] ?? strings[key]?.en ?? key;

  return (
    <LangContext.Provider value={{ t, lang }}>
      {children}
    </LangContext.Provider>
  );
}

export const useLang = () => useContext(LangContext);
