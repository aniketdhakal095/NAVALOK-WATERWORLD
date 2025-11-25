import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Image, Button, StyleSheet, Alert, Pressable } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { useUser } from '@clerk/clerk-expo';
import { db } from '../../config/FirebaseConfig';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

// Function to update user in Firestore
async function updateUserInFirestore(userId: string, firstName: string, lastName: string, phone: string) {
  const userRef = doc(db, 'Users', userId);
  try {
    await updateDoc(userRef, { firstName, lastName, phone });
    console.log('✅ User updated in Firestore');
  } catch (error) {
    console.error('❌ Error updating user in Firestore:', error);
    throw new Error('Error updating user profile in Firestore');
  }
}

export default function ProfileEditScreen() {
  const { user, isLoaded } = useUser();
  const router = useRouter();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [phone, setPhone] = useState('');
  const [uploading, setUploading] = useState(false);

  // Fetch user data from Clerk and Firestore when the component loads
  useEffect(() => {
    async function fetchUserData() {
      if (user?.id) {
        // Set user data from Clerk
        setFirstName(user.firstName || '');
        setLastName(user.lastName || '');
        setImageUrl(user.imageUrl || ''); // Use profileImageUrl from Clerk
        
        // Fetch phone from Firestore, as it's not stored in Clerk
        const userRef = doc(db, 'Users', user.id);
        const docSnap = await getDoc(userRef);
        if (docSnap.exists()) {
          const userData = docSnap.data();
          setPhone(userData.phone || ''); // Fetch phone from Firestore
        }
      }
    }

    fetchUserData();
  }, [user]);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      const selectedImage = result.assets[0].uri;
      console.log('🖼 Selected Image URI:', selectedImage);
      setImageUrl(selectedImage);
    }
  };

  const convertImageToBase64 = async (imageUri: string) => {
    try {
      const base64 = await FileSystem.readAsStringAsync(imageUri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      return `data:image/jpeg;base64,${base64}`;
    } catch (error) {
      console.error('❌ Error converting image to Base64:', error);
      return null;
    }
  };

 

const handleSaveChanges = async () => {
  if (!firstName || !lastName || !imageUrl || !phone) {
    Alert.alert('Error', 'Please fill out all required fields.');
    return;
  }

  try {
    if (user?.id) {
      // ✅ Update Clerk details
      const result = await user.update({
        firstName,
        lastName,
      });

      console.log('🚀 Clerk updated:', result);

      // ✅ Update Clerk profile image if changed
      if (imageUrl !== user.imageUrl) {
        setUploading(true);
        const base64Image = await convertImageToBase64(imageUrl);
        if (base64Image) {
          await user.setProfileImage({ file: base64Image });
          console.log('✅ Profile image updated in Clerk!');
        }
      }

      // ✅ Check if Firestore user doc exists
      const userRef = doc(db, 'Users', user.id);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        // 🔄 Update existing Firestore user
        await updateDoc(userRef, {
          firstName,
          lastName,
          phone,
          updatedAt: new Date(),
        });
        console.log('✅ Firestore user updated.');
      } else {
        // 🆕 Create new Firestore user
        await setDoc(userRef, {
          userId: user.id,
          email: user.primaryEmailAddress?.emailAddress || '',
          firstName,
          lastName,
          phone,
          profileImageUrl: user.imageUrl,
          createdAt: new Date(),
        });
        console.log('🆕 Firestore user created.');
      }

      Alert.alert('Success', 'Profile updated successfully!');
      router.push('/profile');
    } else {
      Alert.alert('Error', 'User is not authenticated.');
    }
  } catch (error) {
    console.log('❌ ~ handleSaveChanges ~ error:', JSON.stringify(error));
    Alert.alert('Error', 'There was an issue updating your profile. Please try again.');
  } finally {
    setUploading(false);
  }
};


  const handleGoBack = () => {
    router.back();
  };

  if (!isLoaded) {
    return <Text>Loading...</Text>;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={handleGoBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={20} color="black" />
        </Pressable>
        <Text style={styles.headerText}>Edit Profile</Text>
      </View>
      <View style={styles.form}>
        <TextInput
          style={styles.input}
          value={firstName}
          onChangeText={setFirstName}
          placeholder="First Name"
        />
        <TextInput
          style={styles.input}
          value={lastName}
          onChangeText={setLastName}
          placeholder="Last Name"
        />
        <TextInput
          style={styles.input}
          value={phone}
          onChangeText={setPhone}
          placeholder="Phone"
          keyboardType="phone-pad"
        />
        <Pressable onPress={pickImage}>
          {imageUrl ? (
            <Image source={{ uri: imageUrl }} style={styles.profileImage} />
          ) : (
            <Text>Select Profile Image</Text>
          )}
        </Pressable>
        <Button title={uploading ? 'Uploading...' : 'Save Changes'} onPress={handleSaveChanges} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    marginRight: 10,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  form: {
    marginTop: 20,
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 15,
    paddingHorizontal: 10,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 15,
  },
});
