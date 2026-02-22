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
  Platform,
  ActivityIndicator,
} from 'react-native';

import { useRouter, useLocalSearchParams } from 'expo-router';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../../config/FirebaseConfig';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import Colors from '../../constants/Colors';

export default function ProductEditingPage() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const productId = Array.isArray(params.id) ? params.id[0] : params.id;
  const paramCollectionName = Array.isArray(params.collectionName) 
    ? params.collectionName[0] 
    : params.collectionName;

  const [productName, setProductName] = useState('');
  const [productImage, setProductImage] = useState('');
  const [category, setCategory] = useState('');
  const [productPrice, setProductPrice] = useState('');
  const [productQuantity, setProductQuantity] = useState('');
  const [capacity, setCapacity] = useState('');
  const [productMeasure, setProductMeasure] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [collectionName, setCollectionName] = useState<string>(paramCollectionName || 'Product');

  // ---------------- FETCH PRODUCT ----------------
  useEffect(() => {
    if (!productId) return;
    fetchProductData();
  }, [productId]);

  const fetchProductData = async () => {
    try {
      setLoading(true);
      console.log('Fetching product with ID:', productId, 'from collection:', collectionName);

      const docRef = doc(db, collectionName, productId as string);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        Alert.alert('Error', 'Product not found');
        router.back();
        return;
      }

      const data = docSnap.data();

      setProductName(data?.name ?? '');
      
      let imageUrl = '';
      if (collectionName === 'Fish_Plant') {
        if (data?.image?.secure_url) imageUrl = data.image.secure_url;
        else if (data?.imageUrl) imageUrl = data.imageUrl;
      } else {
        imageUrl = data?.imageUrl ?? '';
      }
      setProductImage(imageUrl);

      setCategory(data?.category ?? '');
      setProductPrice(String(data?.price ?? ''));
      setProductQuantity(String(data?.quantity ?? ''));
      setCapacity(data?.capacity ?? '');
      setProductMeasure(data?.measureUnit ?? '');
      setDescription(data?.description ?? '');
    } catch (error) {
      console.log('Error fetching product:', error);
      Alert.alert('Error', 'Failed to load product');
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
    if (!productName || !productPrice || !productQuantity || !productMeasure) {
      Alert.alert('Fill all fields');
      return;
    }

    try {
      setUpdating(true);

      const productRef = doc(db, collectionName, productId as string);

      await updateDoc(productRef, {
        name: productName,
        imageUrl: productImage,
        category,
        price: Number(productPrice),
        quantity: Number(productQuantity),
        capacity,
        measureUnit: productMeasure,
        description,
      });

      Alert.alert('Success', 'Product updated');
      router.back();
    } catch (error) {
      console.log('Update error:', error);
      Alert.alert('Update failed');
    } finally {
      setUpdating(false);
    }
  };

  // ---------------- LOADING SCREEN ----------------
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Edit Product</Text>

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
      <TextInput style={styles.input} value={category} onChangeText={setCategory} />

      <Text style={styles.label}>Price</Text>
      <TextInput
        style={styles.input}
        value={productPrice}
        onChangeText={setProductPrice}
        keyboardType="numeric"
      />

      <Text style={styles.label}>Quantity</Text>
      <TextInput
        style={styles.input}
        value={productQuantity}
        onChangeText={setProductQuantity}
        keyboardType="numeric"
      />

      <Text style={styles.label}>Capacity (Ltr)</Text>
      <TextInput
        style={styles.input}
        value={capacity}
        onChangeText={setCapacity}
      />

      <Text style={styles.label}>Measure Unit</Text>
      <TextInput
        style={styles.input}
        value={productMeasure}
        onChangeText={setProductMeasure}
      />

      <Text style={styles.label}>Description</Text>
      <TextInput
        style={[styles.input, { height: 100 }]}
        value={description}
        onChangeText={setDescription}
        multiline
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