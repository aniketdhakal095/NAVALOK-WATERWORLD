import React, { useState, useEffect } from 'react';
import { 
  View, Text, Pressable, TouchableOpacity, Image, StyleSheet, ScrollView, 
  TextInput, Alert 
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
// Only use useRouter from expo-router
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../config/FirebaseConfig';
import * as ImagePicker from 'expo-image-picker';
import { useUser } from '@clerk/clerk-expo';
import { useLocalSearchParams, useRouter } from 'expo-router';

export default function InventoryProductEdit() {
  const product = useLocalSearchParams();  // Directly access params from the route

  // Ensure formData matches expected structure
  const [formData, setFormData] = useState({
    name: '',
    category: 'Tools',
    price: '',
    quantity: '',
    measureUnit: 'Pcs',
    description: '',
    imageUrl: ''
  });

  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchProductDetails();
  }, []);

  const fetchProductDetails = async () => {
    try {
      // Ensure product.id is a string
      const productRef = doc(db, 'InventoryProduct', product.id as string); // Fix: ensure product.id is a string
      const productSnap = await getDoc(productRef);

      if (productSnap.exists()) {
        const data = productSnap.data();
        setFormData({
          name: data.name || '',
          category: data.category || 'Tools',
          price: data.price || '',
          quantity: data.quantity || '',
          measureUnit: data.measureUnit || 'Pcs',
          description: data.description || '',
          imageUrl: data.imageUrl || '',
        });
      } else {
        Alert.alert('Error', 'Product not found!');
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      Alert.alert('Error', 'Failed to fetch product details.');
    }
  };

  const handleInputChange = (fieldName, fieldValue) => {
    setFormData((prev) => ({
      ...prev,
      [fieldName]: fieldValue,
    }));
  };

  const updateProduct = async () => {
    try {
      setLoading(true);
      // Use product.id instead of productId
      await updateDoc(doc(db, 'InventoryProduct', product.id as string), formData); // Fix: use product.id here
      Alert.alert('Success', 'Product updated successfully!');
      router.back();
    } catch (error) {
      console.error('Update error:', error);
      Alert.alert('Error', 'Failed to update product.');
    } finally {
      setLoading(false);
    }
  };

  const imagePicker = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaType.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      const imageUrl = await uploadImageToCloudinary(result.assets[0].uri);
      setFormData((prev) => ({ ...prev, imageUrl })); // Update formData with the new imageUrl
    }
  };

  const uploadImageToCloudinary = async (imageUri) => {
    try {
      const response = await fetch(imageUri);
      const blob = await response.blob(); // Convert image to Blob

      const data = new FormData();
      data.append('file', blob, 'upload.jpg'); // Correct FormData usage
      data.append('upload_preset', '_ProductImage');
      data.append('cloud_name', 'dgydap1ot');

      const uploadResponse = await fetch('https://api.cloudinary.com/v1_1/dgydap1ot/image/upload', {
        method: 'POST',
        body: data,
        headers: { 'Accept': 'application/json' },
      });

      const result = await uploadResponse.json();
      return result.secure_url;
    } catch (error) {
      console.error('Upload error:', error);
      Alert.alert('Error', 'Failed to upload image.');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name='arrow-back' size={20} color='black' />
        </Pressable>
        <Text style={styles.title}>Edit Inventory Product</Text>
      </View>

      <Pressable onPress={imagePicker}>
        <Image
          source={formData.imageUrl ? { uri: formData.imageUrl } : require('../../assets/images/imageplaceholder.jpg')}
          style={styles.imagePreview}
        />
      </Pressable>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Product Name</Text>
        <TextInput 
          style={styles.input} 
          value={formData.name} 
          onChangeText={(value) => handleInputChange('name', value)} 
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Product Price (Rs.)</Text>
        <TextInput 
          style={styles.input} 
          keyboardType='number-pad' 
          value={formData.price} 
          onChangeText={(value) => handleInputChange('price', value)} 
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Product Quantity</Text>
        <TextInput 
          style={styles.input} 
          keyboardType='number-pad' 
          value={formData.quantity} 
          onChangeText={(value) => handleInputChange('quantity', value)} 
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Product Description</Text>
        <TextInput 
          style={styles.input} 
          multiline 
          numberOfLines={5} 
          value={formData.description} 
          onChangeText={(value) => handleInputChange('description', value)} 
        />
      </View>

      <TouchableOpacity style={styles.button} onPress={updateProduct} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? 'Updating...' : 'Save Changes'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f8f8f8' },
  header: { flexDirection: 'row', alignItems: 'center', marginVertical: 10 },
  backButton: { padding: 10, borderRadius: 30, elevation: 5 },
  title: { fontSize: 20, fontWeight: 'bold', flex: 1, textAlign: 'center' },
  imagePreview: { width: 100, height: 100, borderRadius: 15 },
  inputContainer: { marginVertical: 5 },
  input: { padding: 10, backgroundColor: '#fff', borderRadius: 7 },
  label: { marginVertical: 5, fontWeight: 'bold' },
  button: { padding: 15, backgroundColor: 'green', borderRadius: 7, marginVertical: 10 },
  buttonText: { textAlign: 'center', fontWeight: 'bold', color: '#fff' },
});
