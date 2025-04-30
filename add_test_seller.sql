-- Script para agregar un vendedor de prueba en Supabase
-- Ejecutar en el SQL Editor de Supabase

-- Verifica si ya existe un vendedor con código 1234
DO $$
DECLARE
  count_sellers INTEGER;
BEGIN
  SELECT COUNT(*) INTO count_sellers 
  FROM sellers 
  WHERE numeric_code = '1234';
  
  IF count_sellers > 0 THEN
    -- Actualiza el vendedor existente a activo y con comisión del 5%
    UPDATE sellers 
    SET active = true, commission_percentage = 5.00
    WHERE numeric_code = '1234';
    
    RAISE NOTICE 'Vendedor con código 1234 ya existía. Se ha activado con comisión del 5%.';
  ELSE
    -- Inserta un nuevo vendedor con código 1234 y comisión del 5%
    INSERT INTO sellers (name, numeric_code, active, commission_percentage)
    VALUES ('Vendedor Prueba', '1234', true, 5.00);
    
    RAISE NOTICE 'Nuevo vendedor creado con código 1234 y comisión del 5%.';
  END IF;
END $$;

-- Muestra los vendedores actuales
SELECT id, name, numeric_code, active, commission_percentage, created_at
FROM sellers
ORDER BY created_at DESC;
