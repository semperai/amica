import { handleFunctionCalling } from "@/features/functionCalling/eventHandler";

export async function functionCalling(event: string) {
  const functionCallingResult = await handleFunctionCalling(event);
  return functionCallingResult;
}
