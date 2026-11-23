import React, { useState, useEffect } from 'react';
import {
  View, Text, FlatList, TextInput, TouchableOpacity,
  Modal, Alert, SafeAreaView, ActivityIndicator, ScrollView
} from 'react-native';
import { Package, Plus, Trash2, AlertTriangle, Layers, Tag, X, Check } from 'lucide-react-native';
import axios from '../api/axios';

const InventoryScreen = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [search, setSearch] = useState('');

  // New product form
  const [form, setForm] = useState({
    name: '',
    code: '',
    category: '',
    sellingPrice: '',
    purchasePrice: '',
    quantity: '',
    minStock: '5',
    supplier: 'St. Michel Store'
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [prodRes, catRes] = await Promise.all([
        axios.get('/inventory/products'),
        axios.get('/inventory/categories')
      ]);
      setProducts(prodRes.data.data || []);
      const cats = catRes.data.data || [];
      setCategories(cats);
      if (cats.length > 0 && !form.category) {
        setForm(prev => ({ ...prev, category: cats[0]._id }));
      }
    } catch (err) {
      console.log('Error fetching inventory:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = async () => {
    if (!form.name || !form.code || !form.sellingPrice || !form.category) {
      return Alert.alert('Required', 'Please fill name, code, category, and selling price');
    }

    setSubmitting(true);
    try {
      await axios.post('/inventory/products', {
        name: form.name,
        code: form.code,
        category: form.category,
        sellingPrice: Math.round(parseFloat(form.sellingPrice) * 100),
        purchasePrice: Math.round((parseFloat(form.purchasePrice) || parseFloat(form.sellingPrice) * 0.7) * 100),
        quantity: parseInt(form.quantity) || 0,
        minStock: parseInt(form.minStock) || 5,
        supplier: form.supplier
      });

      Alert.alert('Success', `Product "${form.name}" added to inventory!`);
      setModalVisible(false);
      setForm({
        name: '',
        code: '',
        category: categories[0]?._id || '',
        sellingPrice: '',
        purchasePrice: '',
        quantity: '',
        minStock: '5',
        supplier: 'St. Michel Store'
      });
      fetchData();
    } catch (err) {
      Alert.alert('Error', err.response?.data?.error || err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (product) => {
    Alert.alert(
      'Delete Product',
      `Are you sure you want to delete ${product.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await axios.delete(`/inventory/products/${product._id}`);
              setProducts(prev => prev.filter(p => p._id !== product._id));
            } catch (err) {
              Alert.alert('Error', err.response?.data?.error || 'Failed to delete');
            }
          }
        }
      ]
    );
  };

  const filteredProducts = products.filter(p => {
    const matchesCat = selectedCategory === 'ALL' || p.category?._id === selectedCategory || p.category === selectedCategory;
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.code.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const totalValue = products.reduce((acc, p) => acc + (p.quantity * (p.sellingPrice / 100)), 0);
  const lowStockCount = products.filter(p => p.quantity <= p.minStock).length;

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="px-6 py-4">
        {/* Header */}
        <View className="flex-row justify-between items-center mb-4">
          <View>
            <Text className="text-2xl font-black text-gray-900">School Inventory</Text>
            <Text className="text-gray-400 font-bold text-xs">Stock & Materials Ledger</Text>
          </View>
          <TouchableOpacity
            onPress={() => setModalVisible(true)}
            className="flex-row items-center bg-primary px-4 py-2.5 rounded-2xl shadow-sm"
          >
            <Plus size={16} color="white" />
            <Text className="text-white font-bold ml-1.5 text-xs">Add Product</Text>
          </TouchableOpacity>
        </View>

        {/* Summary Metric Cards */}
        <View className="flex-row justify-between mb-4">
          <View className="bg-white p-3.5 rounded-2xl flex-1 mr-2 shadow-sm border border-gray-100">
            <Text className="text-gray-400 text-[10px] font-bold uppercase">Total Products</Text>
            <Text className="text-lg font-black text-gray-900 mt-0.5">{products.length}</Text>
          </View>
          <View className="bg-white p-3.5 rounded-2xl flex-1 mr-2 shadow-sm border border-gray-100">
            <Text className="text-gray-400 text-[10px] font-bold uppercase">Stock Value</Text>
            <Text className="text-lg font-black text-green-600 mt-0.5">₹{Math.round(totalValue).toLocaleString()}</Text>
          </View>
          <View className="bg-white p-3.5 rounded-2xl flex-1 shadow-sm border border-gray-100">
            <Text className="text-gray-400 text-[10px] font-bold uppercase">Low Stock</Text>
            <Text className={`text-lg font-black mt-0.5 ${lowStockCount > 0 ? 'text-red-500' : 'text-gray-900'}`}>
              {lowStockCount}
            </Text>
          </View>
        </View>

        {/* Search Input */}
        <TextInput
          className="bg-white px-4 py-3 rounded-2xl mb-3 shadow-sm border border-gray-100 font-medium text-gray-800"
          placeholder="Search products (books, uniform, bags, etc.)..."
          value={search}
          onChangeText={setSearch}
        />

        {/* Category Filters */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row mb-3">
          <TouchableOpacity
            onPress={() => setSelectedCategory('ALL')}
            className={`px-3.5 py-1.5 rounded-xl mr-2 border ${selectedCategory === 'ALL' ? 'bg-primary border-primary' : 'bg-white border-gray-200'}`}
          >
            <Text className={`font-bold text-xs ${selectedCategory === 'ALL' ? 'text-white' : 'text-gray-600'}`}>
              All Items
            </Text>
          </TouchableOpacity>
          {categories.map(c => (
            <TouchableOpacity
              key={c._id}
              onPress={() => setSelectedCategory(c._id)}
              className={`px-3.5 py-1.5 rounded-xl mr-2 border ${selectedCategory === c._id ? 'bg-primary border-primary' : 'bg-white border-gray-200'}`}
            >
              <Text className={`font-bold text-xs ${selectedCategory === c._id ? 'text-white' : 'text-gray-600'}`}>
                {c.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Product List */}
      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#1e3a8a" />
        </View>
      ) : (
        <FlatList
          data={filteredProducts}
          keyExtractor={(item) => item._id}
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 24 }}
          ListEmptyComponent={
            <View className="bg-white p-8 rounded-3xl items-center mt-6">
              <Package size={40} color="#cbd5e1" />
              <Text className="text-gray-500 font-bold mt-2">No inventory products found</Text>
              <Text className="text-gray-400 text-xs mt-1 text-center">Tap "Add Product" above to add uniforms, books, or bags.</Text>
            </View>
          }
          renderItem={({ item }) => {
            const isLow = item.quantity <= item.minStock;
            return (
              <View className="bg-white p-4 rounded-2xl mb-3 shadow-sm border border-gray-100 flex-row items-center justify-between">
                <View className="flex-1 mr-3">
                  <View className="flex-row items-center">
                    <Text className="font-black text-gray-900 text-base">{item.name}</Text>
                    {isLow && (
                      <View className="ml-2 bg-red-100 px-2 py-0.5 rounded-md">
                        <Text className="text-red-600 font-bold text-[9px] uppercase">Low Stock</Text>
                      </View>
                    )}
                  </View>
                  <Text className="text-gray-400 text-xs font-semibold mt-0.5">Code: {item.code}</Text>

                  <View className="flex-row items-center mt-2">
                    <Text className="text-primary font-black text-sm mr-3">₹{item.sellingPrice / 100}</Text>
                    <Text className="text-gray-400 text-xs mr-3">Cost: ₹{item.purchasePrice / 100}</Text>
                    <View className="bg-blue-50 px-2.5 py-0.5 rounded-lg border border-blue-100">
                      <Text className="text-blue-700 font-bold text-xs">{item.quantity} in stock</Text>
                    </View>
                  </View>
                </View>

                <TouchableOpacity
                  onPress={() => handleDelete(item)}
                  className="p-2.5 bg-red-50 rounded-xl border border-red-100"
                >
                  <Trash2 size={16} color="#ef4444" />
                </TouchableOpacity>
              </View>
            );
          }}
        />
      )}

      {/* Add Product Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View className="flex-1 justify-end bg-black/40">
          <View className="bg-white rounded-t-[32px] p-6 max-h-[90%]">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-xl font-black text-gray-900">Add Inventory Item</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)} className="p-1">
                <X size={22} color="#64748b" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text className="text-xs font-bold text-gray-500 mb-1">Product Name *</Text>
              <TextInput
                className="bg-gray-50 px-4 py-3 rounded-xl mb-3 font-medium"
                placeholder="e.g. School Uniform Shirt (Size M)"
                value={form.name}
                onChangeText={(val) => setForm({ ...form, name: val })}
              />

              <Text className="text-xs font-bold text-gray-500 mb-1">Product Code *</Text>
              <TextInput
                className="bg-gray-50 px-4 py-3 rounded-xl mb-3 font-medium"
                placeholder="e.g. UNIF-SHIRT-M"
                value={form.code}
                onChangeText={(val) => setForm({ ...form, code: val })}
              />

              <Text className="text-xs font-bold text-gray-500 mb-1">Category *</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row mb-3">
                {categories.map(c => (
                  <TouchableOpacity
                    key={c._id}
                    onPress={() => setForm({ ...form, category: c._id })}
                    className={`px-3 py-2 rounded-xl mr-2 border ${form.category === c._id ? 'bg-primary border-primary' : 'bg-gray-100 border-gray-200'}`}
                  >
                    <Text className={`font-bold text-xs ${form.category === c._id ? 'text-white' : 'text-gray-700'}`}>
                      {c.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <View className="flex-row justify-between">
                <View className="flex-1 mr-2">
                  <Text className="text-xs font-bold text-gray-500 mb-1">Selling Price (₹) *</Text>
                  <TextInput
                    className="bg-gray-50 px-4 py-3 rounded-xl mb-3 font-medium"
                    placeholder="e.g. 450"
                    keyboardType="numeric"
                    value={form.sellingPrice}
                    onChangeText={(val) => setForm({ ...form, sellingPrice: val })}
                  />
                </View>
                <View className="flex-1 ml-2">
                  <Text className="text-xs font-bold text-gray-500 mb-1">Purchase Cost (₹)</Text>
                  <TextInput
                    className="bg-gray-50 px-4 py-3 rounded-xl mb-3 font-medium"
                    placeholder="e.g. 300"
                    keyboardType="numeric"
                    value={form.purchasePrice}
                    onChangeText={(val) => setForm({ ...form, purchasePrice: val })}
                  />
                </View>
              </View>

              <View className="flex-row justify-between">
                <View className="flex-1 mr-2">
                  <Text className="text-xs font-bold text-gray-500 mb-1">Initial Quantity *</Text>
                  <TextInput
                    className="bg-gray-50 px-4 py-3 rounded-xl mb-3 font-medium"
                    placeholder="e.g. 50"
                    keyboardType="numeric"
                    value={form.quantity}
                    onChangeText={(val) => setForm({ ...form, quantity: val })}
                  />
                </View>
                <View className="flex-1 ml-2">
                  <Text className="text-xs font-bold text-gray-500 mb-1">Low Stock Alert At</Text>
                  <TextInput
                    className="bg-gray-50 px-4 py-3 rounded-xl mb-3 font-medium"
                    placeholder="e.g. 5"
                    keyboardType="numeric"
                    value={form.minStock}
                    onChangeText={(val) => setForm({ ...form, minStock: val })}
                  />
                </View>
              </View>

              <TouchableOpacity
                onPress={handleAddProduct}
                disabled={submitting}
                className={`bg-primary py-4 rounded-2xl shadow-lg mt-2 mb-6 ${submitting ? 'opacity-70' : ''}`}
              >
                {submitting ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-white text-center font-bold text-base">Save Product</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default InventoryScreen;
