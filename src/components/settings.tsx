import { GetStaticProps } from "next";
import React, { useCallback, useContext, useState, useRef } from "react";
import { ChevronRightIcon, HomeIcon } from '@heroicons/react/20/solid'


import { buildUrl } from "@/utils/buildUrl";
import { GitHubLink } from "@/components/githubLink";
import { IconButton } from "./iconButton";
import { TextButton } from "./textButton";
import { SecretTextInput } from "./secretTextInput";
import { TextInput } from "./textInput";
import { Message } from "@/features/messages/messages";
import { ViewerContext } from "@/features/vrmViewer/viewerContext";
import { loadMixamoAnimation } from "@/lib/VRMAnimation/loadMixamoAnimation";
import { Link } from "./link";
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
}


export const Settings = ({
  onClickClose,
}: {
    onClickClose: () => void;
}) => {
  const { viewer } = useContext(ViewerContext);

  const [page, setPage] = useState('main_menu');
  const [breadcrumbs, setBreadcrumbs] = useState<Link[]>([]);

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


  const fileInputRef = useRef<HTMLInputElement>(null);
  const handleClickOpenVrmFile = useCallback(() => {
    fileInputRef.current?.click();
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


  function pageWithMenu(keys: string[]) {
    const links = keysToLinks(keys);
    return (
      <ul role="list" className="divide-y divide-black/5">
        {links.map((link) => (
          <li
            key={link.key}
            className="relative flex items-center space-x-4 py-4 cursor-pointer bg-white hover:bg-grey-50 hover:opacity-95 p-4 transition-all"
            onClick={() => {
              setPage(link.key)
              setBreadcrumbs([...breadcrumbs, link]);
            }}
          >
            <div className="min-w-0 flex-auto">
              <div className="flex items-center gap-x-3">
                <h2 className="min-w-0 text-sm font-semibold leading-6">
                  <span className="whitespace-nowrap">{link.label}</span>
                </h2>
              </div>
            </div>
            <ChevronRightIcon className="h-5 w-5 flex-none text-gray-400" aria-hidden="true" />
          </li>
        ))}
      </ul>
    );  
  }

  function keysToLinks(keys: string[]): Link[] {
    const links: Link[] = [];
    for (const key of keys) {
      function getLabel(page: string) {
        switch(page) {
          case 'appearance': return 'Appearance';
          case 'chatbot': return 'ChatBot';
          case 'tts': return 'Text-to-Speech';
          case 'character': return 'Character';
          case 'reset_settings': return 'Reset Settings';
          case 'background_img': return 'Background Image';
          case 'background_video': return 'Background Video';
          case 'chatbot_backend': return 'ChatBot Backend';
          case 'chatgpt_settings': return 'ChatGPT Settings';
          case 'llaamcpp_settings': return 'LLama.cpp Settings';
          case 'tts_backend': return 'Text-to-Speech Backend';
          case 'elevenlabs_settings': return 'ElevenLabs Settings';
          case 'speecht5_settings': return 'SpeechT5 Settings';
          case 'coqui_settings': return 'Coqui TTS Settings';
          case 'system_prompt': return 'System Prompt';
          case 'character_model': return 'Character Model';
          case 'character_animation': return 'Character Animation';
          case 'reset_settings': return 'Reset Settings';

        }
        return 'Unknown';
      }

      links.push({
        key,
        label: getLabel(key),
      });
    }
    return links;
  }

  function pageMainMenu() {
    return pageWithMenu(["appearance", "chatbot", "tts", "character", "reset_settings"]);
  }

  function pageAppearance() {
    return pageWithMenu(["background_img", "background_video"]);
  }

  function pageChatbot() {
    return pageWithMenu(["chatbot_backend", "chatgpt_settings", "llamacpp_settings"]);
  }

  function pageTTS() {
    return pageWithMenu(["tts_backend", "elevenlabs_settings", "speecht5_settings", "coqui_settings"]);
  }

  function pageCharacter() {
    return pageWithMenu(["system_prompt", "character_model", "character_animation"]);
  }

  function pageResetSettings() {
    return (
      <>
        reset settings
      </>
    );
  }

  function pageBackgroundImg() {
    return (
      <>
        <div className="rounded-lg shadow bg-white flex flex-wrap justify-center space-x-4 space-y-4">
          { bgImages.map((url) =>
            <TextButton
              key={url}
              onClick={() => {
                document.body.style.backgroundImage = `url(${url})`;
                updateConfig("bg_url", url);
                setBgUrl(url);
              }}
              className={"mx-4 pt-0 pb-0 pl-0 pr-0 shadow-sm shadow-black hover:shadow-md hover:shadow-black rounded-4 transition-all " + (bgUrl === url ? "opacity-100 shadow-md" : "opacity-60 hover:opacity-100")}
              >
                <img
                  src={`${thumbPrefix(url)}`}
                  alt={url}
                  width="160"
                  height="93"
                  className="m-0 rounded-md"
                  onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = url;
                  }}
                />
            </TextButton>
          )}
        </div>
      </>
    );
  }

  function pageBackgroundVideo() {
    return (
      <>
        <div className="rounded-lg shadow bg-white p-4">
          <p>Select a background video. Copy this from youtube embed, it will look something like <code>kDCXBwzSI-4</code></p>

          <div className="mt-4">
            <label>Youtube Video ID: </label>
            <TextInput
              value={youtubeVideoID}
              onChange={(event: React.ChangeEvent<any>) => {
                const id = event.target.value.trim();
                setYoutubeVideoID(id);
                updateConfig("youtube_videoid", id);
              }}
              />
          </div>
        </div>
      </>
    );
  }

  function pageChatbotBackend() {
    return (
      <>
        <select
          className="mt-2 block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
          value={chatbotBackend}
          onChange={(event: React.ChangeEvent<any>) => {
            setChatbotBackend(event.target.value);
            updateConfig("chatbot_backend", event.target.value);
          }}
        >
          {chatbotBackends.map((engine) => (
            <option key={engine.key} value={engine.key}>{engine.label}</option>
          ))}
        </select>
      </>
    );
  }

  function getPage() {
    switch(page) {
      case 'main_menu':        return pageMainMenu();
      case 'appearance':       return pageAppearance();
      case 'chatbot':          return pageChatbot();
      case 'tts':              return pageTTS();
      case 'character':        return pageCharacter();
      case 'reset_settings':   return pageResetSettings();
      case 'background_img':   return pageBackgroundImg();
      case 'background_video': return pageBackgroundVideo();
      case 'chatbot_backend':  return pageChatbotBackend();

      default: return <>Unknown page</>;
    }
  }


  return (
    <div className="absolute top-0 left-0 w-screen max-h-screen text-black text-xs text-left z-20 overflow-y-auto backdrop-blur">
      <div className="fixed w-screen top-0 left-0 z-50 p-2 bg-white">
        <IconButton
          iconName="24/Close"
          isProcessing={false}
          className="bg-secondary hover:bg-secondary-hover active:bg-secondary-active"
          onClick={onClickClose} />

        <span className="font-bold text-xl ml-2">Settings</span>
      </div>
      <div className="h-screen overflow-auto opacity-90 backdrop-blur">
        <div className="mx-auto max-w-3xl px-24 py-16 text-text1 ">
          <nav className="flex" aria-label="Breadcrumb">
            <ol role="list" className="flex space-x-4 rounded-md bg-white px-6 shadow">
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
                    <svg
                      className="h-full w-6 flex-shrink-0 text-gray-200"
                      viewBox="0 0 24 44"
                      preserveAspectRatio="none"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path d="M.293 0l22 22-22 22h1.414l22-22-22-22H.293z" />
                    </svg>
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

          <div className="mt-16">
            {getPage()}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="absolute z-40 h-full w-full bg-white/80 backdrop-blur ">
      <div className="absolute m-2">
        <IconButton
          iconName="24/Close"
          isProcessing={false}
          className="bg-secondary hover:bg-secondary-hover active:bg-secondary-active"
          onClick={onClickClose} />
      </div>
      <div className="max-h-full overflow-auto">
        <div className="mx-auto max-w-3xl px-24 py-16 text-text1 ">
          <div className="my-2 font-bold text-4xl">
            Settings
          </div>

          <div className="my-2">
            <p className="mx-8 my-4 p-2 text-xs">Click this to reset all settings to default.</p>
            <TextButton
              onClick={() => {
                resetConfig();
                window.location.reload();
              }}
              className="mx-4 text-xs bg-secondary hover:bg-secondary-hover active:bg-secondary-active"
              >
              Reset All Settings
            </TextButton>
          </div>
            

          <div className="my-2">
            <div className="my-1 font-bold text-lg">
              Chatbot Backend
            </div>
            <div className="my-8">
            </div>
          </div>
          
          { chatbotBackend === 'chatgpt' && (
            <>
              <div className="my-2">
                <div className="my-1 font-bold typography-16">
                  OpenAI API Key
                </div>
                <SecretTextInput
                  value={openAIApiKey}
                  onChange={(event: React.ChangeEvent<any>) => {
                    setOpenAIApiKey(event.target.value);
                    updateConfig("openai_apikey", event.target.value);
                  }}
                />
              </div>
              <div className="my-2">
                <div className="my-1 font-bold typography-16">
                  OpenAI URL
                </div>
                <TextInput
                  value={openAIUrl}
                  onChange={(event: React.ChangeEvent<any>) => {
                    setOpenAIUrl(event.target.value);
                    updateConfig("openai_url", event.target.value);
                  }}
                />
              </div>
              <div className="my-2">
                <div className="my-1 font-bold typography-16">
                  OpenAI Model
                </div>
                <TextInput
                  value={openAIModel}
                  onChange={(event: React.ChangeEvent<any>) => {
                    setOpenAIModel(event.target.value);
                    updateConfig("openai_model", event.target.value);
                  }}
                />
              </div>
            </>
          )}

          { chatbotBackend === 'llamacpp' && (
            <>
              <div className="my-2">
                <div className="my-1 font-bold typography-16">
                  API URL
                </div>
                <p>This is the url of the llama.cpp server</p>
                <TextInput
                  value={llamaCppUrl}
                  onChange={(event: React.ChangeEvent<any>) => {
                    setLlamaCppUrl(event.target.value);
                    updateConfig("llamacpp_url", event.target.value);
                  }}
                />
              </div>
            </>
          )}

          <div className="my-2">
            <div className="my-1 font-bold typography-20">
              Text to Speech
            </div>
            <div className="my-8">
              {ttsEngines.map((engine) => (
                <TextButton
                  key={engine.key}
                  onClick={() => {
                    setTTSBackend(engine.key);
                    updateConfig("tts_backend", engine.key);
                  }}
                  className="mx-4"
                  disabled={ttsBackend === engine.key}
                  >
                  {engine.label}
                </TextButton>
              ))}
            </div>
          </div>

          { ttsBackend === 'elevenlabs' && (
            <>
              <div className="my-2">
                <div className="my-1 font-bold typography-16">
                  ElevenLabs API Key
                </div>
                <SecretTextInput
                  value={elevenlabsApiKey}
                  onChange={(event: React.ChangeEvent<any>) => {
                    setElevenlabsApiKey(event.target.value);
                    updateConfig("elevenlabs_apikey", event.target.value);
                  }}
                />
              </div>
              <div className="my-2">
                <div className="my-1 font-bold typography-16">
                  ElevenLabs Voice ID
                </div>
                <TextInput
                  value={elevenlabsVoiceId}
                  onChange={(event: React.ChangeEvent<any>) => {
                    setElevenlabsVoiceId(event.target.value);
                    updateConfig("elevenlabs_voiceid", event.target.value);
                  }}
                />
              </div>
            </>
          )}

          { ttsBackend === 'speecht5' && (
            <>
              <div className="my-2">
                <div className="my-1 font-bold typography-16">
                  SpeechT5 Speaker Embeddings URL
                </div>
                <p>Note: requires restart</p>
                <select
                  value={speechT5SpeakerEmbeddingsUrl}
                  onChange={(event: React.ChangeEvent<any>) => {
                    event.preventDefault();
                    setSpeechT5SpeakerEmbeddingsUrl(event.target.value);
                    updateConfig("speecht5_speaker_embedding_url", event.target.value);
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
              </div>
            </>
          )}
          { ttsBackend === 'coqui' && (
            <>
              <div className="my-2">
                <div className="my-1 font-bold typography-16">
                  Coqui Server URL
                </div>
                <TextInput
                  value={coquiUrl}
                  onChange={(event: React.ChangeEvent<any>) => {
                    event.preventDefault();
                    setCoquiUrl(event.target.value);
                    updateConfig("coqui_url", event.target.value);
                  }}
                />
              </div>
              <div className="my-2">
                <div className="my-1 font-bold typography-16">
                  Coqui Speaker Id
                </div>
                <TextInput
                  value={coquiSpeakerId}
                  onChange={(event: React.ChangeEvent<any>) => {
                    event.preventDefault();
                    setCoquiSpeakerId(event.target.value);
                    updateConfig("coqui_speaker_id", event.target.value);
                  }}
                />
              </div>
              <div className="my-2">
                <div className="my-1 font-bold typography-16">
                  Coqui Style URL
                </div>
                <TextInput
                  value={coquiStyleUrl}
                  onChange={(event: React.ChangeEvent<any>) => {
                    event.preventDefault();
                    setCoquiStyleUrl(event.target.value);
                    updateConfig("coqui_style_url", event.target.value);
                  }}
                />
              </div>
            </>
          )}

          <div className="my-2">
            <div className="my-1 font-bold typography-20">
              Background
            </div>
            <div className="my-8">
            </div>
          </div>

          <div className="my-2">
            <div className="my-1 font-bold typography-20">
              Background Video
            </div>
            <div className="my-8">
            </div>
          </div>

          <div className="my-40">
            <div className="my-1 font-bold typography-20">
              Character Model
            </div>
            <div className="my-8">
              {vrmList.map((url) =>
                <TextButton
                  key={url}
                  onClick={() => {
                    viewer.loadVrm(url);
                    updateConfig("vrm_url", url);
                    setVrmUrl(url);
                  }}
                  className={"mx-4 pt-0 pb-0 pl-0 pr-0 shadow-sm shadow-black hover:shadow-md hover:shadow-black rounded-4 transition-all " + (vrmUrl === url ? "opacity-100 shadow-md" : "opacity-60 hover:opacity-100")}
                  >
                    <img
                      src={`${thumbPrefix(url)}.jpg`}
                      alt={basename(url)}
                      width="160"
                      height="93"
                      className="m-0 rounded-4"
                      onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.style.backgroundColor = "gray";
                      }}
                  />
                </TextButton>
              )}
            </div>
            <div className="my-8">
              <TextButton onClick={handleClickOpenVrmFile}>
                Load .VRM
              </TextButton>
            </div>
          </div>

          <div className="my-40">
            <div className="my-1 font-bold typography-20">
              Character Animation
            </div>
            <div className="my-8">
              <select
                value={animationUrl}
                onChange={async (event: React.ChangeEvent<any>) => {
                  event.preventDefault();
                  const url = event.target.value;
                  setAnimationUrl(url);
                  updateConfig("animation_url", url);
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
            </div>
          </div>

          <div className="my-40">
            <div className="my-1 font-bold typography-20">
              System Prompt
            </div>
            <textarea
              value={systemPrompt}
              onChange={(e) => {
                setSystemPrompt(e.target.value);
                updateConfig("system_prompt", e.target.value);
              }}
              className="h-168 w-full  rounded-8 bg-surface1 px-16 py-8 hover:bg-surface1-hover"></textarea>
          </div>

          <div className="my-2">
            <GitHubLink />
          </div>

          <input
            type="file"
            className="hidden"
            accept=".vrm"
            ref={fileInputRef}
            onChange={handleChangeVrmFile}
          />
        </div>
      </div>
    </div>
  );
};
