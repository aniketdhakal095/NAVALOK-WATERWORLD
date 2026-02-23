import React, { useEffect } from 'react';
import { Platform } from 'react-native';
import { ClerkProvider, useAuth } from "@clerk/clerk-expo";
import { Slot, useRouter, useSegments } from 'expo-router';
import * as Notifications from 'expo-notifications';
import * as SecureStore from 'expo-secure-store';
import * as Device from 'expo-device';
import * as Linking from 'expo-linking';
import { collection, doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from './../config/FirebaseConfig'; 
import { useUser } from '@clerk/clerk-expo';

const CLERK_PUBLISHABLE_KEY = 'pk_test_c2VsZWN0LWtpdHRlbi0xMS5jbGVyay5hY2NvdW50cy5kZXYk';

// 📌 Function to get push notification permission & token
const registerForPushNotifications = async () => {
  if (!Device.isDevice) return; // Ensure it's a physical device

  const { status } = await Notifications.getPermissionsAsync();
  let finalStatus = status;

  if (finalStatus !== 'granted') {
    const { status: newStatus } = await Notifications.requestPermissionsAsync();
    finalStatus = newStatus;
  }

  if (finalStatus !== 'granted') return; // Permission denied

  // Get Expo Push Token
  const token = (await Notifications.getExpoPushTokenAsync()).data;
  return token;
};




const InitialLayout = () => {
  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (isSignedIn && inAuthGroup) {
      router.replace('/home'); // Redirect authenticated users to Home
    } else if (!isSignedIn) {
      router.replace('/wellcome'); // Redirect non-authenticated users to Welcome
    }



    // Register for Push Notifications
    if (user) {
      const requestPermission = async () => {
            if (Platform.OS === 'android') {
              const { status } = await Notifications.requestPermissionsAsync();
              if (status !== 'granted') {
                console.log('Permission not granted for notifications');
              }
            }
          };
          requestPermission();
        
      registerForPushNotifications().then((token) => {
        if (token) {
          const userRef = doc(db, 'Users', user.id);
          setDoc(userRef, { pushToken: token }, { merge: true }); // Store push token in Firestore
        }
      });

      const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
        console.log('Notification Clicked:', response);
      });

      return () => Notifications.removeNotificationSubscription(subscription);
    }
  }, [isSignedIn]);

  // Deep link handling
  useEffect(() => {
    const handleDeepLink = (event: { url: string }) => {
      const { url } = event;
      if (url?.startsWith('myapp://payment-success')) {
        router.replace('/payment-success');
      }
    };

    const subscription = Linking.addEventListener('url', handleDeepLink);

    // Check initial URL
    Linking.getInitialURL().then((url) => {
      if (url?.startsWith('myapp://payment-success')) {
        router.replace('/payment-success');
      }
    });

    return () => {
      // Cleanup not needed for linking listener in this context
    };
  }, [router]);

  return <Slot />;
};

const tokenCache = {
  async getToken(key: string) {
    try {
      return SecureStore.getItemAsync(key);
    } catch (err) {
      return null;
    }
  },
  async saveToken(key: string, value: string) {
    try {
      return SecureStore.setItemAsync(key, value);
    } catch (err) {
      return;
    }
  },
};

const RootLayout = () => {
  return (
    <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY} tokenCache={tokenCache}>
      <InitialLayout />
    </ClerkProvider>
  );
};

export default RootLayout;
