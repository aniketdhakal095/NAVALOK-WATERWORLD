import { useEffect } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";

export default function PaymentSuccess() {
  const router = useRouter();

  useEffect(() => {
    // Redirect immediately to home page
    router.replace("/(auth)/home");
  }, []);

  return (
    <View style={{ flex:1, justifyContent:"center", alignItems:"center" }}>
      <ActivityIndicator size="large" />
      <Text>Payment successful. Redirecting...</Text>
    </View>
  );
}