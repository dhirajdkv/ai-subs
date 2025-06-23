"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const auth_routes_1 = __importDefault(require("./api/auth/auth.routes"));
const plans_routes_1 = __importDefault(require("./api/plans/plans.routes"));
const subscriptions_routes_1 = __importDefault(require("./api/subscriptions/subscriptions.routes"));
const users_routes_1 = __importDefault(require("./api/users/users.routes"));
const usage_routes_1 = __importDefault(require("./api/usage/usage.routes"));
const plan_service_1 = require("./services/plan.service");
const auth_middleware_1 = require("./middleware/auth.middleware");
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 3001;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
const apiRouter = express_1.default.Router();
// Public routes
apiRouter.use('/auth', auth_routes_1.default);
// All routes after this will be protected by the auth middleware
apiRouter.use(auth_middleware_1.authMiddleware);
// Protected routes
apiRouter.use('/plans', plans_routes_1.default);
apiRouter.use('/subscriptions', subscriptions_routes_1.default);
apiRouter.use('/users', users_routes_1.default);
apiRouter.use('/usage', usage_routes_1.default);
app.use('/api', apiRouter);
app.get("/", (req, res) => {
    res.send("Hello from the server!");
});
const startServer = async () => {
    await (0, plan_service_1.createInitialPlans)();
    app.listen(port, () => {
        console.log(`Server is running on port ${port}`);
    });
};
startServer();
