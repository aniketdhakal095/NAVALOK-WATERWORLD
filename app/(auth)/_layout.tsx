import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Pressable } from 'react-native';
import { useAuth } from '@clerk/clerk-expo';
import React from 'react';
import Colors from '../../constants/Colors';

export const LogoutButton = () => {
  const { signOut } = useAuth();

  const doLogout = () => {
    signOut();
  };

  return (
    <Pressable onPress={doLogout} style={{ marginRight: 10 }}>
      <Ionicons name="log-out-outline" size={24} color={'#fff'} />
    </Pressable>
  );
};

const TabsPage = () => {
  const { isSignedIn } = useAuth();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor:Colors.HeadCOL,
        
        headerStyle: {
          backgroundColor:Colors.HeadCOL,
        },
        headerTintColor: '#fff',
      }}>
      <Tabs.Screen
        name="home"
        options={{
          headerTitle: 'Home',
          tabBarIcon: ({ color, size }) => <Ionicons name="home" size={30} color={color} />,
          tabBarLabel: 'Home',
          headerShown:false,
          
        }}
        redirect={!isSignedIn}
      />
      <Tabs.Screen
        name="favorite"
        options={{
          headerTitle: 'My favorite',
          tabBarIcon:({color})=><Ionicons name="heart" size={30} color={color} />,
          tabBarLabel: 'My favorite',
          
          headerShown:false,
        }}
        redirect={!isSignedIn}
      />
      <Tabs.Screen
        name="inbox"
        options={{
          headerTitle: 'My inbox',
          tabBarIcon:({color})=><Ionicons name="chatbubbles" size={30} color={color} />,
          tabBarLabel: 'My inbox',
          
          headerShown:false,
        }}
        redirect={!isSignedIn}
      />
      <Tabs.Screen
        name="profile"
        options={{
          headerTitle: 'My Profile',
          tabBarIcon:({color})=><Ionicons name="people-circle" size={30} color={color} />,
          tabBarLabel: 'My Profile',
          headerRight: () => <LogoutButton />,
          
        }}
        redirect={!isSignedIn}
      />
    </Tabs>
  );
};

export default TabsPage;
