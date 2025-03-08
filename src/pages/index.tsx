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

import { config, updateConfig } from '@/utils/config';
import { isTauri } from '@/utils/isTauri';
import { langs } from '@/i18n/langs';
import { VrmStoreProvider } from "@/features/vrmStore/vrmStoreContext";
import { AmicaLifeContext } from "@/features/amicaLife/amicaLifeContext";
import { ChatModeText } from "@/components/chatModeText";

import { VerticalSwitchBox } from "@/components/switchBox"
import { TimestampedPrompt } from "@/features/amicaLife/eventHandler";

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

  const [showSettings, setShowSettings] = useState(false);
  const [showChatLog, setShowChatLog] = useState(false);
  const [showDebug, setShowDebug] = useState(false);
  const [showChatMode, setShowChatMode] = useState(false);
  const [showSubconciousText, setShowSubconciousText] = useState(false);

  // null indicates havent loaded config yet
  const [muted, setMuted] = useState<boolean|null>(null);
  const [webcamEnabled, setWebcamEnabled] = useState(false);
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);

  useEffect(() => {
    amicaLife.checkSettingOff(!showSettings);
  }, [showSettings, amicaLife]);

  useEffect(() => {
    if (muted === null) {
      setMuted(config('tts_muted') === 'true');
    }

    if (config("bg_color") !== '') {
      document.body.style.backgroundColor = config("bg_color");
    } else {
      document.body.style.backgroundImage = `url(${config("bg_url")})`;
    }

  }, []);

  function toggleTTSMute() {
    updateConfig('tts_muted', config('tts_muted') === 'true' ? 'false' : 'true')
    setMuted(config('tts_muted') === 'true')
  }

  //TEMPORARY
  function exportConfigs() {
    const configs = {
        localXTTS_url: config("localXTTS_url"),
        alltalk_version: config("alltalk_version"),
        alltalk_voice: config("alltalk_voice"),
        alltalk_language: config("alltalk_language"),
        alltalk_rvc_voice: config("alltalk_rvc_voice"),
        alltalk_rvc_pitch: config("alltalk_rvc_pitch"),
        autosend_from_mic: config("autosend_from_mic"),
        wake_word_enabled: config("wake_word_enabled"),
        wake_word: config("wake_word"),
        time_before_idle_sec: config("time_before_idle_sec"),
        debug_gfx: config("debug_gfx"),
        language: config("language"),
        show_introduction: config("show_introduction"),
        show_add_to_homescreen: config("show_add_to_homescreen"),
        bg_color: config("bg_color"),
        bg_url: config("bg_url"),
        vrm_url: config("vrm_url"),
        vrm_hash: config("vrm_hash"),
        vrm_save_type: config("vrm_save_type"),
        youtube_videoid: config("youtube_videoid"),
        animation_url: config("animation_url"),
        voice_url: config("voice_url"),
        chatbot_backend: config("chatbot_backend"),
        openai_apikey: config("openai_apikey"),
        openai_url: config("openai_url"),
        openai_model: config("openai_model"),
        llamacpp_url: config("llamacpp_url"),
        llamacpp_stop_sequence: config("llamacpp_stop_sequence"),
        ollama_url: config("ollama_url"),
        ollama_model: config("ollama_model"),
        koboldai_url: config("koboldai_url"),
        koboldai_use_extra: config("koboldai_use_extra"),
        koboldai_stop_sequence: config("koboldai_stop_sequence"),
        openrouter_apikey: config("openrouter_apikey"),
        openrouter_url: config("openrouter_url"),
        openrouter_model: config("openrouter_model"),
        tts_muted: config("tts_muted"),
        tts_backend: config("tts_backend"),
        stt_backend: config("stt_backend"),
        vision_backend: config("vision_backend"),
        vision_system_prompt: config("vision_system_prompt"),
        vision_openai_apikey: config("vision_openai_apikey"),
        vision_openai_url: config("vision_openai_url"),
        vision_openai_model: config("vision_openai_model"),
        vision_llamacpp_url: config("vision_llamacpp_url"),
        vision_ollama_url: config("vision_ollama_url"),
        vision_ollama_model: config("vision_ollama_model"),
        whispercpp_url: config("whispercpp_url"),
        openai_whisper_apikey: config("openai_whisper_apikey"),
        openai_whisper_url: config("openai_whisper_url"),
        openai_whisper_model: config("openai_whisper_model"),
        openai_tts_apikey: config("openai_tts_apikey"),
        openai_tts_url: config("openai_tts_url"),
        openai_tts_model: config("openai_tts_model"),
        openai_tts_voice: config("openai_tts_voice"),
        rvc_url: config("rvc_url"),
        rvc_enabled: config("rvc_enabled"),
        rvc_model_name: config("rvc_model_name"),
        rvc_f0_upkey: config("rvc_f0_upkey"),
        rvc_f0_method: config("rvc_f0_method"),
        rvc_index_path: config("rvc_index_path"),
        rvc_index_rate: config("rvc_index_rate"),
        rvc_filter_radius: config("rvc_filter_radius"),
        rvc_resample_sr: config("rvc_resample_sr"),
        rvc_rms_mix_rate: config("rvc_rms_mix_rate"),
        rvc_protect: config("rvc_protect"),
        coquiLocal_url: config("coquiLocal_url"),
        coquiLocal_voiceid: config("coquiLocal_voiceid"),
        piper_url: config("piper_url"),
        elevenlabs_apikey: config("elevenlabs_apikey"),
        elevenlabs_voiceid: config("elevenlabs_voiceid"),
        elevenlabs_model: config("elevenlabs_model"),
        speecht5_speaker_embedding_url: config("speecht5_speaker_embedding_url"),
        coqui_apikey: config("coqui_apikey"),
        coqui_voice_id: config("coqui_voice_id"),
        amica_life_enabled: config("amica_life_enabled"),
        min_time_interval_sec: config("min_time_interval_sec"),
        max_time_interval_sec: config("max_time_interval_sec"),
        time_to_sleep_sec: config("time_to_sleep_sec"),
        idle_text_prompt: config("idle_text_prompt"),
        name: config("name"),
        system_prompt: config("system_prompt"),
    };

    const jsonBlob = new Blob([JSON.stringify(configs, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(jsonBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "configs.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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

  return (
    <div className={clsx(
      m_plus_2.variable,
      montserrat.variable,
    )}>
      { config("youtube_videoid") !== '' && (
        <div className="fixed video-container w-full h-full z-0">
          <iframe
            className="w-full h-full"
            src={`https://www.youtube.com/embed/${config("youtube_videoid")}?&autoplay=1&mute=1&playsinline=1&loop=1&controls=0&disablekb=1&fs=0&playlist=${config("youtube_videoid")}`}
            frameBorder="0"></iframe>
        </div>
      )}

      <Introduction open={config("show_introduction") === 'true'} />

      <LoadingProgress />

      { webcamEnabled && <EmbeddedWebcam setWebcamEnabled={setWebcamEnabled} /> }
      { showDebug && <DebugPane onClickClose={() => setShowDebug(false) }/> }

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
            <div className="flex flex-row items-center space-x-2">
              <WrenchScrewdriverIcon
                className="h-7 w-7 text-white opacity-50 hover:opacity-100 active:opacity-100 hover:cursor-pointer"
                aria-hidden="true"
                onClick={() => setShowSettings(true)}
              />
            </div>

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
              { muted ? (
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
              { webcamEnabled ? (
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
              { showSubconciousText ? (
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

            {/* TEMPORARY */}
            <div className="flex flex-row items-center space-x-2">
              <CodeBracketSquareIcon
                className="h-7 w-7 text-white opacity-50 hover:opacity-100 active:opacity-100 hover:cursor-pointer"
                aria-hidden="true"
                onClick={exportConfigs}
              />
              <span className="text-white hidden">Export Configs</span> 
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

      {/* Chat mode text */}
      {showChatMode && <ChatModeText messages={chatLog}/>}

      {/* Subconcious stored prompt text */}
      {showSubconciousText && <SubconciousText messages={subconciousLogs}/>}

      <AddToHomescreen />

      <Alert />
    </div>
  );
}
