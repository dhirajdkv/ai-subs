# AI Subscription Management System

A modern web application for managing AI service subscriptions, built with React, Node.js, and PostgreSQL.

## Project Structure

```
ai-subs/
├── client/         # React frontend
├── server/         # Node.js backend
└── docker-compose.yml
```

## Prerequisites

- Node.js (v18 or higher)
- pnpm
- PostgreSQL
- Docker (optional)

## Quick Start

1. Clone the repository:
```bash
git clone <repository-url>
cd ai-subs
```

2. Install dependencies:
```bash
pnpm install
```

3. Set up environment variables:

Create `.env` files in both server and client directories:

For server (`server/.env`):
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/ai_subs"
JWT_SECRET="your-jwt-secret"
GOOGLE_CLIENT_ID="your-google-client-id"
```

For client (`client/.env`):
```env
VITE_GOOGLE_CLIENT_ID="your-google-client-id"
```

4. Initialize the database:
```bash
cd server
npx prisma migrate dev
```

5. Start the development servers:

In one terminal:
```bash
cd server
pnpm dev
```

In another terminal:
```bash
cd client
pnpm dev
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend: http://localhost:3001
- Prisma Studio: http://localhost:5555 (run with `npx prisma studio`)

## Features

- User Authentication
  - Email/Password login
  - Google OAuth integration
- Subscription Management
  - Multiple subscription plans
  - Usage tracking
  - Credit system
- Dashboard
  - Usage statistics
  - Subscription details
  - User profile management

## Development

### Database Management

To view/edit database content:
```bash
cd server
npx prisma studio
```

To update database schema:
1. Edit `server/prisma/schema.prisma`
2. Run migrations:
```bash
cd server
npx prisma migrate dev
```

### Testing

For backend:
```bash
cd server
pnpm test
```

For frontend:
```bash
cd client
pnpm test
```

## Docker Support

To run the entire stack using Docker:

```bash
docker-compose up -d
```

This will start:
- PostgreSQL database
- Backend server
- Frontend development server

## Contributing

1. Create a feature branch
2. Make your changes
3. Submit a pull request

## License

[MIT License](LICENSE)
