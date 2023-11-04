import { useEffect, useState } from "react";
import { IconButton } from "@/components/iconButton";

export function DebugPane({ onClickClose }: {
  onClickClose: () => void
}) {
  function onClickCopy() {
    navigator.clipboard.writeText(JSON.stringify((window as any).error_handler_logs));
  }

  return (
    <div className="absolute top-0 left-0 w-screen max-h-screen text-black text-xs text-left z-20 max-h-screen overflow-y-auto">
      <div className="p-2 bg-white">
        <IconButton
          iconName="24/Close"
          isProcessing={false}
          className="bg-secondary hover:bg-secondary-hover active:bg-secondary-active"
          onClick={onClickClose} />
        <IconButton
          iconName="24/Description"
          isProcessing={false}
          className="bg-primary hover:bg-primary-hover active:bg-primary-active ml-8"
          onClick={onClickCopy} />
        <span className="font-bold text-xl ml-2">Debug Logs</span>
      </div>
      <div className="relative w-screen overflow-y-scroll inline-block px-8 bg-white opacity-90">
        {(window as any).error_handler_logs.slice(-5).map((log: any, idx: number) => (
          <div key={idx}>
            {log.type} {log.ts} {JSON.stringify(log.arguments)}
          </div>
        ))}
      </div>
    </div>
  );
}
