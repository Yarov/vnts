-- Esquema de Base de Datos para la Aplicación de Control de Ingresos
-- Esta estructura debe ser ejecutada en el Editor SQL de Supabase

-- Habilitar la extensión UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabla de usuarios (administradores)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE
);

-- Tabla de vendedores
CREATE TABLE sellers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  numeric_code TEXT NOT NULL UNIQUE,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  commission_percentage DECIMAL(5,2) DEFAULT 0.00
);

-- Tabla de productos
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  category TEXT,
  description TEXT,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de métodos de pago
CREATE TABLE payment_methods (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  active BOOLEAN DEFAULT TRUE
);

-- Tabla de clientes
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  reference TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de ventas
CREATE TABLE sales (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  seller_id UUID REFERENCES sellers(id) NOT NULL,
  client_id UUID REFERENCES clients(id),
  payment_method_id UUID REFERENCES payment_methods(id) NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de detalles de ventas
CREATE TABLE sale_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sale_id UUID REFERENCES sales(id) NOT NULL,
  product_id UUID REFERENCES products(id) NOT NULL,
  quantity INTEGER NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL
);

-- Función para obtener los clientes más frecuentes
CREATE OR REPLACE FUNCTION get_top_clients(limit_count INTEGER DEFAULT 10)
RETURNS TABLE (
  id UUID,
  name TEXT,
  reference TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  purchase_count BIGINT,
  last_purchase TIMESTAMP WITH TIME ZONE
) 
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.id,
    c.name,
    c.reference,
    c.created_at,
    COUNT(s.id) AS purchase_count,
    MAX(s.created_at) AS last_purchase
  FROM
    clients c
  LEFT JOIN
    sales s ON c.id = s.client_id
  GROUP BY
    c.id
  ORDER BY
    purchase_count DESC, last_purchase DESC
  LIMIT limit_count;
END;
$$;

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

-- Función para obtener los productos más vendidos
CREATE OR REPLACE FUNCTION get_top_products(limit_count INTEGER DEFAULT 10)
RETURNS TABLE (
  id UUID,
  name TEXT,
  quantity BIGINT,
  total DECIMAL(10,2)
) 
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.name,
    SUM(si.quantity)::BIGINT AS quantity,
    SUM(si.subtotal) AS total
  FROM
    products p
  JOIN
    sale_items si ON p.id = si.product_id
  GROUP BY
    p.id, p.name
  ORDER BY
    quantity DESC
  LIMIT limit_count;
END;
$$;

-- Insertar datos iniciales: métodos de pago
INSERT INTO payment_methods (name) VALUES ('Efectivo');
INSERT INTO payment_methods (name) VALUES ('Tarjeta de Crédito');
INSERT INTO payment_methods (name) VALUES ('Tarjeta de Débito');
INSERT INTO payment_methods (name) VALUES ('Transferencia');

-- Configura las políticas de seguridad para RLS (Row Level Security)

-- Habilitar RLS en todas las tablas
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE sellers ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE sale_items ENABLE ROW LEVEL SECURITY;

-- Políticas para administradores (deben estar autenticados)
-- Los administradores pueden ver y editar todo
CREATE POLICY "Admins can do anything with users" ON users
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Admins can do anything with sellers" ON sellers
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Admins can do anything with products" ON products
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Admins can do anything with payment_methods" ON payment_methods
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Admins can do anything with clients" ON clients
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Admins can do anything with sales" ON sales
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Admins can do anything with sale_items" ON sale_items
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Políticas específicas para vendedores (usando anon access para simplificar)
-- Nota: En producción, deberías implementar un sistema más seguro con JWT claims personalizados

-- Los vendedores pueden ver productos activos
CREATE POLICY "Vendors can view active products" ON products
  FOR SELECT
  USING (active = true);

-- Los vendedores pueden ver métodos de pago activos
CREATE POLICY "Vendors can view active payment methods" ON payment_methods
  FOR SELECT
  USING (active = true);

-- Los vendedores pueden ver y agregar clientes
CREATE POLICY "Vendors can view and add clients" ON clients
  FOR SELECT
  USING (true);

CREATE POLICY "Vendors can insert clients" ON clients
  FOR INSERT
  WITH CHECK (true);

-- Los vendedores pueden ver sus propias ventas y agregar nuevas
CREATE POLICY "Vendors can view their own sales" ON sales
  FOR SELECT
  USING (true);

CREATE POLICY "Vendors can insert sales" ON sales
  FOR INSERT
  WITH CHECK (true);

-- Los vendedores pueden ver y agregar items de venta
CREATE POLICY "Vendors can view sale items" ON sale_items
  FOR SELECT
  USING (true);

CREATE POLICY "Vendors can insert sale items" ON sale_items
  FOR INSERT
  WITH CHECK (true);
