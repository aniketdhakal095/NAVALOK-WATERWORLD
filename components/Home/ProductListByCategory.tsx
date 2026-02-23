import { View, FlatList, Text, StyleSheet, ActivityIndicator } from 'react-native';
import React, { useState, useEffect } from 'react';
import Category from './Category';
import { db } from '../../config/FirebaseConfig';
import { collection, query, where, getDocs, DocumentData } from 'firebase/firestore';
import ProductListItem from './ProductListItem';

const ProductListByCategory = () => {
  const [productList, setProductList] = useState<DocumentData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const GetProductList = async (category: string) => {
    try {
      setLoading(true);
      setProductList([]);
      const q = query(collection(db, 'Product'), where('category', '==', category));
      const querySnapshot = await getDocs(q);

      const products: DocumentData[] = [];
      querySnapshot.forEach((doc) => {
        products.push({
          id: doc.id,
          collectionName: 'Product',
          ...doc.data(),
        });
      });

      setProductList(products);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching products:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    GetProductList('Fruits');
  }, []);

  return (
    <View style={styles.container}>
      <Category category={(value) => GetProductList(value)} />

      {loading ? (
        <ActivityIndicator size="large" color="#0a74da" style={styles.loader} />
      ) : (
        <FlatList
          data={productList}
          showsVerticalScrollIndicator={false}
          numColumns={2}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <ProductListItem product={item} />}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.productList}
          ListEmptyComponent={<Text style={styles.emptyMessage}>No products found</Text>}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 2,
    paddingTop: 6,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  loader: {
    marginTop: 24,
  },
  productList: {
    paddingTop: 10,
    paddingBottom: 22,
  },
  emptyMessage: {
    textAlign: 'center',
    fontSize: 16,
    marginTop: 26,
    color: '#64748b',
    fontFamily: 'outfits-medium',
  },
});

export default ProductListByCategory;
