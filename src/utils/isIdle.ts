import { config } from "@/utils/config";

let paused = false;
let pausedAt = 0;
let totalPausedTime = 0;

export function isCharacterIdle(lastAwake: number): boolean {
  let sinceLastAwakeSec = ((new Date()).getTime() - lastAwake - totalPausedTime) / 1000;
  let timeBeforeIdleSec = parseInt(config("time_before_idle_sec"));
  return sinceLastAwakeSec >= timeBeforeIdleSec;
}

export function characterIdleTime(lastAwake: number): number {
  let sinceLastAwakeSec = ((new Date()).getTime() - lastAwake - totalPausedTime) / 1000;
  let timeBeforeIdleSec = parseInt(config("time_before_idle_sec"));
  return sinceLastAwakeSec - timeBeforeIdleSec;
}

export function pauseIdleTimer(): void {
  if (!paused) {
    paused = true;
    pausedAt = (new Date()).getTime();
  }
}

export function resumeIdleTimer(): void {
  if (paused) {
    paused = false;
    totalPausedTime += (new Date()).getTime() - pausedAt;
  }
}

export function resetIdleTimer(): void {
  paused = false;
  pausedAt = 0;
  totalPausedTime = 0;
}

const idleUtils = {
  isCharacterIdle,
  characterIdleTime,
  pauseIdleTimer,
  resumeIdleTimer,
  resetIdleTimer,
};

export default idleUtils;