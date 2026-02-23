import { useSignIn, useSession, useOAuth } from '@clerk/clerk-expo';
import { Link, useRouter } from 'expo-router';
import React, { useState, useEffect } from 'react';
import Colors from '../../constants/Colors';
import { View, StyleSheet, TextInput, Pressable, Text, Alert } from 'react-native';
import Spinner from 'react-native-loading-spinner-overlay';

const Login = () => {
  const { signIn, setActive, isLoaded } = useSignIn();
  const { startOAuthFlow } = useOAuth({ strategy: 'oauth_google' });
  const { session } = useSession();
  const router = useRouter();
  const [emailAddress, setEmailAddress] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (session) {
      router.push('/home');
    }
  }, [session, router]);

  const onSignInPress = async () => {
    if (!isLoaded || !signIn) return;
    setLoading(true);
    try {
      const completeSignIn = await signIn.create({
        identifier: emailAddress,
        password,
      });
      if (setActive) {
        await setActive({ session: completeSignIn.createdSessionId });
        router.push('/home');
      }
    } catch (err: any) {
      Alert.alert('Login Failed', err?.errors?.[0]?.message || 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const onGoogleSignInPress = async () => {
    if (!startOAuthFlow) return;
    setLoading(true);
    try {
      const response = await startOAuthFlow();
      const { createdSessionId } = response;
      if (!createdSessionId) throw new Error('No session created.');
      if (setActive) {
        await setActive({ session: createdSessionId });
        router.push('/home');
      }
    } catch (err) {
      Alert.alert('Error', 'Google Sign-In failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.page}>
      <View style={styles.bgTopBlob} />
      <View style={styles.bgBottomBlob} />
      <Spinner visible={loading} />

      <View style={styles.card}>
        <Text style={styles.kicker}>WELCOME BACK</Text>
        <Text style={styles.title}>Sign In</Text>
        <Text style={styles.subtitle}>Continue to Navalok WaterWorld</Text>

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

        <Pressable onPress={onSignInPress} style={styles.primaryBtn}>
          <Text style={styles.primaryBtnText}>Login</Text>
        </Pressable>

        <Pressable style={styles.googleButton} onPress={onGoogleSignInPress}>
          <Text style={styles.googleButtonText}>Continue with Google</Text>
        </Pressable>

        <Link href="/reset" asChild>
          <Pressable style={styles.link}>
            <Text style={styles.linkText}>Forgot password?</Text>
          </Pressable>
        </Link>
        <Link href="/register" asChild>
          <Pressable style={styles.link}>
            <Text style={styles.linkText}>Create Account</Text>
          </Pressable>
        </Link>
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
  googleButton: {
    marginTop: 10,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#4285F4',
    alignItems: 'center',
  },
  googleButtonText: {
    color: '#fff',
    fontFamily: 'outfits-medium',
    fontSize: 16,
  },
  link: {
    marginTop: 10,
    alignItems: 'center',
  },
  linkText: {
    color: '#334155',
    fontFamily: 'outfits-medium',
    fontSize: 14,
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

export default Login;
