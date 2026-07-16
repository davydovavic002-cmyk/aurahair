/** @deprecated Prefer /api/ai/chat. Client-safe greeting only. */
export { getInitialMessage } from "@/lib/salon-agent-shared";

export function getAiResponse(_input: string): string {
  return "Please use the live Salon Guide chat — it talks to the desk API.";
}
