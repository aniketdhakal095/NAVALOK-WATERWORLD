import React, { useEffect, useState } from 'react';
import {
  View,
  Button,
  Linking,
  ActivityIndicator,
  Text,
  Alert,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useUser } from '@clerk/clerk-expo';
import { collection, doc, getDoc, getDocs, query, updateDoc, where } from 'firebase/firestore';
import { db } from '../../config/FirebaseConfig';

type OrderType = {
  totalPrice: number;
  productOwnerEmail?: string;
  userEmail?: string;
  product?: {
    name?: string;
    price?: number;
    quantity?: number;
  };
};

const KhaltiPaymentScreen = () => {
  const { orderId: rawOrderId } = useLocalSearchParams();
  const orderId = Array.isArray(rawOrderId) ? rawOrderId[0] : rawOrderId;
  const router = useRouter();

  const { user } = useUser();

  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);
  const [orderData, setOrderData] = useState<OrderType | null>(null);
  const [orderedByName, setOrderedByName] = useState<string | null>(null);
  const [userPhone, setUserPhone] = useState<string | null>(null);
  const [pidx, setPidx] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);

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
        const orderRef = doc(db, 'Orders', orderId);
        const orderSnap = await getDoc(orderRef);

        if (!orderSnap.exists()) {
          Alert.alert('Error', 'Order not found.');
          setFetchingData(false);
          return;
        }

        const order = orderSnap.data() as OrderType;
        setOrderData(order);

        // Seller info (display only)
        const productOwnerEmail = order.productOwnerEmail;
        if (productOwnerEmail) {
          const ownerQuery = query(
            collection(db, 'Users'),
            where('email', '==', productOwnerEmail)
          );
          const ownerSnapshot = await getDocs(ownerQuery);

          if (!ownerSnapshot.empty) {
            const ownerInfo = ownerSnapshot.docs[0].data();
            const fullName = `${ownerInfo.firstName || ''} ${ownerInfo.lastName || ''}`.trim();
            setOrderedByName(fullName || productOwnerEmail);
          } else {
            setOrderedByName(productOwnerEmail);
          }
        }

        // Buyer phone: prefer Users/{clerkUserId}, fallback to email query
        let phone: string | null = null;
        if (user?.id) {
          const buyerRef = doc(db, 'Users', user.id);
          const buyerSnap = await getDoc(buyerRef);
          if (buyerSnap.exists()) {
            phone = (buyerSnap.data()?.phone as string) || null;
          }
        }

        if (!phone) {
          const buyerEmail =
            order.userEmail || user?.primaryEmailAddress?.emailAddress || '';
          if (buyerEmail) {
            const buyerQuery = query(
              collection(db, 'Users'),
              where('email', '==', buyerEmail)
            );
            const buyerSnapshot = await getDocs(buyerQuery);
            if (!buyerSnapshot.empty) {
              const buyerInfo = buyerSnapshot.docs[0].data();
              phone = buyerInfo.phone || null;
            }
          }
        }

        setUserPhone(phone);
      } catch (error) {
        console.error('Error fetching data:', error);
        Alert.alert('Error', 'Failed to load data.');
      } finally {
        setFetchingData(false);
      }
    };

    fetchData();
  }, [orderId, user?.id, user?.primaryEmailAddress?.emailAddress]);

  const handlePayment = async () => {
    if (!orderData) {
      Alert.alert('Missing Info', 'Order data is missing.');
      return;
    }

    const amount = Number(orderData.totalPrice);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Invalid Amount', 'Total amount must be greater than zero.');
      return;
    }

    // Khalti requires phone in payload; fallback keeps sandbox payments usable.
    const effectivePhone = userPhone || '9800000001';

    const payload = {
      return_url: SUCCESS_URL,
      website_url: FAILURE_URL,
      amount: amount * 100,
      purchase_order_id: orderId,
      purchase_order_name: orderData.product?.name || `Order ${orderId}`,
      customer_info: {
        name: user?.fullName || 'Customer',
        email: user?.primaryEmailAddress?.emailAddress || 'test@example.com',
        phone: effectivePhone,
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
        setPidx(data.pidx || null);
        Linking.openURL(data.payment_url);
        Alert.alert('Continue Payment', 'Complete payment in Khalti, then tap Verify Payment in this screen.');
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

  const verifyPayment = async () => {
    if (!orderId || !pidx) {
      Alert.alert('Missing Info', 'No payment session found. Start payment first.');
      return;
    }

    setVerifying(true);
    try {
      const response = await fetch('https://a.khalti.com/api/v2/epayment/lookup/', {
        method: 'POST',
        headers: {
          Authorization: `Key ${SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pidx }),
      });

      const text = await response.text();
      console.log('Khalti lookup raw response:', text);
      const data = JSON.parse(text);

      if (!response.ok) {
        Alert.alert('Verification Failed', data?.detail || 'Could not verify payment.');
        return;
      }

      if (data?.status === 'Completed') {
        await updateDoc(doc(db, 'Orders', orderId), {
          paymentStatus: 'Paid',
          paymentProvider: 'Khalti',
          khaltiPidx: pidx,
          khaltiTransactionId: data?.transaction_id || '',
          paidAmount: Number(data?.total_amount || 0) / 100,
          paidAt: new Date(),
        });

        Alert.alert('Payment Successful', 'Order payment verified and saved.', [
          {
            text: 'OK',
            onPress: () =>
              router.replace({
                pathname: '/payment-success',
                params: {
                  orderId,
                  pidx,
                  transactionId: data?.transaction_id || '',
                },
              }),
          },
        ]);
      } else {
        Alert.alert('Payment Pending', `Current status: ${data?.status || 'Unknown'}.`);
      }
    } catch (error: any) {
      Alert.alert('Verification Error', error?.message || 'Could not verify payment.');
    } finally {
      setVerifying(false);
    }
  };

  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.bgTopBlob} />
      <View style={styles.bgBottomBlob} />
      <View style={styles.card}>
      {loading ? (
        <ActivityIndicator size="large" color="#0a74da" />
      ) : (
        <>
          <Text style={styles.heading}>Proceed to Khalti Payment</Text>

          {fetchingData ? (
            <ActivityIndicator size="small" color="#999" />
          ) : orderData ? (
            <>
              <Text style={styles.detailText}>Owner: {orderedByName || 'Unknown seller'}</Text>
              <Text style={styles.detailText}>
                Total Amount: Rs. {orderData.totalPrice}
              </Text>
              <Text style={styles.detailText}>Phone: {userPhone || 'Not found'}</Text>
              <Text style={styles.detailText}>
                Email: {user?.primaryEmailAddress?.emailAddress}
              </Text>
              <Text style={styles.detailText}>Order ID: {orderId}</Text>

              <View style={styles.buttonContainer}>
                <Button
                  title="Pay with Khalti"
                  color="#0a74da"
                  onPress={handlePayment}
                />
              </View>
              {pidx && (
                <View style={styles.buttonContainer}>
                  {verifying ? (
                    <ActivityIndicator size="small" color="#0a74da" />
                  ) : (
                    <Button
                      title="Verify Payment"
                      color="#15803d"
                      onPress={verifyPayment}
                    />
                  )}
                </View>
              )}
              {!userPhone && (
                <Text style={styles.errorText}>
                  Add your phone number in profile before paying.
                </Text>
              )}
            </>
          ) : (
            <Text style={styles.errorText}>
              Missing order or user information.
            </Text>
          )}
        </>
      )}
      </View>
    </ScrollView>
  );
};

export default KhaltiPaymentScreen;

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: '#f3f7fb',
  },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#0f172a',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  heading: {
    fontSize: 24,
    fontFamily: 'outfits-extrabold',
    marginBottom: 16,
    color: '#0f172a',
    textAlign: 'center',
  },
  detailText: {
    fontSize: 14,
    marginBottom: 6,
    color: '#475569',
    fontFamily: 'outfits-medium',
  },
  errorText: {
    color: 'red',
    fontSize: 14,
    textAlign: 'center',
    fontFamily: 'outfits-medium',
  },
  buttonContainer: {
    marginTop: 14,
    width: '100%',
    alignSelf: 'stretch',
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
});
