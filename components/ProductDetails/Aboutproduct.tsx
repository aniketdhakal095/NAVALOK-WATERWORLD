import { View, Text, Pressable } from 'react-native'
import React, { useState } from 'react'
import Colors from '../../constants/Colors';

export default function Aboutproduct({product}) {
    const [readMore,setReadMore]=useState(false);
  return (
    <View style={{
        padding:20
    }}>
      <Text style={{
        fontFamily:'outfits-medium',
        fontSize:20
      }}>About {product?.name}</Text>
      <Text 
      numberOfLines={readMore?3:30}
      style={{
        fontFamily:'outfits',
        fontSize:16,
      }}
      > Product Category {product?.category} {product?.description} </Text>
      {readMore&&
      <Pressable onPress={()=>setReadMore(false)}>
      <Text style={{
        fontFamily:'outfits-medium',
        fontSize:14,
        color:Colors.PRIMARY

      }}>Read More</Text>
      </Pressable>}

    </View>
  )
}