import { Router, type IRouter } from "express";
import healthRouter from "./health";
import openaiRouter from "./openai";
import adminRouter from "./admin";
import chatRouter from "./chat";
import widgetRouter from "./widget";

const router: IRouter = Router();

router.use(healthRouter);
router.use(openaiRouter);
router.use(adminRouter);
router.use(chatRouter);
router.use(widgetRouter);

export default router;
