import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useUser } from '@clerk/clerk-expo';
import Shared from '../../components/Shared/Shared';
import { collection, documentId, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../config/FirebaseConfig';
import { useIsFocused } from '@react-navigation/native';

import ProductListItem from '../../components/Home/ProductListItem';

const chunkArray = <T,>(arr: T[], size: number): T[][] => {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
};

const Favorite = () => {
  const { user } = useUser();
  const isFocused = useIsFocused();
  const [favProductList, setFavProductList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFavoriteProducts = async () => {
    try {
      setLoading(true);
      if (!user) {
        setFavProductList([]);
        return;
      }

      const result = await Shared.GetFavList(user);
      const rawIds = Array.isArray(result?.favorites) ? result.favorites : [];
      const favIds = Array.from(new Set(rawIds.filter(Boolean)));

      if (favIds.length === 0) {
        setFavProductList([]);
        return;
      }

      const collectionsToSearch = ['Product', 'InventoryProduct', 'Fish_Plant'];
      const idChunks = chunkArray(favIds, 10); // Firestore 'in' max is 10
      const allProducts: any[] = [];

      for (const col of collectionsToSearch) {
        for (const ids of idChunks) {
          const q = query(collection(db, col), where(documentId(), 'in', ids));
          const snap = await getDocs(q);

          snap.forEach((d) => {
            const data = d.data() as any;
            allProducts.push({
              id: d.id,
              collectionName: col,
              imageUrl: data.imageUrl || data.image?.secure_url || data.image || '',
              ...data,
            });
          });
        }
      }

      // Keep the same order as favorite IDs
      const ordered = favIds
        .map((id) => allProducts.find((p) => p.id === id))
        .filter(Boolean);
      setFavProductList(ordered);
    } catch (error) {
      console.error('Error fetching favorite products:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isFocused) {
      fetchFavoriteProducts();
    }
  }, [isFocused, user?.id, user?.primaryEmailAddress?.emailAddress]);

  return (
    <View style={styles.container}>
      <View style={styles.bgTopBlob} />
      <View style={styles.bgBottomBlob} />
      <View style={styles.headerCard}>
        <Text style={styles.heading}>Favorites</Text>
        <Text style={styles.subheading}>Products you saved for later</Text>
      </View>
      {loading ? (
        <ActivityIndicator size="large" color="#0a74da" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={favProductList}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <ProductListItem product={item} />
          )}
          keyExtractor={(item) => `${item.collectionName}-${item.id}`}
          ListEmptyComponent={<Text style={styles.emptyText}>No favorite products yet.</Text>}
        />
      )}
    </View>
  );
};

export default Favorite;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
    backgroundColor: '#f3f7fb',
  },
  headerCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#0f172a',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  heading: {
    fontFamily: 'outfits-extrabold',
    fontSize: 28,
    color: '#0f172a',
  },
  subheading: {
    marginTop: 2,
    fontFamily: 'outfits',
    fontSize: 13,
    color: '#64748b',
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  listContent: {
    paddingBottom: 30,
    paddingTop: 4,
  },
  emptyText: {
    marginTop: 40,
    textAlign: 'center',
    color: '#64748b',
    fontFamily: 'outfits-medium',
    fontSize: 15,
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
