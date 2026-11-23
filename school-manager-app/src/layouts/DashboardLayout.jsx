import { Outlet, Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  UserPlus,
  IndianRupee,
  Receipt,
  FileText,
  PlusCircle,
  Package,
  ShoppingBag,
  Tag,
  Truck,
  GraduationCap,
  CalendarCheck,
  TrendingDown,
  Wallet,
  BarChart4,
  Megaphone,
  History,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  Home,
  Zap
} from 'lucide-react';
import { useState } from 'react';

const DashboardLayout = ({ user, onLogout }) => {
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const navigationGroups = [
    {
      group: 'OVERVIEW',
      items: [
        { name: 'Dashboard', href: '/', icon: LayoutDashboard }
      ]
    },
    {
      group: 'STUDENTS & ACADEMICS',
      items: [
        { name: 'Students', href: '/students', icon: Users },
        { name: 'Admissions', href: '/admission', icon: UserPlus },
        { name: 'Attendance', href: '/attendance', icon: CalendarCheck },
        { name: 'Teachers & Staff', href: '/staff', icon: GraduationCap }
      ]
    },
    {
      group: 'FEES & INVOICING',
      items: [
        { name: 'Fee Management', href: '/fees', icon: IndianRupee },
        { name: 'Fee Receipts', href: '/receipts', icon: Receipt },
        { name: 'Bill Generator', href: '/bill-generator', icon: PlusCircle },
        { name: 'Bill History', href: '/bills', icon: FileText }
      ]
    },
    {
      group: 'INVENTORY & STORE',
      items: [
        { name: 'Inventory', href: '/inventory', icon: Package },
        { name: 'Stock Purchases', href: '/stock-purchases', icon: ShoppingBag },
        { name: 'Product Sales', href: '/product-sales', icon: Tag },
        { name: 'Suppliers', href: '/suppliers', icon: Truck }
      ]
    },
    {
      group: 'CAMPUS & EXPENSES',
      items: [
        { name: 'Expenses', href: '/expenses', icon: TrendingDown },
        { name: 'Room Rent', href: '/rooms', icon: Home },
        { name: 'Electricity', href: '/electricity', icon: Zap }
      ]
    },
    {
      group: 'FINANCE & AUDIT',
      items: [
        { name: 'Accounts', href: '/accounts', icon: Wallet },
        { name: 'Reports & Analytics', href: '/reports', icon: BarChart4 },
        { name: 'Activity Logs', href: '/activity-logs', icon: History }
      ]
    },
    {
      group: 'COMMUNICATION & SYSTEM',
      items: [
        { name: 'Notifications', href: '/announcements', icon: Megaphone },
        { name: 'Settings', href: '/settings', icon: Settings }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className={`bg-primary text-white w-64 flex-shrink-0 transition-all duration-300 ${isSidebarOpen ? 'ml-0' : '-ml-64'} flex flex-col h-screen sticky top-0`}>
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold tracking-tight">St. Michel School</h1>
            <p className="text-xs text-blue-200">Management System</p>
          </div>
        </div>

        {/* Scrollable Navigation */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {navigationGroups.map((grp) => (
            <div key={grp.group} className="space-y-1">
              <p className="px-3 text-[10px] font-bold tracking-wider text-blue-200/70 uppercase">
                {grp.group}
              </p>
              {grp.items.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
                      isActive ? 'bg-white/15 text-white font-semibold' : 'text-blue-100/90 hover:bg-white/10'
                    }`}
                  >
                    <item.icon className="mr-2.5 h-4 w-4 flex-shrink-0" />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          ))}
        </div>

        {/* Logout Footer */}
        <div className="p-3 border-t border-white/10 bg-primary/95">
          <button
            onClick={onLogout}
            className="flex items-center w-full px-3 py-2 text-xs font-medium text-red-200 hover:bg-red-900/30 rounded-lg transition-colors"
          >
            <LogOut className="mr-2.5 h-4 w-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b h-16 flex items-center justify-between px-6 sticky top-0 z-20">
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-1 rounded-md hover:bg-gray-100">
            {isSidebarOpen ? <X className="h-5 w-5 text-gray-500" /> : <Menu className="h-5 w-5 text-gray-500" />}
          </button>

          <div className="flex items-center space-x-4">
            <Link to="/announcements" className="p-2 text-gray-400 hover:text-gray-600 relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1.5 right-1.5 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
            </Link>
            <div className="flex items-center space-x-3 border-l pl-4">
              <div className="text-right">
                <p className="text-xs font-semibold text-gray-900">{user?.user?.name || 'Administrator'}</p>
                <p className="text-[11px] text-gray-500 capitalize">{user?.user?.role?.replace('-', ' ') || 'Manager'}</p>
              </div>
              <div className="h-9 w-9 rounded-full bg-primary flex items-center justify-center text-white font-bold text-sm shadow-sm">
                {user?.user?.name ? user.user.name[0] : 'A'}
              </div>
            </div>
          </div>
        </header>

        <main className="p-6 overflow-y-auto flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
