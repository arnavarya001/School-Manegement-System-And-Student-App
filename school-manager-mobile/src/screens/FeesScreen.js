import React, { useState, useEffect } from 'react';
import {
  View, Text, FlatList, TextInput, TouchableOpacity,
  Modal, Alert, SafeAreaView, ActivityIndicator, ScrollView
} from 'react-native';
import { IndianRupee, Search, CheckCircle2, Clock, X, ArrowUpRight, ShieldCheck } from 'lucide-react-native';
import axios from '../api/axios';

const FeesScreen = () => {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('ALL'); // ALL, UNPAID, PAID

  // Payment collection modal
  const [payModal, setPayModal] = useState(false);
  const [selectedBill, setSelectedBill] = useState(null);
  const [collectAmount, setCollectAmount] = useState('');
  const [paymentMode, setPaymentMode] = useState('Cash');
  const [collecting, setCollecting] = useState(false);

  useEffect(() => {
    fetchBills();
  }, []);

  const fetchBills = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/bills');
      setBills(res.data.data || []);
    } catch (err) {
      console.log('Error fetching bills:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const openPaymentModal = (bill) => {
    setSelectedBill(bill);
    setCollectAmount((bill.dueAmount / 100).toString());
    setPayModal(true);
  };

  const handleRecordPayment = async () => {
    if (!selectedBill) return;
    const amountVal = parseFloat(collectAmount);
    if (!amountVal || amountVal <= 0) {
      return Alert.alert('Invalid Amount', 'Please enter a valid amount');
    }

    setCollecting(true);
    try {
      await axios.post('/payments/offline', {
        billId: selectedBill._id,
        studentId: selectedBill.student?._id || selectedBill.student,
        amount: Math.round(amountVal * 100),
        paymentMode: paymentMode,
        remarks: `Collected at counter via ${paymentMode}`
      });

      Alert.alert('Payment Recorded!', `Successfully collected ₹${amountVal.toLocaleString()} via ${paymentMode}`);
      setPayModal(false);
      setSelectedBill(null);
      fetchBills();
    } catch (err) {
      Alert.alert('Error', err.response?.data?.error || err.message);
    } finally {
      setCollecting(false);
    }
  };

  const filteredBills = bills.filter(b => {
    const studentName = b.student?.firstName
      ? `${b.student.firstName} ${b.student.lastName}`
      : 'Student';
    const matchesSearch = studentName.toLowerCase().includes(search.toLowerCase()) ||
      b.billNumber.toLowerCase().includes(search.toLowerCase());

    if (filter === 'UNPAID') return matchesSearch && b.status !== 'Paid';
    if (filter === 'PAID') return matchesSearch && b.status === 'Paid';
    return matchesSearch;
  });

  const totalBilled = bills.reduce((acc, b) => acc + (b.totalAmount / 100), 0);
  const totalPaid = bills.reduce((acc, b) => acc + (b.paidAmount / 100), 0);
  const totalPending = bills.reduce((acc, b) => acc + (b.dueAmount / 100), 0);

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="px-6 py-4">
        {/* Header */}
        <View className="mb-4">
          <Text className="text-2xl font-black text-gray-900">Fee Collection</Text>
          <Text className="text-gray-400 font-bold text-xs">Demand Bills & Payments Ledger</Text>
        </View>

        {/* Summary Metric Cards */}
        <View className="flex-row justify-between mb-4">
          <View className="bg-white p-3.5 rounded-2xl flex-1 mr-2 shadow-sm border border-gray-100">
            <Text className="text-gray-400 text-[10px] font-bold uppercase">Total Billed</Text>
            <Text className="text-base font-black text-gray-900 mt-0.5">₹{Math.round(totalBilled).toLocaleString()}</Text>
          </View>
          <View className="bg-white p-3.5 rounded-2xl flex-1 mr-2 shadow-sm border border-gray-100">
            <Text className="text-gray-400 text-[10px] font-bold uppercase">Collected</Text>
            <Text className="text-base font-black text-green-600 mt-0.5">₹{Math.round(totalPaid).toLocaleString()}</Text>
          </View>
          <View className="bg-white p-3.5 rounded-2xl flex-1 shadow-sm border border-gray-100">
            <Text className="text-gray-400 text-[10px] font-bold uppercase">Pending</Text>
            <Text className="text-base font-black text-red-500 mt-0.5">₹{Math.round(totalPending).toLocaleString()}</Text>
          </View>
        </View>

        {/* Search Input */}
        <TextInput
          className="bg-white px-4 py-3 rounded-2xl mb-3 shadow-sm border border-gray-100 font-medium text-gray-800"
          placeholder="Search student or bill #..."
          value={search}
          onChangeText={setSearch}
        />

        {/* Status Filters */}
        <View className="flex-row mb-2">
          {['ALL', 'UNPAID', 'PAID'].map(tab => (
            <TouchableOpacity
              key={tab}
              onPress={() => setFilter(tab)}
              className={`px-4 py-1.5 rounded-xl mr-2 border ${filter === tab ? 'bg-primary border-primary' : 'bg-white border-gray-200'}`}
            >
              <Text className={`font-bold text-xs ${filter === tab ? 'text-white' : 'text-gray-600'}`}>
                {tab === 'ALL' ? 'All Bills' : tab === 'UNPAID' ? 'Pending Dues' : 'Paid in Full'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Bills List */}
      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#1e3a8a" />
        </View>
      ) : (
        <FlatList
          data={filteredBills}
          keyExtractor={(item) => item._id}
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 24 }}
          ListEmptyComponent={
            <View className="bg-white p-8 rounded-3xl items-center mt-6">
              <IndianRupee size={40} color="#cbd5e1" />
              <Text className="text-gray-500 font-bold mt-2">No bills found</Text>
            </View>
          }
          renderItem={({ item }) => {
            const isPaid = item.status === 'Paid';
            const studentName = item.student?.firstName
              ? `${item.student.firstName} ${item.student.lastName}`
              : 'Enrolled Student';
            const className = item.student?.class?.name ? `Class ${item.student.class.name}` : 'Class X';

            return (
              <View className="bg-white p-4 rounded-2xl mb-3 shadow-sm border border-gray-100">
                <View className="flex-row justify-between items-start mb-2">
                  <View>
                    <Text className="font-black text-gray-900 text-base">{studentName}</Text>
                    <Text className="text-gray-400 text-xs font-semibold">{className} • {item.billNumber}</Text>
                  </View>
                  <View className={`px-2.5 py-1 rounded-full ${isPaid ? 'bg-green-100' : 'bg-amber-100'}`}>
                    <Text className={`text-[10px] font-black uppercase ${isPaid ? 'text-green-700' : 'text-amber-700'}`}>
                      {item.status}
                    </Text>
                  </View>
                </View>

                {/* Items breakdown */}
                {item.items?.map((it, idx) => (
                  <Text key={idx} className="text-gray-500 text-xs mb-1">
                    • {it.description || 'School Fee'}: ₹{it.amount / 100}
                  </Text>
                ))}

                <View className="flex-row justify-between items-center mt-3 pt-3 border-t border-gray-50">
                  <View>
                    <Text className="text-gray-400 text-[10px] font-bold uppercase">Total Due</Text>
                    <Text className="text-primary font-black text-base">₹{item.dueAmount / 100}</Text>
                  </View>

                  {!isPaid && (
                    <TouchableOpacity
                      onPress={() => openPaymentModal(item)}
                      className="bg-green-600 px-4 py-2 rounded-xl flex-row items-center shadow-sm"
                    >
                      <IndianRupee size={14} color="white" />
                      <Text className="text-white font-bold ml-1 text-xs">Collect Fee</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            );
          }}
        />
      )}

      {/* Collect Payment Modal */}
      <Modal visible={payModal} animationType="slide" transparent>
        <View className="flex-1 justify-end bg-black/40">
          <View className="bg-white rounded-t-[32px] p-6">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-xl font-black text-gray-900">Record Fee Collection</Text>
              <TouchableOpacity onPress={() => setPayModal(false)} className="p-1">
                <X size={22} color="#64748b" />
              </TouchableOpacity>
            </View>

            {selectedBill && (
              <View className="bg-blue-50 p-4 rounded-2xl mb-4 border border-blue-100">
                <Text className="font-bold text-gray-800">
                  Student: {selectedBill.student?.firstName} {selectedBill.student?.lastName}
                </Text>
                <Text className="text-gray-500 text-xs mt-0.5">
                  Bill #{selectedBill.billNumber} • Outstanding: ₹{selectedBill.dueAmount / 100}
                </Text>
              </View>
            )}

            <Text className="text-xs font-bold text-gray-500 mb-1">Collection Amount (₹) *</Text>
            <TextInput
              className="bg-gray-50 px-4 py-3 rounded-xl mb-3 font-bold text-gray-800 text-lg"
              placeholder="Amount in Rupees"
              keyboardType="numeric"
              value={collectAmount}
              onChangeText={setCollectAmount}
            />

            <Text className="text-xs font-bold text-gray-500 mb-2">Payment Mode</Text>
            <View className="flex-row mb-6">
              {['Cash', 'Cheque', 'Bank Transfer', 'UPI'].map(mode => (
                <TouchableOpacity
                  key={mode}
                  onPress={() => setPaymentMode(mode)}
                  className={`px-3 py-2 rounded-xl mr-2 border ${paymentMode === mode ? 'bg-primary border-primary' : 'bg-gray-100 border-gray-200'}`}
                >
                  <Text className={`font-bold text-xs ${paymentMode === mode ? 'text-white' : 'text-gray-700'}`}>
                    {mode}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              onPress={handleRecordPayment}
              disabled={collecting}
              className={`bg-green-600 py-4 rounded-2xl shadow-lg mb-6 ${collecting ? 'opacity-70' : ''}`}
            >
              {collecting ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white text-center font-bold text-base">Confirm & Print Receipt</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default FeesScreen;
