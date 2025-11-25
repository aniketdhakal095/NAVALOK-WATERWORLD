import React from 'react';
import { Stack } from 'expo-router';
import Colors from '../../constants/Colors';

const PublicLayout = () => {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor:Colors.HeadCOL,
        },
        headerTintColor: '#fff',
        headerBackTitle: 'Back',
      }}>
      <Stack.Screen
        name="wellcome"
        options={{
          headerTitle: 'Fresh Farm',
          headerShown:false,
        }}></Stack.Screen>
      <Stack.Screen
        name="login"
        options={{
          headerTitle: 'Fresh Farm',
        }}></Stack.Screen>
      <Stack.Screen
        name="register"
        options={{
          headerTitle: 'Create Account',
        }}></Stack.Screen>
      <Stack.Screen
        name="reset"
        options={{
          headerTitle: 'Reset Password',
        }}></Stack.Screen>
    </Stack>
  );
};

export default PublicLayout;
