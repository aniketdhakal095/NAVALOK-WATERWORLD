import { View, Text, Image } from 'react-native'
import React from 'react'
import Colors from '../../constants/Colors'

export default function Productsubinfo({product}) {
  return (
    <View style={{
        padding:20
    }}>
      <View style={{
        display:'flex',
        flexDirection:'row'
      }}>
        <View style={{
            display:'flex',
            flexDirection:'row',
            alignItems:'center',
            backgroundColor:Colors.WHITE,
            padding:10,
            margin:5,
            borderRadius:8,
            gap:10,
            flex:1

        }}>
            <Image source={require('./../../assets/images/priceIcon.jpg')}
            style={{
                width:40,
                height:40
            }}/>
            <View>
                <Text style={{
                    fontFamily:'outfits',
                    fontSize:16,
                    color:Colors.GRAY
                }}>Price</Text>
                <Text>Rs. {product?.price}/{product?.measureUnit}</Text>
            </View>
        </View>
        <View style={{
            display:'flex',
            flexDirection:'row',
            alignItems:'center',
            backgroundColor:Colors.WHITE,
            padding:10,
            margin:5,
            borderRadius:8,
            gap:10,
            flex:1,

        }}>
            <Image source={require('./../../assets/images/quantityIcon.png')}
            style={{
                width:40,
                height:40
            }}/>
            <View>
                <Text style={{
                    fontFamily:'outfits',
                    fontSize:16,
                    color:Colors.GRAY
                }}>Quantity</Text>
                <Text>{product?.quantity}{product?.measureUnit}</Text>
            </View>
        </View>
      </View>
    </View>
  )
}