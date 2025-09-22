import React from 'react';
import { ContactResponse } from '../../types/chat';
import { User, MessageCircle, Circle } from 'lucide-react';

interface ContactListProps {
  contacts: ContactResponse[];
  selectedContact: ContactResponse | null;
  onSelectContact: (contact: ContactResponse) => void;
  loading?: boolean;
}

const ContactList: React.FC<ContactListProps> = ({
  contacts,
  selectedContact,
  onSelectContact,
  loading = false
}) => {
  if (loading) {
    return (
      <div className="p-4">
        <div className="animate-pulse space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-300 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (contacts.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        <MessageCircle className="w-12 h-12 mx-auto mb-3 text-gray-400" />
        <p>Nenhum contato disponível</p>
      </div>
    );
  }

  const formatLastMessageTime = (dateString?: string) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString('pt-BR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } else if (diffInHours < 168) { // 7 dias
      return date.toLocaleDateString('pt-BR', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('pt-BR', { 
        day: '2-digit', 
        month: '2-digit' 
      });
    }
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Conversas</h2>
      </div>
      
      <div className="divide-y divide-gray-200">
        {contacts.map((contact) => (
          <button
            key={contact.id}
            onClick={() => onSelectContact(contact)}
            className={`w-full p-4 text-left hover:bg-gray-50 transition-colors duration-150 ${
              selectedContact?.id === contact.id 
                ? 'bg-blue-50 border-r-2 border-blue-500' 
                : ''
            }`}
          >
            <div className="flex items-center space-x-3">
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                {contact.avatar ? (
                  <img
                    src={contact.avatar}
                    alt={contact.nome}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-gray-600" />
                  </div>
                )}
                
                {/* Status online */}
                {contact.online && (
                  <div className="absolute -bottom-0.5 -right-0.5">
                    <Circle className="w-3 h-3 text-green-500 fill-current" />
                  </div>
                )}
              </div>

              {/* Informações do contato */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className={`text-sm font-medium truncate ${
                    contact.naoLidas && contact.naoLidas > 0 
                      ? 'text-gray-900' 
                      : 'text-gray-700'
                  }`}>
                    {contact.nome}
                  </h3>
                  
                  <div className="flex items-center space-x-2">
                    {contact.ultimaMensagemData && (
                      <span className="text-xs text-gray-500">
                        {formatLastMessageTime(contact.ultimaMensagemData)}
                      </span>
                    )}
                    
                    {contact.naoLidas && contact.naoLidas > 0 && (
                      <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-medium text-white bg-blue-600 rounded-full">
                        {contact.naoLidas > 99 ? '99+' : contact.naoLidas}
                      </span>
                    )}
                  </div>
                </div>
                
                {contact.ultimaMensagem && (
                  <p className={`text-sm truncate mt-1 ${
                    contact.naoLidas && contact.naoLidas > 0 
                      ? 'text-gray-900 font-medium' 
                      : 'text-gray-500'
                  }`}>
                    {contact.ultimaMensagem}
                  </p>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ContactList;