import { Image, View, Text, Pressable, StyleSheet } from 'react-native';
import React from 'react';
import Colors from '../../constants/Colors';
import { Link } from 'expo-router';

const Welcome = () => {
  return (
    <View style={styles.page}>
      <View style={styles.bgTopBlob} />
      <View style={styles.bgBottomBlob} />

      <Image
        source={require('../../assets/images/wel.png')}
        style={styles.heroImage}
      />

      <View style={styles.contentCard}>
        <Text style={styles.badge}>AQUATIC MARKETPLACE</Text>
        <Text style={styles.title}>Welcome to</Text>
        <Text style={styles.brand}>Navalok WaterWorld</Text>
        <Text style={styles.subtitle}>
          Buy, sell and discover trusted fish, plants, and waterlife supplies in one place.
        </Text>

        <Link href={'/login'} asChild>
          <Pressable style={styles.primaryBtn}>
            <Text style={styles.primaryBtnText}>Get Started</Text>
          </Pressable>
        </Link>

        <Link href={'/register'} asChild>
          <Pressable style={styles.secondaryBtn}>
            <Text style={styles.secondaryBtnText}>Create Account</Text>
          </Pressable>
        </Link>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: '#f3f7fb',
    paddingHorizontal: 16,
    paddingTop: 30,
  },
  bgTopBlob: {
    position: 'absolute',
    top: -130,
    right: -60,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: 'rgba(53, 109, 231, 0.15)',
  },
  bgBottomBlob: {
    position: 'absolute',
    bottom: -120,
    left: -80,
    width: 260,
    height: 260,
    borderRadius: 140,
    backgroundColor: 'rgba(22, 167, 111, 0.12)',
  },
  heroImage: {
    width: '100%',
    height: 350,
    borderRadius: 22,
    marginTop: 12,
  },
  contentCard: {
    marginTop: -26,
    backgroundColor: '#ffffff',
    borderRadius: 22,
    paddingHorizontal: 18,
    paddingVertical: 20,
    shadowColor: '#0f172a',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: '#e8f1fb',
    color: Colors.PRIMARY,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    fontFamily: 'outfits-medium',
    fontSize: 11,
    letterSpacing: 0.5,
  },
  title: {
    marginTop: 10,
    fontFamily: 'outfits-medium',
    fontSize: 28,
    color: '#0f172a',
  },
  brand: {
    fontFamily: 'outfits-extrabold',
    fontSize: 30,
    color: Colors.PRIMARY,
    lineHeight: 34,
  },
  subtitle: {
    marginTop: 8,
    fontFamily: 'outfits',
    fontSize: 14,
    color: '#475569',
    lineHeight: 20,
  },
  primaryBtn: {
    marginTop: 18,
    backgroundColor: Colors.PRIMARY,
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
  },
  primaryBtnText: {
    fontFamily: 'outfits-medium',
    fontSize: 18,
    color: Colors.WHITE,
  },
  secondaryBtn: {
    marginTop: 10,
    borderWidth: 1.5,
    borderColor: '#cfd9e6',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#f8fbff',
  },
  secondaryBtnText: {
    fontFamily: 'outfits-medium',
    fontSize: 16,
    color: '#1e293b',
  },
});

export default Welcome;
