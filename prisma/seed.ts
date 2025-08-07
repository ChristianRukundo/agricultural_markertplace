import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { addDays } from "date-fns"; // Import addDays for availabilityDate

const prisma = new PrismaClient();

// --- Provided Image URLs ---
const PRODUCT_IMAGES = [
  "https://images.unsplash.com/photo-1464965911861-746a04b4bca6?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", // Lettuce/Greens
  "https://images.unsplash.com/photo-1526318472351-c75fcf070305?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", // Apples
  "https://plus.unsplash.com/premium_photo-1673108852141-e8c3c22a4a22?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", // Carrots
  "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=880&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", // Avocado (general food)
  "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", // Diverse Ingredients
  "https://images.unsplash.com/photo-1498408040764-ab6eb772a145?q=80&w=1472&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", // Rice Field
  "https://images.unsplash.com/uploads/141247613151541c06062/c15fb37d?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", // Potatoes
  "https://plus.unsplash.com/premium_photo-1670909649532-d1d68ee475cd?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D", // Tomatoes
];

const FARMER_IMAGES = [
  "https://plus.unsplash.com/premium_photo-1681398651047-78491e34f66a?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://plus.unsplash.com/premium_photo-1663040313671-b697d88b239d?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://images.unsplash.com/photo-1565346156504-91cca27d6e62?q=80&w=722&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://images.unsplash.com/photo-1579256414191-78193791bd86?q=80&w=1030&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://images.unsplash.com/photo-1660491230127-159670395d39?q=80&w=1481&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://images.unsplash.com/photo-1707811179851-c1f93698ad46?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://images.unsplash.com/photo-1736259762440-bd1e1600378f?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
];

async function main() {
  console.log("🌱 Starting database seeding...");

  // Create categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { name: "Vegetables" },
      update: {},
      create: {
        name: "Vegetables",
        description: "Fresh vegetables and leafy greens, locally sourced.",
        imageUrl: PRODUCT_IMAGES[0],
      },
    }),
    prisma.category.upsert({
      where: { name: "Fruits" },
      update: {},
      create: {
        name: "Fruits",
        description: "Seasonal fruits, hand-picked for freshness and quality.",
        imageUrl: PRODUCT_IMAGES[1],
      },
    }),
    prisma.category.upsert({
      where: { name: "Grains" },
      update: {},
      create: {
        name: "Grains",
        description:
          "Staple grains like rice, maize, and wheat, harvested with care.",
        imageUrl: PRODUCT_IMAGES[5],
      },
    }),
    prisma.category.upsert({
      where: { name: "Legumes" },
      update: {},
      create: {
        name: "Legumes",
        description:
          "Nutrient-rich beans, peas, and lentils, perfect for healthy meals.",
        imageUrl: PRODUCT_IMAGES[4],
      },
    }),
    prisma.category.upsert({
      where: { name: "Tubers" },
      update: {},
      create: {
        name: "Tubers",
        description:
          "Potatoes, sweet potatoes, and cassava, essential for Rwandan cuisine.",
        imageUrl: PRODUCT_IMAGES[6],
      },
    }),
    prisma.category.upsert({
      where: { name: "Herbs & Spices" },
      update: {},
      create: {
        name: "Herbs & Spices",
        description:
          "Aromatic herbs and spices to elevate your culinary creations.",
        imageUrl: PRODUCT_IMAGES[3],
      },
    }),
  ]);

  console.log(`✅ Created ${categories.length} categories`);

  // Create admin user
  const adminPassword = await bcrypt.hash("Admin123!", 12);
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
  });

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
      profilePictureUrl: "/placeholder-logo.svg", // Using a general logo for admin
    },
  });

  console.log("✅ Created admin user");

  // Create sample farmers
  const farmers = [];
  const farmerLocations = [
    {
      province: "Kigali City",
      district: "Gasabo",
      sector: "Nduba",
      address: "Farm Rd 1",
    },
    {
      province: "Northern Province",
      district: "Musanze",
      sector: "Kinigi",
      address: "Volcanoes Rd",
    },
    {
      province: "Eastern Province",
      district: "Bugesera",
      sector: "Gashora",
      address: "Lake Shore Rd",
    },
    {
      province: "Southern Province",
      district: "Huye",
      sector: "Tumba",
      address: "Nyamugari Village",
    },
    {
      province: "Western Province",
      district: "Rubavu",
      sector: "Gisenyi",
      address: "Kivu Lake Rd",
    },
  ];

  for (let i = 0; i < 5; i++) {
    const farmerPassword = await bcrypt.hash("Farmer123!", 12);
    const farmer = await prisma.user.create({
      data: {
        email: `farmer${i + 1}@example.com`,
        passwordHash: farmerPassword,
        role: "FARMER",
        phoneNumber: `+25078800000${i + 1}`,
        isVerified: true,
      },
    });

    // Fix: Directly assign and assert that location is not undefined
    const location = farmerLocations[i % farmerLocations.length]!;
    const farmerImg = FARMER_IMAGES[i % FARMER_IMAGES.length];

    const profile = await prisma.profile.create({
      data: {
        userId: farmer.id,
        name: `Farmer ${i + 1} from ${location.district}`,
        location: JSON.stringify(location),
        description: `Dedicated farmer specializing in high-quality produce from ${location.district}.`,
        profilePictureUrl: farmerImg,
        contactEmail: `contact.farmer${i + 1}@example.com`,
        contactPhone: `+25078800000${i + 1}`,
      },
    });

    const farmerProfile = await prisma.farmerProfile.create({
      data: {
        profileId: profile.id,
        farmName: `Green Harvest Farm ${i + 1}`,
        farmLocationDetails: `${location.sector}, ${location.district} - known for fertile soils and clean water.`,
        farmCapacity: i === 0 ? "LARGE" : i === 1 ? "MEDIUM" : "SMALL",
        certifications:
          i % 2 === 0
            ? ["Organic Certified", "GAP Certified"]
            : ["Rainforest Alliance"],
        gpsCoordinates: `-1.${950000 + i * 1000}, 30.${60000 + i * 1000}`,
        bio: `Passionate about sustainable farming with ${
          5 + i
        } years of experience. Providing fresh, local produce to communities.`,
      },
    });

    farmers.push({ user: farmer, profile, farmerProfile });
  }

  console.log(`✅ Created ${farmers.length} farmers`);

  // Create sample sellers
  const sellers = [];
  const sellerBusinessNames = [
    "Kigali Fresh Distributors",
    "Agri Mart Supplies",
    "Healthy Bites Restaurant",
  ];
  const sellerLocations = [
    {
      province: "Kigali City",
      district: "Nyarugenge",
      sector: "Nyamirambo",
      address: "Market Street 1",
    },
    {
      province: "Kigali City",
      district: "Kicukiro",
      sector: "Remera",
      address: "Business Center Rd",
    },
    {
      province: "Kigali City",
      district: "Gasabo",
      sector: "Kimihurura",
      address: "Main Avenue",
    },
  ];

  for (let i = 0; i < 3; i++) {
    const sellerPassword = await bcrypt.hash("Seller123!", 12);
    const seller = await prisma.user.create({
      data: {
        email: `seller${i + 1}@example.com`,
        passwordHash: sellerPassword,
        role: "SELLER",
        phoneNumber: `+25078900000${i + 1}`,
        isVerified: true,
      },
    });

    // Fix: Directly assign and assert that location is not undefined
    const location = sellerLocations[i % sellerLocations.length]!;
    const sellerImage = `/placeholder.svg?height=150&width=150&query=business-logo-${i}`; // Using generic placeholder for sellers

    const profile = await prisma.profile.create({
      data: {
        userId: seller.id,
        name: `Seller ${i + 1} Inc.`,
        location: JSON.stringify(location),
        description: `Leading supplier of agricultural produce to hotels and restaurants in ${location.district}.`,
        profilePictureUrl: sellerImage,
        contactEmail: `sales.seller${i + 1}@example.com`,
        contactPhone: `+25078900000${i + 1}`,
      },
    });

    const sellerProfile = await prisma.sellerProfile.create({
      data: {
        profileId: profile.id,
        businessName: sellerBusinessNames[
          i % sellerBusinessNames.length
        ] as string,
        deliveryOptions:
          i % 2 === 0
            ? ["Local Delivery", "Pickup"]
            : ["Nationwide Shipping", "Express Delivery"],
        businessRegistrationNumber: `RW${1000000 + i + 1}`,
      },
    });

    sellers.push({ user: seller, profile, sellerProfile });
  }

  console.log(`✅ Created ${sellers.length} sellers`);

  // Create sample products with real images and varied data
  const productData = [
    {
      name: "Organic Tomatoes",
      categoryName: "Vegetables",
      basePrice: 800,
      quantity: 500,
      imageIndex: 7, // Tomatoes
      description:
        "Naturally grown, ripe organic tomatoes. Perfect for salads, sauces, and fresh consumption. Harvested daily.",
      minOrder: 5,
    },
    {
      name: "Fresh Carrots",
      categoryName: "Vegetables",
      basePrice: 600,
      quantity: 300,
      imageIndex: 2, // Carrots
      description:
        "Sweet and crunchy fresh carrots, ideal for juicing, cooking, or snacking. Rich in vitamins.",
      minOrder: 10,
    },
    {
      name: "Sweet Bananas",
      categoryName: "Fruits",
      basePrice: 450,
      quantity: 200,
      imageIndex: 1, // Apples (closest fruit, or any other fruit image)
      description:
        "Locally grown sweet bananas, packed with energy. Great for a quick snack or baking.",
      minOrder: 20,
    },
    {
      name: "Farm-Fresh Avocados",
      categoryName: "Fruits",
      basePrice: 1200,
      quantity: 150,
      imageIndex: 3, // Avocado
      description:
        "Creamy and rich avocados, perfect for guacamole, salads, or spreading. Sourced from mature trees.",
      minOrder: 8,
    },
    {
      name: "Premium White Rice",
      categoryName: "Grains",
      basePrice: 1100,
      quantity: 1000,
      imageIndex: 5, // Rice Field
      description:
        "High-quality white rice, a staple for any meal. Fluffy texture when cooked, grown in fertile plains.",
      minOrder: 50,
    },
    {
      name: "Local Red Beans",
      categoryName: "Legumes",
      basePrice: 950,
      quantity: 400,
      imageIndex: 4, // Diverse Ingredients (for legumes)
      description:
        "Nutritious red beans, excellent for stews, soups, and traditional Rwandan dishes. Rich in protein.",
      minOrder: 30,
    },
    {
      name: "Organic Irish Potatoes",
      categoryName: "Tubers",
      basePrice: 550,
      quantity: 800,
      imageIndex: 6, // Potatoes
      description:
        "Firm and versatile Irish potatoes, perfect for boiling, frying, or roasting. Organic and freshly harvested.",
      minOrder: 25,
    },
    {
      name: "Green Leafy Mix",
      categoryName: "Vegetables",
      basePrice: 700,
      quantity: 250,
      imageIndex: 0, // Lettuce/Greens
      description:
        "A fresh mix of healthy green leafy vegetables, perfect for nutritious salads and stir-fries. Pesticide-free.",
      minOrder: 15,
    },
  ];

  const products = [];
  for (let i = 0; i < productData.length; i++) {
    const pInfo = productData[i];
    // Fix: Explicitly check pInfo to satisfy TypeScript's strict null checks
    if (!pInfo) {
      console.warn(`Skipping product data at index ${i} as it's undefined.`);
      continue;
    }

    const category = categories.find((c) => c.name === pInfo.categoryName);
    const farmer = farmers[i % farmers.length]; // Cycle farmers

    if (category && farmer) {
      const mainImage = PRODUCT_IMAGES[pInfo.imageIndex];
      const altImage1 =
        PRODUCT_IMAGES[(pInfo.imageIndex + 1) % PRODUCT_IMAGES.length]!;
      const altImage2 =
        PRODUCT_IMAGES[(pInfo.imageIndex + 2) % PRODUCT_IMAGES.length]!;

      const product = await prisma.product.create({
        data: {
          name: pInfo.name,
          description: pInfo.description,
          categoryId: category.id,
          quantityAvailable: pInfo.quantity,
          unitPrice: pInfo.basePrice,
          availabilityDate: addDays(new Date(), Math.floor(Math.random() * 10)), // Available within next 10 days
          // Fix: Use a type assertion or filter with a type guard to ensure string[]
          imageUrls: [mainImage, altImage1, altImage2].filter(
            (url): url is string => Boolean(url)
          ),
          minimumOrderQuantity: pInfo.minOrder,
          status: "ACTIVE", // Set products active by default
          farmerId: farmer.farmerProfile.id,
        },
      });
      products.push(product);
    }
  }

  console.log(`✅ Created ${products.length} products`);

  // Create sample orders
  const orders = [];
  for (let i = 0; i < 3; i++) {
    const seller = sellers[i % sellers.length];
    const farmer = farmers[i % farmers.length];
    const product = products[(i * 2) % products.length]; // Use different products

    // Fix: Explicitly check for undefined for seller, farmer, and product
    if (!seller || !farmer || !product) {
      console.warn(
        `Skipping order creation at index ${i} due to missing data.`
      );
      continue;
    }

    const orderQuantity = 50 + i * 10; // Vary quantity
    const orderTotal = Number(product.unitPrice) * orderQuantity;
    const deliveryFee = 5000 + i * 500;

    const sellerLocation = sellerLocations[i % sellerLocations.length]!;

    const order = await prisma.order.create({
      data: {
        sellerId: seller.user.id,
        farmerId: farmer.user.id,
        status: i === 0 ? "DELIVERED" : i === 1 ? "IN_PROGRESS" : "PENDING",
        totalAmount: orderTotal,
        deliveryAddress: `Kigali City, ${sellerLocation.district} District, ${sellerLocation.sector}`,
        paymentStatus: i === 0 ? "PAID" : "PENDING",
        deliveryFee: deliveryFee,
        notes: `Sample order ${i + 1} for AgriConnect demo.`,
      },
    });

    await prisma.orderItem.create({
      data: {
        orderId: order.id,
        productId: product.id,
        quantity: orderQuantity,
        priceAtOrder: product.unitPrice,
      },
    });

    orders.push(order);
  }

  console.log(`✅ Created ${orders.length} orders`);

  // Create sample reviews
  for (let i = 0; i < 3; i++) {
    const seller = sellers[i % sellers.length];
    const product = products[i % products.length];
    const farmerToReview = farmers[(i + 1) % farmers.length]; // Review a different farmer

    // Fix: Explicitly check for undefined for seller, product, and farmerToReview
    if (!seller || !product || !farmerToReview) {
      console.warn(
        `Skipping review creation at index ${i} due to missing data.`
      );
      continue;
    }

    // Product review
    await prisma.review.create({
      data: {
        reviewedEntityId: product.id,
        reviewedEntityType: "PRODUCT",
        reviewerId: seller.user.id,
        rating: 4 + (i % 2), // 4 or 5 stars
        comment: `Excellent quality ${product.name.toLowerCase()}! Very fresh and well-packaged. Highly recommend.`,
        isApproved: true,
      },
    });

    // Farmer review (ensure seller has "transacted" with this farmer for realism)
    const hasTransacted = await prisma.order.findFirst({
      where: {
        sellerId: seller.user.id,
        farmerId: farmerToReview.user.id,
        status: "DELIVERED",
      },
    });

    if (hasTransacted) {
      await prisma.review.create({
        data: {
          reviewedEntityId: farmerToReview.user.id, // Farmer user ID
          reviewedEntityType: "FARMER",
          reviewerId: seller.user.id,
          rating: 3 + (i % 3), // 3, 4, or 5 stars
          comment: `Reliable farmer, great communication, and punctual deliveries. Will definitely work with them again.`,
          isApproved: true,
        },
      });
    }
  }

  console.log("✅ Created sample reviews");

  for (const farmer of farmers) {
    await prisma.notification.create({
      data: {
        userId: farmer.user.id,
        type: "SYSTEM_ANNOUNCEMENT",
        content:
          "Welcome to AgriConnect! Start listing your products to connect with buyers and grow your business.",
        isRead: false,
      },
    });
  }

  for (const seller of sellers) {
    await prisma.notification.create({
      data: {
        userId: seller.user.id,
        type: "SYSTEM_ANNOUNCEMENT",
        content:
          "Welcome to AgriConnect! Browse fresh produce from local farmers and streamline your procurement.",
        isRead: false,
      },
    });
  }

  console.log("✅ Created sample notifications");

  console.log("🎉 Database seeding completed successfully!");
  console.log("\n📋 Sample Accounts Created:");
  console.log("👨‍💼 Admin: admin@agriconnect.rw / Admin123!");
  console.log(
    "👨‍🌾 Farmers: farmer1@example.com to farmer5@example.com / Farmer123!"
  );
  console.log(
    "🏪 Sellers: seller1@example.com to seller3@example.com / Seller123!"
  );
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("❌ Seeding failed:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
