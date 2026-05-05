// src/components/chat/MessageInput.tsx
import { useState } from 'react';

interface MessageInputProps {
  onSend: (content: string) => Promise<void>;
  onInputChange: (isTyping: boolean) => void;
  onBlur: () => void;
  loading: boolean;
}

export const MessageInput = ({ onSend, onInputChange, onBlur, loading }: MessageInputProps) => {
  const [inputValue, setInputValue] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Trim and check if not empty and not loading
    const content = inputValue.trim();
    if (!content || loading) return;

    try {
      await onSend(content);
      // Clear the input after successful send
      setInputValue('');
    } catch (error) {
      // In a real app, we might want to show an error or revert the input
      console.error('Failed to send message:', error);
      // We are not clearing the input on error so the user can try again
    }
  };

  return (
    <div className="flex items-center px-4 py-3 border-t border-gray-800 bg-gray-950">
      {/* Attach button (placeholder) */}
      <button 
        onClick={() => { /* File upload logic would go here */ }}
        className="p-2 rounded hover:bg-gray-800 transition-colors text-gray-400 hover:text-gray-300"
      >
        {/* Attach icon (paperclip) */}
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 11V6a2 2 0 012-2h2a2 2 0 012 2v5m-4 0l3 3m-3-3L5 8" />
        </svg>
      </button>
      <form onSubmit={handleSubmit} className="flex-1 space-x-2">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            onInputChange(e.target.value.length > 0);
          }}
          onBlur={onBlur}
          placeholder="Digite uma mensagem..."
          className={`flex-1 rounded-xl px-4 py-2 bg-gray-900 border border-gray-700 text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all ${
            loading ? 'opacity-50' : ''
          }`}
          disabled={loading}
        />
        <button 
          type="submit"
          disabled={!inputValue.trim() || loading}
          className={`px-4 py-2 rounded-xl ${
            !inputValue.trim() || loading 
              ? 'bg-gray-700 text-gray-400 cursor-not-allowed' 
              : 'bg-amber-400 text-gray-900 hover:bg-amber-300 transition-colors'
          }`}
        >
          {loading ? 'Enviando...' : 'Enviar'}
        </button>
      </form>
    </div>
  );
};