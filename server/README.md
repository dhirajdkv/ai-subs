# AI Subscription Management System - Backend

The backend server for the AI Subscription Management System, built with Node.js, Express, and Prisma.

## Tech Stack

- Node.js
- TypeScript
- Express
- Prisma (ORM)
- PostgreSQL
- JWT Authentication
- Google OAuth
- bcrypt (for password hashing)

## Getting Started

1. Install dependencies:
```bash
pnpm install
```

2. Set up environment variables:
Create a `.env` file in the server directory:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/ai_subs"
JWT_SECRET="your-jwt-secret"
GOOGLE_CLIENT_ID="your-google-client-id"
```

3. Initialize the database:
```bash
# Run migrations
npx prisma migrate dev

# Generate Prisma Client
npx prisma generate
```

4. Start the development server:
```bash
pnpm dev
```

The server will be available at http://localhost:3001

## Database Management

### Prisma Studio
To view and manage your database through a GUI:
```bash
npx prisma studio
```
This will start Prisma Studio at http://localhost:5555, where you can:
- Browse all tables
- View relationships
- Add, edit, or delete records
- Filter and sort data
- Export data

### Database Migrations
When you modify the schema (`prisma/schema.prisma`):
```bash
# Create a new migration
npx prisma migrate dev --name your_migration_name

# Apply migrations to production
npx prisma migrate deploy
```

### Seeding Data
To seed initial data (like default plans):
```bash
npx prisma db seed
```

## Project Structure

```
src/
├── api/              # API routes and controllers
│   ├── auth/        # Authentication endpoints
│   ├── plans/       # Subscription plans
│   ├── subscriptions/
│   ├── usage/
│   └── users/
├── config/          # Configuration files
├── middleware/      # Express middleware
├── services/        # Business logic
├── utils/           # Utility functions
└── index.ts         # Application entry point

prisma/
├── migrations/      # Database migrations
└── schema.prisma    # Database schema
```

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/google` - Google OAuth login

### Plans
- `GET /api/plans` - List all plans
- `GET /api/plans/:id` - Get plan details

### Subscriptions
- `GET /api/subscriptions/current` - Get current subscription
- `POST /api/subscriptions/change` - Change subscription plan

### Usage
- `GET /api/usage` - Get usage statistics
- `POST /api/usage/log` - Log usage event

### Users
- `GET /api/users/me` - Get current user
- `PUT /api/users/me` - Update user profile

## Development

### Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm test` - Run tests
- `pnpm lint` - Run ESLint

### Database Operations

```bash
# Create new migration
npx prisma migrate dev

# Reset database
npx prisma migrate reset

# Update client after schema changes
npx prisma generate

# View database GUI
npx prisma studio
```

### Adding New Features

1. Update schema in `prisma/schema.prisma`
2. Create migration
3. Add service in `src/services`
4. Create controller in `src/api`
5. Add route in `src/api/routes`
6. Update types if necessary

### Error Handling

The application uses a centralized error handling system:
- Custom error classes in `src/utils/errors`
- Error middleware for consistent error responses
- Proper HTTP status codes
- Detailed error messages in development

## Testing

```bash
# Run all tests
pnpm test

# Run specific test file
pnpm test path/to/test

# Run with coverage
pnpm test:coverage
```

## Production Deployment

1. Build the application:
```bash
pnpm build
```

2. Apply database migrations:
```bash
npx prisma migrate deploy
```

3. Start the server:
```bash
pnpm start
```

## Contributing

1. Create a feature branch
2. Make your changes
3. Run tests
4. Submit a pull request

## License

[MIT License](LICENSE) 