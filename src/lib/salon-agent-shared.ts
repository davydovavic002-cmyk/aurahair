export interface ChatMessage {
  role: "user" | "assistant";
  text: string;
}

export function getInitialMessage(): ChatMessage {
  return {
    role: "assistant",
    text: "Welcome to AURA Hair Space. I'm your salon guide — ask about services, live openings, or book a chair.\n\nTry: \"What slots next Saturday?\"",
  };
}
