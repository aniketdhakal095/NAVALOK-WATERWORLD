import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  Alert,
  Pressable,
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
  const [capacity, setCapacity] = useState('');
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
    data.append('file', { uri: image, type: 'image/jpeg', name: 'product.jpg' } as any);
    data.append('upload_preset', '_ProductImage');

    const res = await fetch('https://api.cloudinary.com/v1_1/dgydap1ot/image/upload', {
      method: 'POST',
      body: data,
    });

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
        capacity: Number(capacity),
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
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.bgTopBlob} />
      <View style={styles.bgBottomBlob} />

      <View style={styles.header}>
        <Pressable style={styles.backRound} onPress={() => router.back()}>
          <Text style={styles.backText}>?</Text>
        </Pressable>
        <Text style={styles.title}>Sell Fish / Plant</Text>
      </View>

      <View style={styles.card}>
        <TouchableOpacity style={styles.imageBox} onPress={pickImage}>
          {image ? (
            <Image source={{ uri: image }} style={styles.image} />
          ) : (
            <Text style={{ color: '#64748b', fontFamily: 'outfits-medium' }}>Upload Image</Text>
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

        <Input label="Capacity (Liters)" value={capacity} onChangeText={setCapacity} keyboardType="numeric" />

        <Input label="Quantity" value={quantity} onChangeText={setQuantity} keyboardType="numeric" />

        <Label title="Measure Unit" />
        <Picker selectedValue={measureUnit} onValueChange={setMeasureUnit}>
          <Picker.Item label="pcs" value="pcs" />
          <Picker.Item label="pair" value="pair" />
          <Picker.Item label="collection" value="collection" />
        </Picker>

        <Input label="Price (Rs.)" value={price} onChangeText={setPrice} keyboardType="numeric" />

        <Label title="About" />
        <TextInput style={styles.textArea} multiline value={about} onChangeText={setAbout} />

        <TouchableOpacity style={styles.btn} onPress={onSubmit} disabled={loading}>
          <Text style={styles.btnText}>{loading ? 'Uploading...' : 'Submit'}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const Label = ({ title }: any) => <Text style={styles.label}>{title}</Text>;

const Input = ({ label, ...props }: any) => (
  <>
    <Label title={label} />
    <TextInput style={styles.input} {...props} />
  </>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#eef8f5',
  },
  content: {
    padding: 16,
    paddingBottom: 26,
  },
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
    marginBottom: 10,
  },
  backRound: {
    width: 40,
    height: 40,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#dbeee8',
  },
  backText: {
    color: '#0f172a',
    fontFamily: 'outfits-medium',
    fontSize: 18,
  },
  title: {
    marginLeft: 10,
    fontSize: 24,
    color: '#0f172a',
    fontFamily: 'outfits-extrabold',
  },
  card: {
    backgroundColor: '#fff',
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
  imageBox: {
    height: 160,
    backgroundColor: '#f8fafc',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#d7ebe5',
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
    color: '#14532d',
  },
  input: {
    borderWidth: 1,
    borderColor: '#d7ebe5',
    borderRadius: 11,
    padding: 11,
    marginTop: 4,
    backgroundColor: '#fff',
    color: '#0f172a',
  },
  textArea: {
    height: 100,
    borderWidth: 1,
    borderColor: '#d7ebe5',
    borderRadius: 11,
    padding: 11,
    marginTop: 4,
    backgroundColor: '#fff',
    color: '#0f172a',
    textAlignVertical: 'top',
  },
  btn: {
    backgroundColor: '#15803d',
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
