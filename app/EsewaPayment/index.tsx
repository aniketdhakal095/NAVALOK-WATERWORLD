import React, { useEffect, useState } from 'react';
import {
  View,
  Button,
  Linking,
  ActivityIndicator,
  Text,
  Alert,
  StyleSheet,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { getDoc, doc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../config/FirebaseConfig';
import { useUser } from '@clerk/clerk-expo';

type OrderType = {
  totalPrice: number;
  productOwnerEmail: string;
};

const EsewaPaymentScreen = () => {
  const { orderId: rawOrderId } = useLocalSearchParams();
  const orderId = Array.isArray(rawOrderId) ? rawOrderId[0] : rawOrderId;

  const { user } = useUser();

  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);
  const [orderData, setOrderData] = useState<OrderType | null>(null);
  const [orderedByName, setOrderedByName] = useState<string | null>(null);
  const [userPhone, setUserPhone] = useState<string | null>(null);

  // eSewa Dev Credentials
  const ESEWA_MERCHANT_ID = 'EPAYTEST';
  const SUCCESS_URL = 'https://esewa.com.np/#/home';
  const FAILURE_URL = 'https://google.com/';

  useEffect(() => {
    const fetchData = async () => {
      if (!orderId) {
        Alert.alert('Error', 'Missing order ID.');
        setFetchingData(false);
        return;
      }

      try {
        const orderRef = doc(db, 'Orders', orderId);
        const orderSnap = await getDoc(orderRef);

        if (!orderSnap.exists()) {
          Alert.alert('Error', 'Order not found.');
          setFetchingData(false);
          return;
        }

        const order = orderSnap.data() as OrderType;
        setOrderData(order);

        const productOwnerEmail = order.productOwnerEmail;
        const userQuery = query(
          collection(db, 'Users'),
          where('email', '==', productOwnerEmail)
        );
        const userSnapshot = await getDocs(userQuery);

        if (!userSnapshot.empty) {
          const userInfo = userSnapshot.docs[0].data();
          const fullName = `${userInfo.firstName || ''} ${userInfo.lastName || ''}`.trim();
          setOrderedByName(fullName || productOwnerEmail);
          setUserPhone(userInfo.phone || null);
        } else {
          Alert.alert('Error', 'Product owner not found.');
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        Alert.alert('Error', 'Failed to load data.');
      } finally {
        setFetchingData(false);
      }
    };

    fetchData();
  }, [orderId]);

  const handleEsewaPayment = async () => {
    if (!orderData || !userPhone) {
      Alert.alert('Missing Info', 'Order or user data is missing.');
      return;
    }

    const amount = Number(orderData.totalPrice);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Invalid Amount', 'Total amount must be greater than zero.');
      return;
    }

    const params = new URLSearchParams({
      amt: amount.toFixed(2),
      psc: '0',
      pdc: '0',
      txAmt: '0',
      tAmt: amount.toFixed(2),
      pid: orderId,
      scd: ESEWA_MERCHANT_ID,
      su: SUCCESS_URL,
      fu: FAILURE_URL,
    });

    const esewaURL = `https://rc-epay.esewa.com.np/api/epay/main?${params.toString()}`;

    try {
      const supported = await Linking.canOpenURL(esewaURL);
      if (supported) {
        Linking.openURL(esewaURL);
      } else {
        Alert.alert('Error', 'Cannot open eSewa link.');
      }
    } catch (error) {
      console.error('Error opening eSewa:', error);
      Alert.alert('Error', 'Failed to initiate payment.');
    }
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#2E7D32" />
      ) : (
        <>
          <Text style={styles.heading}>Proceed to eSewa Payment</Text>

          {fetchingData ? (
            <ActivityIndicator size="small" color="#999" />
          ) : orderData && userPhone ? (
            <>
              <Text style={styles.detailText}>Owner: {orderedByName}</Text>
              <Text style={styles.detailText}>Total Amount: Rs. {orderData.totalPrice}</Text>
              <Text style={styles.detailText}>Phone Number: {userPhone}</Text>

              <View style={styles.buttonContainer}>
                <Button title="Pay with eSewa" color="#2E7D32" onPress={handleEsewaPayment} />
              </View>
            </>
          ) : (
            <Text style={styles.errorText}>Missing order or user information.</Text>
          )}
        </>
      )}
    </View>
  );
};

export default EsewaPaymentScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  heading: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 24,
    color: '#333',
    textAlign: 'center',
  },
  detailText: {
    fontSize: 16,
    marginBottom: 8,
    color: '#555',
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
  },
  buttonContainer: {
    marginTop: 24,
    width: '100%',
  },
});
