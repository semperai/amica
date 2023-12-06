import { useTranslation } from 'react-i18next';
import { useEffect, useRef } from "react";

export const UserText = ({ message }: { message: string }) => {
  const { t } = useTranslation();
  const scrollRef = useRef<HTMLDivElement>(null);

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
              <span className="p-4 bg-cyan-600/80 rounded-lg rounded-tl-none rounded-tr-none shadow-sm">
                {t("YOU")}
              </span>
            </div>

            <div className="px-8 py-4 max-h-32 overflow-y-auto">
              <div className="min-h-8 max-h-full typography-16 font-bold text-gray-600">
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
