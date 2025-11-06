import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const DashboardPage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-blue-600">Friasoft</h1>
            <span className="ml-4 text-gray-600">School Management System</span>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-gray-700">{user?.name || user?.email}</span>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
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
            path="#"
          />
          <DashboardCard
            title="Students"
            description="View and manage student records"
            icon="👨‍🎓"
            path="#"
          />
          <DashboardCard
            title="Classes"
            description="Manage class information"
            icon="📚"
            path="#"
          />
          <DashboardCard
            title="Subjects"
            description="Manage curriculum subjects"
            icon="📖"
            path="#"
          />
          <DashboardCard
            title="Grades"
            description="Track student grades and progress"
            icon="📊"
            path="#"
          />
          <DashboardCard
            title="Financials"
            description="View financial reports"
            icon="💰"
            path="#"
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
      </div>
    </div>
  );
};

interface DashboardCardProps {
  title: string;
  description: string;
  icon: string;
  path: string;
}

const DashboardCard: React.FC<DashboardCardProps> = ({ title, description, icon, path }) => {
  return (
    <a
      href={path}
      className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer block"
    >
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 text-sm">{description}</p>
      <div className="mt-4 text-blue-600 text-sm font-medium">View Details →</div>
    </a>
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
