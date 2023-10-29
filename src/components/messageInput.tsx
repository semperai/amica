import { IconButton } from "./iconButton";
import { useI18n } from "@/components/I18nProvider";
import { AudioManager } from "./audioManager";
import Transcript from "./transcript";
import { useTranscriber } from "@/hooks/useTranscriber";



type Props = {
  userMessage: string;
  isChatProcessing: boolean;
  onChangeUserMessage: (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => void;
  onClickSendButton: () => void;
};
export const MessageInput = ({
  userMessage,
  isChatProcessing,
  onChangeUserMessage,
  onClickSendButton,
}: Props) => {
  const lang = useI18n();
  const transcriber = useTranscriber();

  return (
    <div className="absolute bottom-0 z-20 w-screen">
      <div className="bg-base text-black">
        <div className="mx-auto max-w-4xl p-16">
          <div className="grid grid-flow-col grid-cols-[min-content_1fr_min-content] gap-[8px]">
            <AudioManager transcriber={transcriber} />
            <Transcript transcribedData={transcriber.output} />

            <input
              type="text"
              placeholder={lang.DaboardInputPlaceHolder}
              onChange={onChangeUserMessage}
              onKeyDown={(e) => {
                if (e.key === "Enter") onClickSendButton();
              }}
              disabled={isChatProcessing}
              className="disabled w-full rounded-16 bg-surface1 px-16 font-M_PLUS_2 font-bold text-text-primary typography-16 hover:bg-surface1-hover focus:bg-surface1 disabled:bg-surface1-disabled disabled:text-primary-disabled"
              value={userMessage}></input>
  
            <IconButton
              iconName="24/Send"
              className="bg-secondary hover:bg-secondary-hover active:bg-secondary-press disabled:bg-secondary-disabled"
              isProcessing={isChatProcessing}
              disabled={isChatProcessing || !userMessage}
              onClick={onClickSendButton}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
