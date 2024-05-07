import { useTranslation } from 'react-i18next';
import { clsx } from "clsx";
import { BasicPage } from "./common";
import { updateConfig } from "@/utils/config";
import { TextButton } from "@/components/textButton";
import { useVrmStoreContext } from '@/features/vrmStore/vrmStoreContext';
import { useCharacterStoreContext } from '@/features/characters/characterStoreContext';

export function VrmListPage({
  viewer,
  setSettingsUpdated,
  handleClickOpenVrmFile,
}: {
  viewer: any; // TODO
  setSettingsUpdated: (updated: boolean) => void;
  handleClickOpenVrmFile: () => void;
}) {
  const { t } = useTranslation();
  const vrmStoreContext = useVrmStoreContext();
  const vrmList = vrmStoreContext.vrmList;
  const characterContext = useCharacterStoreContext();

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
                const hash = vrm.getHash();
                characterContext.setVrmSaveType(hash, vrm.saveType);
                if (vrm.saveType == 'local') {
                  updateConfig('vrm_hash', hash);
                  updateConfig('vrm_url', vrm.url);
                  characterContext.setVrmUrl(hash, vrm.url);
                  characterContext.setVrmHash(hash);
                } else {
                  updateConfig('vrm_hash', vrm.url);
                  updateConfig('vrm_url', vrm.url);
                  characterContext.setVrmUrl(hash, vrm.url);
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

