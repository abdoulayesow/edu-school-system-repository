import React, { useState, useEffect } from 'react';
import MainLayout from '../components/MainLayout';
import { gradeAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

interface Grade {
  id: string;
  studentId: string;
  studentName?: string;
  subjectId: string;
  subjectName?: string;
  score: number;
  grade: string;
  status?: string;
}

const GradesPage: React.FC = () => {
  const { user } = useAuth();
  const [grades, setGrades] = useState<Grade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredGrades, setFilteredGrades] = useState<Grade[]>([]);

  useEffect(() => {
    if (user?.id) {
      fetchGrades();
    }
  }, [user?.id]);

  useEffect(() => {
    const filtered = grades.filter(
      (grade) =>
        (grade.studentName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (grade.subjectName?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    );
    setFilteredGrades(filtered);
  }, [grades, searchTerm]);

  const fetchGrades = async () => {
    try {
      setLoading(true);
      if (!user?.id) {
        setError('User ID not available');
        return;
      }
      const response = await gradeAPI.getByStudent(user.id, '2024-2025');
      setGrades(response.data.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch grades');
    } finally {
      setLoading(false);
    }
  };

  const getGradeColor = (grade: string) => {
    const gradeMap: { [key: string]: string } = {
      A: 'bg-green-100 text-green-800',
      B: 'bg-blue-100 text-blue-800',
      C: 'bg-yellow-100 text-yellow-800',
      D: 'bg-orange-100 text-orange-800',
      F: 'bg-red-100 text-red-800',
    };
    return gradeMap[grade] || 'bg-gray-100 text-gray-800';
  };

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
              placeholder="Search by student name or subject..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-64"
            />
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-600">Loading grades...</p>
            </div>
          ) : error ? (
            <div className="p-6">
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            </div>
          ) : (
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
                  {filteredGrades.length > 0 ? (
                    filteredGrades.map((gradeItem) => (
                      <tr key={gradeItem.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm text-gray-900">{gradeItem.studentName || 'N/A'}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{gradeItem.subjectName || 'N/A'}</td>
                        <td className="px-6 py-4 text-sm text-gray-900 font-semibold">{gradeItem.score}%</td>
                        <td className="px-6 py-4 text-sm">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getGradeColor(gradeItem.grade)}`}>
                            {gradeItem.grade}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span className={gradeItem.score >= 50 ? 'text-green-600' : 'text-red-600'}>
                            {gradeItem.score >= 50 ? 'Passed' : 'Failed'}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-4 text-center text-gray-600">
                        {grades.length === 0 ? 'No grades found' : 'No matching grades'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default GradesPage;
