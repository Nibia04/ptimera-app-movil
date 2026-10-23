import React, { useState } from 'react';
// agregue camara y galeria
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { COLORS } from '../../theme';
import Titulo from '../titulo';
import { updateProfile } from '../../services/appService';

export default function PerfilScreen({ user, onSave, onLogout }) {
  const [form, setForm] = useState(user); //esta funcion recibe la imagen 
  const updatePhoto = async (source) => {
    const permission = source === 'camera'
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync(); //en esta funcion pedimos los permisos de usar camara o galeria 

    if (!permission.granted) {
      Alert.alert(
        'Permiso requerido',   // aqui si el permiso no fue aceptadpo no funcioonara y no se va a abrir la camaro 
        source === 'camera'
          ? 'Activa el permiso de cámara para tomar una foto.'
          : 'Activa el permiso de fotos para seleccionar una imagen.'
      );
      return;
    }

    const result = source === 'camera' /// y en esta parte pues abrimos la camara o la galeria dependiedo de lo que el usuario haya seleccionado
      ? await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'], /// esta solo permite imagenes 
        allowsEditing: true,
        aspect: [1, 1], 
        quality: 0.8,
      })
      : await ImagePicker.launchImageLibraryAsync({ /// abre la aleria 
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

    if (!result.canceled && result.assets?.[0]?.uri) {   /// guardado temporal
      setForm(current => ({ ...current, profileImage: result.assets[0].uri })); // guardo la dirreccion de las fptos 
    }
  };

  const field = (label, key) => <View style={styles.field}><Text style={styles.fieldLabel}>{label}</Text><TextInput value={form[key]} onChangeText={value => setForm({ ...form, [key]: value })} style={styles.input} /></View>;
  return <ScrollView contentContainerStyle={{ padding: 22, paddingBottom: 110 }}>
    <View style={styles.header}><Text style={styles.eyebrow}>ESPACIO PERSONAL</Text><Titulo texto="Mi perfil" subtitulo="Administra tu información y tu imagen." /></View>
    <View style={styles.profileCard}>
      <View style={styles.cardAccent} />
      {form.profileImage   // si hay una imagen de perfol
        ? <Image source={{ uri: form.profileImage }} style={styles.avatar} />
        : <View style={styles.avatarPlaceholder}><Text style={styles.avatarText}>+</Text></View>}
      <Text style={styles.photoTitle}>Foto de perfil</Text>
      <Text style={styles.photoHint}>Elige una imagen para identificar tu cuenta</Text>
      <View style={styles.photoActions}>
        <Pressable onPress={() => updatePhoto('camera')} style={styles.primaryButton}><Text style={styles.primaryButtonText}>Tomar foto</Text></Pressable>
        <Pressable onPress={() => updatePhoto('gallery')} style={styles.secondaryButton}><Text style={styles.secondaryButtonText}>Galería</Text></Pressable>
      </View>
    </View>
    <View style={styles.formCard}>
      <Text style={styles.sectionTitle}>Datos de contacto</Text>
      {field('Nombre completo', 'fullName')}{field('Correo electrónico', 'email')}{field('Teléfono', 'phone')}{field('Establecimiento', 'establishment')}{field('Dirección', 'address')}
      <Text style={styles.role}>Rol actual: <Text style={styles.roleValue}>{user.role}</Text></Text>
    </View>
    <Pressable onPress={() => { onSave(updateProfile(user, form)); Alert.alert('Perfil actualizado', 'Tus cambios fueron guardados.'); }} style={styles.saveButton}><Text style={styles.saveText}>Guardar cambios</Text></Pressable>
    <Pressable onPress={onLogout} style={styles.logoutButton}><Text style={styles.logoutText}>Cerrar sesión</Text></Pressable>
  </ScrollView>;
}

const styles = StyleSheet.create({
  header: { marginBottom: 4 },
  eyebrow: { color: '#A52A2A', fontSize: 11, fontWeight: '900', letterSpacing: 2, marginBottom: -13 },
  profileCard: { backgroundColor: '#55251F', borderRadius: 24, padding: 23, alignItems: 'center', marginBottom: 18, overflow: 'hidden', shadowColor: '#3A1713', shadowOpacity: 0.2, shadowRadius: 10, elevation: 4 },
  cardAccent: { position: 'absolute', top: 0, left: 0, right: 0, height: 7, backgroundColor: '#C43D32' },
  avatar: { width: 110, height: 110, borderRadius: 55, borderWidth: 4, borderColor: '#F4D5C8' },
  avatarPlaceholder: { width: 110, height: 110, borderRadius: 55, backgroundColor: '#F4D5C8', borderWidth: 4, borderColor: '#C43D32', alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#8F2B25', fontSize: 44, fontWeight: '300' },
  photoTitle: { color: '#FFF8F4', fontSize: 18, fontWeight: '900', marginTop: 12 },
  photoHint: { color: '#E8C5B9', fontSize: 12, marginTop: 5 },
  photoActions: { flexDirection: 'row', gap: 10, marginTop: 17 },
  primaryButton: { backgroundColor: '#C43D32', borderRadius: 10, paddingVertical: 11, paddingHorizontal: 18 },
  primaryButtonText: { color: '#FFF8F4', fontWeight: '900', fontSize: 12 },
  secondaryButton: { backgroundColor: '#FFF8F4', borderRadius: 10, paddingVertical: 11, paddingHorizontal: 18 },
  secondaryButtonText: { color: '#55251F', fontWeight: '900', fontSize: 12 },
  formCard: { backgroundColor: '#FFFDFC', borderRadius: 20, padding: 18, borderWidth: 1, borderColor: '#E5CFC5', marginBottom: 15 },
  sectionTitle: { color: '#55251F', fontSize: 18, fontWeight: '900', marginBottom: 17 },
  field: { marginBottom: 14 },
  fieldLabel: { color: '#8F2B25', fontSize: 12, fontWeight: '900', marginBottom: 7 },
  input: { backgroundColor: '#FBF0EB', borderColor: '#D9B8AB', borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, height: 48, color: '#55251F', fontSize: 15 },
  role: { color: '#8B746D', fontSize: 12, marginTop: 2 },
  roleValue: { color: '#8F2B25', fontWeight: '900' },
  saveButton: { backgroundColor: '#B52F2F', minHeight: 52, borderRadius: 13, alignItems: 'center', justifyContent: 'center', marginBottom: 11, shadowColor: '#8F2B25', shadowOpacity: 0.2, shadowRadius: 6, elevation: 3 },
  saveText: { color: '#FFF8F4', fontWeight: '900', fontSize: 14 },
  logoutButton: { borderColor: '#8F2B25', borderWidth: 1.5, minHeight: 49, borderRadius: 13, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFF8F4' },
  logoutText: { color: '#8F2B25', fontWeight: '900' },
});
 