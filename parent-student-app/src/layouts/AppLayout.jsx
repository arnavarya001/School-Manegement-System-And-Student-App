import { Outlet, Link, useLocation } from 'react-router-dom';
import { Home, IndianRupee, Calendar, Bell, User, LayoutGrid } from 'lucide-react';

const AppLayout = ({ user, activeStudent, onLogout }) => {
  const location = useLocation();

  const navItems = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Fees', href: '/fees', icon: IndianRupee },
    { name: 'Attendance', href: '/attendance', icon: Calendar },
    { name: 'Notices', href: '/announcements', icon: Bell },
    { name: 'Profile', href: '/profile', icon: User },
  ];

  return (
    <div className="min-h-screen pb-20 md:pb-0 md:pl-20">
      {/* Top Header */}
      <header className="bg-white border-b px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div>
          <h1 className="text-xl font-bold text-gray-900">St. Michel School</h1>
        </div>
        <div className="flex items-center space-x-3">
          <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold">
            {activeStudent ? activeStudent.firstName[0] : (user?.user?.name ? user.user.name[0] : 'U')}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6 max-w-4xl mx-auto">
        <Outlet />
      </main>

      {/* Bottom Navigation (Mobile) */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t flex items-center justify-around py-3 px-2 md:hidden z-20">
        {navItems.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={`flex flex-col items-center space-y-1 transition-colors ${
                isActive ? 'text-primary' : 'text-gray-400'
              }`}
            >
              <item.icon className={`h-6 w-6 ${isActive ? 'fill-primary/10' : ''}`} />
              <span className="text-[10px] font-bold uppercase tracking-wider">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Side Navigation (Desktop) */}
      <nav className="hidden md:flex fixed left-0 top-0 bottom-0 w-20 bg-white border-r flex-col items-center py-8 space-y-8 z-20">
        <div className="h-12 w-12 bg-primary rounded-2xl flex items-center justify-center text-white font-bold mb-4">
          SM
        </div>
        {navItems.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={`p-3 rounded-2xl transition-all ${
                isActive ? 'bg-primary text-white shadow-lg shadow-blue-900/20' : 'text-gray-400 hover:bg-gray-100'
              }`}
            >
              <item.icon className="h-6 w-6" />
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default AppLayout;
