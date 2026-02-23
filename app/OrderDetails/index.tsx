import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, Image, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../config/FirebaseConfig';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../../constants/Colors';

export default function OrderDetails() {
  const { orderId } = useLocalSearchParams();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const handleGoBack = () => {
    router.back();
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

  const purchaseDate = (() => {
    const rawDate = order.orderDate || order.paidAt;
    if (!rawDate) return 'N/A';
    if (typeof rawDate?.toDate === 'function') return rawDate.toDate().toLocaleString();
    const d = new Date(rawDate);
    return Number.isNaN(d.getTime()) ? 'N/A' : d.toLocaleString();
  })();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      <View style={styles.bgTopBlob} />
      <View style={styles.bgBottomBlob} />

      <View style={styles.headerRow}>
        <Pressable onPress={handleGoBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={20} color="#0f172a" />
        </Pressable>
        <Text style={styles.headerTitle}>Order Details</Text>
      </View>

      <View style={styles.detailCard}>
        <View style={styles.productHeader}>
          <Image source={{ uri: order.product?.imageUrl }} style={styles.productImage} />
          <View style={{ flex: 1 }}>
            <Text style={styles.productName}>{order.product?.name || 'Unknown Product'}</Text>
            <View style={styles.statusChip}>
              <Text style={styles.statusChipText}>{order.status || 'Waiting'}</Text>
            </View>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.row}>
          <Text style={styles.label}>Payment Method</Text>
          <Text style={styles.value}>{order.paymentMethod || 'N/A'}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Purchase Date</Text>
          <Text style={styles.value}>{purchaseDate}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Quantity</Text>
          <Text style={styles.value}>
            {order.product?.quantity || 0} {order.product?.measureUnit || 'unit'}
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Owner Email</Text>
          <Text style={styles.value}>{order.productOwnerEmail || 'N/A'}</Text>
        </View>

        <View style={[styles.row, styles.totalRow]}>
          <Text style={styles.totalLabel}>Total Price</Text>
          <Text style={styles.totalValue}>Rs. {order.totalPrice || 0}</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f7fb',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 28,
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
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f3f7fb',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  backButton: {
    padding: 10,
    borderRadius: 999,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  headerTitle: {
    marginLeft: 10,
    fontFamily: 'outfits-extrabold',
    fontSize: 24,
    color: '#0f172a',
  },
  detailCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#0f172a',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  productHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  productImage: {
    width: 82,
    height: 82,
    borderRadius: 12,
    marginRight: 12,
    backgroundColor: '#eef2f7',
  },
  productName: {
    fontFamily: 'outfits-medium',
    fontSize: 18,
    color: '#0f172a',
    marginBottom: 8,
  },
  statusChip: {
    alignSelf: 'flex-start',
    backgroundColor: '#e8f1fb',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  statusChipText: {
    color: Colors.PRIMARY,
    fontFamily: 'outfits-medium',
    fontSize: 12,
  },
  divider: {
    height: 1,
    backgroundColor: '#e2e8f0',
    marginVertical: 14,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    gap: 12,
  },
  label: {
    fontFamily: 'outfits',
    color: '#64748b',
    fontSize: 14,
    flex: 1,
  },
  value: {
    fontFamily: 'outfits-medium',
    color: '#0f172a',
    fontSize: 14,
    flex: 1,
    textAlign: 'right',
  },
  totalRow: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  totalLabel: {
    fontFamily: 'outfits-medium',
    color: '#334155',
    fontSize: 16,
  },
  totalValue: {
    fontFamily: 'outfits-extrabold',
    color: Colors.PRIMARY,
    fontSize: 19,
  },
  errorText: {
    fontSize: 18,
    color: '#e74c3c',
    textAlign: 'center',
    marginTop: 40,
    fontFamily: 'outfits-medium',
  },
});
