import { Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { Client } from '../models/Client.model';
import { Project } from '../models/Project.model';
import { Invoice } from '../models/Invoice.model';
import { ApiResponse } from '../utils/apiResponse';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { ApiError } from '../middleware/error.middleware';

export const getClients = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) return res.status(401).json(ApiResponse.error('Unauthorized'));
    const userId = new mongoose.Types.ObjectId(req.user.id);
    const { status, search } = req.query;

    const matchStage: any = { userId };
    if (status) matchStage.status = status;
    if (search) {
      matchStage.$or = [
        { name: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    // Pipeline to aggregate Client metadata dynamically
    const clients = await Client.aggregate([
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

    res.status(200).json(ApiResponse.success(clients));
  } catch (error) {
    next(error);
  }
};

export const getClientById = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) return res.status(401).json(ApiResponse.error('Unauthorized'));
    const userId = new mongoose.Types.ObjectId(req.user.id);
    const clientId = new mongoose.Types.ObjectId(req.params.id);

    const clientAggregation = await Client.aggregate([
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
      const error: ApiError = new Error('Client not found');
      error.statusCode = 404;
      error.code = 'CLIENT_NOT_FOUND';
      return next(error);
    }

    res.status(200).json(ApiResponse.success(clientAggregation[0]));
  } catch (error) {
    next(error);
  }
};

export const createClient = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) return res.status(401).json(ApiResponse.error('Unauthorized'));

    const client = new Client({
      ...req.body,
      userId: req.user.id
    });
    await client.save();

    res.status(201).json(ApiResponse.success(client, 'Client created successfully'));
  } catch (error) {
    next(error);
  }
};

export const updateClient = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) return res.status(401).json(ApiResponse.error('Unauthorized'));

    const client = await Client.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { $set: req.body },
      { new: true }
    );

    if (!client) {
      const error: ApiError = new Error('Client not found or unauthorized');
      error.statusCode = 404;
      error.code = 'CLIENT_NOT_FOUND';
      return next(error);
    }

    res.status(200).json(ApiResponse.success(client, 'Client updated successfully'));
  } catch (error) {
    next(error);
  }
};

export const deleteClient = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) return res.status(401).json(ApiResponse.error('Unauthorized'));

    const client = await Client.findOneAndDelete({ _id: req.params.id, userId: req.user.id });

    if (!client) {
      const error: ApiError = new Error('Client not found or unauthorized');
      error.statusCode = 404;
      error.code = 'CLIENT_NOT_FOUND';
      return next(error);
    }

    // Optionally cleanup linked projects and invoices
    await Project.deleteMany({ clientId: client._id, userId: req.user.id });
    await Invoice.deleteMany({ clientId: client._id, userId: req.user.id });

    res.status(200).json(ApiResponse.success(null, 'Client and all related records deleted successfully'));
  } catch (error) {
    next(error);
  }
};
