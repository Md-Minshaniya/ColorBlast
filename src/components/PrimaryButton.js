import React from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';
import { COLORS } from '../theme/colors';

export default function PrimaryButton({ title, onPress, variant = 'pink' }) {
  const backgroundColor = variant === 'cyan' ? COLORS.cyan : variant === 'green' ? COLORS.green : COLORS.pink;
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.btn, { backgroundColor, transform: [{ scale: pressed ? 0.96 : 1 }] }]}>
      <Text style={styles.text}>{title}</Text>
    </Pressable>
  );
}
const styles = StyleSheet.create({
  btn: { paddingVertical: 15, paddingHorizontal: 24, borderRadius: 20, marginVertical: 8, elevation: 6, shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 8 },
  text: { color: COLORS.white, fontSize: 18, fontWeight: '900', textAlign: 'center' },
});
