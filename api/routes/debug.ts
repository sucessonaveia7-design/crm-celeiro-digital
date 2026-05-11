import { Router, type Request, type Response } from 'express';
import { supabaseAdmin } from '../lib/supabase.ts';

const router = Router();

// GET /api/debug/supabase-role
// Verifica qual role o Supabase está usando em runtime.
// REMOVER após diagnóstico — não expor em produção permanente.
router.get('/supabase-role', async (_req: Request, res: Response) => {
  const results: Record<string, unknown> = {};

  // 1. Prefixo da chave em uso (nunca a chave completa)
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';
  const anonKey    = process.env.SUPABASE_ANON_KEY ?? '';
  results.env = {
    SERVICE_ROLE_KEY_present: !!serviceKey,
    SERVICE_ROLE_KEY_prefix:  serviceKey.slice(0, 12),
    ANON_KEY_present:         !!anonKey,
    ANON_KEY_prefix:          anonKey.slice(0, 12),
    SUPABASE_URL_prefix:      (process.env.SUPABASE_URL ?? '').slice(0, 30),
  };

  // 2. SELECT em contacts usando supabaseAdmin
  const { data: contactsData, error: contactsError } = await supabaseAdmin
    .from('contacts')
    .select('id')
    .limit(1);

  results.contacts_select = {
    ok:    !contactsError,
    error: contactsError ? { code: contactsError.code, message: contactsError.message } : null,
    rows:  contactsData?.length ?? 0,
  };

  // 3. SELECT em conversations usando supabaseAdmin
  const { data: convsData, error: convsError } = await supabaseAdmin
    .from('conversations')
    .select('id')
    .limit(1);

  results.conversations_select = {
    ok:    !convsError,
    error: convsError ? { code: convsError.code, message: convsError.message } : null,
    rows:  convsData?.length ?? 0,
  };

  // 4. SELECT em messages usando supabaseAdmin
  const { data: msgsData, error: msgsError } = await supabaseAdmin
    .from('messages')
    .select('id')
    .limit(1);

  results.messages_select = {
    ok:    !msgsError,
    error: msgsError ? { code: msgsError.code, message: msgsError.message } : null,
    rows:  msgsData?.length ?? 0,
  };

  // 5. Tentar INSERT de contato de teste e rollback imediato
  const testPhone = `TEST_${Date.now()}`;
  const { error: insertErr } = await supabaseAdmin
    .from('contacts')
    .insert({ name: 'DEBUG_TEST', phone: testPhone });

  if (!insertErr) {
    // Limpar o registro de teste
    await supabaseAdmin.from('contacts').delete().eq('phone', testPhone);
  }

  results.contacts_insert_test = {
    ok:    !insertErr,
    error: insertErr ? { code: insertErr.code, message: insertErr.message } : null,
  };

  const allOk = !contactsError && !convsError && !msgsError && !insertErr;

  res.status(allOk ? 200 : 500).json({
    success: allOk,
    verdict: allOk
      ? 'supabaseAdmin está funcionando com service_role — RLS bypassed'
      : 'FALHA: verifique os campos error abaixo',
    results,
  });
});

export default router;
