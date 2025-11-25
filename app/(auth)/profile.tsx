import React, { useEffect, useState } from 'react';
import { View, Text, Image, FlatList, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useUser } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { db } from '../../config/FirebaseConfig'; // Firebase config
import { doc, getDoc } from 'firebase/firestore'; // Firestore SDK
import Colors from './../../constants/Colors';


export default function Profile() {
  const { user } = useUser(); // Get authenticated user from Clerk
  const router = useRouter(); // For navigation
  const [phone, setPhone] = useState(''); // To store the phone number from Firestore

  // Fetch the phone number from Firestore using the Clerk user ID
  useEffect(() => {
    if (user) {
      const fetchPhoneNumber = async () => {
        try {
          const userRef = doc(db, 'Users', user.id); // Get the Firestore document for the user
          const docSnap = await getDoc(userRef);
          
          if (docSnap.exists()) {
            // Set phone number if it exists in Firestore
            const userData = docSnap.data();
            setPhone(userData.phone || 'No phone number available');
          } else {
            setPhone('No phone number available');
          }
        } catch (error) {
          console.error('Error fetching phone number:', error);
        }
      };
      
      fetchPhoneNumber(); // Fetch the phone number on component mount
    }
  }, [user]);

  const Menu = [
    {
      id: 1,
      name: 'My Orders',
      icon: 'add-circle-outline',
      path: '/see-my-order',
    },
    {
      id: 2,
      name: 'Sell Produce Product',
      icon: 'add-circle-outline',
      path: '/farm-sell-product',
    },
    {
      id: 3,
      name: 'Sell Asset Product',
      icon: 'add-circle-outline',
      path: '/inventory-sell-product',
    },
    
    {
      id: 4,
      name: 'Favorites',
      icon: 'heart-outline',
      path: '/(auth)/favorite',
    },
    {
      id: 5,
      name: 'Inbox',
      icon: 'chatbubble-outline',
      path: '/(auth)/inbox',
    },
    {
      id: 6,
      name: 'Farmer Console',
      icon: 'chatbubble-outline',
      path: '/farmer',
    },
  ];

  // Navigate to Profile Edit Page
  const handleEditProfile = () => {
    router.push('/profile-edit'); // Navigate to the Profile Edit Page
  };

  // Handle Menu Item Click
  const handleMenuItemPress = (path: string) => {
    router.push(path); // Navigate to the selected path
  };

  return (
    <View style={styles.container}>
      <View style={styles.profileHeader}>
        <View style={styles.profileImageContainer}>
          <Image
            source={{ uri: user?.imageUrl }}
            style={styles.profileImage}
          />
          {/* Edit button */}
          <TouchableOpacity
            onPress={handleEditProfile}
            style={styles.editButton}
          >
            <Ionicons name="pencil-outline" size={20} color="white" />
          </TouchableOpacity>
        </View>

        <Text style={styles.profileName}>{user?.fullName}</Text>
        <Text style={styles.profileEmail}>
          {user?.primaryEmailAddress?.emailAddress}
        </Text>

        {/* Display the phone number */}
        <Text style={styles.profilePhone}>
          {phone ? `Phone: ${phone}` : 'Phone number not available'}
        </Text>
      </View>

      <FlatList
        data={Menu}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={true}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => handleMenuItemPress(item.path)} // Navigate when item is pressed
            style={styles.menuItem}
          >
            <Ionicons
              name={item.icon as any}
              size={30}
              color="green"
              style={styles.menuItemIcon}
            />
            <Text style={styles.menuItemText}>{item.name}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 30,
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: 10,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 10,
  },
  editButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: Colors.BUTTON_COLOR,
    borderRadius: 20,
    padding: 5,
  },
  profileName: {
    fontFamily: 'outfits-bold',
    fontSize: 20,
    marginTop: 6,
    color: '#333',
  },
  profileEmail: {
    fontFamily: 'outfits',
    fontSize: 16,
    color: Colors.GRAY,
  },
  profilePhone: {
    fontFamily: 'outfits',
    fontSize: 16,
    color: Colors.GRAY,
    marginTop: 10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  menuItemIcon: {
    padding: 10,
    backgroundColor: Colors.BUTTON_COLOR,
    borderRadius: 10,
  },
  menuItemText: {
    fontFamily: 'outfits',
    fontSize: 20,
    marginLeft: 15,
    color: '#333',
  },
});