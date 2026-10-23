import React from 'react';
import { Platform, View, Text } from 'react-native';
import Constants from 'expo-constants';
import MapView, { Marker } from 'react-native-maps';

// En una build propia de Android el mapa necesita una clave de Google Maps (app.json → android.config.googleMaps.apiKey).
// Sin ella el mapa nativo cierra la app, así que se muestra un aviso en su lugar.
const claveMapa = Constants.expoConfig?.android?.config?.googleMaps?.apiKey;
const mapaDisponible = Platform.OS !== 'android' || Constants.appOwnership === 'expo' || Boolean(claveMapa);

export default function DeliveryMap({ coordinate, onSelect }) {
  if (!mapaDisponible) {
    return (
      <View style={{ borderRadius: 14, marginBottom: 16, padding: 14, borderWidth: 1, borderColor: '#E5E8ED', backgroundColor: '#fff' }}>
        <Text style={{ color: '#17263D', fontWeight: '800', fontSize: 13 }}>Mapa no disponible</Text>
        <Text style={{ color: '#6B7788', fontSize: 12, marginTop: 4, lineHeight: 17 }}>Falta la clave de Google Maps en esta versión de la app. Escribe la dirección de entrega en el campo de abajo.</Text>
      </View>
    );
  }

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
