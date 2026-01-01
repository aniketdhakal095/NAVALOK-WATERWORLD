
import {Image, View, Text, ListRenderItemInfo, Dimensions, FlatList } from 'react-native';
import React, { useEffect, useState } from 'react';
import {collection, getDocs, doc } from "firebase/firestore";
import { db } from '../../config/FirebaseConfig';

import { StyleSheet } from 'react-native';

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
        setsliderList([]);
        const snapshot=await getDocs(collection(db, "Sliders"));
        snapshot.forEach((doc)=>{
            console.log(doc.data());
            setsliderList(sliderList=>[...sliderList,doc.data() as SliderItem])
        });

    };
  return (
    <View 
    style={{
        marginTop:15
    }}
    >
      <FlatList
              data={sliderList}
              horizontal={true}
              showsHorizontalScrollIndicator={false}
              renderItem={({item,index})=>(
                <View>
                    <Image source={{uri:item?.imageUrl}}
                    style={styles?.sliderImage}
                    />
                </View>
              )}
      />
    </View>
  );

};


const styles = StyleSheet.create({
    sliderImage:{
        width:Dimensions.get('screen').width*0.9,
        height:160,
        borderRadius:15,
        marginRight:15
    }
})


export default Slider;