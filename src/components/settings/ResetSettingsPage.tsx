import {
  BasicPage,
  FormRow,
} from './common';
import { IconButton } from "@/components/iconButton";
import { resetConfig } from "@/utils/config";

export function ResetSettingsPage() {
  return (
    <BasicPage
      title="Reset Settings"
      description="Reset all settings to default. This will reload the page. You will lose any unsaved changes."
    >
      <ul role="list" className="divide-y divide-gray-100 max-w-xs">
        <li className="py-4">
          <FormRow label="">
            <IconButton
              iconName="24/Error"
              isProcessing={false}
              label="Reset All Settings"
              onClick={() => {
                resetConfig();
                window.location.reload();
              }}
              className="mx-4 text-xs bg-secondary hover:bg-secondary-hover active:bg-secondary-active"
              />
          </FormRow>
        </li>
      </ul>
    </BasicPage>
  );
}
