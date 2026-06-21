import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, conversations, messages, widgetSitesTable, adminSettingsTable } from "@workspace/db";
import { openai, aiProvider } from "@workspace/integrations-openai-ai-server";
import {
  CreateChatSessionBody,
  GetChatSessionParams,
  SendChatMessageParams,
  SendChatMessageBody,
  CheckInvoiceStatusParams,
} from "@workspace/api-zod";
import crypto from "crypto";

const router: IRouter = Router();

const chatSessions = new Map<string, { conversationId: number; visitorName: string; widgetToken: string }>();

router.post("/chat/sessions", async (req, res): Promise<void> => {
  const body = CreateChatSessionBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }

  const [site] = await db
    .select()
    .from(widgetSitesTable)
    .where(eq(widgetSitesTable.widgetToken, body.data.widgetToken));

  if (!site || !site.isActive) {
    res.status(403).json({ error: "Invalid or inactive widget token" });
    return;
  }

  const [settings] = await db.select().from(adminSettingsTable).limit(1);
  const welcomeMessage = settings?.welcomeMessage ?? "Halo! Ada yang bisa kami bantu?";

  const [conv] = await db
    .insert(conversations)
    .values({ title: `Chat dari ${body.data.visitorName}` })
    .returning();

  if (settings?.systemPrompt) {
    await db.insert(messages).values({
      conversationId: conv.id,
      role: "system",
      content: settings.systemPrompt,
    });
  }

  await db.insert(messages).values({
    conversationId: conv.id,
    role: "assistant",
    content: welcomeMessage,
  });

  const sessionId = crypto.randomBytes(16).toString("hex");
  chatSessions.set(sessionId, {
    conversationId: conv.id,
    visitorName: body.data.visitorName,
    widgetToken: body.data.widgetToken,
  });

  res.status(201).json({
    id: conv.id,
    sessionId,
    visitorName: body.data.visitorName,
    widgetToken: body.data.widgetToken,
    conversationId: conv.id,
    createdAt: conv.createdAt,
  });
});

router.get("/chat/sessions/:sessionId", async (req, res): Promise<void> => {
  const params = GetChatSessionParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const session = chatSessions.get(params.data.sessionId);
  if (!session) {
    res.status(404).json({ error: "Session not found" });
    return;
  }

  const [conv] = await db
    .select()
    .from(conversations)
    .where(eq(conversations.id, session.conversationId));

  const msgs = await db
    .select()
    .from(messages)
    .where(eq(messages.conversationId, session.conversationId))
    .orderBy(messages.createdAt);

  const publicMessages = msgs.filter((m) => m.role !== "system");

  res.json({
    id: conv.id,
    sessionId: params.data.sessionId,
    visitorName: session.visitorName,
    conversationId: session.conversationId,
    createdAt: conv.createdAt,
    messages: publicMessages.map((m) => ({
      id: m.id,
      role: m.role,
      content: m.content,
      createdAt: m.createdAt,
    })),
  });
});

router.post("/chat/sessions/:sessionId/messages", async (req, res): Promise<void> => {
  const params = SendChatMessageParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const body = SendChatMessageBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }

  const session = chatSessions.get(params.data.sessionId);
  if (!session) {
    res.status(404).json({ error: "Session not found" });
    return;
  }

  await db.insert(messages).values({
    conversationId: session.conversationId,
    role: "user",
    content: body.data.content,
  });

  const history = await db
    .select()
    .from(messages)
    .where(eq(messages.conversationId, session.conversationId))
    .orderBy(messages.createdAt);

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  let fullResponse = "";
  const model = aiProvider === "groq" ? "llama-3.3-70b-versatile" : "gpt-4o";
  const stream = await openai.chat.completions.create({
    model,
    max_tokens: 2048,
    messages: history.map((m) => ({
      role: m.role as "user" | "assistant" | "system",
      content: m.content,
    })),
    stream: true,
  });

  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content;
    if (content) {
      fullResponse += content;
      res.write(`data: ${JSON.stringify({ content })}\n\n`);
    }
  }

  await db.insert(messages).values({
    conversationId: session.conversationId,
    role: "assistant",
    content: fullResponse,
  });

  res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
  res.end();
});

router.get("/chat/check-invoice/:invoiceCode", async (req, res): Promise<void> => {
  const params = CheckInvoiceStatusParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  try {
    const response = await fetch(`https://lrstore.id/cari?invoice=${encodeURIComponent(params.data.invoiceCode)}`, {
      headers: { "User-Agent": "LRSTORE-ChatBot/1.0" },
      signal: AbortSignal.timeout(10000),
    });
    const html = await response.text();
    const isPending = html.toLowerCase().includes("pending");
    const isSuccess = html.toLowerCase().includes("success") || html.toLowerCase().includes("berhasil");
    const isFailed = html.toLowerCase().includes("failed") || html.toLowerCase().includes("gagal");

    let status = "unknown";
    if (isPending) status = "pending";
    else if (isSuccess) status = "success";
    else if (isFailed) status = "failed";

    res.json({
      invoiceCode: params.data.invoiceCode,
      status,
      found: status !== "unknown",
    });
  } catch {
    res.json({
      invoiceCode: params.data.invoiceCode,
      status: "unknown",
      found: false,
    });
  }
});

export default router;
