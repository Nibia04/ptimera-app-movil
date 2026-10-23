import React from 'react';
import { ScrollView, Text } from 'react-native';
import { COLORS } from '../../theme';
import Titulo from '../titulo';

export default function SolicitudesScreen({ requests = [], onSelect, onCreate }) {
  return <ScrollView contentContainerStyle={{ padding: 22, paddingBottom: 110 }}><Titulo texto="Solicitudes" subtitulo="Consulta y crea solicitudes para tu establecimiento." /><Text onPress={onCreate} style={{ backgroundColor: COLORS.gold, color: COLORS.navy, padding: 15, borderRadius: 11, textAlign: 'center', fontWeight: '800', marginBottom: 18 }}>+ Nueva solicitud</Text>{requests.map(item => <Text key={item.id} onPress={() => onSelect(item)} style={{ backgroundColor: '#fff', borderColor: COLORS.border, borderWidth: 1, borderRadius: 14, padding: 16, marginBottom: 10, color: COLORS.navy, fontWeight: '800' }}>{item.code}{'\n'}<Text style={{ fontWeight: '600', color: COLORS.text }}>{item.type} · {item.date}</Text>{'\n'}<Text style={{ color: COLORS.goldDark, fontSize: 12 }}>{item.status}</Text></Text>)}</ScrollView>;
}
