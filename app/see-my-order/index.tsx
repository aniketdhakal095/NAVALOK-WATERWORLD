import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator, Pressable } from 'react-native';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../config/FirebaseConfig';
import { useUser } from '@clerk/clerk-react';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function SeeMyOrders() {
  const { user } = useUser();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const handleGoBack = () => {
    router.back(); // Navigate back to the previous screen
  };

  const fetchUserOrders = async () => {
    try {
      if (!user?.primaryEmailAddress?.emailAddress) return;
      const userEmail = user.primaryEmailAddress.emailAddress;

      const q = query(collection(db, 'Orders'), where('userEmail', '==', userEmail));
      const querySnapshot = await getDocs(q);

      const ordersList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setOrders(ordersList);
    } catch (error) {
      console.error('Error fetching user orders:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserOrders();
  }, []);

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.orderCard}
      onPress={() => router.push({ pathname: '/OrderDetails', params: { orderId: item.id } })}
    >
      <Text style={styles.orderTitle}>🛒Name: {item.product.name}</Text>
      <Text style={styles.orderText}>Status: {item.status}</Text>
      <Text style={styles.orderText}>Owner : {item.productOwnerEmail}</Text>
      <Text style={styles.orderText}>Payment Method: {item.paymentMethod}</Text>
      <Text style={styles.orderText}>Total: Rs. {item.totalPrice}</Text>
    </TouchableOpacity>
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
    flex: 1,}}>📦 My Orders </Text>
            </View>
      

      {loading ? (
        <ActivityIndicator size="large" color="#0a74da" />
      ) : orders.length === 0 ? (
        <Text style={styles.noOrdersText}>You have not placed any orders yet.</Text>
      ) : (
        <FlatList
          data={orders}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );
}

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6f8fa',
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 20,
    textAlign: 'center',
  },
  orderCard: {
    backgroundColor: '#ffffff',
    padding: 18,
    borderRadius: 12,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 4,
  },
  orderTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#34495e',
    marginBottom: 6,
  },
  orderText: {
    fontSize: 16,
    color: '#555',
    marginBottom: 4,
  },
  noOrdersText: {
    fontSize: 18,
    color: '#888',
    textAlign: 'center',
    marginTop: 50,
  },
  list: {
    paddingBottom: 20,
  },
});
