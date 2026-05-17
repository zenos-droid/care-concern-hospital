import path from "path";
import winston from "winston";
import { env } from "./env";

const transports: winston.transport[] = [
  new winston.transports.Console({
    format: winston.format.combine(winston.format.colorize(), winston.format.simple())
  })
];

if (env.NODE_ENV !== "test") {
  transports.push(
    new winston.transports.File({ filename: path.join("logs", "error.log"), level: "error" }),
    new winston.transports.File({ filename: path.join("logs", "combined.log") })
  );
}

export const logger = winston.createLogger({
  level: env.NODE_ENV === "production" ? "info" : "debug",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports
});
