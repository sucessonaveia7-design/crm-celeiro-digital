// src/components/chat/types.ts
export interface Message {
  id: string;
  sender_type: 'user' | 'contact';
  content: string;
  created_at: string;
  status: 'sent' | 'delivered' | 'read';
}