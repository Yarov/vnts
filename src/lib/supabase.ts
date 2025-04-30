import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/database.types';

// Estas variables deben ser reemplazadas con tus credenciales reales
// En producción, deberían estar en un archivo .env
const SUPABASE_URL = 'https://vdhykkvhmydfrcahwzpq.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZkaHlra3ZobXlkZnJjYWh3enBxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU4ODI5MzgsImV4cCI6MjA2MTQ1ODkzOH0.bhBbETnmvD8R6Pl466n68qEfTpaoSAIL02DvGT4XuIM';

export const supabase = createClient<Database>(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);

// Función auxiliar para verificar si un usuario es administrador
export async function isUserAdmin(userId: string) {
  const { data, error } = await supabase
    .from('users')
    .select('id')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error checking admin status:', error);
    return false;
  }

  return !!data;
}

// Función para verificar si un código de vendedor es válido
export async function validateSellerCode(code: string) {
  const { data, error } = await supabase
    .from('sellers')
    .select('id, name')
    .eq('numeric_code', code)
    .eq('active', true)
    .single();

  if (error || !data) {
    console.error('Error validating seller code:', error);
    return null;
  }

  return {
    id: data.id,
    name: data.name
  };
}
