import { createHash } from 'crypto';
import Link from 'next/link';
import { useContext, useState, useEffect, useRef } from 'react';
import { useTranslation, Trans } from 'react-i18next';

import { config, updateConfig } from '@/utils/config';
import { supabase } from '@/utils/supabase';
import { FilePond, registerPlugin } from 'react-filepond';
import { ViewerContext } from "@/features/vrmViewer/viewerContext";
import VrmDemo from "@/components/vrmDemo";
import { loadVRMAnimation } from "@/lib/VRMAnimation/loadVRMAnimation";


import FilePondPluginImagePreview from 'filepond-plugin-image-preview';
import FilePondPluginFileValidateType from 'filepond-plugin-file-validate-type';

import 'filepond/dist/filepond.min.css';
import 'filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css';

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

export default function Share() {
  const { t } = useTranslation();
  const { viewer } = useContext(ViewerContext);

  const [name, setName] = useState('');
  const [systemPrompt, setSystemPrompt] = useState('');
  const [visionSystemPrompt, setVisionSystemPrompt] = useState('');
  const [bgUrl, setBgUrl] = useState('');
  const [youtubeVideoId, setYoutubeVideoId] = useState('');
  const [vrmUrl, setVrmUrl] = useState('');
  const [animationUrl, setAnimationUrl] = useState('');
  const [voiceUrl, setVoiceUrl] = useState('');

  const [bgFiles, setBgFiles] = useState([]);
  const [vrmFiles, setVrmFiles] = useState([]);
  const [animationFiles, setAnimationFiles] = useState([]);
  const [voiceFiles, setVoiceFiles] = useState([]);

  const [vrmLoaded, setVrmLoaded] = useState(false);

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

  const [isRegistering, setIsRegistering] = useState(false);
  function registerCharacter() {
    setIsRegistering(true);

    async function register() {
      const res = await fetch(`${process.env.NEXT_PUBLIC_AMICA_API_URL}/api/add_character`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
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

      window.location.href = `/import/${data.sqid}`;

      setIsRegistering(false);
    }

    register();
  }

  return (
    <div className="p-4 md:p-20">
      <style jsx global>
      {`
        body {
          background-image: url('/liquid-metaballs.jpg');
          background-size: cover;
          background-repeat: no-repeat;
          background-position: bottom right;
        }
      `}
      </style>

      <div className="col-span-3 max-w-md rounded-xl mt-4">
        <h1 className="text-lg">Character Creator</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <div className="sm:col-span-3 max-w-md rounded-xl mt-4">
            <label className="block text-sm font-medium leading-6 text-gray-900">
              {t("Name")}
            </label>
            <div className="mt-2">
              <input
                type="text"
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                value={name}
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
              />
            </div>
          </div>

          <div className="sm:col-span-3 max-w-md rounded-xl mt-4">
            <label className="block text-sm font-medium leading-6 text-gray-900">
              Voice Url
            </label>
            <div className="mt-2">
              <input
                type="text"
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                value={voiceUrl}
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
              />
            </div>
          </div>
          */}

          <div className="sm:col-span-3 max-w-md rounded-xl mt-8">
            <button
              onClick={registerCharacter}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-fuchsia-500 hover:bg-fuchsia-600 focus:outline-none disabled:opacity-50 disabled:hover:bg-fuchsia-500 disabled:cursor-not-allowed"
              disabled={!vrmLoaded || isRegistering}
            >
              {t("Save Character")}
            </button>
          </div>
        </div>
        <div>
          {/* empty column */}
        </div>
      </div>
    </div>
  );
}
