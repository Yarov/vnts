-- Verificar cantidad de clientes
SELECT COUNT(*) as total_clients FROM clients;

-- Verificar cantidad de ventas
SELECT COUNT(*) as total_sales FROM sales;

-- Verificar ventas con clientes
SELECT COUNT(*) as sales_with_clients
FROM sales s
WHERE s.client_id IS NOT NULL;

-- Verificar los últimos 5 clientes
SELECT c.*,
       COUNT(s.id) as sales_count,
       SUM(s.total) as total_spent
FROM clients c
LEFT JOIN sales s ON s.client_id = c.id
GROUP BY c.id
ORDER BY c.created_at DESC
LIMIT 5;

-- Verificar las últimas 5 ventas con cliente
SELECT s.id, s.created_at, s.total, c.name as client_name
FROM sales s
JOIN clients c ON c.id = s.client_id
ORDER BY s.created_at DESC
LIMIT 5;