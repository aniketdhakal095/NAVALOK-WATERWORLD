import { View, Text, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
import React, { useState, useEffect } from 'react';

export default function SelectQuantity({ onQuantityChange, product }) {
  const [quantity, setQuantity] = useState<number>(1);
  const [error, setError] = useState('');
  const maxQuantity = product?.quantity ?? 1;

  useEffect(() => {
    if (quantity > maxQuantity) {
      setError('This quantity is not available');
    } else {
      setError('');
    }
  }, [quantity, maxQuantity]);

  const increaseQuantity = () => {
    if (quantity < maxQuantity) {
      const newQuantity = quantity + 1;
      setQuantity(newQuantity);
      onQuantityChange(newQuantity);
    }
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      const newQuantity = quantity - 1;
      setQuantity(newQuantity);
      onQuantityChange(newQuantity);
    }
  };

  const handleQuantityChange = (text: string) => {
    if (text === '') {
      setQuantity(0);
    } else {
      let newQuantity = parseInt(text, 10);
      if (!isNaN(newQuantity)) {
        if (newQuantity > maxQuantity) {
          setError('This quantity is not available');
        } else {
          setError('');
        }

        if (newQuantity > maxQuantity) newQuantity = maxQuantity;
        if (newQuantity < 1) newQuantity = 1;

        setQuantity(newQuantity);
        onQuantityChange(newQuantity);
      }
    }
  };

  const handleBlur = () => {
    if (quantity === 0) {
      setQuantity(1);
      onQuantityChange(1);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.button, quantity <= 1 && styles.disabledButton]}
        onPress={decreaseQuantity}
        disabled={quantity <= 1}
      >
        <Text style={styles.buttonText}>−</Text>
      </TouchableOpacity>

      <TextInput
        style={styles.quantityInput}
        value={quantity > 0 ? quantity.toString() : ''}
        onChangeText={handleQuantityChange}
        keyboardType="numeric"
        onBlur={handleBlur}
      />

      <TouchableOpacity
        style={[styles.button, quantity >= maxQuantity && styles.disabledButton]}
        onPress={increaseQuantity}
        disabled={quantity >= maxQuantity}
      >
        <Text style={styles.buttonText}>+</Text>
      </TouchableOpacity>

      <Text style={styles.measureUnit}>{product?.measureUnit || 'unit'}</Text>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginVertical: 10,
    justifyContent: 'center',
  },
  button: {
    backgroundColor: '#0a74da',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: 40,
  },
  disabledButton: {
    backgroundColor: '#a0c4ff',
    opacity: 0.6,
  },
  buttonText: {
    fontSize: 22,
    color: '#fff',
    fontWeight: 'bold',
  },
  quantityInput: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    width: 60,
    textAlign: 'center',
    borderBottomWidth: 1,
    borderColor: '#ccc',
  },
  measureUnit: {
    fontSize: 16,
    marginLeft: 10,
    fontWeight: '600',
    color: '#333',
  },
  errorText: {
    width: '100%',
    marginTop: 8,
    color: 'red',
    fontSize: 14,
    textAlign: 'center',
  },
});
