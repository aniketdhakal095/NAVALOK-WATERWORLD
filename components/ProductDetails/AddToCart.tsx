import { View, Text, Alert, TouchableOpacity, StyleSheet } from 'react-native';
import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import SelectQuantity from './SelectQuantity'; // Your quantity selector component

export default function AddToCart({ product }) {
  const [quantity, setQuantity] = useState(1);
  const router = useRouter();

  const handleAddToCart = () => {
    if (quantity > product.quantity) {
      Alert.alert('Error', 'This quantity is not available');
      return;
    }

    Alert.alert("Success", `${quantity} x ${product.name} added to cart!`);

    router.push({
      pathname: '/cart',
      params: {
        product: JSON.stringify(product), // Pass product as a string
        quantity: quantity.toString(),
      },
    });
  };

  const isOutOfStock = product.quantity === 0;

  return (
    <View style={styles.container}>
      <SelectQuantity onQuantityChange={setQuantity} product={product} />

      <TouchableOpacity
        style={[styles.button, isOutOfStock && styles.disabledButton]}
        onPress={handleAddToCart}
        disabled={isOutOfStock}
      >
        <Text style={styles.buttonText}>
          {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

// Styles for the AddToCart component
const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    paddingHorizontal: 16,
    paddingVertical: 24,
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  button: {
    backgroundColor: '#0a74da',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },
});
