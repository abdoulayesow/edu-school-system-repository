import React from 'react';
import MainLayout from '../components/MainLayout';

const SchoolsPage: React.FC = () => {
  return (
    <MainLayout>
      <div>
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Schools</h1>
            <p className="text-gray-600 mt-2">Manage school information and settings</p>
          </div>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Add School
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">School {i}</h3>
                  <p className="text-sm text-gray-600">Location: Lagos, Nigeria</p>
                </div>
                <button className="text-gray-400 hover:text-gray-600">⋮</button>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Students</span>
                  <span className="font-semibold text-gray-900">{250 + i * 15}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Teachers</span>
                  <span className="font-semibold text-gray-900">{30 + i * 3}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Classes</span>
                  <span className="font-semibold text-gray-900">{15 + i * 2}</span>
                </div>
              </div>

              <button className="w-full mt-4 px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors">
                View Details
              </button>
            </div>
          ))}
        </div>
      </div>
    </MainLayout>
  );
};

export default SchoolsPage;
