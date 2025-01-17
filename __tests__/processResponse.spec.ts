import { describe, expect, test } from "@jest/globals";
import { Screenplay } from "../src/features/chat/messages";
import { processResponse } from "../src/utils/processResponse";

describe("Process Response Tests", () => {
  test("should return same thing", () => {
    const sentences: string[] = []
    const aiTextLog = "";
    const receivedMessage = "";
    const tag = "";

    let cbTriggered = false;

    const proc = processResponse({
      sentences,
      aiTextLog,
      receivedMessage,
      tag,
      callback: (aiTalks: Screenplay[]) => {
        cbTriggered = true;
        expect(aiTalks).toEqual([]);
        return false;
      },
    });
    expect(proc.sentences).toStrictEqual([]);
    expect(proc.aiTextLog).toBe("");
    expect(proc.receivedMessage).toBe("");
    expect(proc.tag).toBe("");
    expect(proc.shouldBreak).toBe(false);
    expect(cbTriggered).toBe(false);
  });
});
