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

import {
  AdjustmentsHorizontalIcon,
  ChatBubbleOvalLeftEllipsisIcon,
  CheckCircleIcon,
  UsersIcon,
  RocketLaunchIcon,
  FaceSmileIcon,
  MusicalNoteIcon,
  PowerIcon,
  PhotoIcon,
  FilmIcon,
  SpeakerWaveIcon,
  DocumentTextIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline';

import { getWindowAI } from "window.ai";

import { useKeyboardShortcut } from "@/hooks/useKeyboardShortcut";
import { GitHubLink } from "@/components/githubLink";
import { IconButton } from "@/components/iconButton";
import { TextButton } from "@/components/textButton";
import { SecretTextInput } from "@/components/secretTextInput";
import { TextInput } from "@/components/textInput";
import { ViewerContext } from "@/features/vrmViewer/viewerContext";
import { loadMixamoAnimation } from "@/lib/VRMAnimation/loadMixamoAnimation";
import { config, updateConfig, resetConfig } from "@/utils/config";
import {
  bgImages,
  vrmList,
  speechT5SpeakerEmbeddingsList,
  animationList,
} from "@/paths";


const chatbotBackends = [
  {key: "echo",       label: "Echo"},
  {key: "chatgpt",    label: "ChatGPT"},
  {key: "llamacpp",   label: "LLama.cpp"},
  {key: "windowai",   label: "Window.ai"},
];

const ttsEngines = [
  {key: "none",       label: "None"},
  {key: "elevenlabs", label: "ElevenLabs"},
  {key: "speecht5",   label: "SpeechT5"},
  {key: "coqui",      label: "Coqui TTS"},
];

function thumbPrefix(path: string) {
  const a = path.split("/");
  a[a.length - 1] = "thumb-" + a[a.length - 1];
  return a.join("/");
}

function basename(path: string) {
  const a = path.split("/");
  return a[a.length - 1];
}

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}

type Link = {
  key: string;
  label: string;
  icon?: JSX.Element;
  className?: string;
}


type PageProps = {
  setPage: (page: string) => void;
  breadcrumbs: Link[];
  setBreadcrumbs: (breadcrumbs: Link[]) => void;
}

function getIconFromPage(page: string): JSX.Element {
  switch(page) {
    case 'appearance':          return <FaceSmileIcon className="h-5 w-5 flex-none text-gray-800" aria-hidden="true" />;
    case 'chatbot':             return <ChatBubbleOvalLeftEllipsisIcon className="h-5 w-5 flex-none text-gray-800" aria-hidden="true" />;
    case 'tts':                 return <MusicalNoteIcon className="h-5 w-5 flex-none text-gray-800" aria-hidden="true" />;
    case 'reset_settings':      return <PowerIcon className="h-5 w-5 flex-none text-red-500" aria-hidden="true" />;
    case 'community':           return <RocketLaunchIcon className="h-5 w-5 flex-none text-gray-800" aria-hidden="true" />;
    case 'background_img':      return <PhotoIcon className="h-5 w-5 flex-none text-gray-800" aria-hidden="true" />;
    case 'background_video':    return <FilmIcon className="h-5 w-5 flex-none text-gray-800" aria-hidden="true" />;
    case 'character_model':     return <UsersIcon className="h-5 w-5 flex-none text-gray-800" aria-hidden="true" />;
    case 'character_animation': return <AdjustmentsHorizontalIcon className="h-5 w-5 flex-none text-gray-800" aria-hidden="true" />;
    case 'chatbot_backend':     return <Cog6ToothIcon className="h-5 w-5 flex-none text-gray-800" aria-hidden="true" />;
    case 'chatgpt_settings':    return <AdjustmentsHorizontalIcon className="h-5 w-5 flex-none text-gray-800" aria-hidden="true" />;
    case 'llamacpp_settings':   return <AdjustmentsHorizontalIcon className="h-5 w-5 flex-none text-gray-800" aria-hidden="true" />;
    case 'tts_backend':         return <SpeakerWaveIcon className="h-5 w-5 flex-none text-gray-800" aria-hidden="true" />;
    case 'elevenlabs_settings': return <AdjustmentsHorizontalIcon className="h-5 w-5 flex-none text-gray-800" aria-hidden="true" />;
    case 'speecht5_settings':   return <AdjustmentsHorizontalIcon className="h-5 w-5 flex-none text-gray-800" aria-hidden="true" />;
    case 'coqui_settings':      return <AdjustmentsHorizontalIcon className="h-5 w-5 flex-none text-gray-800" aria-hidden="true" />;
    case 'system_prompt':       return <DocumentTextIcon className="h-5 w-5 flex-none text-gray-800" aria-hidden="true" />;
  }

  return <></>;
}

function getLabelFromPage(page: string): string {
  switch(page) {
    case 'appearance':          return 'Appearance';
    case 'chatbot':             return 'ChatBot';
    case 'tts':                 return 'Text-to-Speech';
    case 'reset_settings':      return 'Reset Settings';
    case 'community':           return 'Community';
    case 'background_img':      return 'Background Image';
    case 'background_video':    return 'Background Video';
    case 'character_model':     return 'Character Model';
    case 'character_animation': return 'Character Animation';
    case 'chatbot_backend':     return 'ChatBot Backend';
    case 'chatgpt_settings':    return 'ChatGPT';
    case 'llamacpp_settings':   return 'LLama.cpp';
    case 'tts_backend':         return 'TTS Backend';
    case 'elevenlabs_settings': return 'ElevenLabs';
    case 'speecht5_settings':   return 'SpeechT5';
    case 'coqui_settings':      return 'Coqui';
    case 'system_prompt':       return 'System Prompt';
  }

  throw new Error('unknown page label encountered');
}

function getClassNameFromPage(page: string) {
  switch(page) {
    case 'reset_settings': return 'text-red-500';
  }

  return '';
}

function getLinkFromPage(page: string) {
  return {
    key: page,
    label: getLabelFromPage(page),
    icon: getIconFromPage(page),
    className: getClassNameFromPage(page),
  };
}

function pagesToLinks(keys: string[]): Link[] {
  const links: Link[] = [];
  for (const key of keys) {
    links.push(getLinkFromPage(key));
  }
  return links;
}


function MenuPage({
  keys,
  menuClick,
}: {
  keys: string[];
  menuClick: (link: Link) => void;
}) {
  const links = pagesToLinks(keys);
  return (
    <ul role="list" className="divide-y divide-black/5 bg-white rounded-lg shadow-lg">
      {links.map((link) => (
        <li
          key={link.key}
          className="relative flex items-center space-x-4 py-4 cursor-pointer rounded-lg hover:bg-gray-50 p-4 transition-all"
          onClick={() => {
            menuClick(link);
          }}
        >
          <div className="min-w-0 flex-auto">
            <div className="flex items-center gap-x-3">
              <h2 className="min-w-0 text-sm font-semibold leading-6">
                <span className={`whitespace-nowrap flex w-0 flex-1 gap-x-2 items-center ${link.className ?? ''}`}>
                  {link.icon}
                  {link.label}
                </span>
              </h2>
            </div>
          </div>
          <ChevronRightIcon className="h-5 w-5 flex-none text-gray-400" aria-hidden="true" />
        </li>
      ))}
    </ul>
  );  
}

function basicPage(
  title: string,
  description: React.ReactNode,
  children: React.ReactNode,
) {
  return (
    <>
      <div className="rounded-lg shadow-lg bg-white p-4">
        <h2 className="text-xl w-full">{title}</h2>
        <p className="w-full my-4">{description}</p>

        <div className="mt-4">
          {children}
        </div>
      </div>
    </>
  );
}

function FormRow({label, children}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="sm:col-span-3 max-w-xs rounded-xl">
      <label htmlFor="last-name" className="block text-sm font-medium leading-6 text-gray-900">
        {label}
      </label>
      <div className="mt-2">
        {children}
      </div>
    </div>
  );
}


function ResetSettingsPage() {
  return basicPage(
    "Reset Settings",
    "Reset all settings to default. This will reload the page. You will lose any unsaved changes.",
    <ul role="list" className="divide-y divide-gray-100 max-w-xs">
      <li className="py-4">
        <FormRow label="">
          <IconButton
            iconName="24/Error"
            isProcessing={false}
            label="Reset All Settings"
            onClick={() => {
              resetConfig();
              window.location.reload();
            }}
            className="mx-4 text-xs bg-secondary hover:bg-secondary-hover active:bg-secondary-active"
            />
        </FormRow>
      </li>
    </ul>
  );
}

function CommunityPage() {
  return basicPage(
    "Community",
    "Join the community",
    <ul role="list" className="divide-y divide-gray-100 max-w-xs">
      <li className="py-4">
        <a
          href="https://t.me/arbius_ai"
          target="_blank"
          className="rounded bg-indigo-600 px-2 py-1 text-lg font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
          Telegram
        </a>
      </li>
      <li className="py-4">
        <a
          href="https://twitter.com/arbius_ai"
          target="_blank"
          className="rounded bg-indigo-600 px-2 py-1 text-lg font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
          Twitter
        </a>
      </li>
      <li className="py-4">
        <GitHubLink />
      </li>
    </ul>
  );
}

function BackgroundImgPage({
  bgUrl,
  setBgUrl,
  setSettingsUpdated,
  handleClickOpenBgImgFile,
}: {
  bgUrl: string;
  setBgUrl: (url: string) => void;
  setSettingsUpdated: (updated: boolean) => void;
  handleClickOpenBgImgFile: () => void;
}) {
  return (
    <>
      <div className="rounded-lg shadow-lg bg-white flex flex-wrap justify-center space-x-4 space-y-4 p-4">
        { bgImages.map((url) =>
          <button
            key={url}
            onClick={() => {
              document.body.style.backgroundImage = `url(${url})`;
              updateConfig("youtube_videoid", "");
              updateConfig("bg_url", url);
              setBgUrl(url);
              setSettingsUpdated(true);
            }}
            className={"mx-4 py-2 rounded-4 transition-all bg-gray-100 hover:bg-white active:bg-gray-100 rounded-xl " + (bgUrl === url ? "opacity-100 shadow-md" : "opacity-60 hover:opacity-100")}
            >
              <img
                src={`${thumbPrefix(url)}`}
                alt={url}
                width="160"
                height="93"
                className="m-0 rounded-md mx-4 p-0 shadow-sm shadow-black hover:shadow-md hover:shadow-black rounded-4 transition-all bg-gray-100 hover:bg-white active:bg-gray-100"
                onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = url;
                }}
              />
          </button>
        )}
      </div>
      <TextButton
        className="rounded-t-none text-lg ml-4 px-8 shadow-lg bg-secondary hover:bg-secondary-hover active:bg-secondary-active"
        onClick={handleClickOpenBgImgFile}
      >
        Load image
      </TextButton>
    </>
  );
}

function BackgroundVideoPage({
  youtubeVideoID,
  setYoutubeVideoID,
  setSettingsUpdated,
}: {
  youtubeVideoID: string;
  setYoutubeVideoID: (id: string) => void;
  setSettingsUpdated: (updated: boolean) => void;
}) {
  return basicPage(
    "Background Video",
    <>Select a background video. Copy this from youtube embed, it will look something like <code>kDCXBwzSI-4</code></>,
    <ul role="list" className="divide-y divide-gray-100 max-w-xs">
      <li className="py-4">
        <FormRow label="YouTube Video ID">
          <TextInput
            value={youtubeVideoID}
            onChange={(event: React.ChangeEvent<any>) => {
              const id = event.target.value.trim();
              setYoutubeVideoID(id);
              updateConfig("youtube_videoid", id);
              setSettingsUpdated(true);
              return false;
            }}
            />
         </FormRow>
      </li>
    </ul>
  );
}

function ChatbotBackendPage({
  chatbotBackend,
  setChatbotBackend,
  setSettingsUpdated,
  setPage,
  breadcrumbs,
  setBreadcrumbs,
}: {
  chatbotBackend: string;
  setChatbotBackend: (backend: string) => void;
  setSettingsUpdated: (updated: boolean) => void;
  setPage: (page: string) => void;
  breadcrumbs: Link[];
  setBreadcrumbs: (breadcrumbs: Link[]) => void;
}) {
  const [windowAiDetected, setWindowAiDetected] = useState(false);

  useEffect(() => {
    (async () => {
      const windowAI = await getWindowAI();
      if (windowAI) {
        setWindowAiDetected(true);
      }
    })();
  }, []);

  return basicPage(
    "Chatbot Backend",
    "Select the chatbot backend to use. Echo simply responds with what you type, it is used for testing and demonstration. ChatGPT is a commercial chatbot API from OpenAI, however there are multiple compatible API providers which can be used in lieu of OpenAI. LLama.cpp is a free and open source chatbot backend.",
    <ul role="list" className="divide-y divide-gray-100 max-w-xs">
      <li className="py-4">
        <FormRow label="Chatbot Backend">
          <select
            className="mt-2 block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
            value={chatbotBackend}
            onChange={(event: React.ChangeEvent<any>) => {
              setChatbotBackend(event.target.value);
              updateConfig("chatbot_backend", event.target.value);
              setSettingsUpdated(true);
            }}
          >
            {chatbotBackends.map((engine) => (
              <option key={engine.key} value={engine.key}>{engine.label}</option>
            ))}
          </select>
        </FormRow>
      </li>
      { chatbotBackend === 'chatgpt' && (
        <li className="py-4">
          <FormRow label="Configure ChatGPT">
            <button
              type="button"
              className="rounded bg-indigo-600 px-2 py-1 text-xs font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              onClick={() => {
                setPage('chatgpt_settings');
                setBreadcrumbs(breadcrumbs.concat([getLinkFromPage('chatgpt_settings')]));
              }}
            >
              Click here to configure ChatGPT
            </button>
          </FormRow>
        </li>
      )}
     { chatbotBackend === 'llamacpp' && (
        <li className="py-4">
          <FormRow label="Configure Llama.cpp">
            <button
              type="button"
              className="rounded bg-indigo-600 px-2 py-1 text-xs font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              onClick={() => {
                setPage('llamacpp_settings');
                setBreadcrumbs(breadcrumbs.concat([getLinkFromPage('llamacpp_settings')]));
              }}
            >
              Click here to configure Llama.cpp
            </button>
          </FormRow>
        </li>
      )}
      { chatbotBackend === 'windowai' && ! windowAiDetected && (
        <li className="py-4">
          <FormRow label="Window.ai not found">
            <a
              href="https://windowai.io/"
              target="_blank"
              className="rounded bg-indigo-600 px-2 py-1 text-xs font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              Install window.ai
            </a>
          </FormRow>
        </li>
      )} 
    </ul>
  );
}

function ChatGPTSettingsPage({
  openAIApiKey,
  setOpenAIApiKey,
  openAIUrl,
  setOpenAIUrl,
  openAIModel,
  setOpenAIModel,
  setSettingsUpdated,
}: {
  openAIApiKey: string;
  setOpenAIApiKey: (key: string) => void;
  openAIUrl: string;
  setOpenAIUrl: (url: string) => void;
  openAIModel: string;
  setOpenAIModel: (model: string) => void;
  setSettingsUpdated: (updated: boolean) => void;
}) {
  return basicPage(
    "ChatGPT Settings",
    <>Configure ChatGPT settings. You can get an API key from <a href="https://platform.openai.com">platform.openai.com</a>. You can generally use other OpenAI compatible URLs and models here too, such as <a href="https://openrouter.ai/">OpenRouter</a> or <a href="https://lmstudio.ai/">LM Studio</a>.</>,
    <ul role="list" className="divide-y divide-gray-100 max-w-xs">
      <li className="py-4">
        <FormRow label="OpenAI API Key">
          <SecretTextInput
            value={openAIApiKey}
            onChange={(event: React.ChangeEvent<any>) => {
              setOpenAIApiKey(event.target.value);
              updateConfig("openai_apikey", event.target.value);
              setSettingsUpdated(true);
            }}
          />
        </FormRow>
      </li>
      <li className="py-4">
        <FormRow label="OpenAI URL">
          <TextInput
            value={openAIUrl}
            onChange={(event: React.ChangeEvent<any>) => {
              setOpenAIUrl(event.target.value);
              updateConfig("openai_url", event.target.value);
              setSettingsUpdated(true);
            }}
          />
        </FormRow>
      </li>
      <li className="py-4">
        <FormRow label="OpenAI Model">
          <TextInput
            value={openAIModel}
            onChange={(event: React.ChangeEvent<any>) => {
              setOpenAIModel(event.target.value);
              updateConfig("openai_model", event.target.value);
              setSettingsUpdated(true);
            }}
          />
        </FormRow>
      </li>
    </ul>
  );
}

function LlamaCppSettingsPage({
  llamaCppUrl,
  setLlamaCppUrl,
  setSettingsUpdated,
}: {
  llamaCppUrl: string;
  setLlamaCppUrl: (url: string) => void;
  setSettingsUpdated: (updated: boolean) => void;
}) {
  return basicPage(
    "LLama.cpp Settings",
    <>LLama.cpp is a free and open source chatbot backend. You should build the server from source and run it on your own computer. You can get the source code from <a href="https://github.com/ggerganov/llama.cpp">GitHub</a></>,
    <ul role="list" className="divide-y divide-gray-100 max-w-xs">
      <li className="py-4">
        <FormRow label="API URL">
          <TextInput
            value={llamaCppUrl}
            onChange={(event: React.ChangeEvent<any>) => {
              setLlamaCppUrl(event.target.value);
              updateConfig("llamacpp_url", event.target.value);
              setSettingsUpdated(true);
            }}
          />
        </FormRow>
      </li>
    </ul>
  );
}

function TTSBackendPage({
  ttsBackend,
  setTTSBackend,
  setSettingsUpdated,
  setPage,
  breadcrumbs,
  setBreadcrumbs,
}: {
  ttsBackend: string;
  setTTSBackend: (backend: string) => void;
  setSettingsUpdated: (updated: boolean) => void;
  setPage: (page: string) => void;
  breadcrumbs: Link[];
  setBreadcrumbs: (breadcrumbs: Link[]) => void;
}) {
  return basicPage(
    "TTS Backend",
    "Select the TTS backend to use", 
    <ul role="list" className="divide-y divide-gray-100 max-w-xs">
      <li className="py-4">
        <FormRow label="TTS Backend">
          <select
            className="mt-2 block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
            value={ttsBackend}
            onChange={(event: React.ChangeEvent<any>) => {
              setTTSBackend(event.target.value);
              updateConfig("tts_backend", event.target.value);
              setSettingsUpdated(true);
            }}
          >
            {ttsEngines.map((engine) => (
              <option key={engine.key} value={engine.key}>{engine.label}</option>
            ))}
          </select>
        </FormRow>
      </li>
      { ttsBackend === 'elevenlabs' && (
        <li className="py-4">
          <FormRow label="Configure ElevenLabs">
            <button
              type="button"
              className="rounded bg-indigo-600 px-2 py-1 text-xs font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              onClick={() => {
                setPage('elevenlabs_settings');
                setBreadcrumbs(breadcrumbs.concat([getLinkFromPage('elevenlabs_settings')]));
              }}
            >
              Click here to configure ElevenLabs
            </button>
          </FormRow>
        </li>
      )}
      { ttsBackend === 'speecht5' && (
        <li className="py-4">
          <FormRow label="Configure SpeechT5">
            <button
              type="button"
              className="rounded bg-indigo-600 px-2 py-1 text-xs font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              onClick={() => {
                setPage('speecht5_settings');
                setBreadcrumbs(breadcrumbs.concat([getLinkFromPage('speecht5_settings')]));
              }}
            >
              Click here to configure SpeechT5
            </button>
          </FormRow>
        </li>
      )}
      { ttsBackend === 'coqui' && (
        <li className="py-4">
          <FormRow label="Configure Coqui">
            <button
              type="button"
              className="rounded bg-indigo-600 px-2 py-1 text-xs font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              onClick={() => {
                setPage('coqui_settings');
                setBreadcrumbs(breadcrumbs.concat([getLinkFromPage('coqui_settings')]));
              }}
            >
              Click here to configure Coqui
            </button>
          </FormRow>
        </li>
      )}
    </ul>
  );
}

function ElevenLabsSettingsPage({
  elevenlabsApiKey,
  setElevenlabsApiKey,
  elevenlabsVoiceId,
  setElevenlabsVoiceId,
  setSettingsUpdated,
}: {
  elevenlabsApiKey: string;
  setElevenlabsApiKey: (key: string) => void;
  elevenlabsVoiceId: string;
  setElevenlabsVoiceId: (id: string) => void;
  setSettingsUpdated: (updated: boolean) => void;
}) {
  return basicPage(
    "ElevenLabs Settings",
    "Configure ElevenLabs",
    <ul role="list" className="divide-y divide-gray-100 max-w-xs">
      <li className="py-4">
        <FormRow label="API Key">
          <SecretTextInput
            value={elevenlabsApiKey}
            onChange={(event: React.ChangeEvent<any>) => {
              setElevenlabsApiKey(event.target.value);
              updateConfig("elevenlabs_apikey", event.target.value);
              setSettingsUpdated(true);
            }}
          />
        </FormRow>
      </li>
      <li className="py-4">
        <FormRow label="Voice ID">
          <TextInput
            value={elevenlabsVoiceId}
            onChange={(event: React.ChangeEvent<any>) => {
              setElevenlabsVoiceId(event.target.value);
              updateConfig("elevenlabs_voiceid", event.target.value);
              setSettingsUpdated(true);
            }}
          />
        </FormRow>
      </li>
    </ul>
  );
}

function SpeechT5SettingsPage({
  speechT5SpeakerEmbeddingsUrl,
  setSpeechT5SpeakerEmbeddingsUrl,
  setSettingsUpdated,
}: {
  speechT5SpeakerEmbeddingsUrl: string;
  setSpeechT5SpeakerEmbeddingsUrl: (url: string) => void;
  setSettingsUpdated: (updated: boolean) => void;
}) {
  return basicPage(
    "SpeechT5 Settings",
    "Configure SpeechT5",
    <ul role="list" className="divide-y divide-gray-100 max-w-xs">
      <li className="py-4">
        <FormRow label="Speaker Embeddings URL">
          <select
            value={speechT5SpeakerEmbeddingsUrl}
            onChange={(event: React.ChangeEvent<any>) => {
              event.preventDefault();
              setSpeechT5SpeakerEmbeddingsUrl(event.target.value);
              updateConfig("speecht5_speaker_embedding_url", event.target.value);
              setSettingsUpdated(true);
            }}
          >
            {speechT5SpeakerEmbeddingsList.map((url) =>
              <option
                key={url}
                value={url}
              >
                {basename(url)}
              </option>
            )}
          </select>
        </FormRow>
      </li>
    </ul>
  );
}

function CoquiSettingsPage({
  coquiUrl,
  setCoquiUrl,
  coquiSpeakerId,
  setCoquiSpeakerId,
  coquiStyleUrl,
  setCoquiStyleUrl,
  setSettingsUpdated,
}: {
  coquiUrl: string;
  setCoquiUrl: (url: string) => void;
  coquiSpeakerId: string;
  setCoquiSpeakerId: (id: string) => void;
  coquiStyleUrl: string;
  setCoquiStyleUrl: (url: string) => void;
  setSettingsUpdated: (updated: boolean) => void;
}) {
  return basicPage(
    "Coqui Settings",
    "Configure Coqui",
    <ul role="list" className="divide-y divide-gray-100 max-w-xs">
      <li className="py-4">
        <FormRow label="API URL">
          <TextInput
            value={coquiUrl}
            onChange={(event: React.ChangeEvent<any>) => {
              event.preventDefault();
              setCoquiUrl(event.target.value);
              updateConfig("coqui_url", event.target.value);
              setSettingsUpdated(true);
            }}
          />
        </FormRow>
      </li>
      <li className="py-4">
        <FormRow label="Speaker Id">
          <TextInput
            value={coquiSpeakerId}
            onChange={(event: React.ChangeEvent<any>) => {
              event.preventDefault();
              setCoquiSpeakerId(event.target.value);
              updateConfig("coqui_speaker_id", event.target.value);
              setSettingsUpdated(true);
            }}
          />
        </FormRow>
      </li>
      <li className="py-4">
        <FormRow label="Style URL">
          <TextInput
            value={coquiStyleUrl}
            onChange={(event: React.ChangeEvent<any>) => {
              event.preventDefault();
              setCoquiStyleUrl(event.target.value);
              updateConfig("coqui_style_url", event.target.value);
              setSettingsUpdated(true);
            }}
          />
        </FormRow>
      </li>
    </ul>
  );
}

function SystemPromptPage({
  systemPrompt,
  setSystemPrompt,
  setSettingsUpdated,
}: {
  systemPrompt: string;
  setSystemPrompt: (prompt: string) => void;
  setSettingsUpdated: (updated: boolean) => void;
}) {
  return basicPage(
    "System Prompt",
    "Configure the system prompt. This is the prompt that is used to generate the chatbot response.",
    <ul role="list" className="divide-y divide-gray-100 max-w-xs">
      <li className="py-4">
        <FormRow label="System Prompt">
          <textarea
            value={systemPrompt}
            rows={8}
            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
            onChange={(event: React.ChangeEvent<any>) => {
              event.preventDefault();
              setSystemPrompt(event.target.value);
              updateConfig("system_prompt", event.target.value);
              setSettingsUpdated(true);
            }}></textarea>
        </FormRow>
      </li>
    </ul>
  );
}

function CharacterModelPage({
  viewer,
  vrmUrl,
  setVrmUrl,
  setSettingsUpdated,
  handleClickOpenVrmFile,
}: {
  viewer: any; // TODO
  vrmUrl: string;
  setVrmUrl: (url: string) => void;
  setSettingsUpdated: (updated: boolean) => void;
  handleClickOpenVrmFile: () => void;
}) {
  return (
    <>
      <div className="rounded-lg shadow-lg bg-white flex flex-wrap justify-center space-x-4 space-y-4 p-4">
        { vrmList.map((url) =>
          <button
            key={url}
            onClick={() => {
              viewer.loadVrm(url);
              updateConfig("vrm_url", url);
              setVrmUrl(url);
              setSettingsUpdated(true);
            }}
            className={"mx-4 py-2 rounded-4 transition-all bg-gray-100 hover:bg-white active:bg-gray-100 rounded-xl " + (vrmUrl === url ? "opacity-100 shadow-md" : "opacity-60 hover:opacity-100")}
            >
              <img
                src={`${thumbPrefix(url)}.jpg`}
                alt={url}
                width="160"
                height="93"
                className="m-0 rounded mx-4 pt-0 pb-0 pl-0 pr-0 shadow-sm shadow-black hover:shadow-md hover:shadow-black rounded-4 transition-all bg-gray-100 hover:bg-white active:bg-gray-100"
              />
          </button>
        )}
      </div>
      <TextButton
        className="rounded-t-none text-lg ml-4 px-8 shadow-lg bg-secondary hover:bg-secondary-hover active:bg-secondary-active"
        onClick={handleClickOpenVrmFile}
      >
        Load .VRM
      </TextButton>
    </>
  );
}

function CharacterAnimationPage({
  viewer,
  animationUrl,
  setAnimationUrl,
  setSettingsUpdated,
}: {
  viewer: any; // TODO
  animationUrl: string;
  setAnimationUrl: (url: string) => void;
  setSettingsUpdated: (updated: boolean) => void;
}) {
  return basicPage(
    "Character Animation",
    "Select the animation to play",
    <ul role="list" className="divide-y divide-gray-100 max-w-xs">
      <li className="py-4">
        <FormRow label="Animation">
          <select
            value={animationUrl}
            className="mt-2 block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
            onChange={async (event: React.ChangeEvent<any>) => {
              event.preventDefault();
              const url = event.target.value;
              setAnimationUrl(url);
              updateConfig("animation_url", url);
              setSettingsUpdated(true);
              // @ts-ignore
              const vrma = await loadMixamoAnimation(url, viewer.model!.vrm);

              // @ts-ignore
              viewer.model!.loadAnimation(vrma);
            }}
          >
            {animationList.map((url) =>
              <option
                key={url}
                value={url}
              >
                {basename(url)}
              </option>
            )}
          </select>
        </FormRow>
      </li>
    </ul>
  );
}

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

  const [ttsBackend, setTTSBackend] = useState(config("tts_backend"));
  const [elevenlabsApiKey, setElevenlabsApiKey] = useState(config("elevenlabs_apikey"));
  const [elevenlabsVoiceId, setElevenlabsVoiceId] = useState(config("elevenlabs_voiceid"));

  const [speechT5SpeakerEmbeddingsUrl, setSpeechT5SpeakerEmbeddingsUrl] = useState(config("speecht5_speaker_embedding_url"));

  const [coquiUrl, setCoquiUrl] = useState(config("coqui_url"));
  const [coquiSpeakerId, setCoquiSpeakerId] = useState(config("coqui_speaker_id"));
  const [coquiStyleUrl, setCoquiStyleUrl] = useState(config("coqui_style_url"));

  const [bgUrl, setBgUrl] = useState(config("bg_url"));
  const [vrmUrl, setVrmUrl] = useState(config("vrm_url"));
  const [youtubeVideoID, setYoutubeVideoID] = useState(config("youtube_videoid"));
  const [animationUrl, setAnimationUrl] = useState(config("animation_url"));

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
    chatbotBackend, openAIApiKey, openAIUrl, openAIModel,
    llamaCppUrl,
    ttsBackend, elevenlabsApiKey, elevenlabsVoiceId,
    speechT5SpeakerEmbeddingsUrl,
    coquiUrl, coquiSpeakerId, coquiStyleUrl,
    bgUrl, vrmUrl, youtubeVideoID, animationUrl,
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
                console.log('prevPage', prevPage);

                setPage(prevPage.key);
                setBreadcrumbs(breadcrumbs.slice(0, -1));
              }}
            >
              <ArrowUturnLeftIcon className="h-5 w-5 flex-none text-white" aria-hidden="true" />
            </TextButton>

            {page === 'main_menu' && (
              <MenuPage
                keys={["appearance", "chatbot", "tts", "reset_settings", "community"]}
                menuClick={handleMenuClick} />
            )}

            {page === 'appearance' && (
              <MenuPage
                keys={["background_img", "background_video", "character_model", "character_animation"]}
                menuClick={handleMenuClick} />
            )}

            {page === 'chatbot' && (
              <MenuPage
                keys={["chatbot_backend", "system_prompt", "chatgpt_settings", "llamacpp_settings"]}
                menuClick={handleMenuClick} />
            )}

            {page === 'tts' && (
              <MenuPage
                keys={["tts_backend", "elevenlabs_settings", "speecht5_settings", "coqui_settings"]}
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
                coquiUrl={coquiUrl}
                setCoquiUrl={setCoquiUrl}
                coquiSpeakerId={coquiSpeakerId}
                setCoquiSpeakerId={setCoquiSpeakerId}
                coquiStyleUrl={coquiStyleUrl}
                setCoquiStyleUrl={setCoquiStyleUrl}
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
