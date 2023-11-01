import { useCallback, useContext, useEffect, useState } from "react";
import { buildUrl } from "@/utils/buildUrl";
import { M_PLUS_2, Montserrat } from "next/font/google";
import VrmViewer from "@/components/vrmViewer";
import { ViewerContext } from "@/features/vrmViewer/viewerContext";
import {
  Message,
  textsToScreenplay,
  Screenplay,
} from "@/features/messages/messages";
import { speakCharacter } from "@/features/messages/speakCharacter";
import { MessageInputContainer } from "@/components/messageInputContainer";
import { getChatResponseStream } from "@/features/chat/chat";
import { Introduction } from "@/components/introduction";
import { LoadingProgress } from "@/components/loadingProgress";
import { Menu } from "@/components/menu";
import { EmbeddedWebcam } from "@/components/embeddedWebcam";
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
  const [showContent, setShowContent] = useState(false);


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

  const handleChangeChatLog = useCallback(
    (targetIndex: number, text: string) => {
      const newChatLog = chatLog.map((v: Message, i) => {
        return i === targetIndex ? { role: v.role, content: text } : v;
      });

      setChatLog(newChatLog);
    },
    [chatLog],
  );

  /**
   * Playback while requesting audio serially for each sentence
   */
  const handleSpeakAi = useCallback(
    async (
      screenplay: Screenplay,
      onStart?: () => void,
      onEnd?: () => void,
    ) => {
      speakCharacter(screenplay, viewer, onStart, onEnd);
    },
    [viewer],
  );

  /**
   * Have a conversation with your assistant
   */
  const handleSendChat = useCallback(
    async (text: string) => {
      const newMessage = text;

      if (newMessage == null) return;

      setChatProcessing(true);
      // Add and display user comments
      const messageLog: Message[] = [
        ...chatLog,
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

      const stream = await getChatResponseStream(messages).catch(
        (e) => {
          console.error(e);
          const errMsg = e.toString();
          setAssistantMessage(errMsg);
          const messageLogAssistant: Message[] = [
            ...messageLog,
            { role: "assistant", content: errMsg },
          ];

          setChatLog(messageLogAssistant);
          setChatProcessing(false);
          return null;
        },
      );
      if (stream == null) {
        setChatProcessing(false);
        return;
      }

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
            /^(.+[\.!\?\n]|.{10,}[,])/,
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
              setAssistantMessage(currentAssistantMessage);
            });
          }
        }
      } catch (e) {
        setChatProcessing(false);
        console.error(e);
      } finally {
        reader.releaseLock();
      }

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
      <Introduction open={config("show_introduction") === 'true'} />
      <LoadingProgress />
      {/* <EmbeddedWebcam /> */}
      <VrmViewer />
      <MessageInputContainer
        isChatProcessing={chatProcessing}
        onChatProcessStart={handleSendChat}
      />
      <Menu
        chatLog={chatLog}
        assistantMessage={assistantMessage}
        onChangeChatLog={handleChangeChatLog}
        onClickResetChatLog={() => setChatLog([])}
      />
    </div>
  );
}
