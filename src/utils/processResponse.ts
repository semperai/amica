import { Screenplay, textsToScreenplay } from "@/features/chat/messages";

export type ProcessResponseRetVal = {
  sentences: string[];
  aiTextLog: string;
  receivedMessage: string;
  tag: string;
  isThinking: boolean;
  rolePlay: string;
  shouldBreak: boolean;
}

// this function is used to process the response from the AI
// it will call callback once it has a full "sentence" to speak
// it returns updated variables for the next iteration
// this is intended to be used in a loop
export function processResponse({
  sentences,
  aiTextLog,
  receivedMessage,
  tag,
  isThinking,
  rolePlay,
  callback,
}: {
  sentences: string[],
  aiTextLog: string,
  receivedMessage: string,
  tag: string,
  isThinking: boolean,
  rolePlay: string,
  callback: (aiTalks: Screenplay[]) => boolean,
}): ProcessResponseRetVal {
  let shouldBreak = false;

  const thinkTagMatch = receivedMessage.match(/<\/?think>/);
  if (thinkTagMatch && thinkTagMatch[0]) {
    if (thinkTagMatch[0] === "</think>") {
      isThinking = false;
    } else  {
      isThinking = true;
    }
    receivedMessage = receivedMessage.slice(thinkTagMatch[0].length);
  }

  // Detection of tag part of reply content
  const tagMatch = receivedMessage.match(/^\[(.*?)\]/);
  if (tagMatch && tagMatch[0]) {
    tag = tagMatch[0];
    receivedMessage = receivedMessage.slice(tag.length);
  }

  // Detection of role play part of reply content e.g. *smiling nervously*
  const rolePlayMatch = receivedMessage.match(/\*(.*?)\*/);
  if (rolePlayMatch && rolePlayMatch[0]) {
    rolePlay = rolePlayMatch[0];
    receivedMessage = receivedMessage.replace(rolePlay, '');
  }

  // Cut out and process the response sentence by sentence
  const sentenceMatch = receivedMessage.match(
    /^(.+[\.\。\!\！\?\？\，\n]|.{10,}[,])/,
  );
  if (sentenceMatch && sentenceMatch[0]) {
    const sentence = sentenceMatch[0];
    sentences.push(sentence);
    receivedMessage = receivedMessage
      .slice(sentence.length)
      .trimStart();

    // Skip if the string is unnecessary/impossible to utter.
    if (
      !sentence.replace(
        /^[\s\[\(\{「［（【『〈《〔｛«‹〘〚〛〙›»〕》〉』】）］」\}\)\]]+$/g,
        "",
      )
    ) {
      // continue
      return {
        sentences,
        aiTextLog,
        receivedMessage,
        tag,
        isThinking,
        rolePlay,
        shouldBreak,
      }
    }

    const aiText = `${tag} ${sentence}`;
    const aiTalks = textsToScreenplay([aiText]);
    aiTextLog += aiText;

    shouldBreak = callback(aiTalks);
  }

  return {
    sentences,
    aiTextLog,
    receivedMessage,
    tag,
    isThinking,
    rolePlay,
    shouldBreak,
  }
}
