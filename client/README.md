# AI Subs Client

The frontend application for AI Subs, built with React, TypeScript, and Vite.

## Tech Stack

- **React 18** - UI Framework
- **TypeScript** - Type Safety
- **Vite** - Build Tool
- **Redux Toolkit** - State Management
- **TailwindCSS** - Styling
- **Axios** - API Client
- **React Router** - Routing
- **Chart.js** - Usage Analytics Visualization

## Project Structure

```
src/
├── assets/        # Static assets (images, icons)
├── components/    # Reusable UI components
│   ├── layout/    # Layout components
│   └── ui/        # Basic UI elements
├── pages/         # Route components
│   └── auth/      # Authentication pages
├── services/      # API services
├── store/         # Redux store configuration
│   └── slices/    # Redux slices
└── styles/        # Global styles
```

## Environment Variables

Create a `.env` file in the client directory with the following variables:

```env
VITE_API_URL=http://localhost:3001/api
VITE_GOOGLE_CLIENT_ID=your_google_client_id
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
VITE_FREE_PLAN_PRICE_ID=price_xxx
VITE_PRO_PLAN_PRICE_ID=price_xxx
VITE_BUSINESS_PLAN_PRICE_ID=price_xxx
```

## Getting Started

1. Install dependencies:
```bash
pnpm install
```

2. Start development server:
```bash
pnpm dev
```

3. Build for production:
```bash
pnpm build
```

## Features

- **Authentication**
  - Email/Password Login
  - Google OAuth Integration
  - Protected Routes

- **Dashboard**
  - Usage Statistics
  - Project Management
  - Interactive Charts

- **Subscription Management**
  - Plan Selection
  - Stripe Integration
  - Usage Tracking

## Development Guidelines

- Use TypeScript for all new components and functions
- Follow the existing folder structure
- Use TailwindCSS for styling
- Implement responsive design for all components
- Add JSDoc comments for complex functions and components
- Use Redux for global state management
- Keep components small and focused
- Use React Router for navigation

## Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm preview` - Preview production build
- `pnpm lint` - Run ESLint
- `pnpm type-check` - Run TypeScript type checking

## Contributing

1. Create a feature branch
2. Make your changes
3. Run tests and linting
4. Submit a pull request

## Related Documentation

- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)
- [TailwindCSS Documentation](https://tailwindcss.com)
- [Redux Toolkit Documentation](https://redux-toolkit.js.org)
- [Stripe Documentation](https://stripe.com/docs)
