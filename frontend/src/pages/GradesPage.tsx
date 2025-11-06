import React from 'react';
import MainLayout from '../components/MainLayout';

const GradesPage: React.FC = () => {
  return (
    <MainLayout>
      <div>
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Grades</h1>
          <p className="text-gray-600 mt-2">Track student grades and academic progress</p>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b">
            <input
              type="text"
              placeholder="Search by student name..."
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-64"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Student Name</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Subject</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Score</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Grade</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {[1, 2, 3, 4, 5].map((i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">Student {i}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">Mathematics</td>
                    <td className="px-6 py-4 text-sm text-gray-900 font-semibold">
                      {75 + i * 2}%
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                        A
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className="text-green-600">Passed</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default GradesPage;
