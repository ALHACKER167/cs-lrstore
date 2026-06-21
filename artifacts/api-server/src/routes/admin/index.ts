import { Router, type IRouter } from "express";
import { eq, count, sql } from "drizzle-orm";
import { db, conversations, messages, widgetSitesTable, adminSettingsTable } from "@workspace/db";
import {
  GetWidgetSiteParams,
  UpdateWidgetSiteParams,
  UpdateWidgetSiteBody,
  DeleteWidgetSiteParams,
  RegenerateWidgetTokenParams,
  UpdateAdminSettingsBody,
  GetAdminConversationParams,
  CreateWidgetSiteBody,
} from "@workspace/api-zod";
import crypto from "crypto";

const router: IRouter = Router();

async function getOrCreateSettings() {
  const [existing] = await db.select().from(adminSettingsTable).limit(1);
  if (existing) return existing;
  const [created] = await db.insert(adminSettingsTable).values({
    systemPrompt: `Anda adalah asisten AI LRSTORE yang cerdas, ramah, dan profesional. LRSTORE adalah toko topup game online terpercaya di Indonesia.

Website: www.lrstore.id
Login: https://lrstore.id/login
Daftar: https://lrstore.id/register
Daftar harga: https://lrstore.id/daftar-harga
Cari transaksi: https://lrstore.id/cari

Tugas utama Anda:
1. Menjawab pertanyaan customer dengan ramah, sopan, dan profesional — bahkan jika customer marah, tetap tenang dan membantu
2. Membantu status topup: jika customer memberikan kode invoice, cek statusnya
3. Membantu pendaftaran: minta data Nama lengkap, Username, No. WhatsApp, Kata sandi
4. Informasikan produk dan harga di https://lrstore.id/daftar-harga
5. Jika topup Pending: "Kami cek status Anda pending. Kendala Anda sedang ditangani pihak terkait. Mohon kesediaan menunggu 1x24 jam."
6. JANGAN minta atau menyimpan informasi login (username/password) customer karena dapat membahayakan akun mereka
7. Selalu jawab dalam Bahasa Indonesia yang baik dan sopan`,
    businessName: "LRSTORE",
    businessDescription: "Toko topup game online terpercaya di Indonesia",
    welcomeMessage: "Halo! Selamat datang di LRSTORE. Ada yang bisa kami bantu?",
  }).returning();
  return created;
}

router.get("/admin/settings", async (_req, res): Promise<void> => {
  const settings = await getOrCreateSettings();
  res.json({
    id: settings.id,
    systemPrompt: settings.systemPrompt,
    businessName: settings.businessName,
    businessDescription: settings.businessDescription,
    welcomeMessage: settings.welcomeMessage,
    updatedAt: settings.updatedAt,
  });
});

router.patch("/admin/settings", async (req, res): Promise<void> => {
  const body = UpdateAdminSettingsBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }
  const settings = await getOrCreateSettings();
  const [updated] = await db
    .update(adminSettingsTable)
    .set({ ...body.data, updatedAt: new Date() })
    .where(eq(adminSettingsTable.id, settings.id))
    .returning();
  res.json({
    id: updated.id,
    systemPrompt: updated.systemPrompt,
    businessName: updated.businessName,
    businessDescription: updated.businessDescription,
    welcomeMessage: updated.welcomeMessage,
    updatedAt: updated.updatedAt,
  });
});

router.get("/admin/widget-sites", async (_req, res): Promise<void> => {
  const sites = await db.select().from(widgetSitesTable).orderBy(widgetSitesTable.createdAt);
  res.json(sites);
});

router.post("/admin/widget-sites", async (req, res): Promise<void> => {
  const body = CreateWidgetSiteBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }
  const widgetToken = crypto.randomBytes(32).toString("hex");
  const [site] = await db.insert(widgetSitesTable).values({ ...body.data, widgetToken }).returning();
  res.status(201).json(site);
});

router.get("/admin/widget-sites/:id", async (req, res): Promise<void> => {
  const params = GetWidgetSiteParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [site] = await db.select().from(widgetSitesTable).where(eq(widgetSitesTable.id, params.data.id));
  if (!site) {
    res.status(404).json({ error: "Widget site not found" });
    return;
  }
  res.json(site);
});

router.patch("/admin/widget-sites/:id", async (req, res): Promise<void> => {
  const params = UpdateWidgetSiteParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const body = UpdateWidgetSiteBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }
  const [site] = await db
    .update(widgetSitesTable)
    .set(body.data)
    .where(eq(widgetSitesTable.id, params.data.id))
    .returning();
  if (!site) {
    res.status(404).json({ error: "Widget site not found" });
    return;
  }
  res.json(site);
});

router.delete("/admin/widget-sites/:id", async (req, res): Promise<void> => {
  const params = DeleteWidgetSiteParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [site] = await db.delete(widgetSitesTable).where(eq(widgetSitesTable.id, params.data.id)).returning();
  if (!site) {
    res.status(404).json({ error: "Widget site not found" });
    return;
  }
  res.sendStatus(204);
});

router.post("/admin/widget-sites/:id/regenerate-token", async (req, res): Promise<void> => {
  const params = RegenerateWidgetTokenParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const newToken = crypto.randomBytes(32).toString("hex");
  const [site] = await db
    .update(widgetSitesTable)
    .set({ widgetToken: newToken })
    .where(eq(widgetSitesTable.id, params.data.id))
    .returning();
  if (!site) {
    res.status(404).json({ error: "Widget site not found" });
    return;
  }
  res.json(site);
});

router.get("/admin/conversations", async (_req, res): Promise<void> => {
  const convs = await db.select().from(conversations).orderBy(sql`${conversations.createdAt} desc`);
  const result = await Promise.all(
    convs.map(async (c) => {
      const [{ count: msgCount }] = await db
        .select({ count: count() })
        .from(messages)
        .where(eq(messages.conversationId, c.id));
      return {
        id: c.id,
        title: c.title,
        visitorName: c.title,
        messageCount: Number(msgCount),
        createdAt: c.createdAt,
      };
    })
  );
  res.json(result);
});

router.get("/admin/conversations/:id", async (req, res): Promise<void> => {
  const params = GetAdminConversationParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [conv] = await db.select().from(conversations).where(eq(conversations.id, params.data.id));
  if (!conv) {
    res.status(404).json({ error: "Conversation not found" });
    return;
  }
  const msgs = await db
    .select()
    .from(messages)
    .where(eq(messages.conversationId, conv.id))
    .orderBy(messages.createdAt);
  res.json({
    id: conv.id,
    title: conv.title,
    createdAt: conv.createdAt,
    messages: msgs.map((m) => ({
      id: m.id,
      conversationId: m.conversationId,
      role: m.role,
      content: m.content,
      createdAt: m.createdAt,
    })),
  });
});

router.get("/admin/stats", async (_req, res): Promise<void> => {
  const [{ count: totalConvs }] = await db.select({ count: count() }).from(conversations);
  const [{ count: totalMsgs }] = await db.select({ count: count() }).from(messages);
  const [{ count: activeSites }] = await db
    .select({ count: count() })
    .from(widgetSitesTable)
    .where(eq(widgetSitesTable.isActive, true));
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const [{ count: todayConvs }] = await db
    .select({ count: count() })
    .from(conversations)
    .where(sql`${conversations.createdAt} >= ${today}`);
  res.json({
    totalConversations: Number(totalConvs),
    totalMessages: Number(totalMsgs),
    activeWidgetSites: Number(activeSites),
    conversationsToday: Number(todayConvs),
  });
});

export default router;
