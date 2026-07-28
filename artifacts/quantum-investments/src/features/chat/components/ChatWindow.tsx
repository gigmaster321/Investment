import ChatHeader from './ChatHeader';
import ChatMessageList from './ChatMessageList';
import ChatInput from './ChatInput';
import { useChat } from '../hooks/useChat';

/** Self-contained chat window — embeds its own useChat state. */
export default function ChatWindow() {
  const { messages, isLoading, isSending, showTyping, error, sendMessage, sendImage } = useChat();

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <ChatHeader />
      <ChatMessageList messages={messages} showTyping={showTyping} isLoading={isLoading} />
      <ChatInput
        onSend={sendMessage}
        onSendImage={sendImage}
        isSending={isSending}
        disabled={!!error || isLoading}
      />
    </div>
  );
}
