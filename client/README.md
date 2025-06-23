# AI Subscription Management System - Frontend

The frontend application for the AI Subscription Management System, built with React, TypeScript, and Vite.

## Tech Stack

- React 18
- TypeScript
- Vite
- Tailwind CSS
- React Router DOM
- Redux Toolkit (for state management)
- Axios (for API calls)
- Google OAuth
- Recharts (for usage charts)

## Getting Started

1. Install dependencies:
```bash
pnpm install
```

2. Set up environment variables:
Create a `.env` file in the client directory:
```env
VITE_GOOGLE_CLIENT_ID="your-google-client-id"
```

3. Start the development server:
```bash
pnpm dev
```

The application will be available at http://localhost:5173

## Project Structure

```
src/
├── assets/          # Static assets (images, icons)
├── components/      # Reusable React components
│   ├── layout/     # Layout components
│   └── ui/         # UI components
├── pages/          # Page components
│   ├── auth/       # Authentication pages
│   └── dashboard/  # Dashboard pages
├── services/       # API services
├── store/          # Redux store configuration
│   └── slices/     # Redux slices
├── styles/         # Global styles
└── utils/          # Utility functions
```

## Features

### Authentication
- Email/Password login
- Google OAuth integration
- Protected routes
- Persistent sessions

### Dashboard
- Usage statistics chart
- Subscription plan management
- User profile
- Credit tracking

### Components
- Responsive layout
- Dark theme
- Loading states
- Error handling
- Form validation

## Development

### Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm preview` - Preview production build
- `pnpm lint` - Run ESLint
- `pnpm test` - Run tests

### Adding New Features

1. Create new components in `src/components`
2. Add new pages in `src/pages`
3. Update routing in `App.tsx`
4. Add new API services in `src/services`
5. Add new state management in `src/store/slices`

### Code Style

- Use TypeScript for type safety
- Follow ESLint configuration
- Use Tailwind CSS for styling
- Follow component-based architecture
- Implement proper error handling
- Add loading states for async operations

## Testing

```bash
pnpm test
```

## Building for Production

```bash
pnpm build
```

The build artifacts will be stored in the `dist/` directory.

## Contributing

1. Create a feature branch
2. Make your changes
3. Submit a pull request

## License

[MIT License](LICENSE)
