import { TRPCError } from "@trpc/server";
import { createTRPCRouter, protectedProcedure } from "@/lib/trpc/server";
import {
  createChatSessionSchema,
  sendChatMessageSchema,
  getChatMessagesSchema,
  markMessagesAsReadSchema,
  getChatSessionsSchema,
} from "@/validation/chat";

/**
 * Chat functionality router
 */
export const chatRouter = createTRPCRouter({
  /**
   * Create or get existing chat session
   */
  createSession: protectedProcedure
    .input(createChatSessionSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const userId = ctx.session.user.id as string;
        const { participantId } = input;

        if (userId === participantId) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "You cannot create a chat session with yourself.",
          });
        }

        const participant = await ctx.db.user.findUnique({
          where: { id: participantId },
          select: { id: true },
        });

        if (!participant) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Participant not found.",
          });
        }

        let chatSession = await ctx.db.chatSession.findFirst({
          where: {
            OR: [
              { participant1Id: userId, participant2Id: participantId },
              { participant1Id: participantId, participant2Id: userId },
            ],
          },
          include: {
            participant1: {
              select: {
                id: true,
                profile: { select: { name: true, profilePictureUrl: true } },
              },
            },
            participant2: {
              select: {
                id: true,
                profile: { select: { name: true, profilePictureUrl: true } },
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
                  where: { isRead: false, senderId: { not: userId } },
                },
              },
            },
          },
        });

        if (chatSession) {
          return {
            success: true,
            chatSession,
          };
        }

        chatSession = await ctx.db.chatSession.create({
          data: {
            participant1Id: userId,
            participant2Id: participantId,
          },
          include: {
            participant1: {
              select: {
                id: true,
                profile: { select: { name: true, profilePictureUrl: true } },
              },
            },
            participant2: {
              select: {
                id: true,
                profile: { select: { name: true, profilePictureUrl: true } },
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
                  where: { isRead: false, senderId: { not: userId } },
                },
              },
            },
          },
        });

        return {
          success: true,
          chatSession,
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        console.error("Error creating/getting chat session:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create or retrieve chat session.",
        });
      }
    }),

  /**
   * Get user's chat sessions (conversations list)
   */
  getConversations: protectedProcedure
    .input(getChatSessionsSchema)
    .query(async ({ ctx, input }) => {
      try {
        const userId = ctx.session.user.id as string;
        const { page, limit } = input;
        const skip = (page - 1) * limit;

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
                  role: true,
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
                  role: true,
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
        ]);

        const formattedSessions = sessions.map((session) => {
          const otherParticipant =
            session.participant1.id === userId
              ? session.participant2
              : session.participant1;
          return {
            id: session.id,
            lastMessageAt: session.lastMessageAt,
            createdAt: session.createdAt,
            updatedAt: session.updatedAt,
            lastMessage: session.messages[0] || null,
            unreadCount: session._count.messages,
            participants: [
              { userId: session.participant1.id, user: session.participant1 },
              { userId: session.participant2.id, user: session.participant2 },
            ],
          };
        });

        return {
          conversations: formattedSessions,
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
          },
        };
      } catch (error) {
        console.error("Error fetching chat sessions:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch chat sessions.",
        });
      }
    }),

  /**
   * Get messages for a chat session
   */
  getMessages: protectedProcedure
    .input(getChatMessagesSchema)
    .query(async ({ ctx, input }) => {
      try {
        const userId = ctx.session.user.id as string;
        const { chatSessionId, page, limit } = input;
        const skip = (page - 1) * limit;

        const chatSession = await ctx.db.chatSession.findUnique({
          where: { id: chatSessionId },
        });

        if (!chatSession) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Chat session not found.",
          });
        }

        if (
          chatSession.participant1Id !== userId &&
          chatSession.participant2Id !== userId
        ) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You don't have access to this chat session.",
          });
        }

        const [messages, total] = await Promise.all([
          ctx.db.chatMessage.findMany({
            where: { chatSessionId },
            skip,
            take: limit,
            orderBy: { timestamp: "asc" },
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
        ]);

        return {
          messages,
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
          },
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        console.error("Error fetching messages:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch messages.",
        });
      }
    }),

  /**
   * Send a message
   */
  send: protectedProcedure
    .input(sendChatMessageSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const userId = ctx.session.user.id as string;
        const { chatSessionId, content } = input;

        const chatSession = await ctx.db.chatSession.findUnique({
          where: { id: chatSessionId },
          select: { participant1Id: true, participant2Id: true },
        });

        if (!chatSession) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Chat session not found.",
          });
        }

        if (
          chatSession.participant1Id !== userId &&
          chatSession.participant2Id !== userId
        ) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You don't have access to this chat session.",
          });
        }

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
          });

          await tx.chatSession.update({
            where: { id: chatSessionId },
            data: { lastMessageAt: new Date() },
          });

          return newMessage;
        });

        const recipientId =
          chatSession.participant1Id === userId
            ? chatSession.participant2Id
            : chatSession.participant1Id;

        await ctx.db.notification.create({
          data: {
            userId: recipientId,
            type: "MESSAGE_RECEIVED",
            content: `New message from ${
              message.sender.profile?.name || "a user"
            }`,
            relatedEntityId: chatSessionId,
            link: `/notifications?type=MESSAGE_RECEIVED&relatedEntityId=${chatSessionId}`,
          },
        });

        return {
          success: true,
          message,
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        console.error("Error sending message:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to send message.",
        });
      }
    }),

  /**
   * Mark messages in a session as read for the current user
   */
  markAsRead: protectedProcedure
    .input(markMessagesAsReadSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const userId = ctx.session.user.id as string;
        const { chatSessionId } = input;

        const chatSession = await ctx.db.chatSession.findUnique({
          where: { id: chatSessionId },
          select: { participant1Id: true, participant2Id: true },
        });

        if (!chatSession) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Chat session not found.",
          });
        }

        if (
          chatSession.participant1Id !== userId &&
          chatSession.participant2Id !== userId
        ) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You don't have access to this chat session.",
          });
        }

        const updatedCount = await ctx.db.chatMessage.updateMany({
          where: {
            chatSessionId,
            senderId: { not: userId },
            isRead: false,
          },
          data: {
            isRead: true,
          },
        });

        return {
          success: true,
          message: `${updatedCount.count} messages marked as read.`,
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        console.error("Error marking messages as read:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to mark messages as read.",
        });
      }
    }),
});
