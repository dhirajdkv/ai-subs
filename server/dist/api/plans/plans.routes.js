"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const plans_controller_1 = require("./plans.controller");
const router = (0, express_1.Router)();
router.get('/', plans_controller_1.getPlansHandler);
exports.default = router;
