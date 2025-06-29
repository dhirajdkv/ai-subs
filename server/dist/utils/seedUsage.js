"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var prisma_1 = require("./prisma");
function seedUsageData() {
    return __awaiter(this, void 0, void 0, function () {
        var users, _i, users_1, user, projects, newProject, now, usageTypes, _a, projects_1, project, i, date, recordsForDay, j, type, credits, timestamp, error_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 16, 17, 19]);
                    return [4 /*yield*/, prisma_1.default.user.findMany()];
                case 1:
                    users = _b.sent();
                    _i = 0, users_1 = users;
                    _b.label = 2;
                case 2:
                    if (!(_i < users_1.length)) return [3 /*break*/, 15];
                    user = users_1[_i];
                    return [4 /*yield*/, prisma_1.default.project.findMany({
                            where: { userId: user.id }
                        })];
                case 3:
                    projects = _b.sent();
                    if (!(projects.length === 0)) return [3 /*break*/, 5];
                    console.log("No projects found for user ".concat(user.email, ". Creating a default project..."));
                    return [4 /*yield*/, prisma_1.default.project.create({
                            data: {
                                name: 'Default Project',
                                userId: user.id
                            }
                        })];
                case 4:
                    newProject = _b.sent();
                    projects = [newProject];
                    _b.label = 5;
                case 5:
                    now = new Date();
                    usageTypes = ['API_CALL', 'CONTENT_ANALYSIS', 'MODEL_TRAINING'];
                    _a = 0, projects_1 = projects;
                    _b.label = 6;
                case 6:
                    if (!(_a < projects_1.length)) return [3 /*break*/, 14];
                    project = projects_1[_a];
                    i = 0;
                    _b.label = 7;
                case 7:
                    if (!(i < 30)) return [3 /*break*/, 12];
                    date = new Date(now);
                    date.setDate(date.getDate() - i);
                    recordsForDay = Math.floor(Math.random() * 3) + 1;
                    j = 0;
                    _b.label = 8;
                case 8:
                    if (!(j < recordsForDay)) return [3 /*break*/, 11];
                    type = usageTypes[Math.floor(Math.random() * usageTypes.length)];
                    credits = Math.floor(Math.random() * 100) + 10;
                    timestamp = new Date(date);
                    timestamp.setHours(Math.floor(Math.random() * 24));
                    timestamp.setMinutes(Math.floor(Math.random() * 60));
                    return [4 /*yield*/, prisma_1.default.usage.create({
                            data: {
                                projectId: project.id,
                                credits: credits,
                                type: type,
                                createdAt: timestamp,
                                metadata: {
                                    requestType: type,
                                    status: 'completed',
                                    duration: Math.floor(Math.random() * 1000) + 100 // Random duration between 100-1100ms
                                }
                            }
                        })];
                case 9:
                    _b.sent();
                    _b.label = 10;
                case 10:
                    j++;
                    return [3 /*break*/, 8];
                case 11:
                    i++;
                    return [3 /*break*/, 7];
                case 12:
                    console.log("Created usage data for project ".concat(project.name));
                    _b.label = 13;
                case 13:
                    _a++;
                    return [3 /*break*/, 6];
                case 14:
                    _i++;
                    return [3 /*break*/, 2];
                case 15:
                    console.log('Successfully seeded usage data!');
                    return [3 /*break*/, 19];
                case 16:
                    error_1 = _b.sent();
                    console.error('Error seeding usage data:', error_1);
                    return [3 /*break*/, 19];
                case 17: return [4 /*yield*/, prisma_1.default.$disconnect()];
                case 18:
                    _b.sent();
                    return [7 /*endfinally*/];
                case 19: return [2 /*return*/];
            }
        });
    });
}
// Run the seeding
seedUsageData()
    .then(function () { return console.log('Finished seeding usage data'); })
    .catch(function (error) {
    console.error('Error in seed script:', error);
    process.exit(1);
});
