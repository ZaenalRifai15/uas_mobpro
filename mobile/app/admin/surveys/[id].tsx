import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Alert,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import apiService, { Survey } from '@/services/api';

export default function SurveyDetailScreen() {
  const { id } = useLocalSearchParams();
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    loadSurvey();
  }, [id]);

  const loadSurvey = async () => {
    try {
      const data = await apiService.getSurvey(Number(id));
      setSurvey(data);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to load survey');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async () => {
    if (!survey) return;

    try {
      const updated = await apiService.updateSurvey(survey.id, {
        is_active: !survey.is_active,
      });
      setSurvey(updated);
      Alert.alert('Success', `Survey ${updated.is_active ? 'activated' : 'deactivated'}`);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update survey');
    }
  };

  const deleteSurvey = async () => {
    if (!survey) return;

    console.log('deleteSurvey called for survey:', survey.id, survey.title);
    console.log('Platform:', Platform.OS);

    // For web, use window.confirm since Alert.alert doesn't work
    if (Platform.OS === 'web') {
      const confirmed = window.confirm(
        `Apakah Anda yakin ingin menghapus survey "${survey.title}"?\n\nTindakan ini tidak dapat dibatalkan.`
      );
      
      if (!confirmed) {
        console.log('Delete cancelled by user');
        return;
      }

      console.log('User confirmed delete, starting deletion...');
      setIsDeleting(true);
      
      try {
        console.log('Calling apiService.deleteSurvey with ID:', survey.id);
        const result = await apiService.deleteSurvey(survey.id);
        console.log('Delete API response:', JSON.stringify(result));
        
        alert(result?.message || 'Survey dan semua data terkait berhasil dihapus');
        console.log('Navigating back to surveys list');
        router.replace('/admin/surveys');
      } catch (error: any) {
        console.error('Delete error caught:', error);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
        
        alert(`Gagal menghapus survey: ${error.message || 'Unknown error'}`);
        setIsDeleting(false);
      }
    } else {
      // For mobile, use Alert.alert
      Alert.alert(
        'Hapus Survey',
        'Apakah Anda yakin ingin menghapus survey ini? Tindakan ini tidak dapat dibatalkan.',
        [
          {
            text: 'Batal',
            onPress: () => {
              console.log('Delete cancelled by user');
            },
            style: 'cancel',
          },
          {
            text: 'Hapus',
            onPress: async () => {
              console.log('User confirmed delete, starting deletion...');
              setIsDeleting(true);
              try {
                console.log('Calling apiService.deleteSurvey with ID:', survey.id);
                const result = await apiService.deleteSurvey(survey.id);
                console.log('Delete API response:', JSON.stringify(result));
                
                Alert.alert(
                  'Berhasil', 
                  result?.message || 'Survey dan semua data terkait berhasil dihapus',
                  [
                    {
                      text: 'OK',
                      onPress: () => {
                        console.log('Navigating back to surveys list');
                        router.replace('/admin/surveys');
                      },
                    },
                  ]
                );
              } catch (error: any) {
                console.error('Delete error caught:', error);
                console.error('Error message:', error.message);
                console.error('Error stack:', error.stack);
                
                Alert.alert(
                  'Error', 
                  `Gagal menghapus survey: ${error.message || 'Unknown error'}`
                );
                setIsDeleting(false);
              }
            },
            style: 'destructive',
          },
        ]
      );
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#5B7BA6" />
      </View>
    );
  }

  if (!survey) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.notFoundText}>Survey tidak ditemukan</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Fixed Header */}
      <View style={styles.headerBanner}>
        <Text style={styles.headerGreeting}>Detail Survey</Text>
        <Text style={styles.surveyTitle}>{survey.title}</Text>
      </View>

      {/* Scrollable Content */}
      <ScrollView 
        style={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContentContainer}
      >
        <View style={styles.content}>
          <View style={styles.statusContainer}>
            <View
              style={[
                styles.statusBadge,
                { 
                  backgroundColor: survey.is_active ? '#D4E8F5' : '#FFE8E8',
                  borderLeftColor: survey.is_active ? '#5B7BA6' : '#E8947D',
                },
              ]}
            >
              <View
                style={[
                  styles.statusDot,
                  { backgroundColor: survey.is_active ? '#5B7BA6' : '#E8947D' },
                ]}
              />
              <Text 
                style={[
                  styles.statusText,
                  { color: survey.is_active ? '#5B7BA6' : '#E8947D' },
                ]}
              >
                {survey.is_active ? 'Aktif' : 'Tidak Aktif'}
              </Text>
            </View>
          </View>

          {survey.description && (
            <View style={styles.descriptionCard}>
              <Text style={styles.cardTitle}>Deskripsi</Text>
              <Text style={styles.descriptionText}>{survey.description}</Text>
            </View>
          )}

          {survey.questions && survey.questions.length > 0 && (
            <View style={styles.questionsSection}>
              <Text style={styles.sectionHeader}>Pertanyaan ({survey.questions.length})</Text>
              {survey.questions.map((question, index) => (
                <View key={question.id} style={styles.questionCard}>
                  <Text style={styles.questionNumber}>Pertanyaan {index + 1}</Text>
                  <Text style={styles.questionText}>{question.question_text}</Text>
                  <Text style={styles.answerType}>Jawaban: Setuju / Tidak Setuju</Text>
                </View>
              ))}
            </View>
          )}

          <TouchableOpacity 
            style={styles.analyticsButton} 
            onPress={() => router.push(`/admin/surveys/analytics/${survey.id}`)}
            activeOpacity={0.85}
          >
            <Text style={styles.analyticsButtonText}>Lihat Hasil Survey</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[
              styles.actionButton,
              { backgroundColor: survey.is_active ? '#E8947D' : '#D4B896' },
            ]}
            onPress={toggleStatus}
            activeOpacity={0.85}
          >
            <Text style={styles.actionButtonText}>
              {survey.is_active ? 'Nonaktifkan Survey' : 'Aktifkan Survey'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.deleteButton}
            onPress={deleteSurvey}
            disabled={isDeleting}
            activeOpacity={0.85}
          >
            {isDeleting ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.deleteButtonText}>Hapus Survey</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.85}
          >
            <Text style={styles.backButtonText}>← Kembali</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
  },
  headerBanner: {
    backgroundColor: '#2C3E50',
    paddingTop: 40,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomRightRadius: 30,
    // Ensure header stays on top
    zIndex: 10,
    elevation: 5,
  },
  headerGreeting: {
    fontSize: 14,
    color: '#BCC5D1',
    marginBottom: 8,
    fontWeight: '500',
  },
  surveyTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#fff',
  },
  scrollContent: {
    flex: 1,
  },
  scrollContentContainer: {
    flexGrow: 1,
  },
  content: {
    padding: 20,
    paddingTop: 24,
    paddingBottom: 40,
  },
  statusContainer: {
    marginBottom: 24,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderLeftWidth: 4,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  descriptionCard: {
    backgroundColor: '#D4E8F5',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: '#5B7BA6',
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2C3E50',
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 14,
    color: '#5B7BA6',
    lineHeight: 22,
  },
  questionsSection: {
    marginBottom: 24,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2C3E50',
    marginBottom: 14,
  },
  questionCard: {
    backgroundColor: '#D4E8F5',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#5B7BA6',
  },
  questionNumber: {
    fontSize: 12,
    color: '#5B7BA6',
    fontWeight: '700',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  questionText: {
    fontSize: 14,
    color: '#2C3E50',
    marginBottom: 8,
    fontWeight: '600',
  },
  answerType: {
    fontSize: 12,
    color: '#7F8C8D',
    fontStyle: 'italic',
  },
  analyticsButton: {
    backgroundColor: '#E8947D',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 12,
  },
  analyticsButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  actionButton: {
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 12,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  deleteButton: {
    backgroundColor: '#C7626B',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 12,
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  backButton: {
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
  },
  backButtonText: {
    color: '#5B7BA6',
    fontSize: 16,
    fontWeight: '600',
  },
  notFoundText: {
    fontSize: 16,
    color: '#5B7BA6',
  },
});