import { View, ScrollView, Pressable, Text, ActivityIndicator } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../config/FirebaseConfig';
import { Ionicons } from '@expo/vector-icons';

import ProductInfo from '../../components/ProductDetails/ProductInfo';
import Productsubinfo from '../../components/ProductDetails/Productsubinfo';
import Aboutproduct from '../../components/ProductDetails/Aboutproduct';
import OwnerInfo from '../../components/ProductDetails/OwnerInfo';
import AddToCart from '../../components/ProductDetails/AddToCart';
import Subsubinfo from '../../components/ProductDetails/subsubinfo';

export default function ProductDetails() {
  const { id, collectionName } = useLocalSearchParams();
  const router = useRouter();

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id || !collectionName) return;

      try {
        const docRef = doc(
          db,
          collectionName as string,
          id as string
        );

        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setProduct({
            id: docSnap.id,
            ...docSnap.data(),
          });
        }
      } catch (error) {
        console.log('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, collectionName]);

  const handleGoBack = () => {
    router.back();
  };

  if (loading || !product) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#2E86DE" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, padding: 16 }}>
      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginTop: 10,
          marginBottom: 10,
        }}
      >
        <Pressable
          onPress={handleGoBack}
          style={{
            padding: 10,
            backgroundColor: 'rgba(255, 255, 255, 0.7)',
            borderRadius: 30,
            elevation: 5,
          }}
        >
          <Ionicons name="arrow-back" size={20} color="black" />
        </Pressable>

        <Text
          style={{
            fontSize: 20,
            fontWeight: 'bold',
            color: '#333',
            textAlign: 'center',
            flex: 1,
          }}
        >
          Details
        </Text>
      </View>

      <ScrollView>
        <ProductInfo product={product} />
        <Productsubinfo product={product} />
        <Subsubinfo product={product} />
        <Aboutproduct product={product} />
        <AddToCart product={product} />
      </ScrollView>

      <OwnerInfo product={product} />
    </View>
  );
}