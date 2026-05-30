import { config } from "@/utils/config";

export function BackendStatusLine({
  inline = false,
}: {
  inline?: boolean;
}) {
  const backend = config("chatbot_backend");
  const isDeiphobe = backend === "deiphobe";
  const backendLabel = isDeiphobe ? "Deiphobe" : backend;
  const session = isDeiphobe ? config("deiphobe_session_id") : "n/a";
  const mode = isDeiphobe ? "Local" : "Remote";

  if (inline) {
    return (
      <span className="inline-flex max-w-full items-center rounded-md bg-slate-900/60 px-2 py-1 text-[10px] font-medium text-slate-100 shadow-sm">
        <span className="whitespace-nowrap">Backend: {backendLabel}</span>
        <span className="mx-1 text-slate-400">·</span>
        <span className="whitespace-nowrap">Session: {session}</span>
        <span className="mx-1 text-slate-400">·</span>
        <span className="whitespace-nowrap">{mode}</span>
      </span>
    );
  }

  return (
    <div className="pointer-events-none fixed bottom-2 right-2 z-20 inline-flex max-w-[calc(100vw-1rem)] items-center rounded-md bg-slate-900/70 px-2.5 py-1 text-[11px] font-medium text-slate-100 shadow-lg backdrop-blur-sm sm:bottom-4 sm:right-4 sm:text-xs">
      <span className="whitespace-nowrap">
        Backend: <span className="text-white">{backendLabel}</span>
      </span>
      <span className="mx-1.5 text-slate-400">·</span>
      <span className="whitespace-nowrap">
        Session: <span className="text-white">{session}</span>
      </span>
      <span className="mx-1.5 text-slate-400">·</span>
      <span className="whitespace-nowrap">
        <span className="text-white">{mode}</span>
      </span>
    </div>
  );
}
