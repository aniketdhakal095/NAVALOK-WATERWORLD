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
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../../config/FirebaseConfig';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import Colors from '../../constants/Colors';

// ------------------- Types -------------------
type FishPlantParams = {
  productId?: string; // optional to safely check
  name?: string;
  imageUrl?: string;
  type?: 'Fish' | 'Plant';
  waterCategory?: 'Salt' | 'Fresh';
  price?: string;
  quantity?: string;
  measureUnit?: string;
};

// ------------------- Component -------------------
export default function FishPlantEditingPage() {
  const router = useRouter();
  const params = useLocalSearchParams<FishPlantParams>();

  const [productId, setProductId] = useState(params.productId || '');
  const [productName, setProductName] = useState(params.name || '');
  const [productImage, setProductImage] = useState(params.imageUrl || '');
  const [productType, setProductType] = useState<FishPlantParams['type']>(params.type || 'Fish');
  const [waterCategory, setWaterCategory] = useState<FishPlantParams['waterCategory']>(params.waterCategory || 'Fresh');
  const [productPrice, setProductPrice] = useState(params.price || '');
  const [productQuantity, setProductQuantity] = useState(params.quantity || '');
  const [productMeasure, setProductMeasure] = useState(params.measureUnit || '');
  const [loading, setLoading] = useState(false);

  // ------------------- SAFETY CHECK -------------------
  useEffect(() => {
    if (!productId) {
      Alert.alert('Error', 'Invalid product ID. Returning back.');
      router.back();
    } else {
      fetchProductData(productId);
    }
  }, [productId]);

  // Fetch latest product data (optional, ensures editing latest)
  const fetchProductData = async (id: string) => {
    try {
      const docRef = doc(db, 'Fish_Plant', id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setProductName(data.name || '');
        setProductImage(data.imageUrl || '');
        setProductType(data.type || 'Fish');
        setWaterCategory(data.waterCategory || 'Fresh');
        setProductPrice(String(data.price || ''));
        setProductQuantity(String(data.quantity || ''));
        setProductMeasure(data.measureUnit || '');
      } else {
        Alert.alert('Error', 'Product not found.');
        router.back();
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      Alert.alert('Error', 'Failed to load product.');
      router.back();
    }
  };

  // ------------------- IMAGE PICKER -------------------
  const pickImage = async () => {
    try {
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission required', 'Camera roll permission is required!');
          return;
        }
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images, // works on latest Expo
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled && result.assets.length > 0) {
        const uri = result.assets[0].uri;
        const imageUrl = await uploadImageToCloudinary(uri);
        if (imageUrl) setProductImage(imageUrl);
      }
    } catch (error) {
      console.error('Image picker error:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  // ------------------- CLOUDINARY UPLOAD -------------------
  const uploadImageToCloudinary = async (imageUri: string) => {
    try {
      const formData = new FormData();
      formData.append('file', {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'upload.jpg',
      } as any);
      formData.append('upload_preset', '_ProductImage');
      formData.append('cloud_name', 'dgydap1ot');

      const response = await fetch('https://api.cloudinary.com/v1_1/dgydap1ot/image/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (!data.secure_url) throw new Error('No secure_url returned from Cloudinary');
      return data.secure_url as string;
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      Alert.alert('Error', 'Failed to upload image. Ensure internet connection.');
      return null;
    }
  };

  // ------------------- UPDATE PRODUCT -------------------
  const handleUpdate = async () => {
    if (!productId) {
      Alert.alert('Error', 'Invalid product ID');
      return;
    }

    if (!productName || !productType || !waterCategory || !productPrice || !productQuantity || !productMeasure) {
      Alert.alert('Validation', 'Please fill all fields');
      return;
    }

    setLoading(true);
    try {
      const productRef = doc(db, 'Fish_Plant', productId);
      await updateDoc(productRef, {
        name: productName,
        imageUrl: productImage,
        type: productType,
        waterCategory,
        price: Number(productPrice),
        quantity: Number(productQuantity),
        measureUnit: productMeasure,
      });

      Alert.alert('Success', 'Product updated successfully');
      router.back();
    } catch (error) {
      console.error('Error updating product:', error);
      Alert.alert('Error', 'Failed to update product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Edit Fish/Plant Product</Text>

      {/* Image Picker */}
      <Text style={styles.label}>Product Image</Text>
      <Pressable onPress={pickImage} style={{ alignItems: 'center', marginBottom: 10 }}>
        {productImage ? (
          <Image source={{ uri: productImage }} style={styles.imagePreview} />
        ) : (
          <View style={[styles.imagePreview, { justifyContent: 'center', alignItems: 'center', backgroundColor: '#ddd' }]}>
            <Text>Tap to select image</Text>
          </View>
        )}
      </Pressable>

      {/* Name */}
      <Text style={styles.label}>Name</Text>
      <TextInput style={styles.input} value={productName} onChangeText={setProductName} />

      {/* Type */}
      <Text style={styles.label}>Type</Text>
      <Picker selectedValue={productType} style={styles.picker} onValueChange={(value) => setProductType(value)}>
        <Picker.Item label="Fish" value="Fish" />
        <Picker.Item label="Plant" value="Plant" />
      </Picker>

      {/* Water Category */}
      <Text style={styles.label}>Water Category</Text>
      <Picker selectedValue={waterCategory} style={styles.picker} onValueChange={(value) => setWaterCategory(value)}>
        <Picker.Item label="Fresh Water" value="Fresh" />
        <Picker.Item label="Salt Water" value="Salt" />
      </Picker>

      {/* Price */}
      <Text style={styles.label}>Price (Rs.)</Text>
      <TextInput style={styles.input} value={productPrice} onChangeText={setProductPrice} keyboardType="numeric" />

      {/* Quantity */}
      <Text style={styles.label}>Quantity</Text>
      <TextInput style={styles.input} value={productQuantity} onChangeText={setProductQuantity} keyboardType="numeric" />

      {/* Measure Unit */}
      <Text style={styles.label}>Measure Unit</Text>
      <TextInput style={styles.input} value={productMeasure} onChangeText={setProductMeasure} placeholder="e.g., pcs, kg, liter" />

      {/* Buttons */}
      <TouchableOpacity style={styles.button} onPress={handleUpdate} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? 'Updating...' : 'Update Product'}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={() => router.back()}>
        <Text style={[styles.buttonText, { color: Colors.PRIMARY }]}>Cancel</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

// ------------------- Styles -------------------
const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: '#f8f8f8', flexGrow: 1 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  label: { fontSize: 14, fontWeight: 'bold', marginTop: 12 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, marginTop: 5, backgroundColor: '#fff' },
  picker: { backgroundColor: '#fff', borderRadius: 8, marginTop: 5, height: 50 },
  imagePreview: { width: 120, height: 120, borderRadius: 12, marginBottom: 10 },
  button: { marginTop: 20, backgroundColor: Colors.PRIMARY, padding: 14, borderRadius: 12, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  cancelButton: { backgroundColor: '#fff', borderWidth: 1, borderColor: Colors.PRIMARY, marginTop: 10 },
});
