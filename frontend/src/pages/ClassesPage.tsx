import React, { useState, useEffect } from 'react';
import MainLayout from '../components/MainLayout';
import { classAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

interface Class {
  id: string;
  name: string;
  grade: string;
  classTeacher?: string;
  numberOfStudents?: number;
}

const ClassesPage: React.FC = () => {
  const { user } = useAuth();
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user?.schoolId) {
      fetchClasses();
    }
  }, [user?.schoolId]);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      if (!user?.schoolId) {
        setError('School ID not available');
        return;
      }
      const response = await classAPI.list(user.schoolId, 1);
      setClasses(response.data.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch classes');
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div>
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Classes</h1>
          <p className="text-gray-600 mt-2">Manage class information and assignments</p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading classes...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {classes.length > 0 ? (
              classes.map((classItem) => (
                <div key={classItem.id} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
                  <div className="text-3xl mb-2">📚</div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{classItem.name}</h3>
                  <p className="text-gray-600 text-sm mb-4">Grade: {classItem.grade}</p>
                  <div className="flex justify-between">
                    <span className="text-sm text-blue-600">{classItem.numberOfStudents || 0} Students</span>
                    <button className="text-blue-600 hover:text-blue-900">View</button>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center text-gray-600 py-12">
                No classes found
              </div>
            )}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default ClassesPage;
