import { z } from "zod";

export const listDoctorsSchema = z.object({
  query: z.object({
    departmentSlug: z.string().optional(),
    day: z.string().optional(),
    search: z.string().optional()
  })
});
