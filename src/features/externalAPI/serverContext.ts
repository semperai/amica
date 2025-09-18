import { AsyncLocalStorage } from 'async_hooks';

type ServerContext = {
  sessionId?: string;
};

const storage = new AsyncLocalStorage<ServerContext>();

export function runWithServerContext<T>(context: ServerContext, fn: () => T): T {
  return storage.run(context, fn);
}

export function getServerSessionId(): string | undefined {
  return storage.getStore()?.sessionId;
}
