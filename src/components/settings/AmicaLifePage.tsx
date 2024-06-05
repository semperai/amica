import { useTranslation } from 'react-i18next';

import { BasicPage, FormRow } from './common';
import { updateConfig } from "@/utils/config";
import { RangeInput } from '@/components/rangeInput';
import { SwitchBox } from "@/components/switchBox"
import { NumberInput } from '../numberInput';


export function AmicaLifePage({
    amicaLifeEnabled,
    timeBeforeIdle,
    minTimeInterval,
    maxTimeInterval,
    setAmicaLifeEnabled,
    setTimeBeforeIdle,
    setMinTimeInterval,
    setMaxTimeInterval,
    setSettingsUpdated,
}: {
    amicaLifeEnabled: boolean;
    timeBeforeIdle: number;
    minTimeInterval: number;
    maxTimeInterval: number;
    setAmicaLifeEnabled: (amicaLifeEnabled: boolean) => void;
    setTimeBeforeIdle: (timeBeforeIdle: number) => void;
    setMinTimeInterval: (minTimeInterval: number) => void;
    setMaxTimeInterval: (maxTimeInterval: number) => void;
    setSettingsUpdated: (updated: boolean) => void;
}) {
    const { t } = useTranslation();
    
    return (
        <BasicPage
          title={`${t("Amica Life")} ${t("Settings")}`}
          description={`${t("Configure")} ${t("Amica Life")}`}
        >
            <ul role="list" className="divide-y divide-gray-100 max-w-xs">
                <li className="py-4">
                    <FormRow label={`${t("Use")} ${t("Amica Life")}`}>
                        <SwitchBox
                            value={amicaLifeEnabled}
                            label={`${t("Amica Life")} ${t("Enabled")}`}
                            onChange={(value: boolean) => {
                                setAmicaLifeEnabled(value);
                                updateConfig("amica_life_enabled", value.toString());
                                setSettingsUpdated(true);
                            }}
                        />
                    </FormRow>
                </li>
                { amicaLifeEnabled && (
                    <>
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
                        <li className="py-4">
                            <FormRow label={`${t("Set min max interval range")}(${t("sec")})`}>
                                <RangeInput
                                    min={minTimeInterval}
                                    max={maxTimeInterval}
                                    minChange={(event: React.ChangeEvent<any>) => {
                                        setMinTimeInterval(event.target.value);
                                        updateConfig("min_time_interval_sec", event.target.value);
                                        setSettingsUpdated(true);
                                    }}
                                    maxChange={(event: React.ChangeEvent<any>) => {
                                        setMaxTimeInterval(event.target.value);
                                        updateConfig("max_time_interval_sec", event.target.value);
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