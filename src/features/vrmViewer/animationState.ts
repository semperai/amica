const FALLBACK_STATE = "idle";
const FALLBACK_ANIMATION_PATH = "/animations/Relax.vrma";

type AnimationStateMap = Record<string, string>;

let cachedStateMap: AnimationStateMap | null = null;
let cachedStateMapPromise: Promise<AnimationStateMap> | null = null;

async function loadAnimationStateMap(): Promise<AnimationStateMap> {
  if (cachedStateMap) {
    return cachedStateMap;
  }

  if (!cachedStateMapPromise) {
    cachedStateMapPromise = fetch("/deiphobe/animation-state-map.json", {
      cache: "force-cache",
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`Failed to load animation state map: ${response.status}`);
        }

        const data = (await response.json()) as unknown;
        if (!data || typeof data !== "object") {
          throw new Error("Animation state map is not a JSON object.");
        }

        cachedStateMap = data as AnimationStateMap;
        return cachedStateMap;
      })
      .catch((error) => {
        console.warn("Falling back to built-in animation state fallback:", error);
        cachedStateMap = {};
        return cachedStateMap;
      });
  }

  return cachedStateMapPromise;
}

export async function resolveAnimationStatePath(
  animationState: string | null | undefined,
): Promise<string> {
  const normalizedState = (animationState ?? "").trim().toLowerCase();
  const stateMap = await loadAnimationStateMap();

  const resolvedPath =
    stateMap[normalizedState] ??
    stateMap[FALLBACK_STATE] ??
    FALLBACK_ANIMATION_PATH;

  if (!stateMap[normalizedState]) {
    console.warn(
      `Unknown animation state "${normalizedState || "(empty)"}", falling back to idle.`,
    );
  }

  return resolvedPath;
}

export function selectAnimationStateFromExpression(
  expression: string | null | undefined,
): string | null {
  const normalizedExpression = (expression ?? "").trim().toLowerCase();

  switch (normalizedExpression) {
    case "happy":
      return "happy";
    case "sad":
      return "sad";
    case "surprised":
      return "surprised";
    case "angry":
      return "boundary";
    case "love":
      return "warm";
    case "shy":
    case "jealous":
      return "warm";
    case "victory":
      return "success";
    case "sleep":
      return "standby";
    case "serious":
      return "thinking";
    case "suspicious":
      return "searching";
    case "bored":
      return "idle";
    case "relaxed":
    case "neutral":
      return "idle";
    default:
      // TODO: map additional reasoning categories such as search/web,
      // success, goodbye, concern, and energetic once the upstream
      // response contract exposes them consistently.
      return null;
  }
}

export function selectAnimationStateFromPayload(payload: any): string | null {
  const explicitState =
    typeof payload?.animation_state === "string"
      ? payload.animation_state.trim().toLowerCase()
      : "";

  if (explicitState) {
    return explicitState;
  }

  return null;
}
