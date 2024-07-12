import { Queue } from "typescript-collections";

import { config, updateConfig } from "@/utils/config";
import { wait } from "@/utils/wait";

import { Chat } from "@/features/chat/chat";
import {
  AmicaLifeEvents,
  idleEvents,
  handleIdleEvent,
  handleSleepEvent,
  basedPrompt,
} from "@/features/amicaLife/eventHandler";

export class AmicaLife {
  public mainEvents: Queue<AmicaLifeEvents>;
  public triggerMessage: boolean;
  private isSettingOff: boolean;
  private isIdleLoopRunning: boolean;
  private isPause: boolean;
  public isSleep: boolean;
  private callCount: number;
  public chat: Chat | null;

  constructor(chat: Chat) {
    this.mainEvents = new Queue<AmicaLifeEvents>();
    this.triggerMessage = false;
    this.isSettingOff = false;
    this.isIdleLoopRunning = false;
    this.isPause = false;
    this.isSleep = false;
    this.callCount = 0;
    this.chat = chat;
    this.initialize();
  }

  private async initialize() {
    idleEvents.forEach((prompt) => this.mainEvents.enqueue({ events: prompt }));
  }

  public async loadIdleTextPrompt(prompts: string[]) {
    if (prompts.length > 0) {
      this.mainEvents.clear();
      prompts.forEach((prompt: string) =>
        basedPrompt.idleTextPrompt.push(prompt)
      );
      this.initialize();
    }
  }

  public async startIdleLoop() {
    if (this.isIdleLoopRunning) {
      if (this.isPause === true && this.isSettingOff && !this.isSleep) {
        this.resume();
      }
      return;
    }

    // User must start the conversation with amica first to activate amica life
    if (!this.triggerMessage) {
      return;
    }

    this.isIdleLoopRunning = true;
    console.log("Starting idle loop");

    // First, iteration does nothing
    await wait(parseInt(config("time_before_idle_sec")) * 1000);

    const processIdleEvents = async () => {
      while (this.isIdleLoopRunning) {
        
        // Check for pause
        await this.checkPause();

        // If current stream doesn't finish its jobs continue
        if (this.chat !== null) {
          if ( this.chat?.speakJobs.size() < 1 && this.chat?.ttsJobs.size() < 1) {

            // Check for sleep event
            await this.checkSleep();

            // Check for pause
            await this.checkPause();

            // Random chance for doing nothing (25% chance)
            if (Math.random() <= 0.25) {
              console.log("Handling idle event:", "Doing nothing this cycle");
              await this.waitInterval();
              continue;
            }

            const idleEvent = this.mainEvents.dequeue();
            if (idleEvent) {
              this.callCount++;
              await handleIdleEvent(idleEvent, this.chat);
              this.mainEvents.enqueue(idleEvent);
            } else {
              console.log("Handling idle event:", "No idle events in queue");
            }
          }
        }

        // Wait for an interval time before processing the next event
        await this.waitInterval();
      }
    };

    processIdleEvents().catch((e) => {
      console.error("Idle loop encountered an error:", e);
      this.isIdleLoopRunning = false;
    });
  }

  public async stopIdleLoop() {
    if (this.isIdleLoopRunning === false) {
      return;
    }

    this.isIdleLoopRunning = false;
    this.triggerMessage = false;
    console.log("Stopping idle loop");
  }

  public async pause() {
    let prevFlag = this.isPause;
    // if receiving message from user and idle loop is unavailable
    if (config("amica_life_enabled") === "false") {
      return;
    }

    // Updated time before idle every curve when its get ignored
    // if (prevFlag === false && this.isSettingOff && this.triggerMessage) {
    //   this.updatedIdleTime();
    // }

    await this.chat?.interrupt();
    this.isPause = true;
  }

  public resume() {
    if (config("amica_life_enabled") === "false" || this.chat?.isAwake()) {
      return;
    }

    this.isPause = false;
  }

  // Update time before idle increase by 1.25 times
  public updatedIdleTime() {
    this.callCount++;

    const idleTimeSec = Math.min(
      parseInt(config("time_before_idle_sec")) * 1.25,
      240,
    );
    // updateConfig("time_before_idle_sec", idleTimeSec.toString());
    console.log(`Updated time before idle to ${idleTimeSec} seconds`);
  }

  public async waitInterval() {
    const [minMs, maxMs] = [
      parseInt(config("min_time_interval_sec")),
      parseInt(config("max_time_interval_sec")),
    ];
    const interval =
      Math.floor(Math.random() * (maxMs - minMs + 1) + minMs) * 1000;
    return new Promise((resolve) => setTimeout(resolve, interval));
  }

  // Function to pause/resume the loop when setting page is open/close
  public checkSettingOff(off: boolean) {
    if (off) {
      this.isSettingOff = true;
      this.chat?.updateAwake(); // Update awake when user exit the setting page
      this.resume();
    } else {
      this.isSettingOff = false;
      this.pause();
    }
  }

  private async checkSleep() {
    if (!this.isSleep) {
      const chat = this.chat;
      if (!chat) {
        console.error("Chat instance is not available");
        return;
      }

      const idleTime = chat.idleTime();

      // If character being idle morethan 120 sec or 2 min, play handle sleep event
      if (!this.mainEvents.contains({ events: "Sleep" })) {
        if (idleTime > parseInt(config("time_to_sleep_sec"))) {
          this.isSleep = true;
          await handleSleepEvent(this.chat!);
          this.pause();
        }
      }
    }
  }

  private async checkPause() {
    // Check pause
    if (this.isPause) {
      console.log("Idle loop paused");
      await new Promise<void>((resolve) => {
        const checkPause = setInterval(() => {
          if (!this.isPause) {
            clearInterval(checkPause);
            resolve(console.log("Idle loop resumed"));
          }
        }, 50);
      });
    }
  }
}
