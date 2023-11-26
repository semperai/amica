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
import { WhisperOpenAISettings } from './settings/WhisperOpenAISettings';

import { VisionBackendPage } from './settings/VisionBackendPage';
import { VisionLlamaCppSettingsPage } from './settings/VisionLlamaCppSettingsPage';
import { VisionSystemPromptPage } from './settings/VisionSystemPromptPage';

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
  const [visionSystemPrompt, setVisionSystemPrompt] = useState(config("vision_system_prompt"));

  const [bgUrl, setBgUrl] = useState(config("bg_url"));
  const [vrmUrl, setVrmUrl] = useState(config("vrm_url"));
  const [youtubeVideoID, setYoutubeVideoID] = useState(config("youtube_videoid"));
  const [animationUrl, setAnimationUrl] = useState(config("animation_url"));

  const [sttBackend, setSTTBackend] = useState(config("stt_backend"));
  const [whisperOpenAIUrl, setWhisperOpenAIUrl] = useState(config("openai_whisper_url"));
  const [whisperOpenAIApiKey, setWhisperOpenAIApiKey] = useState(config("openai_whisper_apikey"));
  const [whisperOpenAIModel, setWhisperOpenAIModel] = useState(config("openai_whisper_model"));

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
    visionBackend, visionLlamaCppUrl, visionSystemPrompt,
    bgUrl, vrmUrl, youtubeVideoID, animationUrl,
    sttBackend,
    whisperOpenAIApiKey, whisperOpenAIModel, whisperOpenAIUrl,
    systemPrompt,
  ]);


  function handleMenuClick(link: Link) {
    setPage(link.key)
    setBreadcrumbs([...breadcrumbs, link]);
  }

  return (
    <div className="absolute top-0 left-0 w-screen max-h-screen text-black text-xs text-left z-20 overflow-y-auto backdrop-blur">
      <div
        className="absolute top-0 left-0 w-screen h-screen bg-violet-700 opacity-10 z-index-50"
      ></div>
      <div className="fixed w-screen top-0 left-0 z-50 p-2 bg-white">
        {breadcrumbs.length === 0 && (
          <IconButton
            iconName="24/Close"
            isProcessing={false}
            className="bg-secondary hover:bg-secondary-hover active:bg-secondary-active"
            onClick={onClickClose} />
        )}

        <nav aria-label="Breadcrumb" className="inline-block ml-4">
          <ol role="list" className="flex items-center space-x-4">
            {breadcrumbs.length > 0 && (
              <>
                <li className="flex">
                  <div className="flex items-center">
                    <span
                      onClick={() => {
                        setPage('main_menu');
                        setBreadcrumbs([]);
                      }}
                      className="text-gray-400 hover:text-gray-500 cursor-pointer">
                      <HomeIcon className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
                      <span className="sr-only">Home</span>
                    </span>
                  </div>
                </li>
              </>
            )}
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
        <div className="mx-auto max-w-3xl py-16 text-text1">
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

            {page === 'main_menu' && (
              <MenuPage
                keys={["appearance", "chatbot", "tts", "stt", "vision", "reset_settings", "community"]}
                menuClick={handleMenuClick} />
            )}

            {page === 'appearance' && (
              <MenuPage
                keys={["background_img", "background_video", "character_model", "character_animation"]}
                menuClick={handleMenuClick} />
            )}

            {page === 'chatbot' && (
              <MenuPage
                keys={["chatbot_backend", "system_prompt", "chatgpt_settings", "llamacpp_settings", "ollama_settings", "koboldai_settings"]}
                menuClick={handleMenuClick} />
            )}

            {page === 'tts' && (
              <MenuPage
                keys={["tts_backend", "elevenlabs_settings", "speecht5_settings", "coqui_settings", "openai_tts_settings"]}
                menuClick={handleMenuClick} />
            )}

            {page === 'stt' && (
              <MenuPage
                keys={["stt_backend", "whisper_openai_settings"]}
                menuClick={handleMenuClick} />
            )}

            {page === 'vision' && (
              <MenuPage
                keys={["vision_backend", "vision_llamacpp_settings", "vision_system_prompt"]}
                menuClick={handleMenuClick} />
            )}

            {page === 'reset_settings' && (
              <ResetSettingsPage />
            )}

            {page === 'community' && (
              <CommunityPage />
            )}

            {page === 'background_img' && (
              <BackgroundImgPage
                bgUrl={bgUrl}
                setBgUrl={setBgUrl}
                setSettingsUpdated={setSettingsUpdated}
                handleClickOpenBgImgFile={handleClickOpenBgImgFile}
                />
            )}

            {page === 'background_video' && (
              <BackgroundVideoPage
                youtubeVideoID={youtubeVideoID}
                setYoutubeVideoID={setYoutubeVideoID}
                setSettingsUpdated={setSettingsUpdated}
                />
            )}

            {page === 'character_model' && (
              <CharacterModelPage
                viewer={viewer}
                vrmUrl={vrmUrl}
                setVrmUrl={setVrmUrl}
                setSettingsUpdated={setSettingsUpdated}
                handleClickOpenVrmFile={handleClickOpenVrmFile}
                />
            )}

            {page === 'character_animation' && (
              <CharacterAnimationPage
                viewer={viewer}
                animationUrl={animationUrl}
                setAnimationUrl={setAnimationUrl}
                setSettingsUpdated={setSettingsUpdated}
                />
            )}

            {page === 'chatbot_backend' && (
              <ChatbotBackendPage
                chatbotBackend={chatbotBackend}
                setChatbotBackend={setChatbotBackend}
                setSettingsUpdated={setSettingsUpdated}
                setPage={setPage}
                breadcrumbs={breadcrumbs}
                setBreadcrumbs={setBreadcrumbs}
                />
            )}

            {page === 'chatgpt_settings' && (
              <ChatGPTSettingsPage
                openAIApiKey={openAIApiKey}
                setOpenAIApiKey={setOpenAIApiKey}
                openAIUrl={openAIUrl}
                setOpenAIUrl={setOpenAIUrl}
                openAIModel={openAIModel}
                setOpenAIModel={setOpenAIModel}
                setSettingsUpdated={setSettingsUpdated}
                />
            )}

            {page === 'llamacpp_settings' && (
              <LlamaCppSettingsPage
                llamaCppUrl={llamaCppUrl}
                setLlamaCppUrl={setLlamaCppUrl}
                setSettingsUpdated={setSettingsUpdated}
                />
            )}

            {page === 'ollama_settings' && (
              <OllamaSettingsPage
                ollamaUrl={ollamaUrl}
                setOllamaUrl={setOllamaUrl}
                ollamaModel={ollamaModel}
                setOllamaModel={setOllamaModel}
                setSettingsUpdated={setSettingsUpdated}
                />
            )}

            {page === 'koboldai_settings' && (
              <KoboldAiSettingsPage
                koboldAiUrl={koboldAiUrl}
                setKoboldAiUrl={setKoboldAiUrl}
                koboldAiUseExtra={koboldAiUseExtra}
                setKoboldAiUseExtra={setKoboldAiUseExtra}
                setSettingsUpdated={setSettingsUpdated}
                />
            )}

            {page === 'tts_backend' && (
              <TTSBackendPage
                ttsBackend={ttsBackend}
                setTTSBackend={setTTSBackend}
                setSettingsUpdated={setSettingsUpdated}
                setPage={setPage}
                breadcrumbs={breadcrumbs}
                setBreadcrumbs={setBreadcrumbs}
                />
            )}

            {page === 'elevenlabs_settings' && (
              <ElevenLabsSettingsPage
                elevenlabsApiKey={elevenlabsApiKey}
                setElevenlabsApiKey={setElevenlabsApiKey}
                elevenlabsVoiceId={elevenlabsVoiceId}
                setElevenlabsVoiceId={setElevenlabsVoiceId}
                setSettingsUpdated={setSettingsUpdated}
                />
            )}

            {page === 'speecht5_settings' && (
              <SpeechT5SettingsPage
                speechT5SpeakerEmbeddingsUrl={speechT5SpeakerEmbeddingsUrl}
                setSpeechT5SpeakerEmbeddingsUrl={setSpeechT5SpeakerEmbeddingsUrl}
                setSettingsUpdated={setSettingsUpdated}
                />
            )}

           {page === 'coqui_settings' && (
              <CoquiSettingsPage
                coquiApiKey={coquiApiKey}
                setCoquiApiKey={setCoquiApiKey}
                coquiVoiceId={coquiVoiceId}
                setCoquiVoiceId={setCoquiVoiceId}
                setSettingsUpdated={setSettingsUpdated}
                />
            )}

            {page === 'openai_tts_settings' && (
              <OpenAITTSSettingsPage
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
            )}

           {page === 'stt_backend' && (
              <STTBackendPage
                sttBackend={sttBackend}
                setSTTBackend={setSTTBackend}
                setSettingsUpdated={setSettingsUpdated}
                setPage={setPage}
                breadcrumbs={breadcrumbs}
                setBreadcrumbs={setBreadcrumbs}
                />
            )}

            {page === 'whisper_openai_settings' && (
              <WhisperOpenAISettings
                whisperOpenAIUrl={whisperOpenAIUrl}
                setWhisperOpenAIUrl={setWhisperOpenAIUrl}
                whisperOpenAIApiKey={whisperOpenAIApiKey}
                setWhisperOpenAIApiKey={setWhisperOpenAIApiKey}
                whisperOpenAIModel={whisperOpenAIModel}
                setWhisperOpenAIModel={setWhisperOpenAIModel}
                setSettingsUpdated={setSettingsUpdated}
                />
            )}

           {page === 'vision_backend' && (
              <VisionBackendPage
                visionBackend={visionBackend}
                setVisionBackend={setVisionBackend}
                setSettingsUpdated={setSettingsUpdated}
                setPage={setPage}
                breadcrumbs={breadcrumbs}
                setBreadcrumbs={setBreadcrumbs}
                />
            )}

            {page === 'vision_llamacpp_settings' && (
              <VisionLlamaCppSettingsPage
                visionLlamaCppUrl={visionLlamaCppUrl}
                setVisionLlamaCppUrl={setVisionLlamaCppUrl}
                setSettingsUpdated={setSettingsUpdated}
                />
            )}

            {page === 'vision_system_prompt' && (
              <VisionSystemPromptPage
                visionSystemPrompt={visionSystemPrompt}
                setVisionSystemPrompt={setVisionSystemPrompt}
                setSettingsUpdated={setSettingsUpdated}
                />
            )}

            {page === 'system_prompt' && (
              <SystemPromptPage
                systemPrompt={systemPrompt}
                setSystemPrompt={setSystemPrompt}
                setSettingsUpdated={setSettingsUpdated}
                />
            )}
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