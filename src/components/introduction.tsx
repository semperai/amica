import { useState, useCallback } from "react";
import { Link } from "./link";
import { updateConfig } from "@/utils/config";

type Props = {
  open: boolean;
};
export const Introduction = ({ open }: Props) => {
  const [opened, setOpened] = useState(open);

  return opened ? (
    <div className="absolute z-40 h-full w-full bg-black/30 px-24  py-40 font-M_PLUS_2">
      <div className="mx-auto my-auto max-h-full max-w-3xl overflow-auto rounded-16 bg-white p-24">
        <div className="my-24">
          <div className="my-8 font-bold text-secondary typography-20 ">
            Welcome to Amica 0.1
          </div>
          <p>
            Amica is an open source chatbot interface that provides emotion, text to speech, and speech to text capabilities. It is designed to be able to be attached to any ChatBot API. It can be used with any VRM model and is very customizable. You can even run Amica on your own computer without an internet connection, or on your phone.
          </p>
        </div>
        <div className="my-24">
          <div className="my-8 font-bold text-secondary typography-20">
            Setup
          </div>
          <p>
            Out of the box, Amica simply repeats what you say. Click on the top left of the screen to open settings. You can change the voice, language, and attach to different backends or in-browser models. Read the full documentation <a href="https://github.com/semperai/amica/tree/master/docs" target="_blank" className="text-secondary">here</a>.
          </p>
        </div>

        <div className="my-24">
          <button
            onClick={() => {
              setOpened(false);
            }}
            className="rounded-8 bg-primary px-24 py-8 font-bold text-white hover:bg-primary-hover active:bg-primary-press disabled:bg-primary-disabled m-8">
            Close
          </button>
          <button
            onClick={() => {
              updateConfig("show_introduction", "false");
              setOpened(false);
            }}
            className="rounded-8 bg-secondary px-24 py-8 font-bold text-white hover:bg-secondary-hover active:bg-secondary-press disabled:bg-secondary-disabled ml-8">
            Don&#39;t show again
          </button>
        </div>
      </div>
    </div>
  ) : null;
};
