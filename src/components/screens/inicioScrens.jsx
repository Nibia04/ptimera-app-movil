import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { COLORS } from '../../theme';
import Titulo from '../titulo';
export default function InicioScreen({ user, requests = [], onNavigate }) {
  const count = status => requests.filter(item => item.status === status).length;
  return <ScrollView contentContainerStyle={{ padding: 22, paddingBottom: 110 }}>
    <Titulo texto={`Hola, ${user.firstName}`} subtitulo="Aquí tienes el resumen de tu operación." />
    <View style={{ backgroundColor: COLORS.navy, borderRadius: 18, padding: 20, marginBottom: 24 }}><Text style={{ color: COLORS.goldLight, fontSize: 10, fontWeight: '800', letterSpacing: 1 }}>ESTABLECIMIENTO ACTIVO</Text><Text style={{ color: '#fff', fontSize: 22, fontWeight: '800', marginTop: 9 }}>{user.establishment}</Text></View>
    <Text style={{ color: COLORS.navy, fontWeight: '800', fontSize: 17, marginBottom: 13 }}>Resumen de solicitudes</Text>
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>{[['Pendientes', 'Pendiente'], ['En revisión', 'En revisión'], ['Aprobadas', 'Aprobada'], ['Rechazadas', 'Rechazada']].map(([label, status]) => <View key={status} style={{ backgroundColor: '#fff', borderRadius: 14, padding: 14, width: '48%', minHeight: 92, borderWidth: 1, borderColor: COLORS.border }}><Text style={{ color: COLORS.navy, fontSize: 25, fontWeight: '800' }}>{count(status)}</Text><Text style={{ color: COLORS.muted, fontSize: 12, marginTop: 4 }}>{label}</Text></View>)}</View>
  </ScrollView>;
}
