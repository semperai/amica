import Link from 'next/link';
import { useRouter } from 'next/router'
import { useState, useEffect } from 'react';
import { updateConfig } from '@/utils/config';

export default function Import() {
  const router = useRouter();

  const {
    system_prompt,
    vision_system_prompt,
    bg_url,
    youtube_videoid,
    vrm_url,
    animation_url,
  } = router.query;

  const [systemPrompt, setSystemPrompt] = useState('');
  const [visionSystemPrompt, setVisionSystemPrompt] = useState('');
  const [bgUrl, setBgUrl] = useState('');
  const [youtubeVideoId, setYoutubeVideoId] = useState('');
  const [vrmUrl, setVrmUrl] = useState('');
  const [animationUrl, setAnimationUrl] = useState('');

  const [buttonDisabled, setButtonDisabled] = useState(false);

  useEffect(() => {
    if (system_prompt) {
      setSystemPrompt(system_prompt as string);
    }
    if (vision_system_prompt) { 
      setVisionSystemPrompt(vision_system_prompt as string);
    }
    if (bg_url) {
      setBgUrl(bg_url as string);
    }
    if (youtube_videoid) {
      setYoutubeVideoId(youtube_videoid as string);
    }
    if (vrm_url) {
      setVrmUrl(vrm_url as string);
    }
    if (animation_url) {
      setAnimationUrl(animation_url as string);
    }
  }, [
    system_prompt,
    vision_system_prompt,
    bg_url,
    youtube_videoid,
    vrm_url,
    animation_url
  ]);


  function overrideConfig() {
    if (system_prompt) {
      updateConfig('system_prompt', system_prompt as string);
    }

    if (vision_system_prompt) {
      updateConfig('vision_system_prompt', vision_system_prompt as string);
    }

    if (bg_url) {
      updateConfig('bg_url', bg_url as string);
    }

    if (youtube_videoid) {
      updateConfig('youtube_videoid', youtube_videoid as string);
    }

    if (vrm_url) {
      updateConfig('vrm_url', vrm_url as string);
    }

    if (animation_url) {
      updateConfig('animation_url', animation_url as string);
    }
  }

  return (
    <div className="p-20">
      <div className="sm:col-span-3 max-w-xs rounded-xl mt-4">
        <h1 className="text-lg">Import Character</h1>
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
        </div>
      </div>

      <div className="sm:col-span-3 max-w-xs rounded-xl mt-8">
        <button
          onClick={() => {
            overrideConfig();
            window.location.href = '/';
            setButtonDisabled(true);
          }}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-emerald-400 hover:bg-emerald-500 focus:outline-none ml-2"
          disabled={buttonDisabled}
        >
          Apply
        </button>

      </div>
    </div>
  );
}
