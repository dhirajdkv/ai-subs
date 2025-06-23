import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from './api/auth/auth.routes';
import planRoutes from './api/plans/plans.routes';
import subscriptionRoutes from './api/subscriptions/subscriptions.routes';
import userRoutes from './api/users/users.routes';
import usageRoutes from './api/usage/usage.routes';
import projectRoutes from './api/projects/projects.routes';
import { createInitialPlans } from "./services/plan.service";
import { authMiddleware } from './middleware/auth.middleware';
import { setupDefaultPlans } from './utils/setupDefaultPlans';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// CORS configuration
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware
app.use(express.json());

const apiRouter = express.Router();

// Public routes
apiRouter.use('/auth', authRoutes);

// Protected routes
apiRouter.use('/plans', authMiddleware, planRoutes);
apiRouter.use('/subscriptions', authMiddleware, subscriptionRoutes);
apiRouter.use('/usage', authMiddleware, usageRoutes);
apiRouter.use('/users', authMiddleware, userRoutes);

// Add project routes
apiRouter.use('/projects', authMiddleware, projectRoutes);

app.use('/api', apiRouter);

app.get("/", (req, res) => {
  res.send("Hello from the server!");
});

const startServer = async () => {
  await createInitialPlans();
  await setupDefaultPlans();
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
};

startServer();
