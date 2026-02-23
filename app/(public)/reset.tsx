import { View, StyleSheet, TextInput, Pressable, Text, Alert } from 'react-native';
import React, { useState } from 'react';
import { Stack } from 'expo-router';
import { useSignIn } from '@clerk/clerk-expo';
import Colors from '../../constants/Colors';

const PwReset = () => {
  const [emailAddress, setEmailAddress] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [successfulCreation, setSuccessfulCreation] = useState(false);
  const { signIn, setActive } = useSignIn() || {};

  const onRequestReset = async () => {
    if (!signIn) return;
    try {
      await signIn.create({
        strategy: 'reset_password_email_code',
        identifier: emailAddress,
      });
      setSuccessfulCreation(true);
    } catch (err: any) {
      Alert.alert('Reset Failed', err?.errors?.[0]?.message || 'Please try again');
    }
  };

  const onReset = async () => {
    if (!signIn) return;
    try {
      const result = await signIn.attemptFirstFactor({
        strategy: 'reset_password_email_code',
        code,
        password,
      });
      Alert.alert('Success', 'Password reset successfully');
      await setActive({ session: result.createdSessionId });
    } catch (err: any) {
      Alert.alert('Reset Failed', err?.errors?.[0]?.message || 'Please try again');
    }
  };

  return (
    <View style={styles.page}>
      <Stack.Screen options={{ headerBackVisible: !successfulCreation }} />
      <View style={styles.bgTopBlob} />
      <View style={styles.bgBottomBlob} />

      <View style={styles.card}>
        <Text style={styles.kicker}>ACCOUNT SECURITY</Text>
        <Text style={styles.title}>{successfulCreation ? 'Set New Password' : 'Reset Password'}</Text>
        <Text style={styles.subtitle}>
          {successfulCreation ? 'Enter the code and your new password' : 'We will send a reset code to your email'}
        </Text>

        {!successfulCreation && (
          <>
            <TextInput
              autoCapitalize="none"
              placeholder="youremail@example.com"
              value={emailAddress}
              onChangeText={setEmailAddress}
              style={styles.inputField}
              placeholderTextColor="#94a3b8"
            />

            <Pressable onPress={onRequestReset} style={styles.primaryBtn}>
              <Text style={styles.primaryBtnText}>Send Reset Email</Text>
            </Pressable>
          </>
        )}

        {successfulCreation && (
          <>
            <TextInput
              value={code}
              placeholder="Verification code"
              style={styles.inputField}
              onChangeText={setCode}
              placeholderTextColor="#94a3b8"
            />
            <TextInput
              placeholder="New password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              style={styles.inputField}
              placeholderTextColor="#94a3b8"
            />
            <Pressable onPress={onReset} style={styles.primaryBtn}>
              <Text style={styles.primaryBtnText}>Set New Password</Text>
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

export default PwReset;
