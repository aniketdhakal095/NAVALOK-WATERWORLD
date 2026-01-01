import { View, Pressable } from 'react-native';
import React, { useEffect, useState } from 'react';
import Ionicons from '@expo/vector-icons/Ionicons';
import Shared from './../Shared/Shared';
import { useUser } from '@clerk/clerk-expo';

type Product = {
  id?: string;
  [key: string]: any;
};

type Props = {
  product: Product | any;
};

export default function MarkFav({ product }: Props) {
  const { user } = useUser();
  const [favList, setFavList] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // Get product ID - handle route params which are strings
  const productId = React.useMemo(() => {
    if (!product) return '';
    // Handle direct id property - convert to string for route params
    const id = product.id;
    if (id) return String(id);
    return '';
  }, [product]);

  useEffect(() => {
    if (user && productId) {
      getFav();
    }
  }, [user, productId]);

  const getFav = async () => {
    if (!user) return;
    try {
      const result = await Shared.GetFavList(user);
      setFavList(result?.favorites || []);
    } catch (error) {
      console.error('Error fetching favorites:', error);
    }
  };

  const addToFav = async () => {
    if (!productId || !user) {
      console.log('Cannot add to fav - missing productId or user', { productId, hasUser: !!user });
      return;
    }
    
    // Prevent duplicate adds
    if (favList.includes(productId)) {
      console.log('Product already in favorites');
      return;
    }

    setLoading(true);
    const updatedList = [...favList, productId];

    // ✅ instant UI update
    setFavList(updatedList);

    try {
      await Shared.UpdateFav(updatedList, user);
      console.log('Successfully added to favorites:', productId);
    } catch (error) {
      console.error('Add to fav failed:', error);
      // Rollback using functional update
      setFavList(prev => prev.filter(id => id !== productId));
    } finally {
      setLoading(false);
    }
  };

  const removeFromFav = async () => {
    if (!productId || !user) {
      console.log('Cannot remove from fav - missing productId or user', { productId, hasUser: !!user });
      return;
    }

    setLoading(true);
    const updatedList = favList.filter(id => id !== productId);

    // ✅ instant UI update
    setFavList(updatedList);

    try {
      await Shared.UpdateFav(updatedList, user);
      console.log('Successfully removed from favorites:', productId);
    } catch (error) {
      console.error('Remove fav failed:', error);
      // Rollback using functional update
      setFavList(prev => [...prev, productId]);
    } finally {
      setLoading(false);
    }
  };

  const isFav = productId ? favList.includes(productId) : false;

  // Don't show if user is not logged in
  if (!user) {
    return null;
  }

  return (
    <View>
      <Pressable 
        onPress={isFav ? removeFromFav : addToFav}
        disabled={loading}
        style={{ opacity: loading ? 0.6 : 1 }}
      >
        <Ionicons
          name={isFav ? 'heart' : 'heart-outline'}
          size={30}
          color={isFav ? 'red' : 'black'}
        />
      </Pressable>
    </View>
  );
}
