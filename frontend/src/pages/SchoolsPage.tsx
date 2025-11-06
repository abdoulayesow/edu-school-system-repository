import React, { useState, useEffect } from 'react';
import MainLayout from '../components/MainLayout';
import { schoolAPI } from '../services/api';

interface School {
  id: string;
  name: string;
  location?: string;
  registrationNumber?: string;
  numberOfStudents?: number;
  numberOfTeachers?: number;
  numberOfClasses?: number;
}

const SchoolsPage: React.FC = () => {
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSchools();
  }, []);

  const fetchSchools = async () => {
    try {
      setLoading(true);
      const response = await schoolAPI.list(1, 20);
      setSchools(response.data.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch schools');
    } finally {
      setLoading(false);
    }
  };

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

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading schools...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {schools.length > 0 ? (
              schools.map((school) => (
                <div key={school.id} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{school.name}</h3>
                      <p className="text-sm text-gray-600">Location: {school.location || 'N/A'}</p>
                    </div>
                    <button className="text-gray-400 hover:text-gray-600">⋮</button>
                  </div>

                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Students</span>
                      <span className="font-semibold text-gray-900">{school.numberOfStudents || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Teachers</span>
                      <span className="font-semibold text-gray-900">{school.numberOfTeachers || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Classes</span>
                      <span className="font-semibold text-gray-900">{school.numberOfClasses || 0}</span>
                    </div>
                  </div>

                  <button className="w-full mt-4 px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors">
                    View Details
                  </button>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center text-gray-600 py-12">
                No schools found
              </div>
            )}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default SchoolsPage;
