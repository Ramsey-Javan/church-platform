import { createContext, useContext, useEffect, useState } from 'react';
import { getChurchSettings } from '../api/client';

const ChurchSettingsContext = createContext({ settings: null, status: 'loading' });

export function ChurchSettingsProvider({ children }) {
  const [settings, setSettings] = useState(null);
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    getChurchSettings()
      .then((data) => {
        setSettings(data);
        setStatus('ready');
      })
      .catch(() => setStatus('error'));
  }, []);

  return (
    <ChurchSettingsContext.Provider value={{ settings, status }}>
      {children}
    </ChurchSettingsContext.Provider>
  );
}

export const useChurchSettings = () => useContext(ChurchSettingsContext);