import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

// Backend usa SUPABASE_URL (sem prefixo VITE_).
// VITE_SUPABASE_URL é exclusivo do bundler Vite e não existe em Node/Railway.
const supabaseUrl        = process.env.SUPABASE_URL
const supabaseAnonKey    = process.env.SUPABASE_ANON_KEY
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

console.log('SUPABASE_URL:              ', !!supabaseUrl)
console.log('SUPABASE_ANON_KEY:         ', !!supabaseAnonKey)
console.log('SUPABASE_SERVICE_ROLE_KEY: ', !!supabaseServiceKey)

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error(
    `Missing Supabase environment variables — ` +
    `SUPABASE_URL: ${!!supabaseUrl}, ` +
    `SUPABASE_SERVICE_ROLE_KEY: ${!!supabaseServiceKey}`
  )
}

// Client padrão — usa service role key (backend Node, bypassa RLS).
export const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Alias explícito para operações administrativas (webhooks, serviços internos).
// Bypassa RLS completamente — nunca expor ao frontend.
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
})
