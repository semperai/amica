import React, {
  Fragment,
  useCallback,
  useContext,
  useEffect,
  useState,
  useRef,
} from "react";
import { Transition } from '@headlessui/react'
import {
  ChevronRightIcon,
  ArrowUturnLeftIcon,
  HomeIcon,
  XMarkIcon,
} from '@heroicons/react/20/solid';

import { CheckCircleIcon } from '@heroicons/react/24/outline';

import { useKeyboardShortcut } from "@/hooks/useKeyboardShortcut";
import { IconButton } from "@/components/iconButton";
import { TextButton } from "@/components/textButton";
import { ViewerContext } from "@/features/vrmViewer/viewerContext";
import { config, updateConfig } from "@/utils/config";


import { Link } from "./settings/common";

import { MenuPage } from './settings/MenuPage';
import { ResetSettingsPage } from './settings/ResetSettingsPage';
import { CommunityPage } from './settings/CommunityPage';

import { BackgroundImgPage } from './settings/BackgroundImgPage';
import { BackgroundColorPage } from './settings/BackgroundColorPage';
import { BackgroundVideoPage } from './settings/BackgroundVideoPage';
import { CharacterModelPage } from './settings/CharacterModelPage';
import { CharacterAnimationPage } from './settings/CharacterAnimationPage';

import { ChatbotBackendPage } from './settings/ChatbotBackendPage';
import { ChatGPTSettingsPage } from './settings/ChatGPTSettingsPage';
import { LlamaCppSettingsPage } from './settings/LlamaCppSettingsPage';
import { OllamaSettingsPage } from './settings/OllamaSettingsPage';
import { KoboldAiSettingsPage } from './settings/KoboldAiSettingsPage';

import { TTSBackendPage } from './settings/TTSBackendPage';
import { ElevenLabsSettingsPage } from './settings/ElevenLabsSettingsPage';
import { SpeechT5SettingsPage } from './settings/SpeechT5SettingsPage';
import { CoquiSettingsPage } from './settings/CoquiSettingsPage';
import { OpenAITTSSettingsPage } from './settings/OpenAITTSSettingsPage';

import { STTBackendPage } from './settings/STTBackendPage';
import { WhisperOpenAISettingsPage } from './settings/WhisperOpenAISettingsPage';
import { WhisperCppSettingsPage } from './settings/WhisperCppSettingsPage';

import { VisionBackendPage } from './settings/VisionBackendPage';
import { VisionLlamaCppSettingsPage } from './settings/VisionLlamaCppSettingsPage';
import { VisionOllamaSettingsPage } from './settings/VisionOllamaSettingsPage';
import { VisionSystemPromptPage } from './settings/VisionSystemPromptPage';

import { NamePage } from './settings/NamePage';
import { SystemPromptPage } from './settings/SystemPromptPage';

export const Settings = ({
  onClickClose,
}: {
  onClickClose: () => void;
}) => {
  const { viewer } = useContext(ViewerContext);
  useKeyboardShortcut("Escape", onClickClose);

  const [page, setPage] = useState('main_menu');
  const [breadcrumbs, setBreadcrumbs] = useState<Link[]>([]);
  const [showNotification, setShowNotification] = useState(false);
  const [settingsUpdated, setSettingsUpdated] = useState(false);

  const [chatbotBackend, setChatbotBackend] = useState(config("chatbot_backend"));
  const [openAIApiKey, setOpenAIApiKey] = useState(config("openai_apikey"));
  const [openAIUrl, setOpenAIUrl] = useState(config("openai_url"));
  const [openAIModel, setOpenAIModel] = useState(config("openai_model"));
  const [llamaCppUrl, setLlamaCppUrl] = useState(config("llamacpp_url"));
  const [ollamaUrl, setOllamaUrl] = useState(config("ollama_url"));
  const [ollamaModel, setOllamaModel] = useState(config("ollama_model"));
  const [koboldAiUrl, setKoboldAiUrl] = useState(config("koboldai_url"));
  const [koboldAiUseExtra, setKoboldAiUseExtra] = useState<boolean>(config("koboldai_use_extra") === 'true' ? true : false);

  const [ttsBackend, setTTSBackend] = useState(config("tts_backend"));
  const [elevenlabsApiKey, setElevenlabsApiKey] = useState(config("elevenlabs_apikey"));
  const [elevenlabsVoiceId, setElevenlabsVoiceId] = useState(config("elevenlabs_voiceid"));

  const [speechT5SpeakerEmbeddingsUrl, setSpeechT5SpeakerEmbeddingsUrl] = useState(config("speecht5_speaker_embedding_url"));

  const [coquiApiKey, setCoquiApiKey] = useState(config("coqui_apikey"));
  const [coquiVoiceId, setCoquiVoiceId] = useState(config("coqui_voice_id"));

  const [openAITTSApiKey, setOpenAITTSApiKey] = useState(config("openai_tts_apikey"));
  const [openAITTSUrl, setOpenAITTSUrl] = useState(config("openai_tts_url"));
  const [openAITTSModel, setOpenAITTSModel] = useState(config("openai_tts_model"));
  const [openAITTSVoice, setOpenAITTSVoice] = useState(config("openai_tts_voice"));

  const [visionBackend, setVisionBackend] = useState(config("vision_backend"));
  const [visionLlamaCppUrl, setVisionLlamaCppUrl] = useState(config("vision_llamacpp_url"));
  const [visionOllamaUrl, setVisionOllamaUrl] = useState(config("vision_ollama_url"));
  const [visionOllamaModel, setVisionOllamaModel] = useState(config("vision_ollama_model"));
  const [visionSystemPrompt, setVisionSystemPrompt] = useState(config("vision_system_prompt"));

  const [bgUrl, setBgUrl] = useState(config("bg_url"));
  const [bgColor, setBgColor] = useState(config("bg_color"));
  const [vrmUrl, setVrmUrl] = useState(config("vrm_url"));
  const [youtubeVideoID, setYoutubeVideoID] = useState(config("youtube_videoid"));
  const [animationUrl, setAnimationUrl] = useState(config("animation_url"));

  const [sttBackend, setSTTBackend] = useState(config("stt_backend"));
  const [whisperOpenAIUrl, setWhisperOpenAIUrl] = useState(config("openai_whisper_url"));
  const [whisperOpenAIApiKey, setWhisperOpenAIApiKey] = useState(config("openai_whisper_apikey"));
  const [whisperOpenAIModel, setWhisperOpenAIModel] = useState(config("openai_whisper_model"));
  const [whisperCppUrl, setWhisperCppUrl] = useState(config("whispercpp_url"));

  const [name, setName] = useState(config("name"));
  const [systemPrompt, setSystemPrompt] = useState(config("system_prompt"));


  const vrmFileInputRef = useRef<HTMLInputElement>(null);
  const handleClickOpenVrmFile = useCallback(() => {
    vrmFileInputRef.current?.click();
  }, []);

  const bgImgFileInputRef = useRef<HTMLInputElement>(null);
  const handleClickOpenBgImgFile = useCallback(() => {
    bgImgFileInputRef.current?.click();
  }, []);

  const handleChangeVrmFile = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files;
      if (!files) return;

      const file = files[0];
      if (!file) return;

      const file_type = file.name.split(".").pop();

      if (file_type === "vrm") {
        const blob = new Blob([file], { type: "application/octet-stream" });
        const url = window.URL.createObjectURL(blob);
        viewer.loadVrm(url);
      }

      event.target.value = "";
    },
    [viewer]
  );

  function handleChangeBgImgFile(event: React.ChangeEvent<HTMLInputElement>) {
    const files = event.target.files;
    if (!files) return;

    const file = files[0];
    if (!file) return;

    const file_type = file.name.split(".").pop();

    if (! file.type.match('image.*')) return;

    let reader = new FileReader();
    reader.onload = (function (_) {
      return function (e) {
        const url = e.target?.result;
        if (! url) return;

        document.body.style.backgroundImage = `url(${url})`;

        if ((url as string).length < 2_000_000) {
          updateConfig("youtube_videoid", "");
          updateConfig("bg_url", url as string);
          setShowNotification(true);
        } else {
          // TODO notify with warning how this cant be saved to localstorage
        }
      };
    })(file);

    reader.readAsDataURL(file);

    event.target.value = "";
  }

  useEffect(() => {
    const timeOutId = setTimeout(() => {
      if (settingsUpdated) {
        setShowNotification(true);
        setTimeout(() => {
          setShowNotification(false);
        }, 5000);
      }
    }, 1000);
    return () => clearTimeout(timeOutId);
  }, [
    chatbotBackend,
    openAIApiKey, openAIUrl, openAIModel,
    llamaCppUrl,
    ollamaUrl, ollamaModel,
    koboldAiUrl, koboldAiUseExtra,
    ttsBackend,
    elevenlabsApiKey, elevenlabsVoiceId,
    speechT5SpeakerEmbeddingsUrl,
    coquiApiKey, coquiVoiceId,
    openAITTSApiKey, openAITTSUrl, openAITTSModel, openAITTSVoice,
    visionBackend,
    visionLlamaCppUrl,
    visionOllamaUrl, visionOllamaModel,
    visionSystemPrompt,
    bgColor,
    bgUrl, vrmUrl, youtubeVideoID, animationUrl,
    sttBackend,
    whisperOpenAIApiKey, whisperOpenAIModel, whisperOpenAIUrl,
    whisperCppUrl,
    name,
    systemPrompt,
  ]);


  function handleMenuClick(link: Link) {
    setPage(link.key)
    setBreadcrumbs([...breadcrumbs, link]);
  }

  function renderPage() {
    switch(page) {
    case 'main_menu':
      return <MenuPage
        keys={["appearance", "chatbot", "tts", "stt", "vision", "reset_settings", "community"]}
        menuClick={handleMenuClick} />;

    case 'appearance':
      return <MenuPage
        keys={["background_img", "background_color", "background_video", "character_model", "character_animation"]}
        menuClick={handleMenuClick} />;

    case 'chatbot':
      return <MenuPage
        keys={["chatbot_backend", "name", "system_prompt", "chatgpt_settings", "llamacpp_settings", "ollama_settings", "koboldai_settings"]}
        menuClick={handleMenuClick} />;

    case 'tts':
      return <MenuPage
        keys={["tts_backend", "elevenlabs_settings", "speecht5_settings", "coqui_settings", "openai_tts_settings"]}
        menuClick={handleMenuClick} />;

    case 'stt':
      return <MenuPage
        keys={["stt_backend", "whisper_openai_settings", "whispercpp_settings"]}
        menuClick={handleMenuClick} />;

    case 'vision':
      return <MenuPage
        keys={["vision_backend", "vision_llamacpp_settings", "vision_ollama_settings", "vision_system_prompt"]}
        menuClick={handleMenuClick} />;

    case 'reset_settings':
      return <ResetSettingsPage />;

    case 'community':
      return <CommunityPage />

    case 'background_img':
      return <BackgroundImgPage
        bgUrl={bgUrl}
        setBgUrl={setBgUrl}
        setSettingsUpdated={setSettingsUpdated}
        handleClickOpenBgImgFile={handleClickOpenBgImgFile}
        />

    case 'background_color':
      return <BackgroundColorPage
        bgColor={bgColor}
        setBgColor={setBgColor}
        setSettingsUpdated={setSettingsUpdated}
        />

    case 'background_video':
      return <BackgroundVideoPage
        youtubeVideoID={youtubeVideoID}
        setYoutubeVideoID={setYoutubeVideoID}
        setSettingsUpdated={setSettingsUpdated}
        />;

    case 'character_model':
      return <CharacterModelPage
        viewer={viewer}
        vrmUrl={vrmUrl}
        setVrmUrl={setVrmUrl}
        setSettingsUpdated={setSettingsUpdated}
        handleClickOpenVrmFile={handleClickOpenVrmFile}
        />

    case 'character_animation':
      return <CharacterAnimationPage
        viewer={viewer}
        animationUrl={animationUrl}
        setAnimationUrl={setAnimationUrl}
        setSettingsUpdated={setSettingsUpdated}
        />

    case 'chatbot_backend':
      return <ChatbotBackendPage
        chatbotBackend={chatbotBackend}
        setChatbotBackend={setChatbotBackend}
        setSettingsUpdated={setSettingsUpdated}
        setPage={setPage}
        breadcrumbs={breadcrumbs}
        setBreadcrumbs={setBreadcrumbs}
        />

    case 'chatgpt_settings':
      return <ChatGPTSettingsPage
        openAIApiKey={openAIApiKey}
        setOpenAIApiKey={setOpenAIApiKey}
        openAIUrl={openAIUrl}
        setOpenAIUrl={setOpenAIUrl}
        openAIModel={openAIModel}
        setOpenAIModel={setOpenAIModel}
        setSettingsUpdated={setSettingsUpdated}
        />

    case 'llamacpp_settings':
      return <LlamaCppSettingsPage
        llamaCppUrl={llamaCppUrl}
        setLlamaCppUrl={setLlamaCppUrl}
        setSettingsUpdated={setSettingsUpdated}
        />

    case 'ollama_settings':
      return <OllamaSettingsPage
        ollamaUrl={ollamaUrl}
        setOllamaUrl={setOllamaUrl}
        ollamaModel={ollamaModel}
        setOllamaModel={setOllamaModel}
        setSettingsUpdated={setSettingsUpdated}
        />

    case 'koboldai_settings':
      return <KoboldAiSettingsPage
        koboldAiUrl={koboldAiUrl}
        setKoboldAiUrl={setKoboldAiUrl}
        koboldAiUseExtra={koboldAiUseExtra}
        setKoboldAiUseExtra={setKoboldAiUseExtra}
        setSettingsUpdated={setSettingsUpdated}
        />

    case 'tts_backend':
      return <TTSBackendPage
        ttsBackend={ttsBackend}
        setTTSBackend={setTTSBackend}
        setSettingsUpdated={setSettingsUpdated}
        setPage={setPage}
        breadcrumbs={breadcrumbs}
        setBreadcrumbs={setBreadcrumbs}
        />

    case 'elevenlabs_settings':
      return <ElevenLabsSettingsPage
        elevenlabsApiKey={elevenlabsApiKey}
        setElevenlabsApiKey={setElevenlabsApiKey}
        elevenlabsVoiceId={elevenlabsVoiceId}
        setElevenlabsVoiceId={setElevenlabsVoiceId}
        setSettingsUpdated={setSettingsUpdated}
        />

    case 'speecht5_settings':
      return <SpeechT5SettingsPage
        speechT5SpeakerEmbeddingsUrl={speechT5SpeakerEmbeddingsUrl}
        setSpeechT5SpeakerEmbeddingsUrl={setSpeechT5SpeakerEmbeddingsUrl}
        setSettingsUpdated={setSettingsUpdated}
        />

    case 'coqui_settings':
      return <CoquiSettingsPage
        coquiApiKey={coquiApiKey}
        setCoquiApiKey={setCoquiApiKey}
        coquiVoiceId={coquiVoiceId}
        setCoquiVoiceId={setCoquiVoiceId}
        setSettingsUpdated={setSettingsUpdated}
        />

    case 'openai_tts_settings':
      return <OpenAITTSSettingsPage
        openAITTSApiKey={openAITTSApiKey}
        setOpenAITTSApiKey={setOpenAITTSApiKey}
        openAITTSUrl={openAITTSUrl}
        setOpenAITTSUrl={setOpenAITTSUrl}
        openAITTSModel={openAITTSModel}
        setOpenAITTSModel={setOpenAITTSModel}
        openAITTSVoice={openAITTSVoice}
        setOpenAITTSVoice={setOpenAITTSVoice}
        setSettingsUpdated={setSettingsUpdated}
        />

    case'stt_backend':
      return <STTBackendPage
        sttBackend={sttBackend}
        setSTTBackend={setSTTBackend}
        setSettingsUpdated={setSettingsUpdated}
        setPage={setPage}
        breadcrumbs={breadcrumbs}
        setBreadcrumbs={setBreadcrumbs}
        />

    case 'whisper_openai_settings':
      return <WhisperOpenAISettingsPage
        whisperOpenAIUrl={whisperOpenAIUrl}
        setWhisperOpenAIUrl={setWhisperOpenAIUrl}
        whisperOpenAIApiKey={whisperOpenAIApiKey}
        setWhisperOpenAIApiKey={setWhisperOpenAIApiKey}
        whisperOpenAIModel={whisperOpenAIModel}
        setWhisperOpenAIModel={setWhisperOpenAIModel}
        setSettingsUpdated={setSettingsUpdated}
        />

    case 'whispercpp_settings':
      return <WhisperCppSettingsPage
        whisperCppUrl={whisperCppUrl}
        setWhisperCppUrl={setWhisperCppUrl}
        setSettingsUpdated={setSettingsUpdated}
        />

    case 'vision_backend':
      return <VisionBackendPage
        visionBackend={visionBackend}
        setVisionBackend={setVisionBackend}
        setSettingsUpdated={setSettingsUpdated}
        setPage={setPage}
        breadcrumbs={breadcrumbs}
        setBreadcrumbs={setBreadcrumbs}
        />

    case 'vision_llamacpp_settings':
      return <VisionLlamaCppSettingsPage
        visionLlamaCppUrl={visionLlamaCppUrl}
        setVisionLlamaCppUrl={setVisionLlamaCppUrl}
        setSettingsUpdated={setSettingsUpdated}
        />

    case 'vision_ollama_settings':
      return <VisionOllamaSettingsPage
        visionOllamaUrl={visionOllamaUrl}
        setVisionOllamaUrl={setVisionOllamaUrl}
        visionOllamaModel={visionOllamaModel}
        setVisionOllamaModel={setVisionOllamaModel}
        setSettingsUpdated={setSettingsUpdated}
        />

    case 'vision_system_prompt':
      return <VisionSystemPromptPage
        visionSystemPrompt={visionSystemPrompt}
        setVisionSystemPrompt={setVisionSystemPrompt}
        setSettingsUpdated={setSettingsUpdated}
        />

    case 'system_prompt':
      return <SystemPromptPage
        systemPrompt={systemPrompt}
        setSystemPrompt={setSystemPrompt}
        setSettingsUpdated={setSettingsUpdated}
        />

    case 'name':
      return <NamePage
        name={name}
        setName={setName}
        setSettingsUpdated={setSettingsUpdated}
        />

    default:
      throw new Error('page not found');
    }
  }

  return (
    <div className="fixed top-0 left-0 w-full max-h-full text-black text-xs text-left z-20 overflow-y-auto backdrop-blur">
      <div
        className="absolute top-0 left-0 w-full h-full bg-violet-700 opacity-10 z-index-50"
      ></div>
      <div className="fixed w-full top-0 left-0 z-50 p-2 bg-white">

        <nav aria-label="Breadcrumb" className="inline-block ml-4">
          <ol role="list" className="flex items-center space-x-4">
            <li className="flex">
              <div className="flex items-center">
                <span
                  onClick={() => {
                    if (breadcrumbs.length === 0) {
                      onClickClose();
                      return;
                    }
                    setPage('main_menu');
                    setBreadcrumbs([]);
                  }}
                  className="text-gray-400 hover:text-gray-500 cursor-pointer"
                >
                  <HomeIcon className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
                  <span className="sr-only">Home</span>
                </span>
              </div>
            </li>

            {breadcrumbs.map((breadcrumb) => (
              <li key={breadcrumb.key} className="flex">
                <div className="flex items-center">
                  <ChevronRightIcon className="h-5 w-5 flex-shrink-0 text-gray-400" aria-hidden="true" />
                  <span
                    onClick={() => {
                      setPage(breadcrumb.key);
                      const nb = [];
                      for (let b of breadcrumbs) {
                        nb.push(b);
                        if (b.key === breadcrumb.key) {
                          break;
                        }
                      }
                      setBreadcrumbs(nb);
                    }}
                    className="ml-4 text-sm font-medium text-gray-500 hover:text-gray-700 cursor-pointer"
                  >
                    {breadcrumb.label}
                  </span>
                </div>
              </li>
            ))}
          </ol>
        </nav>
      </div>

      <div className="h-screen overflow-auto opacity-95 backdrop-blur">
        <div className="mx-auto max-w-2xl py-16 text-text1">
          <div className="mt-16">
            <TextButton
              className="rounded-b-none text-lg ml-4 px-8 shadow-sm"
              onClick={() => {
                if (breadcrumbs.length === 0) {
                  onClickClose();
                  return;
                }
                if (breadcrumbs.length === 1) {
                  setPage('main_menu');
                  setBreadcrumbs([]);
                  return;
                }

                const prevPage = breadcrumbs[breadcrumbs.length - 2];
                setPage(prevPage.key);
                setBreadcrumbs(breadcrumbs.slice(0, -1));
              }}
            >
              <ArrowUturnLeftIcon className="h-5 w-5 flex-none text-white" aria-hidden="true" />
            </TextButton>

            { renderPage() }
          </div>
        </div>
      </div>

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
                    <p className="text-sm font-medium text-gray-900">Successfully saved!</p>
                    <p className="mt-1 text-sm text-gray-500">Your settings were updated successfully.</p>
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

      <input
        type="file"
        className="hidden"
        accept=".vrm"
        ref={vrmFileInputRef}
        onChange={handleChangeVrmFile}
      />
      <input
        type="file"
        className="hidden"
        accept=".jpg,.jpeg,.png,.gif,.webp"
        ref={bgImgFileInputRef}
        onChange={handleChangeBgImgFile}
      />
    </div>
  );
};
