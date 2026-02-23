import { View, FlatList, StyleSheet } from 'react-native';
import React from 'react';
import InventorySearch from '../../components/Farmer/InventorySearch';

// Import components
import Header from '../../components/Home/Header';
import Slider from '../../components/Home/Slider';
import ProductListByCategory from '../../components/Home/ProductListByCategory';

const Home = () => {
  return (
    <View style={styles.page}>
      <View style={styles.bgTopBlob} />
      <View style={styles.bgBottomBlob} />
      <FlatList
        ListHeaderComponent={
          <View style={styles.content}>
            <Header />
            <Slider />
            <InventorySearch />
            <ProductListByCategory />
          </View>
        }
        data={[]}
        keyExtractor={(item, index) => index.toString()}
        renderItem={null}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: '#f3f7fb',
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 36,
  },
  listContent: {
    paddingBottom: 30,
  },
  bgTopBlob: {
    position: 'absolute',
    top: -120,
    right: -70,
    width: 260,
    height: 260,
    borderRadius: 140,
    backgroundColor: 'rgba(10, 116, 218, 0.18)',
  },
  bgBottomBlob: {
    position: 'absolute',
    bottom: -120,
    left: -90,
    width: 280,
    height: 280,
    borderRadius: 160,
    backgroundColor: 'rgba(22, 167, 111, 0.14)',
  },
});

export default Home;
