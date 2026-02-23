import { Image, View, Text, Dimensions, FlatList, StyleSheet } from 'react-native';
import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../config/FirebaseConfig';

interface SliderItem {
    imageUrl: string;
    [key: string]: any;
}

const Slider = () => {
    const [sliderList,setsliderList]=useState<SliderItem[]>([]);
    useEffect(()=>{
        GetSliders();

    },[]);
    const GetSliders=async ()=>{
        const snapshot=await getDocs(collection(db, "Sliders"));
        const items: SliderItem[] = [];
        snapshot.forEach((d)=>{
            items.push(d.data() as SliderItem);
        });
        setsliderList(items);
    };
  return (
    <View style={styles.wrapper}>
      <Text style={styles.sectionTitle}>Featured Today</Text>
      <FlatList
              data={sliderList}
              horizontal={true}
              showsHorizontalScrollIndicator={false}
              keyExtractor={(_, index) => `slide-${index}`}
              renderItem={({item,index})=>(
                <View style={styles.slideCard}>
                    <Image source={{uri:item?.imageUrl}}
                    style={styles?.sliderImage}
                    />
                    <View style={styles.overlay}>
                      <Text style={styles.overlayTitle}>Fresh Market Picks</Text>
                      <Text style={styles.overlaySubtitle}>Quality products from trusted sellers</Text>
                    </View>
                </View>
              )}
      />
    </View>
  );

};


const styles = StyleSheet.create({
    wrapper:{
        marginTop:8
    },
    sectionTitle:{
        fontFamily:'outfits-medium',
        fontSize:20,
        color:'#0f172a',
        marginBottom:10
    },
    slideCard:{
        marginRight:12,
        borderRadius:18,
        overflow:'hidden',
        backgroundColor:'#dbeafe'
    },
    sliderImage:{
        width:Dimensions.get('screen').width*0.86,
        height:180
    },
    overlay:{
        position:'absolute',
        left:0,
        right:0,
        bottom:0,
        paddingVertical:12,
        paddingHorizontal:14,
        backgroundColor:'rgba(15, 23, 42, 0.48)'
    },
    overlayTitle:{
        fontFamily:'outfits-medium',
        fontSize:16,
        color:'#fff'
    },
    overlaySubtitle:{
        marginTop:2,
        fontFamily:'outfits',
        fontSize:12,
        color:'#e2e8f0'
    }
});

export default Slider;
