import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

// Backend usa SUPABASE_URL (sem prefixo VITE_).
// VITE_SUPABASE_URL é exclusivo do bundler Vite e não existe em Node/Railway.
const supabaseUrl        = process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

console.log('SUPABASE_URL:              ', !!supabaseUrl)
console.log('SUPABASE_SERVICE_ROLE_KEY: ', !!supabaseServiceKey)

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error(
    `Missing Supabase environment variables — ` +
    `SUPABASE_URL: ${!!supabaseUrl}, ` +
    `SUPABASE_SERVICE_ROLE_KEY: ${!!supabaseServiceKey}`
  )
}

export const supabase = createClient(supabaseUrl, supabaseServiceKey)
