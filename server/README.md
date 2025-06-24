# AI Subs Server

The backend API server for AI Subs, built with Node.js, Express, and TypeScript.

## Tech Stack

- **Node.js** - Runtime Environment
- **Express** - Web Framework
- **TypeScript** - Type Safety
- **Prisma** - ORM & Database Management
- **PostgreSQL** - Database
- **JWT** - Authentication
- **Stripe** - Payment Processing
- **Google OAuth** - Social Authentication

## Project Structure

```
src/
├── api/           # API routes and controllers
│   ├── auth/      # Authentication endpoints
│   ├── projects/  # Project management
│   ├── usage/     # Usage tracking
│   └── users/     # User management
├── middleware/    # Express middleware
├── services/      # Business logic
├── utils/         # Utility functions
└── index.ts       # Application entry point

prisma/
├── migrations/    # Database migrations
└── schema.prisma  # Database schema
```

## Environment Variables

Create a `.env` file in the server directory with the following variables:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/ai_subs"

# Authentication
JWT_SECRET=your_jwt_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Stripe Configuration
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
FREE_PLAN_PRICE_ID=price_xxx
PRO_PLAN_PRICE_ID=price_xxx
BUSINESS_PLAN_PRICE_ID=price_xxx

# Server Configuration
PORT=3001
NODE_ENV=development
```

## Getting Started

1. Install dependencies:
```bash
pnpm install
```

2. Set up the database:
```bash
# Create database and apply migrations
pnpm prisma migrate dev
```

3. Start development server:
```bash
pnpm dev
```

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new account
- `POST /api/auth/login` - Email/password login
- `POST /api/auth/google` - Google OAuth login

### Users
- `GET /api/users/me` - Get current user
- `PUT /api/users/me` - Update user profile

### Projects
- `GET /api/projects` - List all projects
- `POST /api/projects` - Create new project
- `GET /api/projects/:id` - Get project details
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

### Usage
- `GET /api/usage` - Get usage statistics
- `POST /api/usage/track` - Track new usage

### Subscriptions
- `GET /api/subscriptions` - Get subscription details
- `POST /api/subscriptions/checkout` - Create checkout session
- `POST /api/subscriptions/change` - Change subscription
- `POST /api/subscriptions/cancel` - Cancel subscription

## Database Schema

The application uses PostgreSQL with Prisma ORM. Key models include:

- `User` - User accounts and profiles
- `Project` - Unity projects
- `Usage` - Usage tracking records
- `Subscription` - Subscription management

## Development Guidelines

- Use TypeScript for all new code
- Follow RESTful API design principles
- Implement proper error handling
- Add input validation for all endpoints
- Write comprehensive API documentation
- Use environment variables for configuration
- Keep services modular and focused
- Add logging for important operations

## Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint
- `pnpm type-check` - Run TypeScript type checking
- `pnpm prisma:generate` - Generate Prisma client
- `pnpm prisma:migrate` - Run database migrations

## Error Handling

The API uses standardized error responses:

```typescript
{
  error: {
    message: string;
    code: string;
    details?: any;
  }
}
```

Common error codes:
- `UNAUTHORIZED` - Authentication required
- `FORBIDDEN` - Insufficient permissions
- `NOT_FOUND` - Resource not found
- `VALIDATION_ERROR` - Invalid input
- `INTERNAL_ERROR` - Server error

## Contributing

1. Create a feature branch
2. Make your changes
3. Run tests and linting
4. Submit a pull request

## Related Documentation

- [Express Documentation](https://expressjs.com)
- [Prisma Documentation](https://www.prisma.io/docs)
- [JWT Documentation](https://jwt.io)
- [Stripe API Documentation](https://stripe.com/docs/api)
- [Google OAuth Documentation](https://developers.google.com/identity/protocols/oauth2) 