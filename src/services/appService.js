import { demoUsers } from './mockData';

let registeredUsers = [...demoUsers];

export function authenticate(email, password) {
  const user = registeredUsers.find(item => item.email.toLowerCase() === email.trim().toLowerCase() && item.password === password);
  if (!user) return { ok: false, message: 'El correo o la contraseña no son correctos. Verifica tus datos.' };
  const { password: ignored, ...safeUser } = user;
  return { ok: true, user: safeUser };
}

export function createRequest(data, user) {
  const id = `r-${Date.now()}`;
  const code = `SOL-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`;
  const request = { ...data, id, code, status: 'Pendiente', updatedAt: new Date().toISOString().slice(0, 10) };
  return { ...request, record: { id: `log-${id}`, code, date: data.date, type: data.type, description: 'Solicitud creada por el usuario.', status: 'Pendiente', responsible: user.fullName } };
}

export function reviewRequest(item, status, reason, user) {
  const request = { ...item, status, rejectionReason: reason, updatedAt: new Date().toISOString().slice(0, 10), reviewedBy: user.fullName, reviewedAt: new Date().toISOString() };
  return { request, record: { id: `log-${Date.now()}`, code: item.code, date: new Date().toLocaleDateString('es-ES'), type: item.type, description: status === 'Rechazada' ? `Solicitud rechazada: ${reason}` : `Solicitud marcada como ${status.toLowerCase()}.`, status, responsible: user.fullName } };
}

export function updateProfile(current, changes) { return { ...current, ...changes, firstName: changes.fullName.split(' ')[0] || current.firstName }; }

export function registerUser(data) {
  if (registeredUsers.some(item => item.email.toLowerCase() === data.email.trim().toLowerCase())) {
    return { ok: false, message: 'Ya existe una cuenta con ese correo.' };
  }
  const user = { ...data, id: `u-${Date.now()}`, firstName: data.fullName.split(' ')[0] || data.fullName, role: data.accountType === 'liquorStore' ? 'Licorería' : 'Usuario' };
  registeredUsers = [...registeredUsers, user];
  const { password: ignored, ...safeUser } = user;
  return { ok: true, user: safeUser };
}

export function sendProposal(data, user) {
  return { ...data, id: `p-${Date.now()}`, liquorStore: user.establishment, status: 'Disponible', available: true };
}
