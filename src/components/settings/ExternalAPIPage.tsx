import { useTranslation } from 'react-i18next';

import { BasicPage, FormRow, NotUsingAlert } from './common';
import { config, prefixed, updateConfig } from "@/utils/config";
import { SwitchBox } from "@/components/switchBox"
import { IconButton } from '../iconButton';
import { useContext, useEffect, useState } from 'react';
import { ChatContext } from '@/features/chat/chatContext';
import { deleteAllSessionData, handleConfig } from '@/features/externalAPI/externalAPI';
import { SecretTextInput } from '../secretTextInput';
import { AlertContext } from '@/features/alert/alertContext';

export function ExternalAPIPage({
    externalApiEnabled,
    xApiKey,
    xApiSecret,
    xAccessToken,
    xAccessSecret,
    xBearerToken,
    telegramBotToken,
    telegramChatId,
    setExternalApiEnabled,
    setXAPIKey,
    setXAPISecret,
    setXAccessToken,
    setXAccessSecret,
    setXBearerToken,
    setTelegramBotToken,
    setTelegramChatId,
    setSettingsUpdated,
}: {
    externalApiEnabled: boolean;
    xApiKey: string;
    xApiSecret: string;
    xAccessToken: string;
    xAccessSecret: string;
    xBearerToken: string;
    telegramBotToken: string;
    telegramChatId: string;
    setExternalApiEnabled: (amicaLifeEnabled: boolean) => void;
    setXAPIKey: (key: string) => void;
    setXAPISecret: (secret: string) => void;
    setXAccessToken: (token: string) => void;
    setXAccessSecret: (secret: string) => void;
    setXBearerToken: (token: string) => void;
    setTelegramBotToken: (token: string) => void;
    setTelegramChatId: (chatId: string) => void;
    setSettingsUpdated: (updated: boolean) => void;
}) {

    const { t } = useTranslation();
    const { chat: bot } = useContext(ChatContext);
    const { alert } = useContext(AlertContext);
    const [sessionId, setSessionId] = useState(localStorage.getItem(prefixed("session_id")))

    const canEnableExternalApi = process.env.NEXT_PUBLIC_EAI_SUPABASE_URL && process.env.NEXT_PUBLIC_EAI_SUPABASE_ANON_KEY;

    useEffect(() => {
        if (externalApiEnabled === true) {
            bot.initRealtime();
        } else {
            bot.closeRealtime();
        }
    }, [externalApiEnabled]);

    useEffect(() => {
        if (!canEnableExternalApi) {
            alert.error("External API cannot be enabled.","Missing external api supabase environment variables: URL and/or ANON_KEY.");
            return;
        }
        async function fetchSessionId() {
            if (externalApiEnabled === true && !sessionId && sessionId?.trim() == "") {
                const sessionId = await handleConfig();
                setSessionId(sessionId);
                localStorage.setItem(prefixed("session_id"), sessionId!);
            }
        }
        fetchSessionId();
    }, []);

    const handleRefreshJwtToken = async () => {
        if (sessionId) {
            await deleteAllSessionData(sessionId);
        }
        const sessionID = await handleConfig();
        setSessionId(sessionID);
        localStorage.setItem(prefixed("session_id"), sessionID!);
        bot.initRealtime();
    }

    return (
        <BasicPage
            title={`${t("External API")} ${t("Settings")}`}
            description={`${t("Enables")} ${t("Only in development mode")}`}
        >
            {(
                <NotUsingAlert>
                    External API currently in develop.
                </NotUsingAlert>
            )}
            <ul role="list" className="divide-y divide-gray-100 max-w-xs">
                <li className="py-4">
                    <FormRow label={`${t("Use")} ${t("External API")}`}>
                        <SwitchBox
                            value={externalApiEnabled}
                            disabled={!canEnableExternalApi}
                            label={`${t("External API")} ${t("Enabled")} ${t("(Disable to improve performance)")}`}
                            onChange={(value: boolean) => {
                                setExternalApiEnabled(value);
                                updateConfig("external_api_enabled", value.toString());
                                setSettingsUpdated(true);
                            }}
                        />
                    </FormRow>
                </li>

                {externalApiEnabled && (
                    <>
                        <li className="py-4">
                            <FormRow label={t("Session ID")}>
                                <div className="flex items-center space-x-4">
                                    <input
                                        type="text"
                                        className="inline-flex items-center px-2 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-fuchsia-600 bg-fuchsia-100 hover:bg-fuchsia-200 focus:outline-transparent focus:border-transparent disabled:opacity-50 disabled:hover:bg-fuchsia-50 disabled:cursor-not-allowed hover:cursor-copy"
                                        value={sessionId ?? "No session ID generated"}
                                        readOnly
                                        onClick={(e) => {
                                            // @ts-ignore
                                            navigator.clipboard.writeText(e.target.value);
                                        }}
                                    />
                                    <IconButton
                                        iconName="24/Reload"
                                        label={"Refresh"}
                                        isProcessing={false}
                                        className="block h-9 w-auto rounded-md border-0 py-1.5 px-4 bg-secondary hover:bg-secondary-hover active:bg-secondary-active text-sm text-white ring-1 ring-inset ring-gray-300 sm:text-sm sm:leading-6"
                                        onClick={handleRefreshJwtToken}
                                    ></IconButton>
                                </div>
                            </FormRow>
                        </li>

                        <li className="py-4">
                            <FormRow label="X API Key">
                                <SecretTextInput
                                    value={xApiKey}
                                    onChange={(event: React.ChangeEvent<any>) => {
                                        setXAPIKey(event.target.value);
                                        updateConfig("x_api_key", event.target.value);
                                        setSettingsUpdated(true);
                                    }}
                                />
                            </FormRow>
                        </li>
                        <li className="py-4">
                            <FormRow label="X API Secret">
                                <SecretTextInput
                                    value={xApiSecret}
                                    onChange={(event: React.ChangeEvent<any>) => {
                                        setXAPISecret(event.target.value);
                                        updateConfig("x_api_secret", event.target.value);
                                        setSettingsUpdated(true);
                                    }}
                                />
                            </FormRow>
                        </li>
                        <li className="py-4">
                            <FormRow label="X Access Token">
                                <SecretTextInput
                                    value={xAccessToken}
                                    onChange={(event: React.ChangeEvent<any>) => {
                                        setXAccessToken(event.target.value);
                                        updateConfig("x_access_token", event.target.value);
                                        setSettingsUpdated(true);
                                    }}
                                />
                            </FormRow>
                        </li>
                        <li className="py-4">
                            <FormRow label="X Access Secret">
                                <SecretTextInput
                                    value={xAccessSecret}
                                    onChange={(event: React.ChangeEvent<any>) => {
                                        setXAccessSecret(event.target.value);
                                        updateConfig("xAccessSecret", event.target.value);
                                        setSettingsUpdated(true);
                                    }}
                                />
                            </FormRow>
                        </li>
                        <li className="py-4">
                            <FormRow label="X Bearer Token">
                                <SecretTextInput
                                    value={xBearerToken}
                                    onChange={(event: React.ChangeEvent<any>) => {
                                        setXBearerToken(event.target.value);
                                        updateConfig("x_bearer_token", event.target.value);
                                        setSettingsUpdated(true);
                                    }}
                                />
                            </FormRow>
                        </li>
                        <li className="py-4">
                            <FormRow label="Telegram Bot Token">
                                <SecretTextInput
                                    value={telegramBotToken}
                                    onChange={(event: React.ChangeEvent<any>) => {
                                        setTelegramBotToken(event.target.value);
                                        updateConfig("telegram_bot_token", event.target.value);
                                        setSettingsUpdated(true);
                                    }}
                                />
                            </FormRow>
                        </li>
                        <li className="py-4">
                            <FormRow label="Telegram Chat ID">
                                <SecretTextInput
                                    value={telegramChatId}
                                    onChange={(event: React.ChangeEvent<any>) => {
                                        setTelegramChatId(event.target.value);
                                        updateConfig("telegram_chat_id", event.target.value);
                                        setSettingsUpdated(true);
                                    }}
                                />
                            </FormRow>
                        </li>
                    </>
                )}
            </ul>
        </BasicPage>
    );
}