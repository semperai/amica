import { useTranslation } from 'react-i18next';
import { clsx } from "clsx";
import { useContext, useEffect, useRef, useState } from "react";
import FlexTextarea from "@/components/flexTextarea/flexTextarea";
import { Message } from "@/features/chat/messages";
import { IconButton } from "@/components/iconButton";
import {
  ArrowPathIcon,
} from '@heroicons/react/20/solid';
import { config } from "@/utils/config";
import { ChatContext } from "@/features/chat/chatContext";

export const ChatLog = ({
   messages,
}: {
  messages: Message[];
}) => {
  const { t } = useTranslation();
  const { chat: bot } = useContext(ChatContext);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  const handleResumeButtonClick = (num: number, newMessage: string) => {
    bot.setMessageList(messages.slice(0, num));
    bot.receiveMessageFromUser(newMessage);
  };

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
    <>
      <div className="absolute left-12 top-4 z-10">
        <IconButton
          iconName="24/ReloadLoop"
          label={t("Restart")}
          isProcessing={false}
          className="bg-slate-600 hover:bg-slate-500 active:bg-slate-500 shadow-xl"
          onClick={() => {
            bot.setMessageList([]);
          }}
        ></IconButton>
      </div>

      <div className="fixed w-col-span-6 max-w-full h-full pb-16">

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
    </>
  );
};

function Chat({
  role,
  message,
  num,
  onClickResumeButton
}: {
  role: string;
  message: string;
  num: number;
  onClickResumeButton: (num: number, message: string) => void;
}) {
  const { t } = useTranslation();
  const [textAreaValue, setTextAreaValue] = useState(message);

  const onClickButton = () => {
    const newMessage = textAreaValue
    onClickResumeButton(num, newMessage);
  };



  return (
    <div className={clsx(
      'mx-auto max-w-sm my-8',
      role === "assistant" ? "pr-10 sm:pr-20" : "pl-10 sm:pl-20",
    )}>
      <div
        className={clsx(
          'px-8 py-2 rounded-t-lg font-bold tracking-wider flex justify-between shadow-inner backdrop-blur-lg',
          role === "assistant" ? "bg-pink-600/80" : "bg-cyan-600/80",
        )}
      >
        <div className="text-bold text-white">
          {role === "assistant" && config('name').toUpperCase()}
          {role === "user" && t("YOU")}
        </div>
        <button
          className="text-right"
          onClick={onClickButton}
        >
          {role === "user" && (
            <div className="ml-16 p-1 rounded-full">
              <ArrowPathIcon className="h-5 w-5 hover:animate-spin text-white" aria-hidden="true" />
            </div>
          )}
        </button>
      </div>
      <div className="px-4 py-2 bg-white/80 backdrop-blur-lg rounded-b-lg shadow-sm">
        <div className='typography-16 font-M_PLUS_2 font-bold text-gray-800'>
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
