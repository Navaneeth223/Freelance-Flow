import { Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { Project } from '../models/Project.model';
import { TimeEntry } from '../models/TimeEntry.model';
import { Invoice } from '../models/Invoice.model';
import { ApiResponse } from '../utils/apiResponse';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { ApiError } from '../middleware/error.middleware';

export const getProjects = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) return res.status(401).json(ApiResponse.error('Unauthorized'));
    const userId = new mongoose.Types.ObjectId(req.user.id);
    const { status, search } = req.query;

    const matchStage: any = { userId };
    if (status) matchStage.status = status;
    if (search) {
      matchStage.name = { $regex: search, $options: 'i' };
    }

    const projects = await Project.aggregate([
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

    res.status(200).json(ApiResponse.success(projects));
  } catch (error) {
    next(error);
  }
};

export const getProjectById = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) return res.status(401).json(ApiResponse.error('Unauthorized'));
    const userId = new mongoose.Types.ObjectId(req.user.id);
    const projectId = new mongoose.Types.ObjectId(req.params.id);

    const projectAggregation = await Project.aggregate([
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
      const error: ApiError = new Error('Project not found');
      error.statusCode = 404;
      error.code = 'PROJECT_NOT_FOUND';
      return next(error);
    }

    res.status(200).json(ApiResponse.success(projectAggregation[0]));
  } catch (error) {
    next(error);
  }
};

export const createProject = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) return res.status(401).json(ApiResponse.error('Unauthorized'));

    const project = new Project({
      ...req.body,
      userId: req.user.id
    });
    await project.save();

    res.status(201).json(ApiResponse.success(project, 'Project created successfully'));
  } catch (error) {
    next(error);
  }
};

export const updateProject = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) return res.status(401).json(ApiResponse.error('Unauthorized'));

    const project = await Project.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { $set: req.body },
      { new: true }
    );

    if (!project) {
      const error: ApiError = new Error('Project not found or unauthorized');
      error.statusCode = 404;
      error.code = 'PROJECT_NOT_FOUND';
      return next(error);
    }

    res.status(200).json(ApiResponse.success(project, 'Project updated successfully'));
  } catch (error) {
    next(error);
  }
};

export const deleteProject = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) return res.status(401).json(ApiResponse.error('Unauthorized'));

    const project = await Project.findOneAndDelete({ _id: req.params.id, userId: req.user.id });

    if (!project) {
      const error: ApiError = new Error('Project not found or unauthorized');
      error.statusCode = 404;
      error.code = 'PROJECT_NOT_FOUND';
      return next(error);
    }

    // Clean up related invoices and time entries
    await Invoice.deleteMany({ projectId: project._id, userId: req.user.id });
    await TimeEntry.deleteMany({ projectId: project._id, userId: req.user.id });

    res.status(200).json(ApiResponse.success(null, 'Project and all related records deleted successfully'));
  } catch (error) {
    next(error);
  }
};
