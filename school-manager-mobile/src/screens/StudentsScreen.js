import React, { useState, useEffect, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View, Text, FlatList, TextInput, SafeAreaView, TouchableOpacity,
  Modal, ScrollView, Alert, ActivityIndicator, StyleSheet
} from 'react-native';
import {
  Search, Eye, X, Phone, Mail, MapPin, Calendar, Award, User,
  IndianRupee, Package, Edit3, PlusCircle, CheckCircle2, Clock,
  AlertTriangle, FileText, Check, Zap, DollarSign, Printer, Download,
  QrCode, Trash2, Filter, CreditCard
} from 'lucide-react-native';
import axios from '../api/axios';
import { printBill, downloadBillPdf } from '../utils/billPdfGenerator';

const StudentsScreen = () => {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedClassFilter, setSelectedClassFilter] = useState('ALL');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [activeTab, setActiveTab] = useState('ACADEMIC'); // 'ACADEMIC', 'FEES', 'MATERIALS', 'TRANSACTIONS'

  // School Settings (UPI ID, etc.)
  const [schoolSettings, setSchoolSettings] = useState(null);

  // Student specific data
  const [studentBills, setStudentBills] = useState([]);
  const [studentMaterials, setStudentMaterials] = useState([]);
  const [studentPayments, setStudentPayments] = useState([]);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Available Inventory Products for Issuing
  const [inventoryProducts, setInventoryProducts] = useState([]);

  // Edit Student Modal State
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
    rollNumber: '',
    phone: '',
    attendancePercentage: '92',
    academicSession: '',
    status: 'Active',
    parentFullName: '',
    parentMobile: '',
    parentEmail: '',
    parentAddress: ''
  });
  const [savingEdit, setSavingEdit] = useState(false);

  // Quick Inline Attendance Edit
  const [showAttendanceEditModal, setShowAttendanceEditModal] = useState(false);
  const [attendanceInput, setAttendanceInput] = useState('');
  const [savingAttendance, setSavingAttendance] = useState(false);

  // Bill Generator Modal State
  const [showBillModal, setShowBillModal] = useState(false);
  const [billForm, setBillForm] = useState({
    billType: 'Tuition',
    description: 'Quarterly Tuition Fee',
    amount: '5000'
  });
  const [generatingBill, setGeneratingBill] = useState(false);

  // Bulk Fee Update Modal State
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkForm, setBulkForm] = useState({
    billType: 'Tuition',
    description: 'Session School Fee',
    amount: '5000'
  });
  const [applyingBulk, setApplyingBulk] = useState(false);

  // Payment Collection Modal State (Cash / UPI / Card / Net Banking)
  const [showCollectPaymentModal, setShowCollectPaymentModal] = useState(false);
  const [selectedBillForPay, setSelectedBillForPay] = useState(null);
  const [paymentAmountInput, setPaymentAmountInput] = useState('');
  const [selectedPaymentMode, setSelectedPaymentMode] = useState('Cash'); // 'Cash', 'UPI', 'Card', 'Net Banking', 'Cheque'
  const [recordingPayment, setRecordingPayment] = useState(false);

  // Edit Bill Modal State (Total, Paid, Due, Status)
  const [showEditBillModal, setShowEditBillModal] = useState(false);
  const [billBeingEdited, setBillBeingEdited] = useState(null);
  const [billEditForm, setBillEditForm] = useState({
    totalAmount: '',
    paidAmount: '',
    dueAmount: '',
    status: 'Unpaid'
  });
  const [savingBillEdit, setSavingBillEdit] = useState(false);

  // Issue New Material Modal State
  const [showIssueMaterialModal, setShowIssueMaterialModal] = useState(false);
  const [issueForm, setIssueForm] = useState({
    productId: '',
    quantity: '1',
    paymentMode: 'Cash',
    chargeOption: 'PAID' // 'PAID', 'DUE', 'FREE'
  });
  const [issuingMaterial, setIssuingMaterial] = useState(false);

  useEffect(() => {
    fetchStudents();
    fetchInventoryAndSettings();
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchStudents();
      fetchInventoryAndSettings();
    }, [])
  );

  const fetchStudents = () => {
    axios.get('/students')
      .then(res => setStudents(res.data.data || []))
      .catch(err => console.log('Fetch students err:', err.message));
  };

  const fetchInventoryAndSettings = () => {
    axios.get('/inventory/products')
      .then(res => setInventoryProducts(res.data.data || []))
      .catch(() => {});
    axios.get('/school/settings')
      .then(res => setSchoolSettings(res.data.data || {}))
      .catch(() => {});
  };

  const handleOpenStudent = async (student) => {
    setSelectedStudent(student);
    setActiveTab('ACADEMIC');
    setLoadingDetails(true);
    try {
      const [billsRes, matRes, payRes] = await Promise.all([
        axios.get(`/bills/student/${student._id}`).catch(() => ({ data: { data: [] } })),
        axios.get(`/inventory/student/${student._id}`).catch(() => ({ data: { data: [] } })),
        axios.get(`/payments/student/${student._id}`).catch(() => ({ data: { data: [] } }))
      ]);
      setStudentBills(billsRes.data?.data || []);
      setStudentMaterials(matRes.data?.data || []);
      setStudentPayments(payRes.data?.data || []);
    } catch (err) {
      console.log('Error fetching student details:', err.message);
    } finally {
      setLoadingDetails(false);
    }
  };

  const reloadStudentDetails = async (studentId) => {
    try {
      const [billsRes, matRes, payRes] = await Promise.all([
        axios.get(`/bills/student/${studentId}`).catch(() => ({ data: { data: [] } })),
        axios.get(`/inventory/student/${studentId}`).catch(() => ({ data: { data: [] } })),
        axios.get(`/payments/student/${studentId}`).catch(() => ({ data: { data: [] } }))
      ]);
      setStudentBills(billsRes.data?.data || []);
      setStudentMaterials(matRes.data?.data || []);
      setStudentPayments(payRes.data?.data || []);
    } catch (e) {
      console.log('Reload err:', e.message);
    }
  };

  // Open Full Student Edit
  const handleOpenEdit = () => {
    if (!selectedStudent) return;
    setEditForm({
      firstName: selectedStudent.firstName || '',
      lastName: selectedStudent.lastName || '',
      rollNumber: selectedStudent.rollNumber || '',
      phone: selectedStudent.phone || '',
      attendancePercentage: (selectedStudent.attendancePercentage ?? 92).toString(),
      academicSession: selectedStudent.academicSession || '2026-2027',
      status: selectedStudent.status || 'Active',
      parentFullName: selectedStudent.parent?.fullName || '',
      parentMobile: selectedStudent.parent?.mobileNumber || '',
      parentEmail: selectedStudent.parent?.email || '',
      parentAddress: selectedStudent.parent?.address || ''
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    setSavingEdit(true);
    try {
      const payload = {
        firstName: editForm.firstName,
        lastName: editForm.lastName,
        rollNumber: editForm.rollNumber,
        phone: editForm.phone,
        attendancePercentage: parseFloat(editForm.attendancePercentage) || 0,
        academicSession: editForm.academicSession,
        status: editForm.status,
        parent: {
          fullName: editForm.parentFullName,
          mobileNumber: editForm.parentMobile,
          email: editForm.parentEmail,
          address: editForm.parentAddress
        }
      };

      const res = await axios.put(`/students/${selectedStudent._id}`, payload);
      const updated = res.data.data;
      setSelectedStudent(updated);
      Alert.alert('Success', 'Student information & attendance updated successfully!');
      setShowEditModal(false);
      fetchStudents();
    } catch (err) {
      Alert.alert('Error', err.response?.data?.error || err.message);
    } finally {
      setSavingEdit(false);
    }
  };

  // Quick Attendance Edit Save
  const handleSaveAttendanceQuick = async () => {
    const val = parseFloat(attendanceInput);
    if (isNaN(val) || val < 0 || val > 100) {
      return Alert.alert('Invalid', 'Enter attendance between 0 and 100%');
    }
    setSavingAttendance(true);
    try {
      const res = await axios.put(`/students/${selectedStudent._id}`, {
        attendancePercentage: val
      });
      setSelectedStudent({ ...selectedStudent, attendancePercentage: val });
      Alert.alert('Updated', `Attendance set to ${val}%`);
      setShowAttendanceEditModal(false);
      fetchStudents();
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setSavingAttendance(false);
    }
  };

  // Generate Single Bill
  const handleGenerateBill = async () => {
    const amountVal = parseFloat(billForm.amount);
    if (!amountVal || amountVal <= 0) {
      return Alert.alert('Invalid Amount', 'Please enter a valid bill amount');
    }

    setGeneratingBill(true);
    try {
      const payload = {
        studentId: selectedStudent._id,
        billType: billForm.billType,
        description: billForm.description,
        amount: Math.round(amountVal * 100), // in paise
        academicSession: selectedStudent.academicSession || '2026-2027',
        items: [
          {
            description: billForm.description || `${billForm.billType} Fee`,
            amount: Math.round(amountVal * 100),
            quantity: 1
          }
        ]
      };

      await axios.post('/bills/generate', payload);
      Alert.alert('Bill Generated!', `Created ${billForm.billType} bill for ₹${amountVal.toLocaleString('en-IN')}`);
      setShowBillModal(false);
      setBillForm({ billType: 'Tuition', description: 'Quarterly Tuition Fee', amount: '5000' });
      await reloadStudentDetails(selectedStudent._id);
    } catch (err) {
      Alert.alert('Error', err.response?.data?.error || err.message);
    } finally {
      setGeneratingBill(false);
    }
  };

  // Bulk Apply Fee to ALL Students
  const handleBulkApplyFee = async () => {
    const amountVal = parseFloat(bulkForm.amount);
    if (!amountVal || amountVal <= 0) {
      return Alert.alert('Invalid Amount', 'Please enter a valid amount');
    }

    setApplyingBulk(true);
    try {
      const payload = {
        billType: bulkForm.billType,
        description: bulkForm.description,
        amount: Math.round(amountVal * 100)
      };

      const res = await axios.post('/bills/bulk-all', payload);
      Alert.alert('Success!', res.data.message || `Updated fee of ₹${amountVal.toLocaleString('en-IN')} on all active students!`);
      setShowBulkModal(false);
      if (selectedStudent) {
        await reloadStudentDetails(selectedStudent._id);
      }
    } catch (err) {
      Alert.alert('Error', err.response?.data?.error || err.message);
    } finally {
      setApplyingBulk(false);
    }
  };

  // Open Payment Collection (Cash / UPI / Card / etc.)
  const handleOpenPaymentModal = (bill) => {
    setSelectedBillForPay(bill);
    setPaymentAmountInput(((bill.dueAmount || 0) / 100).toString());
    setSelectedPaymentMode('Cash');
    setShowCollectPaymentModal(true);
  };

  const handleConfirmPayment = async () => {
    const amountVal = parseFloat(paymentAmountInput);
    if (!amountVal || amountVal <= 0) {
      return Alert.alert('Invalid Amount', 'Please enter a valid payment amount');
    }

    const amountInPaise = Math.round(amountVal * 100);
    if (amountInPaise > selectedBillForPay.dueAmount) {
      return Alert.alert('Overpayment', 'Payment cannot exceed remaining due amount');
    }

    setRecordingPayment(true);
    try {
      const newPaid = (selectedBillForPay.paidAmount || 0) + amountInPaise;
      const newDue = Math.max(0, (selectedBillForPay.totalAmount || 0) - newPaid);
      const newStatus = newDue === 0 ? 'Paid' : 'Partially Paid';

      await axios.put(`/bills/${selectedBillForPay._id}`, {
        paidAmount: newPaid,
        dueAmount: newDue,
        status: newStatus
      });

      await axios.post('/payments/record-direct', {
        bill: selectedBillForPay._id,
        student: selectedStudent._id,
        amount: amountInPaise,
        paymentMode: selectedPaymentMode,
        notes: `Collected ${selectedPaymentMode} payment for Bill #${selectedBillForPay.billNumber}`
      }).catch(async () => {
        // Fallback standard payment
        await axios.post('/payments', {
          bill: selectedBillForPay._id,
          student: selectedStudent._id,
          amount: amountInPaise,
          paymentMode: selectedPaymentMode,
          status: 'Success',
          notes: `Collected ${selectedPaymentMode} payment`
        }).catch(() => {});
      });

      Alert.alert(
        'Payment Recorded!',
        `Recorded ₹${amountVal.toLocaleString('en-IN')} payment via ${selectedPaymentMode} for Bill #${selectedBillForPay.billNumber}`
      );
      setShowCollectPaymentModal(false);
      await reloadStudentDetails(selectedStudent._id);
    } catch (err) {
      Alert.alert('Payment Error', err.response?.data?.error || err.message);
    } finally {
      setRecordingPayment(false);
    }
  };

  // Open Edit Bill Modal
  const handleOpenEditBill = (bill) => {
    setBillBeingEdited(bill);
    setBillEditForm({
      totalAmount: ((bill.totalAmount || 0) / 100).toString(),
      paidAmount: ((bill.paidAmount || 0) / 100).toString(),
      dueAmount: ((bill.dueAmount || 0) / 100).toString(),
      status: bill.status || 'Unpaid'
    });
    setShowEditBillModal(true);
  };

  const handleSaveBillEdit = async () => {
    const totalVal = parseFloat(billEditForm.totalAmount);
    const paidVal = parseFloat(billEditForm.paidAmount);
    const dueVal = parseFloat(billEditForm.dueAmount);

    if (isNaN(totalVal) || isNaN(paidVal) || isNaN(dueVal)) {
      return Alert.alert('Invalid Input', 'Please enter valid numerical amounts');
    }

    setSavingBillEdit(true);
    try {
      const payload = {
        totalAmount: Math.round(totalVal * 100),
        payableAmount: Math.round(totalVal * 100),
        paidAmount: Math.round(paidVal * 100),
        dueAmount: Math.round(dueVal * 100),
        status: billEditForm.status
      };

      await axios.put(`/bills/${billBeingEdited._id}`, payload);
      Alert.alert('Bill Updated', 'Fee amount, paid amount and status updated successfully!');
      setShowEditBillModal(false);
      await reloadStudentDetails(selectedStudent._id);
    } catch (err) {
      Alert.alert('Update Error', err.response?.data?.error || err.message);
    } finally {
      setSavingBillEdit(false);
    }
  };

  // Issue Material to Student
  const handleOpenIssueMaterial = () => {
    if (inventoryProducts.length === 0) {
      fetchInventoryAndSettings();
    }
    setIssueForm({
      productId: inventoryProducts[0]?._id || '',
      quantity: '1',
      paymentMode: 'Cash',
      chargeOption: 'PAID'
    });
    setShowIssueMaterialModal(true);
  };

  const handleConfirmIssueMaterial = async () => {
    if (!issueForm.productId) {
      return Alert.alert('Select Product', 'Please select a product from inventory');
    }
    const qty = parseInt(issueForm.quantity, 10);
    if (!qty || qty <= 0) {
      return Alert.alert('Invalid Quantity', 'Please enter a valid quantity');
    }

    const prod = inventoryProducts.find(p => p._id === issueForm.productId);
    if (prod && prod.quantity < qty) {
      return Alert.alert('Low Stock', `Only ${prod.quantity} items available in stock`);
    }

    const unitPricePaise = prod ? prod.sellingPrice : 0;
    const totalCostPaise = unitPricePaise * qty;
    const amountPaidPaise = issueForm.chargeOption === 'PAID' ? totalCostPaise : 0;

    setIssuingMaterial(true);
    try {
      const payload = {
        studentId: selectedStudent._id,
        items: [{ productId: issueForm.productId, quantity: qty }],
        academicSession: selectedStudent.academicSession || '2026-2027',
        paymentMode: issueForm.paymentMode,
        amountPaid: amountPaidPaise
      };

      await axios.post('/inventory/issue', payload);
      Alert.alert(
        'Material Issued!',
        `Successfully issued ${qty}x ${prod?.name || 'Material'} to ${selectedStudent.firstName}. Inventory stock and fee records updated!`
      );
      setShowIssueMaterialModal(false);
      await reloadStudentDetails(selectedStudent._id);
      fetchInventoryAndSettings();
    } catch (err) {
      Alert.alert('Error', err.response?.data?.error || err.message);
    } finally {
      setIssuingMaterial(false);
    }
  };

  // Delete / Return Issued Material
  const handleDeleteIssuedItem = (item) => {
    Alert.alert(
      'Return School Material?',
      `Are you sure you want to return ${item.product?.name || 'this item'}? The stock will be restored to inventory and the fee record adjusted.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm Return',
          style: 'destructive',
          onPress: async () => {
            try {
              await axios.delete(`/inventory/issued/${item._id}`);
              Alert.alert('Returned', 'Material returned and inventory stock restored.');
              await reloadStudentDetails(selectedStudent._id);
              fetchInventoryAndSettings();
            } catch (e) {
              Alert.alert('Error', e.message);
            }
          }
        }
      ]
    );
  };

  // Class Categories for Horizontal Filter
  const classList = ['ALL'];
  students.forEach(s => {
    const cName = s.class?.name || (typeof s.class === 'string' ? s.class : '');
    if (cName && !classList.includes(cName)) {
      classList.push(cName);
    }
  });

  // Filtered Students List
  const filtered = students.filter(s => {
    const fullName = `${s.firstName || ''} ${s.lastName || ''}`.toLowerCase();
    const adm = (s.admissionNumber || '').toLowerCase();
    const ph = s.phone || '';
    const q = (search || '').toLowerCase();

    const matchesSearch = !q || fullName.includes(q) || adm.includes(q) || ph.includes(q);

    const sClass = s.class?.name || (typeof s.class === 'string' ? s.class : '');
    const matchesClass = selectedClassFilter === 'ALL' || sClass === selectedClassFilter;

    return matchesSearch && matchesClass;
  });

  // Financial calculations for the selected student
  const totalBilled = studentBills.reduce((sum, b) => sum + (b.totalAmount || 0), 0) / 100;
  const totalPaid = studentBills.reduce((sum, b) => sum + (b.paidAmount || 0), 0) / 100;
  const totalPending = studentBills.reduce((sum, b) => sum + (b.dueAmount || 0), 0) / 100;

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <View className="px-5 py-3 flex-1">
        {/* Header & Bulk Fee Button */}
        <View className="flex-row justify-between items-start mb-3">
          <View>
            <Text className="text-2xl font-black text-gray-900 mb-0.5">Student Directory</Text>
            <Text className="text-gray-400 font-bold text-xs">Enrolled Students, Fees & Materials</Text>
          </View>
          <TouchableOpacity
            onPress={() => setShowBulkModal(true)}
            className="bg-indigo-600 px-3 py-2 rounded-xl flex-row items-center shadow-sm"
          >
            <Zap size={14} color="white" />
            <Text className="text-white font-black text-xs ml-1.5">Edit All Fees</Text>
          </TouchableOpacity>
        </View>

        {/* Search Input */}
        <View className="bg-white flex-row items-center px-4 py-2.5 rounded-2xl shadow-sm mb-2.5 border border-gray-100">
          <Search size={18} color="#94a3b8" />
          <TextInput
            className="flex-1 ml-2 py-1 font-medium text-gray-800 text-sm"
            placeholder="Search student by name, admission # or phone..."
            value={search}
            onChangeText={setSearch}
          />
        </View>

        {/* Class Filter Horizontal Pills */}
        <View className="mb-3">
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
            {classList.map(c => {
              const count = c === 'ALL' ? students.length : students.filter(s => (s.class?.name || s.class) === c).length;
              const isSelected = selectedClassFilter === c;
              return (
                <TouchableOpacity
                  key={c}
                  onPress={() => setSelectedClassFilter(c)}
                  className={`px-3 py-1.5 rounded-xl mr-2 border flex-row items-center ${
                    isSelected ? 'bg-primary border-primary' : 'bg-white border-gray-200'
                  }`}
                >
                  <Text className={`font-bold text-xs ${isSelected ? 'text-white' : 'text-gray-700'}`}>
                    {c === 'ALL' ? 'All Classes' : `Class ${c}`}
                  </Text>
                  <View className={`ml-1.5 px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-blue-400/30' : 'bg-gray-100'}`}>
                    <Text className={`text-[10px] font-black ${isSelected ? 'text-white' : 'text-gray-500'}`}>
                      {count}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Students List */}
        <FlatList
          data={filtered}
          keyExtractor={item => item._id}
          ListEmptyComponent={
            <View className="bg-white p-8 rounded-3xl items-center mt-6">
              <User size={40} color="#cbd5e1" />
              <Text className="text-gray-500 font-bold mt-2">No students found</Text>
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => handleOpenStudent(item)}
              className="bg-white p-3.5 rounded-2xl mb-2.5 flex-row items-center justify-between shadow-sm border border-gray-100"
            >
              <View className="flex-row items-center flex-1 mr-2">
                <View className="h-11 w-11 bg-blue-100 rounded-xl items-center justify-center mr-3">
                  <Text className="text-blue-700 font-black text-base">{item.firstName[0]}</Text>
                </View>
                <View className="flex-1">
                  <Text className="font-bold text-gray-900 text-sm">{item.firstName} {item.lastName}</Text>
                  <Text className="text-[11px] text-gray-400 font-medium mt-0.5">
                    Class {item.class?.name || 'X'} • Sec {item.section?.name || 'A'} • #{item.admissionNumber}
                  </Text>
                  {item.phone && (
                    <Text className="text-[10px] text-blue-600 font-semibold mt-0.5">
                      📱 Phone: {item.phone}
                    </Text>
                  )}
                </View>
              </View>

              <View className="bg-blue-50 px-2.5 py-1.5 rounded-lg border border-blue-100 flex-row items-center">
                <Eye size={14} color="#1e3a8a" />
                <Text className="text-[11px] font-bold text-primary ml-1">Profile</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Main Student Profile & Ledger Overlay */}
      {selectedStudent && (
        <View style={StyleSheet.absoluteFillObject} className="z-40 justify-end bg-black/60">
          <View className="bg-white rounded-t-[32px] p-5 max-h-[92%]">
            {/* Modal Header */}
            <View className="flex-row justify-between items-center mb-3 pb-2 border-b border-gray-100">
              <View className="flex-row items-center gap-2">
                <Text className="text-lg font-black text-gray-900">Student Profile & Ledger</Text>
              </View>
              <View className="flex-row items-center gap-2">
                <TouchableOpacity
                  onPress={handleOpenEdit}
                  className="bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-200 flex-row items-center"
                >
                  <Edit3 size={14} color="#1e3a8a" />
                  <Text className="text-xs font-bold text-primary ml-1">Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setSelectedStudent(null)} className="p-2" hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}>
                  <X size={20} color="#64748b" />
                </TouchableOpacity>
              </View>
            </View>

            {selectedStudent && (
              <ScrollView showsVerticalScrollIndicator={false}>
                {/* Profile Card Header */}
                <View className="bg-blue-50 p-4 rounded-2xl mb-4 border border-blue-100 flex-row items-center">
                  <View className="h-14 w-14 bg-primary rounded-2xl items-center justify-center mr-3.5 shadow-sm">
                    <Text className="text-white font-black text-xl">{selectedStudent.firstName[0]}</Text>
                  </View>
                  <View className="flex-1">
                    <Text className="font-black text-gray-900 text-base">
                      {selectedStudent.firstName} {selectedStudent.lastName}
                    </Text>
                    <Text className="text-primary font-bold text-xs mt-0.5">
                      Class {selectedStudent.class?.name || 'X'} - Section {selectedStudent.section?.name || 'A'}
                    </Text>
                    <Text className="text-gray-400 text-[11px]">
                      Admission #{selectedStudent.admissionNumber} • Roll: {selectedStudent.rollNumber || '01'}
                    </Text>
                    {selectedStudent.phone && (
                      <Text className="text-blue-700 font-bold text-[11px] mt-0.5">
                        Login Phone: {selectedStudent.phone}
                      </Text>
                    )}
                  </View>
                </View>

                {/* Tab Switcher Pills */}
                <View className="flex-row bg-gray-100 p-1 rounded-xl mb-4">
                  <TouchableOpacity
                    onPress={() => setActiveTab('ACADEMIC')}
                    className={`flex-1 py-2 rounded-lg items-center ${activeTab === 'ACADEMIC' ? 'bg-white shadow-sm' : ''}`}
                  >
                    <Text className={`text-xs font-bold ${activeTab === 'ACADEMIC' ? 'text-primary font-black' : 'text-gray-500'}`}>
                      Academic
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setActiveTab('FEES')}
                    className={`flex-1 py-2 rounded-lg items-center ${activeTab === 'FEES' ? 'bg-white shadow-sm' : ''}`}
                  >
                    <Text className={`text-xs font-bold ${activeTab === 'FEES' ? 'text-primary font-black' : 'text-gray-500'}`}>
                      Fee ({studentBills.length})
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setActiveTab('MATERIALS')}
                    className={`flex-1 py-2 rounded-lg items-center ${activeTab === 'MATERIALS' ? 'bg-white shadow-sm' : ''}`}
                  >
                    <Text className={`text-xs font-bold ${activeTab === 'MATERIALS' ? 'text-primary font-black' : 'text-gray-500'}`}>
                      Materials ({studentMaterials.length})
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setActiveTab('TRANSACTIONS')}
                    className={`flex-1 py-2 rounded-lg items-center ${activeTab === 'TRANSACTIONS' ? 'bg-white shadow-sm' : ''}`}
                  >
                    <Text className={`text-xs font-bold ${activeTab === 'TRANSACTIONS' ? 'text-primary font-black' : 'text-gray-500'}`}>
                      Ledger ({studentPayments.length})
                    </Text>
                  </TouchableOpacity>
                </View>

                {loadingDetails ? (
                  <View className="py-8 items-center">
                    <ActivityIndicator size="small" color="#1e3a8a" />
                    <Text className="text-gray-400 text-xs mt-2">Loading student records...</Text>
                  </View>
                ) : (
                  <>
                    {/* TAB 1: ACADEMIC INFO & ATTENDANCE */}
                    {activeTab === 'ACADEMIC' && (
                      <View className="space-y-4">
                        <View className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                          <Text className="text-xs font-black text-gray-400 uppercase tracking-wider mb-2">School Status</Text>
                          <View className="flex-row justify-between py-1 border-b border-gray-100">
                            <Text className="text-xs text-gray-500">Academic Session</Text>
                            <Text className="text-xs font-bold text-gray-800">{selectedStudent.academicSession || '2026-2027'}</Text>
                          </View>
                          <View className="flex-row justify-between items-center py-2 border-b border-gray-100">
                            <Text className="text-xs text-gray-500">Attendance Percentage</Text>
                            <View className="flex-row items-center">
                              <Text className="text-xs font-black text-emerald-600 mr-2">
                                {selectedStudent.attendancePercentage ?? 92}%
                              </Text>
                              <TouchableOpacity
                                onPress={() => {
                                  setAttendanceInput((selectedStudent.attendancePercentage ?? 92).toString());
                                  setShowAttendanceEditModal(true);
                                }}
                                className="bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200"
                              >
                                <Text className="text-[10px] font-bold text-emerald-700">Edit</Text>
                              </TouchableOpacity>
                            </View>
                          </View>
                          <View className="flex-row justify-between py-1">
                            <Text className="text-xs text-gray-500">Enrollment Status</Text>
                            <Text className="text-xs font-bold text-blue-600">{selectedStudent.status || 'Active'}</Text>
                          </View>
                        </View>

                        <View className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                          <Text className="text-xs font-black text-gray-400 uppercase tracking-wider mb-2">Parent / Guardian</Text>
                          <View className="flex-row items-center mb-2">
                            <User size={14} color="#64748b" />
                            <Text className="text-xs font-bold text-gray-800 ml-2">{selectedStudent.parent?.fullName || 'Not recorded'}</Text>
                          </View>
                          <View className="flex-row items-center mb-2">
                            <Phone size={14} color="#64748b" />
                            <Text className="text-xs font-semibold text-gray-600 ml-2">{selectedStudent.parent?.mobileNumber || 'Not recorded'}</Text>
                          </View>
                          <View className="flex-row items-center mb-2">
                            <Mail size={14} color="#64748b" />
                            <Text className="text-xs font-semibold text-gray-600 ml-2">{selectedStudent.parent?.email || 'Not recorded'}</Text>
                          </View>
                          <View className="flex-row items-center">
                            <MapPin size={14} color="#64748b" />
                            <Text className="text-xs font-semibold text-gray-600 ml-2">{selectedStudent.parent?.address || 'Not recorded'}</Text>
                          </View>
                        </View>
                      </View>
                    )}

                    {/* TAB 2: FEES, PENDING DUES, PRINT BILL & EDIT BILL */}
                    {activeTab === 'FEES' && (
                      <View className="space-y-4">
                        {/* Financial Summary KPI */}
                        <View className="flex-row space-x-2">
                          <View className="flex-1 bg-blue-50 p-3 rounded-xl border border-blue-100">
                            <Text className="text-[10px] font-bold text-blue-600 uppercase">Total Billed</Text>
                            <Text className="text-base font-black text-gray-900 mt-0.5">₹{totalBilled.toLocaleString('en-IN')}</Text>
                          </View>
                          <View className="flex-1 bg-emerald-50 p-3 rounded-xl border border-emerald-100">
                            <Text className="text-[10px] font-bold text-emerald-600 uppercase">Paid Amount</Text>
                            <Text className="text-base font-black text-emerald-700 mt-0.5">₹{totalPaid.toLocaleString('en-IN')}</Text>
                          </View>
                          <View className="flex-1 bg-rose-50 p-3 rounded-xl border border-rose-100">
                            <Text className="text-[10px] font-bold text-rose-600 uppercase">Pending Due</Text>
                            <Text className={`text-base font-black mt-0.5 ${totalPending > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                              ₹{totalPending.toLocaleString('en-IN')}
                            </Text>
                          </View>
                        </View>

                        {/* Bill Generator Action Button */}
                        <TouchableOpacity
                          onPress={() => setShowBillModal(true)}
                          className="bg-primary p-3 rounded-xl flex-row items-center justify-center shadow-sm"
                        >
                          <PlusCircle size={16} color="white" />
                          <Text className="text-white font-bold text-xs ml-2">Generate New School Bill</Text>
                        </TouchableOpacity>

                        {/* Bills List with Print, PDF & Edit Fee Actions */}
                        <Text className="text-xs font-black text-gray-500 uppercase tracking-wider mt-2">
                          Demand Bills & Official Invoices
                        </Text>
                        {studentBills.length === 0 ? (
                          <View className="bg-gray-50 p-6 rounded-2xl items-center border border-gray-100">
                            <FileText size={24} color="#94a3b8" />
                            <Text className="text-gray-500 text-xs font-bold mt-2">No bills generated for this student</Text>
                          </View>
                        ) : (
                          studentBills.map(b => (
                            <View key={b._id} className="bg-white p-3.5 rounded-2xl border border-gray-200 shadow-sm mb-2.5">
                              <View className="flex-row justify-between items-start mb-1.5">
                                <View>
                                  <Text className="text-xs font-bold text-primary">{b.billNumber}</Text>
                                  <Text className="text-xs text-gray-700 font-bold mt-0.5">{b.billType || 'Tuition'} Fee</Text>
                                </View>
                                <View className="flex-row items-center gap-1.5">
                                  <TouchableOpacity
                                    onPress={() => handleOpenEditBill(b)}
                                    className="bg-gray-100 px-2 py-0.5 rounded border border-gray-300"
                                  >
                                    <Text className="text-[10px] font-bold text-gray-700">Edit Fee</Text>
                                  </TouchableOpacity>
                                  <View className={`px-2 py-0.5 rounded-full ${
                                    b.status === 'Paid' ? 'bg-emerald-100' :
                                    b.status === 'Partially Paid' ? 'bg-amber-100' : 'bg-rose-100'
                                  }`}>
                                    <Text className={`text-[10px] font-bold ${
                                      b.status === 'Paid' ? 'text-emerald-800' :
                                      b.status === 'Partially Paid' ? 'text-amber-800' : 'text-rose-800'
                                    }`}>
                                      {b.status}
                                    </Text>
                                  </View>
                                </View>
                              </View>

                              <View className="flex-row justify-between pt-1 border-t border-gray-100 text-xs mb-2">
                                <Text className="text-gray-500">Total: ₹{((b.totalAmount || 0) / 100).toLocaleString('en-IN')}</Text>
                                <Text className="text-emerald-600 font-semibold">Paid: ₹{((b.paidAmount || 0) / 100).toLocaleString('en-IN')}</Text>
                                <Text className="font-bold text-rose-600">Due: ₹{((b.dueAmount || 0) / 100).toLocaleString('en-IN')}</Text>
                              </View>

                              {/* Action Row: Print, Download PDF & Collect Payment */}
                              <View className="flex-row space-x-2 pt-2 border-t border-gray-100">
                                <TouchableOpacity
                                  onPress={() => printBill(b, selectedStudent, schoolSettings)}
                                  className="flex-1 bg-slate-800 py-1.5 px-2 rounded-lg flex-row items-center justify-center"
                                >
                                  <Printer size={12} color="white" />
                                  <Text className="text-white font-bold text-[11px] ml-1">Print</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                  onPress={() => downloadBillPdf(b, selectedStudent, schoolSettings)}
                                  className="flex-1 bg-blue-600 py-1.5 px-2 rounded-lg flex-row items-center justify-center"
                                >
                                  <Download size={12} color="white" />
                                  <Text className="text-white font-bold text-[11px] ml-1">PDF</Text>
                                </TouchableOpacity>

                                {b.dueAmount > 0 && (
                                  <TouchableOpacity
                                    onPress={() => handleOpenPaymentModal(b)}
                                    className="flex-1 bg-emerald-600 py-1.5 px-2 rounded-lg flex-row items-center justify-center"
                                  >
                                    <DollarSign size={12} color="white" />
                                    <Text className="text-white font-bold text-[11px] ml-1">Collect</Text>
                                  </TouchableOpacity>
                                )}
                              </View>
                            </View>
                          ))
                        )}
                      </View>
                    )}

                    {/* TAB 3: ISSUED MATERIALS & INVENTORY STATUS (ADD & RETURN ITEMS) */}
                    {activeTab === 'MATERIALS' && (
                      <View className="space-y-4">
                        <View className="flex-row justify-between items-center">
                          <Text className="text-xs font-black text-gray-500 uppercase tracking-wider">
                            School Materials Issued
                          </Text>
                          <TouchableOpacity
                            onPress={handleOpenIssueMaterial}
                            className="bg-purple-600 px-3 py-1.5 rounded-xl flex-row items-center shadow-xs"
                          >
                            <PlusCircle size={13} color="white" />
                            <Text className="text-white font-black text-xs ml-1">Issue Material</Text>
                          </TouchableOpacity>
                        </View>

                        {studentMaterials.length === 0 ? (
                          <View className="bg-gray-50 p-6 rounded-2xl items-center border border-gray-100">
                            <Package size={28} color="#94a3b8" />
                            <Text className="text-gray-700 font-bold text-xs mt-2">No items issued yet</Text>
                            <Text className="text-gray-400 text-[11px] text-center mt-0.5">
                              Tap "+ Issue Material" above to add books, uniform, bag or shoes from inventory.
                            </Text>
                          </View>
                        ) : (
                          studentMaterials.map(m => (
                            <View key={m._id} className="bg-white p-3.5 rounded-2xl border border-gray-200 shadow-sm mb-2.5">
                              <View className="flex-row justify-between items-center mb-1">
                                <Text className="font-bold text-gray-900 text-xs flex-1 mr-2">
                                  {m.product?.name || 'School Material'}
                                </Text>
                                <View className="flex-row items-center gap-1.5">
                                  <View className={`px-2 py-0.5 rounded-full ${
                                    m.bill?.status === 'Paid' ? 'bg-emerald-100' : 'bg-amber-100'
                                  }`}>
                                    <Text className={`text-[10px] font-bold ${
                                      m.bill?.status === 'Paid' ? 'text-emerald-800' : 'text-amber-800'
                                    }`}>
                                      {m.bill?.status === 'Paid' ? 'PAID' : 'PENDING'}
                                    </Text>
                                  </View>
                                  <TouchableOpacity
                                    onPress={() => handleDeleteIssuedItem(m)}
                                    className="p-1 bg-rose-50 rounded border border-rose-200"
                                  >
                                    <Trash2 size={12} color="#e11d48" />
                                  </TouchableOpacity>
                                </View>
                              </View>

                              <View className="flex-row justify-between text-xs text-gray-500 mt-1">
                                <Text className="text-[11px]">Quantity: <Text className="font-bold text-gray-800">{m.quantity}</Text></Text>
                                <Text className="text-[11px] font-semibold text-emerald-600">
                                  Amount: ₹{((m.totalPrice || 0) / 100).toLocaleString('en-IN')}
                                </Text>
                              </View>

                              <Text className="text-[10px] text-gray-400 mt-1">
                                Issued: {new Date(m.issueDate || m.createdAt).toLocaleDateString()}
                              </Text>
                            </View>
                          ))
                        )}
                      </View>
                    )}

                    {/* TAB 4: TRANSACTION HISTORY (CASH, UPI & ONLINE RECEIPTS) */}
                    {activeTab === 'TRANSACTIONS' && (
                      <View className="space-y-4">
                        <Text className="text-xs font-black text-gray-500 uppercase tracking-wider">
                          Payment Receipts & History
                        </Text>
                        {studentPayments.length === 0 ? (
                          <View className="bg-gray-50 p-6 rounded-2xl items-center border border-gray-100">
                            <IndianRupee size={28} color="#94a3b8" />
                            <Text className="text-gray-700 font-bold text-xs mt-2">No payment transactions yet</Text>
                            <Text className="text-gray-400 text-[11px] text-center mt-0.5">
                              Payments made in cash, UPI or online will appear here with receipt details.
                            </Text>
                          </View>
                        ) : (
                          studentPayments.map(p => (
                            <View key={p._id} className="bg-white p-3.5 rounded-2xl border border-gray-200 shadow-sm mb-2.5">
                              <View className="flex-row justify-between items-start mb-1">
                                <View>
                                  <Text className="text-xs font-black text-gray-900">{p.paymentNumber}</Text>
                                  <Text className="text-[11px] text-gray-400 mt-0.5">
                                    {new Date(p.paymentDate || p.createdAt).toLocaleString()}
                                  </Text>
                                </View>
                                <View className={`px-2 py-0.5 rounded-full ${
                                  p.paymentMode === 'Cash' ? 'bg-emerald-100' :
                                  p.paymentMode === 'UPI' ? 'bg-purple-100' : 'bg-blue-100'
                                }`}>
                                  <Text className={`text-[10px] font-black ${
                                    p.paymentMode === 'Cash' ? 'text-emerald-800' :
                                    p.paymentMode === 'UPI' ? 'text-purple-800' : 'text-blue-800'
                                  }`}>
                                    {p.paymentMode.toUpperCase()}
                                  </Text>
                                </View>
                              </View>

                              <View className="flex-row justify-between items-center pt-2 border-t border-gray-100">
                                <Text className="text-xs text-gray-600 font-medium">{p.notes || 'School payment'}</Text>
                                <Text className="text-sm font-black text-emerald-600">
                                  +₹{(p.amount / 100).toLocaleString('en-IN')}
                                </Text>
                              </View>
                            </View>
                          ))
                        )}
                      </View>
                    )}
                  </>
                )}

                <TouchableOpacity
                  onPress={() => setSelectedStudent(null)}
                  className="bg-gray-200 py-3 rounded-xl mt-6 mb-4"
                >
                  <Text className="text-gray-700 text-center font-bold text-xs">Close</Text>
                </TouchableOpacity>
              </ScrollView>
            )}
          </View>
        </View>
      )}

      {/* Edit Student Information Overlay */}
      {showEditModal && (
        <View style={StyleSheet.absoluteFillObject} className="z-50 justify-end bg-black/60">
          <View className="bg-white rounded-t-[32px] p-5 max-h-[90%]">
            <View className="flex-row justify-between items-center mb-4 pb-2 border-b border-gray-100">
              <Text className="text-lg font-black text-gray-900">Edit Student Information</Text>
              <TouchableOpacity onPress={() => setShowEditModal(false)} className="p-2" hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}>
                <X size={20} color="#64748b" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text className="text-xs font-black uppercase text-gray-400 tracking-wider mb-2">Student Info</Text>
              
              <View className="flex-row space-x-2 mb-2.5">
                <View className="flex-1">
                  <Text className="text-[10px] font-bold text-gray-600 mb-1">First Name *</Text>
                  <TextInput
                    value={editForm.firstName}
                    onChangeText={t => setEditForm({ ...editForm, firstName: t })}
                    className="border border-gray-200 px-3 py-2 rounded-xl text-xs bg-gray-50"
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-[10px] font-bold text-gray-600 mb-1">Last Name *</Text>
                  <TextInput
                    value={editForm.lastName}
                    onChangeText={t => setEditForm({ ...editForm, lastName: t })}
                    className="border border-gray-200 px-3 py-2 rounded-xl text-xs bg-gray-50"
                  />
                </View>
              </View>

              <View className="flex-row space-x-2 mb-2.5">
                <View className="flex-1">
                  <Text className="text-[10px] font-bold text-gray-600 mb-1">Student Phone (Login ID)</Text>
                  <TextInput
                    value={editForm.phone}
                    onChangeText={t => setEditForm({ ...editForm, phone: t })}
                    placeholder="Student Mobile Number"
                    keyboardType="phone-pad"
                    className="border border-gray-200 px-3 py-2 rounded-xl text-xs bg-gray-50"
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-[10px] font-bold text-emerald-600 mb-1">Attendance Percentage (%) *</Text>
                  <TextInput
                    value={editForm.attendancePercentage}
                    onChangeText={t => setEditForm({ ...editForm, attendancePercentage: t })}
                    placeholder="92"
                    keyboardType="numeric"
                    className="border border-emerald-300 px-3 py-2 rounded-xl text-xs bg-emerald-50 font-black text-emerald-800"
                  />
                </View>
              </View>

              <View className="flex-row space-x-2 mb-4">
                <View className="flex-1">
                  <Text className="text-[10px] font-bold text-gray-600 mb-1">Roll Number</Text>
                  <TextInput
                    value={editForm.rollNumber}
                    onChangeText={t => setEditForm({ ...editForm, rollNumber: t })}
                    className="border border-gray-200 px-3 py-2 rounded-xl text-xs bg-gray-50"
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-[10px] font-bold text-gray-600 mb-1">Session</Text>
                  <TextInput
                    value={editForm.academicSession}
                    onChangeText={t => setEditForm({ ...editForm, academicSession: t })}
                    className="border border-gray-200 px-3 py-2 rounded-xl text-xs bg-gray-50"
                  />
                </View>
              </View>

              <Text className="text-xs font-black uppercase text-gray-400 tracking-wider mb-2">Parent / Guardian Info</Text>

              <View className="mb-2.5">
                <Text className="text-[10px] font-bold text-gray-600 mb-1">Parent Full Name</Text>
                <TextInput
                  value={editForm.parentFullName}
                  onChangeText={t => setEditForm({ ...editForm, parentFullName: t })}
                  className="border border-gray-200 px-3 py-2 rounded-xl text-xs bg-gray-50"
                />
              </View>

              <View className="mb-2.5">
                <Text className="text-[10px] font-bold text-gray-600 mb-1">Parent Mobile Number</Text>
                <TextInput
                  value={editForm.parentMobile}
                  onChangeText={t => setEditForm({ ...editForm, parentMobile: t })}
                  className="border border-gray-200 px-3 py-2 rounded-xl text-xs bg-gray-50"
                  keyboardType="phone-pad"
                />
              </View>

              <View className="mb-2.5">
                <Text className="text-[10px] font-bold text-gray-600 mb-1">Parent Email</Text>
                <TextInput
                  value={editForm.parentEmail}
                  onChangeText={t => setEditForm({ ...editForm, parentEmail: t })}
                  className="border border-gray-200 px-3 py-2 rounded-xl text-xs bg-gray-50"
                  keyboardType="email-address"
                />
              </View>

              <View className="mb-5">
                <Text className="text-[10px] font-bold text-gray-600 mb-1">Address</Text>
                <TextInput
                  value={editForm.parentAddress}
                  onChangeText={t => setEditForm({ ...editForm, parentAddress: t })}
                  className="border border-gray-200 px-3 py-2 rounded-xl text-xs bg-gray-50"
                  multiline
                />
              </View>

              <TouchableOpacity
                onPress={handleSaveEdit}
                disabled={savingEdit}
                className="bg-primary py-3 rounded-xl mb-4 shadow-sm items-center"
              >
                {savingEdit ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text className="text-white font-bold text-xs">Save Changes</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      )}

      {/* Quick Attendance Edit Modal */}
      {showAttendanceEditModal && (
        <View style={StyleSheet.absoluteFillObject} className="z-50 justify-end bg-black/60">
          <View className="bg-white rounded-t-[32px] p-5">
            <View className="flex-row justify-between items-center mb-3 pb-2 border-b border-gray-100">
              <Text className="text-base font-black text-gray-900">Update Attendance Percentage</Text>
              <TouchableOpacity onPress={() => setShowAttendanceEditModal(false)} className="p-2">
                <X size={18} color="#64748b" />
              </TouchableOpacity>
            </View>

            <Text className="text-xs text-gray-500 mb-2">
              Set attendance % for {selectedStudent?.firstName} {selectedStudent?.lastName}
            </Text>

            <TextInput
              value={attendanceInput}
              onChangeText={setAttendanceInput}
              keyboardType="numeric"
              placeholder="e.g. 95"
              className="border border-emerald-300 px-3 py-2 rounded-xl text-lg font-black text-emerald-800 bg-emerald-50 mb-4"
            />

            <TouchableOpacity
              onPress={handleSaveAttendanceQuick}
              disabled={savingAttendance}
              className="bg-emerald-600 py-3 rounded-xl items-center mb-2"
            >
              {savingAttendance ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text className="text-white font-bold text-xs">Save Attendance</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Issue Material to Student Modal */}
      {showIssueMaterialModal && (
        <View style={StyleSheet.absoluteFillObject} className="z-50 justify-end bg-black/60">
          <View className="bg-white rounded-t-[32px] p-5 max-h-[85%]">
            <View className="flex-row justify-between items-center mb-3 pb-2 border-b border-gray-100">
              <View>
                <Text className="text-base font-black text-gray-900">Issue School Material</Text>
                <Text className="text-xs text-gray-400">To {selectedStudent?.firstName} {selectedStudent?.lastName}</Text>
              </View>
              <TouchableOpacity onPress={() => setShowIssueMaterialModal(false)} className="p-2">
                <X size={20} color="#64748b" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Product Selector */}
              <Text className="text-[10px] font-bold text-gray-600 mb-1">Select Inventory Product *</Text>
              <View className="space-y-2 mb-3">
                {inventoryProducts.length === 0 ? (
                  <Text className="text-xs text-gray-400">No inventory products available.</Text>
                ) : (
                  inventoryProducts.map(p => {
                    const isSelected = issueForm.productId === p._id;
                    const priceRs = Math.round((p.sellingPrice || 0) / 100);
                    return (
                      <TouchableOpacity
                        key={p._id}
                        onPress={() => setIssueForm({ ...issueForm, productId: p._id })}
                        className={`p-3 rounded-xl border flex-row justify-between items-center ${
                          isSelected ? 'bg-purple-50 border-purple-600' : 'bg-gray-50 border-gray-200'
                        }`}
                      >
                        <View className="flex-1 mr-2">
                          <Text className={`font-bold text-xs ${isSelected ? 'text-purple-900' : 'text-gray-800'}`}>
                            {p.name}
                          </Text>
                          <Text className="text-[10px] text-gray-400">Stock: {p.quantity} units</Text>
                        </View>
                        <Text className="font-black text-xs text-purple-700">₹{priceRs}</Text>
                      </TouchableOpacity>
                    );
                  })
                )}
              </View>

              {/* Quantity */}
              <View className="mb-3">
                <Text className="text-[10px] font-bold text-gray-600 mb-1">Quantity *</Text>
                <TextInput
                  value={issueForm.quantity}
                  onChangeText={q => setIssueForm({ ...issueForm, quantity: q })}
                  keyboardType="numeric"
                  className="border border-gray-200 px-3 py-2 rounded-xl text-xs bg-gray-50 font-bold"
                />
              </View>

              {/* Payment / Billing Option */}
              <View className="mb-3">
                <Text className="text-[10px] font-bold text-gray-600 mb-1">Payment Method *</Text>
                <View className="flex-row gap-2">
                  {['Cash', 'UPI', 'Add to Bill'].map(opt => (
                    <TouchableOpacity
                      key={opt}
                      onPress={() => setIssueForm({
                        ...issueForm,
                        paymentMode: opt === 'Add to Bill' ? 'Cash' : opt,
                        chargeOption: opt === 'Add to Bill' ? 'DUE' : 'PAID'
                      })}
                      className={`flex-1 py-2 rounded-xl border items-center ${
                        (opt === 'Add to Bill' && issueForm.chargeOption === 'DUE') ||
                        (opt !== 'Add to Bill' && issueForm.paymentMode === opt && issueForm.chargeOption === 'PAID')
                          ? 'bg-purple-600 border-purple-600'
                          : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <Text className={`text-xs font-bold ${
                        (opt === 'Add to Bill' && issueForm.chargeOption === 'DUE') ||
                        (opt !== 'Add to Bill' && issueForm.paymentMode === opt && issueForm.chargeOption === 'PAID')
                          ? 'text-white'
                          : 'text-gray-700'
                      }`}>
                        {opt}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <TouchableOpacity
                onPress={handleConfirmIssueMaterial}
                disabled={issuingMaterial}
                className="bg-purple-600 py-3.5 rounded-2xl items-center shadow-sm mb-4"
              >
                {issuingMaterial ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text className="text-white font-black text-xs">Issue Material & Update Stock</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      )}

      {/* Bill Generator Overlay */}
      {showBillModal && (
        <View style={StyleSheet.absoluteFillObject} className="z-50 justify-end bg-black/60">
          <View className="bg-white rounded-t-[32px] p-5">
            <View className="flex-row justify-between items-center mb-4 pb-2 border-b border-gray-100">
              <View>
                <Text className="text-lg font-black text-gray-900">Generate School Bill</Text>
                <Text className="text-xs text-gray-400">For {selectedStudent?.firstName} {selectedStudent?.lastName}</Text>
              </View>
              <TouchableOpacity onPress={() => setShowBillModal(false)} className="p-2" hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}>
                <X size={20} color="#64748b" />
              </TouchableOpacity>
            </View>

            <View className="space-y-3 mb-5">
              <View>
                <Text className="text-[10px] font-bold text-gray-600 mb-1">Bill / Fee Type *</Text>
                <View className="flex-row flex-wrap gap-2">
                  {['Tuition', 'Examination', 'Admission', 'Uniform', 'Books', 'Transport'].map(t => (
                    <TouchableOpacity
                      key={t}
                      onPress={() => setBillForm({ ...billForm, billType: t, description: `${t} Fee` })}
                      className={`px-3 py-1.5 rounded-lg border ${billForm.billType === t ? 'bg-primary border-primary' : 'bg-gray-50 border-gray-200'}`}
                    >
                      <Text className={`text-xs font-bold ${billForm.billType === t ? 'text-white' : 'text-gray-700'}`}>
                        {t}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View>
                <Text className="text-[10px] font-bold text-gray-600 mb-1">Description *</Text>
                <TextInput
                  value={billForm.description}
                  onChangeText={t => setBillForm({ ...billForm, description: t })}
                  placeholder="e.g. Tuition Fee - October to December"
                  className="border border-gray-200 px-3 py-2 rounded-xl text-xs bg-gray-50"
                />
              </View>

              <View>
                <Text className="text-[10px] font-bold text-gray-600 mb-1">Bill Amount (₹) *</Text>
                <TextInput
                  value={billForm.amount}
                  onChangeText={t => setBillForm({ ...billForm, amount: t })}
                  placeholder="5000"
                  keyboardType="numeric"
                  className="border border-gray-200 px-3 py-2 rounded-xl text-sm font-bold text-emerald-600 bg-gray-50"
                />
              </View>
            </View>

            <TouchableOpacity
              onPress={handleGenerateBill}
              disabled={generatingBill}
              className="bg-emerald-600 py-3 rounded-xl mb-3 shadow-sm items-center"
            >
              {generatingBill ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text className="text-white font-bold text-xs">Create Official School Bill</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Bulk Fee Update Overlay (Apply to All Students at Once) */}
      {showBulkModal && (
        <View style={StyleSheet.absoluteFillObject} className="z-50 justify-end bg-black/60">
          <View className="bg-white rounded-t-[32px] p-5">
            <View className="flex-row justify-between items-center mb-3 pb-2 border-b border-gray-100">
              <View>
                <Text className="text-lg font-black text-gray-900">Bulk Fee Update (All Students)</Text>
                <Text className="text-xs text-gray-400">Assign fee to every enrolled active student at once</Text>
              </View>
              <TouchableOpacity onPress={() => setShowBulkModal(false)} className="p-2" hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}>
                <X size={20} color="#64748b" />
              </TouchableOpacity>
            </View>

            <View className="space-y-3 mb-5">
              <View>
                <Text className="text-[10px] font-bold text-gray-600 mb-1">Fee Type *</Text>
                <View className="flex-row flex-wrap gap-2">
                  {['Tuition', 'Examination', 'Annual', 'Sports', 'Activity'].map(t => (
                    <TouchableOpacity
                      key={t}
                      onPress={() => setBulkForm({ ...bulkForm, billType: t, description: `${t} Fee 2026-2027` })}
                      className={`px-3 py-1.5 rounded-lg border ${bulkForm.billType === t ? 'bg-indigo-600 border-indigo-600' : 'bg-gray-50 border-gray-200'}`}
                    >
                      <Text className={`text-xs font-bold ${bulkForm.billType === t ? 'text-white' : 'text-gray-700'}`}>
                        {t}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View>
                <Text className="text-[10px] font-bold text-gray-600 mb-1">Description *</Text>
                <TextInput
                  value={bulkForm.description}
                  onChangeText={t => setBulkForm({ ...bulkForm, description: t })}
                  placeholder="e.g. Annual School Fee 2026-2027"
                  className="border border-gray-200 px-3 py-2 rounded-xl text-xs bg-gray-50"
                />
              </View>

              <View>
                <Text className="text-[10px] font-bold text-gray-600 mb-1">Fee Amount For Every Student (₹) *</Text>
                <TextInput
                  value={bulkForm.amount}
                  onChangeText={t => setBulkForm({ ...bulkForm, amount: t })}
                  placeholder="5000"
                  keyboardType="numeric"
                  className="border border-indigo-200 px-3 py-2.5 rounded-xl text-base font-black text-indigo-700 bg-indigo-50"
                />
              </View>
            </View>

            <TouchableOpacity
              onPress={handleBulkApplyFee}
              disabled={applyingBulk}
              className="bg-indigo-600 py-3.5 rounded-2xl shadow-sm items-center flex-row justify-center mb-3"
            >
              {applyingBulk ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <>
                  <Zap size={16} color="white" />
                  <Text className="text-white font-black text-xs ml-1.5">Apply to All Students Now</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Collect Payment Overlay (Cash / UPI / Card / Net Banking) */}
      {showCollectPaymentModal && (
        <View style={StyleSheet.absoluteFillObject} className="z-50 justify-end bg-black/60">
          <View className="bg-white rounded-t-[32px] p-5">
            <View className="flex-row justify-between items-center mb-3 pb-2 border-b border-gray-100">
              <View>
                <Text className="text-lg font-black text-gray-900">Collect Fee Payment</Text>
                <Text className="text-xs text-gray-400">Bill #{selectedBillForPay?.billNumber}</Text>
              </View>
              <TouchableOpacity onPress={() => setShowCollectPaymentModal(false)} className="p-2" hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}>
                <X size={20} color="#64748b" />
              </TouchableOpacity>
            </View>

            <View className="bg-emerald-50 p-3 rounded-2xl mb-3 border border-emerald-100">
              <Text className="text-xs text-emerald-800 font-medium">Student: {selectedStudent?.firstName} {selectedStudent?.lastName}</Text>
              <Text className="text-xs font-black text-emerald-800 mt-1">
                Remaining Due: ₹{selectedBillForPay ? ((selectedBillForPay.dueAmount || 0) / 100).toLocaleString('en-IN') : 0}
              </Text>
            </View>

            {/* Payment Mode Selector */}
            <Text className="text-[10px] font-bold text-gray-600 mb-1.5">Select Payment Method *</Text>
            <View className="flex-row flex-wrap gap-2 mb-3">
              {['Cash', 'UPI', 'Card', 'Net Banking'].map(m => (
                <TouchableOpacity
                  key={m}
                  onPress={() => setSelectedPaymentMode(m)}
                  className={`px-3 py-1.5 rounded-xl border ${
                    selectedPaymentMode === m ? 'bg-primary border-primary' : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <Text className={`text-xs font-bold ${selectedPaymentMode === m ? 'text-white' : 'text-gray-700'}`}>
                    {m}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* UPI QR Display if UPI is selected */}
            {selectedPaymentMode === 'UPI' && (
              <View className="bg-purple-50 p-3 rounded-2xl border border-purple-200 mb-3 items-center">
                <View className="flex-row items-center mb-1">
                  <QrCode size={18} color="#7e22ce" />
                  <Text className="ml-1.5 font-black text-xs text-purple-900">Scan & Pay via School UPI</Text>
                </View>
                <Text className="text-xs font-bold text-purple-800 bg-white px-3 py-1 rounded-lg border border-purple-300 mb-1">
                  {schoolSettings?.upiId || 'stmichel@upi'}
                </Text>
                <Text className="text-[10px] text-purple-600 font-medium text-center">
                  Parents & students can scan using Google Pay, PhonePe, Paytm, or BHIM.
                </Text>
              </View>
            )}

            <View className="mb-4">
              <Text className="text-[10px] font-bold text-gray-600 mb-1">Amount to Collect (₹) *</Text>
              <TextInput
                value={paymentAmountInput}
                onChangeText={setPaymentAmountInput}
                keyboardType="numeric"
                className="border border-emerald-300 px-3.5 py-2.5 rounded-xl text-lg font-black text-emerald-700 bg-white"
              />
            </View>

            <TouchableOpacity
              onPress={handleConfirmPayment}
              disabled={recordingPayment}
              className="bg-emerald-600 py-3.5 rounded-2xl shadow-sm items-center mb-3 flex-row justify-center"
            >
              {recordingPayment ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <>
                  <CheckCircle2 size={16} color="white" />
                  <Text className="text-white font-black text-xs ml-1">Confirm {selectedPaymentMode} Payment</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Edit Bill Details Overlay (Total, Paid, Due, Status) */}
      {showEditBillModal && (
        <View style={StyleSheet.absoluteFillObject} className="z-50 justify-end bg-black/60">
          <View className="bg-white rounded-t-[32px] p-5">
            <View className="flex-row justify-between items-center mb-3 pb-2 border-b border-gray-100">
              <View>
                <Text className="text-lg font-black text-gray-900">Edit Bill Details</Text>
                <Text className="text-xs text-gray-400">Directly adjust fee, paid and pending dues</Text>
              </View>
              <TouchableOpacity onPress={() => setShowEditBillModal(false)} className="p-2" hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}>
                <X size={20} color="#64748b" />
              </TouchableOpacity>
            </View>

            <View className="space-y-3 mb-4">
              <View>
                <Text className="text-[10px] font-bold text-gray-600 mb-1">Total Fee Amount (₹) *</Text>
                <TextInput
                  value={billEditForm.totalAmount}
                  onChangeText={t => setBillEditForm({ ...billEditForm, totalAmount: t })}
                  keyboardType="numeric"
                  className="border border-gray-200 px-3 py-2 rounded-xl text-xs bg-gray-50 font-bold"
                />
              </View>

              <View>
                <Text className="text-[10px] font-bold text-gray-600 mb-1">Paid Amount (₹) *</Text>
                <TextInput
                  value={billEditForm.paidAmount}
                  onChangeText={t => setBillEditForm({ ...billEditForm, paidAmount: t })}
                  keyboardType="numeric"
                  className="border border-emerald-200 px-3 py-2 rounded-xl text-xs bg-emerald-50 font-bold text-emerald-700"
                />
              </View>

              <View>
                <Text className="text-[10px] font-bold text-gray-600 mb-1">Pending Due Amount (₹) *</Text>
                <TextInput
                  value={billEditForm.dueAmount}
                  onChangeText={t => setBillEditForm({ ...billEditForm, dueAmount: t })}
                  keyboardType="numeric"
                  className="border border-rose-200 px-3 py-2 rounded-xl text-xs bg-rose-50 font-bold text-rose-600"
                />
              </View>

              <View>
                <Text className="text-[10px] font-bold text-gray-600 mb-1">Payment Status *</Text>
                <View className="flex-row gap-2">
                  {['Paid', 'Partially Paid', 'Unpaid'].map(s => (
                    <TouchableOpacity
                      key={s}
                      onPress={() => setBillEditForm({ ...billEditForm, status: s })}
                      className={`px-3 py-1.5 rounded-lg border ${billEditForm.status === s ? 'bg-primary border-primary' : 'bg-gray-50 border-gray-200'}`}
                    >
                      <Text className={`text-xs font-bold ${billEditForm.status === s ? 'text-white' : 'text-gray-700'}`}>{s}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>

            <TouchableOpacity
              onPress={handleSaveBillEdit}
              disabled={savingBillEdit}
              className="bg-primary py-3 rounded-xl mb-3 shadow-sm items-center"
            >
              {savingBillEdit ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text className="text-white font-bold text-xs">Save Bill Updates</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

export default StudentsScreen;
