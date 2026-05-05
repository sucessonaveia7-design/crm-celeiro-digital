// src/hooks/useTypingStatus.ts
import { useEffect, useState, useRef, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

interface UseTypingStatusReturn {
  typingUsers: string[]; // list of userIds (excluding current user) who are typing
  setTyping: (isTyping: boolean) => void;
}

export const useTypingStatus = (conversationId: string | null, userId: string): UseTypingStatusReturn => {
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const channelRef = useRef<any>(null);
  const isMountedRef = useRef(false);

  // Function to update the typing status in the database
  const updateTypingStatus = useCallback(async (isTyping: boolean) => {
    if (!conversationId || !userId) return;

    try {
      // Upsert the typing status
      await supabase
        .from('typing_status')
        .upsert(
          { conversation_id: conversationId, user_id: userId, is_typing: isTyping, updated_at: new Date().toISOString() },
          { onConflict: 'conversation_id, user_id' }
        );
    } catch (error) {
      console.error('Failed to update typing status:', error);
    }
  }, [conversationId, userId]);

  // Set up realtime subscription to typing_status changes in the conversation
  useEffect(() => {
    if (!conversationId || !userId) return;

    isMountedRef.current = true;

    const channel = supabase
      .channel(`typing_status:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'typing_status',
          filter: `conversation_id=eq.${conversationId}`
        },
        (payload) => {
          if (!isMountedRef.current) return;

          // We are only interested in the typing status of other users
          const { user_id: otherUserId, is_typing } = payload.new as {
            user_id: string;
            is_typing: boolean;
          };

          // Ignore the current user's own typing status
          if (otherUserId === userId) return;

          setTypingUsers(prev => {
            if (is_typing) {
              // Add the user if not already in the list
              if (!prev.includes(otherUserId)) {
                return [...prev, otherUserId];
              }
              return prev;
            } else {
              // Remove the user from the list
              return prev.filter(id => id !== otherUserId);
            }
          });
        }
      )
      .subscribe();

    channelRef.current = channel;

    // Cleanup on unmount
    return () => {
      isMountedRef.current = false;
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
      // Set the current user's typing status to false when leaving
      updateTypingStatus(false);
    };
  }, [conversationId, userId, updateTypingStatus]);

  // Return the typingUsers (excluding the current user) and the function to set typing status
  return {
    typingUsers,
    setTyping: updateTypingStatus
  };
};