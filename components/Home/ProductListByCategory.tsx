import { View, FlatList, Text, StyleSheet, ActivityIndicator, Dimensions } from 'react-native';
import React, { useState, useEffect } from 'react';
import Category from './Category';
import { db } from '../../config/FirebaseConfig';
import { collection, query, where, getDocs, DocumentData } from 'firebase/firestore';
import ProductListItem from './ProductListItem';

const { width } = Dimensions.get('window'); // Get screen width
const ITEM_WIDTH = width / 2 - 20; // Ensure two columns with spacing

const ProductListByCategory = () => {
  const [productList, setProductList] = useState<DocumentData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // Fetch products for a given category
  const GetProductList = async (category: string) => {
    try {
      setLoading(true);
      setProductList([]);
      const q = query(collection(db, 'Product'), where('category', '==', category));
      const querySnapshot = await getDocs(q);

      const products: DocumentData[] = [];
      querySnapshot.forEach(doc => {
        products.push(doc.data());
      });

      setProductList(products);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching products:', error);
      setLoading(false);
    }
  };

  // Load the "Fruits" category by default when the component mounts
  useEffect(() => {
    GetProductList('Fruits');
  }, []); // Empty dependency array ensures this only runs once

  return (
    <View style={styles.container}>
      <Category category={(value) => GetProductList(value)} />
      
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" style={styles.loader} />
      ) : (
        <FlatList
          data={productList}
          showsVerticalScrollIndicator={true}
          numColumns={2} // Ensures 2 columns
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => <ProductListItem product={item} />}
          columnWrapperStyle={styles.row} // Ensures proper spacing
          ListEmptyComponent={<Text style={styles.emptyMessage}>No products found</Text>}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 10,
    paddingTop: 10,
  },
  row: {
    justifyContent: 'space-between',
  },
  productItem: {
    width: ITEM_WIDTH,
    marginBottom: 10,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
  },
  emptyMessage: {
    textAlign: 'center',
    fontSize: 16,
    marginTop: 20,
    color: 'gray',
  },
});

export default ProductListByCategory;
