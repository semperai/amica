import { useCallback, useContext, useEffect, useState, useRef } from "react";
import { M_PLUS_2, Montserrat } from "next/font/google";

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
import {
  Message,
  textsToScreenplay,
  Screenplay,
} from "@/features/chat/messages";
import { speakCharacter } from "@/features/chat/speakCharacter";
import { getChatResponseStream } from "@/features/chat/chat";

import { buildUrl } from "@/utils/buildUrl";
import { config } from '@/utils/config';

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
  const { viewer } = useContext(ViewerContext);

  const [chatProcessing, setChatProcessing] = useState(false);
  const [chatLog, setChatLog] = useState<Message[]>([]);
  const [assistantMessage, setAssistantMessage] = useState("");
  const [userMessage, setUserMessage] = useState("");
  const [shownMessage, setShownMessage] = useState("system");

  // showContent exists to allow ssr
  // otherwise issues from usage of localStorage and window will occur
  const [showContent, setShowContent] = useState(false);


  const [showSettings, setShowSettings] = useState(false);
  const [showChatLog, setShowChatLog] = useState(false);
  const [showDebug, setShowDebug] = useState(false);


  useEffect(() => {
    document.body.style.backgroundImage = `url(${config("bg_url")})`;
  }, []);


  useEffect(() => {
    if (window.localStorage.getItem("chatVRMParams")) {
      const params = JSON.parse(
        window.localStorage.getItem("chatVRMParams") as string
      );
      // setChatLog(params.chatLog);
    }
  }, []);

  useEffect(() => {
    process.nextTick(() =>
      window.localStorage.setItem(
        "chatVRMParams",
        JSON.stringify({ chatLog })
      )
    );
  }, [chatLog]);


  /**
   * Playback while requesting audio serially for each sentence
   */
  const handleSpeakAi = useCallback(
    async (
      screenplay: Screenplay,
      onStart?: () => void,
      onEnd?: () => void,
    ) => {
      setShownMessage('assistant');
      speakCharacter(screenplay, viewer, onStart, onEnd);
    },
    [viewer],
  );

  /**
   * Have a conversation with your assistant
   */
  const handleSendChat = useCallback(
    async (text: string, overrideChatLog?: Message[]) => {
      if (text === null) return;

      console.time('chat stream first message');
      const newMessage = text;

      const baseChatLog = overrideChatLog || chatLog;

      setUserMessage(newMessage);
      setAssistantMessage("");
      setShownMessage('user');

      setChatProcessing(true);

      // Add and display user comments
      const messageLog: Message[] = [
        ...baseChatLog,
        { role: "user", content: newMessage },
      ];
      setChatLog(messageLog);

      // Chat GPTへ
      const messages: Message[] = [
        {
          role: "system",
          content: config("system_prompt"),
        },
        ...messageLog,
      ];

      let stream = null;
      try {
        stream = await getChatResponseStream(messages);
      } catch(e: any) {
        console.error(e);
        const errMsg = e.toString();
        setAssistantMessage(errMsg);
        const messageLogAssistant: Message[] = [
          ...messageLog,
          { role: "assistant", content: errMsg },
        ];

        setChatLog(messageLogAssistant);
        setChatProcessing(false);
        setShownMessage('assistant');
      }

      if (stream == null) {
        setChatProcessing(false);
        return;
      }

      console.time('chat stream processing');
      const reader = stream.getReader();
      let receivedMessage = "";
      let aiTextLog = "";
      let tag = "";
      const sentences = new Array<string>();
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          receivedMessage += value;

          // Detection of tag part of reply content
          const tagMatch = receivedMessage.match(/^\[(.*?)\]/);
          if (tagMatch && tagMatch[0]) {
            tag = tagMatch[0];
            receivedMessage = receivedMessage.slice(tag.length);
          }

          // Cut out and process the response sentence by sentence
          const sentenceMatch = receivedMessage.match(
            /^(.+[\.\!\?\n]|.{10,}[,])/,
          );
          if (sentenceMatch && sentenceMatch[0]) {
            const sentence = sentenceMatch[0];
            sentences.push(sentence);
            receivedMessage = receivedMessage
              .slice(sentence.length)
              .trimStart();

            // Skip if the string is unnecessary/impossible to utter.
            if (
              !sentence.replace(
                /^[\s\[\(\{「［（【『〈《〔｛«‹〘〚〛〙›»〕》〉』】）］」\}\)\]]+$/g,
                "",
              )
            ) {
              continue;
            }

            const aiText = `${tag} ${sentence}`;
            const aiTalks = textsToScreenplay([aiText]);
            aiTextLog += aiText;

            // Generate & play audio for each sentence, display responses
            const currentAssistantMessage = sentences.join(" ");
            handleSpeakAi(aiTalks[0], () => {
              console.timeEnd('chat stream first message');
              setAssistantMessage(currentAssistantMessage);
            });
          }
        }
      } catch (e) {
        setChatProcessing(false);
        console.error(e);
      } finally {
        reader.releaseLock();
        console.timeEnd('chat stream processing');
      }

      // reduce unnecessary spaces in response
      // improves performance for some models
      aiTextLog = aiTextLog.trim();

      // Add assistant responses to log
      const messageLogAssistant: Message[] = [
        ...messageLog,
        { role: "assistant", content: aiTextLog },
      ];

      setChatLog(messageLogAssistant);
      setChatProcessing(false);
    },
    [chatLog, handleSpeakAi],
  );

  useEffect(() => {
    setShowContent(true);
  }, []);

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
        onChatProcessStart={handleSendChat}
      />

      {/* main menu */}
      <div className="absolute z-10 m-2">
        <div className="grid grid-flow-col gap-[8px]">
          <IconButton
            iconName="24/Menu"
            label="Settings"
            isProcessing={false}
            className="bg-secondary hover:bg-secondary-hover active:bg-secondary-active shadow-sm"
            onClick={() => setShowSettings(true)}
          ></IconButton>

          {showChatLog ? (
            <IconButton
              iconName="24/CommentOutline"
              label="Conversation"
              isProcessing={false}
              onClick={() => setShowChatLog(false)}
              className="shadow-sm"
            />
          ) : (
            <IconButton
              iconName="24/CommentFill"
              label="Conversation"
              isProcessing={false}
              disabled={chatLog.length <= 0}
              onClick={() => setShowChatLog(true)}
              className="shadow-sm"
            />
          )}

          { config("show_webcam") === 'true' && (
            <EmbeddedWebcam />
          )}

          <IconButton
            iconName="24/Error"
            label="Debug"
            isProcessing={false}
            className="bg-secondary hover:bg-secondary-hover active:bg-secondary-active"
            onClick={() => setShowDebug(true)}
          ></IconButton>
        </div>
      </div>

      {showChatLog && <ChatLog
        messages={chatLog}
        handleResume={(previousMessages:Message[], newMessage:string) => {
          handleSendChat(newMessage, previousMessages);
        }}
      />}

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
