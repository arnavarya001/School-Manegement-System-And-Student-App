import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  Modal,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import {
  IndianRupee,
  Download,
  Printer,
  ChevronRight,
  CheckCircle2,
  QrCode,
  CreditCard,
  X,
  FileText
} from 'lucide-react-native';
import axios from '../api/axios';
import { printBill, downloadBillPdf } from '../utils/billPdfGenerator';

const FeesScreen = () => {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [studentProfile, setStudentProfile] = useState(null);
  const [schoolSettings, setSchoolSettings] = useState(null);

  // Pay Modal State
  const [showPayModal, setShowPayModal] = useState(false);
  const [selectedBillForPay, setSelectedBillForPay] = useState(null);
  const [payAmountInput, setPayAmountInput] = useState('');
  const [payMode, setPayMode] = useState('UPI'); // 'UPI', 'Card', 'Net Banking'
  const [paying, setPaying] = useState(false);

  const fetchBillsAndProfile = async () => {
    try {
      setLoading(true);
      const [meRes, setRes] = await Promise.all([
        axios.get('/auth/me').catch(() => ({ data: {} })),
        axios.get('/school/settings').catch(() => ({ data: {} }))
      ]);

      setSchoolSettings(setRes.data?.data || null);

      const me = meRes.data;
      let sId = null;
      let sProf = null;

      if (me.user?.role === 'parent') {
        const studentList = me.profile?.students || [];
        if (studentList.length > 0) {
          sProf = studentList[0];
          sId = sProf._id || sProf;
        }
      } else {
        sProf = me.profile;
        sId = sProf?._id;
      }

      setStudentProfile(sProf);

      if (sId) {
        const res = await axios.get(`/bills/student/${sId}`);
        setBills(res.data.data || []);
      } else {
        setBills([]);
      }
    } catch (e) {
      console.log('Error fetching bills:', e.message);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchBillsAndProfile();
    }, [])
  );

  const handleOpenPay = (bill) => {
    setSelectedBillForPay(bill);
    setPayAmountInput(((bill.dueAmount || 0) / 100).toString());
    setPayMode('UPI');
    setShowPayModal(true);
  };

  const handleConfirmOnlinePayment = async () => {
    const amtVal = parseFloat(payAmountInput);
    if (!amtVal || amtVal <= 0) {
      return Alert.alert('Invalid Amount', 'Please enter a valid payment amount');
    }

    const amtPaise = Math.round(amtVal * 100);
    if (amtPaise > selectedBillForPay.dueAmount) {
      return Alert.alert('Overpayment', 'Amount exceeds pending balance');
    }

    setPaying(true);
    try {
      await axios.post('/payments/pay', {
        billId: selectedBillForPay._id,
        amount: amtPaise,
        paymentMode: payMode,
        notes: `Online Fee Payment via ${payMode}`
      });

      Alert.alert(
        'Payment Successful!',
        `Your payment of ₹${amtVal.toLocaleString('en-IN')} via ${payMode} was received. Official receipt generated.`
      );
      setShowPayModal(false);
      fetchBillsAndProfile();
    } catch (err) {
      Alert.alert('Payment Error', err.response?.data?.error || err.message);
    } finally {
      setPaying(false);
    }
  };

  const totalDueAll = bills.reduce((sum, b) => sum + (b.dueAmount || 0), 0) / 100;
  const totalPaidAll = bills.reduce((sum, b) => sum + (b.paidAmount || 0), 0) / 100;

  const renderBill = ({ item }) => {
    const isPaid = item.status === 'Paid' || (item.dueAmount || 0) === 0;
    const dueRs = ((item.dueAmount || 0) / 100).toLocaleString('en-IN');
    const totalRs = ((item.totalAmount || 0) / 100).toLocaleString('en-IN');
    const paidRs = ((item.paidAmount || 0) / 100).toLocaleString('en-IN');

    return (
      <View className="bg-white p-5 rounded-3xl mb-4 shadow-sm border border-gray-100">
        <View className="flex-row justify-between items-start mb-3">
          <View className="flex-1 mr-2">
            <View className="flex-row items-center gap-2">
              <Text className="font-black text-gray-900 text-base">{item.billType || 'School'} Fee</Text>
              <View className={`px-2 py-0.5 rounded-full ${isPaid ? 'bg-emerald-100' : 'bg-rose-100'}`}>
                <Text className={`text-[10px] font-bold ${isPaid ? 'text-emerald-800' : 'text-rose-800'}`}>
                  {isPaid ? 'PAID' : item.status?.toUpperCase() || 'UNPAID'}
                </Text>
              </View>
            </View>
            <Text className="text-xs font-bold text-gray-400 mt-0.5">#{item.billNumber}</Text>
          </View>
          <View className="items-end">
            <Text className={`text-xl font-black ${isPaid ? 'text-emerald-600' : 'text-primary'}`}>
              ₹{isPaid ? paidRs : dueRs}
            </Text>
            <Text className="text-[10px] font-bold text-gray-400 uppercase mt-0.5">
              Due: {new Date(item.dueDate).toLocaleDateString('en-GB')}
            </Text>
          </View>
        </View>

        {/* Item breakdown preview */}
        {item.items && item.items.length > 0 && (
          <View className="bg-gray-50 p-2.5 rounded-xl mb-3 border border-gray-100">
            {item.items.map((it, idx) => (
              <View key={idx} className="flex-row justify-between py-0.5">
                <Text className="text-xs text-gray-600 font-medium">
                  {it.description} {it.quantity > 1 ? `(x${it.quantity})` : ''}
                </Text>
                <Text className="text-xs font-bold text-gray-800">
                  ₹{Math.round(((it.amount || 0) * (it.quantity || 1)) / 100).toLocaleString('en-IN')}
                </Text>
              </View>
            ))}
            <View className="flex-row justify-between pt-1 mt-1 border-t border-gray-200">
              <Text className="text-[11px] font-bold text-gray-500">Total: ₹{totalRs}</Text>
              <Text className="text-[11px] font-bold text-emerald-600">Paid: ₹{paidRs}</Text>
            </View>
          </View>
        )}

        {/* Action Buttons: Print, Download PDF & Pay Now */}
        <View className="flex-row space-x-2">
          <TouchableOpacity
            onPress={() => printBill(item, studentProfile, schoolSettings)}
            className="flex-1 bg-slate-800 py-2.5 rounded-xl items-center flex-row justify-center"
          >
            <Printer size={14} color="white" />
            <Text className="ml-1.5 font-bold text-xs text-white">Print</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => downloadBillPdf(item, studentProfile, schoolSettings)}
            className="flex-1 bg-blue-600 py-2.5 rounded-xl items-center flex-row justify-center"
          >
            <Download size={14} color="white" />
            <Text className="ml-1.5 font-bold text-xs text-white">PDF</Text>
          </TouchableOpacity>

          {!isPaid && (
            <TouchableOpacity
              onPress={() => handleOpenPay(item)}
              className="flex-[2] bg-emerald-600 py-2.5 rounded-xl items-center flex-row justify-center shadow-sm"
            >
              <CreditCard size={14} color="white" />
              <Text className="text-white font-bold text-xs ml-1.5">Pay Now (₹{dueRs})</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="px-5 py-4 flex-1">
        <View className="flex-row justify-between items-center mb-4">
          <View>
            <Text className="text-2xl font-black text-gray-900 tracking-tight">Fees & Bills</Text>
            <Text className="text-xs font-bold text-gray-400">Payment Notices, Bills & Official Receipts</Text>
          </View>
        </View>

        {/* Summary Card */}
        <View className="bg-primary p-4 rounded-3xl mb-4 shadow-sm flex-row justify-between items-center">
          <View>
            <Text className="text-blue-200 text-xs font-bold uppercase">Pending Balance</Text>
            <Text className="text-white text-2xl font-black mt-0.5">₹{totalDueAll.toLocaleString('en-IN')}</Text>
          </View>
          <View className="items-end">
            <Text className="text-blue-200 text-xs font-bold uppercase">Total Cleared</Text>
            <Text className="text-emerald-400 text-lg font-black mt-0.5">₹{totalPaidAll.toLocaleString('en-IN')}</Text>
          </View>
        </View>

        <FlatList
          data={bills}
          renderItem={renderBill}
          keyExtractor={item => item._id}
          refreshing={loading}
          onRefresh={fetchBillsAndProfile}
          ListEmptyComponent={
            <View className="bg-white p-8 rounded-3xl items-center mt-6">
              <FileText size={36} color="#cbd5e1" />
              <Text className="text-gray-400 font-bold mt-2 text-xs">No bills found.</Text>
            </View>
          }
        />
      </View>

      {/* Online / UPI Payment Modal */}
      {showPayModal && (
        <Modal visible={showPayModal} animationType="slide" transparent onRequestClose={() => setShowPayModal(false)}>
          <View className="flex-1 justify-end bg-black/60">
            <View className="bg-white rounded-t-[32px] p-5 max-h-[90%]">
              <View className="flex-row justify-between items-center mb-3 pb-2 border-b border-gray-100">
                <View>
                  <Text className="text-lg font-black text-gray-900">Pay School Bill</Text>
                  <Text className="text-xs text-gray-400">Bill #{selectedBillForPay?.billNumber}</Text>
                </View>
                <TouchableOpacity onPress={() => setShowPayModal(false)} className="p-2">
                  <X size={20} color="#64748b" />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                {/* Due Banner */}
                <View className="bg-emerald-50 p-3 rounded-2xl mb-3 border border-emerald-100">
                  <Text className="text-xs text-emerald-800 font-medium">
                    Bill Type: {selectedBillForPay?.billType || 'School'} Fee
                  </Text>
                  <Text className="text-base font-black text-emerald-800 mt-0.5">
                    Total Due: ₹{selectedBillForPay ? ((selectedBillForPay.dueAmount || 0) / 100).toLocaleString('en-IN') : 0}
                  </Text>
                </View>

                {/* Payment Mode Selector */}
                <Text className="text-[10px] font-bold text-gray-600 mb-1.5">Select Payment Mode *</Text>
                <View className="flex-row gap-2 mb-3">
                  {['UPI', 'Card', 'Net Banking'].map(m => (
                    <TouchableOpacity
                      key={m}
                      onPress={() => setPayMode(m)}
                      className={`flex-1 py-2 rounded-xl border items-center ${
                        payMode === m ? 'bg-primary border-primary' : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <Text className={`text-xs font-bold ${payMode === m ? 'text-white' : 'text-gray-700'}`}>
                        {m}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* UPI QR Display */}
                {payMode === 'UPI' && (
                  <View className="bg-purple-50 p-4 rounded-2xl border border-purple-200 mb-3 items-center">
                    <QrCode size={32} color="#7e22ce" />
                    <Text className="font-black text-xs text-purple-900 mt-2">Scan & Pay via any UPI App</Text>
                    <Text className="text-xs font-bold text-purple-800 bg-white px-3 py-1 rounded-lg border border-purple-300 my-1.5">
                      {schoolSettings?.upiId || 'stmichel@upi'}
                    </Text>
                    <Text className="text-[10px] text-purple-600 font-medium text-center">
                      Google Pay • PhonePe • Paytm • BHIM
                    </Text>
                  </View>
                )}

                {/* Amount to Pay */}
                <View className="mb-4">
                  <Text className="text-[10px] font-bold text-gray-600 mb-1">Enter Amount to Pay (₹) *</Text>
                  <TextInput
                    value={payAmountInput}
                    onChangeText={setPayAmountInput}
                    keyboardType="numeric"
                    className="border border-emerald-300 px-3.5 py-2.5 rounded-xl text-lg font-black text-emerald-700 bg-white"
                  />
                </View>

                <TouchableOpacity
                  onPress={handleConfirmOnlinePayment}
                  disabled={paying}
                  className="bg-emerald-600 py-3.5 rounded-2xl shadow-sm items-center mb-4 flex-row justify-center"
                >
                  {paying ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <>
                      <CheckCircle2 size={16} color="white" />
                      <Text className="text-white font-black text-xs ml-1.5">Confirm & Complete Payment</Text>
                    </>
                  )}
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
};

export default FeesScreen;
