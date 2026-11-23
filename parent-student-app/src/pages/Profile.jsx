import { User, Shield, LogOut, ChevronRight, Phone, Mail, MapPin } from 'lucide-react';

const Profile = ({ user, activeStudent, onLogout }) => {
  const profileItems = [
    { label: 'Personal Information', icon: User },
    { label: 'Security & Password', icon: Shield },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <div className="h-20 w-20 rounded-3xl bg-primary text-white flex items-center justify-center text-3xl font-black">
          {activeStudent ? activeStudent.firstName[0] : (user?.user?.name ? user.user.name[0] : 'U')}
        </div>
        <div>
          <h2 className="text-2xl font-black text-gray-900 leading-tight">
            {activeStudent ? `${activeStudent.firstName} ${activeStudent.lastName}` : user.user.name}
          </h2>
          <p className="text-gray-500 font-bold text-sm">
            {user.user.role === 'parent' ? 'Parent Account' : `Student ID: ${activeStudent?.admissionNumber}`}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="card space-y-4">
          <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">Contact Information</h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400">
                <Phone className="h-4 w-4" />
              </div>
              <p className="text-sm font-bold text-gray-700">{user.user.role === 'parent' ? 'Registered Phone' : 'Parent Contact'}</p>
              <p className="text-sm font-medium text-gray-500 ml-auto">+91 98765 43210</p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400">
                <Mail className="h-4 w-4" />
              </div>
              <p className="text-sm font-bold text-gray-700">Email Address</p>
              <p className="text-sm font-medium text-gray-500 ml-auto">{user.user.email}</p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="h-8 w-8 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 mt-0.5">
                <MapPin className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-700">Home Address</p>
                <p className="text-xs font-medium text-gray-500 mt-1 leading-relaxed">
                  123, School Lane, St. Michel Road, City, PIN-000000
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          {profileItems.map((item, i) => (
            <button key={i} className="card w-full flex items-center justify-between py-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-center space-x-4">
                <div className="h-10 w-10 bg-gray-100 rounded-xl flex items-center justify-center text-gray-500">
                  <item.icon className="h-5 w-5" />
                </div>
                <span className="font-bold text-gray-700">{item.label}</span>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-300" />
            </button>
          ))}
        </div>

        <button
          onClick={onLogout}
          className="w-full btn bg-red-50 text-red-600 border border-red-100 py-4 mt-6"
        >
          <LogOut className="h-5 w-5 mr-2" /> Sign Out
        </button>
      </div>

      <div className="text-center space-y-1 py-4">
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">St. Michel School Management System</p>
        <p className="text-[8px] font-bold text-gray-300 uppercase">Version 1.0.0 Build 2023.08</p>
      </div>
    </div>
  );
};

export default Profile;
