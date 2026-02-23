import { Platform, Pressable } from 'react-native';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import React, { useEffect } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useUser } from '@clerk/clerk-expo';
import { addDoc, collection, doc, getDocs, query, setDoc, where, serverTimestamp } from '@firebase/firestore';
import { db } from '../../config/FirebaseConfig';
import * as Notifications from 'expo-notifications';
import { Ionicons } from '@expo/vector-icons';

export default function CartScreen() {
  const { product, quantity } = useLocalSearchParams();
  const { user } = useUser();
  const router = useRouter();

  const handleGoBack = () => router.back();

  let parsedProduct;
  try {
    parsedProduct = typeof product === 'string' ? JSON.parse(product) : product;
  } catch (error) {
    console.error('Error parsing product:', error);
    parsedProduct = {};
  }

  const itemQuantity = Number(quantity) || 1;
  const totalPrice = (parsedProduct?.price || 0) * itemQuantity;

  if (!parsedProduct.collectionType) {
    if (parsedProduct.species || parsedProduct.waterType) {
      parsedProduct.collectionType = 'Fish_Plant';
    } else if (parsedProduct.category === 'InventoryProduct') {
      parsedProduct.collectionType = 'InventoryProduct';
    } else {
      parsedProduct.collectionType = 'Product';
    }
  }

  useEffect(() => {
    const requestPermission = async () => {
      if (Platform.OS === 'android') {
        const { status } = await Notifications.requestPermissionsAsync();
        if (status !== 'granted') console.log('Permission not granted for notifications');
      }
    };
    requestPermission();
  }, []);

  const sendOrderNotification = async () => {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Order Placed',
          body: `Your order for ${itemQuantity} ${parsedProduct?.name} has been successfully placed! Total: Rs. ${totalPrice.toFixed(2)}`,
        },
        trigger: null,
      });
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  };

  const InitiateChat = async () => {
    try {
      const userEmail = user?.primaryEmailAddress?.emailAddress;
      const sellerEmail = parsedProduct?.email;

      if (!userEmail || !sellerEmail) return;

      const docId1 = `${userEmail}_${sellerEmail}`;
      const docId2 = `${sellerEmail}_${userEmail}`;

      const q = query(collection(db, 'Chat'), where('id', 'in', [docId1, docId2]));
      const querySnapshot = await getDocs(q);

      let chatDocId;
      if (!querySnapshot.empty) {
        chatDocId = querySnapshot.docs[0].id;
      } else {
        chatDocId = docId1;
        await setDoc(doc(db, 'Chat', chatDocId), {
          id: chatDocId,
          users: [
            { id: userEmail, name: user?.fullName, imageUrl: user?.imageUrl },
            { id: sellerEmail, name: parsedProduct?.username, imageUrl: parsedProduct?.userImage },
          ],
          userIds: [userEmail, sellerEmail],
        });
      }

      const messagesRef = collection(db, 'Chat', chatDocId, 'messages');
      await addDoc(messagesRef, {
        sender: {
          id: userEmail,
          name: user?.fullName || 'Anonymous',
          imageUrl: user?.imageUrl || '',
        },
        text: `Order placed for ${itemQuantity} ${parsedProduct?.measureUnit || 'unit'} of ${parsedProduct?.name} at Rs. ${totalPrice.toFixed(2)}`,
        messageType: 'text',
        timestamp: serverTimestamp(),
      });

      await sendOrderNotification();

      router.push({
        pathname: '/Checkout',
        params: {
          product: JSON.stringify(parsedProduct),
          quantity: itemQuantity,
          totalPrice: totalPrice.toFixed(2),
          collectionType: parsedProduct.collectionType,
        },
      });
    } catch (error) {
      console.error('Error initiating chat/order message:', error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.bgTopBlob} />
      <View style={styles.bgBottomBlob} />

      <View style={styles.header}>
        <Pressable onPress={handleGoBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={20} color="#0f172a" />
        </Pressable>
        <Text style={styles.headerTitle}>Shopping Cart</Text>
      </View>

      <View style={styles.cartItem}>
        {parsedProduct?.imageUrl ? (
          <Image source={{ uri: parsedProduct?.imageUrl }} style={styles.productImage} resizeMode="cover" />
        ) : (
          <Text style={styles.noImage}>No Image Available</Text>
        )}
        <View style={styles.productInfo}>
          <Text style={styles.productName}>{parsedProduct?.name || 'Unknown Product'}</Text>
          <Text style={styles.productPrice}>Rs. {parsedProduct?.price || '0.00'} / {parsedProduct?.measureUnit}</Text>
          <Text style={styles.quantity}>Quantity: {itemQuantity} {parsedProduct?.measureUnit || 'unit'}</Text>
        </View>
      </View>

      <View style={styles.totalSection}>
        <Text style={styles.totalLabel}>Total Price</Text>
        <Text style={styles.totalPrice}>Rs. {totalPrice.toFixed(2)}</Text>
      </View>

      <TouchableOpacity style={styles.buyButton} onPress={InitiateChat}>
        <Text style={styles.buyButtonText}>Place Order</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f3f7fb',
    justifyContent: 'space-between',
  },
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
  header: { flexDirection: 'row', alignItems: 'center', marginTop: 8, marginBottom: 12 },
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
  cartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    elevation: 3,
  },
  productImage: { width: 100, height: 100, borderRadius: 12, marginRight: 14 },
  noImage: { fontSize: 14, color: '#64748b' },
  productInfo: { flex: 1 },
  productName: { fontSize: 18, fontFamily: 'outfits-medium', color: '#0f172a', marginBottom: 8 },
  productPrice: { fontSize: 14, color: '#475569', fontFamily: 'outfits', marginBottom: 6 },
  quantity: { fontSize: 14, color: '#475569', fontFamily: 'outfits-medium' },
  totalSection: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  totalLabel: { fontSize: 16, fontFamily: 'outfits-medium', color: '#334155' },
  totalPrice: { fontSize: 20, fontFamily: 'outfits-extrabold', color: '#0a74da' },
  buyButton: {
    backgroundColor: '#0a74da',
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 14,
  },
  buyButtonText: { fontSize: 18, color: '#fff', fontFamily: 'outfits-medium' },
});
