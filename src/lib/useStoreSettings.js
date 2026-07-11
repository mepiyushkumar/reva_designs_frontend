import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

let cachedSettings = null;
const listeners = new Set();

export function useStoreSettings() {
  const [settings, setSettings] = useState(cachedSettings);

  useEffect(() => {
    if (cachedSettings) { setSettings(cachedSettings); return; }
    base44.entities.StoreSettings.list('-created_date', 1).then(res => {
      const s = res[0] || null;
      cachedSettings = s;
      setSettings(s);
      listeners.forEach(fn => fn(s));
    }).catch(() => {});

    listeners.add(setSettings);
    return () => listeners.delete(setSettings);
  }, []);

  return settings;
}