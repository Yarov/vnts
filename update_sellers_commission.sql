-- Script para actualizar los vendedores existentes con porcentajes de comisión
-- Ejecutar en el SQL Editor de Supabase

-- Verificar si existe la columna commission_percentage, y si no, agregarla
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'sellers' AND column_name = 'commission_percentage'
  ) THEN
    ALTER TABLE sellers ADD COLUMN commission_percentage DECIMAL(5,2) DEFAULT 0.00;
  END IF;
END $$;

-- Actualizar el vendedor de prueba con una comisión del 5%
UPDATE sellers
SET commission_percentage = 5.00
WHERE numeric_code = '1234' AND commission_percentage = 0;

-- Actualizar el resto de vendedores que tengan comisión en 0
UPDATE sellers
SET commission_percentage = 
  CASE 
    WHEN name LIKE '%Senior%' THEN 7.50
    WHEN name LIKE '%Jr%' OR name LIKE '%Junior%' THEN 3.50
    ELSE 5.00
  END
WHERE commission_percentage = 0;

-- Verificar los vendedores y sus comisiones
SELECT 
  id,
  name,
  numeric_code,
  active,
  commission_percentage,
  created_at
FROM 
  sellers
ORDER BY 
  name;
