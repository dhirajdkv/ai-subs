# AI Subscription Management Platform

A modern, scalable subscription management platform built for AI services, with a focus on Unity game development integration. The platform provides usage tracking, subscription management, and billing features through a clean, intuitive interface.

## Architecture Overview

### Tech Stack

#### Frontend
- **React** with TypeScript for type safety and better developer experience
- **Redux Toolkit** for state management
- **TailwindCSS** for styling
- **Vite** as the build tool for faster development experience
- **Axios** for API communication
- **Recharts** for usage analytics visualization

#### Backend
- **Node.js** with Express for the API server
- **TypeScript** for type safety and better maintainability
- **Prisma** as the ORM for database operations
- **PostgreSQL** as the primary database
- **JWT** for authentication
- **Stripe** for payment processing and subscription management

### System Design

The application follows a microservices-inspired architecture while maintaining the simplicity of a monolithic deployment:

1. **Authentication Service**
   - JWT-based authentication
   - Google OAuth integration
   - Session management
   - User data management

2. **Subscription Service**
   - Plan management
   - Stripe integration for payments
   - Usage tracking
   - Billing history

3. **Project Service**
   - Unity project management
   - Usage analytics per project
   - Resource allocation

4. **Usage Tracking Service**
   - Real-time usage monitoring
   - Usage aggregation by type (API calls, Content Analysis, Model Training)
   - Credit management

## Key Design Decisions

### 1. Authentication & Authorization
- **JWT Implementation**: Chose JWT for stateless authentication, reducing database load
- **Token Management**: Implemented secure token storage in localStorage with proper expiration
- **Role-Based Access**: Built-in support for different user roles (though currently focused on end-users)

### 2. Subscription Management
- **Stripe Integration**: 
  - Direct integration with Stripe for reliable payment processing
  - Customer Portal for self-service billing management
  - Webhook implementation for real-time subscription updates
- **Plan Structure**:
  - Flexible plan tiers (Free, Pro, Enterprise)
  - Credit-based usage tracking
  - Automatic plan downgrades on cancellation

### 3. Usage Tracking
- **Granular Metrics**:
  - Separate tracking for API calls, content analysis, and model training
  - Per-project usage monitoring
  - Daily aggregation for trend analysis
- **Real-time Updates**:
  - Immediate usage reflection in dashboard
  - Credit deduction system
  - Usage alerts (planned feature)

### 4. Database Design
- **Schema Design**:
  - Normalized structure for efficient queries
  - Proper indexing on frequently accessed fields
  - Soft deletion for important records
- **Prisma Implementation**:
  - Type-safe database operations
  - Efficient relation handling
  - Migration management

### 5. Frontend Architecture
- **Component Structure**:
  - Modular, reusable components
  - Separation of concerns between UI and business logic
  - Responsive design for all screen sizes
- **State Management**:
  - Centralized Redux store for global state
  - Local state for component-specific data
  - Optimistic updates for better UX

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- PostgreSQL
- Stripe account
- pnpm (preferred package manager)

### Environment Variables

#### Backend (.env)
```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/ai_subs"

# Authentication
JWT_SECRET="your-jwt-secret"
GOOGLE_CLIENT_ID="your-google-client-id"

# Stripe Configuration
STRIPE_SECRET_KEY="your-stripe-secret-key"
STRIPE_WEBHOOK_SECRET="your-stripe-webhook-secret"
STRIPE_FREE_PLAN_PRICE_ID="price_xxx"
STRIPE_PRO_PLAN_PRICE_ID="price_xxx"
STRIPE_BUSINESS_PLAN_PRICE_ID="price_xxx"

# Application
CLIENT_URL="http://localhost:5173"
```

#### Frontend (.env)
```env
# Google Authentication
VITE_GOOGLE_CLIENT_ID="your-google-client-id"

# Stripe Configuration
VITE_STRIPE_PUBLISHABLE_KEY="your-stripe-publishable-key"
VITE_STRIPE_FREE_PLAN_PRICE_ID="price_xxx"
VITE_STRIPE_PRO_PLAN_PRICE_ID="price_xxx"
VITE_STRIPE_BUSINESS_PLAN_PRICE_ID="price_xxx"
```

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd ai-subs
```

2. Install dependencies:
```bash
pnpm install
```

3. Set up the database:
```bash
cd server
pnpm prisma migrate dev
```

4. Start the development servers:
```bash
# In the root directory
pnpm dev
```

## Special Considerations

### Security
- All sensitive data is handled server-side
- Stripe webhook verification implemented
- CORS properly configured

### Scalability
- Database indexes for performance
- Efficient query patterns
- Caching opportunities identified (future implementation)
- Webhook retry mechanism (Handled by stripe itself. When some issue occurs on our end, we throw 4xx or 5xx status code. Stripe resolves the webhook only when it receives 2xx status code.)

### Limitations
1. **Usage Tracking**:
   - Currently limited to daily aggregation
   - No real-time usage alerts
   - Basic analytics implementation

2. **Payment Processing**:
   - Limited to card payments
   - Single currency support (USD)
   - Basic invoice customization

3. **Project Management**:
   - Limited project metadata (Dummy Data)
   - No team collaboration features yet

## Future Enhancements
1. Real-time usage alerts
2. Team collaboration features
3. Advanced analytics dashboard
4. Multi-currency support
5. Usage prediction and recommendations
6. API rate limiting
7. Caching layer implementation

