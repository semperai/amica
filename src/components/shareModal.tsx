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
    ArrowUturnLeftIcon,
    XMarkIcon,
  } from '@heroicons/react/20/solid';
  
  import { CheckCircleIcon } from '@heroicons/react/24/outline';
  
  import { useKeyboardShortcut } from "@/hooks/useKeyboardShortcut";
  import { IconButton } from "@/components/iconButton";
  import { TextButton } from "@/components/textButton";
  import { ViewerContext } from "@/features/vrmViewer/viewerContext";
  import { config, updateConfig } from "@/utils/config";

  import { FilePond, registerPlugin } from 'react-filepond';
    import { createHash } from 'crypto';

    import FilePondPluginImagePreview from 'filepond-plugin-image-preview';
    import FilePondPluginFileValidateType from 'filepond-plugin-file-validate-type';
    import VrmDemo from "@/components/vrmDemo";
    import { loadVRMAnimation } from "@/lib/VRMAnimation/loadVRMAnimation";

    import 'filepond/dist/filepond.min.css';
    import 'filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css';
  
  
  import { CustomLink } from "./settings/common";
import isTauri from "@/utils/isTauri";
import { t } from "i18next";
import Link from "next/dist/client/link";

  registerPlugin(
    FilePondPluginImagePreview,
    FilePondPluginFileValidateType,
  );
  
  async function hashFile(file: File): Promise<string> {
    const buffer = await file.arrayBuffer();
    const hashValue = createHash('sha256')
      .update(Buffer.from(buffer))
      .digest('hex');
    return hashValue;
  }
  
  async function updateVrmAvatar(viewer: any, url: string) {
    try {
      await viewer.loadVrm(url);
    } catch (e) {
      console.error(e);
    }
  }
  
  function vrmDetector(source: File, type: string): Promise<string> {
    return new Promise((resolve, reject) => {
      console.log(source);
      (async () => {
        const ab = await source.arrayBuffer();
        const buf = Buffer.from(ab);
        if (buf.slice(0, 4).toString() === "glTF") {
          resolve("model/gltf-binary");
        } else {
          resolve("unknown");
        }
      })();
    })
  }
  
  export const ShareModal = ({

    onClickClose,
  }: {
    onClickClose: () => void;
  }) => {
    const { viewer } = useContext(ViewerContext);
    useKeyboardShortcut("Escape", onClickClose);
  
    const [page, setPage] = useState('main_menu');
    const [breadcrumbs, setBreadcrumbs] = useState<CustomLink[]>([]);
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
  
    const [bgColor, setBgColor] = useState(config("bg_color"));
    const [youtubeVideoID, setYoutubeVideoID] = useState(config("youtube_videoid"));
  
    const [sttBackend, setSTTBackend] = useState(config("stt_backend"));
    const [whisperOpenAIUrl, setWhisperOpenAIUrl] = useState(config("openai_whisper_url"));
    const [whisperOpenAIApiKey, setWhisperOpenAIApiKey] = useState(config("openai_whisper_apikey"));
    const [whisperOpenAIModel, setWhisperOpenAIModel] = useState(config("openai_whisper_model"));
    const [whisperCppUrl, setWhisperCppUrl] = useState(config("whispercpp_url"));
  
    const [name, setName] = useState(config("name"));
    const [systemPrompt, setSystemPrompt] = useState(config("system_prompt"));
    const [description, setDescription] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [visionSystemPrompt, setVisionSystemPrompt] = useState('');
  const [bgUrl, setBgUrl] = useState('');
  const [youtubeVideoId, setYoutubeVideoId] = useState('');
  const [voiceUrl, setVoiceUrl] = useState('');

  const [bgFiles, setBgFiles] = useState([]);
  const [vrmFiles, setVrmFiles] = useState([]);
  const [animationFiles, setAnimationFiles] = useState([]);
  const [voiceFiles, setVoiceFiles] = useState([]);
  const [vrmUrl, setVrmUrl] = useState('');
  const [animationUrl, setAnimationUrl] = useState('');

  const [vrmLoaded, setVrmLoaded] = useState(false);

  const [sqid, setSqid] = useState('');

  useEffect(() => {
    setName(config('name'));
    setSystemPrompt(config('system_prompt'));
    setVisionSystemPrompt(config('vision_system_prompt'));
    if (! config('bg_url').startsWith('data')) {
      setBgUrl(config('bg_url'));
    }
    setYoutubeVideoId(config('youtube_videoid'));
    setVrmUrl(config('vrm_url'));
    setAnimationUrl(config('animation_url'));
    setVoiceUrl(config('voice_url'));
  }, []);

  function registerCharacter() {
    setIsRegistering(true);

    async function register() {
      const res = await fetch(`${process.env.NEXT_PUBLIC_AMICA_API_URL}/api/add_character`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          description,
          name,
          system_prompt: systemPrompt,
          vision_system_prompt: visionSystemPrompt,
          bg_url: bgUrl,
          youtube_videoid: youtubeVideoId,
          vrm_url: vrmUrl,
          animation_url: animationUrl,
          voice_url: voiceUrl,
        }),
      });

      const data = await res.json();
      console.log('response', data);

      setSqid(data.sqid);

      setIsRegistering(false);
    }

    register();
  }
  
  
    const vrmFileInputRef = useRef<HTMLInputElement>(null);
    const handleClickOpenVrmFile = useCallback(() => {
      vrmFileInputRef.current?.click();
    }, []);
  
    const bgImgFileInputRef = useRef<HTMLInputElement>(null);
    const handleClickOpenBgImgFile = useCallback(() => {
      bgImgFileInputRef.current?.click();
    }, []);
  
  
  
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
  
  
    function renderPage() {
      return (
        <div className="bg-white flex-col justify-center p-7 rounded-xl">
            <div className="col-span-3 max-w-md rounded-xl mt-4 bg-white">
              <h1 className="text-lg">{t("Character Creator")}</h1>
              { isTauri() && (
                <p className="text-sm mt-2">
                  {t("Wrong place?")}
                  {' '}
                  <Link href="/" className="text-cyan-600 hover:text-cyan-700">{t('Go home')}</Link>
                </p>
              ) }
            </div>

            <div className="flex justify-center">
              <div>
                <div className="sm:col-span-3 max-w-md rounded-xl mt-4">
                  <label className="block text-sm font-medium leading-6 text-gray-900">
                    {t("Description")}
                  </label>
                  <div className="mt-2">
                    <textarea
                      rows={4}
                      className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                      value={description}
                      readOnly={!! sqid}
                      placeholder={t("Provide a description of the character")}
                      onChange={(e) => {
                        setDescription(e.target.value);
                      }}
                    />
                  </div>
                </div>

                <div className="sm:col-span-3 max-w-md rounded-xl mt-4">
                  <label className="block text-sm font-medium leading-6 text-gray-900">
                    {t("Name")}
                  </label>
                  <div className="mt-2">
                    <input
                      type="text"
                      className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                      value={name}
                      readOnly={!! sqid}
                      onChange={(e) => {
                        setName(e.target.value);
                      }}
                    />
                  </div>
                </div>

                <div className="sm:col-span-3 max-w-md rounded-xl mt-4">
                  <label className="block text-sm font-medium leading-6 text-gray-900">
                    {t("System Prompt")}
                  </label>
                  <div className="mt-2">
                    <textarea
                      rows={4}
                      className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                      value={systemPrompt}
                      readOnly={!! sqid}
                      onChange={(e) => {
                        setSystemPrompt(e.target.value);
                      }}
                    />
                  </div>
                </div>

                <div className="sm:col-span-3 max-w-md rounded-xl mt-4">
                  <label className="block text-sm font-medium leading-6 text-gray-900">
                    {t("Vision System Prompt")}
                  </label>
                  <div className="mt-2">
                    <textarea
                      rows={4}
                      className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                      value={visionSystemPrompt}
                      readOnly={!! sqid}
                      onChange={(e) => {
                        setVisionSystemPrompt(e.target.value);
                      }}
                    />
                  </div>
                </div>

                <div className="sm:col-span-3 max-w-md rounded-xl mt-4">
                  <label className="block text-sm font-medium leading-6 text-gray-900">
                    {t("Background URL")}
                  </label>
                  <div className="mt-2">
                    <input
                      type="text"
                      className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                      value={bgUrl}
                      readOnly={!! sqid}
                      onChange={(e) => {
                        setBgUrl(e.target.value);
                      }}
                    />
                    <FilePond
                      files={bgFiles}
                      // this is done to remove type error
                      // filepond is not typed properly
                      onupdatefiles={(files: any) => {
                        setBgFiles(files);
                      }}
                      server={`${process.env.NEXT_PUBLIC_AMICA_API_URL}/api/upload?type=bgimg`}
                      name="file"
                      labelIdle='.png & .jpg files only<br />click or drag & drop'
                      acceptedFileTypes={['image/png', 'image/jpeg']}
                      onremovefile={(err, file) => {
                        if (err) {
                          console.error(err);
                          return;
                        }

                        setBgUrl('');
                      }}
                      onprocessfile={(err, file) => {
                        if (err) {
                          console.error(err);
                          return;
                        }

                        async function handleFile(file: File) {
                          const hashValue = await hashFile(file);
                          setBgUrl(`${process.env.NEXT_PUBLIC_AMICA_STORAGE_URL}/${hashValue}`);
                        }

                        handleFile(file.file as File);
                      }}
                      disabled={!! sqid}
                    />
                  </div>
                </div>

                <div className="sm:col-span-3 max-w-md rounded-xl mt-4">
                  <label className="block text-sm font-medium leading-6 text-gray-900">
                    {t("YouTube Video ID")}
                  </label>
                  <div className="mt-2">
                    <p className="text-xs text-slate-500">{t("Example")}: https://www.youtube.com/watch?v=<span className="text-red-500">dQw4w9WgXcQ</span></p>
                    <input
                      type="text"
                      className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                      value={youtubeVideoId}
                      readOnly={!! sqid}
                      onChange={(e) => {
                        setYoutubeVideoId(e.target.value);
                      }}
                    />
                    {youtubeVideoId && (
                      <img width="100%" src={`https://img.youtube.com/vi/${youtubeVideoId}/0.jpg`} />
                    )}
                  </div>
                </div>

                <div className="sm:col-span-3 max-w-md rounded-xl mt-4">
                  <label className="block text-sm font-medium leading-6 text-gray-900">
                    {t("VRM Url")}
                  </label>
                  <div className="mt-2">
                    <p className="text-xs text-slate-500"></p>
                    <input
                      type="text"
                      className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                      value={vrmUrl}
                      readOnly={!! sqid}
                      onChange={(e) => {
                        setVrmUrl(e.target.value);
                        updateVrmAvatar(viewer, e.target.value);
                        setVrmLoaded(false);
                      }}
                    />
                    <FilePond
                      files={vrmFiles}
                      // this is done to remove type error
                      // filepond is not typed properly
                      onupdatefiles={(files: any) => {
                        setVrmFiles(files);
                      }}
                      server={`${process.env.NEXT_PUBLIC_AMICA_API_URL}/api/upload?type=vrm`}
                      name="file"
                      labelIdle='.vrm files only<br />click or drag & drop'
                      acceptedFileTypes={['model/gltf-binary']}
                      fileValidateTypeDetectType={vrmDetector}
                      onaddfilestart={(file) => {
                        setVrmUrl('');
                        setVrmLoaded(false);
                      }}
                      onremovefile={(err, file) => {
                        if (err) {
                          console.error(err);
                          return;
                        }

                        setVrmUrl('');
                        setVrmLoaded(false);
                      }}
                      onprocessfile={(err, file) => {
                        if (err) {
                          console.error(err);
                          return;
                        }

                        async function handleFile(file: File) {
                          const hashValue = await hashFile(file);
                          const url = `${process.env.NEXT_PUBLIC_AMICA_STORAGE_URL}/${hashValue}`;
                          setVrmUrl(url);
                          updateVrmAvatar(viewer, url);
                          setVrmLoaded(false);
                        }

                        handleFile(file.file as File);
                      }}
                      disabled={!! sqid}
                    />

                    <div className="sm:col-span-3 max-w-md rounded-xl mt-4 bg-gray-100">
                      {vrmUrl && (
                        <VrmDemo
                          vrmUrl={vrmUrl}
                          onLoaded={() => {
                            setVrmLoaded(true);
                            (async () => {
                              try {
                                const animation = await loadVRMAnimation("/animations/idle_loop.vrma");
                                if (! animation) {
                                  console.error('loading animation failed');
                                  return;
                                }
                                viewer.model!.loadAnimation(animation!);
                                requestAnimationFrame(() => {
                                  viewer.resetCamera()
                                });
                              } catch (e) {
                                console.error('loading animation failed', e);
                              }
                            })();
                            console.log('vrm demo loaded');
                          }}
                        />
                      )}
                    </div>
                  </div>
                </div>

                {/*
                <div className="sm:col-span-3 max-w-md rounded-xl mt-4">
                  <label className="block text-sm font-medium leading-6 text-gray-900">
                    Animation Url
                  </label>
                  <div className="mt-2">
                    <input
                      type="text"
                      className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                      value={animationUrl}
                      readOnly={!! sqid}
                      onChange={(e) => {
                        setAnimationUrl(e.target.value);
                      }}
                    />
                    <FilePond
                      files={animationFiles}
                      // this is done to remove type error
                      // filepond is not typed properly
                      onupdatefiles={(files: any) => {
                        setAnimationFiles(files);
                      }}
                      // TODO read this url from env
                      server={`${process.env.NEXT_PUBLIC_AMICA_API_URL}/api/upload?type=anim`}
                      name="file"
                      labelIdle='.vrm files only<br />click or drag & drop'
                      acceptedFileTypes={['model/gltf-binary']}
                      fileValidateTypeDetectType={vrmDetector}
                      onremovefile={(err, file) => {
                        if (err) {
                          console.error(err);
                          return;
                        }

                        setAnimationUrl('');
                      }}
                      onprocessfile={(err, file) => {
                        if (err) {
                          console.error(err);
                          return;
                        }

                        async function handleFile(file: File) {
                          const hashValue = await hashFile(file);
                          setAnimationUrl(`${process.env.NEXT_PUBLIC_AMICA_STORAGE_URL}/${hashValue}`);
                        }

                        handleFile(file.file as File);
                      }}
                      disabled={!! sqid}
                    />
                  </div>
                </div>
                */}

                <div className="sm:col-span-3 max-w-md rounded-xl mt-4">
                  <label className="block text-sm font-medium leading-6 text-gray-900">
                    Voice Url
                  </label>
                  <div className="mt-2">
                    <input
                      type="text"
                      className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                      value={voiceUrl}
                      readOnly={!! sqid}
                      onChange={(e) => {
                        setVoiceUrl(e.target.value);
                      }}
                    />
                    <FilePond
                      files={voiceFiles}
                      // this is done to remove type error
                      // filepond is not typed properly
                      onupdatefiles={(files: any) => {
                        setVoiceFiles(files);
                      }}
                      server={`${process.env.NEXT_PUBLIC_AMICA_API_URL}/api/upload?type=voice`}
                      name="file"
                      labelIdle='.wav & .mp3 files only<br />click or drag & drop'
                      acceptedFileTypes={['audio/wav', 'audio/mpeg']}
                      onremovefile={(err, file) => {
                        if (err) {
                          console.error(err);
                          return;
                        }

                        setVoiceUrl('');
                      }}
                      onprocessfile={(err, file) => {
                        if (err) {
                          console.error(err);
                          return;
                        }

                        async function handleFile(file: File) {
                          const hashValue = await hashFile(file);
                          setVoiceUrl(`${process.env.NEXT_PUBLIC_AMICA_STORAGE_URL}/${hashValue}`);
                        }

                        handleFile(file.file as File);
                      }}
                      disabled={!! sqid}
                    />
                  </div>
                </div>

                {! sqid && (
                  <div className="sm:col-span-3 max-w-md rounded-xl mt-8">
                    <button
                      onClick={registerCharacter}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-fuchsia-500 hover:bg-fuchsia-600 focus:outline-none disabled:opacity-50 disabled:hover:bg-fuchsia-500 disabled:cursor-not-allowed"
                      disabled={!vrmLoaded || isRegistering}
                    >
                      {t("Save Character")}
                    </button>
                  </div>
                )}

                {sqid && (
                  <div className="sm:col-span-3 max-w-md rounded-xl mt-8">
                    <p className="text-sm">{t("Share this code (click to copy):")}</p>
                    <input
                      type="text"
                      className="inline-flex items-center px-2 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-fuchsia-600 bg-fuchsia-100 hover:bg-fuchsia-200 focus:outline-transparent focus:border-transparent border-transparent disabled:opacity-50 disabled:hover:bg-fuchsia-50 disabled:cursor-not-allowed hover:cursor-copy"
                      defaultValue={sqid}
                      readOnly
                      onClick={(e) => {
                        // @ts-ignore
                        navigator.clipboard.writeText(e.target.value);
                      }}
                    />
                    <p className="mt-6 text-sm">
                      {t("Or, you can share this direct link:")}
                      {' '}
                      <Link
                        href={`https://amica.arbius.ai/import/${sqid}`}
                        target={isTauri() ? "_blank" : ''}
                        className="text-cyan-600 hover:text-cyan-700"
                      >
                        https://amica.arbius.ai/import/{sqid}
                      </Link>
                    </p>

                      <button
                        className="mt-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-emerald-500 hover:bg-emerald-600 focus:outline-none disabled:opacity-50 disabled:hover:bg-emerald-500 disabled:cursor-not-allowed"
                      onClick={onClickClose}>
                        {t("Return Home")}
                      </button>
                  </div>
                )}
              </div>
            </div>
          </div>
      );
    }
  
    return (
      <div className="fixed top-0 left-0 w-full max-h-full text-black text-xs text-left z-20 overflow-y-auto backdrop-blur">
        <div
          className="absolute top-0 left-0 w-full h-full bg-violet-700 opacity-10 z-index-50"
        ></div>
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
      </div>
    );
  };