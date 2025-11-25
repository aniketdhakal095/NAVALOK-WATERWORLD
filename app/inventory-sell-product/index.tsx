import React, { useState, useEffect } from 'react';
import { 
  View, Text, Pressable, TouchableOpacity, Image, StyleSheet, ScrollView, 
  TextInput, Alert 
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import Colors from '../../constants/Colors';
import { Picker } from '@react-native-picker/picker';
import { collection, doc, getDocs, setDoc } from 'firebase/firestore';
import { db } from '../../config/FirebaseConfig';
import * as ImagePicker from 'expo-image-picker';
import { useUser } from '@clerk/clerk-expo';

// Define the Category type
interface Category {
  name: string;
}

export default function InventorySellProduct() {
  const [formData, setFormData] = useState({
    name: '',
    category: 'Tools',
    price: '',
    quantity: '',
    measureUnit: 'Pcs',
    description: '',
  });
  const [measureUnit, setMeasureUnit] = useState('Kg');
  const [categoryList, setCategoryList] = useState<Category[]>([]); // Properly typed
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
      const snapshot = await getDocs(collection(db, 'InventoryCategory'));
      const categories = snapshot.docs.map(doc => doc.data() as Category); // Cast the data as Category
      setCategoryList(categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      Alert.alert("Error", "Failed to fetch categories.");
    }
  };

  const onSubmit = async () => {
    if (!image) {
      Alert.alert("Error", "Please select an image first!");
      return;
    }

    try {
      setLoading(true);
      const imageUrl = await uploadImageToCloudinary(image);
      console.log("Image Uploaded Successfully:", imageUrl);

      await SaveFormData(imageUrl);
      
      Alert.alert("Success", "Product uploaded successfully!");
    } catch (error) {
      console.error("Error:", error);
      Alert.alert("Upload Failed", error.message);
    } finally {
      setLoading(false);
    }
  };

  const uploadImageToCloudinary = async (imageUri: string) => {
    const file = {
      uri: imageUri,
      type: "image/jpeg",
      name: "upload.jpg",
    };

    const data = new FormData();
    data.append("file", file as any);
    data.append("upload_preset", "_ProductImage");
    data.append("cloud_name", "dgydap1ot");

    try {
      const response = await fetch(
        "https://api.cloudinary.com/v1_1/dgydap1ot/image/upload",
        {
          method: "POST",
          body: data,
          headers: { "Accept": "application/json" },
        }
      );

      const result = await response.json();
      if (result.secure_url) {
        return result.secure_url; 
      } else {
        throw new Error("Upload failed");
      }
    } catch (error) {
      console.error("Upload Error:", error);
      throw error;
    }
  };

  const SaveFormData = async (imageUrl: string) => {
    const docId = Date.now().toString();
    const productRef = doc(db, "InventoryProduct", docId);

    try {
      await setDoc(productRef, {
        ...formData,
        imageUrl: imageUrl,
        username: user?.fullName,
        email: user?.primaryEmailAddress?.emailAddress,
        userImage: user?.imageUrl,
        id: docId,
      });

      console.log("Product successfully stored in Firebase!");
    } catch (error) {
      console.error("Error storing product data:", error);
      Alert.alert("Error", "Failed to store product data.");
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
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={20} color="black" />
        </Pressable>
        <Text style={styles.title}>Sell Inventory Product</Text>
      </View>

      {/* Image Picker */}
      <Pressable onPress={imagePicker}>
        {!image ? (
          <Image
            source={require('./../../assets/images/imageplaceholder.jpg')}
            style={styles.imagePlaceholder}
          />
        ) : (
          <Image source={{ uri: image }} style={styles.imagePreview} />
        )}
      </Pressable>

      {/* Product Name */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Product Name</Text>
        <TextInput
          style={styles.input}
          onChangeText={(value) => handleInputChange('name', value)}
        />
      </View>

      {/* Product Category */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Product Category</Text>
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

      {/* Product Price */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Product Price in Rs.</Text>
        <TextInput
          style={styles.input}
          keyboardType="number-pad"
          onChangeText={(value) => handleInputChange('price', value)}
        />
      </View>

      {/* Product Quantity */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Product Quantity</Text>
        <TextInput
          style={styles.input}
          keyboardType="number-pad"
          onChangeText={(value) => handleInputChange('quantity', value)}
        />
      </View>

      {/* Product Description */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Product Description</Text>
        <TextInput
          style={styles.input}
          numberOfLines={5}
          multiline={true}
          onChangeText={(value) => handleInputChange('description', value)}
        />
      </View>

      {/* Submit Button */}
      <TouchableOpacity style={styles.button} onPress={onSubmit} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? "Uploading..." : "Submit"}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f8f8f8' },
  header: { flexDirection: 'row', alignItems: 'center', marginVertical: 10 },
  backButton: { padding: 10, borderRadius: 30, elevation: 5 },
  title: { fontSize: 20, fontWeight: 'bold', flex: 1, textAlign: 'center' },
  imagePlaceholder: { width: 100, height: 100, borderRadius: 15 },
  imagePreview: { width: 100, height: 100, borderRadius: 15 },
  inputContainer: { marginVertical: 5 },
  input: { padding: 10, backgroundColor: '#fff', borderRadius: 7 },
  label: { marginVertical: 5, fontWeight: 'bold' },
  button: { padding: 15, backgroundColor: 'green', borderRadius: 7, marginVertical: 10 },
  buttonText: { textAlign: 'center', fontWeight: 'bold', color: '#fff' },
});
