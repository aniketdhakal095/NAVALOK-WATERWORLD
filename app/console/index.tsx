import React, { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';

import InventorySearch from '../../components/Farmer/InventorySearch';
import InventoryProductListByCategory from '../../components/Farmer/InventoryProductListbyCategory';

export default function Console() {
  const router = useRouter();
  const [showCategories, setShowCategories] = useState(true);

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

      {/* Toggle Categories */}
      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={[styles.toggleButton, showCategories && styles.toggleButtonActive]}
          onPress={() => setShowCategories(true)}
        >
          <Ionicons name="grid" size={18} color={showCategories ? '#fff' : '#666'} />
          <Text style={[styles.toggleText, showCategories && styles.toggleTextActive]}>
            Browse
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.toggleButton, !showCategories && styles.toggleButtonActive]}
          onPress={() => setShowCategories(false)}
        >
          <Ionicons name="search" size={18} color={!showCategories ? '#fff' : '#666'} />
          <Text style={[styles.toggleText, !showCategories && styles.toggleTextActive]}>
            Search
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content Area */}
      <View style={styles.contentWrapper}>
        {showCategories ? (
          <InventoryProductListByCategory />
        ) : (
          <InventorySearch />
        )}
      </View>

      {/* Bottom Buttons */}
      <View style={styles.buttonContainer}>
        {/* View Product */}
        <TouchableOpacity
          style={styles.sellButton}
          onPress={() => router.push('/view-product')}
        >
          <Ionicons name="eye-outline" size={18} color="#fff" />
          <Text style={styles.sellButtonText}>View</Text>
        </TouchableOpacity>

        {/* Sell Product */}
        <TouchableOpacity
          style={styles.sellButton}
          onPress={handleSellProduct}
        >
          <Ionicons name="pricetag-outline" size={18} color="#fff" />
          <Text style={styles.sellButtonText}>Sell</Text>
        </TouchableOpacity>

        {/* Order List */}
        <TouchableOpacity
          style={styles.sellButton}
          onPress={() => router.push('/Orderlist')}
        >
          <Ionicons name="clipboard-outline" size={18} color="#fff" />
          <Text style={styles.sellButtonText}>Orders</Text>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },

  backButton: {
    padding: 8,
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: 20,
    elevation: 2,
  },

  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    textAlign: 'center',
  },

  toggleContainer: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },

  toggleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    gap: 6,
  },

  toggleButtonActive: {
    backgroundColor: '#2E86DE',
  },

  toggleText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
  },

  toggleTextActive: {
    color: '#fff',
  },

  contentWrapper: {
    flex: 1,
  },

  buttonContainer: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingBottom: 12,
    paddingTop: 8,
    gap: 8,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },

  sellButton: {
    flex: 1,
    backgroundColor: '#2E86DE',
    paddingVertical: 10,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    elevation: 2,
  },

  sellButtonText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#fff',
  },
});