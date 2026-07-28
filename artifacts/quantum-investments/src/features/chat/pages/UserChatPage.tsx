import { AlertCircle } from 'lucide-react';
import { useChat } from '../hooks/useChat';
import ChatHeader from '../components/ChatHeader';
import ChatMessageList from '../components/ChatMessageList';
import ChatInput from '../components/ChatInput';

export default function UserChatPage() {
  const { messages, isLoading, isSending, showTyping, error, sendMessage, sendImage } = useChat();

  return (
    <div className="-m-6 md:-m-8 lg:-m-12 flex flex-col h-[calc(100dvh-4rem)] md:h-dvh overflow-hidden">
      {/* Header */}
      <ChatHeader />

      {/* Error banner */}
      {error && (
        <div className="flex items-center gap-2 px-4 py-2 bg-destructive/10 border-b border-destructive/20 text-destructive text-sm shrink-0">
          <AlertCircle size={15} className="shrink-0" />
          {error}
        </div>
      )}

      {/* Message list */}
      <ChatMessageList
        messages={messages}
        showTyping={showTyping}
        isLoading={isLoading}
        incomingLabel="QS"
      />

      {/* Input */}
      <ChatInput
        onSend={sendMessage}
        onSendImage={sendImage}
        isSending={isSending}
        disabled={!!error || isLoading}
      />
    </div>
  );
}
