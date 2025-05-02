import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

interface AppSettings {
  primary_color: string;
}

interface AppSettingRecord {
  key: string;
  value: string;
}

// Función para validar formato de color hexadecimal
const isValidHexColor = (color: string): boolean => {
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
};

// Función para convertir color a formato hexadecimal válido
const normalizeColor = (color: string): string => {
  // Remover espacios y convertir a minúsculas
  color = color.trim().toLowerCase();

  // Si no empieza con #, agregarlo
  if (!color.startsWith('#')) {
    color = '#' + color;
  }

  // Si es formato corto (#rgb), convertir a formato largo (#rrggbb)
  if (color.length === 4) {
    color = '#' + color[1] + color[1] + color[2] + color[2] + color[3] + color[3];
  }

  return color;
};

export function useAppSettings() {
  const [settings, setSettings] = useState<AppSettings>({
    primary_color: 'transparent', // Color por defecto transparente
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Función para aplicar el color con transición
  const applyColorWithTransition = (color: string) => {
    // Agregar transición suave a los colores
    document.documentElement.style.setProperty('transition', 'background-color 0.3s, border-color 0.3s, color 0.3s');

    // Aplicar el nuevo color
    document.documentElement.style.setProperty('--primary-color', color);
    document.documentElement.style.setProperty(
      '--primary-hover',
      `color-mix(in srgb, ${color} 85%, black)`
    );
    document.documentElement.style.setProperty(
      '--primary-light',
      `color-mix(in srgb, ${color} 15%, white)`
    );

    // Remover la transición después de un momento para que no afecte otros cambios
    setTimeout(() => {
      document.documentElement.style.removeProperty('transition');
    }, 300);
  };

  const fetchSettings = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('app_settings')
        .select('*')
        .single();

      if (error) throw error;

      if (data) {
        const newSettings = {
          primary_color: data.value
        };
        setSettings(newSettings);
        applyColorWithTransition(data.value);
      }
    } catch (error: any) {
      console.error('Error al cargar configuración:', error);
      setError('Error al cargar la configuración');
    } finally {
      setIsLoading(false);
    }
  };

  const updateSetting = async (key: keyof AppSettings, value: string) => {
    try {
      setError(null);

      if (key === 'primary_color') {
        const normalizedColor = normalizeColor(value);
        if (!isValidHexColor(normalizedColor)) {
          throw new Error('Color inválido. Use formato hexadecimal (ej: #FF0000)');
        }
        value = normalizedColor;
      }

      // Actualizar el estado inmediatamente para una respuesta instantánea
      setSettings(prev => ({
        ...prev,
        [key]: value
      }));

      // Aplicar el color con transición
      if (key === 'primary_color') {
        applyColorWithTransition(value);
      }

      const { error } = await supabase
        .from('app_settings')
        .update({ value })
        .eq('key', key);

      if (error) {
        // Si hay error, revertir al estado anterior
        await fetchSettings();
        throw error;
      }

      return true;
    } catch (error: any) {
      console.error('Error al actualizar configuración:', error);
      setError(error.message || 'Error al actualizar la configuración');
      return false;
    }
  };

  // Suscribirse a cambios en tiempo real
  useEffect(() => {
    fetchSettings();

    const channel: RealtimeChannel = supabase
      .channel('app_settings_changes')
      .on(
        'postgres_changes' as any,
        {
          event: '*',
          schema: 'public',
          table: 'app_settings'
        },
        (payload: { new: AppSettingRecord }) => {
          if (payload.new) {
            setSettings(prev => ({
              ...prev,
              primary_color: payload.new.value
            }));
            applyColorWithTransition(payload.new.value);
          }
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, []);

  return {
    settings,
    isLoading,
    error,
    updateSetting,
    refreshSettings: fetchSettings,
    isValidHexColor,
    normalizeColor
  };
}