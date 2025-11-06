const express = require('express');
const Joi = require('joi');
const invoiceController = require('../controllers/invoiceController');
const { verifyToken, requireRole } = require('../middleware/auth');
const { validateBody, validateParams, validateQuery } = require('../middleware/validation');

const router = express.Router();

// Validation schemas
const createInvoiceSchema = Joi.object({
  schoolId: Joi.string().uuid().required(),
  studentId: Joi.string().uuid().required(),
  description: Joi.string().required(),
  amount: Joi.number().min(0).required(),
  dueDate: Joi.date().optional(),
  notes: Joi.string().optional(),
});

const updateInvoiceSchema = Joi.object({
  description: Joi.string().optional(),
  amount: Joi.number().min(0).optional(),
  dueDate: Joi.date().optional(),
  notes: Joi.string().optional(),
  status: Joi.string().valid('draft', 'sent', 'paid', 'overdue', 'cancelled').optional(),
});

const recordPaymentSchema = Joi.object({
  amount: Joi.number().min(0).required(),
  paymentMethod: Joi.string().valid('bank_transfer', 'orange_money', 'cash', 'check').required(),
  transactionId: Joi.string().optional(),
  notes: Joi.string().optional(),
});

const idParamsSchema = Joi.object({
  id: Joi.string().uuid().required(),
});

const listInvoicesSchema = Joi.object({
  schoolId: Joi.string().uuid().required(),
  page: Joi.number().min(1).optional(),
  pageSize: Joi.number().min(1).max(100).optional(),
  status: Joi.string().valid('draft', 'sent', 'paid', 'overdue', 'cancelled').optional(),
  studentId: Joi.string().uuid().optional(),
});

const reportSchema = Joi.object({
  schoolId: Joi.string().uuid().required(),
  startDate: Joi.date().optional(),
  endDate: Joi.date().optional(),
});

/**
 * @route POST /api/invoices
 * @desc Create a new invoice
 * @access Private
 */
router.post(
  '/',
  verifyToken,
  validateBody(createInvoiceSchema),
  invoiceController.createInvoice
);

/**
 * @route GET /api/invoices
 * @desc Get all invoices with filtering and pagination
 * @access Private
 */
router.get(
  '/',
  verifyToken,
  validateQuery(listInvoicesSchema),
  invoiceController.getAllInvoices
);

/**
 * @route GET /api/invoices/reports/summary
 * @desc Get financial report
 * @access Private
 */
router.get(
  '/reports/summary',
  verifyToken,
  validateQuery(reportSchema),
  invoiceController.getFinancialReport
);

/**
 * @route GET /api/invoices/:id
 * @desc Get invoice details with payment history
 * @access Private
 */
router.get(
  '/:id',
  verifyToken,
  validateParams(idParamsSchema),
  invoiceController.getInvoiceById
);

/**
 * @route PUT /api/invoices/:id
 * @desc Update invoice
 * @access Private
 */
router.put(
  '/:id',
  verifyToken,
  validateParams(idParamsSchema),
  validateBody(updateInvoiceSchema),
  invoiceController.updateInvoice
);

/**
 * @route POST /api/invoices/:id/payment
 * @desc Record a payment for an invoice
 * @access Private
 */
router.post(
  '/:id/payment',
  verifyToken,
  validateParams(idParamsSchema),
  validateBody(recordPaymentSchema),
  invoiceController.recordPayment
);

module.exports = router;
