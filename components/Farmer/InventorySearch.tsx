import React from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function InventorySearch() {
  const router = useRouter();

  const handleNavigateToExplore = () => {
    router.push('/inventoryexplore');
  };

  return (
    <TouchableOpacity onPress={handleNavigateToExplore} style={styles.searchContainer} activeOpacity={0.8}>
      <Ionicons name="search" size={20} color="#888" style={styles.searchIcon} />
      <TextInput
        style={styles.input}
        editable={false}  
        placeholder="Search for products"
        placeholderTextColor="#A8A8A8"
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 10,
    paddingHorizontal: 12,
    elevation: 3,
    marginVertical: 10,
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: '#DDD',
    height: 50,
  },
  searchIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
});
