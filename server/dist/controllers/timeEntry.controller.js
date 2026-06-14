"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTimeEntry = exports.updateTimeEntry = exports.stopActiveTimer = exports.createTimeEntry = exports.getTimeEntries = void 0;
const TimeEntry_model_1 = require("../models/TimeEntry.model");
const Project_model_1 = require("../models/Project.model");
const apiResponse_1 = require("../utils/apiResponse");
const getTimeEntries = async (req, res, next) => {
    try {
        if (!req.user)
            return res.status(401).json(apiResponse_1.ApiResponse.error('Unauthorized'));
        const { projectId, clientId, date } = req.query;
        const query = { userId: req.user.id };
        if (projectId)
            query.projectId = projectId;
        if (clientId)
            query.clientId = clientId;
        if (date) {
            // Filter entries matching specific month/date prefix
            const start = new Date(date);
            const end = new Date(start.getFullYear(), start.getMonth() + 1, 0, 23, 59, 59);
            query.startTime = { $gte: start, $lte: end };
        }
        const entries = await TimeEntry_model_1.TimeEntry.find(query)
            .populate('projectId', 'name hourlyRate')
            .populate('clientId', 'name')
            .sort({ startTime: -1 });
        res.status(200).json(apiResponse_1.ApiResponse.success(entries));
    }
    catch (error) {
        next(error);
    }
};
exports.getTimeEntries = getTimeEntries;
const createTimeEntry = async (req, res, next) => {
    try {
        if (!req.user)
            return res.status(401).json(apiResponse_1.ApiResponse.error('Unauthorized'));
        const { projectId, startTime, endTime, isBillable, description } = req.body;
        // Retrieve project to get default hourly rate
        const project = await Project_model_1.Project.findOne({ _id: projectId, userId: req.user.id });
        if (!project) {
            const error = new Error('Project not found');
            error.statusCode = 404;
            error.code = 'PROJECT_NOT_FOUND';
            return next(error);
        }
        const hourlyRate = project.hourlyRate || 0;
        let duration = 0;
        let amount = 0;
        if (startTime && endTime) {
            const start = new Date(startTime);
            const end = new Date(endTime);
            duration = Math.round((end.getTime() - start.getTime()) / 1000); // duration in seconds
            if (isBillable) {
                amount = (duration / 3600) * hourlyRate;
            }
        }
        const entry = new TimeEntry_model_1.TimeEntry({
            ...req.body,
            clientId: project.clientId,
            hourlyRate,
            duration,
            amount,
            date: startTime ? new Date(new Date(startTime).toDateString()) : new Date(),
            userId: req.user.id
        });
        await entry.save();
        res.status(201).json(apiResponse_1.ApiResponse.success(entry, 'Time entry created successfully'));
    }
    catch (error) {
        next(error);
    }
};
exports.createTimeEntry = createTimeEntry;
const stopActiveTimer = async (req, res, next) => {
    try {
        if (!req.user)
            return res.status(401).json(apiResponse_1.ApiResponse.error('Unauthorized'));
        const { entryId } = req.body;
        const entry = await TimeEntry_model_1.TimeEntry.findOne({ _id: entryId, userId: req.user.id, endTime: { $exists: false } });
        if (!entry) {
            const error = new Error('No active timer found for this entry');
            error.statusCode = 404;
            error.code = 'TIMER_NOT_FOUND';
            return next(error);
        }
        const endTime = new Date();
        const duration = Math.round((endTime.getTime() - entry.startTime.getTime()) / 1000);
        const amount = entry.isBillable ? (duration / 3600) * entry.hourlyRate : 0;
        entry.endTime = endTime;
        entry.duration = duration;
        entry.amount = amount;
        await entry.save();
        res.status(200).json(apiResponse_1.ApiResponse.success(entry, 'Timer stopped successfully'));
    }
    catch (error) {
        next(error);
    }
};
exports.stopActiveTimer = stopActiveTimer;
const updateTimeEntry = async (req, res, next) => {
    try {
        if (!req.user)
            return res.status(401).json(apiResponse_1.ApiResponse.error('Unauthorized'));
        const { startTime, endTime, isBillable } = req.body;
        let updateFields = { ...req.body };
        if (startTime && endTime) {
            const start = new Date(startTime);
            const end = new Date(endTime);
            const duration = Math.round((end.getTime() - start.getTime()) / 1000);
            updateFields.duration = duration;
            if (isBillable !== undefined) {
                const entry = await TimeEntry_model_1.TimeEntry.findOne({ _id: req.params.id, userId: req.user.id });
                if (entry) {
                    updateFields.amount = isBillable ? (duration / 3600) * entry.hourlyRate : 0;
                }
            }
        }
        const entry = await TimeEntry_model_1.TimeEntry.findOneAndUpdate({ _id: req.params.id, userId: req.user.id }, { $set: updateFields }, { new: true });
        if (!entry) {
            const error = new Error('Time entry not found');
            error.statusCode = 404;
            error.code = 'TIME_ENTRY_NOT_FOUND';
            return next(error);
        }
        res.status(200).json(apiResponse_1.ApiResponse.success(entry, 'Time entry updated successfully'));
    }
    catch (error) {
        next(error);
    }
};
exports.updateTimeEntry = updateTimeEntry;
const deleteTimeEntry = async (req, res, next) => {
    try {
        if (!req.user)
            return res.status(401).json(apiResponse_1.ApiResponse.error('Unauthorized'));
        const entry = await TimeEntry_model_1.TimeEntry.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
        if (!entry) {
            const error = new Error('Time entry not found');
            error.statusCode = 404;
            error.code = 'TIME_ENTRY_NOT_FOUND';
            return next(error);
        }
        res.status(200).json(apiResponse_1.ApiResponse.success(null, 'Time entry deleted successfully'));
    }
    catch (error) {
        next(error);
    }
};
exports.deleteTimeEntry = deleteTimeEntry;
