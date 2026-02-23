import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Image, StyleSheet, Alert, Pressable, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { useUser } from '@clerk/clerk-expo';
import { db } from '../../config/FirebaseConfig';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../../constants/Colors';

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
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      <View style={styles.bgTopBlob} />
      <View style={styles.bgBottomBlob} />
      <View style={styles.headerRow}>
        <Pressable onPress={handleGoBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={20} color="#0f172a" />
        </Pressable>
        <Text style={styles.headerText}>Edit Profile</Text>
      </View>

      <View style={styles.formCard}>
        <Text style={styles.subTitle}>Update your account information</Text>
        <Pressable onPress={pickImage} style={styles.avatarWrap}>
          {imageUrl ? (
            <Image source={{ uri: imageUrl }} style={styles.profileImage} />
          ) : (
            <View style={styles.placeholderAvatar}>
              <Ionicons name="person-outline" size={34} color="#64748b" />
            </View>
          )}
          <Text style={styles.editPhotoText}>Tap to change photo</Text>
        </Pressable>

        <TextInput
          style={styles.input}
          value={firstName}
          onChangeText={setFirstName}
          placeholder="First Name"
          placeholderTextColor="#94a3b8"
        />
        <TextInput
          style={styles.input}
          value={lastName}
          onChangeText={setLastName}
          placeholder="Last Name"
          placeholderTextColor="#94a3b8"
        />
        <TextInput
          style={styles.input}
          value={phone}
          onChangeText={setPhone}
          placeholder="Phone"
          keyboardType="phone-pad"
          placeholderTextColor="#94a3b8"
        />

        <Pressable style={styles.saveBtn} onPress={handleSaveChanges}>
          <Text style={styles.saveBtnText}>
            {uploading ? 'Uploading...' : 'Save Changes'}
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f7fb',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 24,
  },
  bgTopBlob: {
    position: 'absolute',
    top: -120,
    right: -70,
    width: 240,
    height: 240,
    borderRadius: 130,
    backgroundColor: 'rgba(53, 109, 231, 0.18)',
  },
  bgBottomBlob: {
    position: 'absolute',
    bottom: -130,
    left: -80,
    width: 250,
    height: 250,
    borderRadius: 130,
    backgroundColor: 'rgba(22, 167, 111, 0.12)',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  backButton: {
    padding: 10,
    borderRadius: 999,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  headerText: {
    fontFamily: 'outfits-extrabold',
    fontSize: 24,
    color: '#0f172a',
    marginLeft: 10,
  },
  formCard: {
    marginTop: 6,
    padding: 18,
    borderRadius: 18,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#0f172a',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  subTitle: {
    fontFamily: 'outfits',
    fontSize: 14,
    color: '#64748b',
    marginBottom: 12,
  },
  avatarWrap: {
    alignItems: 'center',
    marginBottom: 14,
  },
  placeholderAvatar: {
    width: 104,
    height: 104,
    borderRadius: 52,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#eef2f7',
    borderWidth: 2,
    borderColor: '#dbe3ee',
  },
  input: {
    height: 52,
    borderColor: '#d7e1ed',
    borderWidth: 1,
    borderRadius: 12,
    marginBottom: 12,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
    fontFamily: 'outfits',
    color: '#0f172a',
  },
  profileImage: {
    width: 104,
    height: 104,
    borderRadius: 52,
    borderWidth: 3,
    borderColor: '#dbeafe',
  },
  editPhotoText: {
    marginTop: 7,
    fontFamily: 'outfits-medium',
    color: Colors.PRIMARY,
    fontSize: 13,
  },
  saveBtn: {
    marginTop: 4,
    backgroundColor: Colors.PRIMARY,
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
  },
  saveBtnText: {
    color: '#fff',
    fontFamily: 'outfits-medium',
    fontSize: 17,
  },
});
