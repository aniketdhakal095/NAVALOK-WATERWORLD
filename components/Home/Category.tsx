import { Image, View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../config/FirebaseConfig';

// Define a type for Category data
interface CategoryData {
  name: string;
  imageUrl: string;
}

const Category = ({ category }: { category: (categoryName: string) => void }) => {
  // Explicitly typing the state for categories
  const [categoryList, setCategoryList] = useState<CategoryData[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('Fruits');

  useEffect(() => {
    GetCategories();
  }, []);

  // Function to get categories from Firestore
  const GetCategories = async () => {
    setCategoryList([]); // Reset the category list
    const snapshot = await getDocs(collection(db, 'Category'));
    const categories: CategoryData[] = [];
    snapshot.forEach((doc) => {
      categories.push(doc.data() as CategoryData); // Cast data to CategoryData
    });
    setCategoryList(categories); // Update the state with fetched categories
  };

  return (
    <View style={{ marginTop: 18 }}>
      <Text style={styles.sectionTitle}>Shop by Category</Text>

      <FlatList
        key="category-horizontal-list"
        data={categoryList}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item, index) => `${item.name}-${index}`}
        renderItem={({ item }) => (
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => {
              setSelectedCategory(item.name);
              category(item.name); // Pass the selected category to the parent component
            }}
            style={styles.categoryItem}
          >
            <View
              style={[
                styles.container,
                selectedCategory === item.name && styles.selectedCategoryContainer,
              ]}
            >
              {/* Fallback in case imageUrl is missing */}
              <Image
                source={{ uri: item?.imageUrl || 'https://via.placeholder.com/40' }}
                style={styles.image}
              />
            </View>
            <Text
              numberOfLines={1}
              style={[
                styles.label,
                selectedCategory === item.name && styles.selectedLabel,
              ]}
            >
              {item?.name}
            </Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  sectionTitle: {
    fontFamily: 'outfits-medium',
    fontSize: 20,
    color: '#0f172a',
    marginBottom: 10,
  },
  categoryItem: {
    width: 86,
    marginRight: 10,
    alignItems: 'center',
  },
  container: {
    width: 70,
    height: 70,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: 20,
    borderColor: '#d9e5f1',
    marginBottom: 6,
    shadowColor: '#0f172a',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  selectedCategoryContainer: {
    backgroundColor: '#dff1ff',
    borderColor: '#0a74da',
  },
  image: {
    width: 38,
    height: 38,
  },
  label: {
    textAlign: 'center',
    fontFamily: 'outfits-medium',
    fontSize: 11,
    color: '#475569',
  },
  selectedLabel: {
    color: '#0a74da',
  },
});

export default Category;
