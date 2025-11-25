import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, Image, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../config/FirebaseConfig';
import { Ionicons } from '@expo/vector-icons';

export default function OrderDetails() {
  const { orderId } = useLocalSearchParams();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router=useRouter();
  const handleGoBack = () => {
    router.back(); // Navigate back to the previous screen
  };

  const fetchOrderDetails = async () => {
    try {
      const docRef = doc(db, 'Orders', orderId as string);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setOrder({ id: docSnap.id, ...docSnap.data() });
      } else {
        console.log('No such order!');
      }
    } catch (error) {
      console.error('Error fetching order details:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (orderId) {
      fetchOrderDetails();
    }
  }, [orderId]);

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#0a74da" />
      </View>
    );
  }

  if (!order) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Order not found.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
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
    flex: 1,}}>🧾 Order Details </Text>
            </View>
      

      <View style={styles.detailCard}>
        <Image source={{ uri: order.product.imageUrl }} style={styles.productImage} />
        <Text style={styles.label}>Product Name:</Text>
        <Text style={styles.value}>{order.product.name}</Text>


        <Text style={styles.label}>Status:</Text>
        <Text style={styles.value}>{order.status}</Text>

        <Text style={styles.label}>Payment Method:</Text>
        <Text style={styles.value}>{order.paymentMethod}</Text>
        <Text style={styles.label}>Quantity :</Text>
        <Text style={styles.value}>{order.product.quantity} {order.product.measureUnit}</Text>

        <Text style={styles.label}>Total Price:</Text>
        <Text style={styles.value}>Rs. {order.totalPrice}</Text>

        <Text style={styles.label}>Owner Email:</Text>
        <Text style={styles.value}>{order.productOwnerEmail}</Text>

        {/* Optional: Add more order fields as needed */}
      </View>
    </ScrollView>
  );
}

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafc',
    padding: 20,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 20,
    textAlign: 'center',
  },
  detailCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  label: {
    fontSize: 16,
    color: '#7f8c8d',
    marginTop: 10,
    fontWeight: '600',
  },
  value: {
    fontSize: 18,
    color: '#2c3e50',
    fontWeight: 'bold',
  },
  errorText: {
    fontSize: 18,
    color: '#e74c3c',
    textAlign: 'center',
    marginTop: 20,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
    marginRight: 15,
  }
});
