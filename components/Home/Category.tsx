import { Image, View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../config/FirebaseConfig';
import Colors from '../../constants/Colors';

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
    <View style={{ marginTop: 20 }}>
      <Text style={{ fontFamily: 'outfits-medium', fontSize: 20 }}>Category</Text>

      <FlatList
        data={categoryList}
        numColumns={5}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => {
              setSelectedCategory(item.name);
              category(item.name); // Pass the selected category to the parent component
            }}
            style={{ flex: 1 }}
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
                style={{ width: 40, height: 40 }}
              />
            </View>
            <Text
              style={{
                textAlign: 'center',
                fontFamily: 'outfits-bold',
                fontSize: 9,
              }}
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
  container: {
    backgroundColor: Colors.SECONDARY,
    padding: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 20,
    borderColor: Colors.HeadCOL,
    margin: 5,
  },
  selectedCategoryContainer: {
    backgroundColor: Colors.PRIMARYB,
    borderColor: Colors.SECONDARYB,
  },
});

export default Category;
