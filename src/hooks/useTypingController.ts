// src/hooks/useTypingController.ts
import { useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useTypingStatus } from './useTypingStatus';

interface UseTypingControllerReturn {
  typingUsers: string[]; // list of userIds (excluding current user) who are typing
  handleTypingChange: (isTyping: boolean) => void;
  stopTyping: () => void;
}

/**
 * Hook to manage typing status with debounce and automatic clearing.
 * @param conversationId - The ID of the conversation
 * @param userId - The ID of the current user
 */
export const useTypingController = (conversationId: string | null, userId: string): UseTypingControllerReturn => {
  // We'll use the existing useTypingStatus hook to get the typingUsers and setTyping function
  // But we want to wrap the setTyping with debounce and automatic stop on blur/unmount/send.
  // However, note: the useTypingStatus hook we have already returns a setTyping function that updates the database.
  // We are going to create a new hook that uses useTypingStatus and adds debounce and automatic stop.

  // Let's refactor: we'll create a hook that returns:
  //   typingUsers: string[]
  //   handleTypingChange: (isTyping: boolean) => void   -> debounced call to setTyping
  //   stopTyping: () => void                            -> immediate setTyping(false) and clear debounce

  // We'll use useTypingStatus to get the base functionality for typingUsers and the real setTyping (to the db).
  // Then we'll wrap that setTyping with debounce and provide stopTyping.

  const { typingUsers, setTyping: setTypingToDb } = useTypingStatus(conversationId, userId);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(false);

  // Function to set the typing status in the db (with debounce)
  const handleTypingChange = useCallback((isTyping: boolean) => {
    if (!isMountedRef.current) return;

    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (isTyping) {
      // Set typing to true immediately (no debounce for starting to type)
      setTypingToDb(true);
    } else {
      // When stopping, we debounce: set to false after 500ms
      timeoutRef.current = setTimeout(() => {
        if (isMountedRef.current) {
          setTypingToDb(false);
        }
      }, 500);
    }
  }, [conversationId, userId, setTypingToDb]);

  // Function to stop typing immediately (used on blur, unmount, and after sending)
  const stopTyping = useCallback(() => {
    if (!isMountedRef.current) return;

    // Clear the debounce timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    // Set typing to false immediately
    setTypingToDb(false);
  }, [setTypingToDb]);

  // Cleanup on unmount
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      // Ensure typing is set to false on unmount
      stopTyping();
    };
  }, [stopTyping]);

  return {
    typingUsers,
    handleTypingChange,
    stopTyping
  };
};