import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { Image, ImageStyle } from 'react-native';

const Fallback = require('../../assets/personage/Personage.png');

function getHeadByKeys(hair?: string | null, skin?: string | null) {
  try {
    const h = hair || 'krullen';
    const s = skin || 'wit';
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

    // try fallbacks
    if (map[h] && map[h].wit) return map[h].wit;
    return Fallback;
  } catch (e) {
    return Fallback;
  }
}

export default function HeadAvatar({ style }: { style?: ImageStyle }) {
  const [src, setSrc] = useState<any>(Fallback);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem('user_data');
        if (!raw) { setSrc(Fallback); return; }
        const parsed = JSON.parse(raw)?.avatar || JSON.parse(raw) || {};
        if (parsed?.composite) {
          const parts = String(parsed.composite).replace('.png', '').split('-');
          const [hair, skin] = parts;
          setSrc(getHeadByKeys(hair, skin));
          return;
        }
        setSrc(getHeadByKeys(parsed?.hair, parsed?.skin));
      } catch (e) { setSrc(Fallback); }
    })();
  }, []);

  return <Image source={src} style={style} resizeMode="contain" />;
}
