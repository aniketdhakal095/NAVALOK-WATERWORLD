import React from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';

import InventoryProductListByCategory from '../../components/Farmer/InventoryProductListbyCategory';
import InventorySearch from '../../components/Farmer/InventorySearch';

export default function Console() {
  const router = useRouter();

  const handleSellProduct = () => {
    Alert.alert(
      'Sell Product',
      'Select the type of product you want to sell:',
      [
        {
          text: 'Inventory Product',
          onPress: () => router.push('/inventory-sell-product'),
        },
        {
          text: 'Aquarium Equipment',
          onPress: () => router.push('/farm-sell-product'),
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={20} color="black" />
        </Pressable>
        <Text style={styles.title}>Your Console</Text>
      </View>

      {/* Search + Product List (FlatList handles scroll internally) */}
      <InventorySearch />
      <InventoryProductListByCategory />

      {/* Bottom Buttons */}
      <View style={styles.buttonContainer}>
        {/* View Product */}
        <TouchableOpacity
          style={styles.sellButton}
          onPress={() => router.push('/view-product')}
        >
          <Ionicons name="eye-outline" size={20} color="#fff" />
          <Text style={styles.sellButtonText}>View Your Product</Text>
        </TouchableOpacity>

        {/* Sell Product */}
        <TouchableOpacity
          style={styles.sellButton}
          onPress={handleSellProduct}
        >
          <Ionicons name="pricetag-outline" size={20} color="#fff" />
          <Text style={styles.sellButtonText}>Sell Product</Text>
        </TouchableOpacity>

        {/* Order List */}
        <TouchableOpacity
          style={styles.sellButton}
          onPress={() => router.push('Orderlist')}
        >
          <Ionicons name="clipboard-outline" size={20} color="#fff" />
          <Text style={styles.sellButtonText}>Order List</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

/* ===================== STYLES ===================== */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },

  backButton: {
    padding: 10,
    backgroundColor: 'rgba(255,255,255,0.7)',
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

  buttonContainer: {
    position: 'absolute',
    bottom: 10,
    left: 20,
    right: 20,
    gap: 8,
  },

  sellButton: {
    backgroundColor: '#007bff',
    paddingVertical: 5,
    borderRadius: 30,
    flexDirection: 'row',
    alignItems: "flex-start",
    justifyContent: 'center',
    gap: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },

  sellButtonText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
    textTransform: 'uppercase',
  },
});
