import { TRPCError } from "@trpc/server"
import { createTRPCRouter, protectedProcedure } from "@/lib/trpc/server"
import {
  createChatSessionSchema,
  sendChatMessageSchema,
  getChatMessagesSchema,
  markMessagesAsReadSchema,
  getChatSessionsSchema,
} from "@/validation/chat"

/**
 * Chat functionality router
 */
export const chatRouter = createTRPCRouter({
  /**
   * Create or get existing chat session
   */
  createSession: protectedProcedure.input(createChatSessionSchema).mutation(async ({ ctx, input }) => {
    try {
      const userId = ctx.session.user.id
      const { participantId } = input

      // Verify participant exists
      const participant = await ctx.db.user.findUnique({
        where: { id: participantId },
      })

      if (!participant) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Participant not found",
        })
      }

      // Check if chat session already exists
      const existingSession = await ctx.db.chatSession.findFirst({
        where: {
          OR: [
            {
              participant1Id: userId,
              participant2Id: participantId,
            },
            {
              participant1Id: participantId,
              participant2Id: userId,
            },
          ],
        },
      })

      if (existingSession) {
        return {
          success: true,
          chatSession: existingSession,
        }
      }

      // Create new chat session
      const chatSession = await ctx.db.chatSession.create({
        data: {
          participant1Id: userId,
          participant2Id: participantId,
        },
        include: {
          participant1: {
            select: {
              id: true,
              profile: {
                select: {
                  name: true,
                  profilePictureUrl: true,
                },
              },
            },
          },
          participant2: {
            select: {
              id: true,
              profile: {
                select: {
                  name: true,
                  profilePictureUrl: true,
                },
              },
            },
          },
        },
      })

      return {
        success: true,
        chatSession,
      }
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error
      }
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to create chat session",
      })
    }
  }),

  /**
   * Get user's chat sessions
   */
  getSessions: protectedProcedure.input(getChatSessionsSchema).query(async ({ ctx, input }) => {
    try {
      const userId = ctx.session.user.id
      const { page, limit } = input
      const skip = (page - 1) * limit

      const [sessions, total] = await Promise.all([
        ctx.db.chatSession.findMany({
          where: {
            OR: [{ participant1Id: userId }, { participant2Id: userId }],
          },
          skip,
          take: limit,
          orderBy: { lastMessageAt: "desc" },
          include: {
            participant1: {
              select: {
                id: true,
                profile: {
                  select: {
                    name: true,
                    profilePictureUrl: true,
                  },
                },
              },
            },
            participant2: {
              select: {
                id: true,
                profile: {
                  select: {
                    name: true,
                    profilePictureUrl: true,
                  },
                },
              },
            },
            messages: {
              take: 1,
              orderBy: { timestamp: "desc" },
              select: {
                content: true,
                timestamp: true,
                senderId: true,
                isRead: true,
              },
            },
            _count: {
              select: {
                messages: {
                  where: {
                    isRead: false,
                    senderId: { not: userId },
                  },
                },
              },
            },
          },
        }),
        ctx.db.chatSession.count({
          where: {
            OR: [{ participant1Id: userId }, { participant2Id: userId }],
          },
        }),
      ])

      return {
        sessions,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      }
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch chat sessions",
      })
    }
  }),

  /**
   * Get messages for a chat session
   */
  getMessages: protectedProcedure.input(getChatMessagesSchema).query(async ({ ctx, input }) => {
    try {
      const userId = ctx.session.user.id
      const { chatSessionId, page, limit } = input
      const skip = (page - 1) * limit

      // Verify user has access to this chat session
      const chatSession = await ctx.db.chatSession.findUnique({
        where: { id: chatSessionId },
      })

      if (!chatSession) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Chat session not found",
        })
      }

      if (chatSession.participant1Id !== userId && chatSession.participant2Id !== userId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have access to this chat session",
        })
      }

      const [messages, total] = await Promise.all([
        ctx.db.chatMessage.findMany({
          where: { chatSessionId },
          skip,
          take: limit,
          orderBy: { timestamp: "desc" },
          include: {
            sender: {
              select: {
                id: true,
                profile: {
                  select: {
                    name: true,
                    profilePictureUrl: true,
                  },
                },
              },
            },
          },
        }),
        ctx.db.chatMessage.count({
          where: { chatSessionId },
        }),
      ])

      return {
        messages: messages.reverse(), // Reverse to show oldest first
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      }
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error
      }
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch messages",
      })
    }
  }),

  /**
   * Send a message
   */
  sendMessage: protectedProcedure.input(sendChatMessageSchema).mutation(async ({ ctx, input }) => {
    try {
      const userId = ctx.session.user.id
      const { chatSessionId, content } = input

      // Verify user has access to this chat session
      const chatSession = await ctx.db.chatSession.findUnique({
        where: { id: chatSessionId },
      })

      if (!chatSession) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Chat session not found",
        })
      }

      if (chatSession.participant1Id !== userId && chatSession.participant2Id !== userId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have access to this chat session",
        })
      }

      // Create message and update chat session
      const message = await ctx.db.$transaction(async (tx) => {
        const newMessage = await tx.chatMessage.create({
          data: {
            chatSessionId,
            senderId: userId,
            content,
          },
          include: {
            sender: {
              select: {
                id: true,
                profile: {
                  select: {
                    name: true,
                    profilePictureUrl: true,
                  },
                },
              },
            },
          },
        })

        // Update chat session last message time
        await tx.chatSession.update({
          where: { id: chatSessionId },
          data: { lastMessageAt: new Date() },
        })

        return newMessage
      })

      // Create notification for the other participant
      const recipientId =
        chatSession.participant1Id === userId ? chatSession.participant2Id : chatSession.participant1Id

      await ctx.db.notification.create({
        data: {
          userId: recipientId,
          type: "MESSAGE_RECEIVED",
          content: `New message from ${message.sender.profile?.name || "User"}`,
          relatedEntityId: chatSessionId,
        },
      })

      return {
        success: true,
        message,
      }
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error
      }
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to send message",
      })
    }
  }),

  /**
   * Mark messages as read
   */
  markAsRead: protectedProcedure.input(markMessagesAsReadSchema).mutation(async ({ ctx, input }) => {
    try {
      const userId = ctx.session.user.id
      const { chatSessionId } = input

      // Verify user has access to this chat session
      const chatSession = await ctx.db.chatSession.findUnique({
        where: { id: chatSessionId },
      })

      if (!chatSession) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Chat session not found",
        })
      }

      if (chatSession.participant1Id !== userId && chatSession.participant2Id !== userId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have access to this chat session",
        })
      }

      // Mark all unread messages from other participants as read
      await ctx.db.chatMessage.updateMany({
        where: {
          chatSessionId,
          senderId: { not: userId },
          isRead: false,
        },
        data: {
          isRead: true,
        },
      })

      return {
        success: true,
        message: "Messages marked as read",
      }
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error
      }
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to mark messages as read",
      })
    }
  }),
})
