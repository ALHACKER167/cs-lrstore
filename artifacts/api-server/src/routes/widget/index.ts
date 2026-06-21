import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, widgetSitesTable } from "@workspace/db";
import path from "path";
import fs from "fs";

const router: IRouter = Router();

const workspaceRoot = process.cwd().endsWith(path.join("artifacts", "api-server"))
  ? path.resolve(process.cwd(), "../..")
  : process.cwd();

router.get("/widget", async (req, res): Promise<void> => {
  const token = typeof req.query["token"] === "string" ? req.query["token"] : "";

  if (!token) {
    res.status(400).send("Missing widget token");
    return;
  }

  const [site] = await db.select().from(widgetSitesTable).where(eq(widgetSitesTable.widgetToken, token));
  if (!site || !site.isActive) {
    res.status(403).send("Invalid or inactive widget token");
    return;
  }

  const widgetHtmlPath = path.resolve(workspaceRoot, "artifacts/api-server/src/widget/widget.html");
  if (fs.existsSync(widgetHtmlPath)) {
    let html = fs.readFileSync(widgetHtmlPath, "utf-8");
    html = html.replace("__WIDGET_TOKEN__", token).replace("__SITE_NAME__", site.name);
    res.setHeader("Content-Type", "text/html");
    res.setHeader("X-Frame-Options", "ALLOWALL");
    res.setHeader("Content-Security-Policy", "frame-ancestors *");
    res.send(html);
  } else {
    res.status(500).send("Widget template not found");
  }
});

router.get("/widget.js", async (req, res): Promise<void> => {
  const scriptPath = path.resolve(workspaceRoot, "artifacts/api-server/src/widget/widget-loader.js");
  if (fs.existsSync(scriptPath)) {
    res.setHeader("Content-Type", "application/javascript");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.sendFile(scriptPath);
  } else {
    res.status(404).send("Widget loader not found");
  }
});

export default router;
