import { Image, View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../config/FirebaseConfig';

type InventoryCategoryItem = {
  name: string;
  imageUrl?: string;
};

const InventoryCategory = ({ category }: { category: (name: string) => void }) => {
  const [categoryList, setCategoryList] = useState<InventoryCategoryItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  useEffect(() => {
    GetCategories();
  }, []);

  const GetCategories = async () => {
    const snapshot = await getDocs(collection(db, 'InventoryCategory'));
    const categories: InventoryCategoryItem[] = [];

    snapshot.forEach((d) => {
      categories.push(d.data() as InventoryCategoryItem);
    });

    setCategoryList(categories);

    if (categories.length > 0) {
      const first = categories[0].name;
      setSelectedCategory(first);
      category(first);
    }
  };

  return (
    <View style={styles.wrapper}>
      <Text style={styles.title}>Shop by Category</Text>

      <FlatList
        key="inventory-category-horizontal"
        data={categoryList}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item, index) => `${item.name}-${index}`}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => {
          const active = selectedCategory === item.name;
          return (
            <TouchableOpacity
              onPress={() => {
                setSelectedCategory(item.name);
                category(item.name);
              }}
              activeOpacity={0.9}
              style={[styles.itemCard, active && styles.itemCardActive]}
            >
              <View style={[styles.imageWrap, active && styles.imageWrapActive]}>
                <Image
                  source={{ uri: item?.imageUrl || 'https://via.placeholder.com/40' }}
                  style={styles.image}
                />
              </View>
              <Text numberOfLines={1} style={[styles.itemText, active && styles.itemTextActive]}>
                {item?.name}
              </Text>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginTop: 18,
  },
  title: {
    fontFamily: 'outfits-medium',
    fontSize: 20,
    color: '#0f172a',
    marginBottom: 10,
  },
  listContent: {
    paddingLeft: 2,
    paddingBottom: 4,
    paddingRight: 10,
  },
  itemCard: {
    width: 90,
    marginRight: 10,
    alignItems: 'center',
  },
  itemCardActive: {},
  imageWrap: {
    width: 70,
    height: 70,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d9e5f1',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
    shadowColor: '#0f172a',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  imageWrapActive: {
    backgroundColor: '#dff1ff',
    borderColor: '#0a74da',
  },
  image: {
    width: 38,
    height: 38,
  },
  itemText: {
    textAlign: 'center',
    fontFamily: 'outfits-medium',
    fontSize: 12,
    color: '#475569',
  },
  itemTextActive: {
    color: '#0a74da',
  },
});

export default InventoryCategory;
