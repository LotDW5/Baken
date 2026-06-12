import { onThemeChange } from '@/utils/theme-events';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { Image, ImageStyle } from 'react-native';

const Fallback = require('../../assets/personage/hoofd-krullen-wit.png');

function normalizeKey(v?: string | null) {
  if (!v) return '';
  return String(v).toLowerCase().trim();
}

function getHeadByKeys(hair?: string | null, skin?: string | null) {
  try {
    const h = normalizeKey(hair) || 'krullen';
    const s = normalizeKey(skin) || 'wit';
    const map: any = {
      krullen: {
        wit: require('../../assets/personage/hoofd-krullen-wit.png'),
        bruin: require('../../assets/personage/hoofd-krullen-bruin.png'),
        donker: (
          // prefer explicit files if available
          require('../../assets/personage/hoofd-krullen-donker.png')
        ),
        'donker-1': require('../../assets/personage/hoofd-krullen-donker-1.png'),
        'donker-2': require('../../assets/personage/hoofd-krullen-donker-2.png'),
      },
      kort: {
        wit: require('../../assets/personage/hoofd-kort-wit.png'),
        bruin: require('../../assets/personage/hoofd-kort-bruin.png'),
      },
      lang: {
        wit: require('../../assets/personage/hoofd-lang-wit.png'),
        bruin: require('../../assets/personage/hoofd-lang-bruin.png'),
      },
    };

    // direct match
    if (map[h] && map[h][s]) return map[h][s];

    // try common fallbacks
    if (map[h]) {
      if (map[h].wit) return map[h].wit;
      const firstSkin = Object.keys(map[h])[0];
      if (firstSkin) return map[h][firstSkin];
    }

    // try to find any head matching the skin across hair styles
    for (const hh of Object.keys(map)) {
      if (map[hh] && map[hh][s]) return map[hh][s];
    }

    return Fallback;
  } catch (e) {
    return Fallback;
  }
}

export default function HeadAvatar({ style }: { style?: ImageStyle }) {
  const [src, setSrc] = useState<any>(Fallback);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const raw = await AsyncStorage.getItem('user_data');
        if (!raw) { if (mounted) setSrc(Fallback); return; }
        const data = JSON.parse(raw) || {};
        // avatar may be nested under .avatar or the root may already be the avatar
        const avatar = data.avatar || data;

        // handle composite filename like 'krullen-wit-vest.png'
        if (avatar?.composite) {
          const parts = String(avatar.composite).replace('.png', '').split('-').map(normalizeKey);
          const hair = parts[0];
          const skin = parts[1];
          if (mounted) setSrc(getHeadByKeys(hair, skin));
          return;
        }

        // handle direct hair/skin keys
        const hairKey = avatar?.hair ?? avatar?.head ?? null;
        const skinKey = avatar?.skin ?? null;
        if (hairKey || skinKey) {
          if (mounted) setSrc(getHeadByKeys(hairKey, skinKey));
          return;
        }

        // nothing usable found — keep fallback and log for debugging
        // eslint-disable-next-line no-console
        console.warn('[HeadAvatar] no avatar data found in storage', data);
        if (mounted) setSrc(Fallback);
      } catch (e) { if (mounted) setSrc(Fallback); }
    };

    load();

    const unsub = onThemeChange(() => {
      // re-load avatar when onboarding emits theme change after saving
      load();
    });

    return () => { mounted = false; unsub(); };
  }, []);

  return <Image source={src} style={style} resizeMode="contain" />;
}
