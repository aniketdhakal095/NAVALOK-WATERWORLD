import {
  Image,
  View,
  Text,
  Dimensions,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Linking
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../config/FirebaseConfig';

interface SliderItem {
  imageUrl: string;
  description: string;
  name: string;
  [key: string]: any;
}

const Slider = () => {
  const [sliderList, setSliderList] = useState<SliderItem[]>([]);

  useEffect(() => {
    GetSliders();
  }, []);

  const GetSliders = async () => {
    const snapshot = await getDocs(collection(db, "Sliders"));
    const items: SliderItem[] = [];

    snapshot.forEach((d) => {
      items.push(d.data() as SliderItem);
    });

    setSliderList(items);
  };

  // ✅ Open Link Function
  const openLink = async (url: string) => {
    if (!url) return;

    let formattedUrl = url;

    // Add https if user saved without http
    if (!url.startsWith("http")) {
      formattedUrl = "https://" + url;
    }

    const supported = await Linking.canOpenURL(formattedUrl);

    if (supported) {
      await Linking.openURL(formattedUrl);
    } else {
      console.log("Cannot open URL:", formattedUrl);
    }
  };

  return (
    <View style={styles.wrapper}>
      <Text style={styles.sectionTitle}>Featured Today</Text>

      <FlatList
        data={sliderList}
        horizontal={true}
        showsHorizontalScrollIndicator={false}
        keyExtractor={(_, index) => `slide-${index}`}
        renderItem={({ item }) => (
          <View style={styles.slideCard}>
            <Image
              source={{ uri: item?.imageUrl }}
              style={styles.sliderImage}
            />

            <View style={styles.overlay}>
              {/* Title */}
              <Text style={styles.overlayTitle}>
                {item?.name || "Fresh Market Picks"}
              </Text>

              {/* Clickable Description */}
              <TouchableOpacity
                onPress={() => openLink(item?.description)}
              >
                <Text
                  style={[
                    styles.overlaySubtitle,
                    { textDecorationLine: 'underline' }
                  ]}
                >
                  {item?.description || "Quality products from trusted seller"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginTop: 8
  },
  sectionTitle: {
    fontFamily: 'outfits-medium',
    fontSize: 20,
    color: '#0f172a',
    marginBottom: 10
  },
  slideCard: {
    marginRight: 12,
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: '#dbeafe'
  },
  sliderImage: {
    width: Dimensions.get('screen').width * 0.86,
    height: 180
  },
  overlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: 'rgba(15, 23, 42, 0.48)'
  },
  overlayTitle: {
    fontFamily: 'outfits-medium',
    fontSize: 16,
    color: '#fff'
  },
  overlaySubtitle: {
    marginTop: 2,
    fontFamily: 'outfits',
    fontSize: 12,
    color: '#e2e8f0'
  }
});

export default Slider;