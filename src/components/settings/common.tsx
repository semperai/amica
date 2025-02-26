import { t } from '@/i18n';

import {
  AdjustmentsHorizontalIcon,
  ChatBubbleOvalLeftEllipsisIcon,
  IdentificationIcon,
  LanguageIcon,
  UsersIcon,
  CommandLineIcon,
  RocketLaunchIcon,
  FaceSmileIcon,
  MusicalNoteIcon,
  PowerIcon,
  PhotoIcon,
  FilmIcon,
  SpeakerWaveIcon,
  DocumentTextIcon,
  Cog6ToothIcon,
  PencilSquareIcon,
  PencilIcon,
  EyeDropperIcon,
  EyeIcon,
  SwatchIcon,
  MoonIcon,
  SunIcon,
  CogIcon,
  ArrowTopRightOnSquareIcon,
} from '@heroicons/react/24/outline';

import logo from '/public/logo.png';

export function basicPage(
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

export function BasicPage({
  title,
  description,
  children,
}: {
  title: string,
  description: React.ReactNode,
  children: React.ReactNode,
}) {
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

export function FormRow({label, children}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="sm:col-span-3 max-w-xs rounded-xl">
      <label className="block text-sm font-medium leading-6 text-gray-900">
        {label}
      </label>
      <div className="mt-2">
        {children}
      </div>
    </div>
  );
}

export function basename(path: string) {
  const a = path.split("/");
  return a[a.length - 1];
}

export function thumbPrefix(path: string) {
  const a = path.split("/");
  a[a.length - 1] = "thumb-" + a[a.length - 1];
  return a.join("/");
}

export function hashCode(str: string): string {
  var hash = 0, i = 0, len = str.length;
  while ( i < len ) {
      hash  = ((hash << 5) - hash + str.charCodeAt(i++)) << 0;
  }
  return hash.toString();
}

export type Link = {
  key: string;
  label: string;
  icon?: JSX.Element;
  className?: string;
}

export function getLinkFromPage(page: string) {
  return {
    key: page,
    label: getLabelFromPage(page),
    icon: getIconFromPage(page),
    className: getClassNameFromPage(page),
  };
}

export function pagesToLinks(keys: string[]): Link[] {
  const links: Link[] = [];
  for (const key of keys) {
    links.push(getLinkFromPage(key));
  }
  return links;
}

export type PageProps = {
  setPage: (page: string) => void;
  breadcrumbs: Link[];
  setBreadcrumbs: (breadcrumbs: Link[]) => void;
}

export function getIconFromPage(page: string): JSX.Element {
  switch(page) {
    case 'appearance':          return <FaceSmileIcon className="h-5 w-5 flex-none text-gray-800" aria-hidden="true" />;
    case 'amica_life':          return <SunIcon className="h-5 w-5 flex-none text-gray-800" aria-hidden="true" />;
    case 'chatbot':             return <ChatBubbleOvalLeftEllipsisIcon className="h-5 w-5 flex-none text-gray-800" aria-hidden="true" />;
    case 'language':            return <LanguageIcon className="h-5 w-5 flex-none text-gray-800" aria-hidden="true" />;
    case 'tts':                 return <MusicalNoteIcon className="h-5 w-5 flex-none text-gray-800" aria-hidden="true" />;
    case 'stt':                 return <PencilIcon className="h-5 w-5 flex-none text-gray-800" aria-hidden="true" />;
    case 'vision':              return <EyeIcon className="h-5 w-5 flex-none text-gray-800" aria-hidden="true" />;
    case 'external_api':        return <ArrowTopRightOnSquareIcon className="h-5 w-5 flex-none text-gray-800" aria-hidden="true" />;
    case 'reset_settings':      return <PowerIcon className="h-5 w-5 flex-none text-red-500" aria-hidden="true" />;
    case 'developer':           return <CommandLineIcon className="h-5 w-5 flex-none text-green-500" aria-hidden="true" />;
    case 'community':           return <RocketLaunchIcon className="h-5 w-5 flex-none text-gray-800" aria-hidden="true" />;

    case 'background_img':      return <PhotoIcon className="h-5 w-5 flex-none text-gray-800" aria-hidden="true" />;
    case 'background_color':    return <SwatchIcon className="h-5 w-5 flex-none text-gray-800" aria-hidden="true" />;
    case 'background_video':    return <FilmIcon className="h-5 w-5 flex-none text-gray-800" aria-hidden="true" />;
    case 'character_model':     return <UsersIcon className="h-5 w-5 flex-none text-gray-800" aria-hidden="true" />;
    case 'character_animation': return <AdjustmentsHorizontalIcon className="h-5 w-5 flex-none text-gray-800" aria-hidden="true" />;

    case 'chatbot_backend':     return <Cog6ToothIcon className="h-5 w-5 flex-none text-gray-800" aria-hidden="true" />;
    case 'arbius_llm_settings': return <AdjustmentsHorizontalIcon className="h-5 w-5 flex-none text-gray-800" aria-hidden="true" />;
    case 'chatgpt_settings':    return <AdjustmentsHorizontalIcon className="h-5 w-5 flex-none text-gray-800" aria-hidden="true" />;
    case 'llamacpp_settings':   return <AdjustmentsHorizontalIcon className="h-5 w-5 flex-none text-gray-800" aria-hidden="true" />;
    case 'ollama_settings':     return <AdjustmentsHorizontalIcon className="h-5 w-5 flex-none text-gray-800" aria-hidden="true" />;
    case 'koboldai_settings':   return <AdjustmentsHorizontalIcon className="h-5 w-5 flex-none text-gray-800" aria-hidden="true" />;
    case 'moshi_settings':      return <AdjustmentsHorizontalIcon className="h-5 w-5 flex-none text-gray-800" aria-hidden="true" />;
    case 'openrouter_settings': return <AdjustmentsHorizontalIcon className="h-5 w-5 flex-none text-gray-800" aria-hidden="true" />;
    case 'name':                return <IdentificationIcon className="h-5 w-5 flex-none text-gray-800" aria-hidden="true" />;
    case 'system_prompt':       return <DocumentTextIcon className="h-5 w-5 flex-none text-gray-800" aria-hidden="true" />;

    case 'tts_backend':         return <SpeakerWaveIcon className="h-5 w-5 flex-none text-gray-800" aria-hidden="true" />;
    case 'elevenlabs_settings': return <AdjustmentsHorizontalIcon className="h-5 w-5 flex-none text-gray-800" aria-hidden="true" />;
    case 'speecht5_settings':   return <AdjustmentsHorizontalIcon className="h-5 w-5 flex-none text-gray-800" aria-hidden="true" />;
    case 'openai_tts_settings': return <AdjustmentsHorizontalIcon className="h-5 w-5 flex-none text-gray-800" aria-hidden="true" />;
    case 'piper_settings': return <AdjustmentsHorizontalIcon className="h-5 w-5 flex-none text-gray-800" aria-hidden="true" />;
    case 'rvc_settings': return <CogIcon className="h-5 w-5 flex-none text-gray-800" aria-hidden="true" />;
    case 'coquiLocal_settings': return <AdjustmentsHorizontalIcon className="h-5 w-5 flex-none text-gray-800" aria-hidden="true" />;
    case 'localXTTS_settings': return <AdjustmentsHorizontalIcon className="h-5 w-5 flex-none text-gray-800" aria-hidden="true" />;

    case 'stt_backend':         return <PencilSquareIcon className="h-5 w-5 flex-none text-gray-800" aria-hidden="true" />;
    case 'stt_wake_word':  return <MoonIcon className="h-5 w-5 flex-none text-gray-800" aria-hidden="true" />;
    case 'whisper_openai_settings':  return <AdjustmentsHorizontalIcon className="h-5 w-5 flex-none text-gray-800" aria-hidden="true" />;
    case 'whispercpp_settings': return <AdjustmentsHorizontalIcon className="h-5 w-5 flex-none text-gray-800" aria-hidden="true" />;

    case 'vision_backend':           return <EyeDropperIcon className="h-5 w-5 flex-none text-gray-800" aria-hidden="true" />;
    case 'vision_llamacpp_settings': return <AdjustmentsHorizontalIcon className="h-5 w-5 flex-none text-gray-800" aria-hidden="true" />;
    case 'vision_ollama_settings':   return <AdjustmentsHorizontalIcon className="h-5 w-5 flex-none text-gray-800" aria-hidden="true" />;
    case 'vision_openai_settings':   return <AdjustmentsHorizontalIcon className="h-5 w-5 flex-none text-gray-800" aria-hidden="true" />;
    case 'vision_system_prompt':     return <DocumentTextIcon className="h-5 w-5 flex-none text-gray-800" aria-hidden="true" />;
  }

  return <></>;
}

function getLabelFromPage(page: string): string {

  switch(page) {
    case 'appearance':          return t('Appearance');
    case 'amica_life':          return t('Amica Life');
    case 'chatbot':             return t('ChatBot');
    case 'language':            return t('Language');
    case 'tts':                 return t('Text-to-Speech');
    case 'stt':                 return t('Speech-to-text');
    case 'vision':              return t('Vision');
    case 'external_api':        return t('External API');
    case 'reset_settings':      return t('Reset Settings');
    case 'developer':           return t('Developer');
    case 'community':           return t('Community');

    case 'background_img':      return t('Background Image');
    case 'background_color':    return t('Background Color');
    case 'background_video':    return t('Background Video');
    case 'character_model':     return t('Character Model');
    case 'character_animation': return t('Character Animation');

    case 'chatbot_backend':     return t('ChatBot Backend');
    case 'arbius_llm_settings': return t('Arbius');
    case 'chatgpt_settings':    return t('ChatGPT');
    case 'llamacpp_settings':   return t('LLama.cpp');
    case 'ollama_settings':     return t('Ollama');
    case 'koboldai_settings':   return t('KoboldAI');
    case 'moshi_settings':      return t('Moshi');
    case 'openrouter_settings': return t('OpenRouter');
    case 'name'         :       return t('Name');
    case 'system_prompt':       return t('System Prompt');

    case 'tts_backend':         return t('TTS Backend');
    case 'elevenlabs_settings': return t('ElevenLabs');
    case 'speecht5_settings':   return t('SpeechT5');
    case 'openai_tts_settings': return t('OpenAI');
    case 'piper_settings':      return t('Piper');
    case 'rvc_settings':        return t('RVC');
    case 'coquiLocal_settings': return t('Coqui Local');
    case 'localXTTS_settings':  return t('Alltalk');

    case 'vision_backend':           return t('Vision Backend');
    case 'vision_llamacpp_settings': return t('LLama.cpp');
    case 'vision_ollama_settings':   return t('Ollama');
    case 'vision_openai_settings':   return t('OpenAI');
    case 'vision_system_prompt':     return t('System Prompt');

    case 'stt_backend':             return t('STT Backend');
    case 'stt_wake_word':           return t("Wake word");
    case 'whisper_openai_settings': return t("Whisper (OpenAI)");
    case 'whispercpp_settings':     return t("Whisper.cpp");
  }

  throw new Error(`unknown page label encountered ${page}`);
}

function getClassNameFromPage(page: string) {
  switch(page) {
    case 'reset_settings': return 'text-red-500';
  }

  return '';
}

export function ResetToDefaultButton({ onClick }: { onClick: () => void }) {
  return (
    <button
        type="button"
        onClick={onClick}
        className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-rose-600 hover:bg-rose-700 focus:outline-none"
    >
      {t("Reset to Default")}
    </button>
  );
}

export function NotUsingAlert({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
      {children}
    </div>
  );
}
