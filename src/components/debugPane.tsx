import { useEffect, useRef, useState } from "react";
import { IconButton } from "@/components/iconButton";
import { useKeyboardShortcut } from "@/hooks/useKeyboardShortcut";

const TOTAL_ITEMS_TO_SHOW = 100;

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
    <div className="fixed top-0 left-0 w-screen max-h-screen text-black text-xs text-left z-20 overflow-y-auto">
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
      </div>
      <div className="p-2 bg-gray-50">
        <span className="ml-2">
          <span className="mx-1 inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">
            debug
            <input
              type="checkbox"
              className="ml-1 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-0"
              checked={typeDebugEnabled}
              onChange={(e) => setTypeDebugEnabled(e.target.checked)}
            />
          </span>
          <span className="mx-1 inline-flex items-center rounded-md bg-green-100 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
            info
            <input
              type="checkbox"
              className="ml-1 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-0"
              checked={typeInfoEnabled}
              onChange={(e) => setTypeInfoEnabled(e.target.checked)}
            />
          </span>
          <span className="mx-1 inline-flex items-center rounded-md bg-yellow-50 px-2 py-1 text-xs font-medium text-yellow-800 ring-1 ring-inset ring-yellow-600/20">
            warn
            <input
              type="checkbox"
              className="ml-1 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-0"
              checked={typeWarnEnabled}
              onChange={(e) => setTypeWarnEnabled(e.target.checked)}
            />
          </span>
          <span className="mx-1 inline-flex items-center rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/10">
            error
            <input
              type="checkbox"
              className="ml-1 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-0"
              checked={typeErrorEnabled}
              onChange={(e) => setTypeErrorEnabled(e.target.checked)}
            />
          </span>
        </span>
      </div>
      <div className="relative w-screen overflow-y-scroll inline-block px-8 bg-white opacity-95">
        {(window as any).error_handler_logs.slice(-TOTAL_ITEMS_TO_SHOW).filter((log) => {
          if (log.type === 'debug' && !typeDebugEnabled) return false;
          if ((log.type === 'info' || log.type === 'log') && !typeInfoEnabled) return false;
          if (log.type === 'warn' && !typeWarnEnabled) return false;
          if (log.type === 'error' && !typeErrorEnabled) return false;
          return true;
        }).map((log: any, idx: number) => (
          <div key={log.ts+idx} className={"my-0.5 " + (log.type === 'error' ? 'bg-red-50' : 'bg-gray-50') }>
            { log.type === 'debug' && (
              <span className="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">info</span>
            )}
            { (log.type === 'info' || log.type === 'log') && (
              <span className="inline-flex items-center rounded-md bg-green-100 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">info</span>
            )}
            { log.type === 'warn' && (
              <span className="inline-flex items-center rounded-md bg-yellow-50 px-2 py-1 text-xs font-medium text-yellow-800 ring-1 ring-inset ring-yellow-600/20">warn</span>
            )}
            { log.type === 'error' && (
              <span className="inline-flex items-center rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/10">error</span>
            )}

            <small className="text-gray-400 px-1">{log.ts / 1000 | 0}</small>

            <span className="text-gray-700 text-md">
              {[...log.arguments].map((v) =>
                (typeof v === 'object') ? JSON.stringify(v) : v)
                .join(" ")}
            </span>
          </div>
        ))}
        <div ref={scrollRef} className="my-20" />
      </div>
    </div>
  );
}