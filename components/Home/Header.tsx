import { Image, View, Text } from 'react-native'
import React from 'react'
import { useUser } from '@clerk/clerk-expo';

const Header = () => {
    const {user}=useUser();
  return (
    <View style={{
        display:'flex',
        flexDirection:'row',
        justifyContent:'space-between',
        alignItems:'center'
    }}>
        <View>
      <Text style={{
        fontFamily:'outfits',
        fontSize:18
      }}>Wellcome,</Text>
      <Text style={{
        fontFamily:'outfits-medium',
        fontSize:25
      }}>{user?.fullName}</Text>
      </View>
      <Image source={{uri:user?.imageUrl}}
      style={{
        width:40,
        height:40,
        borderRadius:99
      }}
      />
    </View>
  )
}

export default Header;