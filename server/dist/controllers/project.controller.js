"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProject = exports.updateProject = exports.createProject = exports.getProjectById = exports.getProjects = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const Project_model_1 = require("../models/Project.model");
const TimeEntry_model_1 = require("../models/TimeEntry.model");
const Invoice_model_1 = require("../models/Invoice.model");
const apiResponse_1 = require("../utils/apiResponse");
const getProjects = async (req, res, next) => {
    try {
        if (!req.user)
            return res.status(401).json(apiResponse_1.ApiResponse.error('Unauthorized'));
        const userId = new mongoose_1.default.Types.ObjectId(req.user.id);
        const { status, search } = req.query;
        const matchStage = { userId };
        if (status)
            matchStage.status = status;
        if (search) {
            matchStage.name = { $regex: search, $options: 'i' };
        }
        const projects = await Project_model_1.Project.aggregate([
            { $match: matchStage },
            {
                $lookup: {
                    from: 'clients',
                    localField: 'clientId',
                    foreignField: '_id',
                    as: 'client'
                }
            },
            { $unwind: { path: '$client', preserveNullAndEmptyArrays: true } },
            // Look up time entries to compute tracked hours
            {
                $lookup: {
                    from: 'timeentries',
                    localField: '_id',
                    foreignField: 'projectId',
                    as: 'timeEntries'
                }
            },
            // Look up invoices to compute total billed
            {
                $lookup: {
                    from: 'invoices',
                    localField: '_id',
                    foreignField: 'projectId',
                    as: 'invoices'
                }
            },
            {
                $addFields: {
                    totalTrackedHours: {
                        $divide: [
                            {
                                $reduce: {
                                    input: '$timeEntries',
                                    initialValue: 0,
                                    in: { $add: ['$$value', '$$this.duration'] }
                                }
                            },
                            3600 // convert seconds to hours
                        ]
                    },
                    totalBilled: {
                        $reduce: {
                            input: '$invoices',
                            initialValue: 0,
                            in: { $add: ['$$value', '$$this.total'] }
                        }
                    },
                    progressPercent: {
                        $cond: {
                            if: { $eq: ['$status', 'completed'] },
                            then: 100,
                            else: {
                                $cond: {
                                    if: { $eq: [{ $size: '$milestones' }, 0] },
                                    then: 0,
                                    else: {
                                        $multiply: [
                                            {
                                                $divide: [
                                                    {
                                                        $size: {
                                                            $filter: {
                                                                input: '$milestones',
                                                                as: 'm',
                                                                cond: { $eq: ['$$m.status', 'completed'] }
                                                            }
                                                        }
                                                    },
                                                    { $size: '$milestones' }
                                                ]
                                            },
                                            100
                                        ]
                                    }
                                }
                            }
                        }
                    }
                }
            },
            { $project: { timeEntries: 0, invoices: 0 } },
            { $sort: { createdAt: -1 } }
        ]);
        res.status(200).json(apiResponse_1.ApiResponse.success(projects));
    }
    catch (error) {
        next(error);
    }
};
exports.getProjects = getProjects;
const getProjectById = async (req, res, next) => {
    try {
        if (!req.user)
            return res.status(401).json(apiResponse_1.ApiResponse.error('Unauthorized'));
        const userId = new mongoose_1.default.Types.ObjectId(req.user.id);
        const projectId = new mongoose_1.default.Types.ObjectId(req.params.id);
        const projectAggregation = await Project_model_1.Project.aggregate([
            { $match: { _id: projectId, userId } },
            {
                $lookup: {
                    from: 'clients',
                    localField: 'clientId',
                    foreignField: '_id',
                    as: 'client'
                }
            },
            { $unwind: { path: '$client', preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: 'timeentries',
                    localField: '_id',
                    foreignField: 'projectId',
                    as: 'timeEntries'
                }
            },
            {
                $lookup: {
                    from: 'invoices',
                    localField: '_id',
                    foreignField: 'projectId',
                    as: 'invoices'
                }
            },
            {
                $addFields: {
                    totalTrackedHours: {
                        $divide: [
                            {
                                $reduce: {
                                    input: '$timeEntries',
                                    initialValue: 0,
                                    in: { $add: ['$$value', '$$this.duration'] }
                                }
                            },
                            3600
                        ]
                    },
                    totalBilled: {
                        $reduce: {
                            input: '$invoices',
                            initialValue: 0,
                            in: { $add: ['$$value', '$$this.total'] }
                        }
                    },
                    progressPercent: {
                        $cond: {
                            if: { $eq: ['$status', 'completed'] },
                            then: 100,
                            else: {
                                $cond: {
                                    if: { $eq: [{ $size: '$milestones' }, 0] },
                                    then: 0,
                                    else: {
                                        $multiply: [
                                            {
                                                $divide: [
                                                    {
                                                        $size: {
                                                            $filter: {
                                                                input: '$milestones',
                                                                as: 'm',
                                                                cond: { $eq: ['$$m.status', 'completed'] }
                                                            }
                                                        }
                                                    },
                                                    { $size: '$milestones' }
                                                ]
                                            },
                                            100
                                        ]
                                    }
                                }
                            }
                        }
                    }
                }
            },
            { $project: { timeEntries: 0, invoices: 0 } }
        ]);
        if (!projectAggregation || projectAggregation.length === 0) {
            const error = new Error('Project not found');
            error.statusCode = 404;
            error.code = 'PROJECT_NOT_FOUND';
            return next(error);
        }
        res.status(200).json(apiResponse_1.ApiResponse.success(projectAggregation[0]));
    }
    catch (error) {
        next(error);
    }
};
exports.getProjectById = getProjectById;
const createProject = async (req, res, next) => {
    try {
        if (!req.user)
            return res.status(401).json(apiResponse_1.ApiResponse.error('Unauthorized'));
        const project = new Project_model_1.Project({
            ...req.body,
            userId: req.user.id
        });
        await project.save();
        res.status(201).json(apiResponse_1.ApiResponse.success(project, 'Project created successfully'));
    }
    catch (error) {
        next(error);
    }
};
exports.createProject = createProject;
const updateProject = async (req, res, next) => {
    try {
        if (!req.user)
            return res.status(401).json(apiResponse_1.ApiResponse.error('Unauthorized'));
        const project = await Project_model_1.Project.findOneAndUpdate({ _id: req.params.id, userId: req.user.id }, { $set: req.body }, { new: true });
        if (!project) {
            const error = new Error('Project not found or unauthorized');
            error.statusCode = 404;
            error.code = 'PROJECT_NOT_FOUND';
            return next(error);
        }
        res.status(200).json(apiResponse_1.ApiResponse.success(project, 'Project updated successfully'));
    }
    catch (error) {
        next(error);
    }
};
exports.updateProject = updateProject;
const deleteProject = async (req, res, next) => {
    try {
        if (!req.user)
            return res.status(401).json(apiResponse_1.ApiResponse.error('Unauthorized'));
        const project = await Project_model_1.Project.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
        if (!project) {
            const error = new Error('Project not found or unauthorized');
            error.statusCode = 404;
            error.code = 'PROJECT_NOT_FOUND';
            return next(error);
        }
        // Clean up related invoices and time entries
        await Invoice_model_1.Invoice.deleteMany({ projectId: project._id, userId: req.user.id });
        await TimeEntry_model_1.TimeEntry.deleteMany({ projectId: project._id, userId: req.user.id });
        res.status(200).json(apiResponse_1.ApiResponse.success(null, 'Project and all related records deleted successfully'));
    }
    catch (error) {
        next(error);
    }
};
exports.deleteProject = deleteProject;
