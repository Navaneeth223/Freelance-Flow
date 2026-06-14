import { Response, NextFunction } from 'express';
import { Expense } from '../models/Expense.model';
import { ApiResponse } from '../utils/apiResponse';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { ApiError } from '../middleware/error.middleware';

export const getExpenses = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) return res.status(401).json(ApiResponse.error('Unauthorized'));
    const { category, isBillable } = req.query;

    const query: any = { userId: req.user.id };
    if (category) query.category = category;
    if (isBillable !== undefined) query.isBillable = isBillable === 'true';

    const expenses = await Expense.find(query)
      .populate('projectId', 'name')
      .populate('clientId', 'name')
      .sort({ date: -1 });

    res.status(200).json(ApiResponse.success(expenses));
  } catch (error) {
    next(error);
  }
};

export const createExpense = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) return res.status(401).json(ApiResponse.error('Unauthorized'));

    const expense = new Expense({
      ...req.body,
      userId: req.user.id
    });

    await expense.save();
    res.status(201).json(ApiResponse.success(expense, 'Expense logged successfully'));
  } catch (error) {
    next(error);
  }
};

export const updateExpense = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) return res.status(401).json(ApiResponse.error('Unauthorized'));

    const expense = await Expense.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { $set: req.body },
      { new: true }
    );

    if (!expense) {
      const error: ApiError = new Error('Expense not found');
      error.statusCode = 404;
      error.code = 'EXPENSE_NOT_FOUND';
      return next(error);
    }

    res.status(200).json(ApiResponse.success(expense, 'Expense updated successfully'));
  } catch (error) {
    next(error);
  }
};

export const deleteExpense = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) return res.status(401).json(ApiResponse.error('Unauthorized'));

    const expense = await Expense.findOneAndDelete({ _id: req.params.id, userId: req.user.id });

    if (!expense) {
      const error: ApiError = new Error('Expense not found');
      error.statusCode = 404;
      error.code = 'EXPENSE_NOT_FOUND';
      return next(error);
    }

    res.status(200).json(ApiResponse.success(null, 'Expense deleted successfully'));
  } catch (error) {
    next(error);
  }
};
