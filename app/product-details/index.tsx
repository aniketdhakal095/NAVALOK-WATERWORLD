import { View, ScrollView, Pressable, Text } from 'react-native';
import React from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import ProductInfo from '../../components/ProductDetails/ProductInfo';
import Productsubinfo from '../../components/ProductDetails/Productsubinfo';
import Aboutproduct from '../../components/ProductDetails/Aboutproduct';
import OwnerInfo from '../../components/ProductDetails/OwnerInfo';
import AddToCart from '../../components/ProductDetails/AddToCart'; // Import AddToCart
import { Ionicons } from '@expo/vector-icons';
import Subsubinfo from '../../components/ProductDetails/subsubinfo';

export default function ProductDetails() {
  const product = useLocalSearchParams();
  const router = useRouter();  // Get the router instance

  // Function to handle back navigation
  const handleGoBack = () => {
    router.back(); // Navigate back to the previous screen
  };

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <View style={{flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 10,}}>
              <Pressable onPress={handleGoBack} style={{padding: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 30,
    elevation: 5,}}>
                <Ionicons name="arrow-back" size={20} color="black" />
              </Pressable>
              <Text style={{fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    flex: 1,}}>Details      </Text>
            </View>
      <ScrollView>
        {/* Product Info */}
        <ProductInfo product={product} />

        {/* Product Properties */}
        <Productsubinfo product={product} />
        <Subsubinfo product={product}/>

        {/* About Product */}
        <Aboutproduct product={product} />

        {/* Add to Cart with Quantity Selector */}
        <AddToCart product={product} />
      </ScrollView>
      <OwnerInfo product={product} />
    </View>
  );
}


