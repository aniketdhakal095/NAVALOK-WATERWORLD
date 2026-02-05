import React, { useEffect, useState } from 'react';
import { 
  View, Text, FlatList, Alert, ActivityIndicator, StyleSheet, Image, 
  TouchableOpacity, Pressable 
} from 'react-native';
import { collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../config/FirebaseConfig';
import { useUser } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';

// ------------------- TYPES -------------------
type CollectionName = 'Product' | 'InventoryProduct' | 'Fish_Plant';

type ProductType = {
  id: string;
  name: string;
  imageUrl?: string; // optional for safety
  category?: string;
  price?: number;
  quantity?: number;
  measureUnit?: string;
  collectionName: CollectionName;
};

// ------------------- COMPONENT -------------------
export default function ViewProducts() {
  const [products, setProducts] = useState<ProductType[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<ProductType[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'All' | CollectionName>('All');
  const { user } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (user) fetchUserProducts();
  }, [user]);

  useEffect(() => {
    applyFilter();
  }, [filter, products]);

  const fetchUserProducts = async () => {
    setLoading(true);
    try {
      const collections: CollectionName[] = ['Product', 'InventoryProduct', 'Fish_Plant'];
      const snapshots = await Promise.all(
        collections.map(col =>
          getDocs(
            query(
              collection(db, col),
              where("email", "==", user?.primaryEmailAddress?.emailAddress)
            )
          )
        )
      );

      const allProducts: ProductType[] = snapshots.flatMap((snapshot, idx) => {
        const colName = collections[idx];
        return snapshot.docs.map(doc => {
          const data = doc.data();

          // FIX: Fish_Plant might store image differently in Cloudinary
          let imageUrl = '';
          if (colName === 'Fish_Plant') {
            // Some Fish_Plant products may have: { image: { secure_url: '...' } }
            if (data.image?.secure_url) imageUrl = data.image.secure_url;
            else if (data.imageUrl) imageUrl = data.imageUrl; // fallback
          } else {
            imageUrl = data.imageUrl || '';
          }

          return {
            id: doc.id,
            collectionName: colName,
            name: data.name || 'Unnamed',
            imageUrl,
            category: data.category || '',
            price: data.price || 0,
            quantity: data.quantity || 0,
            measureUnit: data.measureUnit || '',
          };
        });
      });

      setProducts(allProducts);
    } catch (error) {
      console.error("Error fetching products:", error);
      Alert.alert("Error", "Failed to load products.");
    } finally {
      setLoading(false);
    }
  };

  const applyFilter = () => {
    if (filter === "All") setFilteredProducts(products);
    else setFilteredProducts(products.filter(item => item.collectionName === filter));
  };

  const handleDelete = async (productId: string, collectionName: CollectionName) => {
    Alert.alert(
      "Delete Product",
      "Are you sure you want to delete this product?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", style: "destructive", 
          onPress: async () => {
            try {
              await deleteDoc(doc(db, collectionName, productId));
              setProducts(products.filter(item => item.id !== productId));
              Alert.alert("Deleted", "Product deleted successfully");
            } catch (error) {
              console.error("Delete error:", error);
              Alert.alert("Error", "Failed to delete product");
            }
          }
        }
      ]
    );
  };

  const handleEdit = (product: ProductType) => {
    const editRoutes = {
      Product: "/ProductEditingPage",
      InventoryProduct: "/InventoryProductEditingPage",
      Fish_Plant: "/FishandPlantEditPage"
    };
    router.push({ pathname: editRoutes[product.collectionName], params: {
    productId: product.id,      // IMPORTANT
    name: product.name,
    imageUrl: product.imageUrl,
   
    price: String(product.price),
    quantity: String(product.quantity),
    measureUnit: product.measureUnit,
  },});
  };

  if (loading) return <ActivityIndicator size="large" color="#356de7ff" style={styles.loader} />;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </Pressable>
        <Text style={styles.headerTitle}>Your Products</Text>
      </View>

      {/* Filter */}
      <View style={styles.filterContainer}>
        {['All', 'Product', 'InventoryProduct', 'Fish_Plant'].map(f => (
          <TouchableOpacity
            key={f}
            style={[styles.filterButton, filter === f && styles.activeFilter]}
            onPress={() => setFilter(f as 'All' | CollectionName)}
          >
            <Text style={styles.filterText}>
              {f === 'InventoryProduct' ? 'Inventory' : f === 'Fish_Plant' ? 'Fish & Plant' : f}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {filteredProducts.length === 0 ? (
        <Text style={styles.noProducts}>No products found.</Text>
      ) : (
        <FlatList
          data={filteredProducts}
          keyExtractor={item => item.id}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
          contentContainerStyle={{ paddingBottom: 30 }}
          renderItem={({ item }) => {
            const imageUri = item.imageUrl && item.imageUrl !== '' 
              ? item.imageUrl 
              : 'https://via.placeholder.com/150'; // placeholder

            return (
              <View style={styles.productCardGrid}>
                <Image
                  source={{ uri: imageUri }}
                  style={styles.productImageGrid}
                  resizeMode="cover"
                  onError={() => console.warn('Failed to load image:', imageUri)}
                />
                <Text style={styles.productNameGrid}>{item.name}</Text>
                <Text style={styles.productCategoryGrid}>{item.category}</Text>
                <Text style={styles.productPriceGrid}>Rs. {item.price}</Text>
                <Text style={styles.productQuantityGrid}>
                  Qty: {item.quantity} {item.measureUnit}
                </Text>
                <View style={styles.gridActions}>
                  <TouchableOpacity onPress={() => handleEdit(item)} style={styles.iconButton}>
                    <Ionicons name="create-outline" size={22} color="blue" />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDelete(item.id, item.collectionName)} style={styles.iconButton}>
                    <Ionicons name="trash-outline" size={22} color="red" />
                  </TouchableOpacity>
                </View>
              </View>
            );
          }}
        />
      )}
    </View>
  );
}

// ------------------- STYLES -------------------
const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f8f8f8' },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  backButton: { padding: 10, borderRadius: 30 },
  headerTitle: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', flex: 1 },

  filterContainer: { flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap', marginBottom: 10 },
  filterButton: { padding: 10, backgroundColor: '#ddd', margin: 5, borderRadius: 5 },
  activeFilter: { backgroundColor: '#356de7ff' },
  filterText: { color: '#fff', fontWeight: 'bold' },

  noProducts: { textAlign: 'center', fontSize: 16, color: 'gray', marginTop: 20 },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  columnWrapper: { justifyContent: 'space-between', marginBottom: 12 },

  productCardGrid: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    elevation: 3,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  productImageGrid: {
    width: '100%',
    height: 100,
    borderRadius: 8,
    marginBottom: 6,
  },
  productNameGrid: { fontSize: 16, fontWeight: 'bold', textAlign: 'center' },
  productCategoryGrid: { fontSize: 12, color: 'gray', textAlign: 'center' },
  productPriceGrid: { fontSize: 14, color: '#356de7ff', fontWeight: 'bold', textAlign: 'center' },
  productQuantityGrid: { fontSize: 12, color: '#555', textAlign: 'center' },

  gridActions: { flexDirection: 'row', marginTop: 6 },
  iconButton: { padding: 5, marginHorizontal: 5 },
});
