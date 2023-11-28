import {
  AdjustmentsHorizontalIcon,
  ChatBubbleOvalLeftEllipsisIcon,
  IdentificationIcon,
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
  PencilSquareIcon,
  PencilIcon,
  EyeDropperIcon,
  EyeIcon,
} from '@heroicons/react/24/outline';

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

export function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
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
    case 'chatbot':             return <ChatBubbleOvalLeftEllipsisIcon className="h-5 w-5 flex-none text-gray-800" aria-hidden="true" />;
    case 'tts':                 return <MusicalNoteIcon className="h-5 w-5 flex-none text-gray-800" aria-hidden="true" />;
    case 'stt':                 return <PencilIcon className="h-5 w-5 flex-none text-gray-800" aria-hidden="true" />;
    case 'vision':              return <EyeIcon className="h-5 w-5 flex-none text-gray-800" aria-hidden="true" />;
    case 'reset_settings':      return <PowerIcon className="h-5 w-5 flex-none text-red-500" aria-hidden="true" />;
    case 'community':           return <RocketLaunchIcon className="h-5 w-5 flex-none text-gray-800" aria-hidden="true" />;

    case 'background_img':      return <PhotoIcon className="h-5 w-5 flex-none text-gray-800" aria-hidden="true" />;
    case 'background_video':    return <FilmIcon className="h-5 w-5 flex-none text-gray-800" aria-hidden="true" />;
    case 'character_model':     return <UsersIcon className="h-5 w-5 flex-none text-gray-800" aria-hidden="true" />;
    case 'character_animation': return <AdjustmentsHorizontalIcon className="h-5 w-5 flex-none text-gray-800" aria-hidden="true" />;

    case 'chatbot_backend':     return <Cog6ToothIcon className="h-5 w-5 flex-none text-gray-800" aria-hidden="true" />;
    case 'chatgpt_settings':    return <AdjustmentsHorizontalIcon className="h-5 w-5 flex-none text-gray-800" aria-hidden="true" />;
    case 'llamacpp_settings':   return <AdjustmentsHorizontalIcon className="h-5 w-5 flex-none text-gray-800" aria-hidden="true" />;
    case 'ollama_settings':     return <AdjustmentsHorizontalIcon className="h-5 w-5 flex-none text-gray-800" aria-hidden="true" />;
    case 'koboldai_settings':   return <AdjustmentsHorizontalIcon className="h-5 w-5 flex-none text-gray-800" aria-hidden="true" />;
    case 'name':                return <IdentificationIcon className="h-5 w-5 flex-none text-gray-800" aria-hidden="true" />;
    case 'system_prompt':       return <DocumentTextIcon className="h-5 w-5 flex-none text-gray-800" aria-hidden="true" />;

    case 'tts_backend':         return <SpeakerWaveIcon className="h-5 w-5 flex-none text-gray-800" aria-hidden="true" />;
    case 'elevenlabs_settings': return <AdjustmentsHorizontalIcon className="h-5 w-5 flex-none text-gray-800" aria-hidden="true" />;
    case 'speecht5_settings':   return <AdjustmentsHorizontalIcon className="h-5 w-5 flex-none text-gray-800" aria-hidden="true" />;
    case 'coqui_settings':      return <AdjustmentsHorizontalIcon className="h-5 w-5 flex-none text-gray-800" aria-hidden="true" />;
    case 'openai_tts_settings': return <AdjustmentsHorizontalIcon className="h-5 w-5 flex-none text-gray-800" aria-hidden="true" />;

    case 'stt_backend':         return <PencilSquareIcon className="h-5 w-5 flex-none text-gray-800" aria-hidden="true" />;
    case 'whisper_openai_settings':  return <AdjustmentsHorizontalIcon className="h-5 w-5 flex-none text-gray-800" aria-hidden="true" />;
    case 'whispercpp_settings': return <AdjustmentsHorizontalIcon className="h-5 w-5 flex-none text-gray-800" aria-hidden="true" />;

    case 'vision_backend':           return <EyeDropperIcon className="h-5 w-5 flex-none text-gray-800" aria-hidden="true" />;
    case 'vision_llamacpp_settings': return <AdjustmentsHorizontalIcon className="h-5 w-5 flex-none text-gray-800" aria-hidden="true" />;
    case 'vision_system_prompt':     return <DocumentTextIcon className="h-5 w-5 flex-none text-gray-800" aria-hidden="true" />;
  }

  return <></>;
}

function getLabelFromPage(page: string): string {
  switch(page) {
    case 'appearance':          return 'Appearance';
    case 'chatbot':             return 'ChatBot';
    case 'tts':                 return 'Text-to-Speech';
    case 'stt':                 return 'Speech-to-text';
    case 'vision':              return 'Vision';
    case 'reset_settings':      return 'Reset Settings';
    case 'community':           return 'Community';

    case 'background_img':      return 'Background Image';
    case 'background_video':    return 'Background Video';
    case 'character_model':     return 'Character Model';
    case 'character_animation': return 'Character Animation';

    case 'chatbot_backend':     return 'ChatBot Backend';
    case 'chatgpt_settings':    return 'ChatGPT';
    case 'llamacpp_settings':   return 'LLama.cpp';
    case 'ollama_settings':     return 'Ollama';
    case 'koboldai_settings':   return 'KoboldAI';
    case 'name'         :       return 'Name';
    case 'system_prompt':       return 'System Prompt';

    case 'tts_backend':         return 'TTS Backend';
    case 'elevenlabs_settings': return 'ElevenLabs';
    case 'speecht5_settings':   return 'SpeechT5';
    case 'coqui_settings':      return 'Coqui';
    case 'openai_tts_settings': return 'OpenAI';

    case 'vision_backend':           return 'Vision Backend';
    case 'vision_llamacpp_settings': return 'LLama.cpp';
    case 'vision_system_prompt':     return 'System Prompt';

    case 'stt_backend':             return 'STT Backend';
    case 'whisper_openai_settings': return "Whisper (OpenAI)";
    case 'whispercpp_settings':     return "Whisper.cpp";
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
      Reset to Default
    </button>
  );
}
