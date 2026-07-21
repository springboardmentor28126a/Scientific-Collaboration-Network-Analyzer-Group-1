import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  if (!user) {
    navigate('/login');
    return null;
  }

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-indigo-900 text-white shadow-xl flex flex-col">
        <div className="p-6">
          <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">ResearchHub</h2>
        </div>
        <nav className="flex-1 px-4 space-y-2 mt-4">
          <a href="#" className="flex items-center px-4 py-3 bg-white/10 rounded-lg text-white font-medium transition-colors">
            Dashboard
          </a>
          <a href="#" className="flex items-center px-4 py-3 hover:bg-white/5 rounded-lg text-gray-300 hover:text-white transition-colors">
            My Profile
          </a>
          <a href="#" className="flex items-center px-4 py-3 hover:bg-white/5 rounded-lg text-gray-300 hover:text-white transition-colors">
            Publications
          </a>
          <a href="#" className="flex items-center px-4 py-3 hover:bg-white/5 rounded-lg text-gray-300 hover:text-white transition-colors">
            Conferences
          </a>
        </nav>
        <div className="p-4 border-t border-white/10">
          <button 
            onClick={handleLogout}
            className="w-full py-2 px-4 bg-red-500/20 text-red-300 rounded hover:bg-red-500/30 transition-colors"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Welcome back, {user.full_name}</h1>
          <div className="flex items-center gap-4">
            <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold capitalize">
              {user.role.replace('_', ' ')}
            </span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-shadow">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Publications</p>
              <h3 className="text-2xl font-bold text-gray-900">0</h3>
            </div>
            <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center text-xl">📄</div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-shadow">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Conferences</p>
              <h3 className="text-2xl font-bold text-gray-900">0</h3>
            </div>
            <div className="w-12 h-12 bg-purple-50 text-purple-500 rounded-full flex items-center justify-center text-xl">🎤</div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-shadow">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">H-Index</p>
              <h3 className="text-2xl font-bold text-gray-900">0</h3>
            </div>
            <div className="w-12 h-12 bg-pink-50 text-pink-500 rounded-full flex items-center justify-center text-xl">📈</div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-800">Recent Activity</h2>
          </div>
          <div className="p-6">
            <p className="text-gray-500 text-center py-8">No recent activity to display.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
