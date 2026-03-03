import React, { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';

import InventorySearch from '../../components/Farmer/InventorySearch';
import InventoryProductListByCategory from '../../components/Farmer/InventoryProductListbyCategory';

export default function Console() {
  const router = useRouter();
  const [showCategories, setShowCategories] = useState(true);
  const [sellModalVisible, setSellModalVisible] = useState(false);

  return (
    <View style={styles.container}>
      <View style={styles.bgTopBlob} />
      <View style={styles.bgBottomBlob} />

      <View style={styles.headerCard}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={20} color="#0f172a" />
        </Pressable>
        <View style={styles.headerTextWrap}>
          <Text style={styles.title}>Your Console</Text>
          <Text style={styles.subtitle}>Manage listings, sales and orders</Text>
        </View>
      </View>

      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={[styles.toggleButton, showCategories && styles.toggleButtonActive]}
          onPress={() => setShowCategories(true)}
        >
          <Ionicons name="grid" size={18} color={showCategories ? '#fff' : '#0f766e'} />
          <Text style={[styles.toggleText, showCategories && styles.toggleTextActive]}>
            Browse
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.toggleButton, !showCategories && styles.toggleButtonActive]}
          onPress={() => setShowCategories(false)}
        >
          <Ionicons name="search" size={18} color={!showCategories ? '#fff' : '#0f766e'} />
          <Text style={[styles.toggleText, !showCategories && styles.toggleTextActive]}>
            Search
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.contentWrapper}>
        {showCategories ? <InventoryProductListByCategory /> : <InventorySearch />}
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.sellButton}
          onPress={() => router.push('/view-product')}
        >
          <Ionicons name="eye-outline" size={18} color="#fff" />
          <Text style={styles.sellButtonText}>View</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.sellButton, styles.sellAction]}
          onPress={() => setSellModalVisible(true)}
        >
          <Ionicons name="pricetag-outline" size={18} color="#fff" />
          <Text style={styles.sellButtonText}>Sell</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.sellButton}
          onPress={() => router.push('/Orderlist')}
        >
          <Ionicons name="clipboard-outline" size={18} color="#fff" />
          <Text style={styles.sellButtonText}>Orders</Text>
        </TouchableOpacity>
      </View>

      {/* ✅ 4 Button Modal */}
      <Modal
        transparent
        animationType="slide"
        visible={sellModalVisible}
        onRequestClose={() => setSellModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Select Product Type</Text>

            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => {
                setSellModalVisible(false);
                router.push('/FishandPlant');
              }}
            >
              <Text style={styles.modalButtonText}>Fish and Plant</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => {
                setSellModalVisible(false);
                router.push('/inventory-sell-product');
              }}
            >
              <Text style={styles.modalButtonText}>Inventory Product</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => {
                setSellModalVisible(false);
                router.push('/farm-sell-product');
              }}
            >
              <Text style={styles.modalButtonText}>Aquarium Equipment</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={() => setSellModalVisible(false)}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#eef8f5' },

  bgTopBlob: {
    position: 'absolute',
    top: -120,
    right: -70,
    width: 240,
    height: 240,
    borderRadius: 130,
    backgroundColor: 'rgba(20, 184, 166, 0.16)',
  },

  bgBottomBlob: {
    position: 'absolute',
    bottom: -140,
    left: -90,
    width: 260,
    height: 260,
    borderRadius: 140,
    backgroundColor: 'rgba(34, 197, 94, 0.16)',
  },

  headerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 12,
    marginTop: 16,
    marginBottom: 10,
    padding: 12,
    borderRadius: 16,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#dbeee8',
    elevation: 3,
  },

  headerTextWrap: { marginLeft: 10, flex: 1 },

  backButton: {
    padding: 9,
    backgroundColor: '#ffffff',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#dbeee8',
  },

  title: {
    fontSize: 22,
    fontFamily: 'outfits-extrabold',
    color: '#0f172a',
  },

  subtitle: {
    marginTop: 2,
    fontFamily: 'outfits',
    fontSize: 13,
    color: '#475569',
  },

  toggleContainer: {
    flexDirection: 'row',
    marginHorizontal: 12,
    marginBottom: 8,
    gap: 8,
  },

  toggleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 11,
    backgroundColor: '#e6f8f1',
    borderWidth: 1,
    borderColor: '#bfe8d8',
    gap: 6,
  },

  toggleButtonActive: {
    backgroundColor: '#0f766e',
    borderColor: '#0f766e',
  },

  toggleText: {
    fontSize: 13,
    fontFamily: 'outfits-medium',
    color: '#0f766e',
  },

  toggleTextActive: { color: '#fff' },

  contentWrapper: { flex: 1 },

  buttonContainer: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingBottom: 14,
    paddingTop: 10,
    gap: 8,
    backgroundColor: '#f8fffc',
    borderTopWidth: 1,
    borderTopColor: '#dbeee8',
  },

  sellButton: {
    flex: 1,
    backgroundColor: '#0f766e',
    paddingVertical: 11,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    elevation: 2,
  },

  sellAction: { backgroundColor: '#15803d' },

  sellButtonText: {
    fontSize: 12,
    fontFamily: 'outfits-medium',
    color: '#fff',
  },

  /* Modal Styles */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },

  modalContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },

  modalTitle: {
    fontSize: 18,
    fontFamily: 'outfits-bold',
    marginBottom: 15,
    textAlign: 'center',
  },

  modalButton: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },

  modalButtonText: {
    fontSize: 16,
    textAlign: 'center',
    fontFamily: 'outfits-medium',
  },

  cancelButton: { marginTop: 10 },

  cancelText: {
    fontSize: 16,
    textAlign: 'center',
    color: 'red',
    fontFamily: 'outfits-medium',
  },
});