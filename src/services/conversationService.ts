// src/services/conversationService.ts
import { SupabaseClient } from '@supabase/supabase-js';

/**
 * Service for handling conversation operations
 */
export class ConversationService {
  constructor(private supabase: SupabaseClient) {}

  /**
   * Marks a conversation as read by updating messages and conversation unread count
   * @param conversationId - The ID of the conversation to mark as read
   */
  async markAsRead(conversationId: string) {
    try {
      // Update all contact messages in the conversation to 'read'
      await this.supabase
        .from('messages')
        .update({ status: 'read' })
        .eq('conversation_id', conversationId)
        .eq('sender_type', 'contact');

      // Reset the unread count for the conversation
      await this.supabase
        .from('conversations')
        .update({ unread_count: 0 })
        .eq('id', conversationId);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to mark conversation as read: ${message}`);
    }
  }
}