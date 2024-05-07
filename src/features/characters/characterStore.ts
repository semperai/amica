import { config, updateConfig } from '@/utils/config';
import Character from './character';
import { useState } from 'react';

interface CharacterStore {
    characterId: number;
    setCharacterId: (characterId: number) => void;
    characterTag: string;
    setCharacterTag: (characterTag: string) => void;
    name: string;
    setName: (name: string) => void;
    vrmHash: string;
    setVrmHash: (vrmHash: string) => void;
    bgUrl: string;
    setBgUrl: (bgUrl: string) => void;
    bgColor: string;
    setBgColor: (bgColor: string) => void;
    youtubeVideoId: string;
    setYoutubeVideoId: (youtubeVideoId: string) => void;
    animationUrl: string;
    setAnimationUrl: (animationUrl: string) => void;
    characters: Character[];
    setCharacterList: (characters: Character[]) => void;

    initFromConfig: () => void;
    getCharacter: () => Character;
    hasUnsavedChanges: () => boolean;
}

export const GetCharacterStore = (): CharacterStore => {
    const [characters, setCharacters] = useState(new Array<Character>());
    const [characterId, setCharacterId] = useState(-1);
    const [characterTag, setCharacterTag] = useState('');
    const [name, setName] = useState('');
    const [vrmHash, setVrmHash] = useState('');
    const [bgUrl, setBgUrl] = useState('');
    const [bgColor, setBgColor] = useState('');
    const [youtubeVideoId, setYoutubeVideoId] = useState('');
    const [animationUrl, setAnimationUrl] = useState('');

    const initFromConfig = (): void => {
        setCharacterId(parseInt(config('character_id')));
        setCharacterTag(config('character_tag'));
        setName(config('name'));
        setVrmHash(config('vrm_hash'));
        setBgUrl(config('bg_url'));
        setBgColor(config('bg_color'));
        setYoutubeVideoId(config('youtube_videoid'));
        setAnimationUrl(config('animation_url'));
    }

    return {
        characterId: characterId,
        setCharacterId: (characterId: number): void => {
            updateConfig('character_id', characterId.toString());
        },
        characterTag: characterTag,
        setCharacterTag: (tag: string): void => {
            setCharacterTag(tag);
            updateConfig('character_tag', tag);
        },
        name: name,
        setName: (name: string): void => {
            setName(name);
            updateConfig('name', name);
        },
        vrmHash: vrmHash,
        setVrmHash: (vrmHash: string): void => {
            setVrmHash(vrmHash);
            updateConfig('vrm_hash', vrmHash);
        },
        bgUrl: bgUrl,
        setBgUrl: (bgUrl: string): void => {
            setBgUrl(bgUrl);
            updateConfig('bg_url', bgUrl);
        },
        bgColor: bgColor,
        setBgColor: (bgColor: string): void => {
            setBgColor(bgColor);
            updateConfig('bg_color', bgColor);
        },
        youtubeVideoId: youtubeVideoId,
        setYoutubeVideoId: (youtubeVideoId: string): void => {
            setYoutubeVideoId(youtubeVideoId);
            updateConfig('youtube_videoid', youtubeVideoId);
        },
        animationUrl: animationUrl,
        setAnimationUrl: (animationUrl: string): void => {
            setAnimationUrl(animationUrl);
            updateConfig('animation_url', animationUrl);
        },
        characters: characters,
        setCharacterList: (data: Character[]) => {
            setCharacters(data);
        },

        initFromConfig: initFromConfig,

        getCharacter: (): Character => {
            return new Character(characterId, characterTag, name, vrmHash, bgUrl, bgColor, youtubeVideoId, animationUrl);
        },

        hasUnsavedChanges: (): boolean => {
            if (characterId < 0)
                return true;
            const charIndex = characters.findIndex((character: Character) => { return character.id == characterId; });
            return characterTag !== characters[charIndex].tag ||
                name !== characters[charIndex].name ||
                vrmHash !== characters[charIndex].vrmHash ||
                bgUrl !== characters[charIndex].bgUrl ||
                bgColor !== characters[charIndex].bgColor ||
                youtubeVideoId !== characters[charIndex].youtubeVideoId ||
                animationUrl !== characters[charIndex].animationUrl;
        }
    }
}