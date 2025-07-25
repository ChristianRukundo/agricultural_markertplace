"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useSession } from "next-auth/react"
import { Send, Search, Phone, Video, MoreVertical, Paperclip, Smile } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { FadeIn } from "@/components/animations/fade-in"
import { SlideInOnScroll } from "@/components/animations/slide-in-on-scroll"
import { useToast } from "@/hooks/use-toast"
import { api } from "@/lib/trpc/client"
import { cn } from "@/lib/utils"

export default function MessagesPage() {
  const { data: session } = useSession()
  const { toast } = useToast()
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null)
  const [messageText, setMessageText] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Fetch conversations
  const { data: conversationsData } = api.message.getConversations.useQuery({
    page: 1,
    limit: 50,
  })

  // Fetch messages for selected conversation
  const { data: messagesData, refetch: refetchMessages } = api.message.getMessages.useQuery(
    {
      conversationId: selectedConversation!,
      page: 1,
      limit: 50,
    },
    { enabled: !!selectedConversation },
  )

  // Send message mutation
  const sendMessageMutation = api.message.send.useMutation({
    onSuccess: () => {
      setMessageText("")
      refetchMessages()
      toast({
        title: "Message Sent",
        description: "Your message has been sent successfully.",
      })
    },
    onError: (error) => {
      toast({
        title: "Failed to Send",
        description: error.message || "Failed to send message.",
        variant: "destructive",
      })
    },
  })

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messagesData])

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!messageText.trim() || !selectedConversation) return

    sendMessageMutation.mutate({
      conversationId: selectedConversation,
      content: messageText.trim(),
      messageType: "TEXT",
    })
  }

  const filteredConversations =
    conversationsData?.conversations.filter((conv) =>
      conv.participants.some((p) => p.user.profile?.name?.toLowerCase().includes(searchTerm.toLowerCase())),
    ) || []

  const selectedConversationData = conversationsData?.conversations.find((conv) => conv.id === selectedConversation)

  const otherParticipant = selectedConversationData?.participants.find((p) => p.userId !== session?.user.id)

  return (
    <div className="h-[calc(100vh-8rem)] flex">
      {/* Conversations List */}
      <div className="w-1/3 border-r border-border flex flex-col">
        <FadeIn>
          <div className="p-4 border-b border-border">
            <h1 className="text-2xl font-bold mb-4">Messages</h1>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </FadeIn>

        <div className="flex-1 overflow-y-auto">
          {filteredConversations.length > 0 ? (
            filteredConversations.map((conversation, index) => {
              const otherUser = conversation.participants.find((p) => p.userId !== session?.user.id)
              const lastMessage = conversation.lastMessage
              const isSelected = selectedConversation === conversation.id

              return (
                <SlideInOnScroll key={conversation.id} delay={index * 0.05}>
                  <div
                    onClick={() => setSelectedConversation(conversation.id)}
                    className={cn(
                      "p-4 border-b border-border cursor-pointer hover:bg-muted/50 transition-colors",
                      isSelected && "bg-primary/10 border-primary/20",
                    )}
                  >
                    <div className="flex items-start space-x-3">
                      {/* Avatar */}
                      <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-medium">
                          {otherUser?.user.profile?.name?.charAt(0) || "U"}
                        </span>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-medium truncate">{otherUser?.user.profile?.name || "Unknown User"}</h3>
                          {lastMessage && (
                            <span className="text-xs text-muted-foreground">
                              {new Date(lastMessage.createdAt).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          )}
                        </div>

                        {lastMessage && (
                          <p className="text-sm text-muted-foreground truncate">
                            {lastMessage.senderId === session?.user.id ? "You: " : ""}
                            {lastMessage.content}
                          </p>
                        )}

                        {conversation.unreadCount > 0 && (
                          <div className="mt-2">
                            <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-medium text-white bg-primary rounded-full">
                              {conversation.unreadCount}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </SlideInOnScroll>
              )
            })
          ) : (
            <div className="p-8 text-center">
              <p className="text-muted-foreground">No conversations found</p>
            </div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <FadeIn>
              <div className="p-4 border-b border-border flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center">
                    <span className="text-white font-medium">
                      {otherParticipant?.user.profile?.name?.charAt(0) || "U"}
                    </span>
                  </div>
                  <div>
                    <h2 className="font-semibold">{otherParticipant?.user.profile?.name || "Unknown User"}</h2>
                    <p className="text-sm text-muted-foreground">
                      {otherParticipant?.user.role === "FARMER" ? "Farmer" : "Seller"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm">
                    <Phone className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Video className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </FadeIn>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messagesData?.messages.map((message, index) => {
                const isOwn = message.senderId === session?.user.id
                const showAvatar = index === 0 || messagesData.messages[index - 1].senderId !== message.senderId

                return (
                  <SlideInOnScroll key={message.id} delay={index * 0.02}>
                    <div className={cn("flex", isOwn ? "justify-end" : "justify-start")}>
                      <div className={cn("flex max-w-[70%]", isOwn ? "flex-row-reverse" : "flex-row")}>
                        {/* Avatar */}
                        <div className={cn("w-8 h-8 flex-shrink-0", isOwn ? "ml-2" : "mr-2")}>
                          {showAvatar && (
                            <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center">
                              <span className="text-white text-sm font-medium">
                                {isOwn
                                  ? session?.user.name?.charAt(0) || "Y"
                                  : otherParticipant?.user.profile?.name?.charAt(0) || "U"}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Message Bubble */}
                        <div
                          className={cn(
                            "px-4 py-2 rounded-2xl",
                            isOwn ? "bg-primary text-primary-foreground rounded-br-md" : "bg-muted rounded-bl-md",
                          )}
                        >
                          <p className="text-sm">{message.content}</p>
                          <p
                            className={cn(
                              "text-xs mt-1",
                              isOwn ? "text-primary-foreground/70" : "text-muted-foreground",
                            )}
                          >
                            {new Date(message.createdAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                  </SlideInOnScroll>
                )
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-border">
              <form onSubmit={handleSendMessage} className="flex items-end space-x-2">
                <div className="flex-1">
                  <Textarea
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder="Type your message..."
                    rows={1}
                    className="resize-none"
                    onKeyPress={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault()
                        handleSendMessage(e)
                      }
                    }}
                  />
                </div>
                <div className="flex items-center space-x-1">
                  <Button type="button" variant="ghost" size="sm">
                    <Paperclip className="w-4 h-4" />
                  </Button>
                  <Button type="button" variant="ghost" size="sm">
                    <Smile className="w-4 h-4" />
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    disabled={!messageText.trim() || sendMessageMutation.isPending}
                    className="bg-gradient-primary text-white"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Send className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Select a conversation</h3>
              <p className="text-muted-foreground">Choose a conversation from the list to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
