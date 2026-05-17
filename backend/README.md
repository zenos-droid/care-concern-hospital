# Care Concern Hospital Backend

Production-ready Express + TypeScript + PostgreSQL API for the Care Concern Hospital React/Vite frontend.

## API Surface

- Public hospital data: departments, doctors, chatbot helper
- Public appointment booking for the existing frontend ticket flow
- JWT auth: signup, login, logout, refresh, forgot password, reset password
- RBAC: Admin, Doctor, Receptionist, Patient
- Appointment lifecycle: create, update, cancel, approve, check-in, queue
- Dashboards: admin, doctor, reception, patient
- Patients and medical records
- Notifications, audit logs, local upload storage with cloud-ready adapter boundary
- Swagger docs at `/api-docs`

## Setup Commands

```bash
cd backend
npm install
cp .env.example .env
```

Update `.env` secrets before production. Use 64+ character random values for `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET`.

## Database Setup Commands

```bash
docker compose up -d postgres
```

Or create PostgreSQL manually:

```sql
CREATE DATABASE care_concern;
```

## Migration Commands

```bash
npm run prisma:generate
npm run prisma:migrate
```

Production:

```bash
npm run prisma:deploy
```

## Seed Commands

```bash
npm run prisma:seed
```

Seeded users all use password:

```text
CareConcern@123
```

Seeded login emails:

```text
admin@careconcern.in
reception@careconcern.in
doc-mukherjee@careconcern.in
doc-sengupta@careconcern.in
doc-banerjee@careconcern.in
doc-ray@careconcern.in
doc-ghosh@careconcern.in
```

## Local Run Commands

```bash
npm run dev
```

Health check:

```bash
curl http://localhost:4000/health
```

Swagger:

```text
http://localhost:4000/api-docs
```

## Production Deployment Commands

Docker:

```bash
docker compose up --build -d
```

Render/Railway:

```bash
npm install
npm run prisma:generate
npm run build
npm run prisma:deploy
npm start
```

Set these environment variables in the platform:

```text
NODE_ENV=production
PORT=4000
DATABASE_URL=postgresql://...
JWT_ACCESS_SECRET=...
JWT_REFRESH_SECRET=...
FRONTEND_URL=https://your-frontend-domain
CORS_ORIGINS=https://your-frontend-domain
SMTP_HOST=...
SMTP_PORT=...
SMTP_USER=...
SMTP_PASS=...
MAIL_FROM=Care Concern Hospital <noreply@careconcern.in>
ENABLE_EMAIL_DELIVERY=true
```

## Frontend Integration Notes

Replace the frontend mock booking submit with:

```ts
await fetch(`${import.meta.env.VITE_API_URL}/api/v1/public/appointments`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    patientName,
    patientPhone,
    patientAge: patientAge ? Number(patientAge) : undefined,
    doctorPublicId: selectedDocId,
    departmentSlug: selectedDept,
    scheduledDate: bookingDate,
    slot: bookingSlot,
    symptoms
  })
});
```

Set:

```text
VITE_API_URL=http://localhost:4000
```
