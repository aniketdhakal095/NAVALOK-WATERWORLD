import { View, FlatList, StyleSheet, Text } from 'react-native';
import React, { useState } from 'react';
import InventoryCategory from './InventoryCategory';
import { db } from '../../config/FirebaseConfig';
import { collection, query, where, getDocs, DocumentData } from 'firebase/firestore';
import ProductListItem from '../Home/ProductListItem';

interface Product extends DocumentData {
  id: string;
}

const InventoryProductListByCategory: React.FC = () => {
  const [productList, setProductList] = useState<Product[]>([]);

  const GetProductList = async (category: string): Promise<void> => {
    try {
      const q = query(
        collection(db, 'InventoryProduct'),
        where('category', '==', category)
      );

      const querySnapshot = await getDocs(q);

      const products: Product[] = [];

      querySnapshot.forEach((doc) => {
        products.push({
          id: doc.id,
          ...doc.data(),
        } as Product);
      });

      setProductList(products);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  return (
    <View style={styles.container}>
      <InventoryCategory category={(value: string) => GetProductList(value)} />

      <FlatList
        data={productList}
        style={styles.productList}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.content}
        renderItem={({ item }) => (
          <ProductListItem product={item} />
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No items found for this category.</Text>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 12,
    paddingTop: 6,
    backgroundColor: 'transparent',
  },
  productList: {
    marginTop: 10,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  content: {
    paddingBottom: 24,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 26,
    color: '#64748b',
    fontFamily: 'outfits-medium',
    fontSize: 14,
  },
});

export default InventoryProductListByCategory;
