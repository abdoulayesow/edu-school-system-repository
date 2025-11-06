import React, { useState, useEffect } from 'react';
import MainLayout from '../components/MainLayout';
import { invoiceAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

interface Invoice {
  id: string;
  studentId?: string;
  studentName?: string;
  amount: number;
  status: string;
  dueDate?: string;
  createdAt?: string;
}

interface FinancialReport {
  totalRevenue?: number;
  outstandingFees?: number;
  paidFees?: number;
  totalExpenses?: number;
  paymentRate?: number;
}

const FinancialsPage: React.FC = () => {
  const { user } = useAuth();
  const [report, setReport] = useState<FinancialReport>({});
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user?.schoolId) {
      fetchFinancialData();
    }
  }, [user?.schoolId]);

  const fetchFinancialData = async () => {
    try {
      setLoading(true);
      if (!user?.schoolId) {
        setError('School ID not available');
        return;
      }

      const [reportRes, invoicesRes] = await Promise.all([
        invoiceAPI.getReport(user.schoolId),
        invoiceAPI.list(user.schoolId, 1),
      ]);

      setReport(reportRes.data.data || {});
      setInvoices(invoicesRes.data.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch financial data');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(amount || 0);
  };

  return (
    <MainLayout>
      <div>
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Financials</h1>
          <p className="text-gray-600 mt-2">View financial reports and payment information</p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading financial data...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-gray-600 text-sm">Total Revenue</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {formatCurrency(report.totalRevenue || 0)}
                </p>
                <p className="text-green-600 text-sm mt-2">From all students</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-gray-600 text-sm">Outstanding Fees</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {formatCurrency(report.outstandingFees || 0)}
                </p>
                <p className="text-red-600 text-sm mt-2">Pending payment</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-gray-600 text-sm">Paid Fees</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {formatCurrency(report.paidFees || 0)}
                </p>
                <p className="text-green-600 text-sm mt-2">{Math.round(report.paymentRate || 0)}% collected</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <p className="text-gray-600 text-sm">Total Expenses</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {formatCurrency(report.totalExpenses || 0)}
                </p>
                <p className="text-blue-600 text-sm mt-2">School operations</p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b">
                <h3 className="text-lg font-bold text-gray-900">Recent Invoices</h3>
              </div>
              <div className="divide-y">
                {invoices.length > 0 ? (
                  invoices.map((invoice) => (
                    <div key={invoice.id} className="px-6 py-4 flex justify-between items-center hover:bg-gray-50">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{invoice.studentName || 'N/A'}</p>
                        <p className="text-xs text-gray-600">{new Date(invoice.createdAt || '').toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">{formatCurrency(invoice.amount)}</p>
                        <p className={`text-xs ${invoice.status?.toLowerCase() === 'paid' ? 'text-green-600' : 'text-orange-600'}`}>
                          {invoice.status || 'Pending'}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="px-6 py-4 text-center text-gray-600">
                    No invoices found
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </MainLayout>
  );
};

export default FinancialsPage;
