"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDashboardActivity = exports.getDashboardDeadlines = exports.getDashboardStats = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const Invoice_model_1 = require("../models/Invoice.model");
const Project_model_1 = require("../models/Project.model");
const TimeEntry_model_1 = require("../models/TimeEntry.model");
const Client_model_1 = require("../models/Client.model");
const apiResponse_1 = require("../utils/apiResponse");
const getDashboardStats = async (req, res, next) => {
    try {
        if (!req.user)
            return res.status(401).json(apiResponse_1.ApiResponse.error('Unauthorized'));
        const userId = new mongoose_1.default.Types.ObjectId(req.user.id);
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
        // 1. Calculate Earnings This Month
        const earningsAggregation = await Invoice_model_1.Invoice.aggregate([
            {
                $match: {
                    userId,
                    status: 'paid',
                    paidDate: { $gte: startOfMonth, $lte: endOfMonth }
                }
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: '$total' }
                }
            }
        ]);
        const earningsThisMonth = earningsAggregation[0]?.total || 0;
        // 2. Count Active Projects
        const activeProjectsCount = await Project_model_1.Project.countDocuments({ userId, status: 'active' });
        // 3. Calculate Unpaid Invoices Total
        const unpaidAggregation = await Invoice_model_1.Invoice.aggregate([
            {
                $match: {
                    userId,
                    status: { $in: ['sent', 'viewed', 'overdue', 'partially_paid'] }
                }
            },
            {
                $group: {
                    _id: null,
                    totalDue: { $sum: '$amountDue' }
                }
            }
        ]);
        const unpaidAmount = unpaidAggregation[0]?.totalDue || 0;
        // 4. Calculate Hours Tracked This Month
        const timeAggregation = await TimeEntry_model_1.TimeEntry.aggregate([
            {
                $match: {
                    userId,
                    startTime: { $gte: startOfMonth, $lte: endOfMonth }
                }
            },
            {
                $group: {
                    _id: null,
                    totalDuration: { $sum: '$duration' }
                }
            }
        ]);
        const secondsTracked = timeAggregation[0]?.totalDuration || 0;
        const hoursTracked = parseFloat((secondsTracked / 3600).toFixed(1));
        res.status(200).json(apiResponse_1.ApiResponse.success({
            earningsThisMonth,
            activeProjectsCount,
            unpaidAmount,
            hoursTracked
        }));
    }
    catch (error) {
        next(error);
    }
};
exports.getDashboardStats = getDashboardStats;
const getDashboardDeadlines = async (req, res, next) => {
    try {
        if (!req.user)
            return res.status(401).json(apiResponse_1.ApiResponse.error('Unauthorized'));
        const userId = new mongoose_1.default.Types.ObjectId(req.user.id);
        const upcomingProjects = await Project_model_1.Project.find({
            userId,
            status: { $in: ['active', 'on_hold'] },
            endDate: { $exists: true }
        })
            .populate('clientId', 'name company')
            .sort({ endDate: 1 })
            .limit(5);
        res.status(200).json(apiResponse_1.ApiResponse.success(upcomingProjects));
    }
    catch (error) {
        next(error);
    }
};
exports.getDashboardDeadlines = getDashboardDeadlines;
const getDashboardActivity = async (req, res, next) => {
    try {
        if (!req.user)
            return res.status(401).json(apiResponse_1.ApiResponse.error('Unauthorized'));
        // Construct a dynamic timeline activity feed from newest records
        const recentClients = await Client_model_1.Client.find({ userId: req.user.id }).sort({ createdAt: -1 }).limit(3);
        const recentInvoices = await Invoice_model_1.Invoice.find({ userId: req.user.id }).populate('clientId', 'name').sort({ updatedAt: -1 }).limit(3);
        const recentTimeEntries = await TimeEntry_model_1.TimeEntry.find({ userId: req.user.id }).populate('projectId', 'name').sort({ createdAt: -1 }).limit(3);
        const activities = [];
        recentClients.forEach(c => {
            activities.push({
                id: `client-${c._id}`,
                type: 'client',
                text: `🤝 New client "${c.company || c.name}" was added`,
                timestamp: c.createdAt
            });
        });
        recentInvoices.forEach(inv => {
            let statusText = 'updated';
            if (inv.status === 'paid')
                statusText = 'marked as paid';
            if (inv.status === 'sent')
                statusText = 'sent to client';
            activities.push({
                id: `invoice-${inv._id}-${inv.status}`,
                type: 'invoice',
                text: `🧾 Invoice ${inv.invoiceNumber} ${statusText} • ${inv.currencySymbol || '₹'}${inv.total.toLocaleString('en-IN')}`,
                timestamp: inv.updatedAt
            });
        });
        recentTimeEntries.forEach(te => {
            const hours = (te.duration / 3600).toFixed(1);
            activities.push({
                id: `time-${te._id}`,
                type: 'time',
                text: `⏱ Logged ${hours} hrs on "${te.projectId?.name || 'Project'}"`,
                timestamp: te.createdAt
            });
        });
        // Sort by newest timestamp
        activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
        res.status(200).json(apiResponse_1.ApiResponse.success(activities.slice(0, 10)));
    }
    catch (error) {
        next(error);
    }
};
exports.getDashboardActivity = getDashboardActivity;
