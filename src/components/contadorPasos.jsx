import React, { useEffect, useState } from 'react';
import { Linking, Pressable, Text, View } from 'react-native';
import { Accelerometer, Pedometer } from 'expo-sensors';
import { COLORS } from '../theme';

const META_PASOS = 10000;
const UMBRAL_G = 1.15;
const INTERVALO_MIN_MS = 350;

// Sin permiso de actividad física se detectan pasos con el acelerómetro (aproximado).
function contarConAcelerometro(alContar) {
  let arriba = false;
  let ultimo = 0;
  Accelerometer.setUpdateInterval(80);
  return Accelerometer.addListener(({ x, y, z }) => {
    const fuerza = Math.sqrt(x * x + y * y + z * z);
    const ahora = Date.now();
    if (fuerza > UMBRAL_G && !arriba && ahora - ultimo > INTERVALO_MIN_MS) {
      arriba = true;
      ultimo = ahora;
      alContar();
    } else if (fuerza < UMBRAL_G - 0.05) {
      arriba = false;
    }
  });
}

export default function ContadorPasos() {
  const [pasos, setPasos] = useState(0);
  const [modo, setModo] = useState('cargando'); // cargando | podometro | acelerometro | no-disponible
  const [intento, setIntento] = useState(0);

  useEffect(() => {
    let suscripcion;
    let activo = true;

    const usarAcelerometro = async () => {
      if (!(await Accelerometer.isAvailableAsync())) return activo && setModo('no-disponible');
      suscripcion = contarConAcelerometro(() => activo && setPasos(p => p + 1));
      if (activo) setModo('acelerometro');
    };

    (async () => {
      try {
        const disponible = await Pedometer.isAvailableAsync();
        const { granted } = disponible ? await Pedometer.requestPermissionsAsync() : { granted: false };
        if (!activo) return;
        if (!disponible || !granted) return await usarAcelerometro();

        // El historial del día solo existe en iOS; en Android cuenta desde que abres la app.
        try {
          const inicio = new Date();
          inicio.setHours(0, 0, 0, 0);
          const { steps } = await Pedometer.getStepCountAsync(inicio, new Date());
          if (activo) setPasos(steps);
        } catch {}

        let base = null;
        suscripcion = Pedometer.watchStepCount(({ steps }) => {
          if (!activo) return;
          setPasos(actual => {
            if (base === null) base = actual;
            return base + steps;
          });
        });
        setModo('podometro');
      } catch {
        if (activo) await usarAcelerometro().catch(() => setModo('no-disponible'));
      }
    })();

    return () => {
      activo = false;
      suscripcion?.remove();
    };
  }, [intento]);

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
        <Pressable onPress={() => { setPasos(0); setModo('cargando'); setIntento(n => n + 1); }}><Text style={{ color: COLORS.gold, fontWeight: '800', fontSize: 12 }}>Reintentar</Text></Pressable>
      </View>
    </>}
  </View>;
}
