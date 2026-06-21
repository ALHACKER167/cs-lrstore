import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const adminSettingsTable = pgTable("admin_settings", {
  id: serial("id").primaryKey(),
  systemPrompt: text("system_prompt").notNull().default(""),
  businessName: text("business_name").notNull().default("LRSTORE"),
  businessDescription: text("business_description").notNull().default(""),
  welcomeMessage: text("welcome_message").notNull().default("Halo! Selamat datang di LRSTORE. Ada yang bisa kami bantu?"),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertAdminSettingsSchema = createInsertSchema(adminSettingsTable).omit({ id: true, updatedAt: true });
export type InsertAdminSettings = z.infer<typeof insertAdminSettingsSchema>;
export type AdminSettings = typeof adminSettingsTable.$inferSelect;
