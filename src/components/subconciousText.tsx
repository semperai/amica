import { useEffect, useRef, useState } from "react";
import { config } from "@/utils/config";
import { TimestampedPrompt } from "@/features/amicaLife/eventHandler";
import { useTranslation } from "react-i18next";
import { IconVocabulary } from '@tabler/icons-react';

export const SubconciousText = ({ messages }: { messages: TimestampedPrompt[] }) => {
    const chatScrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        chatScrollRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "center",
        });
    }, [messages]);

    return (
        <div className="fixed w-col-span-6 max-w-full h-full pb-16">
            <div className="max-h-full px-16 pt-20 pb-4 overflow-y-auto scroll-hidden">
                {messages.map((msg, i) => {
                    return (
                        <div key={i} ref={messages.length - 1 === i ? chatScrollRef : null}>
                            <Chat
                                timeStamp={msg.timestamp}
                                prompt={msg.prompt.replace(/\[(.*?)\]/g, "")}
                                num={i}
                            />
                        </div>
                    );
                })}
            </div>
        </div>

    );
};

function Chat({
    timeStamp,
    prompt,
    num,
}: {
    timeStamp: string;
    prompt: string;
    num: number;
}) {
    const { t } = useTranslation();
    const scrollRef = useRef<HTMLDivElement>(null);

    return (
        <div className='mx-auto max-w-sm my-8'>
            <div className="backdrop-blur-lg rounded-lg">
                <div className="shadow-lg backdrop-blur-lg rounded-lg bg-white/70">
                    <div className='pr-1 bg-rose/90 rounded-t-lg text-white font-bold tracking-wider px-2 flex items-center justify-between top-0'>
                        <div className="flex items-center space-x-4">
                            <IconVocabulary
                                className="h-7 w-7 text-gray-500 opacity-100 text-xs"
                                aria-hidden="true"
                                stroke={2}
                            />
                            <span className="p-4 rounded-lg rounded-tl-none rounded-tr-none shadow-sm bg-pink-600/80">
                                {config('name').toUpperCase()}
                            </span>

                            <div className="min-h-8 max-h-full typography-16 text-sm font-bold text-gray-500 float-right mr-2">
                                {timeStamp}
                            </div>
                        </div>
                    </div>

                    <div className="px-8 py-4 overflow-y-auto max-h-[calc(75vh)]">
                        <div className="min-h-8 max-h-full typography-16 font-bold text-gray-600">
                            {prompt}
                            <div ref={scrollRef} />
                        </div>
                    </div>
                </div>
            </div>
        </div>

    );
}

