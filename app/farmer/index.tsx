import { View, Text, Pressable, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import InventoryProductListByCategory from '../../components/Farmer/InventoryProductListbyCategory';
import InventorySearch from '../../components/Farmer/InventorySearch';
import { ScrollView } from 'react-native-gesture-handler';
import React from 'react';

export default function Farmer() {
  const router = useRouter(); // Correctly call useRouter here
  const handleGoBack = () => {
    router.back(); // Navigate back to the previous screen
  };

  const handleSellProduct = () => {
    Alert.alert(
      "Sell Product",
      "Select the type of product you want to sell:",
      [
        {
          text: "Inventory Product",
          onPress: () => router.push('/inventory-sell-product'),
        },
        {
          text: "Farm Product",
          onPress: () => router.push('/farm-sell-product'),
        },
        { text: "Cancel", style: "cancel" },
      ]
    );
  };

  return (
    
    <View style={styles.container}>
      {/* Back Button and Title Container */}
      <View style={styles.header}>
        <Pressable onPress={handleGoBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={20} color="black" />
        </Pressable>
        <Text style={styles.title}>Farmer Console</Text>
      </View>

      <InventorySearch/>
      <InventoryProductListByCategory />

      {/* Buttons Container */}
      <View style={styles.buttonContainer}>
        {/* View Product Button */}
        <TouchableOpacity
          style={styles.sellButton}
          onPress={() => router.push('/view-product')}
        >
          <Text style={styles.sellButtonText}>View Your Product</Text>
        </TouchableOpacity>

        {/* Sell Product Button */}
        <TouchableOpacity
          style={styles.sellButton}
          onPress={handleSellProduct}
        >
          <Text style={styles.sellButtonText}>Sell Product</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.sellButton}
          onPress={()=> router.push('Orderlist')}
        >
          <Text style={styles.sellButtonText}>Order list</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f8f8f8',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 10,
  },
  backButton: {
    padding: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 30,
    elevation: 5,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    flex: 1,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    gap: 10, // Spacing between buttons
  },
  sellButton: {
    backgroundColor: '#007bff',
    paddingVertical: 15,
    borderRadius: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  sellButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    textTransform: 'uppercase',
  },
});
