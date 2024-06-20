import { config } from "@/utils/config";

export function isCharacterIdle(lastAwake: number): boolean {
  let sinceLastAwakeSec = ((new Date()).getTime() - lastAwake) / 1000;
  let timeBeforeIdleSec = parseInt(config("time_before_idle_sec"));
  return sinceLastAwakeSec >= timeBeforeIdleSec;
}

export function characterIdleTime(lastAwake: number): number {
  let sinceLastAwakeSec = ((new Date()).getTime() - lastAwake) / 1000;
  let timeBeforeIdleSec = parseInt(config("time_before_idle_sec"));
  return sinceLastAwakeSec - timeBeforeIdleSec;
}

const idleUtils = {
  isCharacterIdle,
  characterIdleTime,
};

export default idleUtils;