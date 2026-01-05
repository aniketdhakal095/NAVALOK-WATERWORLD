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

      const list = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          imageUrl: data.image,
          name: data.name,
          category:
            `${data.type === 'fish' ? 'Fish' : 'Plant'} • ` +
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
      {/* HEADER */}
      <View style={styles.header}>
        {/* BACK BUTTON */}
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={22} color={Colors.WHITE} />
        </TouchableOpacity>

        <Text style={styles.title}>Fish and Plant</Text>

        {/* SELL BUTTON */}
        <TouchableOpacity
          style={styles.sellBtn}
          onPress={() => router.push('/sell-form')}
        >
          <Ionicons name="add" size={22} color={Colors.WHITE} />
          <Text style={styles.sellText}>Sell</Text>
        </TouchableOpacity>
      </View>

      {/* CATEGORY BUTTONS */}
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

      {/* PRODUCT LIST */}
      {loading ? (
        <ActivityIndicator size="large" color={Colors.PRIMARY} />
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <ProductListItem product={item} />}
          numColumns={2}
          showsVerticalScrollIndicator={true}
          contentContainerStyle={{ paddingBottom: 30 }}
          columnWrapperStyle={{ justifyContent: 'space-between', marginBottom: 10, width: '40%' }} // <-- controls spacing
          

        />
      )}
    </View>
  );
}

/* ---------------- CATEGORY BUTTON ---------------- */
const CategoryButton = ({ title, active, onPress }: any) => (
  <TouchableOpacity
    onPress={onPress}
    style={[
      styles.categoryBtn,
      active && { backgroundColor: Colors.PRIMARY },
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

/* ---------------- STYLES ---------------- */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f6f8fa', padding: 16 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  backBtn: {
    padding: 6,
    backgroundColor: Colors.PRIMARY,
    borderRadius: 12,
  },
  title: { fontSize: 22, fontFamily: 'outfits-bold' },
  sellBtn: {
    flexDirection: 'row',
    backgroundColor: Colors.PRIMARY,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    alignItems: 'center',
    gap: 4,
  },
  sellText: { color: Colors.WHITE, fontFamily: 'outfits-medium' },
  btnRow: { flexDirection: 'row', marginBottom: 14 },
  categoryBtn: {
    flex: 1,
    padding: 12,
    marginHorizontal: 5,
    borderRadius: 14,
    backgroundColor: Colors.WHITE,
    alignItems: 'center',
    elevation: 2,
  },
  categoryText: { fontFamily: 'outfits-medium', color: Colors.GRAY },
});
