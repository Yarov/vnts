-- IMPORTANTE: Este script debe ejecutarse después de haber creado un usuario en Authentication
-- 1. Primero crea un usuario en Authentication > Users
-- 2. Obtén el UUID generado para ese usuario
-- 3. Reemplaza el UUID en el siguiente INSERT con el UUID del usuario creado

-- Reemplaza 'ID_DEL_USUARIO_DE_AUTH' con el UUID real del usuario de auth
INSERT INTO users (id, email, full_name)
VALUES 
  ('ID_DEL_USUARIO_DE_AUTH', 'admin@tuempresa.com', 'Administrador Principal');

-- Insertar datos iniciales: vendedor de ejemplo con comisión del 5%
INSERT INTO sellers (name, numeric_code, commission_percentage)
VALUES ('Vendedor Demo', '1234', 5.00);

-- Insertar datos iniciales: productos de ejemplo
INSERT INTO products (name, price, category, description)
VALUES 
  ('Producto 1', 19.99, 'General', 'Descripción del producto 1'),
  ('Producto 2', 29.99, 'General', 'Descripción del producto 2'),
  ('Producto 3', 39.99, 'Premium', 'Descripción del producto 3');
