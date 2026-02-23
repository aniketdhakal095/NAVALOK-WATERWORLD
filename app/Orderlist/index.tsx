import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, FlatList, Pressable } from 'react-native';
import { db } from '../../config/FirebaseConfig';
import { collection, getDocs, updateDoc, doc, addDoc, serverTimestamp } from 'firebase/firestore';
import { useUser } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

interface Order {
  id: string;
  userEmail: string;
  product?: { name: string };
  productOwnerEmail: string;
  status: string;
  totalPrice: number;
}

const OrderListScreen = () => {
  const { user } = useUser();
  const [orders, setOrders] = useState<Order[]>([]);
  const router = useRouter();
  const handleGoBack = () => {
    router.back(); // Navigate back to the previous screen
  };

  
  useEffect(() => {
    console.log(user); // Log user to check if it's available
  
    const fetchOrders = async () => {
      if (user) {
        try {
          const querySnapshot = await getDocs(collection(db, 'Orders'));
          const fetchedOrders: Order[] = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as Order[];
  
          const filteredOrders = fetchedOrders.filter(
            (order) => order.productOwnerEmail === user?.primaryEmailAddress?.emailAddress
          );
  
          console.log("Filtered Orders:", filteredOrders); // Log filtered orders
          setOrders(filteredOrders);
        } catch (error) {
          console.error("Error fetching orders:", error);
        }
      } else {
        console.log("User is not logged in");
      }
    };
  
    fetchOrders();
  }, [user]);
  
      

  
  const handleOrderUpdate = async (orderId: string, userEmail: string, productOwnerEmail: string, productName: string, status: string) => {
    try {
      const orderRef = doc(db, 'Orders', orderId);
      await updateDoc(orderRef, { status });
  
      // Update the local state with the new status
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === orderId ? { ...order, status } : order
        )
      );
  
      // Log userEmail and productOwnerEmail to check if they are correct
      console.log("userEmail:", userEmail);
      console.log("productOwnerEmail:", productOwnerEmail);
  
      // Construct the chatDocId using userEmail and productOwnerEmail
      const chatDocId = `${userEmail}_${productOwnerEmail}`;
      const message = `Your order for ${productName || "a product"} has been ${status.toLowerCase()}.`;
  
      // Log the generated chatDocId and the message
      console.log("Generated chatDocId:", chatDocId);
      console.log("Message to be sent:", message);
  
      // Send the message to Firestore
      await sendMessage(chatDocId, userEmail, message);
  
      // Show success alert
      Alert.alert(`Order ${status}`, `The order has been ${status.toLowerCase()}.`);
    } catch (error) {
      console.error(`Error updating order to ${status}:`, error);
      Alert.alert('Error', `There was an issue updating the order.`);
    }
  };
  
  const sendMessage = async (chatDocId: string, userEmail: string, message: string) => {
    try {
      console.log("Sending message to chatDocId:", chatDocId); // Log to check if the correct chatDocId is being used
      const messagesRef = collection(db, 'Chat', chatDocId, 'messages');
      await addDoc(messagesRef, {
        sender: {
          id: user?.id || 'unknown',
          name: user?.fullName || 'Anonymous',
          imageUrl: user?.imageUrl || '',
        },
        text: message,
        messageType: 'text',
        timestamp: serverTimestamp(),
      });
      console.log("Message sent successfully!"); // Log that the message was successfully sent
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };
  

  const renderOrderItem = ({ item }: { item: Order }) => (
    <View style={styles.orderCard}>
      <Text style={styles.productName}>{item.product?.name || 'Unknown Product'}</Text>
      <Text style={styles.orderStatus}>Status: {item.status}</Text>
      <Text style={styles.productPrice}>Total: Rs. {item.totalPrice}</Text>

      {(item.status === 'Pending' || item.status === 'Waiting') && (
        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            style={[styles.button, styles.acceptButton]}
            onPress={() => handleOrderUpdate(item.id, item.userEmail, item.productOwnerEmail, item.product?.name || '', 'Accepted')}
          >
            <Text style={styles.buttonText}>Accept</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={() => handleOrderUpdate(item.id, item.userEmail, item.productOwnerEmail, item.product?.name || '', 'Cancelled')}
          >
            <Text style={styles.buttonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

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
                flex: 1,}}>Order Receive</Text>
                        </View>
      <FlatList
        data={orders}
        renderItem={renderOrderItem}
        keyExtractor={(item) => item.id}
      />
    </View>
  );
};

export default OrderListScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f9f9f9',
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
    textAlign: 'center',
  },
  orderCard: {
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
  productName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  orderStatus: {
    fontSize: 16,
    color: '#555',
    marginBottom: 5,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0a74da',
    marginBottom: 10,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    width: '48%',
  },
  acceptButton: {
    backgroundColor: '#0a74da',
  },
  cancelButton: {
    backgroundColor: '#f44336',
  },
  buttonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
