import { Router } from 'express';
import { supabase } from '../lib/supabase';

const router = Router();

// GET /api/conversations
router.get('/', async (_req, res) => {
  try {
    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .eq('church_id', 'f6266811-ac76-43db-bb18-ffd1cda0a6f7')
      .order('last_message_at', { ascending: false, nullsFirst: false })
      .limit(50);

    if (error) {
      console.error('Error fetching conversations:', error);
      return res.status(400).json({ error: error.message });
    }

    res.json(data);
  } catch (err) {
    console.error('Unexpected error fetching conversations:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/conversations/:id/messages
router.get('/:id/messages', async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase.rpc('get_messages', { p_conversation_id: id, p_limit: 100 });
    if (error) throw error;
    res.json(data);
  } catch (error: any) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/conversations/:id/messages
router.post('/:id/messages', async (req, res) => {
  try {
    console.log('[send_message] PARAMS:', req.params);
    console.log('[send_message] BODY:',   req.body);

    const { id } = req.params;
    const { content, message_type } = req.body;

    if (!content || String(content).trim() === '') {
      return res.status(400).json({ error: 'Content is required' });
    }

    // Fetch conversation to verify it exists and get church_id
    const { data: conv, error: convError } = await supabase
      .from('conversations')
      .select('id, church_id')
      .eq('id', id)
      .single();

    if (convError || !conv) {
      console.error('[send_message] Conversation not found:', id, convError);
      return res.status(404).json({ error: 'Conversation not found' });
    }

    console.log('[send_message] Conversation found, church_id:', conv.church_id);

    const trimmed = String(content).trim();

    const insertPayload: Record<string, unknown> = {
      conversation_id: id,
      church_id:       conv.church_id,
      sender_type:     'user',
      message_type:    message_type || 'text',
      content:         trimmed,
    };

    console.log('[send_message] INSERT payload:', insertPayload);

    const { data, error } = await supabase
      .from('messages')
      .insert(insertPayload)
      .select()
      .single();

    if (error) {
      console.error('[send_message] ERRO SUPABASE:', error);
      return res.status(500).json({ error: error.message });
    }

    console.log('[send_message] Mensagem inserida com sucesso, id:', data.id);

    // Atualiza preview da conversa (falha silenciosa — não bloqueia resposta)
    const { error: updateError } = await supabase
      .from('conversations')
      .update({
        last_message:    trimmed,
        last_message_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (updateError) {
      console.warn('[send_message] Falha ao atualizar preview da conversa:', updateError.message);
    }

    return res.status(201).json({ success: true, data });
  } catch (error: any) {
    console.error('[send_message] Erro inesperado:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH /api/conversations/:id/read
router.patch('/:id/read', async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase.rpc('mark_conversation_as_read', { p_conversation_id: id });
    if (error) throw error;
    res.json({ success: true });
  } catch (error: any) {
    console.error('Error marking conversation as read:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;