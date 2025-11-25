import { View, FlatList, TouchableOpacity, Text, StyleSheet } from 'react-native';
import React, { useEffect, useState } from 'react';
import InventoryCategory from './InventoryCategory';
import { db } from '../../config/FirebaseConfig';
import { collection, query, where, getDocs, DocumentData } from 'firebase/firestore';
import ProductListItem from '../Home/ProductListItem';
import { useRouter } from 'expo-router';

const InventoryProductListByCategory = () => {
  const [productList, setProductList] = useState<DocumentData[]>([]);
  const router = useRouter();

  const GetProductList = async (category) => {
    try {
      setProductList([]);
      const q = query(collection(db, 'InventoryProduct'), where('category', '==', category));
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach((doc) => {
        setProductList((productList) => [...productList, doc.data()]);
      });
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  return (
    <View style={styles.container}>
      <InventoryCategory category={(value) => GetProductList(value)} />
      
      <FlatList
        data={productList}
        style={styles.productList}
        horizontal={true}
        
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => <ProductListItem product={item} />}
      />

      
    </View>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f8f8f8',
    justifyContent: 'space-between',
  },
  productList: {
    marginTop: 10,
  },
  
});

export default InventoryProductListByCategory;
