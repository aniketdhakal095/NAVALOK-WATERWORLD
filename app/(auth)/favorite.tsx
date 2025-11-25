import { View, Text, FlatList } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useUser } from '@clerk/clerk-expo';
import Shared from '../../Shared/Shared';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../config/FirebaseConfig';

import ProductListItem from '../../components/Home/ProductListItem';

const Favorite = () => {
  const { user } = useUser();
  const [favIds, setFavIds] = useState([]);
  const [favProductList, setFavProductlist] = useState([]);
  
  useEffect(() => {
    if (user) {
      GetFavProductIds();
    }
  }, [user]);

  // Fetch Favorite Product IDs
  const GetFavProductIds = async () => {
    try {
      const result = await Shared.GetFavList(user);
      if (result?.favorites) {
        setFavIds(result?.favorites);
      }
    } catch (error) {
      console.error('Error fetching favorite product IDs:', error);
    }
  };

  // Fetch Favorite Products from Firebase
  const GetFavProductList = async () => {
    if (favIds?.length === 0) {
      console.log('No favorite IDs found');
      return;
    }

    try {
      const q = query(collection(db, 'Product'), where('id', 'in', favIds));
      const querySnapshot = await getDocs(q);

      let products = [];
      querySnapshot.forEach((doc) => {
        products.push(doc.data());
      });

      // Update state after all data is fetched
      setFavProductlist(products);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  useEffect(() => {
    if (favIds?.length > 0) {
      GetFavProductList();
    }
  }, [favIds]);

  return (
    <View style={{ padding: 20, marginTop: 20 }}>
      <Text style={{ fontFamily: 'outfits-medium', fontSize: 30 }}>
        Favorites
      </Text>

      <FlatList
        data={favProductList}
        numColumns={2}
        renderItem={({ item }) => (
          <View>
            <ProductListItem product={item} />
          </View>
        )}
        keyExtractor={(item) => item.id}  // Assuming 'id' is unique for each product
      />
    </View>
  );
};

export default Favorite;
