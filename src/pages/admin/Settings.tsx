import React, { useState, useEffect } from 'react';
import { useAppSettings } from '../../hooks/useAppSettings';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { CheckIcon } from '@heroicons/react/24/outline';

export default function Settings() {
  const { settings, updateSetting, error, isValidHexColor, normalizeColor } = useAppSettings();
  const [selectedColor, setSelectedColor] = useState(settings.primary_color);
  const [colorInput, setColorInput] = useState(settings.primary_color);
  const [isSaving, setIsSaving] = useState(false);
  const [inputError, setInputError] = useState('');

  // Actualizar los estados cuando se carguen los settings
  useEffect(() => {
    if (settings.primary_color && settings.primary_color !== 'transparent') {
      setSelectedColor(settings.primary_color);
      setColorInput(settings.primary_color);
    }
  }, [settings.primary_color]);

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = e.target.value;
    setSelectedColor(newColor);
    setColorInput(newColor);
    setInputError('');
  };

  const handleColorInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setColorInput(value);
    setInputError('');

    try {
      const normalizedColor = normalizeColor(value);
      if (isValidHexColor(normalizedColor)) {
        setSelectedColor(normalizedColor);
      }
    } catch (err) {
      // No establecer error aquí para permitir que el usuario siga escribiendo
    }
  };

  const handleColorInputBlur = () => {
    try {
      const normalizedColor = normalizeColor(colorInput);
      if (isValidHexColor(normalizedColor)) {
        setSelectedColor(normalizedColor);
        setColorInput(normalizedColor);
        setInputError('');
      } else {
        setInputError('Color inválido. Use formato hexadecimal (ej: #FF0000)');
      }
    } catch (err) {
      setInputError('Color inválido. Use formato hexadecimal (ej: #FF0000)');
    }
  };

  const handleSave = async () => {
    if (!isValidHexColor(selectedColor)) {
      setInputError('Color inválido. Use formato hexadecimal (ej: #FF0000)');
      return;
    }

    setIsSaving(true);
    await updateSetting('primary_color', selectedColor);
    setIsSaving(false);
  };

  const presetColors = [
    '#3B82F6', // Blue
    '#10B981', // Green
    '#8B5CF6', // Purple
    '#EF4444', // Red
    '#F59E0B', // Yellow
    '#6366F1', // Indigo
  ];

  // Mostrar un estado de carga inicial si el color es transparente
  if (settings.primary_color === 'transparent') {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Configuración</h2>
        </div>
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-medium mb-4">Personalización</h3>
            <div className="animate-pulse">
              <div className="h-10 bg-gray-200 rounded w-full max-w-sm"></div>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Configuración</h2>
      </div>

      <Card>
        <div className="p-6">
          <h3 className="text-lg font-medium mb-4">Personalización</h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Color Primario
              </label>

              <div className="flex items-center gap-4">
                <input
                  type="color"
                  value={selectedColor}
                  onChange={handleColorChange}
                  className="h-10 w-20 rounded border border-gray-300"
                />
                <Input
                  value={colorInput}
                  onChange={handleColorInputChange}
                  onBlur={handleColorInputBlur}
                  placeholder="#FF0000"
                  className="w-32"
                  error={inputError}
                />
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Colores Predefinidos
                </label>
                <div className="flex flex-wrap gap-2">
                  {presetColors.map((color) => (
                    <button
                      key={color}
                      onClick={() => {
                        setSelectedColor(color);
                        setColorInput(color);
                        setInputError('');
                      }}
                      className={`w-8 h-8 rounded-full border-2 ${
                        selectedColor === color ? 'border-gray-900' : 'border-gray-200'
                      }`}
                      style={{ backgroundColor: color }}
                    >
                      {selectedColor === color && (
                        <CheckIcon className="h-4 w-4 text-white mx-auto" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {error && (
              <p className="text-sm text-red-600 mt-2">{error}</p>
            )}

            <div className="flex justify-end mt-6">
              <Button
                variant="primary"
                onClick={handleSave}
                disabled={isSaving || selectedColor === settings.primary_color || !!inputError}
              >
                {isSaving ? 'Guardando...' : 'Guardar Cambios'}
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}