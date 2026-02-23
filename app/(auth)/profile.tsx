import React, { useEffect, useState } from 'react';
import { View, Text, Image, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
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
      name: 'Fishs and Plants',
      icon: 'fish-outline',
      path: '/FishandPlant',
    },
    {
      id: 2,
      name: 'My Orders',
      icon: 'receipt-outline',
      path: '/see-my-order',
    },
    {
      id: 3,
      name: 'Sell Aquarium Product',
      icon: 'basket-outline',
      path: '/farm-sell-product',
    },
    {
      id: 4,
      name: 'Sell Inventory Product',
      icon: 'cube-outline',
      path: '/inventory-sell-product',
    },
    {
      id: 5,
      name: 'Console',
      icon: 'chatbubble-outline',
      path: '/console',
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
      <View style={styles.bgTopBlob} />
      <View style={styles.bgBottomBlob} />
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
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.menuList}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => handleMenuItemPress(item.path)} // Navigate when item is pressed
            style={styles.menuItem}
            activeOpacity={0.9}
          >
            <Ionicons
              name={item.icon as any}
              size={22}
              color={Colors.PRIMARY}
              style={styles.menuItemIcon}
            />
            <Text style={styles.menuItemText}>{item.name}</Text>
            <Ionicons name="chevron-forward" size={18} color="#94a3b8" />
          </TouchableOpacity>
        )}
      />
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
  profileHeader: {
    alignItems: 'center',
    marginBottom: 18,
    borderRadius: 20,
    backgroundColor: '#fff',
    paddingVertical: 20,
    paddingHorizontal: 16,
    shadowColor: '#0f172a',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: 8,
  },
  profileImage: {
    width: 94,
    height: 94,
    borderRadius: 47,
    borderWidth: 3,
    borderColor: '#dbeafe',
  },
  editButton: {
    position: 'absolute',
    bottom: 2,
    right: 0,
    backgroundColor: Colors.PRIMARY,
    borderRadius: 16,
    padding: 6,
  },
  profileName: {
    fontFamily: 'outfits-extrabold',
    fontSize: 24,
    marginTop: 6,
    color: '#0f172a',
  },
  profileEmail: {
    fontFamily: 'outfits-medium',
    fontSize: 14,
    color: '#64748b',
  },
  profilePhone: {
    fontFamily: 'outfits',
    fontSize: 14,
    color: '#334155',
    marginTop: 8,
    backgroundColor: '#eef6ff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  menuList: {
    paddingBottom: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 12,
    marginBottom: 10,
    borderRadius: 14,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#0f172a',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  menuItemIcon: {
    padding: 9,
    backgroundColor: '#e8f1fb',
    borderRadius: 12,
  },
  menuItemText: {
    fontFamily: 'outfits-medium',
    fontSize: 16,
    marginLeft: 12,
    color: '#0f172a',
    flex: 1,
  },
});
