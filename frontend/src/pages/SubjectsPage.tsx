import React from 'react';
import MainLayout from '../components/MainLayout';

const SubjectsPage: React.FC = () => {
  const subjects = ['Mathematics', 'English Language', 'Physics', 'Chemistry', 'Biology', 'History', 'Geography', 'Computer Science'];

  return (
    <MainLayout>
      <div>
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Subjects</h1>
          <p className="text-gray-600 mt-2">Manage curriculum subjects and courses</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subjects.map((subject, i) => (
            <div key={i} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
              <div className="text-3xl mb-2">📖</div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">{subject}</h3>
              <p className="text-gray-600 text-sm mb-4">3 Classes • 45 Students</p>
              <button className="w-full px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded transition-colors">
                View Details
              </button>
            </div>
          ))}
        </div>
      </div>
    </MainLayout>
  );
};

export default SubjectsPage;
