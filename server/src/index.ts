import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from './api/auth/auth.routes';
import userRoutes from './api/users/users.routes';
import usageRoutes from './api/usage/usage.routes';
import projectRoutes from './api/projects/projects.routes';
import subscriptionRoutes from './api/subscriptions/subscriptions.routes';
import { authMiddleware } from './middleware/auth.middleware';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// CORS configuration
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware
app.use(express.json());

// Handle raw body for Stripe webhooks
app.use('/api/subscriptions/webhook', express.raw({ type: 'application/json' }));

const apiRouter = express.Router();

// Public routes
apiRouter.use('/auth', authRoutes);

// Protected routes
apiRouter.use('/usage', authMiddleware, usageRoutes);
apiRouter.use('/users', authMiddleware, userRoutes);
apiRouter.use('/projects', authMiddleware, projectRoutes);
apiRouter.use('/subscriptions', subscriptionRoutes);

app.use('/api', apiRouter);

app.get("/", (req, res) => {
  res.send("Hello from the server!");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
