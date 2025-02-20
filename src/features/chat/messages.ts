export type Role = "assistant" | "system" | "user";

// ChatGPT API
export type Message = {
  role: Role;
  content: string; // this can be a string or like {type: "image", image_url: {url: "https://example.com/image.jpg"} } but the typing for it sucks
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

export const emotions = 
["neutral", "happy", "angry", "sad", "relaxed", "Surprised", 
"Shy", "Jealous", "Bored", "Serious", "Suspicious", "Victory", 
"Sleep", "Love"] as const;

// Convert user input to system format e.g. ["suspicious"] -> ["Sus"], ["sleep"] -> ["Sleep"]
const userInputToSystem = (input: string) => {
  const mapping: { [key: string]: string } = {
    ...Object.fromEntries(emotions
      .filter(e => e[0] === e[0].toUpperCase())
      .map(e => [e.toLowerCase(), e]))
  };

  return mapping[input.toLowerCase()] || input;
};

type EmotionType = (typeof emotions)[number];

/**
 * A set that includes utterances, voice emotions, and model emotional expressions.
 */
export type Screenplay = {
  expression: EmotionType;
  talk: Talk;
  text: string;
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
    const systemTag = userInputToSystem(tag);

    if (emotions.includes(systemTag as any)) {
      console.log("Emotion detect :",systemTag);
      expression = systemTag;
      prevExpression = systemTag;
    }

    screenplays.push({
      expression: expression as EmotionType,
      talk: {
        style: emotionToTalkStyle(expression as EmotionType),
        message: message,
      },
      text: text,
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
