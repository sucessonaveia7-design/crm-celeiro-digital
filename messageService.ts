import { SupabaseClient } from '@supabase/supabase-js';

/**
 * Service for handling message operations
 */
export class MessageService {
  constructor(private supabase: SupabaseClient) {}

  /**
   * Sends a new message and updates the conversation
   * @param params - Message parameters
   * @returns The created message
   */
  async sendMessage(params: {
    conversation_id: string;
    sender_type: 'user' | 'contact';
    sender_id?: string;
    content: string;
    message_type: string;
  }) {
    let insertedMessage: any = null;

    try {
      // Insert the message
      const { data: messageData, error: messageError } = await this.supabase
        .from('messages')
        .insert({
          conversation_id: params.conversation_id,
          sender_type: params.sender_type,
          sender_id: params.sender_id,
          content: params.content,
          message_type: params.message_type,
        })
        .single();

      if (messageError) {
        throw new Error(`Failed to insert message: ${messageError.message}`);
      }

      insertedMessage = messageData;

      // Fetch current conversation to get current unread_count
      const { data: conversation, error: conversationError } = await this.supabase
        .from('conversations')
        .select('unread_count')
        .eq('id', params.conversation_id)
        .single();

      if (conversationError) {
        throw new Error(`Failed to fetch conversation: ${conversationError.message}`);
      }

      // Calculate new unread count (increment only if sender is contact)
      const newUnreadCount = conversation.unread_count + (params.sender_type === 'contact' ? 1 : 0);

      // Update conversation with last message details
      const { error: updateError } = await this.supabase
        .from('conversations')
        .update({
          last_message: params.content,
          last_message_at: new Date().toISOString(),
          unread_count: newUnreadCount,
          last_sender_type: params.sender_type,
        })
        .eq('id', params.conversation_id);

      if (updateError) {
        // Rollback: delete the inserted message
        await this.supabase
          .from('messages')
          .delete()
          .eq('id', insertedMessage.id);

        throw new Error(`Failed to update conversation: ${updateError.message}`);
      }

      return insertedMessage;
    } catch (error) {
      // If we inserted a message but then failed, try to delete it
      if (insertedMessage) {
        await this.supabase
          .from('messages')
          .delete()
          .eq('id', insertedMessage.id)
          .catch(() => {
            // Ignore errors during rollback
          });
      }
      throw error;
    }
  }
}