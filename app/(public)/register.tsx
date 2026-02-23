import { TextInput, View, StyleSheet, Pressable, Text, Alert } from 'react-native';
import { useSignUp } from '@clerk/clerk-expo';
import Spinner from 'react-native-loading-spinner-overlay';
import React, { useState } from 'react';
import { Stack } from 'expo-router';
import Colors from '../../constants/Colors';

const Register = () => {
  const { isLoaded, signUp, setActive } = useSignUp();

  const [emailAddress, setEmailAddress] = useState('');
  const [password, setPassword] = useState('');
  const [pendingVerification, setPendingVerification] = useState(false);
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const onSignUpPress = async () => {
    if (!isLoaded) return;
    setLoading(true);
    try {
      await signUp.create({
        emailAddress,
        password,
      });
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      setPendingVerification(true);
    } catch (err: any) {
      Alert.alert('Sign Up Failed', err?.errors?.[0]?.message || 'Please try again');
    } finally {
      setLoading(false);
    }
  };

  const onPressVerify = async () => {
    if (!isLoaded) return;
    setLoading(true);
    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code,
      });
      await setActive({ session: completeSignUp.createdSessionId });
    } catch (err: any) {
      Alert.alert('Verification Failed', err?.errors?.[0]?.message || 'Please try again');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.page}>
      <Stack.Screen options={{ headerBackVisible: !pendingVerification }} />
      <View style={styles.bgTopBlob} />
      <View style={styles.bgBottomBlob} />
      <Spinner visible={loading} />

      <View style={styles.card}>
        <Text style={styles.kicker}>NEW ACCOUNT</Text>
        <Text style={styles.title}>{pendingVerification ? 'Verify Email' : 'Create Account'}</Text>
        <Text style={styles.subtitle}>
          {pendingVerification ? 'Enter the verification code sent to your email' : 'Join Navalok WaterWorld today'}
        </Text>

        {!pendingVerification && (
          <>
            <TextInput
              autoCapitalize="none"
              placeholder="youremail@example.com"
              value={emailAddress}
              onChangeText={setEmailAddress}
              style={styles.inputField}
              placeholderTextColor="#94a3b8"
            />
            <TextInput
              placeholder="password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              style={styles.inputField}
              placeholderTextColor="#94a3b8"
            />

            <Pressable onPress={onSignUpPress} style={styles.primaryBtn}>
              <Text style={styles.primaryBtnText}>Sign Up</Text>
            </Pressable>
          </>
        )}

        {pendingVerification && (
          <>
            <TextInput
              value={code}
              placeholder="Verification code"
              style={styles.inputField}
              onChangeText={setCode}
              placeholderTextColor="#94a3b8"
            />
            <Pressable onPress={onPressVerify} style={styles.primaryBtn}>
              <Text style={styles.primaryBtnText}>Verify Email</Text>
            </Pressable>
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  page: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#f3f7fb',
    padding: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#0f172a',
    shadowOpacity: 0.1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  kicker: {
    fontFamily: 'outfits-medium',
    color: Colors.PRIMARY,
    fontSize: 12,
    letterSpacing: 0.8,
  },
  title: {
    marginTop: 6,
    fontFamily: 'outfits-extrabold',
    fontSize: 30,
    color: '#0f172a',
  },
  subtitle: {
    marginTop: 2,
    marginBottom: 12,
    fontFamily: 'outfits',
    color: '#64748b',
    fontSize: 14,
  },
  inputField: {
    marginVertical: 6,
    height: 52,
    borderWidth: 1,
    borderColor: '#d7e1ed',
    borderRadius: 12,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
    fontFamily: 'outfits',
    color: '#0f172a',
  },
  primaryBtn: {
    marginTop: 10,
    backgroundColor: Colors.PRIMARY,
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryBtnText: {
    color: '#fff',
    fontFamily: 'outfits-medium',
    fontSize: 17,
  },
  bgTopBlob: {
    position: 'absolute',
    top: -120,
    right: -70,
    width: 260,
    height: 260,
    borderRadius: 140,
    backgroundColor: 'rgba(53, 109, 231, 0.18)',
  },
  bgBottomBlob: {
    position: 'absolute',
    bottom: -110,
    left: -80,
    width: 260,
    height: 260,
    borderRadius: 140,
    backgroundColor: 'rgba(22, 167, 111, 0.12)',
  },
});

export default Register;
