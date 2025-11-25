import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  doc,
  getDoc,
} from 'firebase/firestore';
import { db } from './../../config/FirebaseConfig';
import { useUser } from '@clerk/clerk-expo';
import { useLocalSearchParams, useRouter } from 'expo-router';

interface Message {
  id: string;
  sender: {
    id: string;
    name: string;
    imageUrl: string;
  };
  text: string;
  timestamp: any;
  messageType?: string;
}

export default function ChatScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const { user } = useUser();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [otherUser, setOtherUser] = useState<any>(null);

  useEffect(() => {
    if (typeof params?.id === 'string') {
      fetchChatUsers();
      fetchMessages();
    }
  }, [params?.id]);

  /** ✅ Identify Current User & Other User */
  const fetchChatUsers = async () => {
    try {
      const chatRef = doc(db, 'Chat', params.id as string);
      const chatSnap = await getDoc(chatRef);

      if (chatSnap.exists()) {
        const chatData = chatSnap.data();
        const { users } = chatData;

        // Find the current user's index in the array
        const currentUserIndex = users.findIndex(
          (userItem: { id: string }) => userItem.id === user?.primaryEmailAddress?.emailAddress
        );

        // Determine the other user based on index
        const otherUserIndex = currentUserIndex === 0 ? 1 : 0;
        setOtherUser(users[otherUserIndex]);
      }
    } catch (error) {
      console.error('Error fetching chat users:', error);
    }
  };

  /** ✅ Fetch Messages in Real-Time */
  const fetchMessages = () => {
    if (typeof params?.id === 'string') {
      const messagesRef = collection(db, `Chat/${params.id}/messages`);
      const q = query(messagesRef, orderBy('timestamp', 'asc'));

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const msgList = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            sender: {
              id: data?.sender?.id || 'unknown',
              name: data?.sender?.name || 'Unknown',
              imageUrl: data?.sender?.imageUrl || '',
            },
            text: data?.text || '',
            messageType: data?.messageType || 'text',
            timestamp: data?.timestamp ? data.timestamp.toDate() : new Date(),
          };
        });

        setMessages(msgList);
        setLoading(false);
      });

      return unsubscribe;
    }
  };

  /** ✅ Send Push Notification */
  const sendPushNotification = async (expoPushToken: string, message: string, senderName: string) => {
    const notificationBody = {
      to: expoPushToken,
      sound: 'default',
      title: `New message from ${senderName}`,
      body: message,
      data: { screen: '/chat' },
    };

    await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(notificationBody),
    });
  };

  /** ✅ Send Message */
  const sendMessage = async () => {
    if (inputText.trim() === '' || typeof params?.id !== 'string') return;

    try {
      const messagesRef = collection(db, 'Chat', params.id, 'messages');

      await addDoc(messagesRef, {
        sender: {
          id: user?.primaryEmailAddress?.emailAddress || 'unknown',
          name: user?.fullName || 'Anonymous',
          imageUrl: user?.imageUrl || '',
        },
        text: inputText,
        messageType: 'text',
        timestamp: serverTimestamp(),
      });

      // Send push notification to the other user
      if (otherUser?.id) {
        const userRef = doc(db, 'Users', otherUser.id);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists() && userSnap.data().pushToken) {
          const senderName = user?.fullName || 'Anonymous';
          sendPushNotification(userSnap.data().pushToken, inputText, senderName);
        }
      }

      setInputText('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={{ flex: 1, padding: 20 }}>
        {/* ✅ Chat Header (Displays Other User's Name) */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="black" />
          </TouchableOpacity>
          <Text style={{ fontSize: 18, fontWeight: 'bold', marginLeft: 10 }}>
            {otherUser?.name || 'Chat'}
          </Text>
        </View>

        {/* ✅ Messages List */}
        {loading ? (
          <ActivityIndicator size="large" color="blue" style={{ flex: 1, justifyContent: 'center' }} />
        ) : (
          <FlatList
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => {
              const isCurrentUser = item.sender.id === user?.primaryEmailAddress?.emailAddress;
              return (
                <View
                  style={{
                    alignSelf: isCurrentUser ? 'flex-end' : 'flex-start',
                    backgroundColor: isCurrentUser ? '#DCF8C6' : '#FFF',
                    padding: 10,
                    marginVertical: 5,
                    borderRadius: 10,
                    maxWidth: '75%',
                    flexDirection: 'row',
                  }}
                >
                  {item.sender.id !== user?.primaryEmailAddress?.emailAddress && (
                    <Image
                      source={{ uri: item.sender.imageUrl }}
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 20,
                        marginRight: 10,
                      }}
                    />
                  )}

                  <View>
                    <Text>{item.text}</Text>
                  </View>
                </View>
              );
            }}
          />
        )}

        {/* ✅ Input Box */}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10 }}>
          <TextInput
            value={inputText}
            onChangeText={setInputText}
            style={{
              flex: 1,
              borderWidth: 1,
              borderColor: '#ddd',
              borderRadius: 20,
              padding: 10,
              marginRight: 10,
            }}
            placeholder="Type a message"
            onSubmitEditing={sendMessage}
          />
          <TouchableOpacity onPress={sendMessage}>
            <Ionicons name="send" size={24} color="blue" />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
