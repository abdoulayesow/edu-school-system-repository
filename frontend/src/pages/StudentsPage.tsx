import React, { useState, useEffect } from 'react';
import MainLayout from '../components/MainLayout';
import Modal from '../components/Modal';
import StudentForm from '../components/StudentForm';
import Toast from '../components/Toast';
import type { ToastType } from '../components/Toast';
import { studentAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

interface Student {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  registrationNumber: string;
}

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

const StudentsPage: React.FC = () => {
  const { user } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    if (user?.schoolId) {
      fetchStudents();
    }
  }, [user?.schoolId]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      if (!user?.schoolId) {
        setError('School ID not available');
        return;
      }
      const response = await studentAPI.list(user.schoolId, 1);
      setStudents(response.data.data || []);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch students');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message: string, type: ToastType) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const handleCreateClick = () => {
    setEditingStudent(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (student: Student) => {
    setEditingStudent(student);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (studentId: string) => {
    setDeleteConfirmId(studentId);
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirmId || !user?.schoolId) return;

    try {
      setIsSubmitting(true);
      await studentAPI.delete(deleteConfirmId);
      setStudents((prev) => prev.filter((s) => s.id !== deleteConfirmId));
      showToast('Student deleted successfully', 'success');
      setDeleteConfirmId(null);
    } catch (err: any) {
      showToast(
        err.response?.data?.message || 'Failed to delete student',
        'error'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFormSubmit = async (formData: {
    name: string;
    email: string;
    phoneNumber: string;
    registrationNumber: string;
  }) => {
    if (!user?.schoolId) return;

    try {
      setIsSubmitting(true);

      if (editingStudent) {
        // Update existing student
        await studentAPI.update(editingStudent.id, formData);
        setStudents((prev) =>
          prev.map((s) =>
            s.id === editingStudent.id
              ? { ...s, ...formData }
              : s
          )
        );
        showToast('Student updated successfully', 'success');
      } else {
        // Create new student
        const response = await studentAPI.create({
          ...formData,
          schoolId: user.schoolId,
        });
        setStudents((prev) => [...prev, response.data.data]);
        showToast('Student added successfully', 'success');
      }

      setIsModalOpen(false);
      setEditingStudent(null);
    } catch (err: any) {
      showToast(
        err.response?.data?.message || 'Failed to save student',
        'error'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingStudent(null);
  };

  return (
    <MainLayout>
      <div>
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Students</h1>
            <p className="text-gray-600 mt-2">Manage student records and information</p>
          </div>
          <button
            onClick={handleCreateClick}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Add Student
          </button>
        </div>

        <div className="bg-white rounded-lg shadow">
          {loading ? (
            <div className="p-6 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-600">Loading students...</p>
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
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Name</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Email</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Registration #</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Phone</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {students.length > 0 ? (
                    students.map((student) => (
                      <tr key={student.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm text-gray-900">{student.name}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{student.email}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{student.registrationNumber}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{student.phoneNumber}</td>
                        <td className="px-6 py-4 text-sm space-x-3">
                          <button
                            onClick={() => handleEditClick(student)}
                            className="text-blue-600 hover:text-blue-900 font-medium"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteClick(student.id)}
                            className="text-red-600 hover:text-red-900 font-medium"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-4 text-center text-gray-600">
                        No students found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        title={editingStudent ? 'Edit Student' : 'Add New Student'}
        onClose={handleCloseModal}
        size="md"
      >
        <StudentForm
          initialData={editingStudent || undefined}
          onSubmit={handleFormSubmit}
          isLoading={isSubmitting}
          onCancel={handleCloseModal}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={() => setDeleteConfirmId(null)}
          />
          <div className="relative bg-white rounded-lg shadow-lg max-w-sm w-full mx-4">
            <div className="px-6 py-4">
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                Delete Student
              </h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this student? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleConfirmDelete}
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 transition-colors"
                >
                  {isSubmitting ? 'Deleting...' : 'Delete'}
                </button>
                <button
                  onClick={() => setDeleteConfirmId(null)}
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notifications */}
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </MainLayout>
  );
};

export default StudentsPage;
