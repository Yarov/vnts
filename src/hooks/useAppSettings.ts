import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js';

interface AppSettings {
  primary_color: string;
}

interface AppSettingsRecord {
  key: string;
  value: string;
}

type AppSettingsPayload = RealtimePostgresChangesPayload<AppSettingsRecord>;

// Función para validar formato de color hexadecimal
export function isValidHexColor(color: string): boolean {
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
}

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
    primary_color: '', // Sin color por defecto
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

    // Aplicar variantes de Tailwind
    document.documentElement.style.setProperty(
      '--primary-50',
      `color-mix(in srgb, ${color} 5%, white)`
    );
    document.documentElement.style.setProperty(
      '--primary-100',
      `color-mix(in srgb, ${color} 10%, white)`
    );
    document.documentElement.style.setProperty(
      '--primary-200',
      `color-mix(in srgb, ${color} 20%, white)`
    );
    document.documentElement.style.setProperty(
      '--primary-300',
      `color-mix(in srgb, ${color} 30%, white)`
    );
    document.documentElement.style.setProperty(
      '--primary-400',
      `color-mix(in srgb, ${color} 40%, white)`
    );
    document.documentElement.style.setProperty(
      '--primary-500',
      color
    );
    document.documentElement.style.setProperty(
      '--primary-600',
      `color-mix(in srgb, ${color} 85%, black)`
    );
    document.documentElement.style.setProperty(
      '--primary-700',
      `color-mix(in srgb, ${color} 70%, black)`
    );
    document.documentElement.style.setProperty(
      '--primary-800',
      `color-mix(in srgb, ${color} 55%, black)`
    );
    document.documentElement.style.setProperty(
      '--primary-900',
      `color-mix(in srgb, ${color} 40%, black)`
    );
    document.documentElement.style.setProperty(
      '--primary-950',
      `color-mix(in srgb, ${color} 25%, black)`
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
        .eq('key', 'primary_color')
        .single();

      if (error) {
        console.warn('Error al cargar configuración:', error);
        // Si no hay datos, no aplicar color por defecto
        return;
      }

      if (data) {
        const newSettings = {
          primary_color: data.value
        };
        setSettings(newSettings);
        applyColorWithTransition(data.value);
      } else {
        // Si no hay datos, no insertar color por defecto
        return;
      }
    } catch (error: any) {
      console.error('Error al cargar configuración:', error);
      setError('Error al cargar la configuración');
      // No aplicar color por defecto en caso de error
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

      // Verificar si el registro existe
      const { data: existingData } = await supabase
        .from('app_settings')
        .select('*')
        .eq('key', key)
        .single();

      let result;

      if (existingData) {
        // Actualizar registro existente
        result = await supabase
          .from('app_settings')
          .update({ value })
          .eq('key', key);
      } else {
        // Insertar nuevo registro
        result = await supabase
          .from('app_settings')
          .insert([{ key, value }]);
      }

      if (result.error) {
        // Si hay error, revertir al estado anterior
        await fetchSettings();
        throw result.error;
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
    // Aplicar color por defecto inmediatamente para evitar flash de colores
    applyColorWithTransition(settings.primary_color);

    // Cargar configuración
    fetchSettings();

    // Configurar escucha de cambios en tiempo real
    const channel = supabase
      .channel('app_settings_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'app_settings'
        },
        (payload: AppSettingsPayload) => {
          const newRecord = payload.new as AppSettingsRecord | null;
          if (newRecord && newRecord.key === 'primary_color') {
            setSettings(prev => ({
              ...prev,
              primary_color: newRecord.value
            }));
            applyColorWithTransition(newRecord.value);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
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