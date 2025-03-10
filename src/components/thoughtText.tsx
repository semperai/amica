import React, { useEffect, useRef, useState } from "react";
import { clsx } from "clsx";
import { config } from "@/utils/config";
import { IconButton } from "./iconButton";

export const ThoughtText = ({ message }: { message: string }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [expanded, setExpanded] = useState(false);
  
  // Remove emotion tags
  const cleanMessage = message.replace(/\[(.*?)\]/g, "");
  
  useEffect(() => {
    scrollRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  });
  
  return (
    <div
      className={clsx(
        "absolute top-4 right-3 z-40 transition-all duration-500 ease-in-out opacity-70 -translate-y-4"
      )}
      style={{
        filter: "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))",
        maxWidth: "280px",
        minWidth: "220px"
      }}
    >
      <div className="bg-white/80 backdrop-blur-sm rounded-lg overflow-hidden border border-blue-100 shadow-md">
        <div className="bg-blue-500/90 text-white px-3 py-1.5 flex items-center justify-between text-xs">
          <span className="font-medium tracking-wide">
            {`${config('name').toUpperCase()} THINKS`}
          </span>
          <IconButton
            iconName="24/FrameSize"
            className="bg-transparent hover:bg-blue-600/80 active:bg-blue-700/80 disabled:bg-transparent rounded-full p-0.5 transition-colors scale-75"
            isProcessing={false}
            onClick={() => setExpanded(!expanded)}
          />
        </div>
        <div className={clsx(
          "px-3 py-2 text-gray-700 overflow-y-auto transition-all duration-300 ease-in-out",
          expanded ? "max-h-48" : "max-h-20"
        )}>
          <p className={clsx(
            "leading-relaxed text-xs opacity-90 transition-opacity"
          )}>
            {cleanMessage}
          </p>
          <div ref={scrollRef} />
        </div>
      </div>
    </div>
  );
};