import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  Modal
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import {
  User,
  BookOpen,
  Users,
  Package,
  IndianRupee,
  CheckCircle2,
  Calendar,
  Phone,
  Plus,
  Minus,
  FileText,
  X,
  CreditCard,
  Printer,
  Download,
  QrCode
} from 'lucide-react-native';
import axios from '../api/axios';
import { printBill, downloadBillPdf } from '../utils/billPdfGenerator';

const AdmissionScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedSection, setSelectedSection] = useState(null);
  const [schoolSettings, setSchoolSettings] = useState(null);

  // Available Inventory Products
  const [availableProducts, setAvailableProducts] = useState([]);
  const [selectedKit, setSelectedKit] = useState({}); // { [productId]: quantity }

  // Form State
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '', // Student mobile number (App login)
    dateOfBirth: '2014-05-15',
    admissionDate: new Date().toISOString().split('T')[0],
    gender: 'Male',
    admissionNumber: `STU${Date.now().toString().slice(-6)}`,
    academicSession: '2026-2027',
    admissionFee: '5000', // in Rupees
    paymentMode: 'Cash', // 'Cash', 'UPI', 'Online', 'Bank Transfer'
    amountPaid: '5000', // in Rupees
    parentData: {
      fullName: '',
      mobileNumber: '',
      email: '',
      address: 'City Center, St. Michel Road',
    }
  });

  // Success Bill Modal
  const [createdBillResult, setCreatedBillResult] = useState(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);

  useFocusEffect(
    useCallback(() => {
      fetchInitialData();
    }, [])
  );

  const fetchInitialData = async () => {
    try {
      const [classRes, prodRes, setRes] = await Promise.all([
        axios.get('/classes').catch(() => ({ data: { data: [] } })),
        axios.get('/inventory/products').catch(() => ({ data: { data: [] } })),
        axios.get('/school/settings').catch(() => ({ data: { data: {} } }))
      ]);

      const clsList = classRes.data.data || [];
      setClasses(clsList);
      if (clsList.length > 0 && !selectedClass) {
        handleClassSelect(clsList[0]);
      }

      setAvailableProducts(prodRes.data.data || []);
      setSchoolSettings(setRes.data.data || null);
    } catch (err) {
      console.log('Error fetching initial admission data:', err.message);
    }
  };

  const handleClassSelect = async (cls) => {
    setSelectedClass(cls);
    setSelectedSection(null);
    try {
      const res = await axios.get(`/classes/${cls._id}/sections`);
      const secList = res.data.data || [];
      setSections(secList);
      if (secList.length > 0) {
        setSelectedSection(secList[0]);
      }
    } catch (err) {
      console.log('Fetch sections err:', err.message);
    }
  };

  const updateKitQuantity = (productId, delta) => {
    setSelectedKit(prev => {
      const current = prev[productId] || 0;
      const next = Math.max(0, current + delta);
      if (next === 0) {
        const copy = { ...prev };
        delete copy[productId];
        return copy;
      }
      return { ...prev, [productId]: next };
    });
  };

  // Calculations for Admission Bill
  const admissionFeeVal = parseFloat(formData.admissionFee) || 0;
  const materialsTotal = Object.entries(selectedKit).reduce((sum, [pId, qty]) => {
    const prod = availableProducts.find(p => p._id === pId);
    return sum + (prod ? (prod.sellingPrice / 100) * qty : 0);
  }, 0);
  const totalAdmissionBill = admissionFeeVal + materialsTotal;
  const paidAmountVal = parseFloat(formData.amountPaid) || 0;
  const pendingDueVal = Math.max(0, totalAdmissionBill - paidAmountVal);

  const handleSubmit = async () => {
    if (!formData.firstName || !formData.lastName) {
      return Alert.alert('Required', 'Please enter student first and last name');
    }
    if (!formData.parentData.fullName || !formData.parentData.mobileNumber) {
      return Alert.alert('Required', 'Please enter parent name and contact number');
    }
    if (!selectedClass || !selectedSection) {
      return Alert.alert('Required', 'Please select class and section');
    }

    setLoading(true);
    try {
      // Prepare inventory items array
      const inventoryItems = Object.entries(selectedKit).map(([productId, quantity]) => ({
        productId,
        quantity
      }));

      const cleanDob = (formData.dateOfBirth?.match(/^\d{4}-\d{2}-\d{2}/) || ['2015-05-15'])[0];
      const cleanAdmDate = (formData.admissionDate?.match(/^\d{4}-\d{2}-\d{2}/) || [new Date().toISOString().split('T')[0]])[0];

      const payload = {
        ...formData,
        dateOfBirth: cleanDob,
        admissionDate: cleanAdmDate,
        phone: formData.phone || formData.parentData.mobileNumber,
        admissionFeeAmount: Math.round(admissionFeeVal * 100), // in paise
        admissionAmountPaid: Math.round(paidAmountVal * 100), // in paise
        inventoryItems,
        class: selectedClass._id,
        section: selectedSection._id,
        parentData: {
          ...formData.parentData,
          email: formData.parentData.email || `parent.${formData.admissionNumber}@stmichel.com`
        }
      };

      const res = await axios.post('/students', payload);
      const studentData = res.data.data;
      const billData = res.data.bill;
      const paymentData = res.data.payment;

      setCreatedBillResult({
        student: studentData,
        bill: billData,
        payment: paymentData,
        materialsTotal,
        admissionFeeVal,
        totalAdmissionBill,
        paidAmountVal,
        pendingDueVal
      });

      setShowInvoiceModal(true);

      // Reset form
      setFormData({
        firstName: '',
        lastName: '',
        phone: '',
        dateOfBirth: '2014-05-15',
        admissionDate: new Date().toISOString().split('T')[0],
        gender: 'Male',
        admissionNumber: `STU${Date.now().toString().slice(-6)}`,
        academicSession: '2026-2027',
        admissionFee: '5000',
        paymentMode: 'Cash',
        amountPaid: '5000',
        parentData: {
          fullName: '',
          mobileNumber: '',
          email: '',
          address: 'City Center, St. Michel Road',
        }
      });
      setSelectedKit({});
    } catch (err) {
      Alert.alert('Admission Failed', err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <ScrollView className="px-5 py-3" showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View className="mb-4 pt-1">
          <Text className="text-2xl font-black text-gray-900 tracking-tight">New Student Admission</Text>
          <Text className="text-gray-400 font-bold text-xs uppercase tracking-wider">
            Enrollment, School Kits & Admission Bill Generator
          </Text>
        </View>

        {/* 1. Class and Section Selection */}
        <View className="bg-white p-4 rounded-3xl mb-4 shadow-sm border border-gray-100">
          <View className="flex-row items-center mb-3">
            <BookOpen size={18} color="#1e3a8a" />
            <Text className="ml-2 font-black text-primary uppercase text-xs">Assign Class & Section *</Text>
          </View>

          <Text className="text-xs font-bold text-gray-400 mb-2">Class:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row mb-3">
            {classes.map(c => (
              <TouchableOpacity
                key={c._id}
                onPress={() => handleClassSelect(c)}
                className={`px-4 py-2 rounded-xl mr-2 border ${selectedClass?._id === c._id ? 'bg-primary border-primary' : 'bg-gray-50 border-gray-200'}`}
              >
                <Text className={`font-bold text-xs ${selectedClass?._id === c._id ? 'text-white' : 'text-gray-700'}`}>
                  Class {c.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {sections.length > 0 && (
            <>
              <Text className="text-xs font-bold text-gray-400 mb-2">Section:</Text>
              <View className="flex-row">
                {sections.map(s => (
                  <TouchableOpacity
                    key={s._id}
                    onPress={() => setSelectedSection(s)}
                    className={`px-4 py-2 rounded-xl mr-2 border ${selectedSection?._id === s._id ? 'bg-primary border-primary' : 'bg-gray-50 border-gray-200'}`}
                  >
                    <Text className={`font-bold text-xs ${selectedSection?._id === s._id ? 'text-white' : 'text-gray-700'}`}>
                      Section {s.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}
        </View>

        {/* 2. Student Details */}
        <View className="bg-white p-4 rounded-3xl mb-4 shadow-sm border border-gray-100">
          <View className="flex-row items-center mb-3">
            <User size={18} color="#1e3a8a" />
            <Text className="ml-2 font-black text-primary uppercase text-xs">Student Information *</Text>
          </View>

          <View className="flex-row space-x-2 mb-3">
            <View className="flex-1">
              <Text className="text-[10px] font-bold text-gray-500 mb-1">First Name *</Text>
              <TextInput
                className="bg-gray-50 px-3.5 py-2.5 rounded-xl font-bold text-gray-800 text-xs border border-gray-200"
                placeholder="First Name *"
                value={formData.firstName}
                onChangeText={(val) => setFormData({ ...formData, firstName: val })}
              />
            </View>
            <View className="flex-1">
              <Text className="text-[10px] font-bold text-gray-500 mb-1">Last Name *</Text>
              <TextInput
                className="bg-gray-50 px-3.5 py-2.5 rounded-xl font-bold text-gray-800 text-xs border border-gray-200"
                placeholder="Last Name *"
                value={formData.lastName}
                onChangeText={(val) => setFormData({ ...formData, lastName: val })}
              />
            </View>
          </View>

          {/* Student Phone (Login ID) */}
          <View className="mb-3">
            <View className="flex-row items-center justify-between mb-1">
              <Text className="text-[10px] font-bold text-gray-500">Student Phone Number *</Text>
              <Text className="text-[10px] font-black text-blue-600">Student App Login ID</Text>
            </View>
            <TextInput
              className="bg-gray-50 px-3.5 py-2.5 rounded-xl font-bold text-gray-800 text-xs border border-gray-200"
              placeholder="e.g. 9876543210 (Used for Student Login)"
              keyboardType="phone-pad"
              value={formData.phone}
              onChangeText={(val) => setFormData({ ...formData, phone: val })}
            />
          </View>

          {/* Dates: DOB & Admission Date */}
          <View className="flex-row space-x-2 mb-3">
            <View className="flex-1">
              <Text className="text-[10px] font-bold text-gray-500 mb-1">Date of Birth (YYYY-MM-DD) *</Text>
              <TextInput
                className="bg-gray-50 px-3.5 py-2.5 rounded-xl font-bold text-gray-800 text-xs border border-gray-200"
                placeholder="2014-05-15"
                value={formData.dateOfBirth}
                onChangeText={(val) => setFormData({ ...formData, dateOfBirth: val })}
              />
            </View>
            <View className="flex-1">
              <Text className="text-[10px] font-bold text-gray-500 mb-1">Date of Admission *</Text>
              <TextInput
                className="bg-gray-50 px-3.5 py-2.5 rounded-xl font-bold text-gray-800 text-xs border border-gray-200"
                placeholder="2026-11-23"
                value={formData.admissionDate}
                onChangeText={(val) => setFormData({ ...formData, admissionDate: val })}
              />
            </View>
          </View>

          <View className="flex-row space-x-2">
            <View className="flex-1">
              <Text className="text-[10px] font-bold text-gray-500 mb-1">Admission #</Text>
              <TextInput
                className="bg-gray-100 px-3.5 py-2.5 rounded-xl font-bold text-gray-600 text-xs border border-gray-200"
                value={formData.admissionNumber}
                onChangeText={(val) => setFormData({ ...formData, admissionNumber: val })}
              />
            </View>
            <View className="flex-1">
              <Text className="text-[10px] font-bold text-gray-500 mb-1">Academic Session</Text>
              <TextInput
                className="bg-gray-50 px-3.5 py-2.5 rounded-xl font-bold text-gray-800 text-xs border border-gray-200"
                value={formData.academicSession}
                onChangeText={(val) => setFormData({ ...formData, academicSession: val })}
              />
            </View>
          </View>
        </View>

        {/* 3. Parent / Guardian Details */}
        <View className="bg-white p-4 rounded-3xl mb-4 shadow-sm border border-gray-100">
          <View className="flex-row items-center mb-3">
            <Users size={18} color="#1e3a8a" />
            <Text className="ml-2 font-black text-primary uppercase text-xs">Parent / Guardian Details *</Text>
          </View>

          <View className="mb-2.5">
            <Text className="text-[10px] font-bold text-gray-500 mb-1">Parent Full Name *</Text>
            <TextInput
              className="bg-gray-50 px-3.5 py-2.5 rounded-xl font-bold text-gray-800 text-xs border border-gray-200"
              placeholder="Parent / Guardian Name"
              value={formData.parentData.fullName}
              onChangeText={(val) => setFormData({ ...formData, parentData: { ...formData.parentData, fullName: val } })}
            />
          </View>

          <View className="mb-2.5">
            <Text className="text-[10px] font-bold text-gray-500 mb-1">Parent Mobile Number *</Text>
            <TextInput
              className="bg-gray-50 px-3.5 py-2.5 rounded-xl font-bold text-gray-800 text-xs border border-gray-200"
              placeholder="e.g. 9840923758"
              keyboardType="phone-pad"
              value={formData.parentData.mobileNumber}
              onChangeText={(val) => setFormData({ ...formData, parentData: { ...formData.parentData, mobileNumber: val } })}
            />
          </View>

          <View className="mb-2.5">
            <Text className="text-[10px] font-bold text-gray-500 mb-1">Parent Email</Text>
            <TextInput
              className="bg-gray-50 px-3.5 py-2.5 rounded-xl font-bold text-gray-800 text-xs border border-gray-200"
              placeholder="parent@stmichel.com"
              autoCapitalize="none"
              value={formData.parentData.email}
              onChangeText={(val) => setFormData({ ...formData, parentData: { ...formData.parentData, email: val } })}
            />
          </View>

          <View>
            <Text className="text-[10px] font-bold text-gray-500 mb-1">Home Address</Text>
            <TextInput
              className="bg-gray-50 px-3.5 py-2.5 rounded-xl font-bold text-gray-800 text-xs border border-gray-200"
              placeholder="City Center, St. Michel Road"
              value={formData.parentData.address}
              onChangeText={(val) => setFormData({ ...formData, parentData: { ...formData.parentData, address: val } })}
            />
          </View>
        </View>

        {/* 4. School Materials & Inventory Selection */}
        <View className="bg-white p-4 rounded-3xl mb-4 shadow-sm border border-gray-100">
          <View className="flex-row items-center justify-between mb-3">
            <View className="flex-row items-center">
              <Package size={18} color="#9333ea" />
              <Text className="ml-2 font-black text-purple-700 uppercase text-xs">School Materials & Kit</Text>
            </View>
            <Text className="text-xs font-black text-purple-700">Subtotal: ₹{materialsTotal.toLocaleString('en-IN')}</Text>
          </View>
          <Text className="text-[11px] text-gray-400 font-medium mb-3">
            Select books, uniform, blazer, tie, or bag to issue and include in the admission bill.
          </Text>

          {availableProducts.length === 0 ? (
            <Text className="text-xs text-gray-400 font-bold py-2">No inventory products found.</Text>
          ) : (
            availableProducts.map(p => {
              const qty = selectedKit[p._id] || 0;
              const isSelected = qty > 0;
              const priceRs = Math.round((p.sellingPrice || 0) / 100);

              return (
                <View
                  key={p._id}
                  className={`p-3 rounded-2xl mb-2 flex-row items-center justify-between border ${isSelected ? 'bg-purple-50/60 border-purple-200' : 'bg-gray-50 border-gray-100'}`}
                >
                  <View className="flex-1 mr-2">
                    <Text className="font-bold text-gray-900 text-xs">{p.name}</Text>
                    <Text className="text-[10px] text-gray-400 font-semibold mt-0.5">
                      ₹{priceRs.toLocaleString('en-IN')} • Stock: {p.quantity}
                    </Text>
                  </View>

                  <View className="flex-row items-center bg-white rounded-xl border border-gray-200 p-1">
                    <TouchableOpacity
                      onPress={() => updateKitQuantity(p._id, -1)}
                      hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                      className="h-8 w-8 rounded-lg bg-gray-100 items-center justify-center"
                    >
                      <Minus size={15} color="#475569" />
                    </TouchableOpacity>
                    <Text className="mx-2.5 font-black text-xs text-gray-900">{qty}</Text>
                    <TouchableOpacity
                      onPress={() => updateKitQuantity(p._id, 1)}
                      hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                      className="h-8 w-8 rounded-lg bg-primary items-center justify-center"
                    >
                      <Plus size={15} color="white" />
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })
          )}
        </View>

        {/* 5. Admission Fee, Payment Method & Upfront Collection */}
        <View className="bg-white p-4 rounded-3xl mb-4 shadow-sm border border-gray-100">
          <View className="flex-row items-center mb-3">
            <CreditCard size={18} color="#16a34a" />
            <Text className="ml-2 font-black text-emerald-700 uppercase text-xs">Fee & Payment Mode *</Text>
          </View>

          <View className="flex-row space-x-2 mb-3">
            <View className="flex-1">
              <Text className="text-[10px] font-bold text-gray-500 mb-1">Admission Fee (₹) *</Text>
              <TextInput
                className="bg-gray-50 px-3.5 py-2.5 rounded-xl font-bold text-gray-800 text-sm border border-gray-200"
                value={formData.admissionFee}
                onChangeText={(val) => setFormData({ ...formData, admissionFee: val })}
                keyboardType="numeric"
              />
            </View>
            <View className="flex-1">
              <Text className="text-[10px] font-bold text-gray-500 mb-1">Paid Now (₹) *</Text>
              <TextInput
                className="bg-emerald-50 px-3.5 py-2.5 rounded-xl font-black text-emerald-700 text-sm border border-emerald-200"
                value={formData.amountPaid}
                onChangeText={(val) => setFormData({ ...formData, amountPaid: val })}
                keyboardType="numeric"
              />
            </View>
          </View>

          {/* Payment Method Selector */}
          <Text className="text-[10px] font-bold text-gray-500 mb-1.5">Payment Method *</Text>
          <View className="flex-row flex-wrap gap-2 mb-3">
            {['Cash', 'UPI', 'Online', 'Bank Transfer'].map(m => (
              <TouchableOpacity
                key={m}
                onPress={() => setFormData({ ...formData, paymentMode: m })}
                className={`px-3 py-1.5 rounded-xl border ${formData.paymentMode === m ? 'bg-primary border-primary' : 'bg-gray-50 border-gray-200'}`}
              >
                <Text className={`text-xs font-bold ${formData.paymentMode === m ? 'text-white' : 'text-gray-700'}`}>
                  {m}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* UPI QR Display if UPI is selected */}
          {formData.paymentMode === 'UPI' && (
            <View className="bg-emerald-50 p-3 rounded-2xl border border-emerald-200 mb-3 items-center">
              <View className="flex-row items-center mb-1">
                <QrCode size={18} color="#059669" />
                <Text className="ml-1.5 font-black text-xs text-emerald-800">Scan & Pay via School UPI</Text>
              </View>
              <Text className="text-xs font-bold text-emerald-700 bg-white px-3 py-1 rounded-lg border border-emerald-300 mb-1">
                {schoolSettings?.upiId || 'stmichel@upi'}
              </Text>
              <Text className="text-[10px] text-emerald-600 font-medium text-center">
                Scan with any UPI app (Google Pay, PhonePe, Paytm). Confirm amount after transfer.
              </Text>
            </View>
          )}

          {/* Live Bill Summary */}
          <View className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
            <Text className="text-[10px] font-black uppercase text-gray-400 tracking-wider mb-2">Live Admission Bill Preview</Text>
            <View className="flex-row justify-between mb-1">
              <Text className="text-xs text-gray-600">Admission Fee:</Text>
              <Text className="text-xs font-bold text-gray-900">₹{admissionFeeVal.toLocaleString('en-IN')}</Text>
            </View>
            <View className="flex-row justify-between mb-1">
              <Text className="text-xs text-gray-600">Materials (Books/Uniform):</Text>
              <Text className="text-xs font-bold text-gray-900">₹{materialsTotal.toLocaleString('en-IN')}</Text>
            </View>
            <View className="flex-row justify-between pt-1.5 border-t border-slate-200 mb-1">
              <Text className="text-xs font-black text-gray-900">Total Admission Bill:</Text>
              <Text className="text-xs font-black text-primary">₹{totalAdmissionBill.toLocaleString('en-IN')}</Text>
            </View>
            <View className="flex-row justify-between mb-1">
              <Text className="text-xs text-emerald-700 font-bold">Amount Paid ({formData.paymentMode}):</Text>
              <Text className="text-xs font-black text-emerald-700">₹{paidAmountVal.toLocaleString('en-IN')}</Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-xs font-bold text-rose-600">Balance Pending:</Text>
              <Text className={`text-xs font-black ${pendingDueVal > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                ₹{pendingDueVal.toLocaleString('en-IN')}
              </Text>
            </View>
          </View>
        </View>

        {/* Submit Admission Button */}
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={loading}
          className={`bg-primary py-4 rounded-2xl shadow-lg mb-12 items-center flex-row justify-center ${loading ? 'opacity-70' : ''}`}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <CheckCircle2 size={18} color="white" />
              <Text className="text-white font-black text-sm ml-2">Confirm Admission & Generate Bill</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* Official Admission Bill / Invoice Modal */}
      <Modal visible={showInvoiceModal} animationType="slide" transparent onRequestClose={() => setShowInvoiceModal(false)}>
        <View className="flex-1 justify-end bg-black/60">
          <View className="bg-white rounded-t-[32px] p-6 max-h-[92%]">
            <View className="flex-row justify-between items-center mb-3 pb-3 border-b border-gray-100">
              <View>
                <Text className="text-lg font-black text-gray-900">Official Admission Bill</Text>
                <Text className="text-xs font-bold text-emerald-600">Enrolled & Invoiced Successfully</Text>
              </View>
              <TouchableOpacity onPress={() => setShowInvoiceModal(false)} className="p-1">
                <X size={20} color="#64748b" />
              </TouchableOpacity>
            </View>

            {createdBillResult && (
              <ScrollView showsVerticalScrollIndicator={false}>
                {/* School Header Receipt Card */}
                <View className="bg-blue-50/70 p-4 rounded-2xl border border-blue-100 mb-4">
                  <Text className="text-base font-black text-primary">St. Michel School</Text>
                  <Text className="text-xs font-semibold text-gray-500">City Center, St. Michel Road</Text>
                  <View className="flex-row justify-between pt-2 mt-2 border-t border-blue-200">
                    <Text className="text-xs font-bold text-gray-700">Bill #: {createdBillResult.bill?.billNumber}</Text>
                    <Text className="text-xs text-gray-500">Date: {new Date().toLocaleDateString()}</Text>
                  </View>
                </View>

                {/* Student Info */}
                <View className="bg-gray-50 p-3.5 rounded-2xl mb-4 border border-gray-200">
                  <Text className="text-xs font-black text-gray-900">
                    {createdBillResult.student?.firstName} {createdBillResult.student?.lastName}
                  </Text>
                  <Text className="text-[11px] text-gray-500 font-semibold mt-0.5">
                    Admission #: {createdBillResult.student?.admissionNumber} • Phone: {createdBillResult.student?.phone || 'N/A'}
                  </Text>
                  <Text className="text-[11px] text-blue-700 font-bold mt-0.5">
                    Class: {selectedClass?.name || 'X'} - Section {selectedSection?.name || 'A'}
                  </Text>
                </View>

                {/* Itemized Table */}
                <Text className="text-xs font-black text-gray-500 uppercase tracking-wider mb-2">Itemized Breakdown</Text>
                <View className="bg-white rounded-2xl border border-gray-200 overflow-hidden mb-4 shadow-sm">
                  {createdBillResult.bill?.items?.map((item, idx) => (
                    <View key={idx} className="flex-row justify-between p-3 border-b border-gray-100">
                      <View className="flex-1 mr-2">
                        <Text className="text-xs font-bold text-gray-900">{item.description}</Text>
                        <Text className="text-[10px] text-gray-400">Qty: {item.quantity}</Text>
                      </View>
                      <Text className="text-xs font-black text-gray-900">
                        ₹{Math.round(((item.amount || 0) * (item.quantity || 1)) / 100).toLocaleString('en-IN')}
                      </Text>
                    </View>
                  ))}

                  {/* Summary Totals */}
                  <View className="bg-slate-50 p-3.5">
                    <View className="flex-row justify-between mb-1">
                      <Text className="text-xs font-bold text-gray-700">Total Billed:</Text>
                      <Text className="text-xs font-black text-gray-900">
                        ₹{createdBillResult.totalAdmissionBill.toLocaleString('en-IN')}
                      </Text>
                    </View>
                    <View className="flex-row justify-between mb-1">
                      <Text className="text-xs font-bold text-emerald-700">Amount Paid ({formData.paymentMode}):</Text>
                      <Text className="text-xs font-black text-emerald-700">
                        ₹{createdBillResult.paidAmountVal.toLocaleString('en-IN')}
                      </Text>
                    </View>
                    <View className="flex-row justify-between pt-1 border-t border-slate-200">
                      <Text className="text-xs font-bold text-rose-600">Balance Due:</Text>
                      <Text className={`text-xs font-black ${createdBillResult.pendingDueVal > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                        ₹{createdBillResult.pendingDueVal.toLocaleString('en-IN')}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Print and Download Actions */}
                <View className="flex-row space-x-2 mb-3">
                  <TouchableOpacity
                    onPress={() => printBill(createdBillResult.bill, createdBillResult.student, schoolSettings)}
                    className="flex-1 bg-slate-800 py-3 rounded-2xl items-center flex-row justify-center"
                  >
                    <Printer size={16} color="white" />
                    <Text className="text-white font-bold text-xs ml-1.5">Print Bill</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => downloadBillPdf(createdBillResult.bill, createdBillResult.student, schoolSettings)}
                    className="flex-1 bg-emerald-600 py-3 rounded-2xl items-center flex-row justify-center"
                  >
                    <Download size={16} color="white" />
                    <Text className="text-white font-bold text-xs ml-1.5">Download PDF</Text>
                  </TouchableOpacity>
                </View>

                {/* Navigation Button */}
                <TouchableOpacity
                  onPress={() => {
                    setShowInvoiceModal(false);
                    navigation.navigate('Students');
                  }}
                  className="bg-primary py-3.5 rounded-2xl shadow-sm items-center mb-4"
                >
                  <Text className="text-white font-black text-xs">Done & View in Student Directory</Text>
                </TouchableOpacity>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default AdmissionScreen;
