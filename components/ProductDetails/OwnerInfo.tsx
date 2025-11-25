import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import React from 'react';
import Colors from '../../constants/Colors';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useUser } from '@clerk/clerk-expo';
import { collection, getDocs, query, setDoc, where, doc } from '@firebase/firestore';
import { db } from '../../config/FirebaseConfig';
import { useRouter } from 'expo-router';

export default function OwnerInfo({ product }) {
  const { user } = useUser();
  const router = useRouter();

  const InitiateChat = async () => {
    if (!user || !product) return;

    const docId1 = `${user?.primaryEmailAddress?.emailAddress}_${product?.email}`;
    const docId2 = `${product?.email}_${user?.primaryEmailAddress?.emailAddress}`;

    const q = query(collection(db, 'Chat'), where('id', 'in', [docId1, docId2]));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      querySnapshot.forEach((docSnapshot) => {
        router.push({
          pathname: '/chat-screen',
          params: { id: docSnapshot.id }, // ✅ Fix: Ensure correct property access
        });
      });
    } else {
      await setDoc(doc(db, 'Chat', docId1), {
        id: docId1,
        users: [
          {
            email: user?.primaryEmailAddress?.emailAddress,
            imageUrl: user?.imageUrl,
            name: user?.fullName,
          },
          {
            email: product?.email,
            imageUrl: product?.userImage,
            name: product?.username,
          },
        ],
        userIds:[user?.primaryEmailAddress?.emailAddress,product?.email]
      });

      router.push({
        pathname: '/chat-screen',
        params: { id: docId1 },
      });
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.userInfo}>
        <Image source={{ uri: product?.userImage }} style={styles.profileImage} />
        <View>
          <Text style={styles.username}>{product?.username}</Text>
          <Text style={styles.ownerText}>Product Owner</Text>
        </View>
      </View>
      <TouchableOpacity onPress={InitiateChat}>
        <Ionicons name="send" size={24} color="blue" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 15,
    padding: 10,
    borderWidth: 1,
    backgroundColor: Colors.WHITE,
    justifyContent: 'space-between',
    borderColor: Colors.PRIMARY,
  },
  userInfo: {
    flexDirection: 'row',
    gap: 20,
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 99,
  },
  username: {
    fontFamily: 'outfits-medium',
    fontSize: 17,
  },
  ownerText: {
    fontFamily: 'outfits',
    color: Colors.GRAY,
  },
});
