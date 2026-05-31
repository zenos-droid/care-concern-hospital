import { z } from "zod";
import { createAppointmentSchema } from "./appointment.validator";

const bookingBody = createAppointmentSchema.shape.body;

export const createPaymentOrderSchema = z.object({
  body: z.object({
    amount: z.coerce.number().int().positive().max(500000),
    appointment: bookingBody
  })
});

export const verifyPaymentSchema = z.object({
  body: z.object({
    razorpay_order_id: z.string().min(6),
    razorpay_payment_id: z.string().min(6),
    razorpay_signature: z.string().min(20)
  })
});

export const paymentIdSchema = z.object({
  params: z.object({ id: z.string().uuid() })
});

export const refundSchema = z.object({
  params: z.object({ id: z.string().uuid() }),
  body: z.object({
    amount: z.coerce.number().int().positive().optional(),
    reason: z.string().min(3).max(500)
  })
});
