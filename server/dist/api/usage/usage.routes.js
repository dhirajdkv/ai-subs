"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const usage_controller_1 = require("./usage.controller");
const router = (0, express_1.Router)();
router.get('/', usage_controller_1.getUsageHandler);
exports.default = router;
