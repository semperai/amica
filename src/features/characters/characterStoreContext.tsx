import { PropsWithChildren, createContext, useContext, useEffect, useReducer, useState } from "react";
import { GetCharacterStore } from "./characterStore";
import { CharacterStoreActionType, characterStoreReducer } from "./characterStoreReducer";
import Character from "./character";

interface CharacterStoreContextType {
    saveCharacter: () => Promise<Character>;

    characterId: number;
    characterTag: string;
    name: string;
    systemPrompt: string;
    vrmHash: string;
    bgUrl: string;
    bgColor: string;
    youtubeVideoId: string;
    animationUrl: string;

    setCharacterTag: (characterTag: string) => void;
    setName: (name: string) => void;
    setSystemPrompt: (name: string) => void;
    setVrmHash: (vrmHash: string) => void;
    setBgUrl: (bgUrl: string) => void;
    setBgColor: (bgColor: string) => void;
    setYoutubeVideoId: (youtubeVideoId: string) => void;
    setAnimationUrl: (animationUrl: string) => void;

    characterList: Character[];
    hasUnsavedChanges: () => boolean;

    isLoadingCharactersList: boolean
}

const CharacterStoreContext = createContext<CharacterStoreContextType>({
    saveCharacter: (): Promise<Character> => { return new Promise(() => {}) },

    characterId: -1,
    characterTag: '',
    name: '',
    systemPrompt: '',
    vrmHash: '',
    bgUrl: '',
    bgColor: '',
    youtubeVideoId: '',
    animationUrl: '',

    setCharacterTag: () => {},
    setName: () => {},
    setSystemPrompt: () => {},
    setVrmHash: () => {},
    setBgUrl: () => {},
    setBgColor: () => {},
    setYoutubeVideoId: () => {},
    setAnimationUrl: () => {},

    characterList: new Array<Character>(),
    hasUnsavedChanges: (): boolean => { return false; },

    isLoadingCharactersList: false
});

export const CharacterStoreContextProvider = ({ children }: PropsWithChildren<{}>): JSX.Element => {
    const [loadedCharactersList, charactersListDispatch] = useReducer(characterStoreReducer, new Array<Character>());
    const [isLoadingCharactersList, setIsLoadingCharactersList] = useState(true);

    const updateCharacterListWithCharacter = (character: Character) => {
        const characterList = new Array<Character>(...loadedCharactersList);
        const index = characterList.findIndex((characterInList: Character) => { characterInList.id == character.id });
        const isInList = index !== -1;
        if (isInList) {
            characterList[index] = character;
        } else {
            characterList.push(character);
        }
        charactersListDispatch({ type: CharacterStoreActionType.setState, characters: characterList });
    };

    const characterStore = GetCharacterStore();

    const characterStoreContext: CharacterStoreContextType = {
        characterId: characterStore.characterId,
        characterTag: characterStore.characterTag,
        name: characterStore.name,
        systemPrompt: characterStore.systemPrompt,
        vrmHash: characterStore.vrmHash,
        bgUrl: characterStore.bgUrl,
        bgColor: characterStore.bgColor,
        youtubeVideoId: characterStore.youtubeVideoId,
        animationUrl: characterStore.animationUrl,

        setCharacterTag: characterStore.setCharacterTag,
        setName: characterStore.setName,
        setSystemPrompt: characterStore.setSystemPrompt,
        setVrmHash: characterStore.setVrmHash,
        setBgUrl: characterStore.setBgUrl,
        setBgColor: characterStore.setBgColor,
        setYoutubeVideoId: characterStore.setYoutubeVideoId,
        setAnimationUrl: characterStore.setAnimationUrl,

        saveCharacter: async (): Promise<Character> => {
            return new Promise( (resolve, reject) => {
                if (loadedCharactersList.findIndex((loaded: Character) => { loaded.id == characterStore.characterId }) > 0)
                    charactersListDispatch({ type: CharacterStoreActionType.update,
                        character: characterStore.getCharacter(),
                        callback: (character: Character | undefined) => {
                            if (character) {
                                updateCharacterListWithCharacter(character);
                                resolve(character);
                            } else {
                                reject("Update error.");
                            }
                        }
                    });
                else
                    charactersListDispatch({ type: CharacterStoreActionType.create,
                        character: characterStore.getCharacter(),
                        callback: (character: Character) => { updateCharacterListWithCharacter(character); resolve(character); }
                    });
            });
        },

        characterList: loadedCharactersList,
        hasUnsavedChanges: characterStore.hasUnsavedChanges,

        isLoadingCharactersList: isLoadingCharactersList
    };

    useEffect(() => {
        console.log("Init characters store");
        charactersListDispatch({
            type: CharacterStoreActionType.loadCharacters,
            callback: (data: Character[]) => { charactersListDispatch({ type: CharacterStoreActionType.setState, characters: data}) }
        });
        characterStore.initFromConfig();
    }, []);

    useEffect(() => {
        characterStore.setCharacterList(loadedCharactersList);
        setIsLoadingCharactersList(false);
    }, [loadedCharactersList]);

    return (
        <CharacterStoreContext.Provider value={characterStoreContext}>
            {children}
        </CharacterStoreContext.Provider>
    );
};

export const useCharacterStoreContext = () => {
    const context = useContext(CharacterStoreContext);

    if (!context) {
        throw new Error("useCharacterContext must be used inside the CharacterProvider");
    }

    return context;
};