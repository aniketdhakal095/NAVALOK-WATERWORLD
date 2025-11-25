import { View, Text, TouchableOpacity, FlatList, TextInput, StyleSheet } from 'react-native';
import { useUser } from '@clerk/clerk-expo';
import React from 'react';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import InventorySearch from '../../components/Farmer/InventorySearch';

// Import components
import Header from '../../components/Home/Header';
import Slider from '../../components/Home/Slider';
import ProductListByCategory from '../../components/Home/ProductListByCategory';


const Home = () => {
  const { user } = useUser();
  const router = useRouter();
  

  return (
    <View style={{ flex: 1 }}>
      {/* Using FlatList as the main scrollable component */}
      <FlatList
        ListHeaderComponent={
          <View style={{ padding: 20, marginTop: 20, marginBottom:50 }}>
            {/* Header */}
            <Header />

            {/* Slider */}
            <Slider />

            <InventorySearch/>

            {/* Search */}
            <View>
           
                </View>

            {/* Product Category and Product List */}
            <ProductListByCategory />
          </View>
        }
        data={[]} // FlatList requires data. Empty array ensures it renders properly.
        keyExtractor={(item, index) => index.toString()}
        renderItem={null} // No list items; just using ListHeaderComponent
      />

      
    </View>
  );
};

const styles = StyleSheet.create({
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 10,
    paddingHorizontal: 12,
    elevation: 3,
    marginVertical: 10,
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: '#DDD',
    height: 50,
  },
  searchIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
});


export default Home;
