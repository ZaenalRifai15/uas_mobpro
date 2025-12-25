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
  SafeAreaView,
  StatusBar,
  Image,
} from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/context/AuthContext';

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();

  const handleRegister = async () => {
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await register(name, email, password, 'responden');
      // Navigation will be handled by the root layout based on auth state
    } catch (error: any) {
      Alert.alert('Registration Failed', error.message || 'Could not create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.content}>
            {/* Logo */}
             <View style={styles.header}>
                <View style={styles.logoWrapper}>
                  <Image
                      source={require('@/assets/images/kh_logo.png')} // Ganti dengan path logo Anda
                      style={styles.logoImage}
                      resizeMode="contain"
                        />
                 </View>
                 <Text style={styles.registerText}>Register</Text>
              </View>

            {/* Form */}
            <View style={styles.form}>
              <TextInput
                style={styles.input}
                placeholder="Masukkan Nama"
                placeholderTextColor="#999"
                value={name}
                onChangeText={setName}
                editable={!loading}
              />

              <TextInput
                style={styles.input}
                placeholder="Masukkan Nomor Telepon / Email"
                placeholderTextColor="#999"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!loading}
              />

              <TextInput
                style={styles.input}
                placeholder="Masukkan Password"
                placeholderTextColor="#999"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                editable={!loading}
              />

              <TextInput
                style={styles.input}
                placeholder="Konfirmasi Password"
                placeholderTextColor="#999"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                editable={!loading}
              />

              <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={handleRegister}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Daftar</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => router.replace('/auth/login')}
                disabled={loading}
              >
                <Text style={styles.linkText}>
                  Sudah Punya Akun? <Text style={styles.linkBold}>Masuk</Text>
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Decorative Shapes */}
      <View style={styles.decorationBottom}>
        <View style={styles.orangeShape} />
        <View style={styles.blueShape} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    alignItems: 'center',
    marginBottom: 50,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop:120,
    paddingBottom: 80,
    justifyContent: 'flex-start',
  },

  /* Logo Container */
  logoContainer: {
    alignItems: 'center',
    marginBottom: 60,
    marginTop: 20,
  },
  logo: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#ff9e64',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  logoText: {
    fontSize: 48,
    fontWeight: '700',
    color: '#fff',
  },
  logoLabel: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e3a5f',
  },
  logoWrapper: {
    marginBottom: 20,
  },
  logoImage: {
    width: 70,
    height: 70,
  },
  registerText: {
    fontSize: 28,
    fontWeight: '600',
    color: '#1a1a1a',
    letterSpacing: -0.5,
  },

  /* Form */
  form: {
    width: '100%',
  },
  input: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 14,
    fontSize: 14,
    borderWidth: 1.5,
    borderColor: '#1e3a5f',
    color: '#333',
  },

  /* Button */
  button: {
    backgroundColor: '#1e3a5f',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },

  /* Link */
  linkText: {
    marginTop: 20,
    textAlign: 'center',
    color: '#666',
    fontSize: 14,
    fontWeight: '500',
  },
  linkBold: {
    color: '#0066ff',
    fontWeight: '700',
  },

  /* Decoration */
  decorationBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 150,
    overflow: 'hidden',
    zIndex: -1,
  },
  orangeShape: {
    position: 'absolute',
    bottom: 0,
    left: -50,
    width: 200,
    height: 200,
    backgroundColor: '#ff9e64',
    borderRadius: 100,
    transform: [{ rotate: '45deg' }],
  },
  blueShape: {
    position: 'absolute',
    bottom: -20,
    right: -50,
    width: 300,
    height: 300,
    backgroundColor: '#1e3a5f',
    borderRadius: 150,
  },
});