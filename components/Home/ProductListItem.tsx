import { Image, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import React from 'react';
import { useRouter } from 'expo-router';

const ProductListItem = ({ product }) => {
  const router = useRouter();
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() =>
        router.push({
          pathname: '/product-details',
          params: product,
        })
      }
      style={styles.touch}
    >
      <View style={styles.card}>
        <Image source={{ uri: product?.imageUrl }} style={styles.image} />
        <Text numberOfLines={1} style={styles.name}>
          {product?.name}
        </Text>
        <Text numberOfLines={1} style={styles.category}>
          {product?.category}
        </Text>
        <View style={styles.pricePill}>
          <Text style={styles.price}>
            Rs. {product?.price} / {product?.measureUnit}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default ProductListItem;

const styles = StyleSheet.create({
  touch: {
    width: '48.5%',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#0f172a',
    shadowOpacity: 0.06,
    shadowRadius: 9,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  image: {
    width: '100%',
    height: 138,
    borderRadius: 12,
    marginBottom: 8,
  },
  name: {
    fontFamily: 'outfits-medium',
    fontSize: 16,
    color: '#0f172a',
  },
  category: {
    marginTop: 1,
    color: '#64748b',
    fontFamily: 'outfits',
    fontSize: 12,
  },
  pricePill: {
    marginTop: 8,
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: '#eef6ff',
  },
  price: {
    color: '#0a74da',
    fontFamily: 'outfits-medium',
    fontSize: 12,
  },
});
