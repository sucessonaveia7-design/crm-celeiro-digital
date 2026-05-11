import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabaseUrl        = process.env.SUPABASE_URL
const supabaseAnonKey    = process.env.SUPABASE_ANON_KEY
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// Log de inicialização — nunca imprime as chaves completas.
console.log('[supabase] SUPABASE_URL present:              ', !!supabaseUrl)
console.log('[supabase] SUPABASE_ANON_KEY present:         ', !!supabaseAnonKey)
console.log('[supabase] SUPABASE_SERVICE_ROLE_KEY present: ', !!supabaseServiceKey)
console.log('[supabase] SUPABASE_URL prefix:               ', supabaseUrl?.slice(0, 30))
console.log('[supabase] SERVICE_ROLE_KEY prefix (12 chars):', supabaseServiceKey?.slice(0, 12))
console.log('[supabase] ANON_KEY prefix (12 chars):        ', supabaseAnonKey?.slice(0, 12))

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error(
    `Missing Supabase environment variables — ` +
    `SUPABASE_URL: ${!!supabaseUrl}, ` +
    `SUPABASE_SERVICE_ROLE_KEY: ${!!supabaseServiceKey}`
  )
}

// Client padrão (rotas REST/auth normais).
export const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Client administrativo — service_role explícito, bypassa RLS.
// Usado exclusivamente em serviços de backend (webhooks, jobs).
// NUNCA expor ao frontend.
export const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      persistSession:    false,
      autoRefreshToken:  false,
    },
  },
)

console.log('[supabase] supabaseAdmin criado com SERVICE_ROLE_KEY')
