import { useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';

/**
 * Hook to subscribe to real-time messages for a specific conversation
 * @param conversationId - The ID of the conversation to listen to
 * @param onNewMessage - Callback function to handle new messages
 */
export const useRealtimeMessages = (
  conversationId: string,
  onNewMessage: (message: any) => void
) => {
  const channelRef = useRef<any>(null);
  const seenMessagesRef = useRef(new Set<string>());

  useEffect(() => {
    if (!conversationId) return;

    // Create a new channel for this conversation
    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const message = payload.new;
          
          // Avoid processing duplicate messages
          if (seenMessagesRef.current.has(message.id)) {
            return;
          }
          
          seenMessagesRef.current.add(message.id);
          
          // Call the callback to update UI
          onNewMessage(message);
        }
      )
      .subscribe();

    // Store channel reference for cleanup
    channelRef.current = channel;

    // Cleanup function to remove the channel and clear references
    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
      seenMessagesRef.current.clear();
    };
  }, [conversationId, onNewMessage]);

  // Return the unsubscribe function if needed elsewhere
  return () => {
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }
  };
};