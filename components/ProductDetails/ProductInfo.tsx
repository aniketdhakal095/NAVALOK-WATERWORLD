import { View, Text, Image } from 'react-native'
import React from 'react'
import Colors from '../../constants/Colors'

import MarkFav from '../MarkFav';

export default function ProductInfo({product}) {
  return (
    <View>
      <Image source={{uri:product.imageUrl}}
      style={{
        width:'100%',
        height:400,
        objectFit:'cover'
      }}
      />
      <View style={{
        padding:20,
        display:'flex',
        flexDirection:'row',
        justifyContent:'space-between',
        alignItems:'center'
      }}>
        <View>
            <Text style={{
                fontFamily:'outfits-bold',
                fontSize:27
            }}>{product?.name}</Text>
            <Text style={{
                fontFamily:'outfits',
                color:Colors.GRAY,
                fontSize:16,
            }}>{product?.category}</Text>
            
        </View>

        <MarkFav product={product}/>

      </View>
      
      
    </View>
  )
}