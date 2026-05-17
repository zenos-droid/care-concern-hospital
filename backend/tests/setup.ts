process.env.NODE_ENV = "test";
process.env.DATABASE_URL = process.env.DATABASE_URL ?? "postgresql://postgres:postgres@localhost:5432/care_concern_test?schema=public";
process.env.JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET ?? "test-access-secret-with-at-least-thirty-two-characters";
process.env.JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET ?? "test-refresh-secret-with-at-least-thirty-two-characters";
process.env.CORS_ORIGINS = process.env.CORS_ORIGINS ?? "http://localhost:3000";
