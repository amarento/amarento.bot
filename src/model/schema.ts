import { z } from "zod";

export const SendMessageRequestSchema = z.object({
  code: z.string(),
});

export type SendMessageRequest = z.infer<typeof SendMessageRequestSchema>;

export const SendReminderRequestSchema = SendMessageRequestSchema.extend({
  sendQR: z.boolean(),
});

export type SendReminderRequest = z.infer<typeof SendReminderRequestSchema>;
