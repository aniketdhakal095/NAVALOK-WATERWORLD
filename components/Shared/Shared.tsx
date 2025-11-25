import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "../config/FirebaseConfig";

const GetFavList = async (user) => {
    try {
        if (!user?.primaryEmailAddress?.emailAddress) {
            throw new Error("User email is not defined.");
        }

        const docRef = doc(db, 'userFavProduct', user.primaryEmailAddress.emailAddress);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
            return docSnap.data();
        } else {
            // Initialize document if it doesn't exist
            await setDoc(docRef, {
                email: user.primaryEmailAddress.emailAddress,
                favorites: []
            });
            return { favorites: [] }; // Return an empty favorites array
        }
    } catch (e) {
        console.error("Error getting favorites: ", e);
        return { favorites: [] }; // Return an empty array on error
    }
};

const UpdateFav = async (favorites, user) => {
    try {
        if (!user?.primaryEmailAddress?.emailAddress) {
            throw new Error("User email is not defined.");
        }

        const docRef = doc(db, 'userFavProduct', user.primaryEmailAddress.emailAddress);
        await updateDoc(docRef, {
            favorites: favorites
        });
    } catch (e) {
        console.error("Error updating favorites: ", e);
    }
};

export default {
    GetFavList,
    UpdateFav
};
