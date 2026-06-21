import express, { type Express, type Request, type Response } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import { existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);

// Serve admin UI static files in production
if (process.env.NODE_ENV === "production") {
  const __dirname = dirname(fileURLToPath(import.meta.url));
  const adminDist = join(__dirname, "../../livechat-admin/dist/public");
  if (existsSync(adminDist)) {
    app.use(express.static(adminDist));
    app.get("*", (_req: Request, res: Response) => {
      res.sendFile(join(adminDist, "index.html"));
    });
    logger.info({ adminDist }, "Serving admin UI from static build");
  } else {
    logger.warn({ adminDist }, "Admin UI build not found — UI will not be served");
  }
}

export default app;
