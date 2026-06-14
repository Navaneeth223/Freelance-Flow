import { Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { Invoice } from '../models/Invoice.model';
import { User } from '../models/User.model';
import { ApiResponse } from '../utils/apiResponse';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { ApiError } from '../middleware/error.middleware';

const calculateTotals = (body: any) => {
  const lineItems = body.lineItems || [];
  let subtotal = 0;
  let taxAmount = 0;

  // Compute line item amounts and subtotal
  lineItems.forEach((item: any) => {
    item.amount = (item.quantity || 1) * (item.unitPrice || 0);
    subtotal += item.amount;
  });

  const discountType = body.discountType || 'percent';
  const discountValue = body.discountValue || 0;
  let discountAmount = 0;

  if (discountType === 'percent') {
    discountAmount = subtotal * (discountValue / 100);
  } else {
    discountAmount = discountValue;
  }

  // Calculate tax amount on the discounted total
  lineItems.forEach((item: any) => {
    const itemAmount = (item.quantity || 1) * (item.unitPrice || 0);
    // Proportionate discount for this item
    const itemProportion = subtotal > 0 ? itemAmount / subtotal : 0;
    const itemDiscount = discountAmount * itemProportion;
    const taxableItemAmount = itemAmount - itemDiscount;
    const itemTax = taxableItemAmount * ((item.taxRate || 0) / 100);
    taxAmount += itemTax;
  });

  const total = subtotal - discountAmount + taxAmount;
  const amountPaid = body.amountPaid || 0;
  const amountDue = total - amountPaid;

  return {
    lineItems,
    subtotal,
    discountAmount,
    taxAmount,
    total,
    amountPaid,
    amountDue
  };
};

export const getInvoices = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) return res.status(401).json(ApiResponse.error('Unauthorized'));
    const { status, clientId, projectId } = req.query;

    const query: any = { userId: req.user.id };
    if (status) query.status = status;
    if (clientId) query.clientId = clientId;
    if (projectId) query.projectId = projectId;

    const invoices = await Invoice.find(query)
      .populate('clientId', 'name email company logo')
      .populate('projectId', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json(ApiResponse.success(invoices));
  } catch (error) {
    next(error);
  }
};

export const getInvoiceById = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) return res.status(401).json(ApiResponse.error('Unauthorized'));

    const invoice = await Invoice.findOne({ _id: req.params.id, userId: req.user.id })
      .populate('clientId')
      .populate('projectId');

    if (!invoice) {
      const error: ApiError = new Error('Invoice not found or you don\'t have access');
      error.statusCode = 404;
      error.code = 'INVOICE_NOT_FOUND';
      return next(error);
    }

    res.status(200).json(ApiResponse.success(invoice));
  } catch (error) {
    next(error);
  }
};

export const createInvoice = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) return res.status(401).json(ApiResponse.error('Unauthorized'));

    const calculated = calculateTotals(req.body);

    // Get next invoice number prefix from User
    const user = await User.findById(req.user.id);
    let invoiceNumber = req.body.invoiceNumber;
    if (!invoiceNumber && user) {
      const prefix = user.invoicePrefix || 'INV';
      const num = String(user.nextInvoiceNumber).padStart(4, '0');
      invoiceNumber = `${prefix}-${num}`;
      
      // Increment user's next invoice number
      user.nextInvoiceNumber += 1;
      await user.save();
    }

    const invoice = new Invoice({
      ...req.body,
      ...calculated,
      invoiceNumber,
      userId: req.user.id
    });

    await invoice.save();
    res.status(201).json(ApiResponse.success(invoice, 'Invoice created successfully'));
  } catch (error) {
    next(error);
  }
};

export const updateInvoice = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) return res.status(401).json(ApiResponse.error('Unauthorized'));

    const calculated = calculateTotals(req.body);

    const invoice = await Invoice.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { $set: { ...req.body, ...calculated } },
      { new: true }
    );

    if (!invoice) {
      const error: ApiError = new Error('Invoice not found');
      error.statusCode = 404;
      error.code = 'INVOICE_NOT_FOUND';
      return next(error);
    }

    res.status(200).json(ApiResponse.success(invoice, 'Invoice updated successfully'));
  } catch (error) {
    next(error);
  }
};

export const deleteInvoice = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) return res.status(401).json(ApiResponse.error('Unauthorized'));

    const invoice = await Invoice.findOneAndDelete({ _id: req.params.id, userId: req.user.id });

    if (!invoice) {
      const error: ApiError = new Error('Invoice not found');
      error.statusCode = 404;
      error.code = 'INVOICE_NOT_FOUND';
      return next(error);
    }

    res.status(200).json(ApiResponse.success(null, 'Invoice deleted successfully'));
  } catch (error) {
    next(error);
  }
};

export const markPaid = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) return res.status(401).json(ApiResponse.error('Unauthorized'));
    const { paymentMethod, paymentReference } = req.body;

    const invoice = await Invoice.findOne({ _id: req.params.id, userId: req.user.id });
    if (!invoice) {
      const error: ApiError = new Error('Invoice not found');
      error.statusCode = 404;
      error.code = 'INVOICE_NOT_FOUND';
      return next(error);
    }

    invoice.status = 'paid';
    invoice.amountPaid = invoice.total;
    invoice.amountDue = 0;
    invoice.paidDate = new Date();
    if (paymentMethod) invoice.paymentMethod = paymentMethod;
    if (paymentReference) invoice.paymentReference = paymentReference;

    await invoice.save();
    res.status(200).json(ApiResponse.success(invoice, 'Invoice marked as paid'));
  } catch (error) {
    next(error);
  }
};

export const sendInvoice = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) return res.status(401).json(ApiResponse.error('Unauthorized'));

    const invoice = await Invoice.findOne({ _id: req.params.id, userId: req.user.id }).populate('clientId');
    if (!invoice) {
      const error: ApiError = new Error('Invoice not found');
      error.statusCode = 404;
      error.code = 'INVOICE_NOT_FOUND';
      return next(error);
    }

    invoice.status = 'sent';
    invoice.sentAt = new Date();
    await invoice.save();

    res.status(200).json(ApiResponse.success(invoice, 'Invoice email triggered successfully'));
  } catch (error) {
    next(error);
  }
};

export const getInvoicePdf = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) return res.status(401).json(ApiResponse.error('Unauthorized'));

    const invoice = await Invoice.findOne({ _id: req.params.id, userId: req.user.id })
      .populate('clientId')
      .populate('userId');

    if (!invoice) {
      const error: ApiError = new Error('Invoice not found');
      error.statusCode = 404;
      error.code = 'INVOICE_NOT_FOUND';
      return next(error);
    }

    // Dynamic Invoice HTML response for preview or PDF converting
    res.setHeader('Content-Type', 'text/html');
    res.send(`
      <html>
        <head>
          <style>
            body { font-family: sans-serif; color: #111; margin: 40px; }
            .header { display: flex; justify-content: space-between; border-bottom: 2px solid #6C63FF; padding-bottom: 20px; }
            .details { margin-top: 30px; display: flex; justify-content: space-between; }
            .table { width: 100%; border-collapse: collapse; margin-top: 40px; }
            .table th, .table td { border-bottom: 1px solid #ddd; padding: 12px; text-align: left; }
            .table th { background: #111118; color: #F1F0FF; }
            .totals { margin-top: 30px; text-align: right; font-size: 1.1em; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <h2>${(invoice.userId as any).businessName || 'Freelancer'}</h2>
              <p>${(invoice.userId as any).email}</p>
            </div>
            <div>
              <h1>INVOICE</h1>
              <p>Invoice #: ${invoice.invoiceNumber}</p>
              <p>Date: ${invoice.issueDate.toDateString()}</p>
            </div>
          </div>
          <div class="details">
            <div>
              <h3>Billed To:</h3>
              <p><strong>${(invoice.clientId as any).name}</strong></p>
              <p>${(invoice.clientId as any).company}</p>
              <p>${(invoice.clientId as any).email}</p>
            </div>
            <div>
              <h3>Due Date:</h3>
              <p>${invoice.dueDate.toDateString()}</p>
            </div>
          </div>
          <table class="table">
            <thead>
              <tr>
                <th>Description</th>
                <th>Qty</th>
                <th>Unit Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${invoice.lineItems.map(item => `
                <tr>
                  <td>${item.description}</td>
                  <td>${item.quantity}</td>
                  <td>${item.unitPrice.toLocaleString('en-IN', { style: 'currency', currency: invoice.currency })}</td>
                  <td>${item.amount.toLocaleString('en-IN', { style: 'currency', currency: invoice.currency })}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div class="totals">
            <p>Subtotal: ${invoice.subtotal.toLocaleString('en-IN', { style: 'currency', currency: invoice.currency })}</p>
            <p>Discount: ${invoice.discountAmount.toLocaleString('en-IN', { style: 'currency', currency: invoice.currency })}</p>
            <p>Tax: ${invoice.taxAmount.toLocaleString('en-IN', { style: 'currency', currency: invoice.currency })}</p>
            <hr />
            <h3>Total: ${invoice.total.toLocaleString('en-IN', { style: 'currency', currency: invoice.currency })}</h3>
          </div>
        </body>
      </html>
    `);
  } catch (error) {
    next(error);
  }
};
