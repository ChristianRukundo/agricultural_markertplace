import type { Prisma } from "@prisma/client"

// Extended Prisma types for better type safety

export type UserWithProfile = Prisma.UserGetPayload<{
  include: {
    profile: {
      include: {
        farmerProfile: true
        sellerProfile: true
      }
    }
  }
}>

export type ProductWithDetails = Prisma.ProductGetPayload<{
  include: {
    category: true
    farmer: {
      include: {
        profile: {
          select: {
            name: true
            profilePictureUrl: true
            location: true
          }
        }
      }
    }
    reviews: {
      include: {
        reviewer: {
          select: {
            profile: {
              select: {
                name: true
                profilePictureUrl: true
              }
            }
          }
        }
      }
    }
    _count: {
      select: {
        reviews: true
      }
    }
  }
}>

export type OrderWithDetails = Prisma.OrderGetPayload<{
  include: {
    seller: {
      select: {
        id: true
        profile: {
          select: {
            name: true
            profilePictureUrl: true
            contactEmail: true
            contactPhone: true
            location: true
          }
        }
        sellerProfile: {
          select: {
            businessName: true
            deliveryOptions: true
          }
        }
      }
    }
    farmer: {
      select: {
        id: true
        profile: {
          select: {
            name: true
            profilePictureUrl: true
            contactEmail: true
            contactPhone: true
            location: true
          }
        }
        farmerProfile: {
          select: {
            farmName: true
            farmLocationDetails: true
          }
        }
      }
    }
    orderItems: {
      include: {
        product: {
          select: {
            id: true
            name: true
            description: true
            imageUrls: true
            unitPrice: true
            category: {
              select: {
                name: true
              }
            }
          }
        }
      }
    }
  }
}>

export type ChatSessionWithParticipants = Prisma.ChatSessionGetPayload<{
  include: {
    participant1: {
      select: {
        id: true
        profile: {
          select: {
            name: true
            profilePictureUrl: true
          }
        }
      }
    }
    participant2: {
      select: {
        id: true
        profile: {
          select: {
            name: true
            profilePictureUrl: true
          }
        }
      }
    }
    messages: {
      take: 1
      orderBy: {
        timestamp: "desc"
      }
      select: {
        content: true
        timestamp: true
        senderId: true
        isRead: true
      }
    }
    _count: {
      select: {
        messages: {
          where: {
            isRead: false
          }
        }
      }
    }
  }
}>

export type ReviewWithAuthor = Prisma.ReviewGetPayload<{
  include: {
    reviewer: {
      select: {
        id: true
        profile: {
          select: {
            name: true
            profilePictureUrl: true
          }
        }
      }
    }
    product: {
      select: {
        id: true
        name: true
        imageUrls: true
      }
    }
  }
}>
