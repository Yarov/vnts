import { useState, useEffect } from 'react';

interface AppSettings {
  primary_color: string;
}

const DEFAULT_PRIMARY_COLOR = '#3b82f6';

export function isValidHexColor(color: string): boolean {
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
}

const normalizeColor = (color: string): string => {
  color = color.trim().toLowerCase();
  if (!color.startsWith('#')) {
    color = '#' + color;
  }
  if (color.length === 4) {
    color = '#' + color[1] + color[1] + color[2] + color[2] + color[3] + color[3];
  }
  return color;
};

export function useAppSettings() {
  const [settings, setSettings] = useState<AppSettings>({
    primary_color: DEFAULT_PRIMARY_COLOR,
  });
  const [isLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const applyColorWithTransition = (color: string) => {
    document.documentElement.style.setProperty('--primary-color', color);
    document.documentElement.style.setProperty('--primary-hover', `color-mix(in srgb, ${color} 85%, black)`);
    document.documentElement.style.setProperty('--primary-light', `color-mix(in srgb, ${color} 15%, white)`);
  };

  useEffect(() => {
    applyColorWithTransition(DEFAULT_PRIMARY_COLOR);
  }, []);

  const updateSetting = async (key: keyof AppSettings, value: string) => {
    try {
      setError(null);
      if (key === 'primary_color') {
        const normalizedColor = normalizeColor(value);
        if (!isValidHexColor(normalizedColor)) {
          throw new Error('Color invalido');
        }
        value = normalizedColor;
      }
      setSettings(prev => ({ ...prev, [key]: value }));
      if (key === 'primary_color') {
        applyColorWithTransition(value);
      }
      return true;
    } catch (error: any) {
      setError(error.message);
      return false;
    }
  };

  return {
    settings,
    isLoading,
    error,
    updateSetting,
    refreshSettings: () => {},
    isValidHexColor,
    normalizeColor
  };
}
