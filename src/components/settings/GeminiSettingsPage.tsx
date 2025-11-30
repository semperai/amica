import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { BasicPage, FormRow, NotUsingAlert } from './common';
import { SecretTextInput } from '@/components/secretTextInput';
import { config, updateConfig } from "@/utils/config";

const GEMINI_MODELS = [
  { value: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash (recommended)' },
  { value: 'gemini-2.5-flash-lite', label: 'Gemini 2.5 Flash Lite' },
  { value: 'gemini-2.5-pro', label: 'Gemini 2.5 Pro' },
  { value: 'gemini-3-pro-preview', label: 'Gemini 3 Pro (preview)' },
];

const THINKING_LEVELS = [
  { value: 'off', label: 'Disabled' },
  { value: 'low', label: 'Low' },
  { value: 'high', label: 'High' },
];

export function GeminiSettingsPage({
  geminiApiKey,
  setGeminiApiKey,
  geminiModel,
  setGeminiModel,
  geminiThinkingLevel,
  setGeminiThinkingLevel,
  setSettingsUpdated,
}: {
  geminiApiKey: string;
  setGeminiApiKey: (key: string) => void;
  geminiModel: string;
  setGeminiModel: (model: string) => void;
  geminiThinkingLevel: string;
  setGeminiThinkingLevel: (level: string) => void;
  setSettingsUpdated: (updated: boolean) => void;
}) {
  const { t } = useTranslation();

  useEffect(() => {
    const storedModel = localStorage.getItem('chatvrm_gemini_model');
    const storedThinkingLevel = localStorage.getItem('chatvrm_gemini_thinking_level');

    if (!storedModel) {
      updateConfig('gemini_model', geminiModel);
    }
    if (!storedThinkingLevel) {
      updateConfig('gemini_thinking_level', geminiThinkingLevel);
    }
  }, []); // Intentionally using initial prop values only, not reactive to prop changes

  const description = <>{t('gemini_desc')} <a href="https://ai.google.dev" target="_blank" rel="noopener noreferrer">Google AI Studio</a>.</>;

  return (
    <BasicPage
      title={t('Gemini Settings')}
      description={description}
    >
      { config("chatbot_backend") !== "gemini" && (
        <NotUsingAlert>
          {t("not_using_alert", "You are not currently using {{name}} as your {{what}} backend. These settings will not be used.", {name: t("Gemini"), what: t("ChatBot")})}
        </NotUsingAlert>
      ) }
      <ul role="list" className="divide-y divide-gray-100 max-w-xs">
        <li className="py-4">
          <FormRow label={t('Gemini API Key')}>
            <SecretTextInput
              value={geminiApiKey}
              onChange={(event: React.ChangeEvent<any>) => {
                setGeminiApiKey(event.target.value);
                updateConfig("gemini_apikey", event.target.value);
                setSettingsUpdated(true);
              }}
            />
          </FormRow>
        </li>
        <li className="py-4">
          <FormRow label={t('Model')}>
            <select
              className="mt-2 block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
              value={geminiModel}
              onChange={(event: React.ChangeEvent<any>) => {
                setGeminiModel(event.target.value);
                updateConfig("gemini_model", event.target.value);
                setSettingsUpdated(true);
              }}
            >
              {GEMINI_MODELS.map((model) => (
                <option key={model.value} value={model.value}>{t(model.label)}</option>
              ))}
            </select>
          </FormRow>
        </li>
        <li className="py-4">
          <FormRow label={t('Reasoning Level')}>
            <select
              className="mt-2 block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
              value={geminiThinkingLevel}
              onChange={(event: React.ChangeEvent<any>) => {
                setGeminiThinkingLevel(event.target.value);
                updateConfig("gemini_thinking_level", event.target.value);
                setSettingsUpdated(true);
              }}
            >
              {THINKING_LEVELS.map((level) => (
                <option key={level.value} value={level.value}>{t(level.label)}</option>
              ))}
            </select>
          </FormRow>
        </li>
      </ul>
    </BasicPage>
  );
}
