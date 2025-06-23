"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserById = void 0;
const prisma_1 = __importDefault(require("../utils/prisma"));
const getUserById = async (id) => {
    return prisma_1.default.user.findUnique({
        where: { id },
        include: {
            subscription: {
                include: {
                    plan: true,
                },
            },
            projects: true,
        },
    });
};
exports.getUserById = getUserById;
