-- Drop existing policies
DROP POLICY IF EXISTS "Permitir lectura a todos los usuarios autenticados" ON payment_methods;
DROP POLICY IF EXISTS "read_payment_methods" ON payment_methods;
DROP POLICY IF EXISTS "update_payment_methods" ON payment_methods;
DROP POLICY IF EXISTS "allow_read_payment_methods" ON payment_methods;
DROP POLICY IF EXISTS "allow_update_payment_methods" ON payment_methods;
DROP POLICY IF EXISTS "Vendors can view active payment methods" ON payment_methods;
DROP POLICY IF EXISTS "Admins can do anything with payment_methods" ON payment_methods;

-- Enable RLS
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;

-- Policy for reading payment methods (both authenticated users and anon)
CREATE POLICY "allow_read_payment_methods"
ON payment_methods FOR SELECT
USING (true);  -- Permitir lectura a todos

-- Policy for updating payment methods (only authenticated users)
CREATE POLICY "allow_update_payment_methods"
ON payment_methods FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Policy for inserting payment methods (only authenticated users)
CREATE POLICY "allow_insert_payment_methods"
ON payment_methods FOR INSERT
TO authenticated
WITH CHECK (true);

-- Policy for deleting payment methods (only authenticated users)
CREATE POLICY "allow_delete_payment_methods"
ON payment_methods FOR DELETE
TO authenticated
USING (true);

-- Grant necessary permissions
GRANT SELECT ON payment_methods TO anon;
GRANT SELECT ON payment_methods TO authenticated;
GRANT UPDATE (active, name) ON payment_methods TO authenticated;
GRANT INSERT ON payment_methods TO authenticated;
GRANT DELETE ON payment_methods TO authenticated;