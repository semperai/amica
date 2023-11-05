import { useState, useCallback } from "react";
import { updateConfig } from "@/utils/config";

export const Introduction = ({ open }: {
  open: boolean;
}) => {
  const [opened, setOpened] = useState(open);

  if (! opened) {
    return null;
  }

  return (
    <div className="absolute z-40 h-full w-full bg-black/30 mx-auto max-w-7xl sm:px-24 lg:px-32  py-40 font-M_PLUS_2">
      <div className="mx-auto my-auto max-h-full overflow-auto rounded-lg bg-white p-4">
        <div className="my-4">
          <div className="my-8 font-bold text-secondary text-xl">
            Welcome to Amica 0.1
          </div>
          <p>
            Amica is an open source chatbot interface that provides emotion, text to speech, and speech to text capabilities. It is designed to be able to be attached to any ChatBot API. It can be used with any VRM model and is very customizable. You can even run Amica on your own computer without an internet connection, or on your phone.
          </p>
        </div>
        <div className="my-4">
          <div className="my-8 font-bold text-secondary typography-20">
            Setup
          </div>
          <p>
            Out of the box, Amica simply repeats what you say. Click on the top left of the screen to open settings. You can change the voice, language, and attach to different backends or in-browser models. Read the full documentation <a href="https://github.com/semperai/amica/tree/master/docs" target="_blank" className="text-secondary">here</a>.
          </p>
        </div>

        <div className="my-8">
          <button
            onClick={() => {
              setOpened(false);
            }}
            className="rounded-md bg-primary px-4 py-2 font-bold text-white hover:bg-primary-hover active:bg-primary-press disabled:bg-primary-disabled">
            Close
          </button>
          <button
            onClick={() => {
              updateConfig("show_introduction", "false");
              setOpened(false);
            }}
            className="rounded-md bg-secondary px-4 py-2 font-bold text-white hover:bg-secondary-hover active:bg-secondary-press disabled:bg-secondary-disabled ml-8">
            Don&#39;t show again
          </button>
        </div>
      </div>
    </div>
  );
};
