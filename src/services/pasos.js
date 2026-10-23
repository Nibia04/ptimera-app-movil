import { Accelerometer, Pedometer } from 'expo-sensors';

// Servicio único: el sensor se inicia una sola vez y el conteo sobrevive al cambiar de pantalla.
const UMBRAL_G = 1.15;
const INTERVALO_MIN_MS = 350;

let estado = { pasos: 0, modo: 'cargando' }; // modo: cargando | podometro | acelerometro | no-disponible
let suscripcion = null;
let iniciado = false;
const oyentes = new Set();

function cambiar(parcial) {
  estado = { ...estado, ...parcial };
  oyentes.forEach(fn => fn(estado));
}

// Sin permiso de actividad física se detectan pasos con el acelerómetro (aproximado).
async function usarAcelerometro() {
  if (!(await Accelerometer.isAvailableAsync())) return cambiar({ modo: 'no-disponible' });
  let arriba = false;
  let ultimo = 0;
  Accelerometer.setUpdateInterval(100);
  suscripcion = Accelerometer.addListener(({ x, y, z }) => {
    const fuerza = Math.sqrt(x * x + y * y + z * z);
    const ahora = Date.now();
    if (fuerza > UMBRAL_G && !arriba && ahora - ultimo > INTERVALO_MIN_MS) {
      arriba = true;
      ultimo = ahora;
      cambiar({ pasos: estado.pasos + 1 });
    } else if (fuerza < UMBRAL_G - 0.05) {
      arriba = false;
    }
  });
  cambiar({ modo: 'acelerometro' });
}

async function usarPodometro() {
  // El historial del día solo existe en iOS; en Android cuenta desde que abres la app.
  try {
    const inicio = new Date();
    inicio.setHours(0, 0, 0, 0);
    const { steps } = await Pedometer.getStepCountAsync(inicio, new Date());
    cambiar({ pasos: steps });
  } catch {}
  const base = estado.pasos;
  suscripcion = Pedometer.watchStepCount(({ steps }) => cambiar({ pasos: base + steps }));
  cambiar({ modo: 'podometro' });
}

async function arrancar() {
  try {
    const disponible = await Pedometer.isAvailableAsync();
    const { granted } = disponible ? await Pedometer.requestPermissionsAsync() : { granted: false };
    if (disponible && granted) return await usarPodometro();
    await usarAcelerometro();
  } catch {
    await usarAcelerometro().catch(() => cambiar({ modo: 'no-disponible' }));
  }
}

export function iniciarPasos() {
  if (iniciado) return;
  iniciado = true;
  arrancar();
}

export function reintentarPasos() {
  suscripcion?.remove();
  suscripcion = null;
  iniciado = true;
  cambiar({ pasos: 0, modo: 'cargando' });
  arrancar();
}

export function suscribirPasos(fn) {
  oyentes.add(fn);
  fn(estado);
  iniciarPasos();
  return () => oyentes.delete(fn);
}
