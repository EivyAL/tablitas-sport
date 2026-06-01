import { createClient } from '@supabase/supabase-js'

// Lee las variables de entorno Vite (prefijo VITE_)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

if (!supabaseUrl || !supabaseKey) {
  console.warn('Supabase: VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY is not set. Check your .env file.')
}

export const supabase = createClient(supabaseUrl, supabaseKey)
