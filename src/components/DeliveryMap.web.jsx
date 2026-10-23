import React from 'react';
import { Text, View } from 'react-native';

export default function DeliveryMap() {
  return (
    <View style={{ height: 150, borderRadius: 14, backgroundColor: '#E7EEF2', marginBottom: 16, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#E5E8ED' }}>
      <Text style={{ color: '#9C7224', fontSize: 30 }}>⌖</Text>
      <Text style={{ color: '#17263D', fontSize: 14, fontWeight: '800', marginTop: 5 }}>Mapa de entrega</Text>
      <Text style={{ color: '#7D8795', fontSize: 11, marginTop: 3 }}>Disponible en Android y iOS</Text>
    </View>
  );
}
