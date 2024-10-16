import { useTranslation } from 'react-i18next';

import { BasicPage, FormRow, NotUsingAlert } from './common';
import { TextInput } from "@/components/textInput";
import { config, updateConfig } from "@/utils/config";

export function LocalXTTSSettingsPage({
    localXTTSUrl,
    setLocalXTTSUrl,
    setSettingsUpdated,
}: {
    localXTTSUrl: string;
    setLocalXTTSUrl: (key: string) => void;
    setSettingsUpdated: (updated: boolean) => void;
}) {
    const { t } = useTranslation();

    return (
        <BasicPage
            title={t("Local XTTS") + " " + t("Settings")}
            description={t("localXTTS_desc", "Configure Local XTTS")}
        >
            {config("tts_backend") !== "localXTTS" && (
                <NotUsingAlert>
                    {t("not_using_alert", "You are not currently using {{name}} as your {{what}} backend. These settings will not be used.", { name: t("Local XTTS"), what: t("TTS") })}
                </NotUsingAlert>
            )}
            <ul role="list" className="divide-y divide-gray-100 max-w-xs">
                <li className="py-4">
                    <FormRow label={t("URL")}>
                        <TextInput
                            value={localXTTSUrl}
                            onChange={(event: React.ChangeEvent<any>) => {
                                setLocalXTTSUrl(event.target.value);
                                updateConfig("localXTTS_url", event.target.value);
                                setSettingsUpdated(true);
                            }}
                        />
                    </FormRow>
                </li>
            </ul>
        </BasicPage>
    );
}