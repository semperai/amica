import { useCallback, useContext, useEffect, useState, useRef } from "react";
import { M_PLUS_2, Montserrat } from "next/font/google";
import { useTranslation, Trans } from 'react-i18next';

import { AssistantText } from "@/components/assistantText";
import { AddToHomescreen } from "@/components/addToHomescreen";
import { UserText } from "@/components/userText";
import { IconButton } from "@/components/iconButton";
import { ChatLog } from "@/components/chatLog";
import VrmViewer from "@/components/vrmViewer";
import { MessageInputContainer } from "@/components/messageInputContainer";
import { Introduction } from "@/components/introduction";
import { LoadingProgress } from "@/components/loadingProgress";
import { DebugPane } from "@/components/debugPane";
import { Settings } from "@/components/settings";
import { EmbeddedWebcam } from "@/components/embeddedWebcam";

import { ViewerContext } from "@/features/vrmViewer/viewerContext";
import { Message, Role } from "@/features/chat/messages";
import { ChatContext } from "@/features/chat/chatContext";

import { config, updateConfig } from '@/utils/config';
import LanguageSwitcher from "@/i18n/languageSwitcher";

const m_plus_2 = M_PLUS_2({
  variable: "--font-m-plus-2",
  display: "swap",
  preload: false,
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  display: "swap",
  subsets: ["latin"],
});


export default function Home() {
  const { t } = useTranslation();
  const { viewer } = useContext(ViewerContext);
  const { chat: bot } = useContext(ChatContext);

  const [chatProcessing, setChatProcessing] = useState(false);
  const [chatLog, setChatLog] = useState<Message[]>([]);
  const [assistantMessage, setAssistantMessage] = useState("");
  const [userMessage, setUserMessage] = useState("");
  const [shownMessage, setShownMessage] = useState<Role>("system");

  // showContent exists to allow ssr
  // otherwise issues from usage of localStorage and window will occur
  const [showContent, setShowContent] = useState(false);


  const [showSettings, setShowSettings] = useState(false);
  const [showChatLog, setShowChatLog] = useState(false);
  const [showDebug, setShowDebug] = useState(false);


  useEffect(() => {
    if (config("bg_color") !== '') {
      document.body.style.backgroundColor = config("bg_color");
    } else {
      document.body.style.backgroundImage = `url(${config("bg_url")})`;
    }
  }, []);

  useEffect(() => {
    bot.initialize(
      viewer,
      setChatLog,
      setUserMessage,
      setAssistantMessage,
      setShownMessage,
      setChatProcessing,
    );

    // TODO remove in future
    // this change was just to make naming cleaner
    if (config("tts_backend") === 'openai') {
      updateConfig("tts_backend", "openai_tts");
    }
  }, [bot, viewer]);

  // this exists to prevent build errors with ssr
  useEffect(() => setShowContent(true), []);
  if (!showContent) return <></>;

  return (
    <div className={`${m_plus_2.variable} ${montserrat.variable}`}>
      { config("youtube_videoid") !== '' && (
        <div className="absolute video-container w-screen h-screen z-0">
          <iframe
            className="w-screen h-screen"
            src={`https://www.youtube.com/embed/${config("youtube_videoid")}?&autoplay=1&mute=1&playsinline=1&loop=1&controls=0&disablekb=1&fs=0&playlist=${config("youtube_videoid")}`}
            frameBorder="0"></iframe>
        </div>
      )}

      <Introduction open={config("show_introduction") === 'true'} />
      <LoadingProgress />
      { showDebug && <DebugPane onClickClose={() => setShowDebug(false) }/> }
      <VrmViewer />
      <MessageInputContainer
        isChatProcessing={chatProcessing}
      />

      {/* main menu */}
      <div className="absolute z-10 m-2">
        <div className="grid grid-flow-col gap-[8px]">
          <IconButton
            iconName="24/Menu"
            label="Settings"
            isProcessing={false}
            className="bg-secondary hover:bg-secondary-hover active:bg-secondary-press shadow-sm z-[11]"
            onClick={() => setShowSettings(true)}
          ></IconButton>

          { config("show_webcam") === 'true' && (
            <EmbeddedWebcam />
          )}

          {showChatLog ? (
            <IconButton
              iconName="24/CommentOutline"
              label={t("Conversation")}
              isProcessing={false}
              onClick={() => setShowChatLog(false)}
              className="shadow-sm z-[11]"
            />
          ) : (
            <IconButton
              iconName="24/CommentFill"
              label={t("Conversation")}
              isProcessing={false}
              disabled={chatLog.length <= 0}
              onClick={() => setShowChatLog(true)}
              className="shadow-sm z-[11]"
            />
          )}

          <div className="shadow-sm z-[11]"><LanguageSwitcher></LanguageSwitcher></div>

          <IconButton
            iconName="24/Error"
            label={t("Debug")}
            isProcessing={false}
            className="bg-secondary hover:bg-secondary-hover active:bg-secondary-press shadow-sm z-[11]"
            onClick={() => setShowDebug(true)}
          ></IconButton>
        </div>
      </div>

      {showChatLog && <ChatLog messages={chatLog} />}

      {showSettings && (
        <Settings
          onClickClose={() => setShowSettings(false)}
        />
      )}

      {! showChatLog && (
        <>
          { shownMessage === 'assistant' && (
            <AssistantText message={assistantMessage} />
          )}
          { shownMessage === 'user' && (
            <UserText message={userMessage} />
          )}
        </>
      )}

      <AddToHomescreen />
    </div>
  );
}
