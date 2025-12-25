import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Dimensions,
  Image,
} from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/context/AuthContext';

const { width, height } = Dimensions.get('window');

export default function LoginScreen() {
  const [nama, setNama] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = async () => {
    if (!nama || !password) {
      Alert.alert('Error', 'Mohon isi semua kolom');
      return;
    }

    setLoading(true);
    try {
      await login(nama, password);
    } catch (error: any) {
      Alert.alert('Login Gagal', error.message || 'Kredensial tidak valid');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* Header dengan Logo */}
        <View style={styles.header}>
          <View style={styles.logoWrapper}>
            <Image
              source={require('@/assets/images/kh_logo.png')} // Ganti dengan path logo Anda
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.loginText}>Login</Text>
        </View>

        {/* Form */}
        <View style={styles.formWrapper}>
          <TextInput
            style={styles.input}
            placeholder="Nama"
            placeholderTextColor="#666"
            value={nama}
            onChangeText={setNama}
            editable={!loading}
          />

          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#666"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            editable={!loading}
          />

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Masuk</Text>
            )}
          </TouchableOpacity>

          <View style={styles.registerContainer}>
            <Text style={styles.registerText}>Belum Punya Akun? </Text>
            <TouchableOpacity
              onPress={() => router.push('/auth/register')}
              disabled={loading}
            >
              <Text style={styles.registerLink}>Daftar</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Spacer */}
        <View style={styles.spacer} />
      </ScrollView>

      {/* Decorative Shapes at Bottom */}
      {/* <View style={styles.shapeContainer}>
        <View style={styles.orangeWave} />
        <View style={styles.darkWave} />
      </View> */}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    flexGrow: 1,
    paddingTop: 180,
  },
  header: {
    alignItems: 'center',
    marginBottom: 50,
  },
  logoWrapper: {
    marginBottom: 20,
  },
  logoImage: {
    width: 70,
    height: 70,
  },
  loginText: {
    fontSize: 28,
    fontWeight: '600',
    color: '#1a1a1a',
    letterSpacing: -0.5,
  },
  formWrapper: {
    paddingHorizontal: 24,
    marginBottom: 30,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#1a3a52',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 15,
    marginBottom: 16,
    color: '#333',
    fontWeight: '500',
  },
  button: {
    backgroundColor: '#1a3a52',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 20,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  registerText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '500',
  },
  registerLink: {
    color: '#0066ff',
    fontSize: 14,
    fontWeight: '600',
  },
  spacer: {
    height: 100,
  },
  shapeContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 280,
    overflow: 'hidden',
    zIndex: -1,
  },
  orangeWave: {
    position: 'absolute',
    bottom: -100,
    left: -80,
    width: 400,
    height: 400,
    backgroundColor: '#FFA500',
    borderRadius: 999,
    opacity: 0.9,
  },
  darkWave: {
    position: 'absolute',
    bottom: -150,
    right: -100,
    width: 450,
    height: 450,
    backgroundColor: '#1a3a52',
    borderRadius: 999,
  },
});