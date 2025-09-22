import React, { useEffect, useRef } from 'react';
import ScrollToBottom from 'react-scroll-to-bottom';
import { MessageResponse, ContactResponse } from '../../types/chat';
import { User, MessageSquare } from 'lucide-react';

interface ConversationPanelProps {
  messages: MessageResponse[];
  selectedContact: ContactResponse | null;
  currentUserId: string;
  loading?: boolean;
  error?: string | null;
}

const ConversationPanel: React.FC<ConversationPanelProps> = ({
  messages,
  selectedContact,
  currentUserId,
  loading = false,
  error = null
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const formatMessageTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString('pt-BR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } else {
      return date.toLocaleDateString('pt-BR', { 
        day: '2-digit', 
        month: '2-digit',
        hour: '2-digit', 
        minute: '2-digit' 
      });
    }
  };

  const groupMessagesByDate = (messages: MessageResponse[]) => {
    const groups: { [key: string]: MessageResponse[] } = {};
    
    messages.forEach(message => {
      const date = new Date(message.dataEnvio).toLocaleDateString('pt-BR');
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
    });
    
    return groups;
  };

  // Estado vazio - nenhuma conversa selecionada
  if (!selectedContact) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Selecione uma conversa
          </h3>
          <p className="text-gray-500">
            Escolha um contato da lista para começar a conversar
          </p>
        </div>
      </div>
    );
  }

  // Estado de carregamento
  if (loading) {
    return (
      <div className="flex-1 flex flex-col">
        {/* Header da conversa */}
        <div className="p-4 border-b border-gray-200 bg-white">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gray-300 rounded-full animate-pulse"></div>
            <div>
              <div className="h-4 bg-gray-300 rounded w-24 animate-pulse"></div>
            </div>
          </div>
        </div>
        
        {/* Área de mensagens */}
        <div className="flex-1 p-4 space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xs p-3 rounded-lg animate-pulse ${
                i % 2 === 0 ? 'bg-gray-300' : 'bg-gray-200'
              }`}>
                <div className="h-4 bg-gray-400 rounded w-32 mb-2"></div>
                <div className="h-3 bg-gray-400 rounded w-16"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Estado de erro
  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <MessageSquare className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Erro ao carregar conversa
          </h3>
          <p className="text-gray-500 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  const messageGroups = groupMessagesByDate(messages);

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Header da conversa */}
      <div className="p-4 border-b border-gray-200 bg-white flex-shrink-0">
        <div className="flex items-center space-x-3">
          {selectedContact.avatar ? (
            <img
              src={selectedContact.avatar}
              alt={selectedContact.nome}
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-gray-600" />
            </div>
          )}
          <div>
            <h3 className="font-medium text-gray-900">{selectedContact.nome}</h3>
            <p className="text-sm text-gray-500">{selectedContact.email}</p>
          </div>
          {selectedContact.online && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Online
            </span>
          )}
        </div>
      </div>

      {/* Área de mensagens com scroll automático */}
      <ScrollToBottom className="flex-1 overflow-hidden">
        <div className="p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p className="text-gray-500">
                Nenhuma mensagem ainda. Seja o primeiro a enviar uma mensagem!
              </p>
            </div>
          ) : (
            Object.entries(messageGroups).map(([date, dayMessages]) => (
              <div key={date}>
                {/* Separador de data */}
                <div className="flex items-center justify-center my-4">
                  <div className="px-3 py-1 bg-gray-100 rounded-full text-xs text-gray-600">
                    {date}
                  </div>
                </div>
                
                {/* Mensagens do dia */}
                {dayMessages.map((message) => {
                  const isCurrentUser = message.remetenteId === currentUserId;
                  
                  return (
                    <div
                      key={message.id}
                      className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} mb-3`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          isCurrentUser
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 text-gray-900'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap break-words">
                          {message.conteudo}
                        </p>
                        <div className={`text-xs mt-1 ${
                          isCurrentUser ? 'text-blue-100' : 'text-gray-500'
                        }`}>
                          {formatMessageTime(message.dataEnvio)}
                          {isCurrentUser && (
                            <span className="ml-2">
                              {message.lida ? '✓✓' : '✓'}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollToBottom>
    </div>
  );
};

export default ConversationPanel;