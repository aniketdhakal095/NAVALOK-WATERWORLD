import { View, Pressable, Text } from 'react-native';
import React, { useEffect, useState } from 'react';
import Ionicons from '@expo/vector-icons/Ionicons';
import Shared from './../Shared/Shared';
import { useUser } from '@clerk/clerk-expo';

export default function MarkFav({ product }) {
    const { user } = useUser();
    const [favList, setFavList] = useState([]);  // Ensure favList is initialized as an empty array

    useEffect(() => {
        if (user) {
            GetFav();
        }
    }, [user]);

    const GetFav = async () => {
        try {
            const result = await Shared.GetFavList(user);
            console.log('GetFav result:', result); // Debugging line
            setFavList(result?.favorites || []); // Make sure it's set to an array if result is undefined or null
        } catch (error) {
            console.error('Error fetching favorites:', error);
        }
    };

    const AddtoFav = async () => {
        if (!product?.id) {
            console.error('Product ID is missing');
            return;
        }
        try {
            const favResult = [...favList, product.id]; // Use spread to avoid mutating state
            console.log('Adding to favorites:', favResult); // Debugging line
            await Shared.UpdateFav(favResult, user);  // Ensure you're passing correct parameters
            GetFav();
        } catch (error) {
            console.error('Error adding to favorites:', error);
        }
    };

    const removefromfav = async () => {
        if (!product?.id) {
            console.error('Product ID is missing');
            return;
        }
        try {
            const favResult = favList.filter(item => item !== product.id);
            console.log('Removing from favorites:', favResult); // Debugging line
            await Shared.UpdateFav(favResult, user);  // Ensure you're passing correct parameters
            GetFav();
        } catch (error) {
            console.error('Error removing from favorites:', error);
        }
    };

    console.log('Current favList:', favList);  // Debugging line
    console.log('Product ID:', product?.id);  // Debugging line

    // Adding additional check to ensure favList is always an array and product.id is valid
    return (
        <View>
            {Array.isArray(favList) && product?.id ? (
                favList.includes(product.id) ? (
                    <Pressable onPress={removefromfav}>
                        <Ionicons name="heart" size={30} color="red" />
                    </Pressable>
                ) : (
                    <Pressable onPress={() => AddtoFav()}>
                        <Ionicons name="heart-outline" size={30} color="black" />
                    </Pressable>
                )
            ) : (
                <Text>No product ID or favorites found</Text>
            )}
        </View>
    );
}
