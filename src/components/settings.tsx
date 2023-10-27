import React from "react";
import { IconButton } from "./iconButton";
import { TextButton } from "./textButton";
import { Message } from "@/features/messages/messages";
import {
  KoeiroParam,
  PRESET_A,
  PRESET_B,
  PRESET_C,
  PRESET_D,
} from "@/features/constants/koeiroParam";
import { Link } from "./link";
import { setLan, TLangs } from "@/i18n";
import { useI18n } from "@/components/I18nProvider";

type Props = {
  openAiKey: string;
  systemPrompt: string;
  chatLog: Message[];
  koeiroParam: KoeiroParam;
  koeiromapKey: string;
  onClickClose: () => void;
  onChangeAiKey: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onChangeSystemPrompt: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onChangeChatLog: (index: number, text: string) => void;
  onChangeKoeiroParam: (x: number, y: number) => void;
  onClickOpenVrmFile: () => void;
  onClickResetChatLog: () => void;
  onClickResetSystemPrompt: () => void;
  onChangeKoeiromapKey: (event: React.ChangeEvent<HTMLInputElement>) => void;
};
export const Settings = ({
  openAiKey,
  chatLog,
  systemPrompt,
  koeiroParam,
  koeiromapKey,
  onClickClose,
  onChangeSystemPrompt,
  onChangeAiKey,
  onChangeChatLog,
  onChangeKoeiroParam,
  onClickOpenVrmFile,
  onClickResetChatLog,
  onClickResetSystemPrompt,
  onChangeKoeiromapKey,
}: Props) => {
  const lang = useI18n();
  const lan = (localStorage.getItem("chatvrm_language") ?? "en") as TLangs;

  return (
    <div className="absolute z-40 h-full w-full bg-white/80 backdrop-blur ">
      <div className="absolute m-24">
        <IconButton
          iconName="24/Close"
          isProcessing={false}
          onClick={onClickClose}></IconButton>
      </div>
      <div className="max-h-full overflow-auto">
        <div className="mx-auto max-w-3xl px-24 py-64 text-text1 ">
          <div className="my-24 font-bold typography-32">{lang.Settings}</div>
          <div className="my-24">
            <div className="my-16 font-bold typography-20">
              {lang.SettingsOpenAIAPIKey}
            </div>
            <input
              className="w-col-span-2 text-ellipsis rounded-8 bg-surface1 px-16 py-8 hover:bg-surface1-hover"
              type="text"
              placeholder="sk-..."
              value={openAiKey}
              onChange={onChangeAiKey}
            />
            <TextButton
              onClick={() => {
                localStorage.setItem("chatvrm_apikey", btoa(openAiKey));
              }}
              className="ml-8  bg-secondary hover:bg-secondary-hover">
              {lang.SettingsOpenAIAPISaveBtn}
            </TextButton>
            <div className="mt-4 font-bold text-secondary-hover">
              {lang.SettingsOpenAIAPISaveNoti}
            </div>
            <div className="mt-8">
              {lang.SettingsOpenAIAPIKeyDetail1}
              <Link
                url="https://platform.openai.com/account/api-keys"
                label={lang.SettingsOpenAIAPIKeyDetail2}
              />
              {lang.SettingsOpenAIAPIKeyDetail3}
            </div>
            <div className="my-16">
              {lang.SettingsOpenAIAPIKeyDetail4}
              <br />
              {lang.SettingsOpenAIAPIKeyDetail5}
            </div>
          </div>
          <div className="my-40">
            <div className="my-16 font-bold typography-20">
              {lang.SettingsLanguage}
            </div>
            <div className="my-8">
              <TextButton
                onClick={() => {
                  setLan("cn");
                  location.reload();
                }}
                className="mx-4"
                disabled={lan === 'cn'}
                >
                中国語
              </TextButton>
              <TextButton
                onClick={() => {
                  setLan("jp");
                  location.reload();
                }}
                className="mx-4"
                disabled={lan === 'jp'}
                >
                日文
              </TextButton>
              <TextButton
                onClick={() => {
                  setLan("en");
                  location.reload();
                }}
                className="mx-4"
                disabled={lan === 'en'}
                >
                English
              </TextButton>
            </div>
          </div>
          <div className="my-40">
            <div className="my-16 font-bold typography-20">
              {lang.SettingsCharacterModel}
            </div>
            <div className="my-8">
              <TextButton onClick={onClickOpenVrmFile}>
                {lang.SettingsCharacterSelectBtn}
              </TextButton>
            </div>
          </div>
          <div className="my-40">
            <div className="my-16 font-bold typography-20">
              {lang.SettingsCharacterSettings}
            </div>
            <textarea
              value={systemPrompt}
              onChange={onChangeSystemPrompt}
              className="h-168 w-full  rounded-8 bg-surface1 px-16 py-8 hover:bg-surface1-hover"></textarea>
          </div>
          {chatLog.length > 0 && (
            <div className="my-40">
              <div className="my-16 font-bold typography-20">会話履歴</div>
              <div className="my-8">
                {chatLog.map((value, index) => {
                  return (
                    <div
                      key={index}
                      className="my-8 grid grid-flow-col  grid-cols-[min-content_1fr] gap-x-fixed">
                      <div className="w-[64px] py-8">
                        {value.role === "assistant" ? "Character" : "You"}
                      </div>
                      <input
                        key={index}
                        className="w-full rounded-8 bg-surface1 px-16 py-8 hover:bg-surface1-hover"
                        type="text"
                        value={value.content}
                        onChange={(event) => {
                          onChangeChatLog(index, event.target.value);
                        }}></input>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
