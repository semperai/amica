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
  CubeIcon,
  CubeTransparentIcon,
  LanguageIcon,
  ShareIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
  Squares2X2Icon,
  SquaresPlusIcon,
  VideoCameraIcon,
  VideoCameraSlashIcon,
  WrenchScrewdriverIcon,
  SignalIcon,
  AcademicCapIcon,
} from "@heroicons/react/24/outline";
import { IconBrain } from '@tabler/icons-react';

import { MenuButton } from "@/components/menuButton";
import { AssistantText } from "@/components/assistantText";
import { SubconciousText } from "@/components/subconciousText";
import { AddToHomescreen } from "@/components/addToHomescreen";
import { Alert } from "@/components/alert";
import { UserText } from "@/components/userText";
import { ChatLog } from "@/components/chatLog";
import VrmViewer from "@/components/vrmViewer";
import { MessageInputContainer } from "@/components/messageInputContainer";
import { Introduction } from "@/components/introduction";
import { ArbiusIntroduction } from "@/components/arbiusIntroduction";
import { LoadingProgress } from "@/components/loadingProgress";
import { DebugPane } from "@/components/debugPane";
import { Settings } from "@/components/settings";
import { EmbeddedWebcam } from "@/components/embeddedWebcam";
import { Moshi } from "@/features/moshi/components/Moshi";

import { ViewerContext } from "@/features/vrmViewer/viewerContext";
import { Message, Role } from "@/features/chat/messages";
import { ChatContext } from "@/features/chat/chatContext";
import { AlertContext } from "@/features/alert/alertContext";

import { config, updateConfig } from '@/utils/config';
import { isTauri } from '@/utils/isTauri';
import { langs } from '@/i18n/langs';
import { VrmStoreProvider } from "@/features/vrmStore/vrmStoreContext";
import { AmicaLifeContext } from "@/features/amicaLife/amicaLifeContext";
import { ChatModeText } from "@/components/chatModeText";

import { TimestampedPrompt } from "@/features/amicaLife/eventHandler";
import { handleChatLogs } from "@/features/externalAPI/externalAPI";
import { VerticalSwitchBox } from "@/components/switchBox";
import { ThoughtText } from "@/components/thoughtText";

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

function detectVRHeadset() {
  const userAgent = navigator.userAgent.toLowerCase();

  // Meta Quest detection
  // Quest 2 and 3 both use "oculus" in their user agent
  const isQuest = userAgent.includes('oculus') ||
                  userAgent.includes('quest 2') ||
                  userAgent.includes('quest 3');

  // Vision Pro detection
  // visionOS is the specific identifier for Apple Vision Pro
  const isVisionPro = userAgent.includes('visionos') ||
                      userAgent.includes('xros');

  // Detailed device information
  let deviceInfo = {
    isVRDevice: isQuest || isVisionPro,
    deviceType: '',
    browserInfo: userAgent
  };

  if (isQuest) {
    deviceInfo.deviceType = 'quest-3';
    if (userAgent.includes('quest 3')) {
      deviceInfo.deviceType = 'quest-3';
    } else if (userAgent.includes('quest 2')) {
      deviceInfo.deviceType = 'quest-2';
    }
  } else if (isVisionPro) {
    deviceInfo.deviceType = 'vision-pro';
  }

  return deviceInfo;
}


export default function Home() {
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
  const [thoughtMessage, setThoughtMessage] = useState("");
  const [shownMessage, setShownMessage] = useState<Role>("system");
  const [subconciousLogs, setSubconciousLogs] = useState<TimestampedPrompt[]>([]);

  // showContent exists to allow ssr
  // otherwise issues from usage of localStorage and window will occur
  const [showContent, setShowContent] = useState(false);

  const [showArbiusIntroduction, setShowArbiusIntroduction] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showChatLog, setShowChatLog] = useState(false);
  const [showDebug, setShowDebug] = useState(false);
  const [showChatMode, setShowChatMode] = useState(false);
  const [showSubconciousText, setShowSubconciousText] = useState(false);
  const [showMoshi, setShowMoshi] = useState(false);

  // null indicates havent loaded config yet
  const [muted, setMuted] = useState<boolean|null>(null);
  const [webcamEnabled, setWebcamEnabled] = useState(false);
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);

  const [showStreamWindow, setShowStreamWindow] = useState(false);
  const videoRef = useRef(null);

  const [isARSupported, setIsARSupported] = useState(false);
  const [isVRSupported, setIsVRSupported] = useState(false);

  const [isVRHeadset, setIsVRHeadset] = useState(false);


  useEffect(() => {
    amicaLife.checkSettingOff(!showSettings);
  }, [showSettings, amicaLife]);

  useEffect(() => {
    if (muted === null) {
      setMuted(config('tts_muted') === 'true');
    }

    setShowArbiusIntroduction(config("show_arbius_introduction") === 'true');

    if (config("bg_color") !== '') {
      document.body.style.backgroundColor = config("bg_color");
    } else {
      document.body.style.backgroundImage = `url(${config("bg_url")})`;
    }
    // Temp Disable : WebXR
    // if (window.navigator.xr && window.navigator.xr.isSessionSupported) {
    //   let deviceInfo = detectVRHeadset();
    //   setIsVRHeadset(deviceInfo.isVRDevice);

    //   window.navigator.xr.isSessionSupported('immersive-ar').then((supported) => {
    //     console.log('ar supported', supported);
    //     setIsARSupported(supported);
    //   });
    //   window.navigator.xr.isSessionSupported('immersive-vr').then((supported) => {
    //     console.log('vr supported', supported);
    //     setIsVRSupported(supported);
    //   });
    // }
  }, []);

  useEffect(() => {
    if (viewer && videoRef.current && showStreamWindow) {
      viewer.startStreaming(videoRef.current);
    } else {
      viewer.stopStreaming();
    }
  }, [viewer, videoRef, showStreamWindow]);

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
  
  const toggleShowSubconciousText = () => {
    if (subconciousLogs.length !== 0) {
      toggleState(setShowSubconciousText, [setShowChatLog, setShowChatMode]);
    }
  };
  
  const toggleChatMode = () => {
    toggleState(setShowChatMode, [setShowChatLog, setShowSubconciousText]);
  };

  const toggleXR = async (immersiveType: XRSessionMode) => {
    console.log('Toggle XR', immersiveType);

    if (! window.navigator.xr) {
      console.error("WebXR not supported");
      return;
    }
    if (! await window.navigator.xr.isSessionSupported(immersiveType)) {
      console.error("Session not supported");
      return;
    }

    if (! viewer.isReady) {
      console.error("Viewer not ready");
      return;
    }

    // TODO should hand tracking be required?
    let optionalFeatures: string[] = [
      'hand-tracking',
      'local-floor',
    ];
    if (immersiveType === 'immersive-ar') {
      optionalFeatures.push('dom-overlay');
    }

    const sessionInit = {
      optionalFeatures,
      domOverlay: { root: document.body },
    };

    if (viewer.currentSession) {
      viewer.onSessionEnded();

      try {
        await viewer.currentSession.end();
      } catch (err) {
        // some times session already ended not due to user interaction
        console.warn(err);
      }

      // @ts-ignore
      if (window.navigator.xr.offerSession !== undefined) {
        // @ts-ignore
        const session = await navigator.xr?.offerSession(immersiveType, sessionInit);
        viewer.onSessionStarted(session, immersiveType);
      }
      return;
    }

    // @ts-ignore
    if (window.navigator.xr.offerSession !== undefined ) {
      // @ts-ignore
      const session = await navigator.xr?.offerSession(immersiveType, sessionInit);
      viewer.onSessionStarted(session, immersiveType);
      return;
    }

    try {
      const session = await window.navigator.xr.requestSession(immersiveType, sessionInit);

      viewer.onSessionStarted(session, immersiveType);
    } catch (err) {
      console.error(err);
    }

  }


  useEffect(() => {
    bot.initialize(
      amicaLife,
      viewer,
      alert,
      setChatLog,
      setUserMessage,
      setAssistantMessage,
      setThoughtMessage,
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

  useEffect(() => {
    handleChatLogs(chatLog);
  }, [chatLog]);

  // this exists to prevent build errors with ssr
  useEffect(() => setShowContent(true), []);
  if (!showContent) return <></>;

  return (
    <div className={clsx(
      m_plus_2.variable,
      montserrat.variable,
    )}>
      {showStreamWindow && 

      <div className="fixed top-1/3 right-4 w-[200px] h-[150px] z-0">
        <video
          ref={videoRef} 
          autoPlay
          muted
          playsInline
          className="w-full h-full object-cover rounded-lg shadow-lg outline outline-2 outline-red-500"
        />
      </div> }

      { config("youtube_videoid") !== '' && (
        <div className="fixed video-container w-full h-full z-0">
          <iframe
            className="w-full h-full"
            src={`https://www.youtube.com/embed/${config("youtube_videoid")}?&autoplay=1&mute=1&playsinline=1&loop=1&controls=0&disablekb=1&fs=0&playlist=${config("youtube_videoid")}`}
            frameBorder="0"></iframe>
        </div>
      )}

      <Introduction open={config("show_introduction") === 'true'} />
      <ArbiusIntroduction open={showArbiusIntroduction} close={() => setShowArbiusIntroduction(false)} />

      <LoadingProgress />

      { webcamEnabled && <EmbeddedWebcam setWebcamEnabled={setWebcamEnabled} /> }
      { showDebug && <DebugPane onClickClose={() => setShowDebug(false) }/> }
      { config("chatbot_backend") === "moshi" && <Moshi setAssistantText={setAssistantMessage}/>  }

      <VrmStoreProvider>
        <VrmViewer chatMode={showChatMode}/>
        {showSettings && (
          <Settings
            onClickClose={() => setShowSettings(false)}
          />
        )}
      </VrmStoreProvider>
      
      <MessageInputContainer isChatProcessing={chatProcessing} />

      {/* main menu */}
      <div className="absolute z-10 m-2">
        <div className="grid grid-flow-col gap-[8px] place-content-end mt-2 bg-slate-800/40 rounded-md backdrop-blur-md shadow-sm">
          <div className='flex flex-col justify-center items-center p-1 space-y-3'>
            <MenuButton
              large={isVRHeadset}
              icon={WrenchScrewdriverIcon}
              onClick={() => setShowSettings(true)}
              label="show settings"
            />

            {showChatLog ? (
              <MenuButton
                large={isVRHeadset}
                icon={ChatBubbleLeftIcon}
                onClick={toggleChatLog}
                label="hide chat log"
              />
            ) : (
              <MenuButton
                large={isVRHeadset}
                icon={ChatBubbleLeftRightIcon}
                onClick={toggleChatLog}
                label="show chat log"
              />
            )}

            { muted ? (
              <MenuButton
                large={isVRHeadset}
                icon={SpeakerXMarkIcon}
                onClick={toggleTTSMute}
                label="unmute"
              />
            ) : (
              <MenuButton
                large={isVRHeadset}
                icon={SpeakerWaveIcon}
                onClick={toggleTTSMute}
                label="mute"
              />
            )}

            { webcamEnabled ? (
              <MenuButton
                large={isVRHeadset}
                icon={VideoCameraIcon}
                onClick={() => setWebcamEnabled(false)}
                label="disable webcam"
              />
            ) : (
              <MenuButton
                large={isVRHeadset}
                icon={VideoCameraSlashIcon}
                onClick={() => setWebcamEnabled(true)}
                label="enable webcam"
              />
            )}

            <MenuButton
              large={isVRHeadset}
              icon={ShareIcon}
              href="/share"
              target={isTauri() ? '' : '_blank'}
              label="share"
            />
            <MenuButton
              large={isVRHeadset}
              icon={CloudArrowDownIcon}
              href="/import"
              label="import"
            />

            { showSubconciousText ? (
              <MenuButton
                large={isVRHeadset}
                icon={IconBrain}
                onClick={toggleShowSubconciousText}
                label="hide subconscious"
              />
            ) : (
              <MenuButton
                large={isVRHeadset}
                icon={IconBrain}
                onClick={toggleShowSubconciousText}
                label="show subconscious"
              />
            )}

            {/* Temp Disable : WebXR */}
            {/*<MenuButton
              large={isVRHeadset}
              icon={CubeTransparentIcon}
              disabled={!isARSupported}
              onClick={() => toggleXR('immersive-ar')}
              label="Augmented Reality"
            />

            <MenuButton
              large={isVRHeadset}
              icon={CubeIcon}
              disabled={!isVRSupported}
              onClick={() => toggleXR('immersive-vr')}
              label="Virtual Reality"
            />*/}

            <MenuButton
              large={isVRHeadset}
              icon={CodeBracketSquareIcon}
              onClick={() => setShowDebug(true)}
              label="debug"
            />

            {/* Temp Disable : WebXR */}
            {/* { showChatMode ? (
              <MenuButton
                large={isVRHeadset}
                icon={Squares2X2Icon}
                disabled={viewer.currentSession !== null}
                onClick={toggleChatMode}
                label="hide chat mode"
              />
            ) : (
              <MenuButton
                large={isVRHeadset}
                icon={SquaresPlusIcon}
                disabled={viewer.currentSession !== null}
                onClick={toggleChatMode}
                label="show chat mode"
              />
            )} */}

            <div className="flex flex-row items-center space-x-2">
                <VerticalSwitchBox
                  value={showChatMode}
                  label={""}
                  onChange={toggleChatMode}
                />
            </div>

            <div className="flex flex-row items-center space-x-2">
              { showStreamWindow ? (
                <SignalIcon
                  className="h-7 w-7 text-white opacity-100 hover:opacity-50 active:opacity-100 hover:cursor-pointer"
                  aria-hidden="true"
                  onClick={() => setShowStreamWindow(false)}
                />
              ) : (
                <SignalIcon
                  className="h-7 w-7 text-white opacity-50 hover:opacity-100 active:opacity-100 hover:cursor-pointer"
                  aria-hidden="true"
                  onClick={() => setShowStreamWindow(true)}
                />
              )}
            </div>
            
          </div>
        </div>    
      </div>

      {showChatLog && <ChatLog messages={chatLog} />}

      {/* Normal chat text */}
      {!showSubconciousText && ! showChatLog && ! showChatMode && (
        <>
          { shownMessage === 'assistant' && (
            <AssistantText message={assistantMessage} />
          )}
          { shownMessage === 'user' && (
            <UserText message={userMessage} />
          )}
        </>
      )}

      {/* Thought text */}
      {thoughtMessage !== "" && <ThoughtText message={thoughtMessage}/>}

      {/* Chat mode text */}
      {showChatMode && <ChatModeText messages={chatLog}/>}

      {/* Subconcious stored prompt text */}
      {showSubconciousText && <SubconciousText messages={subconciousLogs}/>}

      <AddToHomescreen />

      <Alert />
    </div>
  );
}