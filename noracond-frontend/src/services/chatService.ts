import api from '../api/api';
import { ContactResponse, MessageResponse, EnviarMensagemRequest } from '../types/chat';

/**
 * Serviço para gerenciar operações de chat interno
 */
export class ChatService {
  /**
   * Busca a lista de contatos disponíveis para chat
   */
  static async getContacts(): Promise<ContactResponse[]> {
    try {
      const response = await api.get('/chat/contatos');
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar contatos:', error);
      throw new Error('Falha ao carregar lista de contatos');
    }
  }

  /**
   * Busca o histórico de conversa com um usuário específico
   */
  static async getConversationHistory(otherUserId: string): Promise<MessageResponse[]> {
    try {
      const response = await api.get(`/chat/conversa/${otherUserId}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar histórico da conversa:', error);
      throw new Error('Falha ao carregar histórico da conversa');
    }
  }

  /**
   * Envia uma nova mensagem para um usuário
   */
  static async sendMessage(data: EnviarMensagemRequest): Promise<MessageResponse> {
    try {
      const response = await api.post('/chat/enviar', data);
      return response.data;
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      throw new Error('Falha ao enviar mensagem');
    }
  }

  /**
   * Marca mensagens como lidas
   */
  static async markMessagesAsRead(otherUserId: string): Promise<void> {
    try {
      await api.put(`/chat/marcar-lidas/${otherUserId}`);
    } catch (error) {
      console.error('Erro ao marcar mensagens como lidas:', error);
      // Não lança erro pois não é crítico para a funcionalidade
    }
  }

  /**
   * Busca novas mensagens para uma conversa específica
   * Usado para polling/atualização periódica
   */
  static async getNewMessages(otherUserId: string, lastMessageId?: string): Promise<MessageResponse[]> {
    try {
      const params = lastMessageId ? { ultimaMensagemId: lastMessageId } : {};
      const response = await api.get(`/chat/novas-mensagens/${otherUserId}`, { params });
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar novas mensagens:', error);
      return []; // Retorna array vazio em caso de erro para não quebrar o polling
    }
  }
}

// Exportações nomeadas para compatibilidade
export const getContacts = ChatService.getContacts;
export const getConversationHistory = ChatService.getConversationHistory;
export const sendMessage = ChatService.sendMessage;
export const markMessagesAsRead = ChatService.markMessagesAsRead;
export const getNewMessages = ChatService.getNewMessages;