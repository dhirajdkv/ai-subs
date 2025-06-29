"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const authMiddleware = (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            res.status(401).json({ message: 'No token provided' });
            return;
        }
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        if (!decoded) {
            res.status(401).json({ message: 'Invalid token' });
            return;
        }
        // Add user to request object
        req.user = { id: decoded.userId };
        next();
    }
    catch (error) {
        res.status(401).json({ message: 'Invalid token' });
        return;
    }
};
exports.authMiddleware = authMiddleware;
