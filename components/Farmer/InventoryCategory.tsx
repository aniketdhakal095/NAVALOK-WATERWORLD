import {Image, View, Text, StyleSheet, Touchable, TouchableOpacity, FlatList } from 'react-native';
import React, { useEffect, useState } from 'react';
import { collection, doc, getDocs } from 'firebase/firestore';
import { db } from '../../config/FirebaseConfig';
import Colors from '../../constants/Colors';

const Category = ({category}) => {

    const [categoryList,setCategortList]=useState([]);
    const [selectedCategory,setSelectedCategory]=useState('Fruites');

    useEffect(()=>{
        GetCatgories();
    },[]
/* used to get Categoies  list from database */)
    const GetCatgories=async()=>{
        setCategortList([]);
        const snapshot=await getDocs(collection(db,'InventoryCategory'));
        snapshot.forEach((doc)=>{
           
            setCategortList(categoryList=>[...categoryList,doc.data()])
        })
    }
  return (
    <View style={{
        marginTop:20
    }}>
      <Text style={{
        fontFamily:'outfits-medium',
        fontSize:20
      }}>Category</Text>

       <FlatList
       data={categoryList}
       numColumns={5}
       renderItem={({item,index})=>(
        <TouchableOpacity
        onPress={()=>{setSelectedCategory(item.name);
        category(item.name)
        }}
        style={{
            flex:1
        }}>
            <View style={[styles.container,
                selectedCategory==item.name&&styles.selectedCategoryContainer
            ]}>
                <Image source={{uri:item?.imageUrl}}
                style={{
                    width:40,
                    height:40
                }}
                />
                
                
                </View>
                <Text
                style={{
                    textAlign:'center',
                    fontFamily:'outfits-bold',
                    fontSize:9
                }}>{item?.name}</Text>
            </TouchableOpacity>
       )}
       />
    </View>
   
  )
}
const styles = StyleSheet.create({
    container:{
        backgroundColor:Colors.SECONDARY,
        padding:15,
        alignItems:'center',
        borderWidth:1,
        borderRadius:20,
       
        borderColor:Colors.HeadCOL,
        margin:5
    },
    selectedCategoryContainer:{
        backgroundColor:Colors.PRIMARYB,
        borderColor:Colors.SECONDARYB

    }
    
})

export default Category;