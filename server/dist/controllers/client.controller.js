"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteClient = exports.updateClient = exports.createClient = exports.getClientById = exports.getClients = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const Client_model_1 = require("../models/Client.model");
const Project_model_1 = require("../models/Project.model");
const Invoice_model_1 = require("../models/Invoice.model");
const apiResponse_1 = require("../utils/apiResponse");
const getClients = async (req, res, next) => {
    try {
        if (!req.user)
            return res.status(401).json(apiResponse_1.ApiResponse.error('Unauthorized'));
        const userId = new mongoose_1.default.Types.ObjectId(req.user.id);
        const { status, search } = req.query;
        const matchStage = { userId };
        if (status)
            matchStage.status = status;
        if (search) {
            matchStage.$or = [
                { name: { $regex: search, $options: 'i' } },
                { company: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }
        // Pipeline to aggregate Client metadata dynamically
        const clients = await Client_model_1.Client.aggregate([
            { $match: matchStage },
            // Look up invoices for calculations
            {
                $lookup: {
                    from: 'invoices',
                    localField: '_id',
                    foreignField: 'clientId',
                    as: 'invoices'
                }
            },
            // Look up projects
            {
                $lookup: {
                    from: 'projects',
                    localField: '_id',
                    foreignField: 'clientId',
                    as: 'projects'
                }
            },
            {
                $addFields: {
                    projectsCount: { $size: '$projects' },
                    openInvoices: {
                        $size: {
                            $filter: {
                                input: '$invoices',
                                as: 'inv',
                                cond: { $in: ['$$inv.status', ['sent', 'viewed', 'overdue', 'partially_paid']] }
                            }
                        }
                    },
                    totalBilled: {
                        $reduce: {
                            input: '$invoices',
                            initialValue: 0,
                            in: { $add: ['$$value', '$$this.total'] }
                        }
                    },
                    totalPaid: {
                        $reduce: {
                            input: '$invoices',
                            initialValue: 0,
                            in: { $add: ['$$value', '$$this.amountPaid'] }
                        }
                    }
                }
            },
            { $project: { invoices: 0, projects: 0 } },
            { $sort: { createdAt: -1 } }
        ]);
        res.status(200).json(apiResponse_1.ApiResponse.success(clients));
    }
    catch (error) {
        next(error);
    }
};
exports.getClients = getClients;
const getClientById = async (req, res, next) => {
    try {
        if (!req.user)
            return res.status(401).json(apiResponse_1.ApiResponse.error('Unauthorized'));
        const userId = new mongoose_1.default.Types.ObjectId(req.user.id);
        const clientId = new mongoose_1.default.Types.ObjectId(req.params.id);
        const clientAggregation = await Client_model_1.Client.aggregate([
            { $match: { _id: clientId, userId } },
            {
                $lookup: {
                    from: 'invoices',
                    localField: '_id',
                    foreignField: 'clientId',
                    as: 'invoices'
                }
            },
            {
                $lookup: {
                    from: 'projects',
                    localField: '_id',
                    foreignField: 'clientId',
                    as: 'projects'
                }
            },
            {
                $addFields: {
                    projectsCount: { $size: '$projects' },
                    openInvoices: {
                        $size: {
                            $filter: {
                                input: '$invoices',
                                as: 'inv',
                                cond: { $in: ['$$inv.status', ['sent', 'viewed', 'overdue', 'partially_paid']] }
                            }
                        }
                    },
                    totalBilled: {
                        $reduce: {
                            input: '$invoices',
                            initialValue: 0,
                            in: { $add: ['$$value', '$$this.total'] }
                        }
                    },
                    totalPaid: {
                        $reduce: {
                            input: '$invoices',
                            initialValue: 0,
                            in: { $add: ['$$value', '$$this.amountPaid'] }
                        }
                    }
                }
            },
            { $project: { invoices: 0, projects: 0 } }
        ]);
        if (!clientAggregation || clientAggregation.length === 0) {
            const error = new Error('Client not found');
            error.statusCode = 404;
            error.code = 'CLIENT_NOT_FOUND';
            return next(error);
        }
        res.status(200).json(apiResponse_1.ApiResponse.success(clientAggregation[0]));
    }
    catch (error) {
        next(error);
    }
};
exports.getClientById = getClientById;
const createClient = async (req, res, next) => {
    try {
        if (!req.user)
            return res.status(401).json(apiResponse_1.ApiResponse.error('Unauthorized'));
        const client = new Client_model_1.Client({
            ...req.body,
            userId: req.user.id
        });
        await client.save();
        res.status(201).json(apiResponse_1.ApiResponse.success(client, 'Client created successfully'));
    }
    catch (error) {
        next(error);
    }
};
exports.createClient = createClient;
const updateClient = async (req, res, next) => {
    try {
        if (!req.user)
            return res.status(401).json(apiResponse_1.ApiResponse.error('Unauthorized'));
        const client = await Client_model_1.Client.findOneAndUpdate({ _id: req.params.id, userId: req.user.id }, { $set: req.body }, { new: true });
        if (!client) {
            const error = new Error('Client not found or unauthorized');
            error.statusCode = 404;
            error.code = 'CLIENT_NOT_FOUND';
            return next(error);
        }
        res.status(200).json(apiResponse_1.ApiResponse.success(client, 'Client updated successfully'));
    }
    catch (error) {
        next(error);
    }
};
exports.updateClient = updateClient;
const deleteClient = async (req, res, next) => {
    try {
        if (!req.user)
            return res.status(401).json(apiResponse_1.ApiResponse.error('Unauthorized'));
        const client = await Client_model_1.Client.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
        if (!client) {
            const error = new Error('Client not found or unauthorized');
            error.statusCode = 404;
            error.code = 'CLIENT_NOT_FOUND';
            return next(error);
        }
        // Optionally cleanup linked projects and invoices
        await Project_model_1.Project.deleteMany({ clientId: client._id, userId: req.user.id });
        await Invoice_model_1.Invoice.deleteMany({ clientId: client._id, userId: req.user.id });
        res.status(200).json(apiResponse_1.ApiResponse.success(null, 'Client and all related records deleted successfully'));
    }
    catch (error) {
        next(error);
    }
};
exports.deleteClient = deleteClient;
