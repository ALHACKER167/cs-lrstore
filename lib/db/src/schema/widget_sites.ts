import { pgTable, serial, text, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const widgetSitesTable = pgTable("widget_sites", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  domain: text("domain").notNull(),
  widgetToken: text("widget_token").notNull().unique(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertWidgetSiteSchema = createInsertSchema(widgetSitesTable).omit({ id: true, createdAt: true });
export type InsertWidgetSite = z.infer<typeof insertWidgetSiteSchema>;
export type WidgetSite = typeof widgetSitesTable.$inferSelect;
