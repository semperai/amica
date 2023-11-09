import dynamic from "next/dynamic";
import { useCallback, useEffect, useState } from "react";

// necessary because of VAD in MessageInput
const DynamicMessageInput = dynamic(() =>
  import("@/components/messageInput"), {
    ssr: false
  }
);

/**
 * Provides text input and voice input
 *
 * Automatically send when speech recognition is completed,
 * and disable input while generating response text
 */
export const MessageInputContainer = ({
  isChatProcessing,
}: {
  isChatProcessing: boolean;
}) => {
  const [userMessage, setUserMessage] = useState("");

  useEffect(() => {
    if (!isChatProcessing) {
      setUserMessage("");
    }
  }, [isChatProcessing]);

  return (
    <DynamicMessageInput
      userMessage={userMessage}
      setUserMessage={setUserMessage}
      isChatProcessing={isChatProcessing}
      onChangeUserMessage={(e) => setUserMessage(e.target.value)}
    />
  );
};
