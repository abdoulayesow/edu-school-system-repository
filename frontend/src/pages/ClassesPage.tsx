import React from 'react';
import MainLayout from '../components/MainLayout';

const ClassesPage: React.FC = () => {
  return (
    <MainLayout>
      <div>
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Classes</h1>
          <p className="text-gray-600 mt-2">Manage class information and assignments</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white rounded-lg shadow p-6">
              <div className="text-3xl mb-2">📚</div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Class {String.fromCharCode(64 + i)}</h3>
              <p className="text-gray-600 text-sm mb-4">Grade: {8 + Math.floor(i / 2)}</p>
              <div className="flex justify-between">
                <span className="text-sm text-blue-600">25 Students</span>
                <button className="text-blue-600 hover:text-blue-900">View</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </MainLayout>
  );
};

export default ClassesPage;
