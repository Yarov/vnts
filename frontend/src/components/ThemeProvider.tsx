import { useEffect } from 'react';
import { useAppSettings, isValidHexColor } from '../hooks/useAppSettings';
import { lighten, darken } from '../utils/colorUtils';

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { settings, isLoading } = useAppSettings();

  // Función para aplicar los colores
  const applyColors = (primaryColor: string) => {
    if (!isValidHexColor(primaryColor)) return;
    document.documentElement.style.setProperty('--primary-color', primaryColor);
    document.documentElement.style.setProperty('--primary-hover', darken(primaryColor, 0.15));
    document.documentElement.style.setProperty('--primary-light', lighten(primaryColor, 0.15));
    document.documentElement.style.setProperty('--primary-50', lighten(primaryColor, 0.95));
    document.documentElement.style.setProperty('--primary-100', lighten(primaryColor, 0.90));
    document.documentElement.style.setProperty('--primary-200', lighten(primaryColor, 0.80));
    document.documentElement.style.setProperty('--primary-300', lighten(primaryColor, 0.70));
    document.documentElement.style.setProperty('--primary-400', lighten(primaryColor, 0.60));
    document.documentElement.style.setProperty('--primary-500', primaryColor);
    document.documentElement.style.setProperty('--primary-600', darken(primaryColor, 0.10));
    document.documentElement.style.setProperty('--primary-700', darken(primaryColor, 0.20));
    document.documentElement.style.setProperty('--primary-800', darken(primaryColor, 0.30));
    document.documentElement.style.setProperty('--primary-900', darken(primaryColor, 0.40));
    document.documentElement.style.setProperty('--primary-950', darken(primaryColor, 0.50));
  };

  // Aplicar colores cuando el componente se monta y cuando cambian los settings
  useEffect(() => {
    if (!isLoading && isValidHexColor(settings.primary_color)) {
      applyColors(settings.primary_color);
    }
  }, [settings.primary_color, isLoading]);

  // Aplicar colores inmediatamente si ya están disponibles
  useEffect(() => {
    if (isValidHexColor(settings.primary_color)) {
      applyColors(settings.primary_color);
    }
  }, []);

  return <>{children}</>;
}