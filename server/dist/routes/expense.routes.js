"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const expense_controller_1 = require("../controllers/expense.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authMiddleware);
router.route('/')
    .get(expense_controller_1.getExpenses)
    .post(expense_controller_1.createExpense);
router.route('/:id')
    .patch(expense_controller_1.updateExpense)
    .delete(expense_controller_1.deleteExpense);
exports.default = router;
