import { Platform, Pressable } from 'react-native'; // Add this import
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import React, { useEffect } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useUser } from '@clerk/clerk-expo';
import { addDoc, collection, doc, getDocs, query, setDoc, where, serverTimestamp } from '@firebase/firestore';
import { db } from '../../config/FirebaseConfig';
import * as Notifications from 'expo-notifications'; // Import expo-notifications
import { Ionicons } from '@expo/vector-icons';

export default function CartScreen() {
  const { product, quantity } = useLocalSearchParams();
  const { user } = useUser();
  const router = useRouter();
  const handleGoBack = () => {
    router.back(); // Navigate back to the previous screen
  };

  let parsedProduct;
  try {
    parsedProduct = typeof product === 'string' ? JSON.parse(product) : product;
  } catch (error) {
    console.error("Error parsing product:", error);
    parsedProduct = {};
  }

  const itemQuantity = Number(quantity) || 1;
  const totalPrice = (parsedProduct?.price || 0) * itemQuantity;

  // Function to request notification permission
  useEffect(() => {
    const requestPermission = async () => {
      if (Platform.OS === 'android') {
        const { status } = await Notifications.requestPermissionsAsync();
        if (status !== 'granted') {
          console.log('Permission not granted for notifications');
        }
      }
    };
    requestPermission();
  }, []);

  // Function to send notification when order is placed
  const sendOrderNotification = async () => {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Order Placed",
          body: `Your order for ${itemQuantity} ${parsedProduct?.name} has been successfully placed! Total: Rs. ${totalPrice.toFixed(2)}`,
        },
        trigger: null, // Immediate notification
      });
    } catch (error) {
      console.error("Error sending notification:", error);
    }
  };

  const InitiateChat = async () => {
    try {
      const userEmail = user?.primaryEmailAddress?.emailAddress;
      const sellerEmail = parsedProduct?.email;
  
      if (!userEmail || !sellerEmail) {
        console.error("User email or seller email is missing.");
        return;
      }
  
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
            {
              id: userEmail,
              name: user?.fullName,
              imageUrl: user?.imageUrl,
            },
            {
              id: sellerEmail,
              name: parsedProduct?.username,
              imageUrl: parsedProduct?.userImage,
            },
          ],
          userIds: [userEmail, sellerEmail],
        });
      }
  
      if (!chatDocId) {
        console.error("Error: chatDocId is undefined.");
        return;
      }
  
      // Firestore reference for storing messages
      const messagesRef = collection(db, 'Chat', chatDocId, 'messages');
  
      // Store order message in chat
      await addDoc(messagesRef, {
        sender: {
          id: user?.primaryEmailAddress?.emailAddress || 'unknown',
          name: user?.fullName || 'Anonymous',
          imageUrl: user?.imageUrl || '',
        },
        text: `Order placed for ${itemQuantity} ${parsedProduct?.measureUnit || "unit"} of ${parsedProduct?.name} at Rs. ${totalPrice.toFixed(2)}`,
        messageType: 'text',
        timestamp: serverTimestamp(),
      });
  
      // Store order in Firestore in 'orders' collection
      
  
      // Send notification to user
      await sendOrderNotification();
  
      // Navigate to checkout
      router.push({
        pathname: "/Checkout",
        params: {
          product: JSON.stringify(parsedProduct),
          quantity: itemQuantity,
          totalPrice: totalPrice.toFixed(2),
        },
      });
    } catch (error) {
      console.error("Error initiating chat or storing order message:", error);
    }
  };
  

  return (
    <View style={styles.container}>
      <View style={{flexDirection: 'row',
                      alignItems: 'center',
                      marginTop: 10,
                      marginBottom: 10,}}>
                                <Pressable onPress={handleGoBack} style={{padding: 10,
                      backgroundColor: 'rgba(255, 255, 255, 0.7)',
                      borderRadius: 30,
                      elevation: 5,}}>
                                  <Ionicons name="arrow-back" size={20} color="black" />
                                </Pressable>
                                <Text style={{fontSize: 20,
                      fontWeight: 'bold',
                      color: '#333',
                      textAlign: 'center',
                      flex: 1,}}>Shopping Cart</Text>
                              </View>
      <View style={styles.cartItem}>
        {parsedProduct?.imageUrl ? (
          <Image 
            source={{ uri: parsedProduct?.imageUrl }} 
            style={styles.productImage} 
            resizeMode="cover"
          />
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
        <Text style={styles.totalPrice}>
          Total Price: Rs. {totalPrice.toFixed(2)} / {parsedProduct?.measureUnit}
        </Text>
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
    padding: 20,
    backgroundColor: '#f9f9f9',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 30,
    elevation: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  cartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  productImage: {
    width: 100,
    height: 100,
    borderRadius: 12,
    marginRight: 15,
  },
  noImage: {
    fontSize: 14,
    color: '#888',
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  productPrice: {
    fontSize: 16,
    marginBottom: 8,
  },
  quantity: {
    fontSize: 16,
    color: '#555',
    marginBottom: 8,
  },
  totalSection: {
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  totalPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0a74da',
  },
  buyButton: {
    backgroundColor: '#0a74da',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  buyButtonText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },
});
