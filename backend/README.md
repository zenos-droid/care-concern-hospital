# Care Concern Hospital Backend

Production-ready Express + TypeScript + PostgreSQL API for the Care Concern Hospital React/Vite frontend.

## API Surface

- Public hospital data: departments, doctors, chatbot helper
- Razorpay order creation with server-side signature verification before appointment creation
- Payment history, printable ticket pages, printable receipt pages, and admin revenue analytics
- JWT auth: signup, login, logout, refresh, forgot password, reset password
- RBAC: Admin, Doctor, Receptionist, Patient
- Appointment lifecycle: create, update, cancel, approve, check-in, queue
- Dashboards: admin, doctor, reception, patient
- Patients and medical records
- Notifications, audit logs, local upload storage with cloud-ready adapter boundary
- Refund tracking and structured payment/refund audit events
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
RAZORPAY_KEY_ID=rzp_live_or_test_key
RAZORPAY_KEY_SECRET=razorpay_secret
```

## Payment Setup Guide

1. Create a Razorpay account and switch to live mode only after webhook and signature tests pass.
2. Set `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` only on the backend.
3. Set `VITE_RAZORPAY_KEY_ID` on the frontend. Do not expose the key secret.
4. The frontend creates `/api/v1/payments/create-order`, opens Razorpay Checkout, then sends `razorpay_order_id`, `razorpay_payment_id`, and `razorpay_signature` to `/api/v1/payments/verify`.
5. The backend verifies the HMAC signature and creates the appointment only after verification succeeds.

## Ticket and Receipt Pages

After a verified payment:

- Ticket: `/api/v1/payments/:id/ticket`
- Receipt: `/api/v1/payments/:id/receipt`

Both pages are print-ready and can be saved as PDF from the browser print dialog.

## Frontend Environment

Set:

```text
VITE_API_URL=http://localhost:4000
VITE_RAZORPAY_KEY_ID=rzp_test_or_live_key
```
