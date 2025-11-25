import { Image, View, Text, Pressable } from 'react-native';
import React from 'react';
import Colors from '../../constants/Colors';
import { Link } from 'expo-router';

const Welcome = () => {
  
  
  return (
    <View style={{ backgroundColor: Colors.WHITE, flex: 1 }}>
      {/* Image Section */}
      <Image
        source={require('../../assets/images/wel.png')} // Corrected Path
        style={{
          width: '100%',
          height: 450,
        }}
      />
      {/* Text Section */}
      <View
        style={{
          padding: 20,
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <Text
          style={{
            fontFamily: 'outfits-extrabold',
            fontSize: 30,
            textAlign: 'center',
          }}
        >
          Welcome To, FRESH FARM
        </Text>
        <Text
          style={{
            fontFamily: 'thin',
            fontSize: 15,
            textAlign: 'center',
            color: Colors.GRAY,
            marginTop: 10,
          }}
        >
          Eat fresh food, get a healthy life
        </Text>

        {/* Get Started Button */}
        <Link href={'/login'}
        
          style={{
            backgroundColor: Colors.PRIMARY,
            padding: 15,
            borderRadius: 8,
            marginTop: 20,
          }}
        >
          <Text
            style={{
              fontFamily: 'outfits-extrabold',
              fontSize: 20,
              textAlign: 'center',
              color: Colors.WHITE,
            }}
          >
            Get Started 
          </Text>
        </Link>
      </View>
    </View>
  );
};

export default Welcome;
