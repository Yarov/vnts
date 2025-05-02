-- Add active column to payment_methods table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'payment_methods'
        AND column_name = 'active'
    ) THEN
        ALTER TABLE payment_methods ADD COLUMN active BOOLEAN DEFAULT true;

        -- Update existing records to be active
        UPDATE payment_methods SET active = true WHERE active IS NULL;

        -- Make active column NOT NULL after setting default values
        ALTER TABLE payment_methods ALTER COLUMN active SET NOT NULL;
    END IF;
END $$;

-- Drop existing policies
DROP POLICY IF EXISTS "Permitir lectura a todos los usuarios autenticados" ON payment_methods;
DROP POLICY IF EXISTS "read_payment_methods" ON payment_methods;
DROP POLICY IF EXISTS "update_payment_methods" ON payment_methods;
DROP POLICY IF EXISTS "allow_read_payment_methods" ON payment_methods;
DROP POLICY IF EXISTS "allow_update_payment_methods" ON payment_methods;

-- Policy for reading payment methods (both authenticated users and anon for sellers)
CREATE POLICY "allow_read_payment_methods"
ON payment_methods FOR SELECT
USING (
  (auth.role() = 'authenticated') OR  -- Para administradores autenticados
  (auth.role() = 'anon' AND active = true)  -- Para vendedores (solo métodos activos)
);

-- Policy for updating payment methods (only authenticated users)
CREATE POLICY "allow_update_payment_methods"
ON payment_methods FOR UPDATE
TO authenticated
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- Grant necessary permissions
GRANT SELECT ON payment_methods TO anon;
GRANT SELECT ON payment_methods TO authenticated;
GRANT UPDATE (active, name) ON payment_methods TO authenticated;