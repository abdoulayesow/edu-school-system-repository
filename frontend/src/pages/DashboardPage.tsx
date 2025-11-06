import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../components/MainLayout';

const DashboardPage: React.FC = () => {
  const { user } = useAuth();

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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatBox label="Schools" value="5" />
          <StatBox label="Students" value="250" />
          <StatBox label="Classes" value="15" />
          <StatBox label="Teachers" value="30" />
        </div>
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
