import { useState, useEffect } from 'react';
import { getOrganizationBySlug } from '../services/organizationService';

interface OrgBranding {
  primaryColor: string;
  orgName: string;
  orgId: string | null;
}

// Color azul profesional por defecto
const DEFAULT_PRIMARY_COLOR = '#3b82f6';

/**
 * Hook para cargar el branding de una organización por su slug
 * Si no hay slug, usa el color azul por defecto
 * 
 * @param orgSlug - Slug de la organización (opcional)
 * @returns Branding de la organización
 */
export function useOrgBranding(orgSlug?: string) {
  const [branding, setBranding] = useState<OrgBranding>({
    primaryColor: DEFAULT_PRIMARY_COLOR,
    orgName: '',
    orgId: null
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Función para aplicar el color con transición
  const applyColor = (color: string) => {
    document.documentElement.style.setProperty('transition', 'background-color 0.3s, border-color 0.3s, color 0.3s');
    
    document.documentElement.style.setProperty('--primary-color', color);
    document.documentElement.style.setProperty(
      '--primary-hover',
      `color-mix(in srgb, ${color} 85%, black)`
    );
    
    // Generar escala de colores
    document.documentElement.style.setProperty(
      '--primary-50',
      `color-mix(in srgb, ${color} 10%, white)`
    );
    document.documentElement.style.setProperty(
      '--primary-100',
      `color-mix(in srgb, ${color} 20%, white)`
    );
    document.documentElement.style.setProperty(
      '--primary-200',
      `color-mix(in srgb, ${color} 40%, white)`
    );
    document.documentElement.style.setProperty(
      '--primary-300',
      `color-mix(in srgb, ${color} 60%, white)`
    );
    document.documentElement.style.setProperty(
      '--primary-400',
      `color-mix(in srgb, ${color} 80%, white)`
    );
    document.documentElement.style.setProperty('--primary-500', color);
    document.documentElement.style.setProperty(
      '--primary-600',
      `color-mix(in srgb, ${color} 80%, black)`
    );
    document.documentElement.style.setProperty(
      '--primary-700',
      `color-mix(in srgb, ${color} 60%, black)`
    );
    document.documentElement.style.setProperty(
      '--primary-800',
      `color-mix(in srgb, ${color} 50%, black)`
    );
    document.documentElement.style.setProperty(
      '--primary-900',
      `color-mix(in srgb, ${color} 40%, black)`
    );
    document.documentElement.style.setProperty(
      '--primary-950',
      `color-mix(in srgb, ${color} 25%, black)`
    );

    setTimeout(() => {
      document.documentElement.style.removeProperty('transition');
    }, 300);
  };

  useEffect(() => {
    const loadBranding = async () => {
      try {
        setIsLoading(true);
        setError(null);

        if (!orgSlug) {
          // Sin slug = usar color azul por defecto
          console.log('Sin slug de organización, usando color por defecto');
          applyColor(DEFAULT_PRIMARY_COLOR);
          setBranding({
            primaryColor: DEFAULT_PRIMARY_COLOR,
            orgName: '',
            orgId: null
          });
          return;
        }

        // Buscar organización por slug
        const org = await getOrganizationBySlug(orgSlug);

        if (!org) {
          console.warn(`Organización con slug "${orgSlug}" no encontrada`);
          setError('Organización no encontrada');
          applyColor(DEFAULT_PRIMARY_COLOR);
          return;
        }

        const color = org.primary_color || DEFAULT_PRIMARY_COLOR;
        
        setBranding({
          primaryColor: color,
          orgName: org.name,
          orgId: org.id
        });
        
        applyColor(color);
        console.log(`Branding cargado para "${org.name}": ${color}`);
      } catch (err) {
        console.error('Error al cargar branding:', err);
        setError('Error al cargar el branding');
        applyColor(DEFAULT_PRIMARY_COLOR);
      } finally {
        setIsLoading(false);
      }
    };

    loadBranding();
  }, [orgSlug]);

  return { branding, isLoading, error };
}
