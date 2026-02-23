import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator, Pressable } from 'react-native';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../config/FirebaseConfig';
import { useUser } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../../constants/Colors';

export default function SeeMyOrders() {
  const { user } = useUser();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const handleGoBack = () => {
    router.back();
  };

  const fetchUserOrders = async () => {
    try {
      if (!user) return;

      const userEmail = user.primaryEmailAddress?.emailAddress || '';
      const userId = user.id;

      const byEmailSnap = userEmail
        ? await getDocs(query(collection(db, 'Orders'), where('userEmail', '==', userEmail)))
        : null;

      const byUserIdSnap = await getDocs(
        query(collection(db, 'Orders'), where('userId', '==', userId))
      );

      const merged = new Map<string, any>();
      byEmailSnap?.docs.forEach((d) => merged.set(d.id, { id: d.id, ...d.data() }));
      byUserIdSnap.docs.forEach((d) => merged.set(d.id, { id: d.id, ...d.data() }));

      const sortedOrders = Array.from(merged.values()).sort((a: any, b: any) => {
        const getMillis = (v: any) => {
          if (!v) return 0;
          if (typeof v?.toDate === 'function') return v.toDate().getTime();
          const d = new Date(v);
          return Number.isNaN(d.getTime()) ? 0 : d.getTime();
        };

        // Prefer explicit order date; fallback to paid date.
        const aTime = getMillis(a.orderDate) || getMillis(a.paidAt);
        const bTime = getMillis(b.orderDate) || getMillis(b.paidAt);
        return bTime - aTime;
      });

      setOrders(sortedOrders);
    } catch (error) {
      console.error('Error fetching user orders:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserOrders();
  }, [user?.id, user?.primaryEmailAddress?.emailAddress]);

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.orderCard}
      onPress={() => router.push({ pathname: '/OrderDetails', params: { orderId: item.id } })}
      activeOpacity={0.9}
    >
      <View style={styles.cardTopRow}>
        <Text style={styles.orderTitle}>Name: {item.product?.name || 'Unknown Product'}</Text>
        <View style={styles.statusChip}>
          <Text style={styles.statusChipText}>{item.status || 'Waiting'}</Text>
        </View>
      </View>
      <Text style={styles.orderText}>
        Purchase Date:{' '}
        {(() => {
          const rawDate = item.orderDate || item.paidAt;
          if (!rawDate) return 'N/A';
          if (typeof rawDate?.toDate === 'function') return rawDate.toDate().toLocaleString();
          const d = new Date(rawDate);
          return Number.isNaN(d.getTime()) ? 'N/A' : d.toLocaleString();
        })()}
      </Text>
      <Text style={styles.orderText}>Owner: {item.productOwnerEmail || 'N/A'}</Text>
      <Text style={styles.orderText}>Payment Method: {item.paymentMethod || 'N/A'}</Text>
      <Text style={styles.totalText}>Total: Rs. {item.totalPrice || 0}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.bgTopBlob} />
      <View style={styles.bgBottomBlob} />
      <View style={styles.headerRow}>
        <Pressable onPress={handleGoBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={20} color="#0f172a" />
        </Pressable>
        <Text style={styles.headerTitle}>My Orders</Text>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f7fb',
    paddingHorizontal: 16,
    paddingTop: 20,
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 12,
  },
  backButton: {
    padding: 10,
    backgroundColor: '#ffffff',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: 'outfits-extrabold',
    color: '#0f172a',
    textAlign: 'center',
    flex: 1,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusChip: {
    backgroundColor: '#e8f1fb',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  statusChipText: {
    fontFamily: 'outfits-medium',
    color: Colors.PRIMARY,
    fontSize: 12,
  },
  orderCard: {
    backgroundColor: '#ffffff',
    padding: 18,
    borderRadius: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#0f172a',
    shadowOpacity: 0.06,
    shadowRadius: 9,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  orderTitle: {
    fontSize: 17,
    fontFamily: 'outfits-medium',
    color: '#0f172a',
    flex: 1,
    paddingRight: 10,
  },
  orderText: {
    fontSize: 14,
    color: '#475569',
    fontFamily: 'outfits',
    marginBottom: 4,
  },
  totalText: {
    marginTop: 6,
    fontFamily: 'outfits-medium',
    color: '#0a74da',
    fontSize: 16,
  },
  noOrdersText: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 50,
    fontFamily: 'outfits-medium',
  },
  list: {
    paddingBottom: 20,
  },
});
