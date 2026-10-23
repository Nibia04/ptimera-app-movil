import React, { useState } from 'react';
import {
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { COLORS, STATUS_META } from './src/theme';
import { initialRecords, initialRequests, marketplaceRequests, initialProposals } from './src/services/mockData';
import { createRequest, reviewRequest, sendProposal } from './src/services/appService';
import LoginScreen from './src/components/screens/loginScrens';
import PerfilScreen from './src/components/screens/perfilesScrens';
import MenuInterface from './src/components/menuinterface';
import DeliveryMap from './src/components/DeliveryMap';
import ContadorPasos from './src/components/contadorPasos';
import NotificacionesPush from './src/components/screens/NotificacionesPush';
import { notificarSolicitudRegistrada } from './src/services/notificaciones';

const emptyRequest = { type: 'Licencia de funcionamiento', establishment: '', date: '', description: '', additional: '', documents: '' };

function Field({ label, value, onChangeText, placeholder, multiline, secureTextEntry, error, keyboardType }) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={[styles.input, multiline && styles.multiline, error && styles.inputError]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={COLORS.muted}
        multiline={multiline}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        textAlignVertical={multiline ? 'top' : 'center'}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

function Button({ title, onPress, secondary, danger, disabled }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [styles.button, secondary && styles.buttonSecondary, danger && styles.buttonDanger, disabled && styles.buttonDisabled, pressed && styles.pressed]}
    >
      <Text style={[styles.buttonText, secondary && styles.buttonSecondaryText]}>{title}</Text>
    </Pressable>
  );
}

function StatusPill({ status }) {
  const meta = STATUS_META[status] || STATUS_META.Pendiente;
  return <View style={[styles.pill, { backgroundColor: meta.background }]}><Text style={[styles.pillText, { color: meta.color }]}>{status}</Text></View>;
}

function Header({ eyebrow, title, subtitle }) {
  return <View style={styles.header}><Text style={styles.eyebrow}>{eyebrow}</Text><Text style={styles.title}>{title}</Text>{subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}</View>;
}


function HomeScreen({ user, requests, onNavigate, marketplace = [], proposals = [], orders = [] }) {
  if (user.role === 'Usuario') return <MarketplaceHome user={user} marketplace={marketplace} proposals={proposals} orders={orders} onNavigate={onNavigate} />;
  if (user.role === 'Licorería') return <LiquorStoreHome user={user} marketplace={marketplace} proposals={proposals} orders={orders} onNavigate={onNavigate} />;
  const counts = requests.reduce((acc, item) => { acc[item.status] = (acc[item.status] || 0) + 1; return acc; }, {});
  const recent = [...requests].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 3);
  return <ScrollView contentContainerStyle={styles.content}>
    <Header eyebrow="BARRICA · PANEL" title={`Hola, ${user.firstName}`} subtitle="Aquí tienes el resumen de tu operación." /><ContadorPasos />
    <View style={styles.heroCard}><View><Text style={styles.heroKicker}>ESTABLECIMIENTO ACTIVO</Text><Text style={styles.heroTitle}>{user.establishment}</Text><Text style={styles.heroSub}>Control de solicitudes y cumplimiento</Text></View><Text style={styles.heroIcon}>◆</Text></View>
    <Text style={styles.sectionTitle}>Resumen de solicitudes</Text>
    <View style={styles.statsGrid}>{[['Pendientes', 'Pendiente', COLORS.gold], ['En revisión', 'En revisión', COLORS.blue], ['Aprobadas', 'Aprobada', COLORS.green], ['Rechazadas', 'Rechazada', COLORS.red]].map(([label, key, color]) => <View style={styles.statCard} key={key}><View style={[styles.statDot, { backgroundColor: color }]} /><Text style={styles.statNumber}>{counts[key] || 0}</Text><Text style={styles.statLabel}>{label}</Text></View>)}</View>
    <View style={styles.rowBetween}><Text style={styles.sectionTitle}>Actividad reciente</Text><Pressable onPress={() => onNavigate('records')}><Text style={styles.link}>Ver todo</Text></Pressable></View>
    {recent.map(item => <RequestRow key={item.id} item={item} onPress={() => onNavigate('requests', item)} />)}
    <Text style={styles.sectionTitle}>Accesos rápidos</Text>
    <View style={styles.quickGrid}><QuickAction label="Nueva solicitud" icon="+" onPress={() => onNavigate('requests', { new: true })} /><QuickAction label="Mis registros" icon="◷" onPress={() => onNavigate('records')} />{user.role !== 'Usuario' && <QuickAction label="Revisar" icon="✓" onPress={() => onNavigate('review')} />}<QuickAction label="Mi perfil" icon="○" onPress={() => onNavigate('profile')} /></View>
  </ScrollView>;
}

function QuickAction({ label, icon, onPress }) { return <Pressable style={styles.quickAction} onPress={onPress}><Text style={styles.quickIcon}>{icon}</Text><Text style={styles.quickLabel}>{label}</Text><Text style={styles.quickArrow}>›</Text></Pressable>; }
function RequestRow({ item, onPress }) { return <Pressable style={styles.requestRow} onPress={onPress}><View style={styles.requestIcon}><Text style={styles.requestIconText}>▤</Text></View><View style={styles.requestInfo}><Text style={styles.requestCode}>{item.code}</Text><Text style={styles.requestType}>{item.type}</Text><Text style={styles.requestDate}>{item.date}</Text></View><StatusPill status={item.status} /></Pressable>; }

function RequestsScreen({ requests, onCreate, onSelect, onBack, user, marketplace, proposals, onSendProposal }) {
  if (user.role === 'Usuario') return <ClientRequests requests={marketplace} proposals={proposals} onCreate={onCreate} onSelect={onSelect} />;
  if (user.role === 'Licorería') return <LiquorRequests requests={marketplace} proposals={proposals} onSelect={onSelect} onSendProposal={onSendProposal} />;
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState(emptyRequest);
  const [errors, setErrors] = useState({});
  const submit = () => {
    const nextErrors = {};
    ['establishment', 'date', 'description'].forEach(key => { if (!form[key].trim()) nextErrors[key] = 'Este campo es obligatorio.'; });
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    onCreate(form);
    setForm(emptyRequest); setCreating(false);
  };
  if (creating) return <ScrollView contentContainerStyle={styles.content}><Pressable onPress={() => setCreating(false)}><Text style={styles.back}>‹ Volver a solicitudes</Text></Pressable><Header eyebrow="NUEVA SOLICITUD" title="Cuéntanos lo necesario" subtitle="Completa la información para iniciar el proceso." /><Field label="Tipo de solicitud" value={form.type} onChangeText={value => setForm({ ...form, type: value })} placeholder="Tipo de solicitud" /><Field label="Nombre del establecimiento" value={form.establishment} onChangeText={value => setForm({ ...form, establishment: value })} placeholder="Ej. Barrica Centro" error={errors.establishment} /><Field label="Fecha de solicitud" value={form.date} onChangeText={value => setForm({ ...form, date: value })} placeholder="DD/MM/AAAA" error={errors.date} /><Field label="Descripción" value={form.description} onChangeText={value => setForm({ ...form, description: value })} placeholder="Describe brevemente tu solicitud" multiline error={errors.description} /><Field label="Información adicional (opcional)" value={form.additional} onChangeText={value => setForm({ ...form, additional: value })} placeholder="Detalles que debamos conocer" multiline /><Field label="Documentación (opcional)" value={form.documents} onChangeText={value => setForm({ ...form, documents: value })} placeholder="Ej. RUC, permiso municipal" /><Button title="Enviar solicitud" onPress={submit} /></ScrollView>;
  return <ScrollView contentContainerStyle={styles.content}><Header eyebrow="GESTIÓN" title="Solicitudes" subtitle="Consulta y crea solicitudes para tu establecimiento." /><Button title="+  Nueva solicitud" onPress={() => setCreating(true)} /><View style={styles.filterLine}><Text style={styles.sectionTitle}>{requests.length} solicitudes</Text><Text style={styles.mutedText}>Más recientes</Text></View>{requests.length ? requests.map(item => <RequestRow key={item.id} item={item} onPress={() => onSelect(item)} />) : <EmptyState text="No tienes solicitudes registradas." />}</ScrollView>;
}

function DetailScreen({ item, onBack, onReview }) { return <ScrollView contentContainerStyle={styles.content}><Pressable onPress={onBack}><Text style={styles.back}>‹ Volver</Text></Pressable><Header eyebrow={item.code} title={item.type} subtitle={`Creada el ${item.date}`} /><View style={styles.detailStatus}><Text style={styles.mutedText}>ESTADO ACTUAL</Text><StatusPill status={item.status} /></View>{[['Establecimiento', item.establishment], ['Descripción', item.description], ['Información adicional', item.additional || 'No indicada'], ['Documentación', item.documents || 'No adjunta']].map(([label, value]) => <View style={styles.detailBlock} key={label}><Text style={styles.detailLabel}>{label}</Text><Text style={styles.detailValue}>{value}</Text></View>)}{onReview ? <Button title="Gestionar solicitud" onPress={() => onReview(item)} /> : null}</ScrollView>; }
function EmptyState({ text }) { return <View style={styles.empty}><Text style={styles.emptyIcon}>◌</Text><Text style={styles.emptyTitle}>Sin resultados</Text><Text style={styles.mutedText}>{text}</Text></View>; }

function RecordsScreen({ records }) { const [query, setQuery] = useState(''); const filtered = records.filter(item => `${item.code} ${item.type} ${item.description}`.toLowerCase().includes(query.toLowerCase())); return <ScrollView contentContainerStyle={styles.content}><Header eyebrow="AUDITORÍA" title="Registros" subtitle="Historial de solicitudes y acciones realizadas." /><TextInput style={styles.search} value={query} onChangeText={setQuery} placeholder="Buscar por código o tipo..." placeholderTextColor={COLORS.muted} />{filtered.length ? filtered.sort((a, b) => b.date.localeCompare(a.date)).map(item => <View style={styles.recordCard} key={item.id}><View style={styles.rowBetween}><Text style={styles.requestCode}>{item.code}</Text><StatusPill status={item.status} /></View><Text style={styles.recordType}>{item.type}</Text><Text style={styles.recordDescription}>{item.description}</Text><Text style={styles.recordMeta}>{item.date} · Responsable: {item.responsible}</Text></View>) : <EmptyState text="No encontramos registros con esa búsqueda." />}</ScrollView>; }

function ReviewScreen({ requests, onUpdate, onSelect }) { const pending = requests.filter(item => item.status === 'Pendiente' || item.status === 'En revisión'); return <ScrollView contentContainerStyle={styles.content}><Header eyebrow="CONTROL INTERNO" title="Revisión" subtitle="Gestiona las solicitudes que necesitan atención." />{pending.length ? pending.map(item => <RequestRow key={item.id} item={item} onPress={() => onSelect(item)} />) : <EmptyState text="No hay solicitudes pendientes de revisión." />}</ScrollView>; }

function ReviewDetail({ item, user, onBack, onUpdate }) { const [reason, setReason] = useState(''); const act = status => { if (status === 'Rechazada' && !reason.trim()) return Alert.alert('Motivo requerido', 'Escribe un motivo antes de rechazar la solicitud.'); if (status === 'Rechazada') Alert.alert('Confirmar rechazo', '¿Deseas rechazar esta solicitud?', [{ text: 'Cancelar', style: 'cancel' }, { text: 'Rechazar', style: 'destructive', onPress: () => onUpdate(item, status, reason) }]); else onUpdate(item, status, ''); }; return <ScrollView contentContainerStyle={styles.content}><Pressable onPress={onBack}><Text style={styles.back}>‹ Volver a revisión</Text></Pressable><Header eyebrow={`REVISAR · ${item.code}`} title={item.type} subtitle={item.establishment} /><View style={styles.detailStatus}><Text style={styles.mutedText}>ESTADO ACTUAL</Text><StatusPill status={item.status} /></View><View style={styles.reviewerCard}><Text style={styles.detailLabel}>SOLICITANTE</Text><Text style={styles.detailValue}>{user.fullName}</Text><Text style={styles.recordMeta}>{user.email} · {user.phone}</Text></View><View style={styles.detailBlock}><Text style={styles.detailLabel}>DESCRIPCIÓN</Text><Text style={styles.detailValue}>{item.description}</Text></View><View style={styles.detailBlock}><Text style={styles.detailLabel}>DOCUMENTACIÓN</Text><Text style={styles.detailValue}>{item.documents || 'No adjunta'}</Text></View><Field label="Motivo de rechazo (obligatorio para rechazar)" value={reason} onChangeText={setReason} placeholder="Explica la razón de la decisión" multiline /><Button title="Marcar en revisión" secondary onPress={() => act('En revisión')} /><Button title="Aprobar solicitud" onPress={() => act('Aprobada')} /><Button title="Rechazar solicitud" danger onPress={() => act('Rechazada')} /></ScrollView>; }

function ProfileScreen({ user, onSave, onLogout }) { const [form, setForm] = useState(user); const [saved, setSaved] = useState(false); const save = () => { onSave(form); setSaved(true); setTimeout(() => setSaved(false), 2500); }; return <ScrollView contentContainerStyle={styles.content}><Header eyebrow="CUENTA" title="Mi perfil" subtitle="Mantén tus datos de contacto actualizados." /><View style={styles.profileBadge}><Text style={styles.avatar}>{user.firstName[0]}</Text><View><Text style={styles.profileName}>{user.fullName}</Text><Text style={styles.profileRole}>{user.role} · {user.establishment}</Text></View></View><Field label="Nombre completo" value={form.fullName} onChangeText={value => setForm({ ...form, fullName: value })} placeholder="Nombre completo" /><Field label="Correo electrónico" value={form.email} onChangeText={value => setForm({ ...form, email: value })} placeholder="nombre@live.uleam.edu.ec" /><Field label="Teléfono" value={form.phone} onChangeText={value => setForm({ ...form, phone: value })} placeholder="099 000 0000" keyboardType="phone-pad" /><Field label="Establecimiento" value={form.establishment} onChangeText={value => setForm({ ...form, establishment: value })} placeholder="Nombre del establecimiento" /><Field label="Dirección" value={form.address} onChangeText={value => setForm({ ...form, address: value })} placeholder="Dirección" /><Button title={saved ? 'Cambios guardados' : 'Guardar cambios'} onPress={save} /><Button title="Cerrar sesión" secondary onPress={onLogout} /></ScrollView>; }

function MarketplaceHome({ user, marketplace, proposals, orders, onNavigate }) {
  const active = marketplace.filter(item => item.client === user.fullName && item.status !== 'Entregado').length;
  return <ScrollView contentContainerStyle={styles.content}><Header eyebrow="BARRICA · CLIENTE" title={`Hola, ${user.firstName}`} subtitle="Publica lo que necesitas y compara propuestas." /><ContadorPasos /><View style={styles.heroCard}><Text style={styles.heroTitle}>¿Qué bebida necesitas?</Text><Text style={styles.heroSub}>Varias licorerías pueden hacerte una propuesta.</Text><Button title="+ Crear solicitud" onPress={() => onNavigate('requests', { new: true })} /></View><Text style={styles.sectionTitle}>Tu actividad</Text><View style={styles.statsGrid}><View style={styles.statCard}><Text style={styles.statNumber}>{active}</Text><Text style={styles.statLabel}>Solicitudes activas</Text></View><View style={styles.statCard}><Text style={styles.statNumber}>{proposals.length}</Text><Text style={styles.statLabel}>Propuestas recibidas</Text></View><View style={styles.statCard}><Text style={styles.statNumber}>{orders.length}</Text><Text style={styles.statLabel}>Pedidos en proceso</Text></View></View><Text style={styles.sectionTitle}>Últimos pedidos</Text>{orders.length ? orders.map(order => <View style={styles.recordCard} key={order.id}><Text style={styles.requestCode}>{order.code}</Text><Text style={styles.recordType}>{order.product} · {order.quantity} · ${order.price}</Text><Text style={styles.recordDescription}>Comentarios: {order.comments || 'Sin comentarios.'}</Text><StatusPill status={order.status} /></View>) : <EmptyState text="Aún no tienes pedidos confirmados." />}</ScrollView>;
}

function LiquorStoreHome({ user, marketplace, proposals, orders, onNavigate }) {
  return <ScrollView contentContainerStyle={styles.content}><Header eyebrow="BARRICA · LICORERÍA" title={`Hola, ${user.firstName}`} subtitle={user.establishment} /><ContadorPasos /><View style={styles.heroCard}><Text style={styles.heroTitle}>Solicitudes disponibles</Text><Text style={styles.heroSub}>Encuentra clientes y envía propuestas competitivas.</Text><Button title="Ver solicitudes" onPress={() => onNavigate('requests')} /></View><View style={styles.statsGrid}><View style={styles.statCard}><Text style={styles.statNumber}>{marketplace.length}</Text><Text style={styles.statLabel}>Solicitudes disponibles</Text></View><View style={styles.statCard}><Text style={styles.statNumber}>{proposals.length}</Text><Text style={styles.statLabel}>Propuestas enviadas</Text></View><View style={styles.statCard}><Text style={styles.statNumber}>{orders.length}</Text><Text style={styles.statLabel}>Pedidos aceptados</Text></View></View></ScrollView>;
}

function ClientRequests({ requests, proposals, onCreate }) {
  const [creating, setCreating] = useState(false);
  const [product, setProduct] = useState('');
  const [quantity, setQuantity] = useState('');
  const [budget, setBudget] = useState('');
  const [address, setAddress] = useState('');
  const [comments, setComments] = useState('');
  const [coordinate, setCoordinate] = useState({ latitude: -0.9501, longitude: -80.7161 });
  if (creating) return <ScrollView contentContainerStyle={styles.content}><Pressable onPress={() => setCreating(false)}><Text style={styles.back}>‹ Volver</Text></Pressable><Header eyebrow="NUEVA SOLICITUD" title="¿Qué bebida necesitas?" /><Field label="Producto" value={product} onChangeText={setProduct} placeholder="Ej. Cerveza" /><Field label="Cantidad" value={quantity} onChangeText={setQuantity} placeholder="Ej. 2 cajas o 24 botellas" /><Field label="Presupuesto máximo" value={budget} onChangeText={setBudget} placeholder="$40" keyboardType="numeric" /><Field label="Dirección de entrega" value={address} onChangeText={setAddress} placeholder="Manta, barrio o referencia" /><Text style={styles.fieldLabel}>Ubicación en el mapa</Text><DeliveryMap coordinate={coordinate} onSelect={setCoordinate} /><Field label="Comentarios" value={comments} onChangeText={setComments} placeholder="Preferencias de presentación" multiline /><Button title="Publicar solicitud" onPress={() => { if (!product.trim() || !quantity.trim() || !budget.trim() || !address.trim()) return Alert.alert('Datos incompletos', 'Completa producto, cantidad, presupuesto y ubicación.'); onCreate({ product: product.trim(), quantity: quantity.trim(), budget: Number(budget), address: address.trim(), coordinate, comments: comments.trim() }); setCreating(false); setProduct(''); setQuantity(''); setBudget(''); setAddress(''); setComments(''); }} /></ScrollView>;
  return <ScrollView contentContainerStyle={styles.content}><Header eyebrow="MARKETPLACE" title="Mis solicitudes" subtitle="Compara las propuestas de las licorerías." /><Button title="+ Crear solicitud" onPress={() => setCreating(true)} />{requests.map(item => <Pressable key={item.id} style={styles.recordCard}><View style={styles.rowBetween}><Text style={styles.requestCode}>{item.code}</Text><StatusPill status={item.status} /></View><Text style={styles.recordType}>{item.product} · {item.quantity}</Text><Text style={styles.recordDescription}>Presupuesto: ${item.budget} · Entrega: {item.address}</Text><Text style={styles.recordDescription}>Comentarios: {item.comments || 'Sin comentarios.'}</Text><Text style={styles.recordMeta}>Propuestas recibidas: {item.proposals || proposals.filter(p => p.requestId === item.id).length}</Text></Pressable>)}</ScrollView>;
}

function LiquorRequests({ requests, proposals, onSendProposal }) { const [selected, setSelected] = useState(null); const [price, setPrice] = useState(''); const [time, setTime] = useState(''); const [comment, setComment] = useState(''); if (selected) return <ScrollView contentContainerStyle={styles.content}><Pressable onPress={() => setSelected(null)}><Text style={styles.back}>‹ Volver a solicitudes</Text></Pressable><Header eyebrow={selected.code} title={selected.product} subtitle={`${selected.quantity} · Presupuesto $${selected.budget}`} /><View style={styles.detailBlock}><Text style={styles.detailLabel}>UBICACIÓN DE ENTREGA</Text><Text style={styles.detailValue}>{selected.address} · {selected.location}</Text><Text style={styles.recordDescription}>Comentarios del cliente: {selected.comments || 'Sin comentarios.'}</Text></View><DeliveryMap coordinate={selected.coordinate || { latitude: -0.9501, longitude: -80.7161 }} onSelect={() => {}} /><Field label="Precio ofrecido" value={price} onChangeText={setPrice} placeholder="$37" keyboardType="numeric" /><Field label="Tiempo estimado de entrega" value={time} onChangeText={setTime} placeholder="20 minutos" /><Field label="Comentario" value={comment} onChangeText={setComment} placeholder="Producto disponible" multiline /><Button title="Enviar propuesta" onPress={() => { if (!price || !time) return Alert.alert('Datos incompletos', 'Indica precio y tiempo de entrega.'); onSendProposal({ requestId: selected.id, price: Number(price), deliveryTime: Number(time), comment: comment.trim() || 'Producto disponible.' }); setComment(''); setSelected(null); }} /></ScrollView>; return <ScrollView contentContainerStyle={styles.content}><Header eyebrow="MARKETPLACE" title="Solicitudes disponibles" subtitle="Haz una propuesta para nuevos clientes." />{requests.map(item => <Pressable key={item.id} style={styles.recordCard} onPress={() => setSelected(item)}><Text style={styles.requestCode}>{item.code}</Text><Text style={styles.recordType}>{item.product} · {item.quantity}</Text><Text style={styles.recordDescription}>Presupuesto: ${item.budget} · {item.address}</Text><Text style={styles.recordMeta}>Ver solicitud y enviar propuesta ›</Text></Pressable>)}</ScrollView>; }

function OrdersScreen({ orders, proposals, onAccept, user }) {
  const isClient = user.role === 'Usuario';
  return <ScrollView contentContainerStyle={styles.content}><Header eyebrow="OPERACIÓN" title="Pedidos" subtitle={isClient ? 'Compara propuestas y sigue tus pedidos.' : 'Revisa tus propuestas y pedidos aceptados.'} />{isClient && proposals.filter(item => item.status === 'Disponible').map(proposal => <View style={styles.recordCard} key={proposal.id}><View style={styles.rowBetween}><Text style={styles.requestCode}>{proposal.liquorStore}</Text><Text style={styles.requestCode}>${proposal.price}</Text></View><Text style={styles.recordType}>{proposal.deliveryTime} minutos de entrega</Text><Text style={styles.recordDescription}>{proposal.comment}</Text><Button title="Aceptar propuesta" onPress={() => onAccept(proposal)} /></View>)}{orders.map(order => <View style={styles.recordCard} key={order.id}><Text style={styles.requestCode}>{order.code}</Text><Text style={styles.recordType}>{order.product} · {order.quantity} · ${order.price}</Text><Text style={styles.recordDescription}>{order.liquorStore} · {order.address}</Text><Text style={styles.recordDescription}>Comentarios: {order.comments || 'Sin comentarios.'}</Text><StatusPill status={order.status} /></View>)}{!orders.length && (!isClient || !proposals.length) ? <EmptyState text="No hay pedidos o propuestas todavía." /> : null}</ScrollView>;
}

export default function App() {
  const [user, setUser] = useState(null);
  const [active, setActive] = useState('home');
  const [selected, setSelected] = useState(null);
  const [requests, setRequests] = useState(initialRequests);
  const [records, setRecords] = useState(initialRecords);
  const [marketplace, setMarketplace] = useState(marketplaceRequests);
  const [proposals, setProposals] = useState(initialProposals);
  const [orders, setOrders] = useState([]);
  if (!user) return <LoginScreen onLogin={setUser} />;
  const navigate = (screen, item) => { setSelected(item && !item.new ? item : null); setActive(screen); };
  const addRequest = data => {
    if (user.role === 'Usuario') {
      const request = { id: `m-${Date.now()}`, code: `PED-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`, product: data.product, quantity: data.quantity, presentation: data.presentation || '', budget: data.budget, address: data.address, location: data.address, coordinate: data.coordinate, date: new Date().toLocaleString('es-ES'), comments: data.comments || 'Sin comentarios.', status: 'Esperando propuestas', proposals: 0, client: user.fullName };
      setMarketplace([request, ...marketplace]);
      Alert.alert('Solicitud publicada', 'Tu solicitud quedó esperando propuestas.');
      notificarSolicitudRegistrada(request.code);
      return;
    }
    const request = createRequest(data, user); setRequests([request, ...requests]); setRecords([request.record, ...records]); Alert.alert('Solicitud enviada', `Tu solicitud ${request.code} fue registrada correctamente.`); notificarSolicitudRegistrada(request.code);
  };
  const addProposal = data => { setProposals([...proposals, sendProposal(data, user)]); Alert.alert('Propuesta enviada', 'El cliente podrá comparar tu propuesta.'); };
  const acceptProposal = proposal => { const source = marketplace.find(item => item.id === proposal.requestId); const order = { id: `o-${Date.now()}`, code: `ORD-${Date.now().toString().slice(-5)}`, product: source.product, quantity: source.quantity, comments: source.comments, price: proposal.price, liquorStore: proposal.liquorStore, client: source.client, address: source.address, status: 'Pedido confirmado' }; setOrders([order, ...orders]); setMarketplace(marketplace.map(item => item.id === source.id ? { ...item, status: 'Pedido confirmado' } : item)); Alert.alert('Propuesta aceptada', `Tu pedido ${order.code} fue confirmado.`); };
  const update = (item, status, reason) => { const result = reviewRequest(item, status, reason, user); setRequests(requests.map(request => request.id === item.id ? result.request : request)); setRecords([result.record, ...records]); setSelected(null); setActive('review'); Alert.alert('Solicitud actualizada', `La solicitud fue marcada como ${status.toLowerCase()}.`); };
  let screen = <HomeScreen user={user} requests={requests} marketplace={marketplace} proposals={proposals} orders={orders} onNavigate={navigate} />;
  if (selected && active === 'requests') screen = <DetailScreen item={selected} onBack={() => setSelected(null)} onReview={user.role !== 'Usuario' ? item => { setSelected(item); setActive('reviewDetail'); } : null} />;
  else if (selected && active === 'reviewDetail') screen = <ReviewDetail item={selected} user={user} onBack={() => { setSelected(null); setActive('review'); }} onUpdate={update} />;
  else if (active === 'requests') screen = <RequestsScreen requests={requests} user={user} marketplace={marketplace} proposals={proposals} onCreate={addRequest} onSendProposal={addProposal} onSelect={item => { setSelected(item); setActive('requests'); }} />;
  else if (active === 'orders') screen = <OrdersScreen orders={orders} proposals={proposals} onAccept={acceptProposal} user={user} />;
  else if (active === 'records') screen = <RecordsScreen records={records} />;
  else if (active === 'review') screen = <ReviewScreen requests={requests} onSelect={item => { setSelected(item); setActive('reviewDetail'); }} />;
  else if (active === 'notifications') screen = <NotificacionesPush />;
  else if (active === 'profile') screen = <PerfilScreen user={user} onSave={profile => setUser(profile)} onLogout={() => { setUser(null); setActive('home'); }} />;
  return <SafeAreaView style={styles.app}><StatusBar barStyle="dark-content" /><View style={styles.flex}>{screen}</View><MenuInterface active={active === 'reviewDetail' ? 'review' : active} onSelect={navigate} isReviewer={user.role === 'Administrador'} /></SafeAreaView>;
}

const styles = StyleSheet.create({
  flex: { flex: 1 }, app: { flex: 1, backgroundColor: COLORS.background }, content: { padding: 22, paddingBottom: 110 }, loginBackground: { flex: 1, backgroundColor: COLORS.navy }, loginContent: { padding: 26, paddingTop: 58, paddingBottom: 40 }, logoMark: { width: 52, height: 52, borderRadius: 17, backgroundColor: COLORS.gold, alignItems: 'center', justifyContent: 'center', marginBottom: 16 }, logoBottle: { color: COLORS.navy, fontSize: 23 }, brandLight: { color: COLORS.goldLight, letterSpacing: 3, fontWeight: '700', fontSize: 12 }, loginTitle: { color: '#fff', fontSize: 36, lineHeight: 42, fontWeight: '800', marginTop: 24 }, loginIntro: { color: '#b1bbca', fontSize: 15, lineHeight: 22, marginTop: 14, marginBottom: 28 }, loginCard: { backgroundColor: '#fff', borderRadius: 22, padding: 22 }, cardTitle: { color: COLORS.navy, fontSize: 22, fontWeight: '800', marginBottom: 18 }, header: { marginBottom: 22 }, eyebrow: { color: COLORS.goldDark, fontSize: 11, fontWeight: '800', letterSpacing: 1.6, marginBottom: 7 }, title: { color: COLORS.navy, fontSize: 30, fontWeight: '800', letterSpacing: -0.5 }, subtitle: { color: COLORS.muted, fontSize: 14, marginTop: 7, lineHeight: 20 }, field: { marginBottom: 16 }, fieldLabel: { color: COLORS.navy, fontSize: 12, fontWeight: '700', marginBottom: 8 }, input: { backgroundColor: '#fff', borderColor: COLORS.border, borderWidth: 1, borderRadius: 11, paddingHorizontal: 14, height: 48, color: COLORS.navy, fontSize: 15 }, multiline: { height: 92, paddingTop: 13 }, inputError: { borderColor: COLORS.red }, error: { color: COLORS.red, fontSize: 12, marginTop: 5 }, errorBox: { backgroundColor: '#fff1f0', color: COLORS.red, borderRadius: 8, padding: 10, fontSize: 13, marginBottom: 14 }, passwordWrap: { position: 'relative' }, showButton: { position: 'absolute', right: 12, bottom: 27, padding: 5 }, showText: { color: COLORS.goldDark, fontSize: 12, fontWeight: '700' }, button: { minHeight: 49, borderRadius: 11, backgroundColor: COLORS.gold, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16, marginBottom: 12 }, buttonSecondary: { backgroundColor: '#fff', borderWidth: 1, borderColor: COLORS.border }, buttonDanger: { backgroundColor: COLORS.red }, buttonDisabled: { opacity: 0.5 }, buttonText: { color: COLORS.navy, fontSize: 14, fontWeight: '800' }, buttonSecondaryText: { color: COLORS.navy }, pressed: { opacity: 0.75 }, link: { color: COLORS.goldDark, fontWeight: '700', fontSize: 13, textAlign: 'center', padding: 7 }, demoHint: { color: COLORS.muted, fontSize: 11, textAlign: 'center', marginTop: 9 }, heroCard: { backgroundColor: COLORS.navy, borderRadius: 18, padding: 20, flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 }, heroKicker: { color: COLORS.goldLight, fontSize: 10, fontWeight: '800', letterSpacing: 1 }, heroTitle: { color: '#fff', fontSize: 22, fontWeight: '800', marginTop: 9 }, heroSub: { color: '#aab5c8', fontSize: 12, marginTop: 5 }, heroIcon: { color: COLORS.gold, fontSize: 34, alignSelf: 'center' }, sectionTitle: { color: COLORS.navy, fontWeight: '800', fontSize: 17, marginBottom: 13 }, statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 24 }, statCard: { backgroundColor: '#fff', borderRadius: 14, padding: 14, width: '48%', minHeight: 92, borderWidth: 1, borderColor: COLORS.border }, statDot: { width: 8, height: 8, borderRadius: 4, marginBottom: 8 }, statNumber: { color: COLORS.navy, fontSize: 25, fontWeight: '800' }, statLabel: { color: COLORS.muted, fontSize: 12, marginTop: 2 }, rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, requestRow: { backgroundColor: '#fff', borderRadius: 14, padding: 13, flexDirection: 'row', alignItems: 'center', marginBottom: 10, borderWidth: 1, borderColor: COLORS.border }, requestIcon: { width: 39, height: 39, borderRadius: 11, backgroundColor: COLORS.cream, alignItems: 'center', justifyContent: 'center' }, requestIconText: { color: COLORS.goldDark, fontSize: 19 }, requestInfo: { flex: 1, marginLeft: 11 }, requestCode: { color: COLORS.navy, fontSize: 12, fontWeight: '800' }, requestType: { color: COLORS.text, fontSize: 13, fontWeight: '600', marginTop: 3 }, requestDate: { color: COLORS.muted, fontSize: 11, marginTop: 3 }, pill: { borderRadius: 20, paddingHorizontal: 9, paddingVertical: 5 }, pillText: { fontSize: 10, fontWeight: '800' }, quickGrid: { gap: 9 }, quickAction: { backgroundColor: '#fff', borderRadius: 13, padding: 15, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: COLORS.border }, quickIcon: { color: COLORS.goldDark, fontSize: 21, width: 30 }, quickLabel: { color: COLORS.navy, fontSize: 13, fontWeight: '700', flex: 1 }, quickArrow: { color: COLORS.muted, fontSize: 22 }, filterLine: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 26 }, mutedText: { color: COLORS.muted, fontSize: 12 }, back: { color: COLORS.goldDark, fontWeight: '700', fontSize: 14, marginBottom: 22 }, detailStatus: { backgroundColor: '#fff', borderRadius: 14, padding: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, borderWidth: 1, borderColor: COLORS.border }, detailBlock: { backgroundColor: '#fff', borderRadius: 13, padding: 16, marginBottom: 10, borderWidth: 1, borderColor: COLORS.border }, detailLabel: { color: COLORS.goldDark, fontSize: 10, fontWeight: '800', letterSpacing: 1, marginBottom: 7 }, detailValue: { color: COLORS.text, fontSize: 14, lineHeight: 21 }, empty: { alignItems: 'center', padding: 38, backgroundColor: '#fff', borderRadius: 15, marginTop: 10 }, emptyIcon: { color: COLORS.gold, fontSize: 34, marginBottom: 10 }, emptyTitle: { color: COLORS.navy, fontSize: 16, fontWeight: '800', marginBottom: 6 }, search: { backgroundColor: '#fff', borderColor: COLORS.border, borderWidth: 1, borderRadius: 11, height: 47, paddingHorizontal: 14, color: COLORS.navy, marginBottom: 18 }, recordCard: { backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 10, borderWidth: 1, borderColor: COLORS.border }, recordType: { color: COLORS.navy, fontWeight: '800', fontSize: 14, marginTop: 10 }, recordDescription: { color: COLORS.text, fontSize: 13, marginTop: 6, lineHeight: 19 }, recordMeta: { color: COLORS.muted, fontSize: 11, marginTop: 12 }, reviewerCard: { backgroundColor: COLORS.cream, borderRadius: 14, padding: 16, marginBottom: 10 }, profileBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 15, borderRadius: 14, marginBottom: 20, borderWidth: 1, borderColor: COLORS.border }, avatar: { backgroundColor: COLORS.navy, color: COLORS.gold, width: 46, height: 46, borderRadius: 23, textAlign: 'center', paddingTop: 11, fontSize: 20, fontWeight: '800', marginRight: 12 }, profileName: { color: COLORS.navy, fontWeight: '800', fontSize: 16 }, profileRole: { color: COLORS.muted, fontSize: 12, marginTop: 4 }, nav: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 75, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: COLORS.border, flexDirection: 'row', justifyContent: 'space-around', paddingTop: 9, paddingBottom: 6 }, navItem: { alignItems: 'center', minWidth: 55 }, navItemActive: { borderTopWidth: 2, borderTopColor: COLORS.gold, marginTop: -9, paddingTop: 7 }, navIcon: { color: COLORS.muted, fontSize: 21, height: 27 }, navLabel: { color: COLORS.muted, fontSize: 10, fontWeight: '700' }, navActive: { color: COLORS.goldDark },
});
