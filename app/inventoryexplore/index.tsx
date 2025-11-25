import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet, Pressable } from 'react-native';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../config/FirebaseConfig';
import ProductListItem from '../../components/Home/ProductListItem';
import { useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function InventoryExplore() {
  const [searchQuery, setSearchQuery] = useState('');
  const [productList, setProductList] = useState([]);
  const router = useRouter();

  const handleGoBack = () => {
    router.back();
  };

  const GetProducts = async () => {
    if (!searchQuery.trim()) {
      setProductList([]);
      return;
    }

    try {
      // Search in InventoryProduct
      const inventoryQuery = query(collection(db, 'InventoryProduct'), where('name', '==', searchQuery.trim()));
      const inventorySnapshot = await getDocs(inventoryQuery);
      const inventoryProducts = inventorySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

      // Search in Product
      const productQuery = query(collection(db, 'Product'), where('name', '==', searchQuery.trim()));
      const productSnapshot = await getDocs(productQuery);
      const products = productSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

      // Combine results
      setProductList([...inventoryProducts, ...products]);
    } catch (error) {
      console.error('Error fetching products: ', error);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header with Back Button and Title */}
      <View style={styles.header}>
        <Pressable onPress={handleGoBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={20} color="black" />
        </Pressable>
        <Text style={styles.title}>Explore Products</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.input}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search for products"
          placeholderTextColor="#A8A8A8"
        />
        <TouchableOpacity style={styles.searchButton} onPress={GetProducts}>
          <Text style={styles.searchButtonText}>Search</Text>
        </TouchableOpacity>
      </View>

      
        <FlatList
          data={productList}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.productListContainer}
          renderItem={({ item }) => <ProductListItem product={item} />}
        />
      
    </View>
  );
}

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8f8f8',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
    marginBottom: 10,
  },
  backButton: {
    padding: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 30,
    elevation: 5,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    textAlign: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 30,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginBottom: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 15,
    fontSize: 16,
    color: '#333',
    borderRadius: 30,
  },
  searchButton: {
    backgroundColor: '#0066cc',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 30,
    marginLeft: 10,
  },
  searchButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  noProductsText: {
    fontSize: 18,
    color: '#888',
    textAlign: 'center',
    marginTop: 20,
  },
  productListContainer: {
    paddingBottom: 20,
  },
});


