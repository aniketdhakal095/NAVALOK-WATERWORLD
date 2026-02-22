import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useUser } from '@clerk/clerk-expo';
import {
  collection,
  getDocs,
  query,
  setDoc,
  where,
  doc,
} from 'firebase/firestore';
import { db } from '../../config/FirebaseConfig';
import { useRouter } from 'expo-router';
import Colors from '../../constants/Colors';

type Props = {
  product: any;
};

export default function OwnerInfo({ product }: Props) {
  const { user } = useUser();
  const router = useRouter();

  // ✅ Safe fallback values
  const ownerEmail: string = product?.email ?? '';
  const ownerName: string = product?.username ?? 'Seller';
  const ownerImage: string =
    product?.userImage ??
    'https://cdn-icons-png.flaticon.com/512/149/149071.png';

  const InitiateChat = async () => {
    if (!user || !ownerEmail) return;

    const currentUserEmail = user.primaryEmailAddress?.emailAddress;

    if (!currentUserEmail) return;

    const docId = `${currentUserEmail}_${ownerEmail}`;

    try {
      // 🔎 Check if chat already exists
      const q = query(
        collection(db, 'Chat'),
        where('userIds', 'array-contains', currentUserEmail)
      );

      const querySnapshot = await getDocs(q);

      let existingChatId: string | null = null;

      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        if (data.userIds?.includes(ownerEmail)) {
          existingChatId = docSnap.id;
        }
      });

      if (existingChatId) {
        router.push({
          pathname: '/chat-screen',
          params: { id: existingChatId },
        });
      } else {
        // 🆕 Create new chat
        await setDoc(doc(db, 'Chat', docId), {
          id: docId,
          users: [
            {
              email: currentUserEmail,
              imageUrl: user.imageUrl,
              name: user.fullName,
            },
            {
              email: ownerEmail,
              imageUrl: ownerImage,
              name: ownerName,
            },
          ],
          userIds: [currentUserEmail, ownerEmail],
          createdAt: new Date(),
        });

        router.push({
          pathname: '/chat-screen',
          params: { id: docId },
        });
      }
    } catch (error) {
      console.log('Chat error:', error);
    }
  };

  // ❌ If no owner email → don't render component
  if (!ownerEmail) return null;

  return (
    <View style={styles.container}>
      <View style={styles.userInfo}>
        <Image source={{ uri: ownerImage }} style={styles.profileImage} />

        <View>
          <Text style={styles.username}>{ownerName}</Text>
          <Text style={styles.ownerText}>Product Owner</Text>
        </View>
      </View>

      <TouchableOpacity onPress={InitiateChat}>
        <Ionicons name="send" size={24} color={Colors.PRIMARY} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 15,
    padding: 12,
    borderWidth: 1,
    backgroundColor: Colors.WHITE,
    justifyContent: 'space-between',
    borderColor: Colors.PRIMARY,
    marginTop: 10,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 50,
    marginRight: 15,
  },
  username: {
    fontFamily: 'outfits-medium',
    fontSize: 17,
  },
  ownerText: {
    fontFamily: 'outfits',
    color: Colors.GRAY,
    fontSize: 13,
  },
});