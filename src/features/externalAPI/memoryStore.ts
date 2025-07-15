import { getEaiSupabase } from "@/utils/supabase";
import { addClientEvents } from "./externalAPI";

// Session-scoped memory store
const serverConfig: Record<string, Record<string, string>> = {};

/**
 * Ensure a session has initialized memory.
 */
function ensureSessionMemory(sessionId: string): void {
  if (!serverConfig[sessionId]) {
    serverConfig[sessionId] = {};
  }
}

// Helper for plain object detection
function isPlainObject(val: any): val is object {
  return (
    val !== null &&
    typeof val === "object" &&
    !Array.isArray(val) &&
    !(val instanceof Date)
  );
}

export async function readStore(
  sessionId: string,
  storeName: string
): Promise<any> {
  try {
    const eaiSupabase = getEaiSupabase();
    if(!eaiSupabase) return;
    const { data, error, status } = await eaiSupabase
      .schema("external-api")
      .from(storeName)
      .select("data")
      .eq("session_id", sessionId);

    if (error && status !== 406) {
      console.error(`Supabase error reading ${storeName}:`, error.message);
      throw new Error(`Failed to read ${storeName} from Supabase.`);
    }

    if (!data?.length) return {};

    if (data.length === 1) return data[0].data ?? {};

    const allObjects = data.every(row => isPlainObject(row.data));
    const allArrays = data.every(row => Array.isArray(row.data));

    if (allObjects) return Object.assign({}, ...data.map(row => row.data));
    if (allArrays) return data.flatMap(row => row.data);

    // fallback: join strings or JSON-stringify others
    return data
      .map(row =>
        typeof row.data === "string" ? row.data : JSON.stringify(row.data)
      )
      .join(" ");

  } catch (err) {
    console.error(`Unexpected error reading ${storeName}:`, err);
    throw err;
  }
}

export async function updateStore(sessionId: string, storeName: string, newData: any): Promise<boolean> {
  try {
    // Step 1: Read current data
    const eaiSupabase = getEaiSupabase();
    if(!eaiSupabase) return false;
    const { data: existingRow, error, status } = await eaiSupabase
      .schema("external-api")
      .from(`${storeName}`)
      .select('data')
      .eq('session_id', sessionId)
      .maybeSingle();

    if (error && status !== 406) {
      console.error(`Supabase error reading ${storeName}:`, error.message);
      return false;
    }

    const existingData = existingRow?.data ?? [];

    // Step 2: Merge data depending on type
    let mergedData: any;

    if (Array.isArray(existingData)) {
      mergedData = [...existingData, newData]; // append to array
    } else if (typeof existingData === 'object' && typeof newData === 'object') {
      mergedData = { ...existingData, ...newData }; // shallow merge object
    } else {
      console.warn(`updateStore: Unexpected data type in ${storeName}, overwrite with new data`);
      mergedData = newData;
    }

    // Step 3: Upsert merged data
    const { error: upsertError } = await eaiSupabase
      .schema("external-api")
      .from(`${storeName}`)
      .upsert({
        session_id: sessionId,
        data: mergedData,
        created_at: new Date().toISOString(), // optional, if you want to update timestamps
      });

    if (upsertError) {
      console.error(`Supabase upsert failed for ${storeName}:`, upsertError.message);
      return false;
    }

    if (storeName === "subconscious") {
      addClientEvents(sessionId,"subconscious", JSON.stringify(mergedData));
    } 

    return true;
  } catch (err) {
    console.error(`Unexpected error in updateStore(${storeName}):`, err);
    return false;
  }
}


export function readServerConfig( sessionId: string) {
  ensureSessionMemory(sessionId);
  return serverConfig[sessionId];
}

export function writeServerConfig(sessionId: string, configs: Record<string, string>) {
  ensureSessionMemory(sessionId);
  serverConfig[sessionId] = configs;
}

/**
 * Optional: clear memory for a session (e.g., on disconnect or logout)
 */
export function clearSessionMemory(sessionId: string): void {
  delete serverConfig[sessionId];
}
