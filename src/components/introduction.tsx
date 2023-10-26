import { useState, useCallback } from "react";
import { Link } from "./link";
import { useI18n } from "@/components/I18nProvider";

type Props = {
  openAiKey: string;
  onChangeAiKey: (openAiKey: string) => void;
};
export const Introduction = ({ openAiKey, onChangeAiKey }: Props) => {
  const [opened, setOpened] = useState(true);
  const lang = useI18n();

  const handleAiKeyChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onChangeAiKey(event.target.value);
    },
    [onChangeAiKey],
  );

  return opened ? (
    <div className="absolute z-40 h-full w-full bg-black/30 px-24  py-40 font-M_PLUS_2">
      <div className="mx-auto my-auto max-h-full max-w-3xl overflow-auto rounded-16 bg-white p-24">
        <div className="my-24">
          <div className="my-8 font-bold text-secondary typography-20 ">
            {lang.IntroAboutThisApp}
          </div>
          <div>{lang.IntroDetail}</div>
        </div>
        <div className="my-24">
          <div className="my-8 font-bold text-secondary typography-20">
            {lang.IntroTechnicalIntroduction}
          </div>
          <div>
            {lang.IntroTechnicalDetail1}
            <Link
              url={"https://github.com/pixiv/three-vrm"}
              label={"@pixiv/three-vrm"}
            />
            {lang.IntroTechnicalDetail2}
            <Link
              url={
                "https://openai.com/blog/introducing-chatgpt-and-whisper-apis"
              }
              label={"ChatGPT API"}
            />
            {lang.IntroTechnicalDetail3}
            <Link url={"http://koeiromap.rinna.jp/"} label={"Koeiro API"} />
            {lang.IntroTechnicalDetail4}
            <Link
              url={"https://inside.pixiv.blog/2023/04/28/160000"}
              label={lang.IntroTechnicalDetail5}
            />
            {lang.IntroTechnicalDetail6}
          </div>
          <div className="my-16">
            {lang.IntroTechnicalDetail7}
            <br />
            {lang.IntroTechnicalDetail8}
            <Link
              url={"https://github.com/pixiv/ChatVRM"}
              label={"https://github.com/pixiv/ChatVRM"}
            />
          </div>
        </div>

        <div className="my-24">
          <div className="my-8 font-bold text-secondary typography-20">
            {lang.IntroNotesOnUsage}
          </div>
          <div>
            {lang.IntroNotesOnUsageDetail}
          </div>
        </div>
        <div className="my-24">
          <div className="my-8 font-bold text-secondary typography-20">
            {lang.IntroOpenAIAPIKey}
          </div>
          <input
            type="text"
            placeholder="sk-..."
            value={openAiKey}
            onChange={handleAiKeyChange}
            className="my-4 h-40 w-full text-ellipsis rounded-4 bg-surface3 px-16 py-8 hover:bg-surface3-hover"></input>
          <div>
            {lang.IntroOpenAIAPIKeyDetail1}
            <Link
              url="https://platform.openai.com/account/api-keys"
              label={lang.IntroOpenAIAPIKeyDetail2}
            />
            {lang.IntroOpenAIAPIKeyDetail3}
          </div>
          <div className="my-16">
            {lang.IntroOpenAIAPIKeyDetail4}
            <br />
            ※{lang.IntroOpenAIAPIKeyDetail5}
          </div>
        </div>
        <div className="my-24">
          <button
            onClick={() => {
              setOpened(false);
            }}
            className="rounded-oval bg-secondary px-24 py-8 font-bold text-white hover:bg-secondary-hover active:bg-secondary-press disabled:bg-secondary-disabled">
            {lang.IntroStart}
          </button>
        </div>
      </div>
    </div>
  ) : null;
};
