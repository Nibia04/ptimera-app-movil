import React, { useEffect, useState } from 'react';
import { Linking, Pressable, Text, View } from 'react-native';
import { COLORS } from '../theme';
import { reintentarPasos, suscribirPasos } from '../services/pasos';

const META_PASOS = 10000;

export default function ContadorPasos() {
  const [{ pasos, modo }, setEstado] = useState({ pasos: 0, modo: 'cargando' });

  useEffect(() => suscribirPasos(setEstado), []);

  const progreso = Math.min(pasos / META_PASOS, 1);

  return <View style={{ backgroundColor: '#fff', borderRadius: 18, padding: 20, marginBottom: 24, borderWidth: 1, borderColor: COLORS.border }}>
    <Text style={{ color: COLORS.gold, fontSize: 10, fontWeight: '800', letterSpacing: 1 }}>PASOS DE HOY</Text>
    {modo === 'cargando' && <Text style={{ color: COLORS.muted, fontSize: 13, marginTop: 9 }}>Conectando con el sensor…</Text>}
    {modo === 'no-disponible' && <Text style={{ color: COLORS.muted, fontSize: 13, marginTop: 9 }}>El contador de pasos no está disponible en este dispositivo.</Text>}
    {(modo === 'podometro' || modo === 'acelerometro') && <>
      <Text style={{ color: COLORS.navy, fontSize: 34, fontWeight: '800', marginTop: 6 }}>{pasos.toLocaleString('es')}</Text>
      <View style={{ height: 8, borderRadius: 4, backgroundColor: COLORS.cream, marginTop: 12, overflow: 'hidden' }}>
        <View style={{ width: `${progreso * 100}%`, height: '100%', backgroundColor: COLORS.gold }} />
      </View>
      <Text style={{ color: COLORS.muted, fontSize: 12, marginTop: 6 }}>Meta: {META_PASOS.toLocaleString('es')} pasos</Text>
    </>}
    {modo === 'acelerometro' && <>
      <Text style={{ color: COLORS.muted, fontSize: 11, marginTop: 8 }}>Conteo aproximado: falta el permiso de actividad física.</Text>
      <View style={{ flexDirection: 'row', gap: 16, marginTop: 8 }}>
        <Pressable onPress={() => Linking.openSettings()}><Text style={{ color: COLORS.gold, fontWeight: '800', fontSize: 12 }}>Abrir ajustes</Text></Pressable>
        <Pressable onPress={reintentarPasos}><Text style={{ color: COLORS.gold, fontWeight: '800', fontSize: 12 }}>Reintentar</Text></Pressable>
      </View>
    </>}
  </View>;
}
