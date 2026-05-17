import { z } from "zod";

export const chatbotSchema = z.object({
  body: z.object({
    message: z.string().min(1).max(1000),
    history: z.array(z.object({ sender: z.enum(["user", "bot"]), text: z.string().max(2000) })).max(20).default([])
  })
});
