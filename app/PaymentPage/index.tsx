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
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  getDoc,
  doc,
  collection,
  query,
  where,
  getDocs,
} from 'firebase/firestore';
import { db } from '../../config/FirebaseConfig';
import { useUser } from '@clerk/clerk-expo';

const KhaltiPaymentScreen = () => {
  const { orderId: rawOrderId } = useLocalSearchParams();
  const orderId = Array.isArray(rawOrderId) ? rawOrderId[0] : rawOrderId;
  const router = useRouter();

  const { user } = useUser();

  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);
  const [orderData, setOrderData] = useState<any>(null);
  const [orderedByName, setOrderedByName] = useState<string | null>(null);
  const [userPhone, setUserPhone] = useState<string | null>(null);

  // ✅ Khalti Sandbox Key
  const SECRET_KEY = '7147956da0b749559657ceaa8832c91b';

  // ✅ MUST be valid URLs (even dummy ones)
  const SUCCESS_URL = 'https://example.com/khalti-success';
  const FAILURE_URL = 'https://example.com/khalti-failure';

  useEffect(() => {
    const fetchData = async () => {
      if (!orderId) {
        Alert.alert('Error', 'Missing order ID.');
        setFetchingData(false);
        return;
      }

      try {
        // 🔹 Fetch Order
        const orderRef = doc(db, 'Orders', orderId);
        const orderSnap = await getDoc(orderRef);

        if (!orderSnap.exists()) {
          Alert.alert('Error', 'Order not found.');
          setFetchingData(false);
          return;
        }

        const order = orderSnap.data();
        setOrderData(order);

        // 🔹 Fetch Product Owner
        const productOwnerEmail = order.productOwnerEmail;
        const userQuery = query(
          collection(db, 'Users'),
          where('email', '==', productOwnerEmail)
        );
        const userSnapshot = await getDocs(userQuery);

        if (!userSnapshot.empty) {
          const userInfo = userSnapshot.docs[0].data();
          const fullName = `${userInfo.firstName || ''} ${
            userInfo.lastName || ''
          }`.trim();

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

  const handlePayment = async () => {
    if (!orderData || !userPhone) {
      Alert.alert('Missing Info', 'Order or user data is missing.');
      return;
    }

    const amount = Number(orderData.totalPrice);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Invalid Amount', 'Total amount must be greater than zero.');
      return;
    }

    // Prepare invoice data and send to local invoice server (no Firebase)
    const INVOICE_API_URL = process.env.INVOICE_API_URL || 'http://localhost:3001/api/send-invoice';
    const sendInvoiceEmail = async () => {
      try {
        const invoiceData = {
          orderId: orderId,
          userEmail: user?.primaryEmailAddress?.emailAddress || 'test@example.com',
          productOwnerEmail: orderData.productOwnerEmail,
          productOwnerName: orderedByName || 'Product Owner',
          product: {
            name: orderData.product.name,
            quantity: orderData.product.quantity,
            measureUnit: orderData.product.measureUnit,
            imageUrl: orderData.product.imageUrl,
          },
          totalPrice: orderData.totalPrice,
          status: orderData.status || 'Pending',
          paymentMethod: 'Khalti',
          orderDate: new Date().toLocaleString(),
        };

        const resp = await fetch(INVOICE_API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(invoiceData),
        });

        const json = await resp.json();
        console.log('Invoice server response:', json);
      } catch (error) {
        console.error('Error generating invoice (no-firebase):', error);
      }
    };

    const payload = {
      return_url: SUCCESS_URL,
      website_url: FAILURE_URL, // 🔥 REQUIRED
      amount: amount * 100, // paisa
      purchase_order_id: orderId,
      purchase_order_name: 'FreshFarm Order',
      customer_info: {
        name: orderedByName || 'Customer',
        email: user?.primaryEmailAddress?.emailAddress || 'test@example.com',
        phone: userPhone,
      },
    };

    setLoading(true);

    try {
      const response = await fetch(
        'https://a.khalti.com/api/v2/epayment/initiate/',
        {
          method: 'POST',
          headers: {
            Authorization: `Key ${SECRET_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        }
      );

      const text = await response.text();
      console.log('Khalti raw response:', text);

      const data = JSON.parse(text);

      if (response.ok && data.payment_url) {
        // Send invoice email
        sendInvoiceEmail();

        Linking.openURL(data.payment_url);
        // Navigate to home after opening Khalti payment page
        setTimeout(() => {
          router.replace('/(auth)/home');
        }, 1000);
      } else {
        Alert.alert(
          'Khalti Error',
          data?.detail || 'Failed to initiate payment.'
        );
      }
    } catch (error: any) {
      console.error('Khalti error:', error);
      Alert.alert(
        'Network Error',
        error?.message || 'Could not connect to Khalti.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#5a2d82" />
      ) : (
        <>
          <Text style={styles.heading}>Proceed to Khalti Payment</Text>

          {fetchingData ? (
            <ActivityIndicator size="small" color="#999" />
          ) : orderData && userPhone ? (
            <>
              <Text style={styles.detailText}>Owner: {orderedByName}</Text>
              <Text style={styles.detailText}>
                Total Amount: Rs. {orderData.totalPrice}
              </Text>
              <Text style={styles.detailText}>Phone: {userPhone}</Text>
              <Text style={styles.detailText}>
                Email: {user?.primaryEmailAddress?.emailAddress}
              </Text>
              <Text style={styles.detailText}>Order ID: {orderId}</Text>

              <View style={styles.buttonContainer}>
                <Button
                  title="Pay with Khalti"
                  color="#5a2d82"
                  onPress={handlePayment}
                />
              </View>
            </>
          ) : (
            <Text style={styles.errorText}>
              Missing order or user information.
            </Text>
          )}
        </>
      )}
    </View>
  );
};

export default KhaltiPaymentScreen;

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
    alignSelf: 'stretch',
  },
});
