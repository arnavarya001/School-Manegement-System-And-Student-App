import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Package, Calendar, ShoppingBag, CheckCircle2, Search } from 'lucide-react-native';
import axios from '../api/axios';

const MaterialsScreen = () => {
  const [activeTab, setActiveTab] = useState('ISSUED'); // 'ISSUED' | 'STORE'
  const [materials, setMaterials] = useState([]);
  const [storeProducts, setStoreProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [meRes, prodRes] = await Promise.all([
        axios.get('/auth/me').catch(() => ({ data: {} })),
        axios.get('/inventory/products').catch(() => ({ data: { data: [] } }))
      ]);

      setStoreProducts(prodRes.data?.data || []);

      const me = meRes.data;
      let studentId = null;

      if (me.user?.role === 'parent') {
        const studentList = me.profile?.students || [];
        if (studentList.length > 0) {
          studentId = studentList[0]._id || studentList[0];
        }
      } else {
        studentId = me.profile?._id;
      }

      if (studentId) {
        const res = await axios.get(`/inventory/student/${studentId}`);
        setMaterials(res.data.data || []);
      } else {
        setMaterials([]);
      }
    } catch (e) {
      console.log('Error fetching materials:', e.message);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );

  const getCatName = (cat) => (typeof cat === 'object' && cat !== null ? (cat.name || 'General') : (cat || 'General'));

  const filteredStore = storeProducts.filter(p =>
    (p.name || '').toLowerCase().includes(search.toLowerCase()) ||
    getCatName(p.category).toLowerCase().includes(search.toLowerCase())
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="px-5 py-4 flex-1">
        <Text className="text-2xl font-black text-gray-900 tracking-tight">School Materials & Store</Text>
        <Text className="text-xs font-bold text-gray-400 mb-3">Issued Books, Uniform Kits & Inventory Catalog</Text>

        {/* Tab Pills */}
        <View className="flex-row bg-gray-200/70 p-1 rounded-2xl mb-4">
          <TouchableOpacity
            onPress={() => setActiveTab('ISSUED')}
            className={`flex-1 py-2 rounded-xl items-center ${activeTab === 'ISSUED' ? 'bg-white shadow-sm' : ''}`}
          >
            <Text className={`text-xs font-bold ${activeTab === 'ISSUED' ? 'text-primary font-black' : 'text-gray-500'}`}>
              My Issued Items ({materials.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setActiveTab('STORE')}
            className={`flex-1 py-2 rounded-xl items-center ${activeTab === 'STORE' ? 'bg-white shadow-sm' : ''}`}
          >
            <Text className={`text-xs font-bold ${activeTab === 'STORE' ? 'text-primary font-black' : 'text-gray-500'}`}>
              School Store ({storeProducts.length})
            </Text>
          </TouchableOpacity>
        </View>

        {activeTab === 'ISSUED' ? (
          <FlatList
            data={materials}
            keyExtractor={item => item._id}
            renderItem={({ item }) => {
              const isItemPaid = item.bill?.status === 'Paid' || (item.bill && item.bill.dueAmount === 0);
              const amountRs = Math.round((item.totalPrice || ((item.unitPrice || 0) * (item.quantity || 1))) / 100).toLocaleString('en-IN');
              return (
                <View className="bg-white p-4 rounded-2xl mb-3 shadow-sm border border-gray-100">
                  <View className="flex-row justify-between items-start mb-2">
                    <View className="flex-row items-center flex-1 mr-2">
                      <View className="h-10 w-10 bg-purple-50 rounded-xl items-center justify-center mr-3">
                        <Package size={20} color="#9333ea" />
                      </View>
                      <View className="flex-1">
                        <Text className="font-black text-gray-900 text-sm">{item.product?.name || 'Material Item'}</Text>
                        <Text className="text-xs text-gray-400 font-semibold mt-0.5">Quantity: {item.quantity}</Text>
                      </View>
                    </View>
                    <View className={`px-2.5 py-1 rounded-full ${isItemPaid ? 'bg-emerald-100' : 'bg-amber-100'}`}>
                      <Text className={`text-[10px] font-black ${isItemPaid ? 'text-emerald-800' : 'text-amber-800'}`}>
                        {isItemPaid ? 'PAID' : 'PENDING'}
                      </Text>
                    </View>
                  </View>

                  <View className="flex-row justify-between items-center pt-2.5 border-t border-gray-100">
                    <View className="flex-row items-center">
                      <Calendar size={12} color="#94a3b8" />
                      <Text className="text-[10px] text-gray-400 font-bold ml-1">
                        Issued: {new Date(item.issueDate || item.createdAt).toLocaleDateString('en-GB')}
                      </Text>
                    </View>
                    <Text className="text-xs font-black text-gray-900">
                      Amount: <Text className={isItemPaid ? 'text-emerald-600' : 'text-amber-700'}>₹{amountRs}</Text>
                    </Text>
                  </View>
                </View>
              );
            }}
            refreshing={loading}
            onRefresh={fetchData}
            ListEmptyComponent={
              <View className="bg-white p-8 rounded-3xl items-center mt-6">
                <Package size={36} color="#cbd5e1" />
                <Text className="text-gray-400 font-bold mt-2 text-xs">No materials issued yet.</Text>
              </View>
            }
          />
        ) : (
          <View className="flex-1">
            <View className="bg-white flex-row items-center px-3.5 py-2 rounded-2xl shadow-sm mb-3 border border-gray-100">
              <Search size={16} color="#94a3b8" />
              <TextInput
                className="flex-1 ml-2 py-0.5 font-medium text-gray-800 text-xs"
                placeholder="Search books, uniform, blazer..."
                value={search}
                onChangeText={setSearch}
              />
            </View>

            <FlatList
              data={filteredStore}
              keyExtractor={item => item._id}
              renderItem={({ item }) => {
                const priceRs = Math.round((item.sellingPrice || 0) / 100);
                const inStock = item.quantity > 0;
                return (
                  <View className="bg-white p-4 rounded-2xl mb-2.5 shadow-sm border border-gray-100 flex-row justify-between items-center">
                    <View className="flex-row items-center flex-1 mr-3">
                      <View className="h-11 w-11 bg-blue-50 rounded-xl items-center justify-center mr-3">
                        <ShoppingBag size={20} color="#1e3a8a" />
                      </View>
                      <View className="flex-1">
                        <Text className="font-bold text-gray-900 text-xs">{item.name}</Text>
                        <Text className="text-[10px] text-gray-400 mt-0.5">Category: {getCatName(item.category)}</Text>
                        <Text className={`text-[10px] font-bold mt-0.5 ${inStock ? 'text-emerald-600' : 'text-rose-500'}`}>
                          {inStock ? `Available (${item.quantity} in stock)` : 'Out of stock'}
                        </Text>
                      </View>
                    </View>

                    <View className="items-end">
                      <Text className="text-sm font-black text-primary">₹{priceRs}</Text>
                      <View className="bg-gray-100 px-2 py-0.5 rounded-md mt-1">
                        <Text className="text-[9px] font-bold text-gray-600">School Counter</Text>
                      </View>
                    </View>
                  </View>
                );
              }}
              refreshing={loading}
              onRefresh={fetchData}
              ListEmptyComponent={
                <View className="bg-white p-8 rounded-3xl items-center mt-6">
                  <ShoppingBag size={36} color="#cbd5e1" />
                  <Text className="text-gray-400 font-bold mt-2 text-xs">No store products found.</Text>
                </View>
              }
            />
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

export default MaterialsScreen;
