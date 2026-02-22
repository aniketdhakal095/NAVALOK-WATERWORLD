import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  Image,
  Pressable,
  ActivityIndicator,
  Platform,
} from 'react-native';

import { useRouter, useLocalSearchParams } from 'expo-router';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../../config/FirebaseConfig';
import * as ImagePicker from 'expo-image-picker';
import Colors from '../../constants/Colors';

export default function InventoryProductEdit() {
  const router = useRouter();
  const params = useLocalSearchParams();

  // ✅ same safe param handling
  const productId = Array.isArray(params.productId)
    ? params.productId[0]
    : params.productId;

  const [productName, setProductName] = useState('');
  const [productCategory, setProductCategory] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [productQuantity, setProductQuantity] = useState('');
  const [productMeasure, setProductMeasure] = useState('');
  const [productDescription, setProductDescription] = useState('');
  const [productImage, setProductImage] = useState('');

  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  // ---------------- FETCH PRODUCT ----------------
  useEffect(() => {
    if (!productId) return;
    fetchProductData();
  }, [productId]);

  const fetchProductData = async () => {
    try {
      setLoading(true);

      const docRef = doc(db, 'InventoryProduct', productId as string);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        Alert.alert('Error', 'Product not found');
        router.back();
        return;
      }

      const data = docSnap.data();

      setProductName(data?.name ?? '');
      setProductCategory(data?.category ?? '');
      setProductPrice(String(data?.price ?? ''));
      setProductQuantity(String(data?.quantity ?? ''));
      setProductMeasure(data?.measureUnit ?? '');
      setProductDescription(data?.description ?? '');
      setProductImage(data?.imageUrl ?? '');
    } catch (error) {
      console.log(error);
      Alert.alert('Failed to load product');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  // ---------------- IMAGE PICKER ----------------
  const pickImage = async () => {
    if (Platform.OS !== 'web') {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert('Permission required');
        return;
      }
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setProductImage(result.assets[0].uri);
    }
  };

  // ---------------- UPDATE ----------------
  const handleUpdate = async () => {
    if (!productName || !productPrice || !productQuantity) {
      Alert.alert('Fill all fields');
      return;
    }

    try {
      setUpdating(true);

      const productRef = doc(db, 'InventoryProduct', productId as string);

      await updateDoc(productRef, {
        name: productName,
        category: productCategory,
        price: Number(productPrice),
        quantity: Number(productQuantity),
        measureUnit: productMeasure,
        description: productDescription,
        imageUrl: productImage,
      });

      Alert.alert('Success', 'Product updated');
      router.back();
    } catch (error) {
      console.log(error);
      Alert.alert('Update failed');
    } finally {
      setUpdating(false);
    }
  };

  // ---------------- LOADING ----------------
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Edit Inventory Product</Text>

      {/* Image */}
      <Pressable onPress={pickImage} style={{ alignItems: 'center' }}>
        {productImage ? (
          <Image source={{ uri: productImage }} style={styles.imagePreview} />
        ) : (
          <View style={styles.imagePreview}>
            <Text>Select Image</Text>
          </View>
        )}
      </Pressable>

      <Text style={styles.label}>Name</Text>
      <TextInput style={styles.input} value={productName} onChangeText={setProductName} />

      <Text style={styles.label}>Category</Text>
      <TextInput style={styles.input} value={productCategory} onChangeText={setProductCategory} />

      <Text style={styles.label}>Price</Text>
      <TextInput
        style={styles.input}
        value={productPrice}
        keyboardType="numeric"
        onChangeText={setProductPrice}
      />

      <Text style={styles.label}>Quantity</Text>
      <TextInput
        style={styles.input}
        value={productQuantity}
        keyboardType="numeric"
        onChangeText={setProductQuantity}
      />

      <Text style={styles.label}>Measure Unit</Text>
      <TextInput style={styles.input} value={productMeasure} onChangeText={setProductMeasure} />

      <Text style={styles.label}>Description</Text>
      <TextInput
        style={styles.input}
        multiline
        value={productDescription}
        onChangeText={setProductDescription}
      />

      <TouchableOpacity style={styles.button} onPress={handleUpdate}>
        <Text style={styles.buttonText}>
          {updating ? 'Updating...' : 'Update Product'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, flexGrow: 1 },
  title: { fontSize: 22, fontWeight: 'bold', textAlign: 'center' },
  label: { marginTop: 12, fontWeight: 'bold' },
  input: { borderWidth: 1, borderRadius: 8, padding: 10, marginTop: 5 },
  imagePreview: {
    width: 120,
    height: 120,
    borderRadius: 12,
    backgroundColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  button: {
    marginTop: 20,
    backgroundColor: Colors.PRIMARY,
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontWeight: 'bold' },
});