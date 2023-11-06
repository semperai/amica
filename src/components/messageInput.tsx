import dynamic from "next/dynamic";
import { useEffect, useRef } from "react";
import { IconButton } from "./iconButton";
import { AudioManager } from "./audioManager";
import { useTranscriber } from "@/hooks/useTranscriber";

const VAD = dynamic(() => import("@/components/vad"), { ssr: false });

type Props = {
  userMessage: string;
  setUserMessage: (message: string) => void;
  isChatProcessing: boolean;
  onChangeUserMessage: (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => void;
  onClickSendButton: () => void;
};
export const MessageInput = ({
  userMessage,
  setUserMessage,
  isChatProcessing,
  onChangeUserMessage,
  onClickSendButton,
}: Props) => {
  const transcriber = useTranscriber();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (transcriber.output) {
      setUserMessage(transcriber.output?.text);
      inputRef.current?.focus();
    }
  }, [transcriber]);

  function send() {
    onClickSendButton();
    inputRef.current?.focus();
    setUserMessage("");
  }

  return (
    <div className="absolute bottom-0 z-20 w-screen">
      <div className="bg-base text-black">
        <div className="mx-auto max-w-4xl p-2">
          <div className="grid grid-flow-col grid-cols-[min-content_1fr_min-content] gap-[8px]">
            <AudioManager transcriber={transcriber} />

            <input
              type="text"
              ref={inputRef}
              placeholder="Write message here..."
              onChange={onChangeUserMessage}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  send();
                }
              }}
              disabled={false}

              className="disabled block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-1 focus:ring-inset focus:ring-gray-400 sm:text-sm sm:leading-6"
              value={userMessage}></input>
  
            <div className='flex flex-col justify-center items-center'>
              <IconButton
                iconName="24/Send"
                className="ml-2 bg-secondary hover:bg-secondary-hover active:bg-secondary-press disabled:bg-secondary-disabled"
                isProcessing={isChatProcessing}
                disabled={isChatProcessing || !userMessage}
                onClick={send}
              />
            </div>
            <VAD />
          </div>
        </div>
      </div>
    </div>
  );
};
