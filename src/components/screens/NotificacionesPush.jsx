import React, { useEffect, useState } from 'react';
import { Alert, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { COLORS } from '../../theme';
import Titulo from '../titulo';
import { Notifications, notificacionesDisponibles, crearCanalAndroid, notificarLocal } from '../../services/notificaciones';

// Oculta la parte central del token para poder mostrarlo en capturas.
const ocultarToken = token => (token.length > 24 ? `${token.slice(0, 18)}••••••••${token.slice(-4)}` : token);

function Boton({ titulo, onPress, secundario }) {
  return <Pressable onPress={onPress} style={({ pressed }) => ({ minHeight: 49, borderRadius: 11, backgroundColor: secundario ? '#fff' : COLORS.gold, borderWidth: secundario ? 1 : 0, borderColor: COLORS.border, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16, opacity: pressed ? 0.75 : 1 })}>
    <Text style={{ color: secundario ? COLORS.navy : '#fff', fontWeight: '800', fontSize: 14 }}>{titulo}</Text>
  </Pressable>;
}

export default function NotificacionesPush() {
  const [token, setToken] = useState('');
  const [verToken, setVerToken] = useState(false);
  const [ultimoAviso, setUltimoAviso] = useState('Sin notificaciones');
  const [estado, setEstado] = useState('Pendiente');

  useEffect(() => {
    if (!notificacionesDisponibles) {
      setEstado('No disponible en Expo Go: usa la development build (EAS)');
      return;
    }
    // Se dispara cuando llega un aviso con la app abierta.
    const recibida = Notifications.addNotificationReceivedListener(n => {
      setUltimoAviso(n.request.content.title || 'Notificación recibida');
    });
    // Se dispara cuando el usuario pulsa el aviso.
    const pulsada = Notifications.addNotificationResponseReceivedListener(r => {
      console.log('Datos al pulsar:', r.notification.request.content.data);
    });
    return () => { recibida.remove(); pulsada.remove(); };
  }, []);

  async function registrarDispositivo() {
    if (!notificacionesDisponibles) return Alert.alert('No disponible', 'Expo Go no incluye este módulo. Instala la development build creada con EAS.');
    try {
      await crearCanalAndroid();
      if (!Device.isDevice) return setEstado('La prueba push requiere un dispositivo físico');

      // getPermissionsAsync consulta el permiso actual sin mostrar ningún diálogo.
      const actual = await Notifications.getPermissionsAsync();
      let concedido = actual.granted;
      if (!concedido) {
        // requestPermissionsAsync muestra el diálogo del sistema.
        const nuevo = await Notifications.requestPermissionsAsync();
        concedido = nuevo.granted;
      }
      if (!concedido) return setEstado('Permiso denegado; revisar ajustes del teléfono');

      const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
      if (!projectId) throw new Error('Falta extra.eas.projectId (ejecuta eas init)');
      // getExpoPushTokenAsync pide a Expo el token que identifica este dispositivo.
      const resultado = await Notifications.getExpoPushTokenAsync({ projectId });
      setToken(resultado.data);
      setEstado('Token obtenido correctamente');
    } catch (e) {
      setEstado('Error: ' + e.message);
      Alert.alert('Registro fallido', e.message);
    }
  }

  async function probarNotificacionLocal() {
    if (!notificacionesDisponibles) return Alert.alert('No disponible', 'Expo Go no incluye este módulo. Instala la development build creada con EAS.');
    try {
      const { granted } = await Notifications.getPermissionsAsync();
      if (!granted) return Alert.alert('Sin permiso', 'Primero solicita los permisos.');
      await notificarLocal('Solicitud registrada', 'Tu solicitud fue registrada correctamente.', { pantalla: 'solicitudes', tipo: 'registro' });
    } catch (e) { Alert.alert('Error local', e.message); }
  }

  const caja = { backgroundColor: '#fff', borderRadius: 14, padding: 16, borderWidth: 1, borderColor: COLORS.border };
  const etiqueta = { color: COLORS.goldDark, fontSize: 10, fontWeight: '800', letterSpacing: 1, marginBottom: 7 };

  return <ScrollView contentContainerStyle={{ padding: 22, paddingBottom: 110, gap: 14 }}>
    <Titulo texto="Notificaciones" subtitulo="Permisos, token de Expo y prueba de avisos." />
    <Boton titulo="Solicitar permisos y obtener token" onPress={registrarDispositivo} />
    <View style={caja}><Text style={etiqueta}>ESTADO</Text><Text style={{ color: COLORS.text, fontSize: 14 }}>{estado}</Text></View>
    <View style={caja}>
      <Text style={etiqueta}>EXPO PUSH TOKEN</Text>
      <Text selectable={verToken} style={{ color: COLORS.text, fontSize: 13 }}>{token ? (verToken ? token : ocultarToken(token)) : 'Aún no disponible'}</Text>
      {token ? <Pressable onPress={() => setVerToken(v => !v)}><Text style={{ color: COLORS.gold, fontWeight: '800', fontSize: 12, marginTop: 10 }}>{verToken ? 'Ocultar token' : 'Mostrar completo (para copiar)'}</Text></Pressable> : null}
    </View>
    <Boton titulo="Probar notificación local" onPress={probarNotificacionLocal} secundario />
    <View style={caja}><Text style={etiqueta}>ÚLTIMO AVISO</Text><Text style={{ color: COLORS.text, fontSize: 14 }}>{ultimoAviso}</Text></View>
    {Platform.OS !== 'android' && <Text style={{ color: COLORS.muted, fontSize: 12 }}>Esta práctica está pensada para Android.</Text>}
  </ScrollView>;
}
