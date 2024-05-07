import Character from "./character";
import { characterDataProvider } from "./db/characterDataProvider";
import CharacterDbModel from "./db/characterDbModel";

export type CharacterDispatchAction = {
    type: CharacterStoreActionType;
    characters?: Character[];
    character?: Character;
    callback?: (props: any) => any;
}

export enum CharacterStoreActionType {
    create,
    update,
    delete,
    loadCharacters,
    setState
}

export const characterStoreReducer = (state: Character[], action: CharacterDispatchAction): Character[] => {
    let newState = state;

    switch (action.type) {
        case CharacterStoreActionType.create:
            CreateCharacter(action);
            break;
            
        case CharacterStoreActionType.update:
            UpdateCharacter(action);
            break;
            
        case CharacterStoreActionType.delete:
            if (action.character)
                characterDataProvider.delete(action.character.id);
            break;

        case CharacterStoreActionType.loadCharacters:
            LoadFromLocalStorage(action);
            break;

        case CharacterStoreActionType.setState:
            if (action.characters)
                newState = action.characters;
            break;
        
        default: break;
    }

    return newState;
}

const CreateCharacter = (action: CharacterDispatchAction) => {
    if (action.character){
        characterDataProvider.create(action.character.tag, action.character.name, action.character.vrmHash,
            action.character.bgUrl, action.character.bgColor, action.character.youtubeVideoId, action.character.animationUrl)
        .then(CharacterDbModelToCharacter).then((character: Character) => { if (action.callback) action.callback(character); })
    }
}

const UpdateCharacter = (action: CharacterDispatchAction) => {
    if (action.character){
        characterDataProvider.update(action.character.id, action.character.tag, action.character.name, action.character.vrmHash,
            action.character.bgUrl, action.character.bgColor, action.character.youtubeVideoId, action.character.animationUrl)
        .then((updatedCharacter: Character | undefined) => {
            if (updatedCharacter)
                return CharacterDbModelToCharacter(updatedCharacter);
            else
                return undefined;
        }).then((character: Character | undefined) => { if (action.callback) action.callback(character); })
    }
}

const LoadFromLocalStorage = (action: CharacterDispatchAction): void => {
    characterDataProvider
        .getItems()
        .then(CharacterDbModelArrayToCharacterArray)
        .then((characters: Character[]) => { if (action.callback) action.callback(characters); });
};

const CharacterDbModelArrayToCharacterArray = async (characters: CharacterDbModel[]): Promise<Character[]> => {
    const promiseArray = characters.map((characterDbModel: CharacterDbModel): Promise<Character> => {
        return CharacterDbModelToCharacter(characterDbModel);
    });
    return Promise.all(promiseArray).then((characterArray: Character[]) => { return characterArray; });
};

const CharacterDbModelToCharacter = async (characterDbModel: CharacterDbModel): Promise<Character> => {
    return new Promise((resolve, reject) => {
        resolve(new Character(characterDbModel.id, characterDbModel.tag, characterDbModel.name,
            characterDbModel.vrmHash, characterDbModel.bgUrl, characterDbModel.bgColor,
            characterDbModel.youtubeVideoId, characterDbModel.animationUrl)); 
    });
};