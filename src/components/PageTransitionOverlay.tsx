import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

export const PageTransitionOverlay: React.FC = () => {
  const location = useLocation();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Quando a rota muda, ativa o overlay
    setIsVisible(true);

    // Remove o overlay com fade out após um breve momento
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 50); // Inicia o fade out quase imediatamente após renderizar a nova tela

    return () => clearTimeout(timer);
  }, [location.pathname]); // Executa toda vez que a rota muda

  return (
    <div 
      className={`fixed inset-0 ${location.pathname === '/login' ? 'bg-[#0b1120]' : 'bg-gradient-to-b from-[#F8FAFC] to-[#F1F5F9] dark:bg-none dark:bg-[#020617]'} z-[9999] pointer-events-none transition-opacity duration-300 ease-in-out ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
    />
  );
};
