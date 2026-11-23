import React, { useState, useEffect, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator
} from 'react-native';
import {
  Users,
  IndianRupee,
  Package,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  ChevronRight,
  LogOut,
  UserPlus,
  ShieldCheck,
  CreditCard,
  Building,
  GraduationCap,
  Calendar,
  CheckCircle2
} from 'lucide-react-native';
import axios from '../api/axios';
import { useAuth } from '../context/AuthContext';

const StatCard = ({ title, value, subtitle, icon: Icon, color, textColor = 'text-gray-900' }) => (
  <View className="bg-white p-4 rounded-2xl mb-3 shadow-sm border border-gray-100 flex-1">
    <View className="flex-row items-center justify-between mb-2">
      <View className={`h-10 w-10 ${color} rounded-xl items-center justify-center`}>
        <Icon size={20} color="white" />
      </View>
      {subtitle && <Text className="text-[10px] font-bold text-gray-400">{subtitle}</Text>}
    </View>
    <Text className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">{title}</Text>
    <Text className={`text-lg font-black mt-0.5 ${textColor}`}>{value}</Text>
  </View>
);

const DashboardScreen = ({ navigation }) => {
  const { logout, userData } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/reports/dashboard-stats');
      setStats(res.data.data);
    } catch (err) {
      console.log('Error fetching dashboard stats:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchStats();
    }, [])
  );

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <ScrollView
        className="px-5 py-3"
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchStats} colors={['#1e3a8a']} />}
      >
        {/* Top School Branding Header */}
        <View className="flex-row items-center justify-between mb-5 pt-1">
          <View>
            <View className="flex-row items-center gap-1.5">
              <Text className="text-xl font-black text-gray-900 tracking-tight">St. Michel School</Text>
              <View className="bg-blue-100 px-2 py-0.5 rounded-full">
                <Text className="text-[10px] font-bold text-blue-800">MANAGER</Text>
              </View>
            </View>
            <Text className="text-xs text-gray-500 font-medium">Operations & Academic Control Hub</Text>
          </View>
          <TouchableOpacity
            onPress={logout}
            className="h-10 w-10 bg-red-50 rounded-xl border border-red-100 items-center justify-center shadow-sm"
          >
            <LogOut size={18} color="#ef4444" />
          </TouchableOpacity>
        </View>

        {/* Primary KPI Grid Row 1 */}
        <View className="flex-row space-x-3 mb-1">
          <StatCard
            title="Total Students"
            value={stats?.totalStudents || 0}
            subtitle="Enrolled"
            icon={Users}
            color="bg-blue-600"
          />
          <StatCard
            title="Faculty & Staff"
            value={stats?.totalStaff || 0}
            subtitle="Active"
            icon={GraduationCap}
            color="bg-indigo-600"
          />
        </View>

        {/* Primary KPI Grid Row 2 */}
        <View className="flex-row space-x-3 mb-1">
          <StatCard
            title="Today's Fees"
            value={`₹${Math.round((stats?.todayCollection || 0) / 100).toLocaleString('en-IN')}`}
            subtitle="Collected"
            icon={IndianRupee}
            color="bg-emerald-600"
            textColor="text-emerald-700"
          />
          <StatCard
            title="Pending Dues"
            value={`₹${Math.round((stats?.totalPending || 0) / 100).toLocaleString('en-IN')}`}
            subtitle="Unpaid"
            icon={AlertTriangle}
            color="bg-rose-500"
            textColor={stats?.totalPending > 0 ? 'text-rose-600' : 'text-emerald-600'}
          />
        </View>

        {/* Primary KPI Grid Row 3 */}
        <View className="flex-row space-x-3 mb-4">
          <StatCard
            title="Store Stock Value"
            value={`₹${Math.round((stats?.totalInventoryValue || 0) / 100).toLocaleString('en-IN')}`}
            subtitle="In Hand"
            icon={Package}
            color="bg-amber-500"
          />
          <StatCard
            title="Low Stock"
            value={stats?.lowStockCount || 0}
            subtitle="Alerts"
            icon={AlertTriangle}
            color={stats?.lowStockCount > 0 ? 'bg-amber-600' : 'bg-slate-400'}
            textColor={stats?.lowStockCount > 0 ? 'text-amber-700' : 'text-gray-700'}
          />
        </View>

        {/* Statistical Financial & Student Payment Breakdown Chart */}
        <View className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 mb-6">
          <View className="flex-row justify-between items-center mb-3">
            <View>
              <Text className="text-sm font-black text-gray-900 tracking-tight">Fee Collection & Profit Statistics</Text>
              <Text className="text-[11px] font-bold text-gray-400">Student Payment & Net Margin Ratio</Text>
            </View>
            <View className="bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-100">
              <Text className="text-[10px] font-black text-emerald-700">LIVE LEDGER</Text>
            </View>
          </View>

          {/* Profit & Revenue Summary */}
          <View className="flex-row bg-slate-50 p-3 rounded-2xl mb-4 border border-slate-100">
            <View className="flex-1 border-r border-slate-200 pr-2">
              <Text className="text-[10px] font-bold text-gray-400 uppercase">Total Revenue</Text>
              <Text className="text-sm font-black text-gray-900 mt-0.5">
                ₹{Math.round((stats?.totalCollection || 0) / 100).toLocaleString('en-IN')}
              </Text>
            </View>
            <View className="flex-1 border-r border-slate-200 px-2">
              <Text className="text-[10px] font-bold text-emerald-600 uppercase">Net Profit</Text>
              <Text className="text-sm font-black text-emerald-600 mt-0.5">
                ₹{Math.round((stats?.netProfit || (stats?.totalCollection || 0) - (stats?.totalExpenses || 0)) / 100).toLocaleString('en-IN')}
              </Text>
            </View>
            <View className="flex-1 pl-2">
              <Text className="text-[10px] font-bold text-rose-500 uppercase">Pending Due</Text>
              <Text className="text-sm font-black text-rose-600 mt-0.5">
                ₹{Math.round((stats?.totalPending || 0) / 100).toLocaleString('en-IN')}
              </Text>
            </View>
          </View>

          {/* Visual Stacked Progress / Bar Graph */}
          {(() => {
            const paidCount = stats?.paidStudentsCount ?? 0;
            const pendingCount = stats?.pendingStudentsCount ?? 0;
            const total = (paidCount + pendingCount) || 1;
            const paidPct = Math.round((paidCount / total) * 100);
            const pendingPct = 100 - paidPct;

            return (
              <View>
                <View className="flex-row justify-between items-center mb-1.5">
                  <Text className="text-xs font-bold text-gray-700">Student Payment Distribution</Text>
                  <Text className="text-[11px] font-black text-primary">{paidPct}% Cleared</Text>
                </View>

                {/* Stacked Visual Bar */}
                <View className="h-4 bg-gray-100 rounded-full flex-row overflow-hidden mb-3">
                  <View style={{ width: `${paidPct}%` }} className="bg-emerald-500 h-full" />
                  <View style={{ width: `${pendingPct}%` }} className="bg-rose-500 h-full" />
                </View>

                {/* Legend & Breakdown Badges */}
                <View className="flex-row justify-between items-center pt-1">
                  <View className="flex-row items-center">
                    <View className="h-2.5 w-2.5 rounded-full bg-emerald-500 mr-1.5" />
                    <Text className="text-xs text-gray-600 font-bold">
                      Paid / No Dues: <Text className="font-black text-emerald-700">{paidCount} Students</Text>
                    </Text>
                  </View>

                  <View className="flex-row items-center">
                    <View className="h-2.5 w-2.5 rounded-full bg-rose-500 mr-1.5" />
                    <Text className="text-xs text-gray-600 font-bold">
                      Pending Dues: <Text className="font-black text-rose-600">{pendingCount} Students</Text>
                    </Text>
                  </View>
                </View>
              </View>
            );
          })()}
        </View>

        {/* Operations & Administrative Quick Actions */}
        <Text className="text-xs font-black text-gray-500 uppercase tracking-widest mb-3">
          Quick Operations & Control
        </Text>
        <View className="bg-white rounded-2xl p-2 shadow-sm border border-gray-100 mb-6">
          {[
            {
              label: 'Student Directory',
              desc: 'View & inspect all enrolled students',
              icon: Users,
              color: '#3b82f6',
              bg: 'bg-blue-50',
              screen: 'Students'
            },
            {
              label: 'New Student Admission',
              desc: 'Enroll student & assign class/section',
              icon: UserPlus,
              color: '#10b981',
              bg: 'bg-emerald-50',
              screen: 'Admission'
            },
            {
              label: 'Fee Collection & Billing',
              desc: 'Collect cash/UPI & view unpaid bills',
              icon: IndianRupee,
              color: '#16a34a',
              bg: 'bg-green-50',
              screen: 'Fees'
            },
            {
              label: 'School Inventory & Materials',
              desc: 'Books, uniforms, ties & stock ledger',
              icon: Package,
              color: '#8b5cf6',
              bg: 'bg-purple-50',
              screen: 'Inventory'
            },
          ].map((item, i) => (
            <TouchableOpacity
              key={i}
              onPress={() => item.screen && navigation.navigate(item.screen)}
              className="flex-row items-center justify-between p-3.5 border-b border-gray-50 last:border-0"
            >
              <View className="flex-row items-center flex-1 mr-3">
                <View className={`h-11 w-11 ${item.bg} rounded-xl items-center justify-center mr-3.5`}>
                  <item.icon size={22} color={item.color} />
                </View>
                <View className="flex-1">
                  <Text className="font-bold text-gray-900 text-sm">{item.label}</Text>
                  <Text className="text-gray-400 text-xs mt-0.5">{item.desc}</Text>
                </View>
              </View>
              <ChevronRight size={18} color="#cbd5e1" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Recent Fee Payments Feed */}
        <Text className="text-xs font-black text-gray-500 uppercase tracking-widest mb-3">
          Recent Fee Payments
        </Text>
        <View className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-6">
          {stats?.recentPayments && stats.recentPayments.length > 0 ? (
            stats.recentPayments.slice(0, 4).map((p, idx) => (
              <View key={p._id || idx} className="flex-row items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
                <View className="flex-row items-center">
                  <View className="h-9 w-9 bg-emerald-50 rounded-lg items-center justify-center mr-3">
                    <CheckCircle2 size={18} color="#10b981" />
                  </View>
                  <View>
                    <Text className="font-bold text-gray-900 text-xs">
                      {p.student ? `${p.student.firstName} ${p.student.lastName}` : 'Fee Payment'}
                    </Text>
                    <Text className="text-[10px] text-gray-400 uppercase">
                      {p.paymentMode} • {new Date(p.paymentDate || p.createdAt).toLocaleDateString()}
                    </Text>
                  </View>
                </View>
                <Text className="font-black text-emerald-600 text-sm">
                  +₹{Math.round((p.amount || 0) / 100).toLocaleString('en-IN')}
                </Text>
              </View>
            ))
          ) : (
            <View className="py-4 items-center">
              <Text className="text-gray-400 text-xs">No recent transactions recorded</Text>
            </View>
          )}
        </View>

        {/* Recent Admissions Feed */}
        <Text className="text-xs font-black text-gray-500 uppercase tracking-widest mb-3">
          Latest Enrolled Students
        </Text>
        <View className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-8">
          {stats?.recentAdmissions && stats.recentAdmissions.length > 0 ? (
            stats.recentAdmissions.slice(0, 3).map((stu, idx) => (
              <View key={stu._id || idx} className="flex-row items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
                <View className="flex-row items-center">
                  <View className="h-9 w-9 bg-blue-50 rounded-lg items-center justify-center mr-3 text-blue-700 font-bold">
                    <Text className="text-primary font-bold text-xs">{stu.firstName ? stu.firstName[0] : 'S'}</Text>
                  </View>
                  <View>
                    <Text className="font-bold text-gray-900 text-xs">
                      {stu.firstName} {stu.lastName}
                    </Text>
                    <Text className="text-[10px] text-gray-400">
                      Class: {stu.class?.name || 'Class I'} • {stu.admissionNumber}
                    </Text>
                  </View>
                </View>
                <View className="bg-emerald-100 px-2 py-0.5 rounded-full">
                  <Text className="text-[10px] font-bold text-emerald-800">Enrolled</Text>
                </View>
              </View>
            ))
          ) : (
            <View className="py-4 items-center">
              <Text className="text-gray-400 text-xs">No new admissions</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default DashboardScreen;
