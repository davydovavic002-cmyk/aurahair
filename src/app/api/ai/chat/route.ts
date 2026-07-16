import { NextResponse } from "next/server";
import {
  getInitialMessage,
  runSalonAgent,
  type ChatMessage,
} from "@/lib/salon-agent";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const messages = (body.messages ?? []) as ChatMessage[];
    const sessionId = String(body.sessionId ?? "web");

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({
        reply: getInitialMessage().text,
      });
    }

    const reply = runSalonAgent(messages, sessionId);
    return NextResponse.json(reply);
  } catch {
    return NextResponse.json(
      { error: "Could not process chat." },
      { status: 400 },
    );
  }
}
