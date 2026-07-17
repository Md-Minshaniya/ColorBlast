import React from 'react';
import { StyleSheet, View } from 'react-native';
import { COLORS } from '../theme/colors';

export default function GradientBackground({ children }) {
  return <View style={styles.bg}>{children}</View>;
}
const styles = StyleSheet.create({
  bg: { flex: 1, backgroundColor: COLORS.bg1, padding: 18 },
});
