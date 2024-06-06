export type Role = "assistant" | "system" | "user";

// ChatGPT API
export type Message = {
  role: Role;
  content: string;
};

const talkStyles = [
  "talk",
  "happy",
  "sad",
  "angry",
  "fear",
  "surprised",
] as const;
export type TalkStyle = (typeof talkStyles)[number];

export type Talk = {
  style: TalkStyle;
  message: string;
};

//Name of all the expression in the vrm 
export const emotionNames: string[] = [];
// console.log(emotionNames);

const emotions = 
["neutral", "happy", "angry", "sad", "relaxed", "Surprised", 
"Shy", "Jealous", "Bored", "Serious", "Sus", "Victory", "Sorrow", 
"Sleep", "Love"] as const;

type EmotionType = (typeof emotions)[number];

/**
 * A set that includes utterances, voice emotions, and model emotional expressions.
 */
export type Screenplay = {
  expression: EmotionType;
  talk: Talk;
};

export const textsToScreenplay = (
  texts: string[],
): Screenplay[] => {
  const screenplays: Screenplay[] = [];
  let prevExpression = "neutral";
  for (let i = 0; i < texts.length; i++) {
    const text = texts[i];

    const match = text.match(/\[(.*?)\]/);

    const tag = (match && match[1]) || prevExpression;

    const message = text.replace(/\[(.*?)\]/g, "");

    let expression = prevExpression;
    if (emotions.includes(tag as any)) {
      expression = tag;
      prevExpression = tag;
    }

    screenplays.push({
      expression: expression as EmotionType,
      talk: {
        style: emotionToTalkStyle(expression as EmotionType),
        message: message,
      },
    });
  }

  return screenplays;
};

const emotionToTalkStyle = (emotion: EmotionType): TalkStyle => {
  switch (emotion) {
    case "angry":
      return "angry";
    case "happy":
      return "happy";
    case "sad":
      return "sad";
    default:
      return "talk";
  }
};
