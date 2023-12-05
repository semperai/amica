import { useTranslation } from 'react-i18next';
import { clsx } from 'clsx';

import { thumbPrefix } from './common';
import { bgImages } from "@/paths";
import { updateConfig } from "@/utils/config";
import { TextButton } from "@/components/textButton";

export function BackgroundImgPage({
  bgUrl,
  setBgUrl,
  setSettingsUpdated,
  handleClickOpenBgImgFile,
}: {
  bgUrl: string;
  setBgUrl: (url: string) => void;
  setSettingsUpdated: (updated: boolean) => void;
  handleClickOpenBgImgFile: () => void;
}) {
  const { t } = useTranslation();

  return (
    <>
      <div className="rounded-lg shadow-lg bg-white flex flex-wrap justify-center space-x-4 space-y-4 p-4">
        { bgImages.map((url) =>
          <button
            key={url}
            onClick={() => {
              document.body.style.backgroundImage = `url(${url})`;
              updateConfig("bg_color", "");
              updateConfig("youtube_videoid", "");
              updateConfig("bg_url", url);
              setBgUrl(url);
              setSettingsUpdated(true);
            }}
            className={clsx(
              "mx-4 py-2 rounded-4 transition-all bg-gray-100 hover:bg-white active:bg-gray-100 rounded-xl",
              bgUrl === url ? "opacity-100 shadow-md" : "opacity-60 hover:opacity-100",
            )}
            >
              <img
                src={`${thumbPrefix(url)}`}
                alt={url}
                width="160"
                height="93"
                className="m-0 rounded-md mx-4 p-0 shadow-sm shadow-black hover:shadow-md hover:shadow-black rounded-4 transition-all bg-gray-100 hover:bg-white active:bg-gray-100"
                onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = url;
                }}
              />
          </button>
        )}
      </div>
      <TextButton
        className="rounded-t-none text-lg ml-4 px-8 shadow-lg bg-secondary hover:bg-secondary-hover active:bg-secondary-active"
        onClick={handleClickOpenBgImgFile}
      >
        {t("Load image")}
      </TextButton>
    </>
  );
}
