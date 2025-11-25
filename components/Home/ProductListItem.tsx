import { Image, View, Text, TouchableOpacity } from 'react-native'
import React from 'react'
import Colors from '../../constants/Colors'
import { router, useRouter } from 'expo-router'

const ProductListItem = ({product}) => {
  const router = useRouter();
  return (
    <TouchableOpacity
      onPress={() =>
        router.push({
          pathname: '/product-details',
          params: product,
        })
      }
    >
    <View style={{
        padding:10,
        marginRight:15,
        backgroundColor:Colors.WHITE,
        borderRadius:10
    }}>
      <Image source={{uri:product?.imageUrl}}
      style={{
        width:135,
        height:135,
        objectFit:'cover',
        borderRadius:10
      }}
      />
     
      <Text style={{
        fontFamily:'outfits-medium',
        fontSize:17
      }}>{product?.name}</Text>
       <View style={{
            display:'flex',
            
           
       }}>
      <Text style={{
        color:Colors.GRAY,
        fontFamily:'outfits',
        

      }}>{product?.category}</Text>
      <Text style={{
        color:Colors.GRAY,
        fontFamily:'outfits'
      }}> Rs. {product?.price} / {product?.measureUnit}</Text>
      
      </View>
      
    </View>
    </TouchableOpacity>
  )
}

export default ProductListItem;