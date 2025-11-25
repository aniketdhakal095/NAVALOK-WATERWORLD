import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Alert, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { addDoc, collection, doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../config/FirebaseConfig';
import { useUser } from '@clerk/clerk-react';

export default function CheckoutScreen() {
  const { product: rawProduct, quantity: rawQuantity, totalPrice: rawTotalPrice } = useLocalSearchParams();

  const product = Array.isArray(rawProduct) ? rawProduct[0] : rawProduct;
  const quantity = Array.isArray(rawQuantity) ? rawQuantity[0] : rawQuantity;
  const totalPrice = Array.isArray(rawTotalPrice) ? rawTotalPrice[0] : rawTotalPrice;

  const router = useRouter();

  const handleGoBack = () => {
    router.back();
  };

  const { user } = useUser();

  let parsedProduct;
  try {
    parsedProduct = typeof product === 'string' ? JSON.parse(product) : product;
  } catch (error) {
    console.error('Error parsing product:', error);
    parsedProduct = {};
  }

  const [selectedPayment, setSelectedPayment] = useState('Online Payment');

  const orderData = {
    product: {
      name: parsedProduct?.name || 'Unknown Product',
      price: parsedProduct?.price || 0,
      productId: parsedProduct?.id,
      quantity,
      measureUnit: parsedProduct?.measureUnit || 'unit',
      email: parsedProduct?.email || 'unknown@domain.com',
      imageUrl: parsedProduct?.imageUrl || '',
    },
    totalPrice: totalPrice || 0,
    paymentMethod: selectedPayment || 'Cash',
    orderDate: new Date(),
    userEmail: user?.primaryEmailAddress?.emailAddress || 'guest@domain.com',
    productOwnerEmail: parsedProduct?.email || 'unknown@domain.com',
    status: 'Waiting',
  };

  const confirmOrder = async () => {
    try {
      const productDocRef = doc(db, 'Product', parsedProduct?.id);
      const productSnapshot = await getDoc(productDocRef);

      if (!productSnapshot.exists()) {
        Alert.alert('Error', 'Product does not exist.');
        return;
      }

      const currentProductData = productSnapshot.data();
      const currentQuantity = parseInt(currentProductData?.quantity || 0);
      const orderQuantity = parseInt(quantity);

      if (currentQuantity < orderQuantity) {
        Alert.alert('Error', 'Not enough stock available.');
        return;
      }

      const newQuantity = currentQuantity - orderQuantity;

      await updateDoc(productDocRef, {
        quantity: newQuantity,
      });

      const orderRef = await addDoc(collection(db, 'Orders'), orderData);
      console.log('Order stored with ID:', orderRef.id);

      if (selectedPayment === 'Online Payment') {
        router.push(`/PaymentPage?orderId=${orderRef.id}`);
      } else {
        Alert.alert('Order Placed', 'Your order has been successfully placed!', [
          {
            text: 'OK',
            onPress: () => router.push('/home'),
          },
        ]);
      }
    } catch (error) {
      console.error('Error during order processing:', error);
      Alert.alert('Error', 'There was an issue placing your order. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10, marginBottom: 10 }}>
        <Pressable onPress={handleGoBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={20} color="black" />
        </Pressable>
        <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#333', textAlign: 'center', flex: 1 }}>
          Confirm Order
        </Text>
      </View>

      <View style={styles.orderCard}>
        <Image source={{ uri: parsedProduct?.imageUrl }} style={styles.productImage} />
        <View style={styles.productInfo}>
          <Text style={styles.productName}>{parsedProduct?.name}</Text>
          <Text style={styles.productPrice}>Rs. {parsedProduct?.price} / {parsedProduct?.measureUnit}</Text>
          <Text style={styles.quantity}>Quantity: {quantity} {parsedProduct?.measureUnit}</Text>
        </View>
      </View>

      <View style={styles.totalSection}>
        <Text style={styles.totalLabel}>Total Price</Text>
        <Text style={styles.totalPrice}>Rs. {totalPrice}</Text>
      </View>

      <Text style={styles.paymentTitle}>Select Payment Method</Text>
      <View style={styles.paymentOptions}>
        <TouchableOpacity
          style={[styles.paymentButton, selectedPayment === 'Online Payment' && styles.selectedPayment]}
          onPress={() => setSelectedPayment('Online Payment')}
        >
          <Ionicons name="logo-usd" size={24} color={selectedPayment === 'Online Payment' ? 'white' : '#333'} />
          <Text style={[styles.paymentText, selectedPayment === 'Online Payment' && styles.selectedPaymentText]}>
            Online Payment
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.paymentButton, selectedPayment === 'Cash' && styles.selectedPayment]}
          onPress={() => setSelectedPayment('Cash')}
        >
          <Ionicons name="cash-outline" size={24} color={selectedPayment === 'Cash' ? 'white' : '#333'} />
          <Text style={[styles.paymentText, selectedPayment === 'Cash' && styles.selectedPaymentText]}>
            Cash on Delivery
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.confirmButton} onPress={confirmOrder}>
        <Text style={styles.confirmButtonText}>Confirm Order and Check Out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f9f9f9',
  },
  orderCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
    elevation: 4,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
    marginRight: 15,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  productPrice: {
    fontSize: 16,
    color: '#555',
  },
  quantity: {
    fontSize: 14,
    color: '#777',
  },
  totalSection: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    elevation: 4,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  totalPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0a74da',
  },
  paymentTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  paymentOptions: {
    marginBottom: 20,
  },
  paymentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    backgroundColor: '#fff',
    elevation: 4,
  },
  selectedPayment: {
    backgroundColor: '#0a74da',
  },
  paymentText: {
    fontSize: 16,
    marginLeft: 10,
    color: '#333',
  },
  selectedPaymentText: {
    color: '#fff',
  },
  confirmButton: {
    backgroundColor: '#0a74da',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  confirmButtonText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },
  backButton: {
    padding: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 30,
    elevation: 5,
  },
});
