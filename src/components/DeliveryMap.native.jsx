import React from 'react';
import { View, Text } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

export default function DeliveryMap({ coordinate, onSelect }) {
  const region = { ...coordinate, latitudeDelta: 0.035, longitudeDelta: 0.035 };

  return (
    <View style={{ height: 210, borderRadius: 14, overflow: 'hidden', marginBottom: 16, borderWidth: 1, borderColor: '#E5E8ED' }}>
      <MapView
        style={{ flex: 1 }}
        initialRegion={region}
        onPress={event => onSelect(event.nativeEvent.coordinate)}
      >
        <Marker coordinate={coordinate} title="Punto de entrega" description="Ubicación indicada por el cliente" />
      </MapView>
      <View style={{ position: 'absolute', left: 12, right: 12, bottom: 12, backgroundColor: 'rgba(23,38,61,0.9)', borderRadius: 8, padding: 8 }}>
        <Text style={{ color: '#fff', textAlign: 'center', fontSize: 11, fontWeight: '700' }}>Toca el mapa para ajustar la ubicación</Text>
      </View>
    </View>
  );
}
