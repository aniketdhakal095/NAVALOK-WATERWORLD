import { View, FlatList, StyleSheet } from 'react-native';
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
        horizontal
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ProductListItem product={item} />
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f8f8f8',
  },
  productList: {
    marginTop: 10,
  },
});

export default InventoryProductListByCategory;