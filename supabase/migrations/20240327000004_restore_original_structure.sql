-- Restaurar la estructura original

-- 1. Eliminar las restricciones si existen
ALTER TABLE IF EXISTS sales
DROP CONSTRAINT IF EXISTS fk_sales_payment_method;

ALTER TABLE IF EXISTS sales
DROP CONSTRAINT IF EXISTS sales_payment_method_id_fkey;

-- 2. Eliminar índices si existen
DROP INDEX IF EXISTS idx_sales_payment_method;

-- 3. Restaurar la tabla payment_methods si no existe
CREATE TABLE IF NOT EXISTS payment_methods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Insertar métodos de pago básicos si la tabla está vacía
INSERT INTO payment_methods (name)
SELECT name
FROM (VALUES
    ('Efectivo'),
    ('Tarjeta de Crédito'),
    ('Tarjeta de Débito'),
    ('Transferencia'),
    ('PayPal')
) AS methods(name)
WHERE NOT EXISTS (
    SELECT 1 FROM payment_methods
);

-- 5. Asegurarse de que la columna payment_method_id existe en sales
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'sales'
        AND column_name = 'payment_method_id'
    ) THEN
        ALTER TABLE sales ADD COLUMN payment_method_id UUID;
    END IF;
END $$;

-- 6. Actualizar ventas sin método de pago
UPDATE sales
SET payment_method_id = (
    SELECT id
    FROM payment_methods
    WHERE name = 'Efectivo'
    LIMIT 1
)
WHERE payment_method_id IS NULL;

-- 7. Agregar la restricción de clave foránea
ALTER TABLE sales
ADD CONSTRAINT sales_payment_method_id_fkey
FOREIGN KEY (payment_method_id)
REFERENCES payment_methods(id);

-- 8. Configurar RLS
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir lectura a todos los usuarios autenticados"
ON payment_methods FOR SELECT
TO authenticated
USING (true);

-- 9. Otorgar permisos
GRANT SELECT ON payment_methods TO authenticated;