import { Router } from 'express';
import { supabase } from '../lib/supabase';
import { withTenant } from '../middleware/tenant.ts';

const router = Router();

// GET /api/conversations
router.get('/', ...withTenant(), async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .eq('church_id', req.organizationId!)
      .order('last_message_at', { ascending: false, nullsFirst: false })
      .limit(50);

    if (error) {
      console.error('[conversations] Error fetching:', error);
      return res.status(400).json({ success: false, error: error.message });
    }

    res.json(data);
  } catch (err) {
    console.error('[conversations] Unexpected error:', err);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// GET /api/conversations/:id/messages
router.get('/:id/messages', ...withTenant(), async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase.rpc('get_messages', { p_conversation_id: id, p_limit: 100 });
    if (error) throw error;
    res.json(data);
  } catch (error: any) {
    console.error('[conversations] Error fetching messages:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// POST /api/conversations/:id/messages
router.post('/:id/messages', ...withTenant(), async (req, res) => {
  try {
    const { id }                   = req.params;
    const { content, message_type } = req.body;

    if (!content || String(content).trim() === '') {
      return res.status(400).json({ success: false, error: 'Content is required' });
    }

    // Verifica que a conversa pertence à organização do usuário
    const { data: conv, error: convError } = await supabase
      .from('conversations')
      .select('id, church_id')
      .eq('id', id)
      .eq('church_id', req.organizationId!)
      .single();

    if (convError || !conv) {
      return res.status(404).json({ success: false, error: 'Conversa não encontrada' });
    }

    const trimmed = String(content).trim();

    const { data, error } = await supabase
      .from('messages')
      .insert({
        conversation_id: id,
        sender_type:     'agent',
        message_type:    message_type || 'text',
        content:         trimmed,
      })
      .select()
      .single();

    if (error) {
      console.error('[conversations] ERRO SUPABASE insert message:', error);
      return res.status(500).json({ success: false, error: error.message });
    }

    await supabase
      .from('conversations')
      .update({ last_message: trimmed, last_message_at: new Date().toISOString() })
      .eq('id', id);

    return res.status(201).json({ success: true, data });
  } catch (error: any) {
    console.error('[conversations] Erro inesperado ao enviar mensagem:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// PATCH /api/conversations/:id/read
router.patch('/:id/read', ...withTenant(), async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase.rpc('mark_conversation_as_read', { p_conversation_id: id });
    if (error) throw error;
    res.json({ success: true });
  } catch (error: any) {
    console.error('[conversations] Error marking as read:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

export default router;
