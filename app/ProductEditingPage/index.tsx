import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, TextInput, TouchableOpacity, Alert, ScrollView, Image } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { collection, doc, getDoc, updateDoc, getDocs } from 'firebase/firestore';
import { db } from '../../config/FirebaseConfig'; // Import Firestore from Firebase config
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams } from 'expo-router';
import { Picker } from '@react-native-picker/picker';
import { useUser } from '@clerk/clerk-expo';

export default function ProductEditPage() {
  const router = useRouter();
  const product = useLocalSearchParams();
  const { user } = useUser();

  // State for categories, formData, and loading
  const [categoryList, setCategoryList] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: '',
    description: '',
    imageUrl: '',
    measureUnit: '',
    quantity: '', // Initialize quantity field
  });
  const [loading, setLoading] = useState(false);

  // Fetch product details from Firestore on component mount
  useEffect(() => {
    fetchProductDetails();
    GetCategories();  // Fetch categories on mount
  }, []);

  // Fetch product details from Firestore
  const fetchProductDetails = async () => {
    try {
      const productRef = doc(db, 'Product', product.id as string); // Fix: ensure product.id is a string
      const productSnap = await getDoc(productRef);
      if (productSnap.exists()) {
        const data = productSnap.data();
        setFormData({
          name: data.name || '',
          category: data.category || '',
          price: data.price || '',
          description: data.description || '',
          imageUrl: data.imageUrl || '',
          measureUnit: data.measureUnit || '',
          quantity: data.quantity || '', 
        });
      } else {
        Alert.alert('Error', 'Product not found!');
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      Alert.alert('Error', 'Failed to fetch product details.');
    }
  };

  // Fetch categories from Firestore and set them in categoryList
  const GetCategories = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'Category'));
      const categories = snapshot.docs.map(doc => doc.data());
      setCategoryList(categories);
    } catch (error) {
      console.error('Error fetching categories:', error);
      Alert.alert('Error', 'Failed to fetch categories.');
    }
  };

  // Handle changes in form fields
  const handleInputChange = (fieldName, fieldValue) => {
    setFormData((prev) => ({
      ...prev,
      [fieldName]: fieldValue,
    }));
  };

  // Handle image picker for product image
  const imagePicker = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      const imageUrl = await uploadImageToCloudinary(result.assets[0].uri);
      setFormData((prev) => ({ ...prev, imageUrl })); // Update formData with new imageUrl
    }
  };

  // Upload image to Cloudinary
  const uploadImageToCloudinary = async (imageUri) => {
    try {
      const response = await fetch(imageUri);
      const blob = await response.blob();

      const data = new FormData();
      data.append('file', blob, 'upload.jpg');
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

  // Update product in Firestore
  const updateProduct = async () => {
      try {
        setLoading(true);
        // Use product.id instead of productId
        await updateDoc(doc(db, 'Product', product.id as string), formData); // Fix: use product.id here
        Alert.alert('Success', 'Product updated successfully!');
        router.back();
      } catch (error) {
        console.error('Update error:', error);
        Alert.alert('Error', 'Failed to update product.');
      } finally {
        setLoading(false);
      }
    };
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={20} color="black" />
        </Pressable>
        <Text style={styles.title}>Edit Farm Product</Text>
      </View>

      {/* Image Picker */}
      <Pressable onPress={imagePicker}>
        <Image
          source={formData.imageUrl ? { uri: formData.imageUrl } : require('../../assets/images/imageplaceholder.jpg')}
          style={styles.imagePreview}
        />
      </Pressable>

      {/* Product Name */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Product Name</Text>
        <TextInput
          style={styles.input}
          value={formData.name}
          onChangeText={(value) => handleInputChange('name', value)}
        />
      </View>

      {/* Product Category */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Product Category</Text>
        <Picker
          selectedValue={formData.category}
          style={styles.picker}
          onValueChange={(itemValue) => handleInputChange('category', itemValue)}
        >
          {categoryList.map((category) => (
            <Picker.Item key={category.name} label={category.name} value={category.name} />
          ))}
        </Picker>
      </View>

      {/* Product Price */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Product Price (Rs.)</Text>
        <TextInput
          style={styles.input}
          keyboardType="number-pad"
          value={formData.price}
          onChangeText={(value) => handleInputChange('price', value)}
        />
      </View>

      {/* Product Quantity */}
      <View style={styles.inputContainer}>
      <Text style={styles.label}>Product Quantity</Text>
      <TextInput
        style={styles.input}
        keyboardType="number-pad"
        value={formData.quantity}
         onChangeText={(value) => handleInputChange('quantity', value)}
        />
        </View>

      {/* Product Measure Unit */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Product Measure Unit</Text>
        <Picker
          selectedValue={formData.measureUnit}
          style={styles.picker}
          onValueChange={(value) => handleInputChange('measureUnit', value)}
        >
          <Picker.Item label="Kg" value="Kg" />
          <Picker.Item label="Ltr" value="Ltr" />
          <Picker.Item label="gm" value="gm" />
          <Picker.Item label="Ml" value="Ml" />
          <Picker.Item label="Dozen" value="dozen" />
        </Picker>
      </View>

      {/* Product Description */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Product Description</Text>
        <TextInput
          style={styles.input}
          value={formData.description}
          multiline
          numberOfLines={5}
          onChangeText={(value) => handleInputChange('description', value)}
        />
      </View>

      {/* Save Changes Button */}
      <TouchableOpacity style={styles.button} onPress={updateProduct} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? 'Updating...' : 'Save Changes'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f8f8f8',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  backButton: {
    padding: 10,
    borderRadius: 30,
    elevation: 5,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  imagePreview: {
    width: 100,
    height: 100,
    borderRadius: 15,
    alignSelf: 'center',
  },
  inputContainer: {
    marginVertical: 10,
  },
  input: {
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 7,
    height: 45,
  },
  picker: {
    backgroundColor: '#fff',
    borderRadius: 7,
    height: 70,
    marginTop: 5,
    
  },
  label: {
    marginVertical: 5,
    fontWeight: 'bold',
  },
  button: {
    padding: 15,
    backgroundColor: 'green',
    borderRadius: 7,
    marginVertical: 10,
  },
  buttonText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#fff',
  },
});
