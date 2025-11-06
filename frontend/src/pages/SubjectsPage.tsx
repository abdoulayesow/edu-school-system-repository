import React, { useState, useEffect } from 'react';
import MainLayout from '../components/MainLayout';
import { subjectAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

interface Subject {
  id: string;
  name: string;
  code?: string;
  description?: string;
  numberOfClasses?: number;
  numberOfStudents?: number;
}

const SubjectsPage: React.FC = () => {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user?.schoolId) {
      fetchSubjects();
    }
  }, [user?.schoolId]);

  const fetchSubjects = async () => {
    try {
      setLoading(true);
      if (!user?.schoolId) {
        setError('School ID not available');
        return;
      }
      const response = await subjectAPI.list(user.schoolId, 1);
      setSubjects(response.data.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch subjects');
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div>
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Subjects</h1>
          <p className="text-gray-600 mt-2">Manage curriculum subjects and courses</p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading subjects...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {subjects.length > 0 ? (
              subjects.map((subject) => (
                <div key={subject.id} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
                  <div className="text-3xl mb-2">📖</div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{subject.name}</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    {subject.numberOfClasses || 0} Classes • {subject.numberOfStudents || 0} Students
                  </p>
                  <button className="w-full px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded transition-colors">
                    View Details
                  </button>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center text-gray-600 py-12">
                No subjects found
              </div>
            )}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default SubjectsPage;
