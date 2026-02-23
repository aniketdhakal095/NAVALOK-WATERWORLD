import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Alert, Pressable, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { addDoc, collection, doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../config/FirebaseConfig';
import { useUser } from '@clerk/clerk-expo';

export default function CheckoutScreen() {
  const { product: rawProduct, quantity: rawQuantity, totalPrice: rawTotalPrice, collectionType: rawCollectionType } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useUser();
  const [selectedPayment, setSelectedPayment] = useState('Online Payment');

  let parsedProduct;
  try {
    parsedProduct = typeof rawProduct === 'string' ? JSON.parse(rawProduct) : rawProduct;
  } catch (error) {
    console.error('Error parsing product:', error);
    parsedProduct = {};
  }

  const quantity = Number(rawQuantity) || 1;
  const totalPrice = Number(rawTotalPrice) || 0;

  const initialCollectionType = Array.isArray(rawCollectionType) ? rawCollectionType[0] : rawCollectionType || 'Product';

  useEffect(() => {
    if (!parsedProduct?.id) {
      Alert.alert('Error', 'Invalid product selected.', [{ text: 'OK', onPress: () => router.back() }]);
    }
  }, [parsedProduct?.id, router]);

  if (!parsedProduct?.id) {
    return null;
  }

  const handleGoBack = () => router.back();

  const confirmOrder = async () => {
    try {
      const buyerEmail = user?.primaryEmailAddress?.emailAddress;
      if (!buyerEmail) {
        Alert.alert('Error', 'Please login again to place your order.');
        return;
      }

      const ownerEmail = parsedProduct?.email;
      if (!ownerEmail) {
        Alert.alert('Error', 'Product owner information is missing.');
        return;
      }

      const orderData = {
        product: {
          name: parsedProduct?.name || 'Unknown Product',
          price: parsedProduct?.price || 0,
          productId: parsedProduct?.id,
          quantity,
          measureUnit: parsedProduct?.measureUnit || 'unit',
          email: ownerEmail,
          imageUrl: parsedProduct?.imageUrl || '',
        },
        totalPrice,
        paymentMethod: selectedPayment,
        orderDate: new Date(),
        userEmail: buyerEmail,
        userId: user?.id || '',
        productOwnerEmail: ownerEmail,
        status: 'Waiting',
      };

      const collectionsToTry = ['Product', 'InventoryProduct', 'Fish_Plant'];
      let productSnapshot = null;
      let finalCollectionType = initialCollectionType;

      productSnapshot = await getDoc(doc(db, initialCollectionType, parsedProduct.id));

      if (!productSnapshot.exists()) {
        for (let col of collectionsToTry) {
          if (col === initialCollectionType) continue;
          const snap = await getDoc(doc(db, col, parsedProduct.id));
          if (snap.exists()) {
            productSnapshot = snap;
            finalCollectionType = col;
            break;
          }
        }
      }

      if (!productSnapshot || !productSnapshot.exists()) {
        Alert.alert('Error', 'Product does not exist in any collection.');
        return;
      }

      const currentQuantity = Number(productSnapshot.data()?.quantity || 0);
      if (currentQuantity <= 0) {
        Alert.alert('Out of Stock', 'This product is currently out of stock.');
        return;
      }
      if (currentQuantity < quantity) {
        Alert.alert('Error', 'Not enough stock available.');
        return;
      }

      await updateDoc(doc(db, finalCollectionType, parsedProduct.id), { quantity: currentQuantity - quantity });

      const orderRef = await addDoc(collection(db, 'Orders'), orderData);
      console.log('Order stored with ID:', orderRef.id);

      if (selectedPayment === 'Online Payment') {
        router.push(`/PaymentPage?orderId=${orderRef.id}`);
      } else {
        Alert.alert('Order Placed', 'Your order has been successfully placed!', [
          { text: 'OK', onPress: () => router.push('/home') },
        ]);
      }
    } catch (error) {
      console.error('Error during checkout:', error);
      Alert.alert('Error', 'There was an issue placing your order.');
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.bgTopBlob} />
      <View style={styles.bgBottomBlob} />

      <View style={styles.header}>
        <Pressable onPress={handleGoBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={20} color="#0f172a" />
        </Pressable>
        <Text style={styles.headerTitle}>Confirm Order</Text>
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
          <Ionicons name="logo-usd" size={22} color={selectedPayment === 'Online Payment' ? 'white' : '#334155'} />
          <Text style={[styles.paymentText, selectedPayment === 'Online Payment' && styles.selectedPaymentText]}>
            Online Payment
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.paymentButton, selectedPayment === 'Cash' && styles.selectedPayment]}
          onPress={() => setSelectedPayment('Cash')}
        >
          <Ionicons name="cash-outline" size={22} color={selectedPayment === 'Cash' ? 'white' : '#334155'} />
          <Text style={[styles.paymentText, selectedPayment === 'Cash' && styles.selectedPaymentText]}>
            Cash on Delivery
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.confirmButton} onPress={confirmOrder}>
        <Text style={styles.confirmButtonText}>Confirm Order and Check Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f7fb' },
  content: { padding: 16, paddingBottom: 30 },
  bgTopBlob: {
    position: 'absolute',
    top: -120,
    right: -70,
    width: 240,
    height: 240,
    borderRadius: 130,
    backgroundColor: 'rgba(53, 109, 231, 0.18)',
  },
  bgBottomBlob: {
    position: 'absolute',
    bottom: -140,
    left: -90,
    width: 260,
    height: 260,
    borderRadius: 140,
    backgroundColor: 'rgba(22, 167, 111, 0.12)',
  },
  header: { flexDirection: 'row', alignItems: 'center', marginVertical: 8 },
  backButton: {
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: 'outfits-extrabold',
    color: '#0f172a',
    marginLeft: 10,
  },
  orderCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    elevation: 3,
  },
  productImage: { width: 84, height: 84, borderRadius: 12, marginRight: 14 },
  productInfo: { flex: 1 },
  productName: { fontSize: 18, fontFamily: 'outfits-medium', color: '#0f172a', marginBottom: 5 },
  productPrice: { fontSize: 14, color: '#475569', fontFamily: 'outfits' },
  quantity: { fontSize: 14, color: '#475569', fontFamily: 'outfits', marginTop: 4 },
  totalSection: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 14,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  totalLabel: { fontSize: 16, fontFamily: 'outfits-medium', color: '#334155' },
  totalPrice: { fontSize: 22, fontFamily: 'outfits-extrabold', color: '#0a74da' },
  paymentTitle: { fontSize: 18, fontFamily: 'outfits-medium', color: '#0f172a', marginBottom: 10 },
  paymentOptions: { marginBottom: 20 },
  paymentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  selectedPayment: { backgroundColor: '#0a74da', borderColor: '#0a74da' },
  paymentText: { fontSize: 16, marginLeft: 10, color: '#334155', fontFamily: 'outfits-medium' },
  selectedPaymentText: { color: '#fff' },
  confirmButton: { backgroundColor: '#0a74da', paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  confirmButtonText: { fontSize: 18, color: '#fff', fontFamily: 'outfits-medium' },
});
