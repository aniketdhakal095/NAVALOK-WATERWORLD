import { Image, View, Text, StyleSheet } from 'react-native';
import React from 'react';
import { useUser } from '@clerk/clerk-expo';

const Header = () => {
  const { user } = useUser();
  return (
    <View style={styles.container}>
      <View style={styles.textWrap}>
        <Text style={styles.greeting}>Welcome back,</Text>
        <Text numberOfLines={1} style={styles.name}>
          {user?.fullName || 'Guest'}
        </Text>
        <Text style={styles.subtitle}>Discover fresh picks from local sellers</Text>
      </View>

      <View style={styles.avatarRing}>
        <Image source={{ uri: user?.imageUrl }} style={styles.avatar} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 14,
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#0a74da',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  textWrap: {
    flex: 1,
    paddingRight: 12,
  },
  greeting: {
    fontFamily: 'outfits',
    fontSize: 14,
    color: '#6b7280',
  },
  name: {
    fontFamily: 'outfits-medium',
    fontSize: 24,
    color: '#0f172a',
  },
  subtitle: {
    marginTop: 2,
    fontFamily: 'outfits',
    fontSize: 13,
    color: '#334155',
  },
  avatarRing: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#e8f1fb',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#cfe4f9',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
});

export default Header;
