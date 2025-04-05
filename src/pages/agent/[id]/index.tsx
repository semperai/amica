import {
  Fragment,
  useContext,
  useEffect,
  useState,
} from "react";
import Link from "next/link";
import { Menu, Transition } from '@headlessui/react'
import { clsx } from "clsx";
import { M_PLUS_2, Montserrat } from "next/font/google";
import { useTranslation, Trans } from 'react-i18next';
import {
  ChatBubbleLeftIcon,
  ChatBubbleLeftRightIcon,
  CloudArrowDownIcon,
  CodeBracketSquareIcon,
  LanguageIcon,
  ShareIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
  VideoCameraIcon,
  VideoCameraSlashIcon,
  WrenchScrewdriverIcon,
} from "@heroicons/react/24/outline";
import { IconBrain } from '@tabler/icons-react';

import { AssistantText } from "@/components/assistantText";
import { SubconciousText } from "@/components/subconciousText";
import { AddToHomescreen } from "@/components/addToHomescreen";
import { Alert } from "@/components/alert";
import { UserText } from "@/components/userText";
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
import { AlertContext } from "@/features/alert/alertContext";

import { config, defaults, syncAgentConfig, updateConfig } from '@/utils/config';
import { isTauri } from '@/utils/isTauri';
import { langs } from '@/i18n/langs';
import { VrmStoreProvider } from "@/features/vrmStore/vrmStoreContext";
import { AmicaLifeContext } from "@/features/amicaLife/amicaLifeContext";
import { ChatModeText } from "@/components/chatModeText";

import { VerticalSwitchBox } from "@/components/switchBox"
import { TimestampedPrompt } from "@/features/amicaLife/eventHandler";

import { useRouter } from "next/router";
import { useAccount, useWaitForTransactionReceipt, useReadContract} from 'wagmi';
import { abi } from "@/utils/abi";

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

// Contract address and ABI for fetching metadata
const CONTRACT_ADDRESS = "0x7e42c9d9946bA673415575C3a54dF5b37D68c925";

export default function Agent() {
  const { t, i18n } = useTranslation();
  const currLang = i18n.resolvedLanguage;
  const { viewer } = useContext(ViewerContext);
  const { alert } = useContext(AlertContext);
  const { chat: bot } = useContext(ChatContext);
  const { amicaLife: amicaLife } = useContext(AmicaLifeContext);

  const [chatSpeaking, setChatSpeaking] = useState(false);
  const [chatProcessing, setChatProcessing] = useState(false);
  const [chatLog, setChatLog] = useState<Message[]>([]);
  const [assistantMessage, setAssistantMessage] = useState("");
  const [userMessage, setUserMessage] = useState("");
  const [shownMessage, setShownMessage] = useState<Role>("system");
  const [subconciousLogs, setSubconciousLogs] = useState<TimestampedPrompt[]>([]);  

  // showContent exists to allow ssr
  // otherwise issues from usage of localStorage and window will occur
  const [showContent, setShowContent] = useState(false);

  const [showChatLog, setShowChatLog] = useState(false);
  const [showDebug, setShowDebug] = useState(false);
  const [showChatMode, setShowChatMode] = useState(false);
  const [showSubconciousText, setShowSubconciousText] = useState(false);

  // null indicates havent loaded config yet
  const [muted, setMuted] = useState<boolean | null>(null);
  const [webcamEnabled, setWebcamEnabled] = useState(false);


  const router = useRouter()
  const [error, setError] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const { isConnected } = useAccount();

  // Move the contract read outside of the function
  const tokenId = router.query.id ? parseInt(router.query.id as string, 10) : NaN;
  
  // Define the keys to filter
  const filterKeys = [
    "tts_muted", "autosend_from_mic", "wake_word_enabled", "wake_word",
    "time_before_idle_sec", "debug_gfx", "language", "show_introduction",
    "show_add_to_homescreen", "voice_url",
    "description", "image"
  ];

  // Filter and get the relevant defaults
  const keysList = Object.keys(defaults).filter(key => !filterKeys.includes(key));
  
  const { data: agentData, error: readError } = useReadContract({
    abi,
    address: CONTRACT_ADDRESS,
    functionName: 'getMetadata',
    args: [tokenId, keysList]
  });
  
  useEffect(() => {
    async function processCharacterData() {
      if (!isConnected || isNaN(tokenId) || !agentData) {
        return;
      }
      
      try {
        // Map the fetched data to config
        const configs: Record<string, string> = keysList.reduce((acc: Record<string, string>, key, index) => {
          acc[key] = (agentData as any)[index]; 
          return acc;
        }, {});
        
        // Handle error state
        if (readError || !configs) {
          setError(true);
          return;
        }
        
        // Update document style based on config
        if (configs.bg_color) {
          document.body.style.backgroundColor = configs.bg_color;
        } else if (configs.bg_url) {
          document.body.style.backgroundImage = `url(${configs.bg_url})`;
        }
        
        // Sync agent configuration
        syncAgentConfig(configs);
        
        // Set loaded state after all is done
        setLoaded(true);
      } catch (err) {
        console.error("Error processing data:", err);
        setError(true);
      }
    }
    
    processCharacterData();
    
  }, [agentData, isConnected, tokenId, keysList, readError, loaded]);

  function toggleTTSMute() {
    updateConfig('tts_muted', config('tts_muted') === 'true' ? 'false' : 'true')
    setMuted(config('tts_muted') === 'true')
  }

  const toggleState = (
    setFunc: React.Dispatch<React.SetStateAction<boolean>>,
    deps: React.Dispatch<React.SetStateAction<boolean>>[],
  ) => {
    setFunc(prev => {
      if (!prev) {
        deps.forEach(dep => dep(false));
      }
      return !prev;
    });
  };

  const toggleChatLog = () => {
    toggleState(setShowChatLog, [setShowSubconciousText, setShowChatMode]);
  };

  const toggleSubconciousText = () => {
    if (subconciousLogs.length !== 0) {
      toggleState(setShowSubconciousText, [setShowChatLog, setShowChatMode]);
    }
  };

  const toggleChatMode = () => {
    toggleState(setShowChatMode, [setShowChatLog, setShowSubconciousText]);
  };

  useEffect(() => {
    bot.initialize(
      amicaLife,
      viewer,
      alert,
      setChatLog,
      setUserMessage,
      setAssistantMessage,
      setShownMessage,
      setChatProcessing,
      setChatSpeaking,
    );

    // TODO remove in future
    // this change was just to make naming cleaner
    if (config("tts_backend") === 'openai') {
      updateConfig("tts_backend", "openai_tts");
    }
  }, [bot, viewer]);

  useEffect(() => {
    amicaLife.initialize(
      viewer,
      bot,
      setSubconciousLogs,
      chatSpeaking,
    );
  }, [amicaLife, bot, viewer]);

  // this exists to prevent build errors with ssr
  useEffect(() => setShowContent(true), []);
  if (!showContent) return <></>;

  if (!loaded) {
    return <LoadingProgress />;
  }

  return (
    <div className={clsx(
      m_plus_2.variable,
      montserrat.variable,
    )}>
      {config("youtube_videoid") !== '' && (
        <div className="fixed video-container w-full h-full z-0">
          <iframe
            className="w-full h-full"
            src={`https://www.youtube.com/embed/${config("youtube_videoid")}?&autoplay=1&mute=1&playsinline=1&loop=1&controls=0&disablekb=1&fs=0&playlist=${config("youtube_videoid")}`}
            frameBorder="0"></iframe>
        </div>
      )}

      <Introduction open={config("show_introduction") === 'true'} />

      <LoadingProgress />

      {webcamEnabled && <EmbeddedWebcam setWebcamEnabled={setWebcamEnabled} />}
      {showDebug && <DebugPane onClickClose={() => setShowDebug(false)} />}

      <VrmStoreProvider>
        <VrmViewer chatMode={showChatMode} />
      </VrmStoreProvider>

      <MessageInputContainer isChatProcessing={chatProcessing} />

      {/* main menu */}
      <div className="absolute z-10 m-2">
        <div className="grid grid-flow-col gap-[8px] place-content-end mt-2 bg-slate-800/40 rounded-md backdrop-blur-md shadow-sm">
          <div className='flex flex-col justify-center items-center p-1 space-y-3'>

            <div className="flex flex-row items-center space-x-2">
              {showChatLog ? (
                <ChatBubbleLeftIcon
                  className="h-7 w-7 text-white opacity-50 hover:opacity-100 active:opacity-100 hover:cursor-pointer"
                  aria-hidden="true"
                  onClick={toggleChatLog}
                />
              ) : (
                <ChatBubbleLeftRightIcon
                  className="h-7 w-7 text-white opacity-50 hover:opacity-100 active:opacity-100 hover:cursor-pointer"
                  aria-hidden="true"
                  onClick={toggleChatLog}
                />
              )}
            </div>

            <div className="flex flex-row items-center space-x-2">
              {muted ? (
                <SpeakerXMarkIcon
                  className="h-7 w-7 text-white opacity-50 hover:opacity-100 active:opacity-100 hover:cursor-pointer"
                  aria-hidden="true"
                  onClick={toggleTTSMute}
                />
              ) : (
                <SpeakerWaveIcon
                  className="h-7 w-7 text-white opacity-50 hover:opacity-100 active:opacity-100 hover:cursor-pointer"
                  aria-hidden="true"
                  onClick={toggleTTSMute}
                />
              )}
              <span className="text-white hidden">Mute / Unmute</span>
            </div>


            <div className="flex flex-row items-center space-x-2">
              {webcamEnabled ? (
                <VideoCameraIcon
                  className="h-7 w-7 text-white opacity-50 hover:opacity-100 active:opacity-100 hover:cursor-pointer"
                  aria-hidden="true"
                  onClick={() => setWebcamEnabled(false)}
                />
              ) : (
                <VideoCameraSlashIcon
                  className="h-7 w-7 text-white opacity-50 hover:opacity-100 active:opacity-100 hover:cursor-pointer"
                  aria-hidden="true"
                  onClick={() => setWebcamEnabled(true)}
                />
              )}
              <span className="text-white hidden">Webcam</span>
            </div>

            {/* 28px hack to force size */}
            <div className="flex flex-row items-center space-x-2 w-[28px] h-[28px]">
              <Menu as="div">
                <div>
                  <Menu.Button>
                    <LanguageIcon
                      className="h-7 w-7 text-white opacity-50 hover:opacity-100 active:opacity-100 hover:cursor-pointer"
                      aria-hidden="true"
                    />
                  </Menu.Button>
                </div>
                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-100"
                  enterFrom="transform opacity-0 scale-95"
                  enterTo="transform opacity-100 scale-100"
                  leave="transition ease-in duration-75"
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="transform opacity-0 scale-95"
                >
                  <Menu.Items className="absolute left-10 -mt-8 z-10 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <div className="py-0">

                      {Object.keys(langs).map((lng) => (
                        <Menu.Item key={lng}>
                          <button
                            className={clsx(
                              currLang === lng && 'bg-cyan-400 text-white',
                              'group flex w-full items-center px-2 py-2 text-sm'
                            )}
                            onClick={() => i18n.changeLanguage(lng)}>
                            {langs[lng].nativeName}
                          </button>
                        </Menu.Item>
                      ))}
                    </div>
                  </Menu.Items>
                </Transition>
              </Menu>
            </div>

            <div className="flex flex-row items-center space-x-2">
              <Link
                href="/share"
                target={isTauri() ? '' : '_blank'}
              >
                <ShareIcon
                  className="h-7 w-7 text-white opacity-50 hover:opacity-100 active:opacity-100 hover:cursor-pointer"
                  aria-hidden="true"
                />
              </Link>
              <span className="text-white hidden">Share</span>
            </div>

            <div className="flex flex-row items-center space-x-2">
              <Link href="/import">
                <CloudArrowDownIcon
                  className="h-7 w-7 text-white opacity-50 hover:opacity-100 active:opacity-100 hover:cursor-pointer"
                  aria-hidden="true"
                />
              </Link>
              <span className="text-white hidden">Import</span>
            </div>

            <div className="flex flex-row items-center space-x-2">
              {showSubconciousText ? (
                <IconBrain
                  className="h-7 w-7 text-white opacity-100 hover:opacity-50 active:opacity-100 hover:cursor-pointer"
                  aria-hidden="true"
                  stroke={2}
                  onClick={toggleSubconciousText}
                />
              ) : (
                <IconBrain
                  className="h-7 w-7 text-white opacity-50 hover:opacity-100 active:opacity-100 hover:cursor-pointer"
                  aria-hidden="true"
                  stroke={2}
                  onClick={toggleSubconciousText}
                />
              )}
            </div>

            {/*<div className="flex flex-row items-center space-x-2">
                  <CodeBracketSquareIcon
                    className="h-7 w-7 text-white opacity-50 hover:opacity-100 active:opacity-100 hover:cursor-pointer"
                    aria-hidden="true"
                    onClick={() => setShowDebug(true)}
                  />
                  <span className="text-white hidden">Debug</span> 
              </div>*/}

            <div className="flex flex-row items-center space-x-2">
              <VerticalSwitchBox
                value={showChatMode}
                label={""}
                onChange={toggleChatMode}
              />
            </div>

          </div>
        </div>
      </div>

      {showChatLog && <ChatLog messages={chatLog} />}

      {/* Normal chat text */}
      {!showSubconciousText && !showChatLog && !showChatMode && (
        <>
          {shownMessage === 'assistant' && (
            <AssistantText message={assistantMessage} />
          )}
          {shownMessage === 'user' && (
            <UserText message={userMessage} />
          )}
        </>
      )}

      {/* Chat mode text */}
      {showChatMode && <ChatModeText messages={chatLog} />}

      {/* Subconcious stored prompt text */}
      {showSubconciousText && <SubconciousText messages={subconciousLogs} />}

      <AddToHomescreen />

      <Alert />
    </div>
  );
}
