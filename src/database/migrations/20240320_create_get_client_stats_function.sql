-- Crear función para obtener estadísticas de clientes
CREATE OR REPLACE FUNCTION public.get_client_stats()
RETURNS TABLE (
  id text,
  name text,
  reference text,
  created_at timestamptz,
  total_purchases bigint,
  total_spent numeric,
  average_ticket numeric,
  last_purchase timestamptz
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
    COUNT(s.id)::bigint as total_purchases,
    COALESCE(SUM(s.total), 0) as total_spent,
    CASE
      WHEN COUNT(s.id) > 0 THEN COALESCE(SUM(s.total) / COUNT(s.id), 0)
      ELSE 0
    END as average_ticket,
    MAX(s.created_at) as last_purchase
  FROM clients c
  LEFT JOIN sales s ON s.client_id = c.id
  GROUP BY c.id, c.name, c.reference, c.created_at
  ORDER BY total_spent DESC NULLS LAST;
END;
$$;

-- Permisos para la función
GRANT EXECUTE ON FUNCTION public.get_client_stats() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_client_stats() TO service_role;