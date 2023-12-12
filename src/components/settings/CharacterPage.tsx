import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import { BasicPage, FormRow } from './common';
import { config, updateConfig } from "@/utils/config";
import { TextInput } from '../textInput';

export function CharacterPage({setSettingsUpdated, name, setName, systemPrompt, setSystemPrompt}: {
  setSettingsUpdated: (updated: boolean) => void,
  name: string,
  setName: (name: string) => void,
  systemPrompt: string,
  setSystemPrompt: (name: string) => void,
}) {
  const { t } = useTranslation();
  const [characters, setCharacters] = useState<Array<{id: Number, name: string, prompt: string}>>([])
  const [characterId, setCharacterId] = useState<Number>(parseInt(config('current_character_id')))

  const saveCharacter = (isNew: boolean) => fetch(
    'http://localhost:3000/api/save_character',
    {
      method:'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(Object.assign({name, prompt: systemPrompt}, isNew ? {} : {id:characterId}))
    }
  )

  useEffect(() => {
    async function getCharacters() {
      setCharacters(await fetch('http://localhost:3000/api/characters').then(resp => resp.json()))
    }
    getCharacters()
  }, []);
  const charactersMap = new Map(characters.map(c => [c.id.toString(), c]))

  return (
    <BasicPage
      title={t("Character")}
      description={t("Character select", "Select character to use, or edit name and prompt, and save as new or currently selected character.")}
    >
      <ul role="list" className="divide-y divide-gray-100 max-w-xs">
        <li className="py-4">
          <FormRow label={t("Character")}>
            <select
              className="mt-2 block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
              value={characterId.toString()}
              onChange={(event: React.ChangeEvent<any>) => {
                setCharacterId(event.target.value)
                updateConfig("current_character_id", event.target.value.toString());
                let character = charactersMap.get(event.target.value);
                if (!character) {
                  return;
                }
                updateConfig("name", character.name)
                updateConfig("system_prompt", character.prompt)
                setName(character.name);
                setSystemPrompt(character.prompt);
                setSettingsUpdated(true);
              }}
            >
              {characters.map(({id, name}) => (
                <option key={id.toString()} value={id.toString()}>{`${id}) ${name}`}</option>
              ))}
            </select>
          </FormRow>
        </li>
        <li className="py-4">
          <FormRow label={t("Name")}>
            <TextInput
              value={name}
              onChange={(event: React.ChangeEvent<any>) => {
                setName(event.target.value);
                updateConfig("name", event.target.value);
                setSettingsUpdated(true);
              }}
            />
          </FormRow>
        </li>
        <li className="py-4">
          <FormRow label={t("System Prompt")}>
          <textarea
            value={systemPrompt}
            rows={8}
            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
            onChange={(event: React.ChangeEvent<any>) => {
              setSystemPrompt(event.target.value);
              updateConfig("system_prompt", event.target.value);
              setSettingsUpdated(true);
           }} />

          </FormRow>
        </li>
        <li className="py-4">
          <FormRow label={t("Save")}>
            <button
                className="rounded bg-indigo-600 px-2 py-1 text-xs font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                onClick={() => saveCharacter(false)}
            >
              {t("Update character")}
            </button>
            <button
                className="rounded bg-indigo-600 px-2 py-1 text-xs font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                onClick={() => saveCharacter(true)}
            >
              {t("Save as new")}
            </button>
          </FormRow>
        </li>
      </ul>
    </BasicPage>
  );
}
