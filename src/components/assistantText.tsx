import { useEffect, useRef, useState } from "react";
import { clsx } from "clsx";
import { config } from "@/utils/config";
import { IconButton } from "./iconButton";

export const AssistantText = ({ message }: { message: string }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [unlimited, setUnlimited] = useState(false)

  useEffect(() => {
    scrollRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  });

  return (
    <div className="fixed bottom-0 left-0 mb-20 w-full">
      <div className="mx-auto max-w-4xl w-full px-4 md:px-16">
        <div className="backdrop-blur-lg rounded-lg">
          <div className="bg-white/70 rounded-lg backdrop-blur-lg shadow-lg">
            <div className="px-8 pr-1 py-3 bg-rose/90 rounded-t-lg text-white font-bold tracking-wider">
              <span className="p-4 bg-pink-600/80 rounded-lg rounded-tl-none rounded-tr-none shadow-sm">
                {config('name').toUpperCase()}
              </span>
              <IconButton
                iconName="24/FrameSize"
                className="bg-transparent hover:bg-transparent active:bg-transparent disabled:bg-transparent float-right"
                isProcessing={false}
                onClick={() => setUnlimited(!unlimited)}
              />
            </div>
            <div className={clsx(
              "px-8 py-4 overflow-y-auto",
              unlimited ? 'max-h-[calc(75vh)]' : 'max-h-32',
            )}>
              <div className="min-h-8 max-h-full text-gray-700 typography-16 font-bold">
                {message.replace(/\[([a-zA-Z]*?)\]/g, "")}
                <div ref={scrollRef} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
