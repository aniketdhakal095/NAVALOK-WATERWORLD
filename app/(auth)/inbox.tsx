import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, Image, TouchableOpacity } from 'react-native';
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
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontFamily: 'outfits-medium', fontSize: 30, marginBottom: 20 }}>Inbox</Text>

      {loading ? (
        <ActivityIndicator size="large" color="blue" />
      ) : (
        <FlatList
          data={userList}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                padding: 10,
                borderBottomWidth: 1,
                borderColor: '#ddd',
              }}
              onPress={() => handleUserPress(item.id)} // Navigate to chat screen
            >
              <Image
                source={{ uri: item.imageUrl || 'https://placehold.it/100x100' }} // Default image if none exists
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  marginRight: 10,
                }}
              />
              <Text style={{ fontSize: 16, fontWeight: 'bold' }}>{item.name}</Text>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}
