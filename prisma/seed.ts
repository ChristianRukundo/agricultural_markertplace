import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Starting database seeding...")

  // Create categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { name: "Vegetables" },
      update: {},
      create: {
        name: "Vegetables",
        description: "Fresh vegetables and leafy greens",
        imageUrl: "/placeholder.svg?height=200&width=200",
      },
    }),
    prisma.category.upsert({
      where: { name: "Fruits" },
      update: {},
      create: {
        name: "Fruits",
        description: "Fresh seasonal fruits",
        imageUrl: "/placeholder.svg?height=200&width=200",
      },
    }),
    prisma.category.upsert({
      where: { name: "Grains" },
      update: {},
      create: {
        name: "Grains",
        description: "Rice, maize, wheat and other grains",
        imageUrl: "/placeholder.svg?height=200&width=200",
      },
    }),
    prisma.category.upsert({
      where: { name: "Legumes" },
      update: {},
      create: {
        name: "Legumes",
        description: "Beans, peas, lentils and other legumes",
        imageUrl: "/placeholder.svg?height=200&width=200",
      },
    }),
    prisma.category.upsert({
      where: { name: "Tubers" },
      update: {},
      create: {
        name: "Tubers",
        description: "Potatoes, sweet potatoes, cassava",
        imageUrl: "/placeholder.svg?height=200&width=200",
      },
    }),
  ])

  console.log(`✅ Created ${categories.length} categories`)

  // Create admin user
  const adminPassword = await bcrypt.hash("Admin123!", 12)
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@agriconnect.rw" },
    update: {},
    create: {
      email: "admin@agriconnect.rw",
      passwordHash: adminPassword,
      role: "ADMIN",
      phoneNumber: "+250788000000",
      isVerified: true,
    },
  })

  await prisma.profile.upsert({
    where: { userId: adminUser.id },
    update: {},
    create: {
      userId: adminUser.id,
      name: "System Administrator",
      location: JSON.stringify({
        province: "Kigali City",
        district: "Gasabo",
        sector: "Kacyiru",
        address: "KG 9 Ave",
      }),
      description: "AgriConnect Platform Administrator",
    },
  })

  console.log("✅ Created admin user")

  // Create sample farmers
  const farmers = []
  for (let i = 1; i <= 5; i++) {
    const farmerPassword = await bcrypt.hash("Farmer123!", 12)
    const farmer = await prisma.user.create({
      data: {
        email: `farmer${i}@example.com`,
        passwordHash: farmerPassword,
        role: "FARMER",
        phoneNumber: `+25078800000${i}`,
        isVerified: true,
      },
    })

    const profile = await prisma.profile.create({
      data: {
        userId: farmer.id,
        name: `Farmer ${i}`,
        location: JSON.stringify({
          province: i <= 2 ? "Kigali City" : "Eastern Province",
          district: i <= 2 ? "Gasabo" : "Bugesera",
          sector: i <= 2 ? "Kacyiru" : "Gashora",
          address: `Farm Address ${i}`,
        }),
        description: `Experienced farmer specializing in organic produce`,
        profilePictureUrl: `/placeholder.svg?height=150&width=150&query=farmer${i}`,
      },
    })

    const farmerProfile = await prisma.farmerProfile.create({
      data: {
        profileId: profile.id,
        farmName: `Green Valley Farm ${i}`,
        farmLocationDetails: `Located in sector with good soil and water access`,
        farmCapacity: i <= 2 ? "LARGE" : i <= 4 ? "MEDIUM" : "SMALL",
        certifications: ["Organic Certified", "Good Agricultural Practices"],
        gpsCoordinates: `-1.${950000 + i * 1000}, 30.${60000 + i * 1000}`,
        bio: `Passionate about sustainable farming with ${5 + i} years of experience`,
      },
    })

    farmers.push({ user: farmer, profile, farmerProfile })
  }

  console.log(`✅ Created ${farmers.length} farmers`)

  // Create sample sellers
  const sellers = []
  for (let i = 1; i <= 3; i++) {
    const sellerPassword = await bcrypt.hash("Seller123!", 12)
    const seller = await prisma.user.create({
      data: {
        email: `seller${i}@example.com`,
        passwordHash: sellerPassword,
        role: "SELLER",
        phoneNumber: `+25078900000${i}`,
        isVerified: true,
      },
    })

    const profile = await prisma.profile.create({
      data: {
        userId: seller.id,
        name: `Seller ${i}`,
        location: JSON.stringify({
          province: "Kigali City",
          district: "Nyarugenge",
          sector: "Nyamirambo",
          address: `Business Address ${i}`,
        }),
        description: `Wholesale buyer and distributor of fresh produce`,
        profilePictureUrl: `/placeholder.svg?height=150&width=150&query=seller${i}`,
        contactEmail: `contact.seller${i}@example.com`,
        contactPhone: `+25078900000${i}`,
      },
    })

    const sellerProfile = await prisma.sellerProfile.create({
      data: {
        profileId: profile.id,
        businessName: `Fresh Produce Co. ${i}`,
        deliveryOptions: ["Pickup", "Local Delivery", "Nationwide Shipping"],
        businessRegistrationNumber: `RW${1000000 + i}`,
      },
    })

    sellers.push({ user: seller, profile, sellerProfile })
  }

  console.log(`✅ Created ${sellers.length} sellers`)

  // Create sample products
  const products = []
  const productData = [
    { name: "Organic Tomatoes", category: "Vegetables", price: 800, quantity: 500 },
    { name: "Fresh Carrots", category: "Vegetables", price: 600, quantity: 300 },
    { name: "Sweet Bananas", category: "Fruits", price: 400, quantity: 200 },
    { name: "Avocados", category: "Fruits", price: 1200, quantity: 150 },
    { name: "White Rice", category: "Grains", price: 1000, quantity: 1000 },
    { name: "Red Beans", category: "Legumes", price: 900, quantity: 400 },
    { name: "Irish Potatoes", category: "Tubers", price: 500, quantity: 800 },
    { name: "Sweet Potatoes", category: "Tubers", price: 600, quantity: 600 },
  ]

  for (let i = 0; i < productData.length; i++) {
    const productInfo = productData[i]
    if (!productInfo) continue
    const category = categories.find((c) => c.name === productInfo.category)
    const farmer = farmers[i % farmers.length]

    if (category && farmer) {
      const product = await prisma.product.create({
        data: {
          name: productInfo.name,
          description: `High quality ${productInfo.name.toLowerCase()} grown using sustainable farming practices. Fresh from the farm to your table.`,
          categoryId: category.id,
          quantityAvailable: productInfo.quantity,
          unitPrice: productInfo.price,
          availabilityDate: new Date(),
          imageUrls: [
            `/placeholder.svg?height=300&width=300&query=${productInfo.name.replace(" ", "+")}`,
            `/placeholder.svg?height=300&width=300&query=${productInfo.name.replace(" ", "+")}+farm`,
          ],
          minimumOrderQuantity: 10,
          status: "ACTIVE",
          farmerId: farmer.farmerProfile.id,
        },
      })
      products.push(product)
    }
  }

  console.log(`✅ Created ${products.length} products`)

  // Create sample orders
  const orders = []
  for (let i = 0; i < 3; i++) {
    const seller = sellers[i % sellers.length]
    const farmer = farmers[i % farmers.length]
    const product = products[i * 2] // Use different products

    if (seller && farmer && product) {
      const order = await prisma.order.create({
        data: {
          sellerId: seller.user.id,
          farmerId: farmer.user.id,
          status: i === 0 ? "DELIVERED" : i === 1 ? "IN_PROGRESS" : "PENDING",
          totalAmount: Number(product.unitPrice) * 50,
          deliveryAddress: "Kigali City, Gasabo District, Remera Sector",
          paymentStatus: i === 0 ? "PAID" : "PENDING",
          deliveryFee: 5000,
          notes: `Sample order ${i + 1}`,
        },
      })

      await prisma.orderItem.create({
        data: {
          orderId: order.id,
          productId: product.id,
          quantity: 50,
          priceAtOrder: product.unitPrice,
        },
      })

      orders.push(order)
    }
  }

  console.log(`✅ Created ${orders.length} orders`)

  // Create sample reviews
  for (let i = 0; i < 3; i++) {
    const seller = sellers[i % sellers.length]
    const product = products[i]

    if (seller && product) {
      await prisma.review.create({
        data: {
          reviewedEntityId: product.id,
          reviewedEntityType: "PRODUCT",
          reviewerId: seller.user.id,
          rating: 4 + (i % 2), // 4 or 5 stars
          comment: `Great quality ${product.name.toLowerCase()}! Fresh and delivered on time. Will definitely order again.`,
          isApproved: true,
        },
      })
    }
  }

  console.log("✅ Created sample reviews")

  // Create sample notifications
  for (const farmer of farmers) {
    await prisma.notification.create({
      data: {
        userId: farmer.user.id,
        type: "SYSTEM_ANNOUNCEMENT",
        content: "Welcome to AgriConnect! Start listing your products to connect with buyers.",
        isRead: false,
      },
    })
  }

  for (const seller of sellers) {
    await prisma.notification.create({
      data: {
        userId: seller.user.id,
        type: "SYSTEM_ANNOUNCEMENT",
        content: "Welcome to AgriConnect! Browse fresh produce from local farmers.",
        isRead: false,
      },
    })
  }

  console.log("✅ Created sample notifications")

  console.log("🎉 Database seeding completed successfully!")
  console.log("\n📋 Sample Accounts Created:")
  console.log("👨‍💼 Admin: admin@agriconnect.rw / Admin123!")
  console.log("👨‍🌾 Farmers: farmer1@example.com to farmer5@example.com / Farmer123!")
  console.log("🏪 Sellers: seller1@example.com to seller3@example.com / Seller123!")
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error("❌ Seeding failed:", e)
    await prisma.$disconnect()
    process.exit(1)
  })
