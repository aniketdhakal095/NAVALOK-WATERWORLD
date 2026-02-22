import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../config/FirebaseConfig';
import { useUser } from '@clerk/clerk-expo';

type Product = {
  id: string;
  name: string;
  category: string;
  price: number;
  quantity: number;
  measureUnit: string;
  imageUrl?: string;
  description?: string;
  collectionName: 'Product' | 'InventoryProduct' | 'Fish_Plant';
  email?: string;
};

export default function InventoryExplore() {
  const router = useRouter();
  const { user } = useUser();

  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchSuggestions, setSearchSuggestions] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [category, setCategory] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [categories, setCategories] = useState<string[]>([]);

  // Fetch products only once
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const collections: ('Product' | 'InventoryProduct' | 'Fish_Plant')[] = [
        'Product',
        'InventoryProduct',
        'Fish_Plant',
      ];

      const allProds: Product[] = [];
      const catSet = new Set<string>();

      for (const col of collections) {
        const q = query(collection(db, col));
        const querySnapshot = await getDocs(q);

        querySnapshot.forEach((doc) => {
          const data = doc.data();
          let imageUrl = '';

          if (col === 'Fish_Plant') {
            imageUrl = data.image?.secure_url || data.imageUrl || '';
          } else {
            imageUrl = data.imageUrl || '';
          }

          const product: Product = {
            id: doc.id,
            collectionName: col,
            name: data.name || 'Unnamed',
            category: data.category || 'Uncategorized',
            price: data.price || 0,
            quantity: data.quantity || 0,
            measureUnit: data.measureUnit || '',
            imageUrl,
            description: data.description || '',
            email: data.email || '',
          };

          allProds.push(product);
          if (data.category) catSet.add(data.category);
        });
      }

      setAllProducts(allProds);
      setCategories(Array.from(catSet));
    } catch (error) {
      console.error('Error fetching products:', error);
      Alert.alert('Error', 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  // Fetch products on component mount
  useEffect(() => {
    fetchProducts();
  }, []);

  // Handle search input change and show suggestions
  const handleSearchChange = (text: string) => {
    setSearch(text);

    if (text.length === 0) {
      setShowSuggestions(false);
      setSearchSuggestions([]);
      setSearched(false);
      setFilteredProducts([]);
      return;
    }

    // Filter suggestions based on input
    if (allProducts.length > 0) {
      const suggestions = allProducts.filter((item) =>
        item.name.toLowerCase().includes(text.toLowerCase())
      );
      setSearchSuggestions(suggestions);
      setShowSuggestions(true);
    }
  };

  const handleSelectSuggestion = (product: Product) => {
    setSearch(product.name);
    setShowSuggestions(false);
    performSearch(product.name);
  };

  const performSearch = (searchTerm: string) => {
    let filtered = allProducts.filter((item) => {
      const matchesSearch = item.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesCategory = category ? item.category === category : true;
      const matchesMinPrice = minPrice ? item.price >= parseInt(minPrice) : true;
      const matchesMaxPrice = maxPrice ? item.price <= parseInt(maxPrice) : true;

      return matchesSearch && matchesCategory && matchesMinPrice && matchesMaxPrice;
    });

    setFilteredProducts(filtered);
    setSearched(true);
    setShowSuggestions(false);
  };

  const applyFilters = () => {
    performSearch(search);
    setModalVisible(false);
  };

  const handleViewDetails = (product: Product) => {
    router.push({
      pathname: '/product-details',
      params: {
        id: product.id,
        collectionName: product.collectionName,
        name: product.name,
        category: product.category,
        price: String(product.price),
        quantity: String(product.quantity),
        measureUnit: product.measureUnit,
        imageUrl: product.imageUrl,
        description: product.description,
        email: product.email,
      },
    });
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#f8f8f8' }}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#888" />
        <TextInput
          placeholder="Search products..."
          style={{ flex: 1, marginLeft: 10, fontSize: 16 }}
          value={search}
          onChangeText={handleSearchChange}
          onSubmitEditing={() => performSearch(search)}
        />
        <TouchableOpacity onPress={() => setModalVisible(true)}>
          <Ionicons name="filter" size={22} color="#333" />
        </TouchableOpacity>
      </View>

      {/* Search Suggestions Dropdown */}
      {showSuggestions && searchSuggestions.length > 0 && (
        <View style={styles.suggestionsContainer}>
          <FlatList
            data={searchSuggestions.slice(0, 5)}
            keyExtractor={(item) => `${item.collectionName}-${item.id}`}
            scrollEnabled={false}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.suggestionItem}
                onPress={() => handleSelectSuggestion(item)}
              >
                {item.imageUrl ? (
                  <Image
                    source={{ uri: item.imageUrl }}
                    style={styles.suggestionImage}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={[styles.suggestionImage, { backgroundColor: '#ddd' }]}>
                    <Ionicons name="image" size={20} color="#999" />
                  </View>
                )}
                <View style={{ flex: 1 }}>
                  <Text style={styles.suggestionName} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <Text style={styles.suggestionPrice}>Rs. {item.price}</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#ccc" />
              </TouchableOpacity>
            )}
          />
        </View>
      )}

      {/* Empty State - No Search Yet */}
      {!searched ? (
        <View style={styles.emptyContainer}>
        </View>
      ) : loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#2E86DE" />
        </View>
      ) : filteredProducts.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="search-outline" size={48} color="#ddd" />
          <Text style={styles.emptyText}>No products found</Text>
          <TouchableOpacity
            style={styles.searchButton}
            onPress={() => {
              setSearch('');
              setCategory('');
              setMinPrice('');
              setMaxPrice('');
              setSearched(false);
            }}
          >
            <Text style={styles.searchButtonText}>Clear Search</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredProducts}
          keyExtractor={(item) => `${item.collectionName}-${item.id}`}
          contentContainerStyle={{ padding: 10 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => handleViewDetails(item)}
            >
              {item.imageUrl ? (
                <Image
                  source={{ uri: item.imageUrl }}
                  style={styles.productImage}
                  resizeMode="cover"
                />
              ) : (
                <View style={[styles.productImage, { backgroundColor: '#ddd' }]}>
                  <Ionicons name="image" size={32} color="#999" />
                </View>
              )}
              <View style={styles.cardContent}>
                <Text style={styles.title} numberOfLines={2}>
                  {item.name}
                </Text>
                <Text style={styles.category}>{item.category}</Text>
                <Text style={styles.price}>Rs. {item.price}</Text>
                <Text style={styles.stock}>
                  Stock: {item.quantity} {item.measureUnit}
                </Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={24}
                color="#2E86DE"
                style={{ marginRight: 10 }}
              />
            </TouchableOpacity>
          )}
        />
      )}

      {/* Filter Modal */}
      <Modal visible={modalVisible} animationType="slide">
        <ScrollView style={{ flex: 1, padding: 20, backgroundColor: '#fff' }}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Ionicons name="close" size={28} color="black" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Filter</Text>
            <View style={{ width: 28 }} />
          </View>

          {/* Category */}
          <Text style={styles.filterLabel}>Category</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ marginBottom: 20 }}
          >
            <TouchableOpacity
              style={[
                styles.categoryTag,
                category === '' && styles.categoryTagActive,
              ]}
              onPress={() => setCategory('')}
            >
              <Text
                style={[
                  styles.categoryTagText,
                  category === '' && styles.categoryTagTextActive,
                ]}
              >
                All
              </Text>
            </TouchableOpacity>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.categoryTag,
                  category === cat && styles.categoryTagActive,
                ]}
                onPress={() => setCategory(cat)}
              >
                <Text
                  style={[
                    styles.categoryTagText,
                    category === cat && styles.categoryTagTextActive,
                  ]}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Price Range */}
          <Text style={styles.filterLabel}>Price Range</Text>
          <View style={styles.priceContainer}>
            <TextInput
              placeholder="Min"
              keyboardType="numeric"
              style={styles.priceInput}
              value={minPrice}
              onChangeText={setMinPrice}
            />
            <Text style={{ marginHorizontal: 10, fontSize: 16 }}>-</Text>
            <TextInput
              placeholder="Max"
              keyboardType="numeric"
              style={styles.priceInput}
              value={maxPrice}
              onChangeText={setMaxPrice}
            />
          </View>

          {/* Apply Button */}
          <TouchableOpacity style={styles.applyBtn} onPress={applyFilters}>
            <Text style={styles.applyBtnText}>Apply</Text>
          </TouchableOpacity>

          {/* Reset Button */}
          <TouchableOpacity
            style={styles.resetBtn}
            onPress={() => {
              setCategory('');
              setMinPrice('');
              setMaxPrice('');
              setSearch('');
              setSearched(false);
              setModalVisible(false);
            }}
          >
            <Text style={styles.resetBtnText}>Reset</Text>
          </TouchableOpacity>
        </ScrollView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  searchContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    elevation: 2,
    alignItems: 'center',
    margin: 12,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  suggestionsContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 12,
    borderRadius: 8,
    maxHeight: 250,
    elevation: 3,
    marginBottom: 8,
    overflow: 'hidden',
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  suggestionImage: {
    width: 45,
    height: 45,
    borderRadius: 6,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  suggestionName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  suggestionPrice: {
    fontSize: 12,
    color: '#2E86DE',
    marginTop: 2,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    marginTop: 12,
  },
  searchButton: {
    backgroundColor: '#2E86DE',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 6,
    marginTop: 16,
  },
  searchButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 13,
  },
  card: {
    backgroundColor: '#fff',
    padding: 10,
    marginVertical: 6,
    borderRadius: 8,
    elevation: 2,
    flexDirection: 'row',
    alignItems: 'center',
  },
  productImage: {
    width: 70,
    height: 70,
    borderRadius: 6,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContent: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 3,
    color: '#333',
  },
  category: {
    fontSize: 11,
    color: '#666',
    marginBottom: 3,
  },
  price: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#2E86DE',
    marginBottom: 2,
  },
  stock: {
    fontSize: 11,
    color: '#999',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  categoryTag: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    marginRight: 8,
    backgroundColor: '#f5f5f5',
  },
  categoryTagActive: {
    backgroundColor: '#2E86DE',
    borderColor: '#2E86DE',
  },
  categoryTagText: {
    fontSize: 13,
    color: '#666',
  },
  categoryTagTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  priceInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 6,
    fontSize: 13,
  },
  applyBtn: {
    backgroundColor: '#2E86DE',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  applyBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
  resetBtn: {
    backgroundColor: '#f0f0f0',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  resetBtnText: {
    color: '#333',
    fontWeight: '600',
    fontSize: 15,
  },
});