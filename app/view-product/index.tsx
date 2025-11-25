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

export default function ViewProducts() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All"); // Filter state
  const { user } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      fetchUserProducts();
    }
  }, [user]);

  useEffect(() => {
    applyFilter();
  }, [filter, products]);

  // Fetch products from both collections
  const fetchUserProducts = async () => {
    setLoading(true);
    try {
      const productQuery = query(
        collection(db, "Product"),
        where("email", "==", user?.primaryEmailAddress?.emailAddress)
      );
      const inventoryQuery = query(
        collection(db, "InventoryProduct"),
        where("email", "==", user?.primaryEmailAddress?.emailAddress)
      );

      const [productSnapshot, inventorySnapshot] = await Promise.all([
        getDocs(productQuery),
        getDocs(inventoryQuery)
      ]);

      const userProducts = productSnapshot.docs.map(doc => ({
        id: doc.id,
        collectionName: "Product",
        ...doc.data(),
      }));

      const inventoryProducts = inventorySnapshot.docs.map(doc => ({
        id: doc.id,
        collectionName: "InventoryProduct",
        ...doc.data(),
      }));

      setProducts([...userProducts, ...inventoryProducts]);
    } catch (error) {
      console.error("Error fetching user products:", error);
      Alert.alert("Error", "Failed to load products.");
    } finally {
      setLoading(false);
    }
  };

  // Apply filter based on selection
  const applyFilter = () => {
    if (filter === "All") {
      setFilteredProducts(products);
    } else {
      setFilteredProducts(products.filter(item => item.collectionName === filter));
    }
  };

  // Handle product deletion
  const handleDelete = async (productId, collectionName) => {
    Alert.alert(
      "Delete Product",
      "Are you sure you want to delete this product?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", onPress: async () => {
            try {
              await deleteDoc(doc(db, collectionName, productId));
              setProducts(products.filter(item => item.id !== productId));
              Alert.alert("Success", "Product deleted successfully.");
            } catch (error) {
              console.error("Error deleting product:", error);
              Alert.alert("Error", "Failed to delete product.");
            }
          }, style: "destructive"
        }
      ]
    );
  };

  const handleEdit = (product) => {
    const { id, collectionName } = product;
    
    // Ensure the params are being passed correctly for each route
    const routeParams = { productId: id, collection: collectionName };
  
    if (collectionName === "Product") {
      router.push({
        pathname: "/ProductEditingPage",
        params: product,  // Use params here
      });
    } else if (collectionName === "InventoryProduct") {
      router.push({
        pathname: '/InventoryProductEditingPage',
        params: product,
      })
    }
  };
  
  

  if (loading) {
    return <ActivityIndicator size="large" color="green" style={styles.loader} />;
  }

  return (
    <View style={styles.container}>
      {/* Back Button */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </Pressable>
        <Text style={styles.headerTitle}>Your Products</Text>
      </View>

      {/* Filter Buttons */}
      <View style={styles.filterContainer}>
        <TouchableOpacity 
          style={[styles.filterButton, filter === "All" && styles.activeFilter]} 
          onPress={() => setFilter("All")}
        >
          <Text style={styles.filterText}>All</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.filterButton, filter === "Product" && styles.activeFilter]} 
          onPress={() => setFilter("Product")}
        >
          <Text style={styles.filterText}>Product</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.filterButton, filter === "InventoryProduct" && styles.activeFilter]} 
          onPress={() => setFilter("InventoryProduct")}
        >
          <Text style={styles.filterText}>Inventory</Text>
        </TouchableOpacity>
      </View>

      {filteredProducts.length === 0 ? (
        <Text style={styles.noProducts}>No products found.</Text>
      ) : (
        <FlatList
          data={filteredProducts}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.productCard}>
              <Image source={{ uri: item.imageUrl }} style={styles.productImage} />
              <View style={styles.productDetails}>
                <Text style={styles.productName}>{item.name}</Text>
                <Text style={styles.productCategory}>Category: {item.category}</Text>
                <Text style={styles.productPrice}>Price: Rs. {item.price}</Text>
                <Text style={styles.productQuantity}>
                  Quantity: {item.quantity} {item.measureUnit}
                </Text>
                <Text style={styles.collectionText}>
                  Source: {item.collectionName === "Product" ? "Product List" : "Inventory"}
                </Text>
              </View>

              {/* Edit and Delete Buttons */}
              <View style={styles.actions}>
                <TouchableOpacity onPress={() => handleEdit(item)} style={styles.iconButton}>
                  <Ionicons name="create-outline" size={24} color="blue" />
                </TouchableOpacity>

                <TouchableOpacity onPress={() => handleDelete(item.id, item.collectionName)} style={styles.iconButton}>
                  <Ionicons name="trash-outline" size={24} color="red" />
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f8f8f8' },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  backButton: { padding: 10, borderRadius: 30 },
  headerTitle: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', flex: 1 },
  
  filterContainer: { flexDirection: 'row', justifyContent: 'center', marginBottom: 10 },
  filterButton: { padding: 10, backgroundColor: '#ddd', margin: 5, borderRadius: 5 },
  activeFilter: { backgroundColor: 'green' },
  filterText: { color: '#fff', fontWeight: 'bold' },

  noProducts: { textAlign: 'center', fontSize: 16, color: 'gray', marginTop: 20 },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  
  productCard: { flexDirection: 'row', backgroundColor: '#fff', padding: 10, marginVertical: 5, borderRadius: 8, elevation: 3, alignItems: 'center' },
  productImage: { width: 80, height: 80, borderRadius: 8, marginRight: 10 },
  productDetails: { flex: 1 },
  productName: { fontSize: 18, fontWeight: 'bold' },
  productCategory: { fontSize: 14, color: 'gray' },
  productPrice: { fontSize: 16, color: 'green', fontWeight: 'bold' },
  productQuantity: { fontSize: 14, color: '#555' },
  collectionText: { fontSize: 12, fontStyle: 'italic', color: 'gray' },

  actions: { flexDirection: 'row' },
  iconButton: { padding: 5, marginLeft: 10 },
});
