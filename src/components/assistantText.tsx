import { useEffect, useRef, useState } from "react";
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
    <div className="absolute bottom-0 left-0 mb-20 w-full">
      <div className="mx-auto max-w-4xl w-full px-4 md:px-16">
        <div className="bg-white rounded-lg">
          <div className="px-8 py-3 bg-secondary rounded-t-lg text-white font-bold tracking-wider">
            {config('name').toUpperCase()}
            <IconButton
              iconName="24/FrameSize"
              className="bg-secondary hover:bg-secondary-hover active:bg-secondary-press disabled:bg-secondary-disabled float-right"
              isProcessing={false}
              onClick={() => setUnlimited(!unlimited)}
            />
          </div>
          <div className={`px-8 py-4 ${unlimited ? 'max-h-[calc(75vh)]' : 'max-h-32'} overflow-y-auto`}>
            <div className="min-h-8 max-h-full text-secondary typography-16 font-bold">
              {message.replace(/\[([a-zA-Z]*?)\]/g, "")}
              <div ref={scrollRef} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
