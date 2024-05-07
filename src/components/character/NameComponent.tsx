import { t } from "@/i18n";
import { FormRow, ResetToDefaultButton } from "../settings/common";
import { TextInput } from "../textInput";
import { defaultConfig, updateConfig } from "@/utils/config";

interface NameComponentProps {
    name: string
    setName: (name: string) => void
    setSettingsUpdated: (updated: boolean) => void
};

export const NameComponent: React.FC<NameComponentProps> = ({name, setName, setSettingsUpdated}) => {
    return <>
        <FormRow label={t("Name")}>
            <TextInput
                value={name}
                onChange={(event: React.ChangeEvent<any>) => {
                    setName(event.target.value);
                    updateConfig("name", event.target.value);
                    setSettingsUpdated(true);
                }}
            />

            { name !== defaultConfig("name") && (
            <p className="mt-2">
                <ResetToDefaultButton onClick={() => {
                        setName(defaultConfig("name"));
                        updateConfig("name", defaultConfig("name"));
                        setSettingsUpdated(true);
                    }}
                />
            </p>
            )}
        </FormRow>
    </>;
}