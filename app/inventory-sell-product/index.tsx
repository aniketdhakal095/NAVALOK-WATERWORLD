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
  const [measureUnit, setMeasureUnit] = useState('Pcs');
  const [categoryList, setCategoryList] = useState<Category[]>([]); // Properly typed
  const [selectedCategory, setSelectedCategory] = useState('Tools');
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
    // Validate required fields
    if (!image) {
      Alert.alert("Error", "Please select an image first!");
      return;
    }

    if (!formData.name || formData.name.trim() === '') {
      Alert.alert("Error", "Please enter a product name!");
      return;
    }

    if (!formData.price || formData.price.trim() === '') {
      Alert.alert("Error", "Please enter a product price!");
      return;
    }

    if (!formData.quantity || formData.quantity.trim() === '') {
      Alert.alert("Error", "Please enter product quantity!");
      return;
    }

    if (!user) {
      Alert.alert("Error", "You must be logged in to upload products!");
      return;
    }

    try {
      setLoading(true);
      const imageUrl = await uploadImageToCloudinary(image);
      console.log("Image Uploaded Successfully:", imageUrl);

      await SaveFormData(imageUrl);
      
      Alert.alert("Success", "Product uploaded successfully!", [
        {
          text: "OK",
          onPress: () => router.back()
        }
      ]);
    } catch (error: any) {
      console.error("Error:", error);
      const errorMessage = error?.message || error?.toString() || "Failed to upload product. Please try again.";
      Alert.alert("Upload Failed", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const uploadImageToCloudinary = async (imageUri: string): Promise<string> => {
    try {
      console.log("Starting image upload to Cloudinary...");
      
      // Create FormData for React Native
      const formData = new FormData();
      
      // Extract filename from URI
      const filename = imageUri.split('/').pop() || 'upload.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';
      
      // Append file to FormData
      formData.append('file', {
        uri: imageUri,
        type: type,
        name: filename,
      } as any);
      
      // Cloudinary upload preset
      // IMPORTANT: You need to create this preset in your Cloudinary dashboard
      // Go to: https://cloudinary.com/console → Settings → Upload → Add upload preset
      // Name: _ProductImage (or ProductImage)
      // Mode: Unsigned (for client-side uploads)
      // Save the preset
      const uploadPreset = '_ProductImage'; // Try original name first
      formData.append('upload_preset', uploadPreset);
      formData.append('cloud_name', 'dgydap1ot');

      console.log("Uploading to Cloudinary...");
      const response = await fetch(
        "https://api.cloudinary.com/v1_1/dgydap1ot/image/upload",
        {
          method: "POST",
          body: formData,
          // DO NOT set Content-Type header - React Native will set it automatically with boundary
          headers: {
            "Accept": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Cloudinary response error:", errorText);
        
        // Try to parse error JSON
        let errorMessage = `Upload failed: ${response.status} ${response.statusText}`;
        try {
          const errorJson = JSON.parse(errorText);
          if (errorJson.error?.message) {
            errorMessage = errorJson.error.message;
            // Provide helpful message for preset not found
            if (errorMessage.includes('preset not found')) {
              errorMessage = `❌ Upload preset '_ProductImage' not found in Cloudinary.\n\n📋 TO FIX THIS:\n1. Go to: https://cloudinary.com/console\n2. Navigate to: Settings → Upload\n3. Click: "Add upload preset"\n4. Name: _ProductImage\n5. Mode: Select "Unsigned"\n6. Signing Mode: Unsigned\n7. Click "Save"\n\nThen try uploading again.`;
            }
          }
        } catch (e) {
          // If parsing fails, use the text as is
          errorMessage = errorText || errorMessage;
        }
        
        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log("Cloudinary upload response:", result);
      
      if (result.secure_url) {
        console.log("✅ Image uploaded successfully! URL:", result.secure_url);
        return result.secure_url; 
      } else if (result.url) {
        // Fallback to regular URL if secure_url not available
        console.log("✅ Image uploaded successfully! URL:", result.url);
        return result.url;
      } else {
        console.error("❌ No secure_url or url in response:", result);
        throw new Error(result.error?.message || "Upload failed - no URL returned from Cloudinary");
      }
    } catch (error: any) {
      console.error("❌ Upload Error:", error);
      throw new Error(error?.message || "Failed to upload image. Please check your internet connection.");
    }
  };

  const SaveFormData = async (imageUrl: string) => {
    if (!user?.primaryEmailAddress?.emailAddress) {
      throw new Error("User email is required to save product.");
    }

    if (!imageUrl || imageUrl.trim() === '') {
      throw new Error("Image URL is required to save product.");
    }

    const docId = Date.now().toString();
    const productRef = doc(db, "InventoryProduct", docId);

    const productData = {
      ...formData,
      imageUrl: imageUrl, // Store Cloudinary URL in Firestore
      username: user?.fullName || '',
      email: user.primaryEmailAddress.emailAddress,
      userImage: user?.imageUrl || '',
      id: docId,
      createdAt: new Date().toISOString(),
    };

    console.log("Saving product to Firestore with imageUrl:", imageUrl);
    console.log("Product data:", productData);

    try {
      await setDoc(productRef, productData);
      console.log("✅ Product successfully stored in Firestore with ID:", docId);
      console.log("✅ Image URL stored:", imageUrl);
    } catch (error: any) {
      console.error("❌ Error storing product data:", error);
      throw new Error(error?.message || "Failed to store product data in database.");
    }
  };

  const imagePicker = async () => {
    try {
      // Request permission first
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert("Permission Required", "Please grant permission to access your photos.");
        return;
      }

      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaType.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setImage(result.assets[0].uri);
      }
    } catch (error: any) {
      console.error("Image picker error:", error);
      Alert.alert("Error", "Failed to open image picker. Please try again.");
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
          {categoryList.length > 0 ? (
            categoryList.map((category, index) => (
              <Picker.Item key={index} label={category.name} value={category.name} />
            ))
          ) : (
            <Picker.Item label="Tools" value="Tools" />
          )}
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
