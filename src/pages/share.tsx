import { createHash } from 'crypto';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { config, updateConfig } from '@/utils/config';
import { supabase } from '@/utils/supabase';
import { FilePond, registerPlugin } from 'react-filepond';


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

export default function Share() {
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

  useEffect(() => {
    setSystemPrompt(config('system_prompt'));
    setVisionSystemPrompt(config('vision_system_prompt'));
    setBgUrl(config('bg_url'));
    setYoutubeVideoId(config('youtube_videoid'));
    setVrmUrl(config('vrm_url'));
    setAnimationUrl(config('animation_url'));
  }, []);

  const c = (s: string) => encodeURIComponent(s.trim());
  const importUrl = `https://amica.arbius.ai/import?system_prompt=${c(systemPrompt)}&vision_system_prompt=${c(visionSystemPrompt)}&bg_url=${c(bgUrl)}&youtube_videoid=${c(youtubeVideoId)}&vrm_url=${c(vrmUrl)}&animation_url=${c(animationUrl)}`;

  function onClickCopy() {
    navigator.clipboard.writeText(importUrl);
  }


  return (
    <div className="p-20">
      <div className="sm:col-span-3 max-w-xs rounded-xl mt-4">
        <h1 className="text-lg">Character Creator</h1>
      </div>
      <div className="sm:col-span-3 max-w-xs rounded-xl mt-4">
        <label className="block text-sm font-medium leading-6 text-gray-900">
          System Prompt
        </label>
        <div className="mt-2">
          <textarea
            rows={4}
            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
            defaultValue={systemPrompt}
            onChange={(e) => {
              setSystemPrompt(e.target.value);
            }}
          />
        </div>
      </div>

      <div className="sm:col-span-3 max-w-xs rounded-xl mt-4">
        <label className="block text-sm font-medium leading-6 text-gray-900">
          Vision System Prompt
        </label>
        <div className="mt-2">
          <textarea
            rows={4}
            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
            defaultValue={visionSystemPrompt}
            onChange={(e) => {
              setVisionSystemPrompt(e.target.value);
            }}
          />
        </div>
      </div>

      <div className="sm:col-span-3 max-w-xs rounded-xl mt-4">
        <label className="block text-sm font-medium leading-6 text-gray-900">
          Background Url
        </label>
        <div className="mt-2">
          <input
            type="text"
            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
            defaultValue={bgUrl}
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

      <div className="sm:col-span-3 max-w-xs rounded-xl mt-4">
        <label className="block text-sm font-medium leading-6 text-gray-900">
          Youtube Video Id
        </label>
        <div className="mt-2">
          <input
            type="text"
            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
            defaultValue={youtubeVideoId}
            onChange={(e) => {
              setYoutubeVideoId(e.target.value);
            }}
          />
        </div>
      </div>

      <div className="sm:col-span-3 max-w-xs rounded-xl mt-4">
        <label className="block text-sm font-medium leading-6 text-gray-900">
          VRM Url
        </label>
        <div className="mt-2">
          <input
            type="text"
            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
            defaultValue={vrmUrl}
            onChange={(e) => {
              setVrmUrl(e.target.value);
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
            onremovefile={(err, file) => {
              if (err) {
                console.error(err);
                return;
              }

              setVrmUrl('');
            }}
            onprocessfile={(err, file) => {
              if (err) {
                console.error(err);
                return;
              }

              async function handleFile(file: File) {
                const hashValue = await hashFile(file);
                setVrmUrl(`${process.env.NEXT_PUBLIC_AMICA_STORAGE_URL}/${hashValue}`);
              }

              handleFile(file.file as File);
            }}
          />
        </div>
      </div>

      <div className="sm:col-span-3 max-w-xs rounded-xl mt-4">
        <label className="block text-sm font-medium leading-6 text-gray-900">
          Animation Url
        </label>
        <div className="mt-2">
          <input
            type="text"
            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
            defaultValue={animationUrl}
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

      <div className="sm:col-span-3 max-w-xs rounded-xl mt-4">
        <label className="block text-sm font-medium leading-6 text-gray-900">
          Voice Url
        </label>
        <div className="mt-2">
          <input
            type="text"
            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
            defaultValue={voiceUrl}
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

      <div className="sm:col-span-3 max-w-xs rounded-xl mt-8">
        <button onClick={onClickCopy} className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-fuchsia-500 hover:bg-fuchsia-600 focus:outline-none">
          Copy URL
        </button>

        <Link href={importUrl} target="_blank">
          <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-cyan-400 hover:bg-cyan-500 focus:outline-none ml-2">
            Preview
          </button>
        </Link>

        <div className="mt-2 font-mono break-words">
          {importUrl}
        </div>
      </div>
    </div>
  );
}
