import React from 'react';
import { View, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';

interface AssetItem { name: string; src: any }

interface Props {
  heads: AssetItem[];
  hairs: AssetItem[];
  tops: AssetItem[];
  bottoms: AssetItem[];
  shoes: AssetItem[];
  headIndex: number;
  setHeadIndex: (n: number) => void;
  hairIndex: number;
  setHairIndex: (n: number) => void;
  topIndex: number;
  setTopIndex: (n: number) => void;
  bottomIndex: number;
  setBottomIndex: (n: number) => void;
  shoesIndex: number;
  setShoesIndex: (n: number) => void;
  activePart?: string | null;
  setActivePart?: (s: string | null) => void;
}

export default function PersonageView(props: Props) {
  const { heads, hairs, tops, bottoms, shoes } = props;
  const { headIndex, setHeadIndex, hairIndex, setHairIndex, topIndex, setTopIndex, bottomIndex, setBottomIndex, shoesIndex, setShoesIndex } = props;
  const activePart = props.activePart ?? null;
  const setActivePart = props.setActivePart ?? (() => {});

  const cycle = (idx: number, max: number, delta: number) => (idx + delta + max) % max;
  // Try to use composite assets when available (style + skin + top)
  const SKIN_KEYS = ['bruin', 'donker', 'wit'];
  const TOP_KEYS = ['vest', 'shirt', 'hemd'];
  // head composites by style
  const HEAD_COMPOSITE: any = {
    lang: {
      bruin: require('../../assets/personage/hoofd-lang-bruin.png'),
      donker: require('../../assets/personage/hoofd-lang-donker.png'),
      wit: require('../../assets/personage/hoofd-lang-wit.png'),
    },
    krullen: {
      bruin: require('../../assets/personage/hoofd-krullen-bruin.png'),
      donker: require('../../assets/personage/hoofd-krullen-donker.png'),
      wit: require('../../assets/personage/hoofd-krullen-wit.png'),
    },
    kort: {
      bruin: require('../../assets/personage/hoofd-kort-bruin.png'),
      donker: require('../../assets/personage/hoofd-kort-donker.png'),
      wit: require('../../assets/personage/hoofd-kort-wit.png'),
    }
  };

  const TOP_COMPOSITE: any = {
    lang: {
      bruin: {
        vest: require('../../assets/personage/lang-bruin-vest.png'),
        shirt: require('../../assets/personage/lang-bruin-shirt.png'),
        hemd: require('../../assets/personage/lang-bruin-hemd.png'),
      },
      donker: {
        vest: require('../../assets/personage/lang-donker-vest.png'),
        shirt: require('../../assets/personage/lang-donker-shirt.png'),
        hemd: require('../../assets/personage/lang-donker-hemd.png'),
      },
      wit: {
        vest: require('../../assets/personage/lang-wit-vest.png'),
        shirt: require('../../assets/personage/lang-wit-shirt.png'),
        hemd: require('../../assets/personage/lang-wit-hemd.png'),
      }
    },
    krullen: {
      bruin: {
        vest: require('../../assets/personage/krullen-bruin-vest.png'),
        shirt: require('../../assets/personage/krullen-bruin-shirt.png'),
        hemd: require('../../assets/personage/krullen-bruin-hemd.png'),
      },
      donker: {
        vest: require('../../assets/personage/krullen-donker-vest.png'),
        shirt: require('../../assets/personage/krullen-donker-shirt.png'),
        hemd: require('../../assets/personage/krullen-donker-hemd.png'),
      },
      wit: {
        vest: require('../../assets/personage/krullen-wit-vest.png'),
        shirt: require('../../assets/personage/krullen-wit-shirt.png'),
        hemd: require('../../assets/personage/krullen-wit-hemd.png'),
      }
    },
    kort: {
      bruin: {
        vest: require('../../assets/personage/kort-bruin-vest.png'),
        shirt: require('../../assets/personage/kort-bruin-shirt.png'),
        hemd: require('../../assets/personage/kort-bruin-hemd.png'),
      },
      donker: {
        vest: require('../../assets/personage/kort-donker-vest.png'),
        shirt: require('../../assets/personage/kort-donker-shirt.png'),
        hemd: require('../../assets/personage/kort-donker-hemd.png'),
      },
      wit: {
        vest: require('../../assets/personage/kort-wit-vest.png'),
        shirt: require('../../assets/personage/kort-wit-shirt.png'),
        hemd: require('../../assets/personage/kort-wit-hemd.png'),
      }
    }
  };

  return (
    <View style={styles.avatarPreviewContainer}>
      <View style={styles.avatarPreviewInner}>
        <Image source={bottoms[bottomIndex].src} style={[styles.avatarBottomImage, { position: 'absolute' }]} resizeMode="contain" />
        {/* prefer composite top/head assets if available */}
        <Image
          source={(function() {
            try {
              const skin = SKIN_KEYS[headIndex] || 'bruin';
              const style = 'lang'; // onboarding hair set is long; use 'lang' composite
              const topKey = TOP_KEYS[topIndex] || 'shirt';
              return TOP_COMPOSITE[style]?.[skin]?.[topKey] || tops[topIndex].src;
            } catch (e) { return tops[topIndex].src; }
          })()}
          style={[styles.avatarTopImage, { position: 'absolute' }]}
          resizeMode="contain"
        />
        <Image
          source={(function() {
            try {
              const skin = SKIN_KEYS[headIndex] || 'bruin';
              const style = 'lang';
              return HEAD_COMPOSITE[style]?.[skin] || heads[headIndex].src;
            } catch (e) { return heads[headIndex].src; }
          })()}
          style={[styles.avatarHeadImage, { position: 'absolute' }]}
          resizeMode="contain"
        />
        <Image source={hairs[hairIndex].src} style={[styles.avatarHairImage, { position: 'absolute' }]} resizeMode="contain" />
        <Image source={shoes[shoesIndex].src} style={[styles.avatarShoesImage, { position: 'absolute' }]} resizeMode="contain" />

        <TouchableOpacity
          style={[styles.arrowButton, activePart === 'head' ? styles.arrowButtonActive : {}, { left: -24, top: 22 }]}
          onPress={() => { setHeadIndex(cycle(headIndex, heads.length, -1)); setActivePart('head'); setTimeout(() => setActivePart(null), 300); }}
        >
          <Ionicons name="chevron-back" size={20} color={activePart === 'head' ? '#fff' : COLORS.mutedForeground} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.arrowButton, activePart === 'head' ? styles.arrowButtonActive : {}, { right: -24, top: 22 }]}
          onPress={() => { setHeadIndex(cycle(headIndex, heads.length, 1)); setActivePart('head'); setTimeout(() => setActivePart(null), 300); }}
        >
          <Ionicons name="chevron-forward" size={20} color={activePart === 'head' ? '#fff' : COLORS.mutedForeground} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.arrowButton, activePart === 'top' ? styles.arrowButtonActive : {}, { left: -24, top: 160 }]}
          onPress={() => { setTopIndex(cycle(topIndex, tops.length, -1)); setActivePart('top'); setTimeout(() => setActivePart(null), 300); }}
        >
          <Ionicons name="chevron-back" size={20} color={activePart === 'top' ? '#fff' : COLORS.mutedForeground} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.arrowButton, activePart === 'top' ? styles.arrowButtonActive : {}, { right: -24, top: 160 }]}
          onPress={() => { setTopIndex(cycle(topIndex, tops.length, 1)); setActivePart('top'); setTimeout(() => setActivePart(null), 300); }}
        >
          <Ionicons name="chevron-forward" size={20} color={activePart === 'top' ? '#fff' : COLORS.mutedForeground} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.arrowButton, activePart === 'bottom' ? styles.arrowButtonActive : {}, { left: -24, top: 260 }]}
          onPress={() => { setBottomIndex(cycle(bottomIndex, bottoms.length, -1)); setActivePart('bottom'); setTimeout(() => setActivePart(null), 300); }}
        >
          <Ionicons name="chevron-back" size={20} color={activePart === 'bottom' ? '#fff' : COLORS.mutedForeground} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.arrowButton, activePart === 'bottom' ? styles.arrowButtonActive : {}, { right: -24, top: 260 }]}
          onPress={() => { setBottomIndex(cycle(bottomIndex, bottoms.length, 1)); setActivePart('bottom'); setTimeout(() => setActivePart(null), 300); }}
        >
          <Ionicons name="chevron-forward" size={20} color={activePart === 'bottom' ? '#fff' : COLORS.mutedForeground} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.arrowButton, activePart === 'shoes' ? styles.arrowButtonActive : {}, { left: -24, top: 340 }]}
          onPress={() => { setShoesIndex(cycle(shoesIndex, shoes.length, -1)); setActivePart('shoes'); setTimeout(() => setActivePart(null), 300); }}
        >
          <Ionicons name="chevron-back" size={20} color={activePart === 'shoes' ? '#fff' : COLORS.mutedForeground} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.arrowButton, activePart === 'shoes' ? styles.arrowButtonActive : {}, { right: -24, top: 340 }]}
          onPress={() => { setShoesIndex(cycle(shoesIndex, shoes.length, 1)); setActivePart('shoes'); setTimeout(() => setActivePart(null), 300); }}
        >
          <Ionicons name="chevron-forward" size={20} color={activePart === 'shoes' ? '#fff' : COLORS.mutedForeground} />
        </TouchableOpacity>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
