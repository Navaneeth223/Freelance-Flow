import { Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { TimeEntry } from '../models/TimeEntry.model';
import { Project } from '../models/Project.model';
import { ApiResponse } from '../utils/apiResponse';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { ApiError } from '../middleware/error.middleware';

export const getTimeEntries = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) return res.status(401).json(ApiResponse.error('Unauthorized'));
    const { projectId, clientId, date } = req.query;

    const query: any = { userId: req.user.id };
    if (projectId) query.projectId = projectId;
    if (clientId) query.clientId = clientId;
    if (date) {
      // Filter entries matching specific month/date prefix
      const start = new Date(date as string);
      const end = new Date(start.getFullYear(), start.getMonth() + 1, 0, 23, 59, 59);
      query.startTime = { $gte: start, $lte: end };
    }

    const entries = await TimeEntry.find(query)
      .populate('projectId', 'name hourlyRate')
      .populate('clientId', 'name')
      .sort({ startTime: -1 });

    res.status(200).json(ApiResponse.success(entries));
  } catch (error) {
    next(error);
  }
};

export const createTimeEntry = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) return res.status(401).json(ApiResponse.error('Unauthorized'));
    const { projectId, startTime, endTime, isBillable, description } = req.body;

    // Retrieve project to get default hourly rate
    const project = await Project.findOne({ _id: projectId, userId: req.user.id });
    if (!project) {
      const error: ApiError = new Error('Project not found');
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

    const entry = new TimeEntry({
      ...req.body,
      clientId: project.clientId,
      hourlyRate,
      duration,
      amount,
      date: startTime ? new Date(new Date(startTime).toDateString()) : new Date(),
      userId: req.user.id
    });

    await entry.save();
    res.status(201).json(ApiResponse.success(entry, 'Time entry created successfully'));
  } catch (error) {
    next(error);
  }
};

export const stopActiveTimer = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) return res.status(401).json(ApiResponse.error('Unauthorized'));
    const { entryId } = req.body;

    const entry = await TimeEntry.findOne({ _id: entryId, userId: req.user.id, endTime: { $exists: false } });
    if (!entry) {
      const error: ApiError = new Error('No active timer found for this entry');
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

    res.status(200).json(ApiResponse.success(entry, 'Timer stopped successfully'));
  } catch (error) {
    next(error);
  }
};

export const updateTimeEntry = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) return res.status(401).json(ApiResponse.error('Unauthorized'));

    const { startTime, endTime, isBillable } = req.body;
    let updateFields = { ...req.body };

    if (startTime && endTime) {
      const start = new Date(startTime);
      const end = new Date(endTime);
      const duration = Math.round((end.getTime() - start.getTime()) / 1000);
      updateFields.duration = duration;
      
      if (isBillable !== undefined) {
        const entry = await TimeEntry.findOne({ _id: req.params.id, userId: req.user.id });
        if (entry) {
          updateFields.amount = isBillable ? (duration / 3600) * entry.hourlyRate : 0;
        }
      }
    }

    const entry = await TimeEntry.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { $set: updateFields },
      { new: true }
    );

    if (!entry) {
      const error: ApiError = new Error('Time entry not found');
      error.statusCode = 404;
      error.code = 'TIME_ENTRY_NOT_FOUND';
      return next(error);
    }

    res.status(200).json(ApiResponse.success(entry, 'Time entry updated successfully'));
  } catch (error) {
    next(error);
  }
};

export const deleteTimeEntry = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) return res.status(401).json(ApiResponse.error('Unauthorized'));

    const entry = await TimeEntry.findOneAndDelete({ _id: req.params.id, userId: req.user.id });

    if (!entry) {
      const error: ApiError = new Error('Time entry not found');
      error.statusCode = 404;
      error.code = 'TIME_ENTRY_NOT_FOUND';
      return next(error);
    }

    res.status(200).json(ApiResponse.success(null, 'Time entry deleted successfully'));
  } catch (error) {
    next(error);
  }
};
