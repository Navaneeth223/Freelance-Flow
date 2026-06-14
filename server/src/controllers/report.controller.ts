import { Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { Invoice } from '../models/Invoice.model';
import { Project } from '../models/Project.model';
import { TimeEntry } from '../models/TimeEntry.model';
import { Expense } from '../models/Expense.model';
import { ApiResponse } from '../utils/apiResponse';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

export const getRevenueReport = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) return res.status(401).json(ApiResponse.error('Unauthorized'));
    const userId = new mongoose.Types.ObjectId(req.user.id);

    // Monthly revenue over the past 12 months
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11);
    twelveMonthsAgo.setDate(1);
    twelveMonthsAgo.setHours(0, 0, 0, 0);

    const monthlyEarnings = await Invoice.aggregate([
      {
        $match: {
          userId,
          status: 'paid',
          paidDate: { $gte: twelveMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$paidDate' },
            month: { $month: '$paidDate' }
          },
          earnings: { $sum: '$total' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Format monthly earnings nicely for chart component
    const chartData = monthlyEarnings.map(item => {
      const date = new Date(item._id.year, item._id.month - 1);
      return {
        month: date.toLocaleString('default', { month: 'short' }),
        year: item._id.year,
        amount: item.earnings
      };
    });

    // Revenue by Client
    const clientEarnings = await Invoice.aggregate([
      {
        $match: {
          userId,
          status: 'paid'
        }
      },
      {
        $lookup: {
          from: 'clients',
          localField: 'clientId',
          foreignField: '_id',
          as: 'client'
        }
      },
      { $unwind: '$client' },
      {
        $group: {
          _id: '$client.company',
          value: { $sum: '$total' }
        }
      },
      { $sort: { value: -1 } }
    ]);

    // Revenue by Project Type
    const typeEarnings = await Project.aggregate([
      { $match: { userId } },
      {
        $lookup: {
          from: 'invoices',
          localField: '_id',
          foreignField: 'projectId',
          as: 'invoices'
        }
      },
      {
        $project: {
          type: 1,
          totalInvoiced: {
            $reduce: {
              input: '$invoices',
              initialValue: 0,
              in: { $add: ['$$value', '$$this.total'] }
            }
          }
        }
      },
      {
        $group: {
          _id: '$type',
          value: { $sum: '$totalInvoiced' }
        }
      }
    ]);

    res.status(200).json(ApiResponse.success({
      monthlyEarnings: chartData,
      revenueByClient: clientEarnings.map(e => ({ name: e._id || 'Unknown', value: e.value })),
      revenueByProjectType: typeEarnings.map(e => ({ name: e._id, value: e.value }))
    }));
  } catch (error) {
    next(error);
  }
};

export const getProjectsReport = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) return res.status(401).json(ApiResponse.error('Unauthorized'));
    const userId = new mongoose.Types.ObjectId(req.user.id);

    const totalProjects = await Project.countDocuments({ userId });
    const completedProjects = await Project.countDocuments({ userId, status: 'completed' });
    const activeProjects = await Project.countDocuments({ userId, status: 'active' });

    // Average Project Budget value
    const avgBudgetAggregation = await Project.aggregate([
      { $match: { userId } },
      { $group: { _id: null, avgBudget: { $avg: '$budget' } } }
    ]);
    const averageBudgetValue = avgBudgetAggregation[0]?.avgBudget || 0;

    res.status(200).json(ApiResponse.success({
      totalProjects,
      completedProjects,
      activeProjects,
      averageBudgetValue,
      completionRate: totalProjects > 0 ? (completedProjects / totalProjects) * 100 : 0
    }));
  } catch (error) {
    next(error);
  }
};

export const getTimeReport = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) return res.status(401).json(ApiResponse.error('Unauthorized'));
    const userId = new mongoose.Types.ObjectId(req.user.id);

    const timeStats = await TimeEntry.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: '$isBillable',
          totalDuration: { $sum: '$duration' }
        }
      }
    ]);

    let billableSeconds = 0;
    let nonBillableSeconds = 0;

    timeStats.forEach(stat => {
      if (stat._id === true) billableSeconds = stat.totalDuration;
      else nonBillableSeconds = stat.totalDuration;
    });

    const totalHours = (billableSeconds + nonBillableSeconds) / 3600;
    const billableHours = billableSeconds / 3600;

    res.status(200).json(ApiResponse.success({
      totalHours: parseFloat(totalHours.toFixed(1)),
      billableRatio: totalHours > 0 ? (billableHours / totalHours) * 100 : 0,
      billableHours: parseFloat(billableHours.toFixed(1)),
      nonBillableHours: parseFloat((nonBillableSeconds / 3600).toFixed(1))
    }));
  } catch (error) {
    next(error);
  }
};

export const getExpensesReport = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) return res.status(401).json(ApiResponse.error('Unauthorized'));
    const userId = new mongoose.Types.ObjectId(req.user.id);

    const categoryBreakdown = await Expense.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: '$category',
          value: { $sum: '$amount' }
        }
      }
    ]);

    res.status(200).json(ApiResponse.success({
      categories: categoryBreakdown.map(c => ({ name: c._id, value: c.value }))
    }));
  } catch (error) {
    next(error);
  }
};

export const getTaxReport = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) return res.status(401).json(ApiResponse.error('Unauthorized'));
    const userId = new mongoose.Types.ObjectId(req.user.id);

    // Sum total paid invoices (gross earnings)
    const grossIncomeAggregation = await Invoice.aggregate([
      { $match: { userId, status: 'paid' } },
      {
        $group: {
          _id: null,
          totalEarnings: { $sum: '$total' },
          totalTax: { $sum: '$taxAmount' }
        }
      }
    ]);
    const grossIncome = grossIncomeAggregation[0]?.totalEarnings || 0;
    const gstCollected = grossIncomeAggregation[0]?.totalTax || 0;

    // Sum total business expenses (tax deductions)
    const expensesAggregation = await Expense.aggregate([
      { $match: { userId } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const totalDeductions = expensesAggregation[0]?.total || 0;

    const estimatedTaxableIncome = grossIncome - totalDeductions;

    res.status(200).json(ApiResponse.success({
      grossIncome,
      totalDeductions,
      estimatedTaxableIncome: estimatedTaxableIncome > 0 ? estimatedTaxableIncome : 0,
      gstCollected
    }));
  } catch (error) {
    next(error);
  }
};
