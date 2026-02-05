import { View, Text, Image } from 'react-native'
import React from 'react'
import Colors from '../../constants/Colors'



export default function Subsubinfo({product}) {
  return (
    <View>
      
     <View>
             <Text style={{
                     fontFamily:'outfits',
                     color:Colors.BLACK,
                     fontSize:16,
                 }}>Capacity :{product?.capacity} ltr </Text>
           </View>
           <View>
             <Text style={{
                     fontFamily:'outfits',
                     color:Colors.BLACK,
                     fontSize:16,
                 }}>{product?.status}</Text>
           </View>
            
       
      
      
    </View>
  )
}