import { useTranslation } from 'react-i18next';

import { BasicPage, FormRow } from './common';
import { updateConfig } from "@/utils/config";
import { TextInput } from '@/components/textInput';
import { SwitchBox } from "@/components/switchBox"
import { NumberInput } from '../numberInput';


export function STTWakeWordSettingsPage({
    sttWakeWordEnabled,
    sttWakeWord,
    timeBeforeIdle,
    setSTTWakeWordEnabled,
    setSTTWakeWord,
    setTimeBeforeIdle,
    setSettingsUpdated,
}: {
    sttWakeWordEnabled: boolean;
    sttWakeWord: string;
    timeBeforeIdle: number;
    setSTTWakeWordEnabled: (wakeWordEnabled: boolean) => void;
    setSTTWakeWord: (wakeWord: string) => void;
    setTimeBeforeIdle: (timeBeforeIdle: number) => void;
    setSettingsUpdated: (updated: boolean) => void;
}) {
    const { t } = useTranslation();

    return (
        <BasicPage
          title={`${t("Wake Word")} ${t("Settings")}`}
          description={`${t("Configure")} ${t("Wake Word")}`}
        >
            <ul role="list" className="divide-y divide-gray-100 max-w-xs">
                <li className="py-4">
                    <FormRow label={`${t("Use")} ${t("Wake Word")}`}>
                        <SwitchBox
                            value={sttWakeWordEnabled}
                            label={`${t("Wake Word")} ${t("Enabled")}`}
                            onChange={(value: boolean) => {
                                setSTTWakeWordEnabled(value);
                                updateConfig("wake_word_enabled", value.toString());
                                setSettingsUpdated(true);
                            }}
                        />
                    </FormRow>
                </li>
                { sttWakeWordEnabled && (
                    <>
                        <li className="py-4">
                            <FormRow label={`${t("Specify")} ${t("Wake Word")}`}>
                                <TextInput
                                    value={sttWakeWord}
                                    onChange={(event: React.ChangeEvent<any>) => {
                                        setSTTWakeWord(event.target.value);
                                        updateConfig("wake_word", event.target.value);
                                        setSettingsUpdated(true);
                                    }}
                                />
                            </FormRow>
                        </li>
                        <li className="py-4">
                            <FormRow label={`${t("Set time before bot go idle")}(${t("sec")})`}>
                                <NumberInput
                                    value={timeBeforeIdle}
                                    min={0}
                                    max={60 * 60}
                                    onChange={(event: React.ChangeEvent<any>) => {
                                        setTimeBeforeIdle(event.target.value);
                                        updateConfig("time_before_idle_sec", event.target.value);
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