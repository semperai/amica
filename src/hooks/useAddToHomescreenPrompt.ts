import * as React from "react";

interface IBeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<UserChoice>;
}

type UserChoice = { outcome: "accepted" | "dismissed"; platform: string; };


export function useAddToHomescreenPrompt(): [
  IBeforeInstallPromptEvent | null,
  () => Promise<UserChoice>,
] {
  const [prompt, setState] = React.useState<IBeforeInstallPromptEvent | null>(
    null
  );

  const promptToInstall = () => {
    if (prompt) {
      return prompt.prompt();
    }
    return Promise.reject(
      new Error(
        'Tried installing before browser sent "beforeinstallprompt" event'
      )
    );
  };

  React.useEffect(() => {
    const ready = (e: IBeforeInstallPromptEvent) => {
      e.preventDefault();
      setState(e);
    };

    window.addEventListener("beforeinstallprompt", ready as any);

    return () => {
      window.removeEventListener("beforeinstallprompt", ready as any);
    };
  }, []);

  return [prompt, promptToInstall];
}
