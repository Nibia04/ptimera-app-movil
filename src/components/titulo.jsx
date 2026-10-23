import React from 'react';
import { Text, View } from 'react-native';
import { COLORS } from '../theme';

export default function Titulo({ texto, subtitulo, eyebrow = 'BARRICA' }) {
  return (
    <View style={{ marginBottom: 22 }}>
      <Text style={{ color: COLORS.goldDark, fontSize: 11, fontWeight: '800', letterSpacing: 1.6, marginBottom: 7 }}>{eyebrow}</Text>
      <Text style={{ color: COLORS.navy, fontSize: 30, fontWeight: '800' }}>{texto}</Text>
      {subtitulo ? <Text style={{ color: COLORS.muted, fontSize: 14, marginTop: 7, lineHeight: 20 }}>{subtitulo}</Text> : null}
    </View>
  );
}
