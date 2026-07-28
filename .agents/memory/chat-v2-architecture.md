---
name: Chat V2 frontend architecture
description: How the User Chat V2 is structured — hooks, services, image encoding, typing indicator pattern.
---

## Structure
All chat frontend code lives in `artifacts/quantum-investments/src/features/chat/`.

- **types/chat.types.ts** — `ChatConversation`, `ChatMessage`, `IMG_PREFIX = '[img]:'`, `isImageMessage()`, `getImageSrc()`
- **services/chatApi.ts** — `chatApiService` with `getOrCreate`, `getConversation`, `getMessages`, `sendMessage`, `markRead`, `getUnreadCount`
- **hooks/useChat.ts** — main orchestration hook (conversation init, polling at 3s, optimistic send, typing indicator)
- **components/** — `ChatHeader`, `ChatBubble`, `ChatInput`, `ChatMessageList`, `ChatWindow`, `ChatUnreadBadge`, `ChatPopupButton`, `ChatConversationList`, `ChatConversationItem`
- **context/** — `ChatContext` + `ChatProvider` (wraps `useChat` for optional context sharing)
- **pages/UserChatPage.tsx** — the routed page; uses `useChat` directly
- **pages/AdminChatPage.tsx** — stub only (admin chat not yet built)

## Image messages
Images are encoded as base64 data URLs prefixed with `[img]:` and stored in the message text field. No separate upload endpoint. Detected via `isImageMessage()`, rendered as `<img>` tag.

## Typing indicator
After user sends a message, `showTyping = true` for 2.2s (simulates admin reading). Also flashes briefly when a new admin message arrives mid-poll.

## Read receipts
- Single ✓ = user's message sent, `is_read: false`
- Double ✓✓ (accent color) = admin has read it, `is_read: true`
- Admin messages are marked read automatically on load via `markRead()`.

## Admin sender_id fix
Admin login now sets `req.session.userId` to the admin's DB user ID (id=1). Fix is in `artifacts/api-server/src/routes/admin-auth.ts`.

**Why:** Without this, `req.session.userId ?? 0` stored `sender_id = 0` for all admin messages.

## Route + sidebar
- Route: `/dashboard/chat` → `UserChatPage` in `App.tsx`
- Sidebar: `Live Chat` nav item with live unread badge via `useChatUnreadCount` hook (polls every 10s)
