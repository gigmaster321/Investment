export interface ChatConversation {
  id: number;
  user_id: number;
  created_at: string;
  updated_at: string;
  unread_count?: number;
}

export interface ChatMessage {
  id: number;
  conversation_id: number;
  sender_type: 'user' | 'admin';
  sender_id: number;
  message: string;
  is_read: boolean;
  created_at: string;
}

/** Messages that start with this prefix contain a base64-encoded image data URL. */
export const IMG_PREFIX = '[img]:';

export function isImageMessage(message: string): boolean {
  return message.startsWith(IMG_PREFIX);
}

export function getImageSrc(message: string): string {
  return message.slice(IMG_PREFIX.length);
}
