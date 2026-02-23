import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../config/FirebaseConfig';
import ProductListItem from '../../components/Home/ProductListItem';
import Colors from '../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

type WaterCategory = 'salt' | 'fresh';

export default function FishAndPlant() {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState<WaterCategory>('salt');
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, [activeCategory]);

  const fetchProducts = async () => {
    try {
      setLoading(true);

      const q = query(
        collection(db, 'Fish_Plant'),
        where('waterCategory', '==', activeCategory)
      );

      const snapshot = await getDocs(q);

      const list = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          collectionName: 'Fish_Plant',
          imageUrl: data.image,
          name: data.name,
          category:
            `${data.type === 'fish' ? 'Fish' : 'Plant'} | ` +
            (data.waterCategory === 'salt' ? 'Salt Water' : 'Fresh Water'),
          price: data.price,
          measureUnit: data.measureUnit,
          ...data,
        };
      });

      setProducts(list);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.bgTopBlob} />
      <View style={styles.bgBottomBlob} />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={Colors.WHITE} />
        </TouchableOpacity>

        <Text style={styles.title}>Fish and Plant</Text>

        <TouchableOpacity style={styles.sellBtn} onPress={() => router.push('/sell-form')}>
          <Ionicons name="add" size={22} color={Colors.WHITE} />
          <Text style={styles.sellText}>Sell</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.btnRow}>
        <CategoryButton
          title="Salt Water"
          active={activeCategory === 'salt'}
          onPress={() => setActiveCategory('salt')}
        />
        <CategoryButton
          title="Fresh Water"
          active={activeCategory === 'fresh'}
          onPress={() => setActiveCategory('fresh')}
        />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={Colors.PRIMARY} />
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <ProductListItem product={item} />}
          numColumns={2}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 30 }}
          columnWrapperStyle={{ justifyContent: 'space-between', marginBottom: 12 }}
        />
      )}
    </View>
  );
}

const CategoryButton = ({ title, active, onPress }: any) => (
  <TouchableOpacity
    onPress={onPress}
    style={[
      styles.categoryBtn,
      active && { backgroundColor: '#0f766e', borderColor: '#0f766e' },
    ]}
  >
    <Text
      style={[
        styles.categoryText,
        active && { color: Colors.WHITE },
      ]}
    >
      {title}
    </Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#eef8f5', padding: 16 },
  bgTopBlob: {
    position: 'absolute',
    top: -120,
    right: -70,
    width: 240,
    height: 240,
    borderRadius: 130,
    backgroundColor: 'rgba(20, 184, 166, 0.16)',
  },
  bgBottomBlob: {
    position: 'absolute',
    bottom: -140,
    left: -90,
    width: 260,
    height: 260,
    borderRadius: 140,
    backgroundColor: 'rgba(34, 197, 94, 0.16)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    borderRadius: 18,
    backgroundColor: '#ffffff',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#dbeee8',
    shadowColor: '#0f172a',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  backBtn: {
    padding: 8,
    backgroundColor: '#0f766e',
    borderRadius: 12,
  },
  title: { fontSize: 22, fontFamily: 'outfits-extrabold', color: '#0f172a' },
  sellBtn: {
    flexDirection: 'row',
    backgroundColor: '#15803d',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    alignItems: 'center',
    gap: 4,
  },
  sellText: { color: Colors.WHITE, fontFamily: 'outfits-medium' },
  btnRow: { flexDirection: 'row', marginBottom: 14, gap: 10 },
  categoryBtn: {
    flex: 1,
    padding: 12,
    borderRadius: 14,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#dbeee8',
    elevation: 2,
  },
  categoryText: { fontFamily: 'outfits-medium', color: '#0f766e' },
});
