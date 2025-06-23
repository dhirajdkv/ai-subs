"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPlans = exports.createInitialPlans = void 0;
const prisma_1 = __importDefault(require("../utils/prisma"));
const plansData = [
    { name: 'Free', price: 0, credits: 10 },
    { name: 'Pro', price: 20, credits: 100 },
    { name: 'Business', price: 50, credits: 500 },
];
const createInitialPlans = async () => {
    for (const plan of plansData) {
        await prisma_1.default.plan.upsert({
            where: { name: plan.name },
            update: {},
            create: plan,
        });
    }
};
exports.createInitialPlans = createInitialPlans;
const getPlans = async () => {
    return prisma_1.default.plan.findMany();
};
exports.getPlans = getPlans;
