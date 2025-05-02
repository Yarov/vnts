-- Drop the function if it exists
DROP FUNCTION IF EXISTS public.get_client_stats();

-- Create the function
CREATE OR REPLACE FUNCTION public.get_client_stats()
RETURNS TABLE (
  id uuid,
  name text,
  reference text,
  created_at timestamptz,
  total_purchases bigint,
  total_spent numeric,
  average_ticket numeric,
  last_purchase timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Log the start of the function (debugging)
  RAISE NOTICE 'Starting get_client_stats function';

  RETURN QUERY
  WITH client_stats AS (
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
  )
  SELECT *
  FROM client_stats
  ORDER BY total_spent DESC NULLS LAST;

  -- Log the completion of the function (debugging)
  RAISE NOTICE 'Completed get_client_stats function';
END;
$$;

-- Drop existing permissions
REVOKE ALL ON FUNCTION public.get_client_stats() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_client_stats() FROM authenticated;
REVOKE ALL ON FUNCTION public.get_client_stats() FROM anon;

-- Grant new permissions
GRANT EXECUTE ON FUNCTION public.get_client_stats() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_client_stats() TO service_role;

-- Verify the function exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public'
    AND p.proname = 'get_client_stats'
  ) THEN
    RAISE EXCEPTION 'Function get_client_stats does not exist!';
  END IF;
END
$$;