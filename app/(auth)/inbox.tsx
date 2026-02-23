import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { useUser } from '@clerk/clerk-expo';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../config/FirebaseConfig'; // Ensure this path is correct
import { useRouter } from 'expo-router'; // Use useRouter from expo-router

export default function Inbox() {
  const { user } = useUser(); // Get the current logged-in user
  const [userList, setUserList] = useState<{ id: string; name: string; email: string; imageUrl: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter(); // Initialize the router

  useEffect(() => {
    if (user) {
      fetchUserList(); // Fetch user list when the user is logged in
    }
  }, [user]);

  // Fetch user list from Firestore
  const fetchUserList = async () => {
    setLoading(true);

    try {
      const q = query(
        collection(db, 'Chat'),
        where('userIds', 'array-contains', user?.primaryEmailAddress?.emailAddress)
      );
      const querySnapshot = await getDocs(q);

      console.log("Fetched Chat data:", querySnapshot.docs);

      const fetchedUsers = await Promise.all(
        querySnapshot.docs.map(async (doc) => {
          const data = doc.data();
          console.log("Chat Data:", data);

          // Extract the users array
          const usersData = data.users;

          // Find the current user's index in the array
          const currentUserIndex = usersData.findIndex((userItem: { id: string }) => userItem.id === user?.primaryEmailAddress?.emailAddress);

          // Ensure the other user exists
          const otherUserIndex = currentUserIndex === 0 ? 1 : 0;
          const otherUser = usersData[otherUserIndex];

          if (!otherUser) return null; // Ensure there's another user

          return {
            id: doc.id,
            name: otherUser.name || 'Unknown User',
            email: otherUser.id || '',
            imageUrl: otherUser.imageUrl || '', // Use imageUrl from Firestore
          };
        })
      );

      console.log("Fetched Users List:", fetchedUsers);

      const validUsers = fetchedUsers.filter((user) => user !== null) as { id: string; name: string; email: string; imageUrl: string }[];
      setUserList(validUsers);
    } catch (error) {
      console.error('Error fetching user list:', error);
    } finally {
      setLoading(false); // Stop loading once data is fetched
    }
  };

  // Navigate to the chat screen when a user is clicked
  const handleUserPress = (userId: string) => {
    router.push(`/chat-screen?id=${userId}`); // Navigate to the chat screen
  };

  return (
    <View style={styles.container}>
      <View style={styles.bgTopBlob} />
      <View style={styles.bgBottomBlob} />
      <Text style={styles.heading}>Inbox</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#0a74da" />
      ) : (
        <FlatList
          data={userList}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={<Text style={styles.emptyText}>No conversations yet.</Text>}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.chatRow}
              onPress={() => handleUserPress(item.id)} // Navigate to chat screen
              activeOpacity={0.9}
            >
              <Image
                source={{ uri: item.imageUrl || 'https://placehold.it/100x100' }} // Default image if none exists
                style={styles.avatar}
              />
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.email} numberOfLines={1}>{item.email}</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 20,
    backgroundColor: '#f3f7fb',
  },
  heading: {
    fontFamily: 'outfits-extrabold',
    fontSize: 30,
    marginBottom: 14,
    color: '#0f172a',
  },
  listContent: {
    paddingBottom: 24,
  },
  chatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 14,
    marginBottom: 10,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#0f172a',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    marginRight: 10,
  },
  name: {
    fontFamily: 'outfits-medium',
    fontSize: 16,
    color: '#0f172a',
  },
  email: {
    marginTop: 2,
    fontFamily: 'outfits',
    fontSize: 12,
    color: '#64748b',
  },
  emptyText: {
    marginTop: 40,
    textAlign: 'center',
    color: '#64748b',
    fontFamily: 'outfits-medium',
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
    bottom: -140,
    left: -90,
    width: 260,
    height: 260,
    borderRadius: 140,
    backgroundColor: 'rgba(22, 167, 111, 0.12)',
  },
});
