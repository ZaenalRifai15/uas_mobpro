import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { router } from 'expo-router';

const { width, height } = Dimensions.get('window');

export default function SurveySuccessScreen() {
  return (
    <View style={styles.container}>
      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.title}>Berhasil Mengirim</Text>
        <Text style={styles.description}>
          Data survei Anda telah dibagikan.{'\n'}
          Terima kasih telah berkontribusi dalam peningkatan{'\n'}
          kebijakan kampus!
        </Text>

        {/* Checkmark Circle */}
        <View style={styles.checkmarkContainer}>
          <View style={styles.checkmarkCircle}>
            <Text style={styles.checkmark}>✓</Text>
          </View>
        </View>

        {/* Button */}
        <TouchableOpacity
          style={styles.button}
          onPress={() => router.replace('/admin/surveys')}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>Kembali ke Beranda</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    zIndex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#2C3E50',
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    fontSize: 15,
    color: '#5A6C7D',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 48,
  },
  checkmarkContainer: {
    marginBottom: 56,
  },
  checkmarkCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#2C3E50',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  checkmark: {
    fontSize: 64,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: '#FF9F5A',
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    minWidth: 320,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});