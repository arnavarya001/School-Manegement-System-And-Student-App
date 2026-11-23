import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  RefreshControl,
  ActivityIndicator
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import {
  IndianRupee,
  Calendar,
  Bell,
  ChevronRight,
  CreditCard,
  Package,
  User,
  Award,
  BookOpen,
  Users
} from 'lucide-react-native';
import axios from '../api/axios';
import { useAuth } from '../context/AuthContext';

const DashboardScreen = ({ navigation }) => {
  const { logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [userRole, setUserRole] = useState('student');
  const [activeStudent, setActiveStudent] = useState(null);
  const [childrenList, setChildrenList] = useState([]);
  const [pendingFees, setPendingFees] = useState(0);
  const [totalClearedFees, setTotalClearedFees] = useState(0);
  const [materialsCount, setMaterialsCount] = useState(0);
  const [announcements, setAnnouncements] = useState([]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const meRes = await axios.get('/auth/me');
      const me = meRes.data;
      const role = me.user?.role || 'student';
      setUserRole(role);

      let currentStudent = null;

      if (role === 'parent') {
        const kids = me.profile?.students || [];
        setChildrenList(kids);
        if (kids.length > 0) {
          currentStudent = activeStudent || kids[0];
        }
      } else {
        currentStudent = me.profile;
      }

      setActiveStudent(currentStudent);

      if (currentStudent && currentStudent._id) {
        const [billsRes, matRes, annRes] = await Promise.all([
          axios.get(`/bills/student/${currentStudent._id}`).catch(() => ({ data: { data: [] } })),
          axios.get(`/inventory/student/${currentStudent._id}`).catch(() => ({ data: { data: [] } })),
          axios.get('/announcements').catch(() => ({ data: { data: [] } }))
        ]);

        const bills = billsRes.data.data || [];
        const dueSum = bills.reduce((sum, b) => sum + (b.dueAmount || 0), 0);
        const paidSum = bills.reduce((sum, b) => sum + (b.paidAmount || 0), 0);
        setPendingFees(dueSum);
        setTotalClearedFees(paidSum);

        setMaterialsCount((matRes.data.data || []).length);
        setAnnouncements((annRes.data.data || []).slice(0, 3));
      }
    } catch (e) {
      console.log('Error fetching dashboard:', e.message);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchDashboardData();
    }, [])
  );

  const handleSelectChild = (child) => {
    setActiveStudent(child);
  };

  const studentName = activeStudent ? `${activeStudent.firstName || ''} ${activeStudent.lastName || ''}`.trim() : 'Student';
  const className = activeStudent?.class?.name || (typeof activeStudent?.class === 'string' ? activeStudent.class : 'X');
  const sectionName = activeStudent?.section?.name || (typeof activeStudent?.section === 'string' ? activeStudent.section : 'A');

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView
        className="px-5 py-3"
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchDashboardData} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Header */}
        <View className="flex-row justify-between items-center mb-4">
          <View>
            <Text className="text-xl font-black text-gray-900">
              {userRole === 'parent' ? 'Parent Portal' : 'Student Portal'}
            </Text>
            <Text className="text-xs font-bold text-gray-400">
              St. Michel Higher Secondary School
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => navigation.navigate('Notices')}
            className="h-10 w-10 bg-white rounded-2xl items-center justify-center shadow-xs border border-gray-100"
          >
            <Bell size={18} color="#1e3a8a" />
          </TouchableOpacity>
        </View>

        {/* Multi-child Switcher for Parents */}
        {userRole === 'parent' && childrenList.length > 1 && (
          <View className="mb-4">
            <Text className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Switch Child</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
              {childrenList.map(kid => {
                const isSelected = activeStudent?._id === kid._id;
                return (
                  <TouchableOpacity
                    key={kid._id}
                    onPress={() => handleSelectChild(kid)}
                    className={`px-3 py-1.5 rounded-xl mr-2 border flex-row items-center ${
                      isSelected ? 'bg-primary border-primary' : 'bg-white border-gray-200'
                    }`}
                  >
                    <User size={12} color={isSelected ? 'white' : '#64748b'} />
                    <Text className={`font-bold text-xs ml-1.5 ${isSelected ? 'text-white' : 'text-gray-700'}`}>
                      {kid.firstName} {kid.lastName}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        )}

        {/* Student ID Card Banner */}
        <View className="bg-primary p-4 rounded-3xl shadow-sm mb-4">
          <View className="flex-row items-center justify-between mb-2">
            <View className="flex-row items-center flex-1 mr-2">
              <View className="h-12 w-12 bg-white/20 rounded-2xl items-center justify-center mr-3">
                <Text className="text-white font-black text-lg">
                  {studentName ? studentName[0] : 'S'}
                </Text>
              </View>
              <View className="flex-1">
                <Text className="font-black text-white text-base">{studentName}</Text>
                <Text className="text-blue-200 text-xs font-semibold mt-0.5">
                  Class {className} - Sec {sectionName} • Roll: {activeStudent?.rollNumber || '01'}
                </Text>
                <Text className="text-blue-300 text-[10px] font-bold mt-0.5">
                  Adm #{activeStudent?.admissionNumber || 'N/A'}
                  {activeStudent?.phone ? ` • 📱 ${activeStudent.phone}` : ''}
                </Text>
              </View>
            </View>
            <View className="bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-400/30">
              <Text className="text-emerald-300 text-[10px] font-bold">
                {activeStudent?.status || 'Active'}
              </Text>
            </View>
          </View>
        </View>

        {/* KPI Cards: Pending Fees & Attendance */}
        <View className="flex-row space-x-3 mb-4">
          <TouchableOpacity
            onPress={() => navigation.navigate('Fees')}
            className="flex-1 bg-white p-4 rounded-3xl shadow-xs border border-gray-100"
          >
            <View className="h-9 w-9 bg-rose-50 rounded-xl items-center justify-center mb-2">
              <IndianRupee size={18} color="#e11d48" />
            </View>
            <Text className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Pending Dues</Text>
            <Text className={`text-lg font-black mt-0.5 ${pendingFees > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
              ₹{Math.round(pendingFees / 100).toLocaleString('en-IN')}
            </Text>
            <Text className="text-[10px] text-blue-600 font-bold mt-1">View Invoices →</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate('Attendance')}
            className="flex-1 bg-white p-4 rounded-3xl shadow-xs border border-gray-100"
          >
            <View className="h-9 w-9 bg-emerald-50 rounded-xl items-center justify-center mb-2">
              <Calendar size={18} color="#059669" />
            </View>
            <Text className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Attendance</Text>
            <Text className="text-lg font-black text-emerald-700 mt-0.5">
              {(activeStudent?.attendancePercentage ?? 92).toFixed(1)}%
            </Text>
            <Text className="text-[10px] text-emerald-600 font-bold mt-1">Present Record →</Text>
          </TouchableOpacity>
        </View>

        {/* Quick Operations Strip */}
        <Text className="text-xs font-black text-gray-400 uppercase tracking-wider mb-2.5">Quick Actions</Text>
        <View className="flex-row justify-between mb-5">
          {[
            { label: 'Pay Fees', icon: CreditCard, color: '#059669', bg: 'bg-emerald-50', screen: 'Fees' },
            { label: 'Materials', icon: Package, color: '#9333ea', bg: 'bg-purple-50', screen: 'Materials' },
            { label: 'Attendance', icon: Calendar, color: '#2563eb', bg: 'bg-blue-50', screen: 'Attendance' },
            { label: 'Notices', icon: Bell, color: '#ea580c', bg: 'bg-orange-50', screen: 'Notices' },
          ].map((item, i) => (
            <TouchableOpacity
              key={i}
              onPress={() => navigation.navigate(item.screen)}
              className="items-center flex-1"
            >
              <View className={`h-13 w-13 ${item.bg} rounded-2xl items-center justify-center mb-1.5 p-3`}>
                <item.icon size={22} color={item.color} />
              </View>
              <Text className="text-[10px] font-black text-gray-600 uppercase text-center">{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Materials Summary Preview */}
        <View className="bg-white p-4 rounded-3xl mb-4 shadow-xs border border-gray-100">
          <View className="flex-row justify-between items-center mb-2">
            <View className="flex-row items-center">
              <Package size={16} color="#9333ea" />
              <Text className="ml-2 font-black text-xs text-gray-900 uppercase">School Materials & Store</Text>
            </View>
            <TouchableOpacity onPress={() => navigation.navigate('Materials')}>
              <Text className="text-xs font-bold text-blue-600">Browse Store →</Text>
            </TouchableOpacity>
          </View>
          <Text className="text-xs text-gray-500 font-medium">
            You currently have <Text className="font-black text-purple-700">{materialsCount} school items</Text> (books, uniform kits) issued by the administration.
          </Text>
        </View>

        {/* School Announcements */}
        <View className="bg-white p-4 rounded-3xl mb-8 shadow-xs border border-gray-100">
          <View className="flex-row justify-between items-center mb-3">
            <View className="flex-row items-center">
              <Bell size={16} color="#ea580c" />
              <Text className="ml-2 font-black text-xs text-gray-900 uppercase">School Announcements</Text>
            </View>
            <TouchableOpacity onPress={() => navigation.navigate('Notices')}>
              <Text className="text-xs font-bold text-blue-600">View All →</Text>
            </TouchableOpacity>
          </View>

          {announcements.length === 0 ? (
            <Text className="text-xs text-gray-400 font-medium py-1">No new announcements at this time.</Text>
          ) : (
            announcements.map((a, idx) => (
              <View key={idx} className="py-2 border-b border-gray-100 last:border-b-0">
                <Text className="font-bold text-xs text-gray-900">{a.title}</Text>
                <Text className="text-[11px] text-gray-500 mt-0.5" numberOfLines={2}>
                  {a.content}
                </Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default DashboardScreen;
