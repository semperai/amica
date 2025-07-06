import {
  Fragment,
  useContext,
  useEffect,
  useRef,
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
  MagnifyingGlassMinusIcon,
  MagnifyingGlassPlusIcon,
  ClipboardDocumentCheckIcon,
  ClipboardIcon,
  CheckCircleIcon,
  XMarkIcon,
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
import { Contract, JsonRpcProvider } from 'ethers';
import { abi } from "@/utils/abi";
import { decodeAgentId, encodeAgentId } from "@/utils/fileUtils";
import { DiagnosisScript } from "@/components/diagnosisScript";
import { deleteAllSessionData, handleChatLogs, handleConfig } from "@/features/externalAPI/externalAPI";
import { randomBytes } from "crypto";
import { useFullUnmountHandler } from "@/hooks/useUnmountHandler";

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
const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS as `0x${string}`;

export default function Agent() {
  const { t, i18n } = useTranslation();
  const currLang = i18n.resolvedLanguage;

  const [sessionId, setSessionId] = useState("");
  const [jwtCopied, setJwtCopied] = useState(false);
  const [sessionIdCopied, setSessionIdCopied] = useState(false);

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

  const [showNotification, setShowNotification] = useState(false);
  const [showChatLog, setShowChatLog] = useState(false);
  const [showDebug, setShowDebug] = useState(false);
  const [showChatMode, setShowChatMode] = useState(false);
  const [showBrain, setShowBrain] = useState(false);
  const [brainLink, setBrainLink] = useState("");
  const [showDiagnosis, setShowDiagnosis] = useState(false);

  // null indicates havent loaded config yet
  const [muted, setMuted] = useState<boolean | null>(null);
  const [webcamEnabled, setWebcamEnabled] = useState(false);

  const router = useRouter()
  const [error, setError] = useState(false);
  const hasProcessedRef = useRef(false);
  const [loaded, setLoaded] = useState(false);

  const provider = new JsonRpcProvider(process.env.NEXT_PUBLIC_INFURA_RPC);

  // Move the contract read outside of the function
  const tokenId: number = typeof router.query.id === 'string'
    ? decodeAgentId(router.query.id)
    : NaN;

  // Define the keys to filter
  const filterKeys = [
    "tts_muted", "autosend_from_mic", "wake_word_enabled", "wake_word",
    "time_before_idle_sec", "debug_gfx", "language", "show_introduction",
    "show_add_to_homescreen", "voice_url",
    "description", "image"
  ];

  // Filter and get the relevant defaults
  const keysList = [
    ...Object.keys(defaults).filter(key => !filterKeys.includes(key)),
    "brain",
  ];

  const [agentData, setAgentData] = useState<string[] | null>(null);

  const generateSessionId = (sessionId?: string): string =>
    sessionId || randomBytes(8).toString("hex");

  useEffect(() => {
    async function fetchNFTMetadata() {
      if (isNaN(tokenId)) {
        setError(true);
        return;
      }

      console.log("Featch agent data using Infura RPC")

      try {
        const contract = new Contract(CONTRACT_ADDRESS, abi, provider);
        const data = await contract.getMetadata(tokenId, keysList);
        setAgentData(data);
      } catch (err) {
        console.error("Error reading from contract:", err);
        setError(true);
      }
    }

    if (!agentData && !loaded) {
      fetchNFTMetadata();
    }
  }, [tokenId, agentData, loaded]);

  useEffect(() => {
    async function processCharacterData() {
      if (!agentData || loaded || hasProcessedRef.current) return;

      hasProcessedRef.current = true; // lock future calls
      console.log("Process agent data")


      // Check if all values in agentData are empty strings
      if (Array.isArray(agentData) && agentData.every(val => val === "")) {
        setError(true);
        console.error("No data found for this agent. Please check the token ID or ensure the agent has been configured.");
        return;
      }

      try {
        // Map the fetched data to config
        const configs: Record<string, string> = keysList.reduce((acc: Record<string, string>, key, index) => {
          acc[key] = (agentData as any)[index];
          return acc;
        }, {});

        // Handle error state
        if (!configs) {
          setError(true);
          return;
        }

        // Update document style based on config
        if (configs.bg_color) {
          document.body.style.backgroundColor = configs.bg_color;
        } else if (configs.bg_url) {
          document.body.style.backgroundImage = `url(${configs.bg_url})`;
        }
        if (configs.brain) {
          setShowBrain(true);
          setBrainLink(configs.brain);
        }

        // Sync agent configuration
        if (configs.external_api_enabled === 'true') {
          const sessionId = await handleConfig(true, configs);
          configs.session_id = sessionId;
          setSessionId(sessionId!);
          // bot.initRealtime();
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

  }, [agentData, loaded]);

  useFullUnmountHandler(() => {
    deleteAllSessionData(sessionId);
    console.log("Page/component fully unmounted or about to unload");
  });

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
    toggleState(setShowChatLog, [setShowChatMode, setShowDiagnosis]);
  };

  const toggleDiagnosis = () => {
    toggleState(setShowDiagnosis, [setShowChatLog, setShowChatMode]);
  };

  function handleCopySessionId() {
    navigator.clipboard.writeText(sessionId).then(() => {
      setSessionIdCopied(true);
      setShowNotification(true);
      setTimeout(() => { setSessionIdCopied(false); setShowNotification(false); }, 4000);
    });
  }

  const { viewer } = useContext(ViewerContext);
  const { alert } = useContext(AlertContext);
  const { chat: bot } = useContext(ChatContext);
  const { amicaLife } = useContext(AmicaLifeContext);
  useEffect(() => {
    if (!loaded) return ;
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
      setSubconciousLogs,
    );

    // TODO remove in future
    // this change was just to make naming cleaner
    if (config("tts_backend") === 'openai') {
      updateConfig("tts_backend", "openai_tts");
    }
  }, [loaded]);

  useEffect(() => {
    if (!loaded) return ;
    amicaLife.initialize(
      viewer,
      bot,
      setSubconciousLogs,
      chatSpeaking,
    );
  }, [loaded]);

  useEffect(() => {
    handleChatLogs(chatLog);
  }, [chatLog]);

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

      {/* Notification Alert */}
      <div
        aria-live="assertive"
        className="pointer-events-none fixed inset-0 flex items-end px-4 py-6 sm:items-start sm:p-6 mt-2"
      >
        <div className="flex w-full flex-col items-center space-y-4 sm:items-end">

          <Transition
            show={showNotification}
            as={Fragment}
            enter="transform ease-out duration-300 transition"
            enterFrom="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
            enterTo="translate-y-0 opacity-100 sm:translate-x-0"
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="pointer-events-auto w-full max-w-sm overflow-hidden rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5">
              <div className="p-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <CheckCircleIcon className="h-6 w-6 text-green-400" aria-hidden="true" />
                  </div>
                  <div className="ml-3 w-0 flex-1 pt-0.5">
                    <p className="text-sm font-medium text-gray-900">{`${jwtCopied ? 'JWT' : 'Session ID'} Copied!`}</p>
                    <p className="mt-1 text-sm text-gray-500">{`Your ${jwtCopied ? 'JWT' : 'Session ID'} was copied successfully.`}</p>
                  </div>
                  <div className="ml-4 flex flex-shrink-0">
                    <button
                      type="button"
                      className="inline-flex rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                      onClick={() => {
                        setShowNotification(false)
                      }}
                    >
                      <span className="sr-only">Close</span>
                      <XMarkIcon className="h-5 w-5" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </Transition>
        </div>
      </div>

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

            {/* Integrations Brain */}
            {showBrain && (
              <div className="flex flex-row items-center space-x-2">
                <IconBrain
                  className="h-7 w-7 text-white opacity-50 hover:opacity-100 active:opacity-100 hover:cursor-pointer"
                  aria-hidden="true"
                  stroke={2}
                  onClick={() => window.open(brainLink, "_blank")}
                />
              </div>
            )}

            {/* Diagnosis Script */}
            <div className="flex flex-row items-center space-x-2">
              {!showDiagnosis ? (
                <MagnifyingGlassPlusIcon
                  className="h-7 w-7 text-white opacity-50 hover:opacity-100 active:opacity-100 hover:cursor-pointer"
                  aria-hidden="true"
                  onClick={toggleDiagnosis}
                />
              ) : (
                <MagnifyingGlassMinusIcon
                  className="h-7 w-7 text-white opacity-50 hover:opacity-100 active:opacity-100 hover:cursor-pointer"
                  aria-hidden="true"
                  onClick={toggleDiagnosis}
                />
              )}
              <span className="text-white hidden">Diagnosis Script</span>
            </div>

            {/* JWT Copied */}
            {config("external_api_enabled") === 'true' && sessionId && (
              <Menu as="div" className="relative inline-block text-left">
                <div>
                  <Menu.Button className="flex items-center justify-center w-full">
                    {jwtCopied || sessionIdCopied ? (
                      <ClipboardDocumentCheckIcon
                        className="h-7 w-7 text-green-400 opacity-100"
                        aria-hidden="true"
                      />
                    ) : (
                      <ClipboardIcon
                        className="h-7 w-7 text-white opacity-50 hover:opacity-100 active:opacity-100 hover:cursor-pointer"
                        aria-hidden="true"
                      />
                    )}
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
                  <Menu.Items className="absolute left-0 mt-2 w-48 origin-top-left rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                    <div className="py-1">
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            onClick={handleCopySessionId}
                            className={clsx(
                              active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                              'block w-full text-left px-4 py-2 text-sm'
                            )}
                          >
                            Copy Session ID
                          </button>
                        )}
                      </Menu.Item>
                    </div>
                  </Menu.Items>
                </Transition>
              </Menu>
            )}


          </div>
        </div>
      </div>

      {showChatLog && <ChatLog messages={chatLog} />}

      {showDiagnosis && <DiagnosisScript />}

      {/* Normal chat text */}
      {!showChatLog && !showChatMode && (
        <>
          {shownMessage === 'assistant' && (
            <AssistantText message={assistantMessage} />
          )}
          {shownMessage === 'user' && (
            <UserText message={userMessage} />
          )}
        </>
      )}

      <AddToHomescreen />

      <Alert />

    </div>
  );
}
