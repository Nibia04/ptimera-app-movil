import { Platform } from 'react-native';

// En Expo Go este módulo nativo no existe: se carga protegido para que la app no se caiga.
// Con la development build (EAS) se carga normalmente.
let Notifications = null;
try {
  Notifications = require('expo-notifications');
} catch {}

export { Notifications };
export const notificacionesDisponibles = Notifications !== null;

// Define cómo se muestra un aviso cuando la app está abierta (primer plano).
Notifications?.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// En Android 13+ el canal debe existir antes de pedir permisos o mostrar avisos.
export async function crearCanalAndroid() {
  if (!Notifications || Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync('default', {
    name: 'Avisos de solicitudes',
    importance: Notifications.AndroidImportance.MAX,
    vibrationPattern: [0, 250, 250, 250],
  });
}

export async function notificarLocal(title, body, data = {}) {
  if (!Notifications) throw new Error('Notificaciones no disponibles en Expo Go; usa la development build.');
  await crearCanalAndroid();
  await Notifications.scheduleNotificationAsync({ content: { title, body, data }, trigger: null });
}

// Solo se llama después de que el registro se guardó con éxito.
export async function notificarSolicitudRegistrada(codigo) {
  try {
    if (!Notifications) return;
    const { granted } = await Notifications.getPermissionsAsync();
    if (!granted) return;
    await notificarLocal('Solicitud registrada', `Tu solicitud ${codigo} se guardó correctamente.`, { tipo: 'solicitud_creada', codigo });
  } catch {}
}
