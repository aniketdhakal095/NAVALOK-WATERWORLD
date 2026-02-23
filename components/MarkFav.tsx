import { View, Pressable } from 'react-native';
import React, { useEffect, useState } from 'react';
import Ionicons from '@expo/vector-icons/Ionicons';
import Shared from './../Shared/Shared';
import { useUser } from '@clerk/clerk-expo';

type Product = {
  id: string;
};

type Props = {
  product: Product;
};

export default function MarkFav({ product }: Props) {
  const { user } = useUser();
  const [favList, setFavList] = useState<string[]>([]);

  useEffect(() => {
    if (user) {
      getFav();
    }
  }, [user, product?.id]);

  const getFav = async () => {
    try {
      const result = await Shared.GetFavList(user);
      setFavList(result?.favorites || []);
    } catch (error) {
      console.error('Error fetching favorites:', error);
    }
  };

  const addToFav = async () => {
    if (!product?.id || !user) return;

    const updatedList = Array.from(new Set([...favList, product.id]));

    // ✅ instant UI update
    setFavList(updatedList);

    try {
      await Shared.UpdateFav(updatedList, user);
    } catch (error) {
      console.error('Add to fav failed:', error);
      setFavList(favList); // rollback if failed
    }
  };

  const removeFromFav = async () => {
    if (!product?.id || !user) return;

    const updatedList = favList.filter(id => id !== product.id);

    // ✅ instant UI update
    setFavList(updatedList);

    try {
      await Shared.UpdateFav(updatedList, user);
    } catch (error) {
      console.error('Remove fav failed:', error);
      setFavList(favList); // rollback if failed
    }
  };

  const isFav = favList.includes(product.id);

  return (
    <View>
      <Pressable onPress={isFav ? removeFromFav : addToFav}>
        <Ionicons
          name={isFav ? 'heart' : 'heart-outline'}
          size={30}
          color={isFav ? 'red' : 'black'}
        />
      </Pressable>
    </View>
  );
}
