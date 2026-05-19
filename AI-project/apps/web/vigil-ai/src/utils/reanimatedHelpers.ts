import { Platform, View } from 'react-native';
import Animated, { useAnimatedStyle as useReanimatedAnimatedStyle } from 'react-native-reanimated';

export const AnimatedView = Platform.OS === 'web' ? View : Animated.View;

export function useAnimatedStyle<T extends object>(factory: () => T): T {
  if (Platform.OS === 'web') {
    return {} as T;
  }
  return useReanimatedAnimatedStyle(factory) as T;
}
