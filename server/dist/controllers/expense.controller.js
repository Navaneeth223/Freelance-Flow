"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteExpense = exports.updateExpense = exports.createExpense = exports.getExpenses = void 0;
const Expense_model_1 = require("../models/Expense.model");
const apiResponse_1 = require("../utils/apiResponse");
const getExpenses = async (req, res, next) => {
    try {
        if (!req.user)
            return res.status(401).json(apiResponse_1.ApiResponse.error('Unauthorized'));
        const { category, isBillable } = req.query;
        const query = { userId: req.user.id };
        if (category)
            query.category = category;
        if (isBillable !== undefined)
            query.isBillable = isBillable === 'true';
        const expenses = await Expense_model_1.Expense.find(query)
            .populate('projectId', 'name')
            .populate('clientId', 'name')
            .sort({ date: -1 });
        res.status(200).json(apiResponse_1.ApiResponse.success(expenses));
    }
    catch (error) {
        next(error);
    }
};
exports.getExpenses = getExpenses;
const createExpense = async (req, res, next) => {
    try {
        if (!req.user)
            return res.status(401).json(apiResponse_1.ApiResponse.error('Unauthorized'));
        const expense = new Expense_model_1.Expense({
            ...req.body,
            userId: req.user.id
        });
        await expense.save();
        res.status(201).json(apiResponse_1.ApiResponse.success(expense, 'Expense logged successfully'));
    }
    catch (error) {
        next(error);
    }
};
exports.createExpense = createExpense;
const updateExpense = async (req, res, next) => {
    try {
        if (!req.user)
            return res.status(401).json(apiResponse_1.ApiResponse.error('Unauthorized'));
        const expense = await Expense_model_1.Expense.findOneAndUpdate({ _id: req.params.id, userId: req.user.id }, { $set: req.body }, { new: true });
        if (!expense) {
            const error = new Error('Expense not found');
            error.statusCode = 404;
            error.code = 'EXPENSE_NOT_FOUND';
            return next(error);
        }
        res.status(200).json(apiResponse_1.ApiResponse.success(expense, 'Expense updated successfully'));
    }
    catch (error) {
        next(error);
    }
};
exports.updateExpense = updateExpense;
const deleteExpense = async (req, res, next) => {
    try {
        if (!req.user)
            return res.status(401).json(apiResponse_1.ApiResponse.error('Unauthorized'));
        const expense = await Expense_model_1.Expense.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
        if (!expense) {
            const error = new Error('Expense not found');
            error.statusCode = 404;
            error.code = 'EXPENSE_NOT_FOUND';
            return next(error);
        }
        res.status(200).json(apiResponse_1.ApiResponse.success(null, 'Expense deleted successfully'));
    }
    catch (error) {
        next(error);
    }
};
exports.deleteExpense = deleteExpense;
