import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../components/MainLayout';
import { schoolAPI, studentAPI, classAPI, userAPI } from '../services/api';

interface DashboardStats {
  schools: number;
  students: number;
  classes: number;
  teachers: number;
}

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({ schools: 0, students: 0, classes: 0, teachers: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.schoolId) {
      fetchDashboardStats();
    }
  }, [user?.schoolId]);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      if (!user?.schoolId) {
        return;
      }

      const [schoolsRes, studentsRes, classesRes, usersRes] = await Promise.all([
        schoolAPI.list(1, 100),
        studentAPI.list(user.schoolId, 1),
        classAPI.list(user.schoolId, 1),
        userAPI.list(user.schoolId, 1),
      ]);

      const teachers = usersRes.data.data?.filter((u: any) => u.role === 'teacher' || u.role === 'Teacher').length || 0;

      setStats({
        schools: schoolsRes.data.data?.length || 0,
        students: studentsRes.data.data?.length || 0,
        classes: classesRes.data.data?.length || 0,
        teachers: teachers,
      });
    } catch (error) {
      // Silently fail and show 0 values
      console.error('Failed to fetch dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      {/* Welcome Section */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome, {user?.name || user?.email}!
        </h2>
        <p className="text-gray-600">
          Role: <span className="font-semibold capitalize">{user?.role}</span>
        </p>
      </div>

      {/* Dashboard Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Dashboard Cards - MVP Features */}
        <DashboardCard
          title="Schools"
          description="Manage school information"
          icon="🏫"
          path="/schools"
        />
        <DashboardCard
          title="Students"
          description="View and manage student records"
          icon="👨‍🎓"
          path="/students"
        />
        <DashboardCard
          title="Classes"
          description="Manage class information"
          icon="📚"
          path="/classes"
        />
        <DashboardCard
          title="Subjects"
          description="Manage curriculum subjects"
          icon="📖"
          path="/subjects"
        />
        <DashboardCard
          title="Grades"
          description="Track student grades and progress"
          icon="📊"
          path="/grades"
        />
        <DashboardCard
          title="Financials"
          description="View financial reports"
          icon="💰"
          path="/financials"
        />
      </div>

      {/* Quick Stats */}
      <div className="mt-12 bg-white rounded-lg shadow p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Quick Stats</h3>
        {loading ? (
          <p className="text-gray-600">Loading stats...</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatBox label="Schools" value={stats.schools.toString()} />
            <StatBox label="Students" value={stats.students.toString()} />
            <StatBox label="Classes" value={stats.classes.toString()} />
            <StatBox label="Teachers" value={stats.teachers.toString()} />
          </div>
        )}
      </div>
    </MainLayout>
  );
};

interface DashboardCardProps {
  title: string;
  description: string;
  icon: string;
  path: string;
}

const DashboardCard: React.FC<DashboardCardProps> = ({ title, description, icon, path }) => {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(path)}
      className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer block w-full text-left"
    >
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 text-sm">{description}</p>
      <div className="mt-4 text-blue-600 text-sm font-medium">View Details →</div>
    </button>
  );
};

interface StatBoxProps {
  label: string;
  value: string;
}

const StatBox: React.FC<StatBoxProps> = ({ label, value }) => {
  return (
    <div className="p-4 bg-blue-50 rounded-lg">
      <p className="text-gray-600 text-sm">{label}</p>
      <p className="text-2xl font-bold text-blue-600">{value}</p>
    </div>
  );
};

export default DashboardPage;
