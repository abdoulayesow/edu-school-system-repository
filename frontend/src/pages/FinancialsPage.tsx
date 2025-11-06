import React from 'react';
import MainLayout from '../components/MainLayout';

const FinancialsPage: React.FC = () => {
  return (
    <MainLayout>
      <div>
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Financials</h1>
          <p className="text-gray-600 mt-2">View financial reports and payment information</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm">Total Revenue</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">N2,500,000</p>
            <p className="text-green-600 text-sm mt-2">+12% from last month</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm">Outstanding Fees</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">N450,000</p>
            <p className="text-red-600 text-sm mt-2">42 students pending</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm">Paid Fees</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">N2,050,000</p>
            <p className="text-green-600 text-sm mt-2">82% payment rate</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 text-sm">Total Expenses</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">N1,200,000</p>
            <p className="text-blue-600 text-sm mt-2">48% of revenue</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b">
            <h3 className="text-lg font-bold text-gray-900">Recent Transactions</h3>
          </div>
          <div className="divide-y">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="px-6 py-4 flex justify-between items-center hover:bg-gray-50">
                <div>
                  <p className="text-sm font-medium text-gray-900">School Fee - Class {String.fromCharCode(64 + i)}</p>
                  <p className="text-xs text-gray-600">2024-11-0{i}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">N50,000</p>
                  <p className="text-xs text-green-600">Paid</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default FinancialsPage;
