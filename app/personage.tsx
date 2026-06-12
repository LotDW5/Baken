import React, { useState } from 'react';
import { View, Text, SafeAreaView, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';
import useAppTheme from '@/hooks/use-app-theme';

export default function PersonageScreen() {
  const navigation = useNavigation();
  const theme = useAppTheme();

  const HEADS = [
    { name: 'Hoofd bruin', src: require('../assets/personage/hoofdbruin.png') },
    { name: 'Hoofd donker', src: require('../assets/personage/hoofddonker.png') },
    { name: 'Hoofd wit', src: require('../assets/personage/hoofdwit.png') },
  ];
  const HAIRS = [
    { name: 'Lang', src: require('../assets/personage/langhaarbruin.png') },
    { name: 'Lang donker', src: require('../assets/personage/langhaardonker.png') },
    { name: 'Lang wit', src: require('../assets/personage/langhaarwit.png') },
  ];
  const TOPS = [
    { name: 'Vest', src: require('../assets/personage/bovenstuk1.png') },
    { name: 'Shirt', src: require('../assets/personage/bovenstuk2.png') },
    { name: 'Hemd', src: require('../assets/personage/bovenstuk3.png') },
  ];
  const BOTTOMS = [
    { name: 'Onderstuk', src: require('../assets/personage/onderstuk1.png') },
  ];
  const SHOES = [
    { name: 'Schoenen', src: require('../assets/personage/schoenen1.png') },
  ];

  const [headIndex, setHeadIndex] = useState(0);
  const [hairIndex, setHairIndex] = useState(0);
  const [topIndex, setTopIndex] = useState(0);
  const [bottomIndex, setBottomIndex] = useState(0);
  const [shoesIndex, setShoesIndex] = useState(0);
  const [activePart, setActivePart] = useState<string | null>(null);

  const cycle = (idx: number, max: number, delta: number) => (idx + delta + max) % max;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={{ paddingHorizontal: 24, paddingTop: 40, flex: 1 }}>
        <Text style={[styles.title, { color: COLORS.foreground }]}>Maak jouw personage aan</Text>

        <View style={styles.avatarPreviewContainer}>
          <View style={styles.avatarPreviewInner}>
            <Image source={BOTTOMS[bottomIndex].src} style={[styles.avatarBottomImage, { position: 'absolute' }]} resizeMode="contain" />
            <Image source={TOPS[topIndex].src} style={[styles.avatarTopImage, { position: 'absolute' }]} resizeMode="contain" />
            <Image source={HEADS[headIndex].src} style={[styles.avatarHeadImage, { position: 'absolute' }]} resizeMode="contain" />
            <Image source={HAIRS[hairIndex].src} style={[styles.avatarHairImage, { position: 'absolute' }]} resizeMode="contain" />
            <Image source={SHOES[shoesIndex].src} style={[styles.avatarShoesImage, { position: 'absolute' }]} resizeMode="contain" />

            {/* head arrows */}
            <TouchableOpacity
              style={[styles.arrowButton, activePart === 'head' ? styles.arrowButtonActive : {}, { left: -24, top: 22 }]}
              onPress={() => { setHeadIndex(cycle(headIndex, HEADS.length, -1)); setActivePart('head'); setTimeout(() => setActivePart(null), 300); }}
            >
              <Ionicons name="chevron-back" size={20} color={activePart === 'head' ? '#fff' : COLORS.mutedForeground} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.arrowButton, activePart === 'head' ? styles.arrowButtonActive : {}, { right: -24, top: 22 }]}
              onPress={() => { setHeadIndex(cycle(headIndex, HEADS.length, 1)); setActivePart('head'); setTimeout(() => setActivePart(null), 300); }}
            >
              <Ionicons name="chevron-forward" size={20} color={activePart === 'head' ? '#fff' : COLORS.mutedForeground} />
            </TouchableOpacity>

            {/* top arrows */}
            <TouchableOpacity
              style={[styles.arrowButton, activePart === 'top' ? styles.arrowButtonActive : {}, { left: -24, top: 160 }]}
              onPress={() => { setTopIndex(cycle(topIndex, TOPS.length, -1)); setActivePart('top'); setTimeout(() => setActivePart(null), 300); }}
            >
              <Ionicons name="chevron-back" size={20} color={activePart === 'top' ? '#fff' : COLORS.mutedForeground} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.arrowButton, activePart === 'top' ? styles.arrowButtonActive : {}, { right: -24, top: 160 }]}
              onPress={() => { setTopIndex(cycle(topIndex, TOPS.length, 1)); setActivePart('top'); setTimeout(() => setActivePart(null), 300); }}
            >
              <Ionicons name="chevron-forward" size={20} color={activePart === 'top' ? '#fff' : COLORS.mutedForeground} />
            </TouchableOpacity>

            {/* bottom arrows */}
            <TouchableOpacity
              style={[styles.arrowButton, activePart === 'bottom' ? styles.arrowButtonActive : {}, { left: -24, top: 260 }]}
              onPress={() => { setBottomIndex(cycle(bottomIndex, BOTTOMS.length, -1)); setActivePart('bottom'); setTimeout(() => setActivePart(null), 300); }}
            >
              <Ionicons name="chevron-back" size={20} color={activePart === 'bottom' ? '#fff' : COLORS.mutedForeground} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.arrowButton, activePart === 'bottom' ? styles.arrowButtonActive : {}, { right: -24, top: 260 }]}
              onPress={() => { setBottomIndex(cycle(bottomIndex, BOTTOMS.length, 1)); setActivePart('bottom'); setTimeout(() => setActivePart(null), 300); }}
            >
              <Ionicons name="chevron-forward" size={20} color={activePart === 'bottom' ? '#fff' : COLORS.mutedForeground} />
            </TouchableOpacity>

            {/* shoes arrows */}
            <TouchableOpacity
              style={[styles.arrowButton, activePart === 'shoes' ? styles.arrowButtonActive : {}, { left: -24, top: 340 }]}
              onPress={() => { setShoesIndex(cycle(shoesIndex, SHOES.length, -1)); setActivePart('shoes'); setTimeout(() => setActivePart(null), 300); }}
            >
              <Ionicons name="chevron-back" size={20} color={activePart === 'shoes' ? '#fff' : COLORS.mutedForeground} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.arrowButton, activePart === 'shoes' ? styles.arrowButtonActive : {}, { right: -24, top: 340 }]}
              onPress={() => { setShoesIndex(cycle(shoesIndex, SHOES.length, 1)); setActivePart('shoes'); setTimeout(() => setActivePart(null), 300); }}
            >
              <Ionicons name="chevron-forward" size={20} color={activePart === 'shoes' ? '#fff' : COLORS.mutedForeground} />
            </TouchableOpacity>

          </View>
        </View>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.white },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 12 },
  avatarPreviewContainer: { alignItems: 'center', marginTop: 8 },
  avatarPreviewInner: { width: 220, height: 540, alignItems: 'center', justifyContent: 'flex-start', position: 'relative' },
  avatarHeadImage: { width: 160, height: 160, top: 6, alignSelf: 'center', zIndex: 6 },
  avatarHairImage: { width: 180, height: 140, top: 2, alignSelf: 'center', zIndex: 7 },
  avatarTopImage: { width: 170, height: 140, top: 120, alignSelf: 'center', zIndex: 4 },
  avatarBottomImage: { width: 170, height: 240, top: 220, alignSelf: 'center', zIndex: 3 },
  avatarShoesImage: { width: 170, height: 90, top: 420, alignSelf: 'center', zIndex: 8 },
  arrowButton: { position: 'absolute', width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(0,0,0,0.03)', alignItems: 'center', justifyContent: 'center' },
  arrowButtonActive: { backgroundColor: COLORS.background, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 8, elevation: 6 },
});
