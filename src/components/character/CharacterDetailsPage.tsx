import { useTranslation } from "react-i18next";
import { BasicPage } from "../settings/common";
import { TextButton } from "../textButton";
import { useCharacterStoreContext } from "@/features/characters/characterStoreContext";
import { NameComponent } from "./NameComponent";

export function CharacterDetailsPage({
    setSettingsUpdated,
    handleClickOpenVrmFile,
  }: {
    setSettingsUpdated: (updated: boolean) => void;
    handleClickOpenVrmFile: () => void;
  }) {
    const { t } = useTranslation();
    const characterContext = useCharacterStoreContext();
  
    return (
      <BasicPage
        title={t("Character Model")}
        description={t("character_desc", "Select the Character to play")}
        >
            <div className="rounded-lg shadow-lg bg-white flex flex-wrap justify-center space-x-4 space-y-4 p-4">
              <ul role="list" className="divide-y divide-gray-100 max-w-xs">
                <li className="py-4">
                  <NameComponent name={characterContext.name} setName={characterContext.setName} setSettingsUpdated={setSettingsUpdated} />
                </li>
              </ul>
            </div>
        <TextButton
          className="rounded-t-none text-lg ml-4 px-8 shadow-lg bg-secondary hover:bg-secondary-hover active:bg-secondary-active"
          onClick={() => { characterContext.saveCharacter(); }}
        >
          {t("Save Character")}
        </TextButton>
      </BasicPage>
  
  );
}

