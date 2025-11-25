import { useSignIn, useSession, useOAuth } from '@clerk/clerk-expo';
import { Link, useRouter } from 'expo-router';
import React, { useState, useEffect } from 'react';
import Colors from '../../constants/Colors';
import { View, StyleSheet, TextInput, Button, Pressable, Text, Alert } from 'react-native';
import Spinner from 'react-native-loading-spinner-overlay';

const Login = () => {
  const { signIn, setActive, isLoaded } = useSignIn();
  const { startOAuthFlow } = useOAuth({ strategy: 'oauth_google' });
  const { session } = useSession(); // Check if the user is already signed in
  const router = useRouter();
  const [emailAddress, setEmailAddress] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Redirect if there's an active session
    if (session) {
      router.push('/home'); // Navigate to the home screen if a session exists
    }
  }, [session, router]);

  const onSignInPress = async () => {
    if (!isLoaded || !signIn) {
      return;
    }
    setLoading(true);
    try {
      const completeSignIn = await signIn.create({
        identifier: emailAddress,
        password,
      });

      if (setActive) {
        await setActive({ session: completeSignIn.createdSessionId });
        router.push('/home'); // Navigate to home screen after successful login
      } else {
        throw new Error("setActive is not available");
      }
    } catch (err: any) {
      alert(err.errors[0]?.message || 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const onGoogleSignInPress = async () => {
    if (!startOAuthFlow) {
      return;
    }
    setLoading(true);
    try {
      const response = await startOAuthFlow();
      const { createdSessionId } = response;
      if (!createdSessionId) {
        throw new Error('No session created.');
      }
      if (setActive) {
        await setActive({ session: createdSessionId });
        router.push('/home'); // Navigate to home screen after successful Google login
      } else {
        throw new Error("setActive is not available");
      }
      Alert.alert('Success', 'Logged in with Google!');
    } catch (err) {
      console.error('OAuth Error:', err);
      Alert.alert('Error', 'Google Sign-In failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Spinner visible={loading} />

      <TextInput
        autoCapitalize="none"
        placeholder="youremail@example.com"
        value={emailAddress}
        onChangeText={setEmailAddress}
        style={styles.inputField}
      />
      <TextInput
        placeholder="password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.inputField}
      />
      <Button onPress={onSignInPress} title="Login" color={Colors.BUTTON_COLOR}></Button>

      <Pressable style={styles.googleButton} onPress={onGoogleSignInPress}>
        <Text style={styles.googleButtonText}>Continue with Google</Text>
      </Pressable>

      <Link href="/reset" asChild>
        <Pressable style={styles.link}>
          <Text>Forgot password?</Text>
        </Pressable>
      </Link>
      <Link href="/register" asChild>
        <Pressable style={styles.link}>
          <Text>Create Account</Text>
        </Pressable>
      </Link>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  inputField: {
    marginVertical: 4,
    height: 50,
    borderWidth: 1,
    borderColor: Colors.HeadCOL,
    borderRadius: 4,
    padding: 10,
    backgroundColor: '#fff',
  },
  googleButton: {
    marginTop: 20,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#4285F4',
    alignItems: 'center',
  },
  googleButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  link: {
    margin: 8,
    alignItems: 'center',
  },
});

export default Login;
