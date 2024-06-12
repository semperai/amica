import { Queue } from "typescript-collections";
import { Chat } from "@/features/chat/chat";
import { config, updateConfig } from "@/utils/config";
import { wait } from "@/utils/wait";

const idleEvents = [
  "I am ignoring you!",
  "Tell me a joke!",
  "Speak to me about a topic you are interested in.",
] as const;

export type IdleEvents = (typeof idleEvents)[number];

type AmicaLifeEvents = {
  events: IdleEvents;
};

export class AmicaLife {
  public mainEvents: Queue<AmicaLifeEvents>;
  private isIdleLoopRunning: boolean;
  private pauseFlag: boolean;
  private callCount: number; 
  public chat: Chat | null;

  constructor(chat: Chat) {
    this.mainEvents = new Queue<AmicaLifeEvents>();
    this.isIdleLoopRunning = false;
    this.pauseFlag = false;
    this.callCount = 0;
    this.chat = chat;
    this.initializeDefaultEvents();
  }

  private initializeDefaultEvents() {
    idleEvents.forEach((event) => {
      this.mainEvents.enqueue({ events: event });
    });
  }

  //update time before idle increase by 1.5 times
  public updatedIdleTime() {
    this.callCount++;

    if (this.callCount % 3 === 0 ) {
      const idleTimeSec = Math.min(parseInt(config("time_before_idle_sec")) * 1.5, 3600);
      updateConfig("time_before_idle_sec",idleTimeSec.toString());
      console.log(`Updated time before idle to ${idleTimeSec} seconds`);
    }
  }

  public async startIdleLoop() {
    if (this.isIdleLoopRunning) {
      if (this.pauseFlag === true) {
        this.resume();
      }
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

        // Random chance for doing nothing (25% chance)
        if (Math.random() <= 0.25) {
          console.log("Handling idle event:","Doing nothing this cycle");
          await this.waitInterval();
          continue;
        }

        const idleEvent = this.mainEvents.dequeue();
        if (idleEvent) {
          this.callCount++;
          await this.handleIdleEvent(idleEvent);
          this.mainEvents.enqueue(idleEvent);
        } else {
          console.log("Handling idle event:","No idle events in queue");
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
      return ;
    }

    this.isIdleLoopRunning = false;
  }

  public async pause() {
    let prevFlag = this.pauseFlag;
    // if receiving message from user and idle loop is unavailable
    if (config("amica_life_enabled") === "false") {
      return ;
    }

    // Updated time before idle every curve when its get ignored
    if (prevFlag == false) {
      this.updatedIdleTime(); 
    }

    await this.chat?.interrupt();
    this.pauseFlag = true;
  }

  public resume() {
    if (config("amica_life_enabled") === "false") {
      return ;
    }

    this.pauseFlag = false;
  }

  public async handleIdleEvent(event: AmicaLifeEvents) {
    console.log("Handling idle event:", event.events);
    try {
      await this.chat?.receiveMessageFromUser?.(event.events, true);
    } catch (error) {
      console.error(
        "Error occurred while trying to use the chat instance:",
        error,
      );
    }
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

  private async checkPause() {
    if (this.pauseFlag) {
      console.log("Idle loop paused");
      await new Promise<void>((resolve) => {
        const checkPause = setInterval(() => {
          if (!this.pauseFlag) {
            clearInterval(checkPause);
            resolve();
          }
        }, 50);
      });
      console.log("Idle loop resumed");
    }
  }
}
