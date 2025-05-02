import { useEffect } from 'react';
import { useAppSettings } from '../hooks/useAppSettings';

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { settings, isLoading } = useAppSettings();

  // Función para aplicar los colores
  const applyColors = (primaryColor: string) => {
    // Primary color and its variants
    document.documentElement.style.setProperty('--primary-color', primaryColor);
    document.documentElement.style.setProperty(
      '--primary-hover',
      `color-mix(in srgb, ${primaryColor} 85%, black)`
    );
    document.documentElement.style.setProperty(
      '--primary-light',
      `color-mix(in srgb, ${primaryColor} 15%, white)`
    );

    // Additional variants
    document.documentElement.style.setProperty(
      '--primary-50',
      `color-mix(in srgb, ${primaryColor} 5%, white)`
    );
    document.documentElement.style.setProperty(
      '--primary-100',
      `color-mix(in srgb, ${primaryColor} 10%, white)`
    );
    document.documentElement.style.setProperty(
      '--primary-200',
      `color-mix(in srgb, ${primaryColor} 20%, white)`
    );
    document.documentElement.style.setProperty(
      '--primary-300',
      `color-mix(in srgb, ${primaryColor} 30%, white)`
    );
    document.documentElement.style.setProperty(
      '--primary-400',
      `color-mix(in srgb, ${primaryColor} 40%, white)`
    );
    document.documentElement.style.setProperty(
      '--primary-500',
      primaryColor
    );
    document.documentElement.style.setProperty(
      '--primary-600',
      `color-mix(in srgb, ${primaryColor} 85%, black)`
    );
    document.documentElement.style.setProperty(
      '--primary-700',
      `color-mix(in srgb, ${primaryColor} 70%, black)`
    );
    document.documentElement.style.setProperty(
      '--primary-800',
      `color-mix(in srgb, ${primaryColor} 55%, black)`
    );
    document.documentElement.style.setProperty(
      '--primary-900',
      `color-mix(in srgb, ${primaryColor} 40%, black)`
    );
    document.documentElement.style.setProperty(
      '--primary-950',
      `color-mix(in srgb, ${primaryColor} 25%, black)`
    );
  };

  // Aplicar colores cuando el componente se monta y cuando cambian los settings
  useEffect(() => {
    if (!isLoading && settings.primary_color) {
      applyColors(settings.primary_color);
    }
  }, [settings.primary_color, isLoading]);

  // Aplicar colores inmediatamente si ya están disponibles
  useEffect(() => {
    if (settings.primary_color) {
      applyColors(settings.primary_color);
    }
  }, []);

  return <>{children}</>;
}