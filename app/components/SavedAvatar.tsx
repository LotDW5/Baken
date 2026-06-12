import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { Image, ImageStyle } from 'react-native';

type AvatarData = {
  hair?: string | null;
  skin?: string | null;
  clothing?: string | null;
  composite?: string | null;
};

const Fallback = require('../../assets/personage/Personage.png');

function getCompositeByKeys(hair?: string | null, skin?: string | null, clothing?: string | null) {
  try {
    const h = hair || 'krullen';
    const s = skin || 'wit';
    const c = clothing || 'vest';
    // map combinations to requires (explicit so Metro picks them up)
    const map: any = {
      krullen: {
        wit: {
          vest: require('../../assets/personage/krullen-wit-vest.png'),
          shirt: require('../../assets/personage/krullen-wit-shirt.png'),
          hemd: require('../../assets/personage/krullen-wit-hemd.png'),
        },
        bruin: {
          vest: require('../../assets/personage/krullen-bruin-vest.png'),
          shirt: require('../../assets/personage/krullen-bruin-shirt.png'),
          hemd: require('../../assets/personage/krullen-bruin-hemd.png'),
        },
        donker: {
          vest: require('../../assets/personage/krullen-donker-vest.png'),
          shirt: require('../../assets/personage/krullen-donker-shirt.png'),
          hemd: require('../../assets/personage/krullen-donker-hemd.png'),
        }
      },
      kort: {
        wit: {
          vest: require('../../assets/personage/kort-wit-vest.png'),
          shirt: require('../../assets/personage/kort-wit-shirt.png'),
          hemd: require('../../assets/personage/kort-wit-hemd.png'),
        },
        bruin: {
          vest: require('../../assets/personage/kort-bruin-vest.png'),
          shirt: require('../../assets/personage/kort-bruin-shirt.png'),
          hemd: require('../../assets/personage/kort-bruin-hemd.png'),
        },
        donker: {
          vest: require('../../assets/personage/kort-donker-vest.png'),
          shirt: require('../../assets/personage/kort-donker-shirt.png'),
          hemd: require('../../assets/personage/kort-donker-hemd.png'),
        }
      },
      lang: {
        wit: {
          vest: require('../../assets/personage/lang-wit-vest.png'),
          shirt: require('../../assets/personage/lang-wit-shirt.png'),
          hemd: require('../../assets/personage/lang-wit-hemd.png'),
        },
        bruin: {
          vest: require('../../assets/personage/lang-bruin-vest.png'),
          shirt: require('../../assets/personage/lang-bruin-shirt.png'),
          hemd: require('../../assets/personage/lang-bruin-hemd.png'),
        },
        donker: {
          vest: require('../../assets/personage/lang-donker-vest.png'),
          shirt: require('../../assets/personage/lang-donker-shirt.png'),
          hemd: require('../../assets/personage/lang-donker-hemd.png'),
        }
      }
    };
    return map[h]?.[s]?.[c] || Fallback;
  } catch (e) {
    return Fallback;
  }
}

export default function SavedAvatar({ style }: { style?: ImageStyle }) {
  const [src, setSrc] = useState<any>(Fallback);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem('user_data');
        if (!raw) { setSrc(Fallback); return; }
        const parsed: AvatarData = JSON.parse(raw)?.avatar || JSON.parse(raw) || {};
        // parsed might be { composite: 'krullen-wit-vest.png' } or keys
        if (parsed?.composite) {
          const parts = String(parsed.composite).replace('.png', '').split('-');
          const [hair, skin, clothing] = parts;
          setSrc(getCompositeByKeys(hair, skin, clothing));
          return;
        }
        setSrc(getCompositeByKeys(parsed?.hair, parsed?.skin, parsed?.clothing));
      } catch (e) { setSrc(Fallback); }
    })();
  }, []);

  return <Image source={src} style={style} resizeMode="contain" />;
}
