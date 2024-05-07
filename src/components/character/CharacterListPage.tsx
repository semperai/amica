import { useCharacterStoreContext } from "@/features/characters/characterStoreContext";
import { VrmListPage } from "../settings/VrmListPage";
import Character from "@/features/characters/character";

export const CharacterListPage = ({
    viewer,
    setSettingsUpdated,
    handleClickOpenVrmFile,
  }: {
    viewer: any; // TODO
    setSettingsUpdated: (updated: boolean) => void;
    handleClickOpenVrmFile: () => void;
  }) => {
    const characterStoreContext = useCharacterStoreContext();

    return <ul>
      {characterStoreContext.characterList.map((character: Character) => 
        <li>
          <div>
            {character.tag}
          </div>
        </li>
      )}
    </ul>
}