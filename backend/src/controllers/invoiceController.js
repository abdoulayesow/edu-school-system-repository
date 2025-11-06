const { v4: uuidv4 } = require('uuid');
const pool = require('../config/database');
const { sendSuccess, sendCreated, sendError, sendNotFound, sendPaginated } = require('../utils/response');

/**
 * Create a new invoice
 * POST /api/invoices
 */
async function createInvoice(req, res) {
  const client = await pool.connect();

  try {
    const { schoolId, studentId, description, amount, dueDate, notes } = req.body;
    const createdByUserId = req.user.userId;

    // Verify student exists in school
    const studentCheck = await client.query(
      'SELECT id FROM students WHERE id = $1 AND school_id = $2',
      [studentId, schoolId]
    );

    if (studentCheck.rows.length === 0) {
      return sendError(res, 400, 'Student not found in this school', 'STUDENT_NOT_FOUND');
    }

    // Generate invoice number
    const invoiceNumberResult = await client.query(
      "SELECT COUNT(*) as count FROM invoices WHERE school_id = $1 AND DATE(created_at) = CURRENT_DATE",
      [schoolId]
    );
    const count = parseInt(invoiceNumberResult.rows[0].count) + 1;
    const invoiceNumber = `INV-${schoolId.substring(0, 8)}-${new Date().getFullYear()}-${String(count).padStart(4, '0')}`;

    // Create invoice
    const invoiceId = uuidv4();
    const now = new Date();

    const result = await client.query(
      `INSERT INTO invoices (id, school_id, student_id, invoice_number, description, amount, due_date, issued_date, status, notes, created_by, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
       RETURNING id, invoice_number, amount, amount_paid, status, created_at`,
      [invoiceId, schoolId, studentId, invoiceNumber, description, amount, dueDate || null, now, 'draft', notes || null, createdByUserId, now, now]
    );

    const invoice = result.rows[0];

    return sendCreated(res, {
      id: invoice.id,
      invoiceNumber: invoice.invoice_number,
      amount: parseFloat(invoice.amount),
      amountPaid: parseFloat(invoice.amount_paid),
      status: invoice.status,
      createdAt: invoice.created_at,
    }, 'Invoice created successfully');
  } catch (error) {
    console.error('Create invoice error:', error);
    return sendError(res, 500, error.message, 'CREATE_INVOICE_ERROR');
  } finally {
    client.release();
  }
}

/**
 * Get all invoices
 * GET /api/invoices
 */
async function getAllInvoices(req, res) {
  const client = await pool.connect();

  try {
    const schoolId = req.query.schoolId;
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 20;
    const status = req.query.status;
    const studentId = req.query.studentId;

    // Verify school exists
    const schoolCheck = await client.query(
      'SELECT id FROM schools WHERE id = $1',
      [schoolId]
    );

    if (schoolCheck.rows.length === 0) {
      return sendNotFound(res, 'School not found', 'SCHOOL_NOT_FOUND');
    }

    const offset = (page - 1) * pageSize;

    let countQuery = 'SELECT COUNT(*) as count FROM invoices WHERE school_id = $1';
    let countParams = [schoolId];

    if (status) {
      countQuery += ' AND status = $' + (countParams.length + 1);
      countParams.push(status);
    }
    if (studentId) {
      countQuery += ' AND student_id = $' + (countParams.length + 1);
      countParams.push(studentId);
    }

    const countResult = await client.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].count);

    let dataQuery = `SELECT invoices.id, invoices.invoice_number, invoices.amount, invoices.amount_paid,
                            invoices.status, invoices.due_date, invoices.created_at,
                            students.first_name, students.last_name
                     FROM invoices
                     JOIN students ON invoices.student_id = students.id
                     WHERE invoices.school_id = $1`;
    let dataParams = [schoolId];

    if (status) {
      dataQuery += ' AND invoices.status = $' + (dataParams.length + 1);
      dataParams.push(status);
    }
    if (studentId) {
      dataQuery += ' AND invoices.student_id = $' + (dataParams.length + 1);
      dataParams.push(studentId);
    }

    dataQuery += ' ORDER BY invoices.created_at DESC LIMIT $' + (dataParams.length + 1) + ' OFFSET $' + (dataParams.length + 2);
    dataParams.push(pageSize, offset);

    const result = await client.query(dataQuery, dataParams);

    const invoices = result.rows.map(inv => ({
      id: inv.id,
      invoiceNumber: inv.invoice_number,
      studentName: `${inv.first_name} ${inv.last_name}`,
      amount: parseFloat(inv.amount),
      amountPaid: parseFloat(inv.amount_paid),
      outstandingAmount: parseFloat(inv.amount) - parseFloat(inv.amount_paid),
      status: inv.status,
      dueDate: inv.due_date,
      createdAt: inv.created_at,
    }));

    return sendPaginated(res, invoices, page, pageSize, total, 'Invoices retrieved successfully');
  } catch (error) {
    console.error('Get all invoices error:', error);
    return sendError(res, 500, error.message, 'GET_INVOICES_ERROR');
  } finally {
    client.release();
  }
}

/**
 * Get invoice by ID
 * GET /api/invoices/:id
 */
async function getInvoiceById(req, res) {
  const client = await pool.connect();

  try {
    const { id } = req.params;

    const result = await client.query(
      `SELECT invoices.id, invoices.school_id, invoices.student_id, invoices.invoice_number,
              invoices.description, invoices.amount, invoices.amount_paid, invoices.status,
              invoices.due_date, invoices.issued_date, invoices.notes, invoices.created_at, invoices.updated_at,
              students.first_name, students.last_name, students.email, students.phone
       FROM invoices
       JOIN students ON invoices.student_id = students.id
       WHERE invoices.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return sendNotFound(res, 'Invoice not found', 'INVOICE_NOT_FOUND');
    }

    const invoice = result.rows[0];

    // Get payment history
    const paymentsResult = await client.query(
      `SELECT id, amount, payment_method, payment_date, status
       FROM payments
       WHERE invoice_id = $1
       ORDER BY payment_date DESC`,
      [id]
    );

    const payments = paymentsResult.rows.map(p => ({
      id: p.id,
      amount: parseFloat(p.amount),
      paymentMethod: p.payment_method,
      paymentDate: p.payment_date,
      status: p.status,
    }));

    return sendSuccess(res, 200, {
      id: invoice.id,
      schoolId: invoice.school_id,
      invoiceNumber: invoice.invoice_number,
      studentId: invoice.student_id,
      studentName: `${invoice.first_name} ${invoice.last_name}`,
      studentEmail: invoice.email,
      studentPhone: invoice.phone,
      description: invoice.description,
      amount: parseFloat(invoice.amount),
      amountPaid: parseFloat(invoice.amount_paid),
      outstandingAmount: parseFloat(invoice.amount) - parseFloat(invoice.amount_paid),
      status: invoice.status,
      dueDate: invoice.due_date,
      issuedDate: invoice.issued_date,
      notes: invoice.notes,
      payments,
      createdAt: invoice.created_at,
      updatedAt: invoice.updated_at,
    }, 'Invoice retrieved successfully');
  } catch (error) {
    console.error('Get invoice error:', error);
    return sendError(res, 500, error.message, 'GET_INVOICE_ERROR');
  } finally {
    client.release();
  }
}

/**
 * Update invoice
 * PUT /api/invoices/:id
 */
async function updateInvoice(req, res) {
  const client = await pool.connect();

  try {
    const { id } = req.params;
    const { description, amount, dueDate, notes, status } = req.body;

    // Check if invoice exists
    const checkResult = await client.query(
      'SELECT id FROM invoices WHERE id = $1',
      [id]
    );

    if (checkResult.rows.length === 0) {
      return sendNotFound(res, 'Invoice not found', 'INVOICE_NOT_FOUND');
    }

    const updateFields = [];
    const updateValues = [];
    let paramCount = 1;

    if (description !== undefined) {
      updateFields.push(`description = $${paramCount}`);
      updateValues.push(description);
      paramCount++;
    }
    if (amount !== undefined) {
      updateFields.push(`amount = $${paramCount}`);
      updateValues.push(amount);
      paramCount++;
    }
    if (dueDate !== undefined) {
      updateFields.push(`due_date = $${paramCount}`);
      updateValues.push(dueDate);
      paramCount++;
    }
    if (notes !== undefined) {
      updateFields.push(`notes = $${paramCount}`);
      updateValues.push(notes);
      paramCount++;
    }
    if (status !== undefined) {
      updateFields.push(`status = $${paramCount}`);
      updateValues.push(status);
      paramCount++;
    }

    if (updateFields.length === 0) {
      return sendError(res, 400, 'No fields to update', 'NO_FIELDS_TO_UPDATE');
    }

    updateFields.push(`updated_at = $${paramCount}`);
    updateValues.push(new Date());
    updateValues.push(id);

    const result = await client.query(
      `UPDATE invoices SET ${updateFields.join(', ')} WHERE id = $${paramCount + 1} RETURNING *`,
      updateValues
    );

    const invoice = result.rows[0];

    return sendSuccess(res, 200, {
      id: invoice.id,
      invoiceNumber: invoice.invoice_number,
      amount: parseFloat(invoice.amount),
      status: invoice.status,
      updatedAt: invoice.updated_at,
    }, 'Invoice updated successfully');
  } catch (error) {
    console.error('Update invoice error:', error);
    return sendError(res, 500, error.message, 'UPDATE_INVOICE_ERROR');
  } finally {
    client.release();
  }
}

/**
 * Record a payment
 * POST /api/invoices/:id/payment
 */
async function recordPayment(req, res) {
  const client = await pool.connect();

  try {
    const { id } = req.params;
    const { amount, paymentMethod, transactionId, notes } = req.body;

    // Check if invoice exists
    const invoiceCheck = await client.query(
      'SELECT id, amount, amount_paid FROM invoices WHERE id = $1',
      [id]
    );

    if (invoiceCheck.rows.length === 0) {
      return sendNotFound(res, 'Invoice not found', 'INVOICE_NOT_FOUND');
    }

    const invoice = invoiceCheck.rows[0];
    const newAmountPaid = parseFloat(invoice.amount_paid) + amount;

    // Validate payment doesn't exceed invoice amount
    if (newAmountPaid > parseFloat(invoice.amount)) {
      return sendError(res, 400, 'Payment amount exceeds invoice total', 'PAYMENT_EXCEEDS_TOTAL');
    }

    // Create payment record
    const paymentId = uuidv4();
    const now = new Date();

    const paymentResult = await client.query(
      `INSERT INTO payments (id, school_id, invoice_id, amount, payment_method, transaction_id, payment_date, status, notes, created_at)
       VALUES ($1, (SELECT school_id FROM invoices WHERE id = $2), $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING id, amount, payment_method, payment_date, status`,
      [paymentId, id, amount, paymentMethod, transactionId || null, now, 'completed', notes || null, now]
    );

    const payment = paymentResult.rows[0];

    // Update invoice amount_paid and status
    let newStatus = 'partial';
    if (newAmountPaid === parseFloat(invoice.amount)) {
      newStatus = 'paid';
    }

    await client.query(
      'UPDATE invoices SET amount_paid = $1, status = $2, updated_at = $3 WHERE id = $4',
      [newAmountPaid, newStatus, now, id]
    );

    return sendCreated(res, {
      paymentId: payment.id,
      amount: parseFloat(payment.amount),
      paymentMethod: payment.payment_method,
      paymentDate: payment.payment_date,
      status: payment.status,
      invoiceStatus: newStatus,
      createdAt: payment.created_at,
    }, 'Payment recorded successfully');
  } catch (error) {
    console.error('Record payment error:', error);
    return sendError(res, 500, error.message, 'RECORD_PAYMENT_ERROR');
  } finally {
    client.release();
  }
}

/**
 * Get financial report
 * GET /api/invoices/reports/summary
 */
async function getFinancialReport(req, res) {
  const client = await pool.connect();

  try {
    const schoolId = req.query.schoolId;
    const startDate = req.query.startDate;
    const endDate = req.query.endDate;

    // Verify school exists
    const schoolCheck = await client.query(
      'SELECT id FROM schools WHERE id = $1',
      [schoolId]
    );

    if (schoolCheck.rows.length === 0) {
      return sendNotFound(res, 'School not found', 'SCHOOL_NOT_FOUND');
    }

    let reportQuery = `SELECT
                        COUNT(DISTINCT invoices.id) as total_invoices,
                        SUM(invoices.amount) as total_amount,
                        SUM(invoices.amount_paid) as total_paid,
                        SUM(invoices.amount - invoices.amount_paid) as total_outstanding,
                        COUNT(CASE WHEN invoices.status = 'paid' THEN 1 END) as paid_invoices,
                        COUNT(CASE WHEN invoices.status = 'partial' THEN 1 END) as partial_invoices,
                        COUNT(CASE WHEN invoices.status = 'draft' THEN 1 END) as draft_invoices,
                        COUNT(CASE WHEN invoices.status = 'overdue' THEN 1 END) as overdue_invoices
                       FROM invoices
                       WHERE invoices.school_id = $1`;
    let reportParams = [schoolId];

    if (startDate) {
      reportQuery += ' AND invoices.created_at >= $' + (reportParams.length + 1);
      reportParams.push(startDate);
    }

    if (endDate) {
      reportQuery += ' AND invoices.created_at <= $' + (reportParams.length + 1);
      reportParams.push(endDate);
    }

    const reportResult = await client.query(reportQuery, reportParams);
    const report = reportResult.rows[0];

    // Get status breakdown
    let breakdownQuery = `SELECT status, COUNT(*) as count, SUM(amount) as total
                          FROM invoices
                          WHERE school_id = $1`;
    let breakdownParams = [schoolId];

    if (startDate) {
      breakdownQuery += ' AND created_at >= $' + (breakdownParams.length + 1);
      breakdownParams.push(startDate);
    }

    if (endDate) {
      breakdownQuery += ' AND created_at <= $' + (breakdownParams.length + 1);
      breakdownParams.push(endDate);
    }

    breakdownQuery += ' GROUP BY status';

    const breakdownResult = await client.query(breakdownQuery, breakdownParams);

    const breakdown = breakdownResult.rows.map(row => ({
      status: row.status,
      count: parseInt(row.count),
      total: parseFloat(row.total),
    }));

    return sendSuccess(res, 200, {
      summary: {
        totalInvoices: parseInt(report.total_invoices),
        totalAmount: parseFloat(report.total_amount),
        totalPaid: parseFloat(report.total_paid),
        totalOutstanding: parseFloat(report.total_outstanding),
        paidInvoices: parseInt(report.paid_invoices),
        partialInvoices: parseInt(report.partial_invoices),
        draftInvoices: parseInt(report.draft_invoices),
        overdueInvoices: parseInt(report.overdue_invoices),
        collectionRate: report.total_amount > 0
          ? ((parseFloat(report.total_paid) / parseFloat(report.total_amount)) * 100).toFixed(2) + '%'
          : '0%',
      },
      breakdown,
      period: {
        startDate,
        endDate,
      },
    }, 'Financial report generated successfully');
  } catch (error) {
    console.error('Get financial report error:', error);
    return sendError(res, 500, error.message, 'GET_REPORT_ERROR');
  } finally {
    client.release();
  }
}

module.exports = {
  createInvoice,
  getAllInvoices,
  getInvoiceById,
  updateInvoice,
  recordPayment,
  getFinancialReport,
};
