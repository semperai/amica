import { config, defaults, prefixed } from "@/utils/config";
import { randomBytes } from "crypto";
import { Message } from "../chat/messages";
import { TimestampedPrompt } from "../amicaLife/eventHandler";
import { getEaiSupabase } from "@/utils/supabase";

const SCHEMA = "external-api";
const TABLES = ["configs", "user_input_messages", "chat_logs", "subconscious", "logs", "events"];

export const generateSessionId = (sessionId?: string): string =>
  sessionId || randomBytes(8).toString("hex");

// Unified upsert helper
async function upsertToTable(table: string, payload: Record<string, any>) {
  if (config("external_api_enabled") !== "true") return;

  const eaiSupabase = getEaiSupabase()
  if (!eaiSupabase) return;
  const { error } = await eaiSupabase
    .schema(SCHEMA)
    .from(table)
    .upsert(payload);

  if (error) {
    console.error(`Supabase upsert error in table "${table}":`, error.message);
    return null;
  }
}

// Individual handlers
export async function handleConfig() {
  const sessionId = generateSessionId();
  let data: Record<string, string> = {};
  
  for (const key in defaults) {
    const localKey = prefixed(key);
    data[key] = localStorage.getItem(localKey) ?? (defaults as any)[key];
  }

  await upsertToTable("configs", { session_id: sessionId, data });
  return sessionId;
}

export async function handleUserInput(messages: Message[]) {
  await upsertToTable("user_input_messages", {
    session_id: config("session_id"),
    data: messages,
  });
}

export async function handleChatLogs(messages: Message[]) {
  await upsertToTable("chat_logs", {
    session_id: config("session_id"),
    data: messages,
  });
}

export async function handleSubconscious(sessionId: string, data: TimestampedPrompt[]) {
  await upsertToTable("subconscious", {
    session_id: sessionId,
    data,
  });
}

export async function handleLogs(sessionId: string, logs: any[]) {
  await upsertToTable("logs", {
    session_id: sessionId,
    data: logs,
  });
}

export async function addClientEvents(sessionId: string, type: string, data: string) {
  const eaiSupabase = getEaiSupabase();
  if (!eaiSupabase) return;
  await eaiSupabase
    .schema(SCHEMA)
    .from("events")
    .insert({ session_id: sessionId, type, data });
}

// 🔥 New: Delete all rows for a session across all tables
export async function deleteAllSessionData(sessionId: string) {
  if (config("external_api_enabled") !== "true") return;

  const errors = [];
  const eaiSupabase = getEaiSupabase();
  
  if(!eaiSupabase) return;

  for (const table of TABLES) {
    const { error } = await eaiSupabase
      .schema(SCHEMA)
      .from(table)
      .delete()
      .eq("session_id", sessionId);

    if (error) {
      console.error(`Failed to delete from "${table}" for session ${sessionId}:`, error.message);
      errors.push({ table, error });
    }
  }

  return errors.length ? { success: false, errors } : { success: true };
}
