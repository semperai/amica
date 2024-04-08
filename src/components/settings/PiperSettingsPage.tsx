import { useTranslation } from 'react-i18next';

import { BasicPage, FormRow, NotUsingAlert } from './common';
import { TextInput } from "@/components/textInput";
import { config, updateConfig } from "@/utils/config";

export function PiperSettingsPage({
    piperUrl,
    setPiperUrl,
    setSettingsUpdated,
}: {
    piperUrl: string;
    setPiperUrl: (key: string) => void;
    setSettingsUpdated: (updated: boolean) => void;
}) {
    const { t } = useTranslation();

    return (
        <BasicPage
            title={t("Piper") + " " + t("Settings")}
            description={t("piper_desc", "Configure Piper")}
        >
            {config("tts_backend") !== "piper" && (
                <NotUsingAlert>
                    {t("not_using_alert", "You are not currently using {{name}} as your {{what}} backend. These settings will not be used.", { name: t("Piper"), what: t("TTS") })}
                </NotUsingAlert>
            )}
            <ul role="list" className="divide-y divide-gray-100 max-w-xs">
                <li className="py-4">
                    <FormRow label={t("URL")}>
                        <TextInput
                            value={piperUrl}
                            onChange={(event: React.ChangeEvent<any>) => {
                                setPiperUrl(event.target.value);
                                updateConfig("piper_url", event.target.value);
                                setSettingsUpdated(true);
                            }}
                        />
                    </FormRow>
                </li>
            </ul>
        </BasicPage>
    );
}