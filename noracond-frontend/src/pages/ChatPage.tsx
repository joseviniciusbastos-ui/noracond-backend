import React, { useState, useEffect, useCallback } from 'react';
import { ContactResponse, MessageResponse, ChatState } from '../types/chat';
import { ChatService } from '../services/chatService';
import ContactList from '../components/chat/ContactList';
import ConversationPanel from '../components/chat/ConversationPanel';
import MessageInput from '../components/chat/MessageInput';
import authService from '../services/authService';
import { MessageCircle, Wifi, WifiOff } from 'lucide-react';

const ChatPage: React.FC = () => {
  const [chatState, setChatState] = useState<ChatState>({
    contacts: [],
    selectedContact: null,
    conversation: {
      messages: [],
      loading: false,
      error: null
    },
    loadingContacts: true,
    errorContacts: null
  });

  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const currentUser = authService.getUser();
  const currentUserId = currentUser?.id || '';

  // Polling interval para buscar novas mensagens
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);

  // Monitorar status de conexão
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Carregar lista de contatos
  const loadContacts = useCallback(async () => {
    try {
      setChatState(prev => ({ ...prev, loadingContacts: true, errorContacts: null }));
      const contacts = await ChatService.getContacts();
      setChatState(prev => ({ 
        ...prev, 
        contacts, 
        loadingContacts: false 
      }));
    } catch (error) {
      console.error('Erro ao carregar contatos:', error);
      setChatState(prev => ({ 
        ...prev, 
        loadingContacts: false, 
        errorContacts: 'Falha ao carregar lista de contatos' 
      }));
    }
  }, []);

  // Carregar histórico da conversa
  const loadConversation = useCallback(async (contact: ContactResponse) => {
    try {
      setChatState(prev => ({
        ...prev,
        conversation: { ...prev.conversation, loading: true, error: null }
      }));

      const messages = await ChatService.getConversationHistory(contact.id);
      
      setChatState(prev => ({
        ...prev,
        conversation: {
          messages,
          loading: false,
          error: null
        }
      }));

      // Marcar mensagens como lidas
      await ChatService.markMessagesAsRead(contact.id);
      
      // Atualizar contador de não lidas do contato
      setChatState(prev => ({
        ...prev,
        contacts: prev.contacts.map(c => 
          c.id === contact.id ? { ...c, naoLidas: 0 } : c
        )
      }));

    } catch (error) {
      console.error('Erro ao carregar conversa:', error);
      setChatState(prev => ({
        ...prev,
        conversation: {
          ...prev.conversation,
          loading: false,
          error: 'Falha ao carregar histórico da conversa'
        }
      }));
    }
  }, []);

  // Buscar novas mensagens (polling)
  const checkForNewMessages = useCallback(async () => {
    if (!chatState.selectedContact || !isOnline) return;

    try {
      const lastMessage = chatState.conversation.messages[chatState.conversation.messages.length - 1];
      const newMessages = await ChatService.getNewMessages(
        chatState.selectedContact.id,
        lastMessage?.id
      );

      if (newMessages.length > 0) {
        setChatState(prev => ({
          ...prev,
          conversation: {
            ...prev.conversation,
            messages: [...prev.conversation.messages, ...newMessages]
          }
        }));

        // Marcar novas mensagens como lidas
        await ChatService.markMessagesAsRead(chatState.selectedContact.id);
      }
    } catch (error) {
      console.error('Erro ao buscar novas mensagens:', error);
    }
  }, [chatState.selectedContact, chatState.conversation.messages, isOnline]);

  // Selecionar contato
  const handleSelectContact = useCallback((contact: ContactResponse) => {
    // Limpar polling anterior
    if (pollingInterval) {
      clearInterval(pollingInterval);
    }

    setChatState(prev => ({ ...prev, selectedContact: contact }));
    loadConversation(contact);

    // Iniciar polling para novas mensagens
    const interval = setInterval(checkForNewMessages, 3000); // 3 segundos
    setPollingInterval(interval);
  }, [loadConversation, checkForNewMessages, pollingInterval]);

  // Enviar mensagem
  const handleSendMessage = useCallback(async (content: string) => {
    if (!chatState.selectedContact) return;

    try {
      const newMessage = await ChatService.sendMessage({
        destinatarioId: chatState.selectedContact.id,
        conteudo: content
      });

      setChatState(prev => ({
        ...prev,
        conversation: {
          ...prev.conversation,
          messages: [...prev.conversation.messages, newMessage]
        }
      }));

      // Atualizar última mensagem do contato na lista
      setChatState(prev => ({
        ...prev,
        contacts: prev.contacts.map(contact =>
          contact.id === chatState.selectedContact?.id
            ? {
                ...contact,
                ultimaMensagem: content,
                ultimaMensagemData: newMessage.dataEnvio
              }
            : contact
        )
      }));

    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      throw error; // Re-throw para o MessageInput mostrar o erro
    }
  }, [chatState.selectedContact]);

  // Carregar contatos na montagem do componente
  useEffect(() => {
    loadContacts();
  }, [loadContacts]);

  // Limpar polling ao desmontar componente
  useEffect(() => {
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [pollingInterval]);

  // Verificar autenticação
  if (!currentUser) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <MessageCircle className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Acesso não autorizado
          </h3>
          <p className="text-gray-500">
            Você precisa estar logado para acessar o chat
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full bg-white">
      {/* Sidebar - Lista de Contatos */}
      <div className="w-80 border-r border-gray-200 flex flex-col">
        {/* Header da sidebar */}
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-semibold text-gray-900">Chat Interno</h1>
            <div className="flex items-center space-x-2">
              {isOnline ? (
                <Wifi className="w-4 h-4 text-green-500" title="Online" />
              ) : (
                <WifiOff className="w-4 h-4 text-red-500" title="Offline" />
              )}
            </div>
          </div>
          <p className="text-sm text-gray-600 mt-1">
            Olá, {currentUser.nome}
          </p>
        </div>

        {/* Lista de contatos */}
        <div className="flex-1 overflow-hidden">
          {chatState.errorContacts ? (
            <div className="p-4 text-center">
              <div className="text-red-600 mb-2">{chatState.errorContacts}</div>
              <button
                onClick={loadContacts}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Tentar novamente
              </button>
            </div>
          ) : (
            <ContactList
              contacts={chatState.contacts}
              selectedContact={chatState.selectedContact}
              onSelectContact={handleSelectContact}
              loading={chatState.loadingContacts}
            />
          )}
        </div>
      </div>

      {/* Área principal - Conversa */}
      <div className="flex-1 flex flex-col">
        <ConversationPanel
          messages={chatState.conversation.messages}
          selectedContact={chatState.selectedContact}
          currentUserId={currentUserId}
          loading={chatState.conversation.loading}
          error={chatState.conversation.error}
        />

        {/* Input de mensagem */}
        {chatState.selectedContact && (
          <MessageInput
            onSendMessage={handleSendMessage}
            disabled={!isOnline}
            placeholder={
              isOnline 
                ? `Enviar mensagem para ${chatState.selectedContact.nome}...`
                : 'Você está offline. Conecte-se à internet para enviar mensagens.'
            }
          />
        )}
      </div>
    </div>
  );
};

export default ChatPage;