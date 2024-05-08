import { t } from "@/i18n";
import { FormRow, ResetToDefaultButton } from "../settings/common";
import { TextInput } from "../textInput";
import { defaultConfig, updateConfig } from "@/utils/config";

interface TagComponentProps {
    tag: string
    setTag: (tag: string) => void
    setSettingsUpdated: (updated: boolean) => void
};

export const TagComponent: React.FC<TagComponentProps> = ({tag, setTag, setSettingsUpdated}) => {
    return <>
        <FormRow label={t("Tag")}>
            <TextInput
                value={tag}
                onChange={(event: React.ChangeEvent<any>) => {
                    setTag(event.target.value);
                    updateConfig("character_tag", event.target.value);
                    setSettingsUpdated(true);
                }}
            />

            { tag !== defaultConfig("character_tag") && (
            <p className="mt-2">
                <ResetToDefaultButton onClick={() => {
                        setTag(defaultConfig("character_tag"));
                        updateConfig("character_tag", defaultConfig("character_tag"));
                        setSettingsUpdated(true);
                    }}
                />
            </p>
            )}
        </FormRow>
    </>;
}