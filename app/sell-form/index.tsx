import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  Alert,
} from 'react-native';
import React, { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../../config/FirebaseConfig';
import { useUser } from '@clerk/clerk-react';
import Colors from '../../constants/Colors';
import { Picker } from '@react-native-picker/picker';
import { useRouter } from 'expo-router';

export default function SellForm() {
  const router = useRouter();
  const { user } = useUser();

  const [image, setImage] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [type, setType] = useState<'fish' | 'plant'>('fish');
  const [waterCategory, setWaterCategory] = useState<'salt' | 'fresh'>('salt');
  const [capacity, setCapacity] = useState(''); // ✅ ADDED
  const [quantity, setQuantity] = useState('');
  const [measureUnit, setMeasureUnit] = useState('pcs');
  const [price, setPrice] = useState('');
  const [about, setAbout] = useState('');
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const uploadToCloudinary = async () => {
    if (!image) return null;

    const data = new FormData();
    data.append(
      'file',
      { uri: image, type: 'image/jpeg', name: 'product.jpg' } as any
    );
    data.append('upload_preset', '_ProductImage');

    const res = await fetch(
      'https://api.cloudinary.com/v1_1/dgydap1ot/image/upload',
      {
        method: 'POST',
        body: data,
      }
    );

    const result = await res.json();
    return result.secure_url;
  };

  const onSubmit = async () => {
    if (!name || !image || !price || !capacity) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }

    try {
      setLoading(true);

      const imageUrl = await uploadToCloudinary();

      await addDoc(collection(db, 'Fish_Plant'), {
        name,
        type,
        waterCategory,
        capacity: Number(capacity), // ✅ STORED CORRECTLY
        quantity,
        measureUnit,
        price: Number(price),
        about,
        imageUrl,
        username: user?.fullName,
        email: user?.primaryEmailAddress?.emailAddress,
        userImage: user?.imageUrl || '',
        createdAt: serverTimestamp(),
      });

      Alert.alert('Success', 'Product uploaded successfully');
      router.back();
    } catch (error) {
      console.log(error);
      Alert.alert('Error', 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* BACK BUTTON */}
      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Sell Fish / Plant</Text>

      {/* IMAGE PICKER */}
      <TouchableOpacity style={styles.imageBox} onPress={pickImage}>
        {image ? (
          <Image source={{ uri: image }} style={styles.image} />
        ) : (
          <Text style={{ color: Colors.GRAY }}>Upload Image</Text>
        )}
      </TouchableOpacity>

      <Input label="Name" value={name} onChangeText={setName} />

      <Label title="Type" />
      <Picker selectedValue={type} onValueChange={setType}>
        <Picker.Item label="Fish" value="fish" />
        <Picker.Item label="Plant" value="plant" />
      </Picker>

      <Label title="Water Category" />
      <Picker selectedValue={waterCategory} onValueChange={setWaterCategory}>
        <Picker.Item label="Salt Water" value="salt" />
        <Picker.Item label="Fresh Water" value="fresh" />
      </Picker>

      {/* ✅ CAPACITY FIELD */}
      <Input
        label="Capacity (Liters)"
        value={capacity}
        onChangeText={setCapacity}
        keyboardType="numeric"
      />

      <Input
        label="Quantity"
        value={quantity}
        onChangeText={setQuantity}
        keyboardType="numeric"
      />

      <Label title="Measure Unit" />
      <Picker selectedValue={measureUnit} onValueChange={setMeasureUnit}>
        <Picker.Item label="pcs" value="pcs" />
        <Picker.Item label="pair" value="pair" />
        <Picker.Item label="collection" value="collection" />
      </Picker>

      <Input
        label="Price (Rs.)"
        value={price}
        onChangeText={setPrice}
        keyboardType="numeric"
      />

      <Label title="About" />
      <TextInput
        style={styles.textArea}
        multiline
        value={about}
        onChangeText={setAbout}
      />

      <TouchableOpacity style={styles.btn} onPress={onSubmit} disabled={loading}>
        <Text style={styles.btnText}>
          {loading ? 'Uploading...' : 'Submit'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const Label = ({ title }: any) => (
  <Text style={styles.label}>{title}</Text>
);

const Input = ({ label, ...props }: any) => (
  <>
    <Label title={label} />
    <TextInput style={styles.input} {...props} />
  </>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: Colors.WHITE,
  },
  backBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginBottom: 12,
    backgroundColor: Colors.PRIMARY,
    borderRadius: 12,
    width: 70,
  },
  backText: {
    color: Colors.WHITE,
    fontFamily: 'outfits-medium',
  },
  title: {
    fontSize: 22,
    fontFamily: 'outfits-bold',
    marginBottom: 12,
  },
  imageBox: {
    height: 160,
    backgroundColor: '#f2f2f2',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  label: {
    fontFamily: 'outfits-medium',
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 10,
    marginTop: 4,
  },
  textArea: {
    height: 100,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 10,
    marginTop: 4,
  },
  btn: {
    backgroundColor: Colors.PRIMARY,
    padding: 14,
    borderRadius: 12,
    marginVertical: 20,
  },
  btnText: {
    color: Colors.WHITE,
    fontFamily: 'outfits-bold',
    textAlign: 'center',
  },
});
