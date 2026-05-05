import { Router } from 'express';
import { supabase } from '../lib/supabase';

const router = Router();

// GET /api/conversations
router.get('/', async (req, res) => {
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
    const { id } = req.params;
    const { sender_type, sender_id, content, message_type } = req.body;

    if (!content || content.trim() === '') {
      return res.status(400).json({ error: 'Content is required' });
    }

    const { data, error } = await supabase.rpc('send_message', {
      p_conversation_id: id,
      p_sender_type: sender_type,
      p_sender_id: sender_id,
      p_content: content,
      p_message_type: message_type
    });

    if (error) throw error;
    res.json({ message_id: data });
  } catch (error: any) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Internal server error' });
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