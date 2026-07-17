import React, { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet } from 'react-native';

export default function Tile({ color, highlighted, owner, onPress, size }) {
  const pulse = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    if (highlighted) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulse, { toValue: 1.12, duration: 260, useNativeDriver: true }),
          Animated.timing(pulse, { toValue: 1, duration: 260, useNativeDriver: true }),
        ])
      ).start();
    } else {
      pulse.stopAnimation();
      pulse.setValue(1);
    }
  }, [highlighted]);
  return (
    <Pressable onPress={onPress}>
      <Animated.View style={[styles.tile, { width: size, height: size, backgroundColor: color, transform: [{ scale: pulse }], borderWidth: highlighted ? 4 : owner ? 3 : 1, borderColor: highlighted ? '#fff' : owner ? '#111' : 'rgba(255,255,255,.45)' }]} />
    </Pressable>
  );
}
const styles = StyleSheet.create({ tile: { borderRadius: 12, margin: 2, elevation: 4 } });
