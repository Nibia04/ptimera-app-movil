import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, SafeAreaView, ScrollView, StatusBar, Text, TextInput, View } from 'react-native';
import { COLORS } from '../../theme';
import { authenticate, registerUser } from '../../services/appService';

export default function LoginScreen({ onlogin, onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [visible, setVisible] = useState(false);
  const [error, setError] = useState('');
  const [registering, setRegistering] = useState(false);
  const [fullName, setFullName] = useState('');
  const [accountType, setAccountType] = useState('client');
  const submit = () => {
    if (!email.trim() || !password.trim() || (registering && !fullName.trim())) return setError('Completa todos los campos para continuar.');
    if (registering) {
      const result = registerUser({ fullName, email, password, phone: '', address: '', establishment: accountType === 'liquorStore' ? fullName : 'Mi dirección', accountType });
      if (!result.ok) return setError(result.message);
      (onLogin || onlogin)(result.user);
      return;
    }
    const result = authenticate(email, password);
    if (!result.ok) return setError(result.message);
    (onLogin || onlogin)(result.user);
  };
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.navy }}>
      <StatusBar barStyle="light-content" />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ padding: 26, paddingTop: 58 }}>
          <View style={{ width: 52, height: 52, borderRadius: 17, backgroundColor: COLORS.gold, alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: COLORS.navy, fontSize: 23 }}>◆</Text></View>
          <Text style={{ color: COLORS.goldLight, letterSpacing: 3, fontWeight: '700', fontSize: 12, marginTop: 16 }}>LICORERÍA</Text>
          <Text style={{ color: '#fff', fontSize: 36, lineHeight: 42, fontWeight: '800', marginTop: 24 }}>Gestión simple,{'\n'}decisiones claras.</Text>
          <Text style={{ color: '#b1bbca', fontSize: 15, lineHeight: 22, marginTop: 14, marginBottom: 28 }}>Ingresa para gestionar tus solicitudes y registros.</Text>
          <View style={{ backgroundColor: '#fff', borderRadius: 22, padding: 22 }}>
            <Text style={{ color: COLORS.navy, fontSize: 22, fontWeight: '800', marginBottom: 18 }}>{registering ? 'Crear cuenta' : 'Iniciar sesión'}</Text>
            {registering ? <><Text style={label}>{accountType === 'liquorStore' ? 'Nombre comercial' : 'Nombre completo'}</Text><TextInput style={input} value={fullName} onChangeText={setFullName} placeholder="Tu nombre" placeholderTextColor={COLORS.muted} /><Text style={label}>Tipo de cuenta</Text><View style={{ flexDirection: 'row', gap: 8, marginBottom: 8 }}><Pressable onPress={() => setAccountType('client')} style={{ flex: 1, padding: 11, borderRadius: 9, backgroundColor: accountType === 'client' ? COLORS.navy : COLORS.background }}><Text style={{ textAlign: 'center', color: accountType === 'client' ? '#fff' : COLORS.navy, fontWeight: '700' }}>Cliente</Text></Pressable><Pressable onPress={() => setAccountType('liquorStore')} style={{ flex: 1, padding: 11, borderRadius: 9, backgroundColor: accountType === 'liquorStore' ? COLORS.navy : COLORS.background }}><Text style={{ textAlign: 'center', color: accountType === 'liquorStore' ? '#fff' : COLORS.navy, fontWeight: '700' }}>Licorería</Text></Pressable></View></> : null}
            <Text style={label}>Correo electrónico</Text>
            <TextInput style={input} value={email} onChangeText={setEmail} placeholder="nombre@live.uleam.edu.ec" placeholderTextColor={COLORS.muted} autoCapitalize="none" keyboardType="email-address" />
            <Text style={label}>Contraseña</Text>
            <View><TextInput style={input} value={password} onChangeText={setPassword} placeholder="••••••••" placeholderTextColor={COLORS.muted} secureTextEntry={!visible} /><Pressable onPress={() => setVisible(!visible)} style={{ position: 'absolute', right: 12, top: 13 }}><Text style={{ color: COLORS.goldDark, fontWeight: '700', fontSize: 12 }}>{visible ? 'Ocultar' : 'Mostrar'}</Text></Pressable></View>
            {error ? <Text style={{ color: COLORS.red, backgroundColor: '#fff1f0', borderRadius: 8, padding: 10, marginTop: 12 }}>{error}</Text> : null}
            <Pressable onPress={submit} style={{ backgroundColor: COLORS.gold, minHeight: 49, borderRadius: 11, alignItems: 'center', justifyContent: 'center', marginTop: 16 }}><Text style={{ color: COLORS.navy, fontWeight: '800' }}>Iniciar sesión</Text></Pressable>
            <Pressable onPress={() => Alert.alert('Recuperar contraseña', 'Te enviaremos instrucciones a tu correo registrado.')}><Text style={{ color: COLORS.goldDark, fontWeight: '700', textAlign: 'center', padding: 12 }}>¿Olvidaste tu contraseña?</Text></Pressable>
            <Pressable onPress={() => { setRegistering(!registering); setError(''); }}><Text style={{ color: COLORS.navy, fontWeight: '700', textAlign: 'center', padding: 5 }}>{registering ? 'Ya tengo una cuenta' : 'Registrarme'}</Text></Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const label = { color: COLORS.navy, fontSize: 12, fontWeight: '700', marginBottom: 8, marginTop: 8 };
const input = { backgroundColor: '#fff', borderColor: COLORS.border, borderWidth: 1, borderRadius: 11, paddingHorizontal: 14, height: 48, color: COLORS.navy, fontSize: 15 };
