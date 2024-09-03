import { z } from "zod";

export const SendReminderWithQRSchema = z.object({
  code: z.string(),
});

export type SendReminderWithQRRequest = z.infer<typeof SendReminderWithQRSchema>;
