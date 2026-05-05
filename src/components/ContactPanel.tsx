// src/components/ContactPanel.tsx
const ContactPanel = ({ contact }) => {
  if (!contact) {
    return (
      <div className="w-64 bg-gray-950 border-l border-gray-800 flex flex-col">
        <div className="flex items-center px-4 py-6 border-b border-gray-800">
          <h2 className="text-lg font-semibold text-gray-100">Contato</h2>
        </div>
        <div className="flex-1 flex-col items-center justify-center text-center">
          <p className="text-gray-400">Selecione uma conversa para ver os detalhes do contato</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-64 bg-gray-950 border-l border-gray-800 flex flex-col">
      {/* Header */}
      <div className="flex items-center px-4 py-6 border-b border-gray-800">
        <h2 className="text-lg font-semibold text-gray-100">Contato</h2>
      </div>
      
      {/* Contact Info */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Avatar and Name */}
        <div className="flex items-center space-x-4 mb-4">
          <img 
            src={contact.avatar} 
            alt={contact.name} 
            className="w-12 h-12 rounded-full border-2 border-gray-800"
          />
          <div>
            <h3 className="font-semibold text-gray-100">{contact.name}</h3>
            <div className="text-xs text-gray-400">
              {contact.online ? 
                <span className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Online</span>
                </span> 
                : 
                <span className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                  <span>Offline</span>
                </span>
              }
            </div>
          </div>
        </div>
        
        {/* Contact Details */}
        <div className="space-y-3">
          <div className="text-sm font-medium text-gray-300 mb-1">Informações</div>
          <div className="space-y-1 text-gray-400">
            <div className="flex items-center">
              <span className="w-8 text-gray-500">📧</span>
              <span>{contact.email || 'Não informado'}</span>
            </div>
            <div className="flex items-center">
              <span className="w-8 text-gray-500">📱</span>
              <span>{contact.phone || 'Não informado'}</span>
            </div>
            <div className="flex items-center">
              <span className="w-8 text-gray-500">🏢</span>
              <span>{contact.company || 'Não informado'}</span>
            </div>
          </div>
        </div>
        
        {/* Tags */}
        <div className="space-y-3">
          <div className="text-sm font-medium text-gray-300 mb-1">Tags</div>
          <div className="flex flex-wrap gap-2">
            {(contact.tags || []).map((tag, index) => (
              <span 
                key={index} 
                className="px-2 py-1 bg-gray-800 text-xs rounded-full text-amber-300"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>
        
        {/* Notes */}
        <div className="space-y-3">
          <div className="text-sm font-medium text-gray-300 mb-1">Notas</div>
          <div className="bg-gray-900 rounded-lg p-3 min-h-[80px] text-gray-400">
            {contact.notes || 
              <p className="italic">Nenhuma nota adicionada</p>
            }
          </div>
          <button 
            onClick={() => {}}
            className="mt-2 w-full text-left text-sm text-amber-400 hover:text-amber-300"
          >
            + Adicionar nota
          </button>
        </div>
      </div>
      
      {/* Quick Actions */}
      <div className="px-4 py-4 border-t border-gray-800">
        <button 
          onClick={() => {}}
          className="w-full bg-gray-800 hover:bg-amber-500 text-gray-100 font-medium py-2 px-4 rounded-xl transition-all duration-200 flex items-center justify-center space-x-2"
        >
          <span>Iniciar chamada</span>
        </button>
        <button 
          onClick={() => {}}
          className="mt-2 w-full bg-gray-800 hover:bg-amber-500 text-gray-100 font-medium py-2 px-4 rounded-xl transition-all duration-200 flex items-center justify-center space-x-2"
        >
          <span>Enviar arquivo</span>
        </button>
      </div>
    </div>
  );
};

export default ContactPanel;