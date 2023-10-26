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
import { setLan } from "@/i18n";
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
                className="mx-4">
                {lang.SettingsLanguageCN}
              </TextButton>
              <TextButton
                onClick={() => {
                  setLan("jp");
                  location.reload();
                }}
                className="mx-4">
                {lang.SettingsLanguageJP}
              </TextButton>
              <TextButton
                onClick={() => {
                  setLan("en");
                  location.reload();
                }}
                className="mx-4">
                {lang.SettingsLanguageEN}
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
          <div className="my-40">
            <div className="my-16 font-bold typography-20">
              {lang.SettingsAdjustmentOfVoice}
            </div>
            <div>
              {lang.SettingsAdjustmentOfVoiceNoti1}
              <a
                className="mx-4 text-primary hover:text-primary-hover"
                target="_blank"
                rel="noopener noreferrer"
                href="http://koeiromap.rinna.jp">
                http://koeiromap.rinna.jp
              </a>
              {lang.SettingsAdjustmentOfVoiceNoti2}
            </div>
            <div className="mt-16">{lang.SettingsAdjustmentOfVoicePresets}</div>
            <div className="my-8 grid grid-cols-2 gap-[8px]">
              <TextButton
                onClick={() =>
                  onChangeKoeiroParam(PRESET_A.speakerX, PRESET_A.speakerY)
                }>
                {lang.SettingsAdjustmentOfVoicePresetsBtn1}
              </TextButton>
              <TextButton
                onClick={() =>
                  onChangeKoeiroParam(PRESET_B.speakerX, PRESET_B.speakerY)
                }>
                {lang.SettingsAdjustmentOfVoicePresetsBtn2}
              </TextButton>
              <TextButton
                onClick={() =>
                  onChangeKoeiroParam(PRESET_C.speakerX, PRESET_C.speakerY)
                }>
                {lang.SettingsAdjustmentOfVoicePresetsBtn3}
              </TextButton>
              <TextButton
                onClick={() =>
                  onChangeKoeiroParam(PRESET_D.speakerX, PRESET_D.speakerY)
                }>
                {lang.SettingsAdjustmentOfVoicePresetsBtn4}
              </TextButton>
            </div>
            <div className="my-24">
              <div className="select-none">x : {koeiroParam.speakerX}</div>
              <input
                type="range"
                min={-3}
                max={3}
                step={0.001}
                value={koeiroParam.speakerX}
                className="input-range mb-16 mt-8"
                onChange={(e) => {
                  onChangeKoeiroParam(
                    Number(e.target.value),
                    koeiroParam.speakerY,
                  );
                }}></input>
              <div className="select-none">y : {koeiroParam.speakerY}</div>
              <input
                type="range"
                min={-3}
                max={3}
                step={0.001}
                value={koeiroParam.speakerY}
                className="input-range mb-16 mt-8"
                onChange={(e) => {
                  onChangeKoeiroParam(
                    koeiroParam.speakerX,
                    Number(e.target.value),
                  );
                }}></input>
            </div>
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
