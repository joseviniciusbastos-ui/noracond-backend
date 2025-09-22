// Tipos para o sistema de chat interno

export interface ContactResponse {
  id: string;
  nome: string;
  email: string;
  avatar?: string;
  ultimaMensagem?: string;
  ultimaMensagemData?: string;
  naoLidas?: number;
  online?: boolean;
}

export interface MessageResponse {
  id: string;
  remetenteId: string;
  destinatarioId: string;
  conteudo: string;
  dataEnvio: string;
  lida: boolean;
  remetenteNome: string;
  destinatarioNome: string;
}

export interface EnviarMensagemRequest {
  destinatarioId: string;
  conteudo: string;
}

export interface ConversationState {
  messages: MessageResponse[];
  loading: boolean;
  error: string | null;
}

export interface ChatState {
  contacts: ContactResponse[];
  selectedContact: ContactResponse | null;
  conversation: ConversationState;
  loadingContacts: boolean;
  errorContacts: string | null;
}