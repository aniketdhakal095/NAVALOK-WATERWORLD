import { View, ScrollView, Pressable, Text, ActivityIndicator, StyleSheet } from 'react-native';
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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      const productId = Array.isArray(id) ? id[0] : id;
      const selectedCollection = Array.isArray(collectionName) ? collectionName[0] : collectionName;

      if (!productId) {
        setError('Missing product id.');
        setLoading(false);
        return;
      }

      try {
        const collectionsToTry = selectedCollection ? [selectedCollection] : ['Product', 'InventoryProduct', 'Fish_Plant'];

        let foundProduct: any = null;

        for (const col of collectionsToTry) {
          const docRef = doc(db, col, productId as string);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            foundProduct = {
              id: docSnap.id,
              collectionName: col,
              ...docSnap.data(),
            };
            break;
          }
        }

        if (foundProduct) {
          setProduct(foundProduct);
          setError(null);
        } else {
          setError('Product not found.');
        }
      } catch (error) {
        console.log('Error fetching product:', error);
        setError('Failed to load product.');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, collectionName]);

  const handleGoBack = () => {
    router.back();
  };

  if (loading) {
    return (
      <View style={styles.centerWrap}>
        <ActivityIndicator size="large" color="#0a74da" />
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.centerWrap}>
        <Text style={styles.errorText}>{error ?? 'Unable to load product details.'}</Text>
        <Pressable onPress={handleGoBack} style={styles.errorBtn}>
          <Text style={styles.errorBtnText}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.page}>
      <View style={styles.bgTopBlob} />
      <View style={styles.bgBottomBlob} />

      <View style={styles.headerRow}>
        <Pressable onPress={handleGoBack} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={20} color="#0f172a" />
        </Pressable>

        <Text style={styles.title}>Details</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
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

const styles = StyleSheet.create({
  page: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
    backgroundColor: '#f3f7fb',
  },
  scrollContent: {
    paddingBottom: 14,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  backBtn: {
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  title: {
    fontSize: 24,
    fontFamily: 'outfits-extrabold',
    color: '#0f172a',
    marginLeft: 10,
  },
  centerWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f3f7fb',
    paddingHorizontal: 16,
  },
  errorText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 12,
    fontFamily: 'outfits-medium',
  },
  errorBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: '#0a74da',
    borderRadius: 8,
  },
  errorBtnText: {
    color: '#fff',
    fontWeight: '600',
  },
  bgTopBlob: {
    position: 'absolute',
    top: -120,
    right: -70,
    width: 240,
    height: 240,
    borderRadius: 130,
    backgroundColor: 'rgba(53, 109, 231, 0.18)',
  },
  bgBottomBlob: {
    position: 'absolute',
    bottom: -140,
    left: -90,
    width: 260,
    height: 260,
    borderRadius: 140,
    backgroundColor: 'rgba(22, 167, 111, 0.12)',
  },
});
