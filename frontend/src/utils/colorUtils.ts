// Utilidades para manipulación de colores HEX

// Convierte HEX a RGB
export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  hex = hex.replace('#', '');
  if (hex.length === 3) {
    hex = hex.split('').map((c) => c + c).join('');
  }
  const num = parseInt(hex, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

// Convierte RGB a HEX
export function rgbToHex(r: number, g: number, b: number): string {
  return (
    '#' +
    [r, g, b]
      .map((x) => {
        const hex = x.toString(16);
        return hex.length === 1 ? '0' + hex : hex;
      })
      .join('')
  );
}

// Mezcla dos colores en proporción (0-1)
export function mixColors(hex1: string, hex2: string, weight: number): string {
  const rgb1 = hexToRgb(hex1);
  const rgb2 = hexToRgb(hex2);
  const r = Math.round(rgb1.r * weight + rgb2.r * (1 - weight));
  const g = Math.round(rgb1.g * weight + rgb2.g * (1 - weight));
  const b = Math.round(rgb1.b * weight + rgb2.b * (1 - weight));
  return rgbToHex(r, g, b);
}

// Aclara un color mezclando con blanco
export function lighten(hex: string, amount: number): string {
  return mixColors(hex, '#ffffff', 1 - amount);
}

// Oscurece un color mezclando con negro
export function darken(hex: string, amount: number): string {
  return mixColors(hex, '#000000', 1 - amount);
}