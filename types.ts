
export enum Role {
  PATRAO = 'Patrão',
  MEMBRO = 'Membro',
}

export interface User {
  id: string;
  name: string;
  email?: string;
  role: Role;
  points: number;
  // Profile Fields
  bio?: string;
  avatarUrl?: string;
  coverUrl?: string;
  jobTitle?: string;
  location?: string;
  followers?: number;
  following?: number;
  linkedinUrl?: string;
  instagramUrl?: string;
}

export enum TaskStatus {
  PENDENTE = 'Pendente',
  CONCLUIDA = 'Concluída',
}

export interface Task {
  id: number;
  firestoreId?: string;
  title: string;
  description: string;
  channel: string;
  responsible: string[];
  points: number;
  deadline?: string;
  status: TaskStatus;
}

export interface Team {
    id: string;
    name: string;
    description: string;
    ownerId: string;
    members: string[]; // User IDs
    createdAt: string;
    logoUrl?: string;    // New: Custom Logo
    themeColor?: string; // New: Custom Color (hex)
}

export interface Channel {
  id: string;
  name: string;
  teamId?: string; // Optional: if null/undefined, it's a global channel
}

export enum MessageSender {
  USER = 'user',
  ASSISTANT = 'assistant',
}

export interface Message {
  id: number;
  text: string;
  sender: MessageSender;
}

export interface Attachment {
    type: 'image' | 'video' | 'file' | 'audio';
    url: string;
    name?: string;
}

export interface ChannelMessage {
  id: string;
  channelId: string;
  userId: string;
  text: string;
  timestamp: string;
  attachments?: Attachment[]; // New: Attachments
}

export interface GeminiResponse {
    action: string;
    payload: {
        taskId?: number;
        task?: Partial<Task>;
        member?: string;
    };
    assistantResponse: string;
}

// Types for the Social Hub feature
export interface SocialMessage {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
  attachments?: Attachment[]; // New: Attachments
}

export interface Conversation {
  participantIds: string[];
  messages: SocialMessage[];
}

export interface Post {
  id: string;
  authorId: string;
  text: string;
  timestamp: string;
}

export interface TechNewsItem {
  title: string;
  summary: string;
  source: string;
}

export interface GlobalReminder {
    id: string;
    title: string;
    date: string; // DD/MM/YYYY
    type: 'meeting' | 'holiday' | 'event';
    time?: string;
    createdBy: string;
}
