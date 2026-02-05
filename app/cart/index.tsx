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

  // Parse product
  let parsedProduct;
  try {
    parsedProduct = typeof product === 'string' ? JSON.parse(product) : product;
  } catch (error) {
    console.error("Error parsing product:", error);
    parsedProduct = {};
  }

  const itemQuantity = Number(quantity) || 1;
  const totalPrice = (parsedProduct?.price || 0) * itemQuantity;

  // Assign collectionType automatically based on a property
  if (!parsedProduct.collectionType) {
    if (parsedProduct.species || parsedProduct.waterType) {
      parsedProduct.collectionType = 'Fish_Plant';
    } else if (parsedProduct.category === 'InventoryProduct') {
      parsedProduct.collectionType = 'InventoryProduct';
    } else {
      parsedProduct.collectionType = 'Product';
    }
  }

  // Request notification permission
  useEffect(() => {
    const requestPermission = async () => {
      if (Platform.OS === 'android') {
        const { status } = await Notifications.requestPermissionsAsync();
        if (status !== 'granted') console.log('Permission not granted for notifications');
      }
    };
    requestPermission();
  }, []);

  // Send notification when order is placed
  const sendOrderNotification = async () => {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Order Placed",
          body: `Your order for ${itemQuantity} ${parsedProduct?.name} has been successfully placed! Total: Rs. ${totalPrice.toFixed(2)}`,
        },
        trigger: null,
      });
    } catch (error) {
      console.error("Error sending notification:", error);
    }
  };

  // Initiate order & chat
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
        text: `Order placed for ${itemQuantity} ${parsedProduct?.measureUnit || "unit"} of ${parsedProduct?.name} at Rs. ${totalPrice.toFixed(2)}`,
        messageType: 'text',
        timestamp: serverTimestamp(),
      });

      await sendOrderNotification();

      // Navigate to CheckoutScreen with collectionType
      router.push({
        pathname: "/Checkout",
        params: {
          product: JSON.stringify(parsedProduct),
          quantity: itemQuantity,
          totalPrice: totalPrice.toFixed(2),
          collectionType: parsedProduct.collectionType, // <-- crucial
        },
      });
    } catch (error) {
      console.error("Error initiating chat/order message:", error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={handleGoBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={20} color="black" />
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
          <Text style={styles.productName}>{parsedProduct?.name || "Unknown Product"}</Text>
          <Text style={styles.productPrice}>Rs. {parsedProduct?.price || "0.00"} / {parsedProduct?.measureUnit}</Text>
          <Text style={styles.quantity}>Quantity: {itemQuantity} {parsedProduct?.measureUnit || "unit"}</Text>
        </View>
      </View>

      <View style={styles.totalSection}>
        <Text style={styles.totalPrice}>Total Price: Rs. {totalPrice.toFixed(2)}</Text>
      </View>

      <TouchableOpacity style={styles.buyButton} onPress={InitiateChat}>
        <Text style={styles.buyButtonText}>Place Order</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f9f9f9', justifyContent: 'space-between' },
  header: { flexDirection: 'row', alignItems: 'center', marginVertical: 10 },
  backButton: { padding: 10, backgroundColor: 'rgba(255, 255, 255, 0.7)', borderRadius: 30, elevation: 5 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#333', textAlign: 'center', flex: 1 },
  cartItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 16, borderRadius: 12, marginBottom: 16, elevation: 4 },
  productImage: { width: 100, height: 100, borderRadius: 12, marginRight: 15 },
  noImage: { fontSize: 14, color: '#888' },
  productInfo: { flex: 1 },
  productName: { fontSize: 18, fontWeight: '600', color: '#333', marginBottom: 8 },
  productPrice: { fontSize: 16, marginBottom: 8 },
  quantity: { fontSize: 16, color: '#555', marginBottom: 8 },
  totalSection: { alignItems: 'flex-start', marginBottom: 20 },
  totalPrice: { fontSize: 18, fontWeight: 'bold', color: '#0a74da' },
  buyButton: { backgroundColor: '#0a74da', paddingVertical: 12, borderRadius: 8, alignItems: 'center', marginBottom: 20 },
  buyButtonText: { fontSize: 18, color: '#fff', fontWeight: 'bold' },
});
