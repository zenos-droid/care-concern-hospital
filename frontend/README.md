# Care Concern Hospital Frontend

React + Vite frontend for the Care Concern Hospital appointment platform.

## Local Setup

```bash
npm install
npm run dev
```

## Environment Variables

```text
VITE_API_URL=http://localhost:4000
VITE_RAZORPAY_KEY_ID=rzp_test_or_live_key
GEMINI_API_KEY=optional_chatbot_key
```

## Payment Flow

The booking form creates a Razorpay order through the backend, opens Razorpay Checkout, and sends the Razorpay signature payload back to the backend verification endpoint. The appointment ticket is shown only after the backend verifies the signature and creates the appointment.

Verified bookings expose print-ready pages:

- Appointment ticket: `/api/v1/payments/:id/ticket`
- Payment receipt: `/api/v1/payments/:id/receipt`

## Deployment

Use Vercel or any static host that supports Vite builds.

```bash
npm run build
```

Set `VITE_API_URL` to the deployed backend URL and `VITE_RAZORPAY_KEY_ID` to the matching Razorpay public key.
