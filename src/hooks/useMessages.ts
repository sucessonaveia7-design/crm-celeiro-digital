// src/hooks/useMessages.ts
import { useEffect, useState, useRef, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Message } from '@/components/chat/types';

export const useMessages = (conversation_id: string | null) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Refs for efficient updates and avoiding duplicates
  const messageIdsRef = useRef(new Set<string>());
  const oldestCreatedAtRef = useRef<string | null>(null); // ISO string of the oldest message we have
  const isMountedRef = useRef(false);

  // If conversation_id is null, we return early with empty state.
  if (!conversation_id) {
    return {
      messages: [],
      loading: false,
      hasMore: false,
      error: null,
      loadMore: () => {},
      refetch: () => {}
    };
  }

  // Fetch the initial page of messages (most recent 30)
  const fetchInitialMessages = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch the 30 most recent messages (newest first)
      const { data: rawData, error, count } = await supabase
        .from('messages')
        .select('*', { count: 'exact' })
        .eq('conversation_id', conversation_id)
        .order('created_at', { ascending: false })
        .limit(30);
      const data = rawData as Message[] | null;

      if (error) throw error;

      if (!isMountedRef.current) return;

      // Clear refs and set initial state
      messageIdsRef.current.clear();
      oldestCreatedAtRef.current = null;

      // Process data: we want to store in ASC order (oldest first) for display
      // The fetched data is in DESC order (newest first), so we reverse it
      const fetchedMessages = (data || []).reverse();

      // Update refs
      fetchedMessages.forEach(msg => {
        messageIdsRef.current.add(msg.id);
      });
      // Set oldestCreatedAt to the oldest message in this batch (which is the first in the reversed array)
      if (fetchedMessages.length > 0) {
        oldestCreatedAtRef.current = fetchedMessages[0].created_at;
      }

      setMessages(fetchedMessages);
      // Determine if there are more older messages to load
      setHasMore((count ?? 0) > 30);
    } catch (err) {
      if (!isMountedRef.current) return;
      setError(err instanceof Error ? err.message : 'Failed to load messages');
      setMessages([]);
      setHasMore(false);
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [conversation_id]);

  // Load older messages (for pagination)
  const loadMoreMessages = useCallback(async () => {
    if (loading || !hasMore || !oldestCreatedAtRef.current) return;

    setLoading(true);
    try {
      // Fetch messages older than the current oldest message
      const { data: rawData2, error, count } = await supabase
        .from('messages')
        .select('*', { count: 'exact' })
        .eq('conversation_id', conversation_id)
        .lt('created_at', oldestCreatedAtRef.current)
        .order('created_at', { ascending: false })
        .limit(30);
      const data = rawData2 as Message[] | null;

      if (error) throw error;

      if (!isMountedRef.current) return;

      const fetchedMessages = (data || []).reverse(); // Convert to ASC order

      // Filter out duplicates (shouldn't happen with keyset, but safe)
      const newMessages = fetchedMessages.filter(msg => !messageIdsRef.current.has(msg.id));

      // Update refs
      newMessages.forEach(msg => {
        messageIdsRef.current.add(msg.id);
      });
      // Update oldestCreatedAt if we got new messages
      if (newMessages.length > 0) {
        oldestCreatedAtRef.current = newMessages[0].created_at;
      }

      // Prepend new messages to maintain ASC order (oldest first)
      setMessages(prev => [...newMessages, ...prev]);
      // Update hasMore: we have more if the total count of messages older than our current oldest is greater than what we just fetched
      setHasMore((count ?? 0) > newMessages.length);
    } catch (err) {
      if (!isMountedRef.current) return;
      setError(err instanceof Error ? err.message : 'Failed to load more messages');
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [conversation_id, loading, hasMore]);

  // Setup realtime subscription for new messages and updates
  const setupRealtime = useCallback(() => {
    const channel = supabase
      .channel(`messages:${conversation_id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversation_id}`
        },
        (payload) => {
          try {
            if (!isMountedRef.current) return;
            let newMessage = payload.new as Message;
            // If it's a contact message and the status is 'sent', we set it to 'delivered' (since we just received it)
            if (newMessage.sender_type === 'contact' && newMessage.status === 'sent') {
              newMessage = { ...newMessage, status: 'delivered' };
            }
            // Avoid duplicates
            if (messageIdsRef.current.has(newMessage.id)) return;

            messageIdsRef.current.add(newMessage.id);
            // Since we store in ASC order (oldest first), new messages are newer than any we have
            // So we append to the end
            setMessages(prev => [...prev, newMessage]);
            // Note: oldestCreatedAtRef doesn't change because we added a newer message
          } catch (err) {
            // Log error but don't break the subscription
            console.error('Error in realtime message handler (INSERT):', err);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversation_id}`
        },
        (payload) => {
          try {
            if (!isMountedRef.current) return;
            const updatedMessage = payload.new as Message;
            // Update the message in the state by id
            setMessages(prev => prev.map(msg => msg.id === updatedMessage.id ? updatedMessage : msg));
          } catch (err) {
            // Log error but don't break the subscription
            console.error('Error in realtime message handler (UPDATE):', err);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversation_id]);

  useEffect(() => {
    if (!conversation_id) return;

    isMountedRef.current = true;
    messageIdsRef.current.clear();
    oldestCreatedAtRef.current = null;

    fetchInitialMessages();

    // Setup realtime
    const cleanupRealtime = setupRealtime();

    return () => {
      isMountedRef.current = false;
      messageIdsRef.current.clear();
      oldestCreatedAtRef.current = null;
      cleanupRealtime();
    };
  }, [conversation_id, fetchInitialMessages, setupRealtime]);

  // Return the state and actions
  return {
    messages, // in ASC order (oldest first)
    loading,
    hasMore,
    error,
    loadMore: loadMoreMessages,
    // For compatibility, a refetch function (same as fetchInitialMessages)
    refetch: fetchInitialMessages
  };
};