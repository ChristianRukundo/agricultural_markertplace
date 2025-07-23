# AgriConnect Rwanda - Backend

A comprehensive backend system for Rwanda's premier agricultural marketplace, built with Next.js 15, tRPC, Prisma, and TypeScript.

## 🚀 Features

### Core Functionality
- **User Management**: Role-based authentication (Farmers, Sellers, Admins)
- **Product Catalog**: Complete product management with categories and search
- **Order System**: End-to-end order processing with payment integration
- **Chat System**: Real-time messaging between buyers and sellers
- **Review System**: Product and farmer reviews with moderation
- **Notification System**: Real-time notifications for all user actions

### Technical Features
- **Type Safety**: End-to-end type safety with TypeScript and Zod
- **Authentication**: NextAuth.js with credentials and phone verification
- **Database**: PostgreSQL with Prisma ORM
- **API**: tRPC for type-safe API calls
- **File Upload**: Cloudinary integration for image management
- **Payment**: Integration ready for Pesapal/Flutterwave
- **SMS**: Rwanda SMS gateway integration
- **Email**: Transactional email service
- **Rate Limiting**: API rate limiting for security
- **Logging**: Structured logging system
- **Performance**: Performance monitoring and optimization
- **Backup**: Database backup and restore utilities

## 📋 Prerequisites

- Node.js 18+ 
- PostgreSQL database
- Cloudinary account
- SMS Gateway account (Rwanda)
- Payment Gateway account (Pesapal/Flutterwave)

## 🛠️ Installation

1. **Clone the repository**
   \`\`\`bash
   git clone <repository-url>
   cd agriconnect-backend
   \`\`\`

2. **Install dependencies**
   \`\`\`bash
   npm install
   \`\`\`

3. **Set up environment variables**
   \`\`\`bash
   cp .env.example .env
   \`\`\`
   
   Fill in your environment variables:
   \`\`\`env
   DATABASE_URL="postgresql://username:password@localhost:5432/agriconnect_rwanda"
   NEXTAUTH_SECRET="your-secret-here"
   NEXTAUTH_URL="http://localhost:3000"
   CLOUDINARY_CLOUD_NAME="your-cloud-name"
   CLOUDINARY_API_KEY="your-api-key"
   CLOUDINARY_API_SECRET="your-api-secret"
   PAYMENT_GATEWAY_API_KEY="your-payment-api-key"
   PAYMENT_GATEWAY_SECRET="your-payment-secret"
   SMS_GATEWAY_API_KEY="your-sms-api-key"
   EMAIL_API_KEY="your-email-api-key"
   EMAIL_FROM="noreply@agriconnect.rw"
   \`\`\`

4. **Set up the database**
   \`\`\`bash
   npx prisma generate
   npx prisma db push
   npm run db:seed
   \`\`\`

5. **Start the development server**
   \`\`\`bash
   npm run dev
   \`\`\`

## 📁 Project Structure

\`\`\`
src/
├── app/
│   └── api/                 # API routes
│       ├── auth/           # NextAuth.js routes
│       ├── trpc/           # tRPC endpoint
│       ├── upload/         # File upload endpoint
│       ├── webhooks/       # Webhook handlers
│       └── health/         # Health check endpoint
├── lib/
│   ├── auth.ts            # NextAuth configuration
│   ├── db.ts              # Prisma client
│   ├── logger.ts          # Logging service
│   ├── trpc/              # tRPC setup
│   ├── middleware/        # Custom middleware
│   └── utils/             # Utility functions
├── server/
│   ├── routers/           # tRPC routers
│   └── jobs/              # Background jobs
├── services/              # External service integrations
├── validation/            # Zod schemas
├── types/                 # TypeScript type definitions
└── constants/             # Application constants
\`\`\`

## 🔧 API Documentation

### Authentication Endpoints
- `POST /api/auth/signin` - User login
- `POST /api/auth/signup` - User registration
- `POST /api/auth/signout` - User logout

### tRPC Routers
- **auth**: Authentication and user management
- **user**: User profile management
- **product**: Product CRUD operations
- **order**: Order management
- **chat**: Messaging system
- **review**: Review and rating system
- **notification**: Notification management
- **admin**: Administrative functions
- **category**: Product category management

### Webhook Endpoints
- `POST /api/webhooks/payment` - Payment gateway callbacks
- `POST /api/webhooks/sms` - SMS delivery reports

### Utility Endpoints
- `GET /api/health` - Health check
- `POST /api/upload` - File upload

## 🗄️ Database Schema

### Core Models
- **User**: User accounts with role-based access
- **Profile**: User profile information
- **FarmerProfile**: Farmer-specific data
- **SellerProfile**: Seller-specific data
- **Product**: Product catalog
- **Category**: Product categories
- **Order**: Order management
- **OrderItem**: Order line items
- **Review**: Product and farmer reviews
- **Notification**: System notifications
- **ChatSession**: Chat conversations
- **ChatMessage**: Chat messages

### Key Relationships
- Users have Profiles (1:1)
- Profiles can have FarmerProfile or SellerProfile (1:1)
- Farmers have many Products
- Orders connect Sellers and Farmers
- Orders have many OrderItems
- Products can have many Reviews
- Users can have many ChatSessions

## 🔐 Security Features

- **Authentication**: JWT-based authentication with NextAuth.js
- **Authorization**: Role-based access control (RBAC)
- **Rate Limiting**: API rate limiting to prevent abuse
- **Input Validation**: Comprehensive input validation with Zod
- **File Validation**: Secure file upload validation
- **SQL Injection Protection**: Prisma ORM prevents SQL injection
- **CORS**: Proper CORS configuration
- **Environment Variables**: Secure environment variable handling

## 📊 Monitoring & Logging

- **Structured Logging**: JSON-formatted logs for production
- **Performance Monitoring**: Built-in performance tracking
- **Health Checks**: Comprehensive health check endpoint
- **Error Tracking**: Centralized error handling and logging
- **Database Monitoring**: Query performance tracking

## 🔄 Background Jobs

- **Escrow Release**: Automated payment release after delivery
- **Backup Creation**: Scheduled database backups
- **Cleanup Tasks**: Automated cleanup of old data

## 🧪 Testing

\`\`\`bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run integration tests
npm run test:integration
\`\`\`

## 📦 Deployment

### Environment Setup
1. Set `NODE_ENV=production`
2. Configure production database
3. Set up external services (Cloudinary, SMS, Payment)
4. Configure email service

### Build and Deploy
\`\`\`bash
# Build the application
npm run build

# Start production server
npm start
\`\`\`

### Docker Deployment
\`\`\`bash
# Build Docker image
docker build -t agriconnect-backend .

# Run container
docker run -p 3000:3000 agriconnect-backend
\`\`\`

## 🔧 Configuration

### Rate Limiting
Configure rate limits in `src/lib/middleware/rateLimiter.ts`:
- General API: 100 requests per 15 minutes
- Authentication: 10 requests per 15 minutes
- Password Reset: 3 requests per hour

### File Upload
Configure file validation in `src/lib/utils/fileValidation.ts`:
- Profile pictures: 2MB max
- Product images: 5MB max, 5 files max
- Documents: 10MB max, 3 files max

### Logging
Configure logging levels in `src/lib/logger.ts`:
- Development: DEBUG level
- Production: INFO level

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support, please contact the development team or create an issue in the repository.

## 🔗 Related Documentation

- [Prisma Documentation](https://www.prisma.io/docs)
- [tRPC Documentation](https://trpc.io/docs)
- [NextAuth.js Documentation](https://next-auth.js.org)
- [Next.js Documentation](https://nextjs.org/docs)
\`\`\`

## 🎉 Backend Implementation Complete!

The AgriConnect Rwanda backend is now fully implemented with all essential features:

### ✅ **What's Included:**

1. **Complete Database Schema** - All models with proper relationships
2. **Authentication System** - NextAuth.js with role-based access
3. **tRPC API** - Type-safe API with comprehensive routers
4. **External Integrations** - Cloudinary, SMS, Payment gateways
5. **Security Features** - Rate limiting, input validation, file validation
6. **Monitoring & Logging** - Structured logging and performance monitoring
7. **Background Jobs** - Escrow release and backup systems
8. **Database Utilities** - Seeding, backup, and restore
9. **Production Ready** - Health checks, error handling, optimization

### 🚀 **Ready for Production:**

- **Scalable Architecture** - Modular design with separation of concerns
- **Type Safety** - End-to-end TypeScript with Zod validation
- **Security** - Comprehensive security measures implemented
- **Performance** - Optimized queries and performance monitoring
- **Maintainability** - Well-documented code with clear structure
- **Extensibility** - Easy to add new features and integrations

The backend is now complete and ready for frontend integration or deployment! 🎊
