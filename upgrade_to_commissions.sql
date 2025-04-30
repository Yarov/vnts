-- Script para actualizar una base de datos existente de VNTS agregando el sistema de comisiones
-- Ejecutar en el SQL Editor de Supabase

-- Agregar la columna de comisión a la tabla de vendedores si no existe
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'sellers' AND column_name = 'commission_percentage'
  ) THEN
    ALTER TABLE sellers ADD COLUMN commission_percentage DECIMAL(5,2) DEFAULT 0.00;
    RAISE NOTICE 'Columna commission_percentage agregada a la tabla sellers';
  ELSE
    RAISE NOTICE 'La columna commission_percentage ya existe en la tabla sellers';
  END IF;
END $$;

-- Función para calcular comisiones ganadas por vendedor en un período
CREATE OR REPLACE FUNCTION get_seller_commissions(
  seller_id UUID,
  start_date TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  end_date TIMESTAMP WITH TIME ZONE DEFAULT NULL
)
RETURNS TABLE (
  seller_id UUID,
  seller_name TEXT,
  total_sales DECIMAL(10,2),
  commission_percentage DECIMAL(5,2),
  commission_amount DECIMAL(10,2)
) 
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    s.id AS seller_id,
    s.name AS seller_name,
    COALESCE(SUM(sa.total), 0) AS total_sales,
    s.commission_percentage,
    COALESCE(SUM(sa.total) * s.commission_percentage / 100, 0) AS commission_amount
  FROM
    sellers s
  LEFT JOIN
    sales sa ON s.id = sa.seller_id
    AND (
      (start_date IS NULL OR sa.created_at >= start_date)
      AND
      (end_date IS NULL OR sa.created_at <= end_date)
    )
  WHERE
    s.id = seller_id
  GROUP BY
    s.id, s.name, s.commission_percentage;
END;
$$;

-- Función para obtener comisiones de todos los vendedores
CREATE OR REPLACE FUNCTION get_all_seller_commissions(
  start_date TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  end_date TIMESTAMP WITH TIME ZONE DEFAULT NULL
)
RETURNS TABLE (
  seller_id UUID,
  seller_name TEXT,
  total_sales DECIMAL(10,2),
  commission_percentage DECIMAL(5,2),
  commission_amount DECIMAL(10,2)
) 
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    s.id AS seller_id,
    s.name AS seller_name,
    COALESCE(SUM(sa.total), 0) AS total_sales,
    s.commission_percentage,
    COALESCE(SUM(sa.total) * s.commission_percentage / 100, 0) AS commission_amount
  FROM
    sellers s
  LEFT JOIN
    sales sa ON s.id = sa.seller_id
    AND (
      (start_date IS NULL OR sa.created_at >= start_date)
      AND
      (end_date IS NULL OR sa.created_at <= end_date)
    )
  WHERE
    s.active = true
  GROUP BY
    s.id, s.name, s.commission_percentage
  ORDER BY
    commission_amount DESC;
END;
$$;

-- Actualizar vendedores con comisiones por defecto si no tienen una asignada
UPDATE sellers
SET commission_percentage = 
  CASE 
    WHEN name LIKE '%Senior%' THEN 7.50
    WHEN name LIKE '%Jr%' OR name LIKE '%Junior%' THEN 3.50
    ELSE 5.00
  END
WHERE commission_percentage = 0;

-- Verificar los vendedores actualizados y sus comisiones
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

-- Probar las funciones de comisiones con datos actuales
-- Comisiones de hoy
SELECT * FROM get_all_seller_commissions(
  CURRENT_DATE::timestamp AT TIME ZONE 'UTC',
  (CURRENT_DATE + 1)::timestamp AT TIME ZONE 'UTC'
);

-- Comisiones de la última semana
SELECT * FROM get_all_seller_commissions(
  (CURRENT_DATE - 7)::timestamp AT TIME ZONE 'UTC',
  (CURRENT_DATE + 1)::timestamp AT TIME ZONE 'UTC'
);
