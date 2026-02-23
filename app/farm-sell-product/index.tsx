import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Pressable,
  TouchableOpacity,
  Image,
  StyleSheet,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { Picker } from '@react-native-picker/picker';
import { collection, doc, getDocs, setDoc } from 'firebase/firestore';
import { db } from '../../config/FirebaseConfig';
import * as ImagePicker from 'expo-image-picker';
import { useUser } from '@clerk/clerk-expo';

type Category = { name: string };

export default function FarmSellProduct() {
  const [formData, setFormData] = useState({
    name: '',
    category: 'Aquarium',
    price: '',
    quantity: '',
    measureUnit: '',
    description: '',
    capacity: '',
    status: '',
  });
  const [measureUnit, setMeasureUnit] = useState('Kg');
  const [categoryList, setCategoryList] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('Fruits');
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { user } = useUser();
  const router = useRouter();

  useEffect(() => {
    GetCategories();
  }, []);

  const handleInputChange = (fieldName: string, fieldValue: string) => {
    setFormData((prev) => ({
      ...prev,
      [fieldName]: fieldValue,
    }));
  };

  const GetCategories = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'Category'));
      const categories = snapshot.docs.map((doc) => doc.data() as Category);
      setCategoryList(categories);
    } catch (error) {
      console.error('Error fetching categories:', error);
      Alert.alert('Error', 'Failed to fetch categories.');
    }
  };

  const onSubmit = async () => {
    if (!image) {
      Alert.alert('Error', 'Please select an image first!');
      return;
    }

    try {
      setLoading(true);
      const imageUrl = await uploadImageToCloudinary(image);
      await SaveFormData(imageUrl);
      Alert.alert('Success', 'Product uploaded successfully!');
    } catch (error: any) {
      console.error('Error:', error);
      Alert.alert('Upload Failed', error?.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const uploadImageToCloudinary = async (imageUri: string) => {
    const file = {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'upload.jpg',
    };

    const data = new FormData();
    data.append('file', file as any);
    data.append('upload_preset', '_ProductImage');
    data.append('cloud_name', 'dgydap1ot');

    try {
      const response = await fetch('https://api.cloudinary.com/v1_1/dgydap1ot/image/upload', {
        method: 'POST',
        body: data,
        headers: { Accept: 'application/json' },
      });

      const result = await response.json();
      if (result.secure_url) {
        return result.secure_url;
      }
      throw new Error('Upload failed');
    } catch (error) {
      console.error('Upload Error:', error);
      throw error;
    }
  };

  const SaveFormData = async (imageUrl: string) => {
    const docId = Date.now().toString();
    const productRef = doc(db, 'Product', docId);

    try {
      await setDoc(productRef, {
        ...formData,
        imageUrl: imageUrl,
        username: user?.fullName,
        email: user?.primaryEmailAddress?.emailAddress,
        userImage: user?.imageUrl,
        id: docId,
      });
    } catch (error) {
      console.error('Error storing product data:', error);
      Alert.alert('Error', 'Failed to store product data.');
    }
  };

  const imagePicker = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.bgTopBlob} />
      <View style={styles.bgBottomBlob} />

      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={20} color="#0f172a" />
        </Pressable>
        <Text style={styles.title}>Sell Farm Product</Text>
      </View>

      <View style={styles.card}>
        <Pressable onPress={imagePicker} style={styles.imagePickerWrap}>
          {!image ? (
            <Image source={require('./../../assets/images/imageplaceholder.jpg')} style={styles.imagePlaceholder} />
          ) : (
            <Image source={{ uri: image }} style={styles.imagePreview} />
          )}
          <Text style={styles.imageText}>Tap to select product image</Text>
        </Pressable>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Product Name</Text>
          <TextInput style={styles.input} onChangeText={(value) => handleInputChange('name', value)} placeholder="Enter name" placeholderTextColor="#94a3b8" />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Product Category</Text>
          <View style={styles.pickerWrap}>
            <Picker
              selectedValue={selectedCategory}
              style={styles.input}
              onValueChange={(itemValue) => {
                setSelectedCategory(itemValue);
                handleInputChange('category', itemValue);
              }}
            >
              {categoryList.map((category, index) => (
                <Picker.Item key={index} label={category.name} value={category.name} />
              ))}
            </Picker>
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Product Status</Text>
          <View style={styles.pickerWrap}>
            <Picker
              selectedValue={measureUnit}
              style={styles.input}
              onValueChange={(itemValue) => {
                setMeasureUnit(itemValue);
                handleInputChange('status', itemValue);
              }}
            >
              <Picker.Item label="Brand New" value="Brand New" />
              <Picker.Item label="2nd Handed" value="2nd Handed" />
              <Picker.Item label="3rd Handed" value="3rd Handed" />
            </Picker>
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Product Price in Rs.</Text>
          <TextInput style={styles.input} keyboardType="number-pad" onChangeText={(value) => handleInputChange('price', value)} placeholder="0" placeholderTextColor="#94a3b8" />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Product Quantity</Text>
          <TextInput style={styles.input} keyboardType="number-pad" onChangeText={(value) => handleInputChange('quantity', value)} placeholder="0" placeholderTextColor="#94a3b8" />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Product Measuring Unit</Text>
          <View style={styles.pickerWrap}>
            <Picker
              selectedValue={measureUnit}
              style={styles.input}
              onValueChange={(itemValue) => {
                setMeasureUnit(itemValue);
                handleInputChange('measureUnit', itemValue);
              }}
            >
              <Picker.Item label="Kg" value="Kg" />
              <Picker.Item label="Ltr" value="Ltr" />
              <Picker.Item label="gm" value="gm" />
              <Picker.Item label="Ml" value="Ml" />
              <Picker.Item label="Dozen" value="dozen" />
              <Picker.Item label="Pcs" value="pcs" />
            </Picker>
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Product Capacity (Ltr)</Text>
          <TextInput style={styles.input} keyboardType="number-pad" onChangeText={(value) => handleInputChange('capacity', value)} placeholder="0" placeholderTextColor="#94a3b8" />
        </View>

        <TouchableOpacity style={styles.button} onPress={onSubmit} disabled={loading}>
          <Text style={styles.buttonText}>{loading ? 'Uploading...' : 'Submit'}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#eef8f5' },
  content: { padding: 16, paddingBottom: 26 },
  bgTopBlob: {
    position: 'absolute',
    top: -120,
    right: -70,
    width: 240,
    height: 240,
    borderRadius: 130,
    backgroundColor: 'rgba(20, 184, 166, 0.16)',
  },
  bgBottomBlob: {
    position: 'absolute',
    bottom: -140,
    left: -90,
    width: 260,
    height: 260,
    borderRadius: 140,
    backgroundColor: 'rgba(34, 197, 94, 0.16)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  backButton: {
    padding: 10,
    borderRadius: 999,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#dbeee8',
  },
  title: {
    fontSize: 24,
    fontFamily: 'outfits-extrabold',
    color: '#0f172a',
    flex: 1,
    textAlign: 'center',
    marginRight: 40,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#dbeee8',
    shadowColor: '#0f172a',
    shadowOpacity: 0.06,
    shadowRadius: 9,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  imagePickerWrap: {
    alignItems: 'center',
    marginBottom: 10,
  },
  imagePlaceholder: { width: 130, height: 130, borderRadius: 16 },
  imagePreview: { width: 130, height: 130, borderRadius: 16 },
  imageText: {
    marginTop: 8,
    fontFamily: 'outfits-medium',
    fontSize: 13,
    color: '#0f766e',
  },
  inputContainer: { marginVertical: 6 },
  input: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderRadius: 11,
    borderWidth: 1,
    borderColor: '#d7ebe5',
    fontFamily: 'outfits',
    color: '#0f172a',
  },
  pickerWrap: {
    borderRadius: 11,
    overflow: 'hidden',
  },
  label: {
    marginBottom: 6,
    fontFamily: 'outfits-medium',
    color: '#14532d',
  },
  button: {
    padding: 14,
    backgroundColor: '#15803d',
    borderRadius: 12,
    marginVertical: 12,
    alignItems: 'center',
  },
  buttonText: {
    textAlign: 'center',
    fontFamily: 'outfits-medium',
    color: '#fff',
    fontSize: 16,
  },
});
