import React from 'react';
import { Calendar, Users, BookOpen, Layers, LayoutDashboard, Settings } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'timetable', label: 'Timetable', icon: Calendar },
    { id: 'instructors', label: 'Instructors', icon: Users },
    { id: 'subjects', label: 'Subjects', icon: BookOpen },
    { id: 'resources', label: 'Rooms & Groups', icon: Layers },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex-shrink-0 hidden md:flex flex-col">
        <div className="p-6 border-b border-slate-700">
          <h1 className="text-2xl font-bold tracking-tight text-blue-400">Cronos</h1>
          <p className="text-xs text-slate-400 mt-1">Algorithmic Scheduler</p>
        </div>
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === item.id
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <item.icon size={20} />
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-slate-700 text-xs text-slate-500 text-center">
          v1.0.0 &copy; 2024
        </div>
      </aside>

      {/* Mobile Header (Visible only on small screens) */}
      <div className="md:hidden absolute top-0 left-0 right-0 bg-slate-900 text-white p-4 flex justify-between items-center z-50">
        <span className="font-bold text-blue-400">Cronos</span>
        <button className="text-white">Menu</button>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8 pt-16 md:pt-8">
        <div className="max-w-7xl mx-auto h-full">
            {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;