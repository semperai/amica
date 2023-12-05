import { useEffect, useRef, useState } from "react";
import { Switch } from '@headlessui/react'
import { IconButton } from "@/components/iconButton";
import { useKeyboardShortcut } from "@/hooks/useKeyboardShortcut";
import { clsx } from "clsx";
import { config } from "@/utils/config";

const TOTAL_ITEMS_TO_SHOW = 100;

function SwitchToggle({ enabled, set }: {
  enabled: boolean;
  set: (enabled: boolean) => void;
}) {
  return (
    <Switch
      className="group ml-1 relative inline-flex h-5 w-10 flex-shrink-0 cursor-pointer items-center justify-center rounded-full focus:outline-none focus:ring-0"
      checked={enabled}
      onChange={set}
    >
      <span className="sr-only">Use setting</span>
      <span aria-hidden="true" className="pointer-events-none absolute h-full w-full rounded-md" />
      <span
        aria-hidden="true"
        className={clsx(
          enabled ? 'bg-indigo-200' : 'bg-gray-200',
          'pointer-events-none absolute mx-auto h-4 w-9 rounded-full transition-colors duration-200 ease-in-out'
        )}
      />
      <span
        aria-hidden="true"
        className={clsx(
          enabled ? 'translate-x-5' : 'translate-x-0',
          'pointer-events-none absolute left-0 inline-block h-5 w-5 transform rounded-full border border-gray-200 bg-white shadow ring-0 transition-transform duration-200 ease-in-out'
        )}
        />
    </Switch>
  )
}

export function DebugPane({ onClickClose }: {
  onClickClose: () => void
}) {
  const [typeDebugEnabled, setTypeDebugEnabled] = useState(false);
  const [typeInfoEnabled, setTypeInfoEnabled] = useState(true);
  const [typeWarnEnabled, setTypeWarnEnabled] = useState(true);
  const [typeErrorEnabled, setTypeErrorEnabled] = useState(true);

  const scrollRef = useRef<HTMLDivElement>(null);

  useKeyboardShortcut("Escape", onClickClose);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({
      behavior: "auto",
      block: "center",
    });
  }, []);

  function onClickCopy() {
    navigator.clipboard.writeText(JSON.stringify((window as any).error_handler_logs));
  }

  return (
    <div className="fixed bg-white/95 w-full h-full top-0 left-0 z-20">
      <div className="fixed top-0 left-0 w-full max-h-full text-black text-xs text-left z-20">
        <div className="p-2 bg-white">
          <IconButton
            iconName="24/Close"
            isProcessing={false}
            className="bg-secondary hover:bg-secondary-hover active:bg-secondary-active"
            onClick={onClickClose} />
          <IconButton
            iconName="24/Description"
            isProcessing={false}
            className="bg-primary hover:bg-primary-hover active:bg-primary-active ml-4"
            onClick={onClickCopy} />

          <div className="inline-block ml-2 items-center">
            <span className="px-1"><span className="text-xs text-gray-500">llm: </span><span className="text-xs text-gray-400">{config("chatbot_backend")}</span></span>
            <span className="px-1"><span className="text-xs text-gray-500">tts: </span><span className="text-xs text-gray-400">{config("tts_backend")}</span></span>
            <span className="px-1"><span className="text-xs text-gray-500">stt: </span><span className="text-xs text-gray-400">{config("stt_backend")}</span></span>
            <span className="px-1"><span className="text-xs text-gray-500">bid: </span><span className="text-xs text-gray-400">{process.env.NEXT_PUBLIC_CONFIG_BUILD_ID}</span></span>
          </div>
        </div>
        <div className="p-2 bg-gray-50">
          <span className="ml-2">
            <span className="mx-1 inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">
              debug
              <SwitchToggle enabled={typeDebugEnabled} set={setTypeDebugEnabled} />
            </span>
            <span className="mx-1 inline-flex items-center rounded-md bg-green-100 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
              info
              <SwitchToggle enabled={typeInfoEnabled} set={setTypeInfoEnabled} />
            </span>
            <span className="mx-1 inline-flex items-center rounded-md bg-yellow-50 px-2 py-1 text-xs font-medium text-yellow-800 ring-1 ring-inset ring-yellow-600/20">
              warn
              <SwitchToggle enabled={typeWarnEnabled} set={setTypeWarnEnabled} />
            </span>
            <span className="mx-1 inline-flex items-center rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/10">
              error
              <SwitchToggle enabled={typeErrorEnabled} set={setTypeErrorEnabled} />
            </span>
          </span>
        </div>
        <div className="relative w-full max-h-screen overflow-y-scroll inline-block px-2 md:px-8">
          {(window as any).error_handler_logs.slice(-TOTAL_ITEMS_TO_SHOW).filter((log: any) => {
            if (log.type === 'debug' && !typeDebugEnabled) return false;
            if ((log.type === 'info' || log.type === 'log') && !typeInfoEnabled) return false;
            if (log.type === 'warn' && !typeWarnEnabled) return false;
            if (log.type === 'error' && !typeErrorEnabled) return false;
            return true;
          }).map((log: any, idx: number) => (
            <div key={log.ts+idx} className={clsx(
              "my-0.5",
              log.type === 'error' ? 'bg-red-50' : 'bg-gray-50'
            )}>
              { log.type === 'debug' && (
                <span className="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10 font-mono w-12">debug</span>
              )}
              { (log.type === 'info' || log.type === 'log') && (
                <span className="inline-flex items-center rounded-md bg-green-100 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20 font-mono w-12">info</span>
              )}
              { log.type === 'warn' && (
                <span className="inline-flex items-center rounded-md bg-yellow-50 px-2 py-1 text-xs font-medium text-yellow-800 ring-1 ring-inset ring-yellow-600/20 font-mono w-12">warn</span>
              )}
              { log.type === 'error' && (
                <span className="inline-flex items-center rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/10 font-mono w-12">error</span>
              )}

              <small className="text-gray-400 px-1 font-mono">{log.ts / 1000 | 0}</small>

              <span className="text-gray-700 text-md">
                {[...log.arguments].map((v) =>
                  (typeof v === 'object') ? JSON.stringify(v) : v)
                  .join(" ")}
              </span>
            </div>
          ))}
          <div ref={scrollRef} className="my-20" />
          <div className="my-40" />
        </div>
      </div>
    </div>
  );
}
