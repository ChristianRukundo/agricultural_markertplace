import { z } from "zod"
import { paginationSchema } from "@/lib/utils/validation"

export const createChatSessionSchema = z.object({
  participantId: z.string().cuid("Invalid participant ID"),
})

export const sendChatMessageSchema = z.object({
  chatSessionId: z.string().cuid("Invalid chat session ID"),
  content: z.string().min(1, "Message content is required").max(1000, "Message too long"),
})

export const getChatMessagesSchema = z.object({
  chatSessionId: z.string().cuid("Invalid chat session ID"),
  ...paginationSchema.shape,
})

export const markMessagesAsReadSchema = z.object({
  chatSessionId: z.string().cuid("Invalid chat session ID"),
})

export const getChatSessionsSchema = paginationSchema

export type CreateChatSessionInput = z.infer<typeof createChatSessionSchema>
export type SendChatMessageInput = z.infer<typeof sendChatMessageSchema>
export type GetChatMessagesInput = z.infer<typeof getChatMessagesSchema>
export type MarkMessagesAsReadInput = z.infer<typeof markMessagesAsReadSchema>
export type GetChatSessionsInput = z.infer<typeof getChatSessionsSchema>
