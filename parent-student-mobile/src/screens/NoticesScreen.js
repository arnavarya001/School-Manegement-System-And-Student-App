import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, SafeAreaView } from 'react-native';
import { Bell, Calendar } from 'lucide-react-native';
import axios from '../api/axios';

const NoticesScreen = () => {
  const [notices, setNotices] = useState([]);

  useEffect(() => {
    axios.get('/announcements').then(res => setNotices(res.data.data)).catch(console.log);
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="px-6 py-4 flex-1">
        <Text className="text-2xl font-black text-gray-900 uppercase tracking-tight mb-6">Notice Board</Text>
        <FlatList
          data={notices}
          keyExtractor={item => item._id}
          renderItem={({ item }) => (
            <View className="bg-white p-5 rounded-3xl mb-4 shadow-sm border-l-4 border-primary">
              <Text className="font-black text-gray-900 text-lg mb-2">{item.title}</Text>
              <Text className="text-sm text-gray-600 leading-5 mb-3">{item.content}</Text>
              <View className="flex-row items-center">
                <Calendar size={12} color="#94a3b8" />
                <Text className="text-[10px] text-gray-400 font-bold uppercase ml-1">
                  {new Date(item.createdAt).toLocaleDateString()}
                </Text>
              </View>
            </View>
          )}
        />
      </View>
    </SafeAreaView>
  );
};

export default NoticesScreen;
