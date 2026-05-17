import swaggerJSDoc from "swagger-jsdoc";
import { env } from "./env";

export const swaggerSpec = swaggerJSDoc({
  definition: {
    openapi: "3.0.3",
    info: {
      title: "Care Concern Hospital API",
      version: "1.0.0",
      description: "Production backend API for appointments, RBAC dashboards, patients, doctors, records, notifications, and public hospital data."
    },
    servers: [{ url: env.API_BASE_URL }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT"
        }
      }
    }
  },
  apis: ["src/routes/*.ts"]
});
