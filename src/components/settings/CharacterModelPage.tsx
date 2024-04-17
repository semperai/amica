import { useTranslation } from 'react-i18next';
import { clsx } from "clsx";
import { BasicPage } from "./common";
import { updateConfig } from "@/utils/config";
import { TextButton } from "@/components/textButton";
import { VrmData } from '@/features/vrmStore/vrmData';

export function CharacterModelPage({
  viewer,
  vrmHash,
  vrmUrl,
  vrmSaveType,
  vrmList,
  setVrmHash,
  setVrmUrl,
  setVrmSaveType,
  setSettingsUpdated,
  handleClickOpenVrmFile,
}: {
  viewer: any; // TODO
  vrmHash: string;
  vrmUrl: string;
  vrmSaveType: string;
  vrmList: VrmData[],
  setVrmHash: (hash: string) => void;
  setVrmUrl: (url: string) => void;
  setVrmSaveType: (saveType: string) => void;
  setSettingsUpdated: (updated: boolean) => void;
  handleClickOpenVrmFile: () => void;
}) {
  const { t } = useTranslation();

  return (
    <BasicPage
      title={t("Character Model")}
      description={t("character_desc", "Select the Character to play")}
      >
        <div className="rounded-lg shadow-lg bg-white flex flex-wrap justify-center space-x-4 space-y-4 p-4">
          { vrmList.map((vrm) =>
            <button
              key={vrm.url}
              onClick={() => {
                viewer.loadVrm(vrm.url);
                setVrmSaveType(vrm.saveType);
                updateConfig('vrm_save_type', vrm.saveType);
                if (vrm.saveType == 'local') {
                  updateConfig('vrm_hash', vrm.getHash());
                  updateConfig('vrm_url', vrm.url);
                  setVrmUrl(vrm.url);
                  setVrmHash(vrm.getHash());
                } else {
                  updateConfig('vrm_hash', '');
                  updateConfig('vrm_url', vrm.url);
                  setVrmUrl(vrm.url);
                }
                setSettingsUpdated(true);
              }}
              className={clsx(
                "mx-4 py-2 rounded-4 transition-all bg-gray-100 hover:bg-white active:bg-gray-100 rounded-xl",
                ( vrm.saveType === 'web' && vrm.url === vrmUrl) || ( vrm.saveType === 'local' && vrm.getHash() === vrmHash) ? "opacity-100 shadow-md" : "opacity-60 hover:opacity-100"
              )}
              >
                <img
                  src={vrm.thumbUrl}
                  alt={vrm.url}
                  width="160"
                  height="93"
                  className="m-0 rounded mx-4 pt-0 pb-0 pl-0 pr-0 shadow-sm shadow-black hover:shadow-md hover:shadow-black rounded-4 transition-all bg-gray-100 hover:bg-white active:bg-gray-100"
                />
            </button>
          )}
        </div>
        <TextButton
          className="rounded-t-none text-lg ml-4 px-8 shadow-lg bg-secondary hover:bg-secondary-hover active:bg-secondary-active"
          onClick={handleClickOpenVrmFile}
        >
          {t("Load VRM")}
        </TextButton>
      </BasicPage>
  
  );
}

