// src/hooks/useConversations.ts
import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';

interface Conversation {
  id: string;
  contact_id: string;
  last_message: string;
  last_message_at: string;
  unread_count: number;
  contact: {
    name: string;
    phone: string;
  };
}

export const useConversations = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Refs for efficient data storage and updates
  const conversationMapRef = useRef<Map<string, Conversation>>(new Map());
  const contactMapRef = useRef<Map<string, { name: string; phone: string }>>(new Map());
  const isMountedRef = useRef(false);

  // Initial fetch: load all conversations with contact data
  const fetchInitialConversations = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('conversations')
        .select(`
          id,
          contact_id,
          last_message,
          last_message_at,
          unread_count,
          contacts!inner (
            name,
            phone
          )
        `)
        .order('last_message_at', { ascending: false });

      if (error) throw error;

      // Clear and populate maps
      conversationMapRef.current.clear();
      contactMapRef.current.clear();

      (data as any[]).forEach((conv: any) => {
        const contact = {
          name: conv.contacts.name,
          phone: conv.contacts.phone,
        };
        conversationMapRef.current.set(conv.id, {
          id: conv.id,
          contact_id: conv.contact_id,
          last_message: conv.last_message,
          last_message_at: conv.last_message_at,
          unread_count: conv.unread_count,
          contact,
        });
        contactMapRef.current.set(conv.contact_id, contact);
      });

      // Set initial sorted list
      updateConversationsList();
      setError(null);
    } catch (err) {
      console.error('Error fetching initial conversations:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      setConversations([]);
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  };

  // Compute sorted list from conversationMap and update state
  const updateConversationsList = () => {
    const sorted = Array.from(conversationMapRef.current.values()).sort(
      (a, b) =>
        new Date(b.last_message_at).getTime() -
        new Date(a.last_message_at).getTime()
    );
    setConversations(sorted);
  };

  // Handle realtime events
  const setupRealtime = () => {
    // Conversations table changes
    const convChannel = supabase
      .channel('conversations-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'conversations',
        },
        (payload) => {
          const newConv = payload.new as any;
          // Get contact data: either from contact map or fetch if not present
          let contact = contactMapRef.current.get(newConv.contact_id);
          if (!contact) {
            // Contact not in map, fetch it
            supabase
              .from('contacts')
              .select('name, phone')
              .eq('id', newConv.contact_id)
              .single()
              .then(({ data: contactData, error }) => {
                if (!isMountedRef.current) return;
                if (error) {
                  console.error('Failed to fetch contact for new conversation:', error);
                  // Use empty contact as fallback
                  contact = { name: '', phone: '' };
                } else {
                  contact = {
                    name: contactData.name,
                    phone: contactData.phone,
                  };
                  // Add to contact map for future use
                  contactMapRef.current.set(newConv.contact_id, contact);
                }
                // Add conversation to map
                conversationMapRef.current.set(newConv.id, {
                  id: newConv.id,
                  contact_id: newConv.contact_id,
                  last_message: newConv.last_message,
                  last_message_at: newConv.last_message_at,
                  unread_count: newConv.unread_count,
                  contact,
                });
                updateConversationsList();
              });
          } else {
            // Contact already in map
            conversationMapRef.current.set(newConv.id, {
              id: newConv.id,
              contact_id: newConv.contact_id,
              last_message: newConv.last_message,
              last_message_at: newConv.last_message_at,
              unread_count: newConv.unread_count,
              contact,
            });
            updateConversationsList();
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'conversations',
        },
        (payload) => {
          const updatedConv = payload.new as any;
          const existing = conversationMapRef.current.get(updatedConv.id);
          if (existing) {
            // Update only mutable fields that affect our conversation object
            conversationMapRef.current.set(updatedConv.id, {
              ...existing,
              last_message: updatedConv.last_message,
              last_message_at: updatedConv.last_message_at,
              unread_count: updatedConv.unread_count,
              // Note: last_sender_type is not stored in our Conversation interface
            });
            updateConversationsList();
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'conversations',
        },
        (payload) => {
          const deletedId = payload.old.id as string;
          if (conversationMapRef.current.has(deletedId)) {
            conversationMapRef.current.delete(deletedId);
            updateConversationsList();
          }
        }
      )
      .subscribe();

    // Contacts table changes (only UPDATE needed per requirements)
    const contactChannel = supabase
      .channel('contacts-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'contacts',
        },
        (payload) => {
          const updatedContact = payload.new as any;
          const contactId = updatedContact.id as string;
          // Update contact map
          const newContact = {
            name: updatedContact.name,
            phone: updatedContact.phone,
          };
          contactMapRef.current.set(contactId, newContact);
          // Update all conversations that reference this contact
          let needsUpdate = false;
          conversationMapRef.current.forEach((conv) => {
            if (conv.contact_id === contactId) {
              // Create a new conversation object with updated contact
              // We need to create a new object to trigger re-render because we're changing nested data
              const updatedConv = {
                ...conv,
                contact: { ...newContact },
              };
              conversationMapRef.current.set(conv.id, updatedConv);
              needsUpdate = true;
            }
          });
          if (needsUpdate) {
            // Contact name/phone changes don't affect sorting by last_message_at
            // But we still need to update the state reference to reflect the data change
            updateConversationsList();
          }
        }
      )
      .subscribe();

    // Return cleanup function
    return () => {
      supabase.removeChannel(convChannel);
      supabase.removeChannel(contactChannel);
    };
  };

  useEffect(() => {
    isMountedRef.current = true;
    fetchInitialConversations();

    // Set up realtime listeners
    const cleanup = setupRealtime();

    return () => {
      isMountedRef.current = false;
      cleanup();
    };
  }, []);

  return { conversations, loading, error };
};