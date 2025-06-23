"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = exports.signup = void 0;
const prisma_1 = __importDefault(require("../utils/prisma"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const signup = async (data) => {
    const { email, password, name, authMethod } = data;
    if (!password) {
        throw new Error('Password is required for email signup');
    }
    const hashedPassword = await bcryptjs_1.default.hash(password, 10);
    const user = await prisma_1.default.user.create({
        data: {
            email,
            password: hashedPassword,
            name,
            authMethod,
        },
    });
    const token = jsonwebtoken_1.default.sign({ userId: user.id }, process.env.JWT_SECRET || 'your-default-secret', {
        expiresIn: '7d',
    });
    return { token };
};
exports.signup = signup;
const login = async (data) => {
    const { email, password } = data;
    if (!password) {
        throw new Error('Password is required for email login');
    }
    const user = await prisma_1.default.user.findUnique({
        where: { email },
    });
    if (!user || !user.password) {
        throw new Error('Invalid credentials');
    }
    const isPasswordValid = await bcryptjs_1.default.compare(password, user.password);
    if (!isPasswordValid) {
        throw new Error('Invalid credentials');
    }
    const token = jsonwebtoken_1.default.sign({ userId: user.id }, process.env.JWT_SECRET || 'your-default-secret', {
        expiresIn: '7d',
    });
    return { token };
};
exports.login = login;
