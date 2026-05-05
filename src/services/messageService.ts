// src/services/messageService.ts
import { SupabaseClient } from '@supabase/supabase-js';

/**
 * Service for handling message operations
 */
export class MessageService {
  constructor(private supabase: SupabaseClient) {}

  /**
   * Sends a new message and updates the conversation atomically
   * Uses Supabase RPC function for data consistency
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
    try {
      // Call the atomic Supabase RPC function
      const { data, error } = await this.supabase
        .rpc('send_message', {
          p_conversation_id: params.conversation_id,
          p_sender_type: params.sender_type,
          p_sender_id: params.sender_id ?? null,
          p_content: params.content,
          p_message_type: params.message_type,
        });

      if (error) {
        throw new Error(`Failed to send message: ${error.message}`);
      }

      return data;
    } catch (error) {
      // Re-throw error to be handled by calling code
      throw error;
    }
  }
}