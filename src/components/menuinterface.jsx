import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../theme';

const options = [
  ['home', 'Inicio', '⌂'],
  ['requests', 'Solicitudes', '▤'],
  ['orders', 'Pedidos', '◈'],
  ['records', 'Registros', '◷'],
  ['review', 'Revisión', '✓'],
  ['notifications', 'Avisos', '♪'],
  ['profile', 'Perfil', '○'],
];

export default function MenuInterface({ active, onSelect, isReviewer }) {
  return (
    <View style={styles.nav}>
      {options.filter(([key]) => key !== 'review' || isReviewer).map(([key, label, icon]) => (
        <Pressable key={key} onPress={() => onSelect(key)} style={[styles.item, active === key && styles.active]}>
          <Text style={[styles.icon, active === key && styles.selected]}>{icon}</Text>
          <Text style={[styles.label, active === key && styles.selected]}>{label}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  nav: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 75, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: COLORS.border, flexDirection: 'row', justifyContent: 'space-around', paddingTop: 9, paddingBottom: 6 },
  item: { alignItems: 'center', minWidth: 55 },
  active: { borderTopWidth: 2, borderTopColor: COLORS.gold, marginTop: -9, paddingTop: 7 },
  icon: { color: COLORS.muted, fontSize: 21, height: 27 },
  label: { color: COLORS.muted, fontSize: 10, fontWeight: '700' },
  selected: { color: COLORS.goldDark },
});
