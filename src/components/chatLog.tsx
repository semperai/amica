import { useEffect, useRef, useState } from "react";
import FlexTextarea from "@/components/flexTextarea/flexTextarea";
import { Message } from "@/features/messages/messages";
import {
  ArrowPathIcon,
} from '@heroicons/react/20/solid';

type Props = {
  messages: Message[];
  handleResume: (previousMessages: Message[], newMessage: string) => void;
};

export const ChatLog = ({
   messages ,
   handleResume
  }: Props) => {
  const handleResumeButtonClick = (num: number, newMessage: string) => {
    handleResume([...messages.slice(0, num)], newMessage);
  };

  const chatScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatScrollRef.current?.scrollIntoView({
      behavior: "auto",
      block: "center",
    });
  }, []);

  useEffect(() => {
    chatScrollRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  }, [messages]);
  return (
    <div className="absolute w-col-span-6 max-w-full h-[100svh] pb-16">
      <div className="max-h-full px-16 pt-20 pb-4 overflow-y-auto scroll-hidden">
        {messages.map((msg, i) => {
          return (
            <div key={i} ref={messages.length - 1 === i ? chatScrollRef : null}>
              <Chat
                role={msg.role}
                message={msg.content}
                num={i}
                onClickResumeButton={handleResumeButtonClick}
                />

            </div>
          );
        })}
      </div>
    </div>
  );
};

const Chat = ({ role, message, num, onClickResumeButton }: {
  role: string;
  message: string;
  num: number;
  onClickResumeButton: (num: number, message: string) => void;
}) => {
  const [textAreaValue, setTextAreaValue] = useState(message);

  const onClickButton = () => {
    const newMessage = textAreaValue
    onClickResumeButton(num, newMessage);
  };


  const roleColor =
    role === "assistant" ? "bg-secondary text-white " : "bg-base text-gray-700";
  const roleText = role === "assistant" ? "text-secondary" : "text-gray-600";
  const offsetX = role === "user" ? "pl-20" : "pr-20";

  return (
    <div className={`mx-auto max-w-sm my-8 ${offsetX}`}>
      <div
        className={`px-8 py-2 rounded-t-lg font-bold tracking-wider ${roleColor} flex justify-between shadow-sm shadow-inner`}

      >
        <div className="text-bold">
          {role === "assistant" ? "AMICA" : "YOU"}
        </div>
        <button
          className="text-right"
          onClick={onClickButton}
        >
          {role !== "assistant" && (
            <ArrowPathIcon className="ml-16 h-5 w-5" aria-hidden="true" />
          )}
        </button>
      </div>
      <div className="px-4 py-2 bg-white rounded-b-lg shadow-sm">
        <div className={`typography-16 font-M_PLUS_2 font-bold ${roleText}`}>
          {role === "assistant" ? (
            <div>{textAreaValue}</div>
          ) : (
            <FlexTextarea
              value={textAreaValue}
              onChange={setTextAreaValue}
            />
          )}
        </div>
      </div>
    </div>
  );
};
