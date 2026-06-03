import { Platform } from 'react-native';

type ShadowOpts = {
  color?: string;
  opacity?: number;
  radius?: number;
  offsetX?: number;
  offsetY?: number;
  elevation?: number;
};
function applyShadow({
  color = '#000',
  opacity = 0.08,
  radius = 8,
  offsetX = 0,
  offsetY = 2,
  elevation = 2,
}: ShadowOpts = {}) {
  if (Platform.OS === 'web') {
    const blur = Math.max(1, Math.round(radius));
    const a = opacity;
    return {
      boxShadow: `${offsetX}px ${offsetY}px ${blur}px rgba(0,0,0,${a})`,
    } as any;
  }

  return {
    shadowColor: color,
    shadowOpacity: opacity,
    shadowRadius: radius,
    shadowOffset: { width: offsetX, height: offsetY },
    elevation: elevation,
  } as any;
}

export default applyShadow;
