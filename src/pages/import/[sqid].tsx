import { useContext, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { updateConfig, defaultConfig } from '@/utils/config';
import { ViewerContext } from "@/features/vrmViewer/viewerContext";
import VrmDemo from "@/components/vrmDemo";
import { supabase } from '@/utils/supabase';

export default function Import() {
  const { viewer } = useContext(ViewerContext);
  const router = useRouter()

  const [name, setName] = useState('');
  const [systemPrompt, setSystemPrompt] = useState('');
  const [visionSystemPrompt, setVisionSystemPrompt] = useState('');
  const [bgUrl, setBgUrl] = useState('');
  const [youtubeVideoId, setYoutubeVideoId] = useState('');
  const [vrmUrl, setVrmUrl] = useState('');
  const [animationUrl, setAnimationUrl] = useState('');
  const [voiceUrl, setVoiceUrl] = useState('');

  const [buttonDisabled, setButtonDisabled] = useState(false);

  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    async function getCharacter() {
      console.log('sqid', router.query.sqid);


      const { data, error } = await supabase
        .from('characters')
        .select(`name, system_prompt, vision_system_prompt, bg_url, youtube_videoid, vrm_url, animation_url, voice_url`)
        .eq('sqid', router.query.sqid)
        .single();

      if (error) {
        console.error(error);
      }

      if (! data) {
        return;
      }

      const {
        name,
        system_prompt,
        vision_system_prompt,
        bg_url,
        youtube_videoid,
        vrm_url,
        animation_url,
        voice_url,
      } = data;

      setName(name as string);
      setSystemPrompt(system_prompt as string);
      setVisionSystemPrompt(vision_system_prompt as string);
      setBgUrl(bg_url as string);
      setYoutubeVideoId(youtube_videoid as string);
      setVrmUrl(vrm_url as string);
      setAnimationUrl(animation_url as string);
      setVoiceUrl(voice_url as string);

      setLoaded(true);
    }

    getCharacter();
  }, [router]);


  function overrideConfig() {
    if (name) {
      updateConfig('name', name as string);
    } else {
      updateConfig('name', defaultConfig('name'));
    }

    if (systemPrompt) {
      updateConfig('system_prompt', systemPrompt as string);
    } else {
      updateConfig('system_prompt', defaultConfig('system_prompt'));
    }

    if (visionSystemPrompt) {
      updateConfig('vision_system_prompt', visionSystemPrompt as string);
    } else {
      updateConfig('vision_system_prompt', defaultConfig('vision_system_prompt'));
    }

    if (bgUrl) {
      updateConfig('bg_url', bgUrl as string);
    } else {
      updateConfig('bg_url', defaultConfig('bg_url'));
    }

    if (youtubeVideoId) {
      updateConfig('youtube_videoid', youtubeVideoId as string);
    } else {
      updateConfig('youtube_videoid', defaultConfig('youtube_videoid'));
    }

    if (vrmUrl) {
      updateConfig('vrm_url', vrmUrl as string);
    } else {
      updateConfig('vrm_url', defaultConfig('vrm_url'));
    }

    if (animationUrl) {
      updateConfig('animation_url', animationUrl as string);
    } else {
      updateConfig('animation_url', defaultConfig('animation_url'));
    }

    if (voiceUrl) {
      updateConfig('voice_url', voiceUrl as string);
    } else {
      updateConfig('voice_url', defaultConfig('voice_url'));
    }
  }

  return (
    <div className="p-20">
      <div className="sm:col-span-3 max-w-xs rounded-xl mt-4">
        <h1 className="text-lg">Import {loaded ? (name || 'Amica') : '...'}</h1>
      </div>

      { name != defaultConfig('name') && (
        <div className="sm:col-span-3 max-w-xs rounded-xl mt-4">
          <label className="block text-sm font-medium leading-6 text-gray-900">
            Name
          </label>
          <div className="mt-2">
            <input
              type="text"
              className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              defaultValue={name}
              disabled={true}
            />
          </div>
        </div>
      )}

      {systemPrompt && systemPrompt != defaultConfig('system_prompt') && (
        <div className="sm:col-span-3 max-w-xs rounded-xl mt-4">
          <label className="block text-sm font-medium leading-6 text-gray-900">
            System Prompt
          </label>
          <div className="mt-2">
            <textarea
              rows={4}
              className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              defaultValue={systemPrompt}
              disabled={true}
            />
          </div>
        </div>
      )}

      {visionSystemPrompt && visionSystemPrompt != defaultConfig('vision_system_prompt') && (
        <div className="sm:col-span-3 max-w-xs rounded-xl mt-4">
          <label className="block text-sm font-medium leading-6 text-gray-900">
            Vision System Prompt
          </label>
          <div className="mt-2">
            <textarea
              rows={4}
              className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              defaultValue={visionSystemPrompt}
              disabled={true}
            />
          </div>
        </div>
      )}

      {bgUrl && bgUrl != defaultConfig('bg_url') && (
        <div className="sm:col-span-3 max-w-xs rounded-xl mt-4">
          <label className="block text-sm font-medium leading-6 text-gray-900">
            Background Url
          </label>
          <div className="mt-2">
            <input
              type="text"
              className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              defaultValue={bgUrl}
              disabled={true}
            />
            <img src={bgUrl} className="mt-2" />
          </div>
        </div>
      )}

      {youtubeVideoId && youtubeVideoId != defaultConfig('youtube_videoid') && (
        <div className="sm:col-span-3 max-w-xs rounded-xl mt-4">
          <label className="block text-sm font-medium leading-6 text-gray-900">
            Youtube Video Id
          </label>
          <div className="mt-2">
            <input
              type="text"
              className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              defaultValue={youtubeVideoId}
              disabled={true}
            />
          </div>
          <iframe width="100%" src={`https://www.youtube.com/embed/${youtubeVideoId}`} title="YouTube video player" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen />
        </div>
      )}

      {vrmUrl && vrmUrl != defaultConfig('vrm_url') && (
        <div className="sm:col-span-3 max-w-xs rounded-xl mt-4">
          <label className="block text-sm font-medium leading-6 text-gray-900">
            VRM Url
          </label>
          <div className="mt-2">
            <input
              type="text"
              className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              defaultValue={vrmUrl}
              disabled={true}
            />
          </div>
        </div>
      )}

      {animationUrl && animationUrl != defaultConfig('animation_url') && (
        <div className="sm:col-span-3 max-w-xs rounded-xl mt-4">
          <label className="block text-sm font-medium leading-6 text-gray-900">
            Animation Url
          </label>
          <div className="mt-2">
            <input
              type="text"
              className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              defaultValue={animationUrl}
              disabled={true}
            />
          </div>
        </div>
      )}

      {loaded && (
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
      )}
      {! loaded && (
        <div className="sm:col-span-3 max-w-xs rounded-xl mt-8">
          loading...
        </div>
      )}
      { loaded && (
        <VrmDemo vrmUrl={vrmUrl} />
      )}
    </div>
  );
}
