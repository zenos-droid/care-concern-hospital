import compression from "compression";
import cors from "cors";
import express from "express";
import mongoSanitize from "express-mongo-sanitize";
import helmet from "helmet";
import hpp from "hpp";
import morgan from "morgan";
import path from "path";
import { v4 as uuid } from "uuid";
import swaggerUi from "swagger-ui-express";
import { corsOrigins, env } from "./config/env";
import { logger } from "./config/logger";
import { swaggerSpec } from "./config/swagger";
import { apiRateLimiter } from "./middleware/rateLimiter";
import { errorHandler } from "./middleware/errorHandler";
import { notFoundHandler } from "./middleware/notFound";
import { sanitizeDeep } from "./utils/sanitize";
import { authRouter } from "./routes/auth.routes";
import { publicRouter } from "./routes/public.routes";
import { appointmentRouter } from "./routes/appointment.routes";
import { dashboardRouter } from "./routes/dashboard.routes";
import { patientRouter } from "./routes/patient.routes";
import { medicalRecordRouter } from "./routes/medicalRecord.routes";
import { uploadRouter } from "./routes/upload.routes";

export const createApp = () => {
  const app = express();

  app.disable("x-powered-by");
  app.use((req, res, next) => {
    req.requestId = uuid();
    res.setHeader("x-request-id", req.requestId);
    next();
  });

  app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
  app.use(cors({
    origin: (origin, callback) => {
      if (!origin || corsOrigins.includes(origin) || origin.endsWith(".vercel.app")) return callback(null, true);
      return callback(new Error("CORS origin denied"));
    },
    credentials: true
  }));
  app.use(compression());
  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: true, limit: "1mb" }));
  app.use(mongoSanitize());
  app.use(hpp());
  app.use((req, _res, next) => {
    req.body = sanitizeDeep(req.body);
    req.query = sanitizeDeep(req.query);
    req.params = sanitizeDeep(req.params);
    next();
  });
  app.use(morgan("combined", { stream: { write: (message) => logger.info(message.trim()) } }));
  app.use(apiRateLimiter);

  app.use("/uploads", express.static(path.resolve(env.UPLOAD_DIR), { fallthrough: false }));
  app.get("/health", (_req, res) => res.json({ success: true, data: { status: "ok", service: "care-concern-api" } }));
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  app.use("/api/v1/auth", authRouter);
  app.use("/api/v1/public", publicRouter);
  app.use("/api/v1/appointments", appointmentRouter);
  app.use("/api/v1/dashboards", dashboardRouter);
  app.use("/api/v1/patients", patientRouter);
  app.use("/api/v1/medical-records", medicalRecordRouter);
  app.use("/api/v1/uploads", uploadRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
};
