import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Alert,
  SafeAreaView,
  StatusBar,
  TextInput,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import apiService, { Survey, Question } from '@/services/api';

export default function TakeSurveyScreen() {
  const { id } = useLocalSearchParams();
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [answers, setAnswers] = useState<{ [key: number]: boolean }>({});
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [alreadyResponded, setAlreadyResponded] = useState(false);
  const { user, logout } = useAuth();

  useEffect(() => {
    loadSurvey();
    checkIfAlreadyResponded();
  }, [id]);

  const checkIfAlreadyResponded = async () => {
    if (!user) return;
    try {
      const responses = await apiService.request('/responses', {});
      const userResponse = responses.find(
        (r: any) => r.survey_id === Number(id) && r.user_id === user.id
      );
      if (userResponse) {
        setAlreadyResponded(true);
      }
    } catch (error) {
      console.error('Error checking response:', error);
    }
  };

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

  const selectAnswer = (questionId: number, answer: boolean) => {
    setAnswers({
      ...answers,
      [questionId]: answer,
    });
  };

  const handleSubmit = async () => {
    if (!survey || !user) return;

    const unansweredQuestions = survey.questions?.filter(
      (q) => answers[q.id] === undefined
    );

    if (unansweredQuestions && unansweredQuestions.length > 0) {
      Alert.alert('Error', 'Mohon jawab semua pertanyaan');
      return;
    }

    setSubmitting(true);
    try {
      const response = await apiService.createResponse({
        survey_id: survey.id,
        user_id: user.id,
      });

      for (const question of survey.questions || []) {
        await apiService.createAnswer({
          response_id: response.id,
          question_id: question.id,
          answer: answers[question.id],
        });
      }

      Alert.alert(
        'Terima Kasih!',
        'Terima Kasih Telah Mengisi Survey.\n\nRespon Anda Sangat Berarti Untuk Perubahan dan Kemajuan Kampus.',
        [
          {
            text: 'OK',
            onPress: () => router.replace('/user/surveys'),
          },
        ]
      );
    } catch (error: any) {
      if (error.message.includes('already responded')) {
        Alert.alert('Sudah Diisi', 'Anda sudah mengisi survey ini sebelumnya');
        router.back();
      } else {
        Alert.alert('Error', error.message || 'Failed to submit response');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#ff9e64" />
      </View>
    );
  }

  if (alreadyResponded) {
    return (
      <View style={styles.centerContainer}>
        <View style={styles.messageCard}>
          <Text style={styles.messageTitle}>Sudah Diisi</Text>
          <Text style={styles.messageText}>
            Anda sudah mengisi survey ini sebelumnya.
          </Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Kembali ke Survei</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (!survey) {
    return (
      <View style={styles.centerContainer}>
        <Text>Survey tidak ditemukan</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1e3a5f" />

      {/* Header */}
      <View style={styles.headerContainer}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonIcon}>←</Text>
        </TouchableOpacity>

        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>{survey.title}</Text>
          {survey.description && (
            <Text style={styles.headerDescription}>{survey.description}</Text>
          )}
        </View>

        <View style={styles.orangeCircle} />
      </View>

      <ScrollView style={styles.scrollContainer}>
        <View style={styles.content}>
          {/* Questions */}
          {survey.questions?.map((question, index) => (
            <View key={question.id} style={styles.questionCard}>
              <Text style={styles.questionText}>{question.question_text}</Text>

              <View style={styles.answersContainer}>
                <TouchableOpacity
                  style={[
                    styles.answerButton,
                    answers[question.id] === true && styles.answerButtonSelected,
                  ]}
                  onPress={() => selectAnswer(question.id, true)}
                  disabled={submitting}
                >
                  <View
                    style={[
                      styles.radio,
                      answers[question.id] === true && styles.radioSelected,
                    ]}
                  />
                  <Text
                    style={[
                      styles.answerText,
                      answers[question.id] === true && styles.answerTextSelected,
                    ]}
                  >
                    Setuju
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.answerButton,
                    answers[question.id] === false && styles.answerButtonSelected,
                  ]}
                  onPress={() => selectAnswer(question.id, false)}
                  disabled={submitting}
                >
                  <View
                    style={[
                      styles.radio,
                      answers[question.id] === false && styles.radioSelected,
                    ]}
                  />
                  <Text
                    style={[
                      styles.answerText,
                      answers[question.id] === false && styles.answerTextSelected,
                    ]}
                  >
                    Tidak Setuju
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}

          {/* Notes Section */}
          <View style={styles.notesCard}>
            <TextInput
              style={styles.notesInput}
              placeholder="Saran dan masukan"
              placeholderTextColor="#666"
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={5}
              editable={!submitting}
            />
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitButton, submitting && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>Kirim</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => router.replace('/user/surveys')}
            disabled={submitting}
          >
            <Text style={styles.cancelButtonText}>Batalkan</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContainer: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  messageCard: {
    backgroundColor: '#fff',
    padding: 32,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    maxWidth: 350,
  },
  messageTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1e3a5f',
    marginBottom: 16,
    textAlign: 'center',
  },
  messageText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },

  /* Header */
  headerContainer: {
    backgroundColor: '#1e3a5f',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 32,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    position: 'relative',
    overflow: 'hidden',
  },
  backButton: {
    padding: 8,
    marginBottom: 12,
    zIndex: 10,
  },
  backButtonText: {
    fontSize: 16,
    color: '#000000ff',
    fontWeight: '600',
  },
  backButtonIcon: {
    fontSize: 24,
    color: '#fff',
    fontWeight: '600',
  },
  headerContent: {
    zIndex: 2,
    paddingRight: 20,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#fff',
    lineHeight: 32,
    marginBottom: 8,
  },
  headerDescription: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 20,
  },

  /* Orange Circle */
  orangeCircle: {
    position: 'absolute',
    right: -80,
    top: -60,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: '#ff9e64',
    opacity: 0.85,
    zIndex: 0,
  },

  /* Content */
  content: {
    padding: 15,
  },

  /* Question Card */
  questionCard: {
    backgroundColor: '#b8cfe8',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  questionText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1e3a5f',
    marginBottom: 12,
    lineHeight: 20,
  },
  answersContainer: {
    gap: 12,
  },
  answerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: 'transparent',
    backgroundColor: 'transparent',
  },
  answerButtonSelected: {
    backgroundColor: 'rgba(30, 58, 95, 0.1)',
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#1e3a5f',
    marginRight: 12,
  },
  radioSelected: {
    borderColor: '#1e3a5f',
    backgroundColor: '#1e3a5f',
  },
  answerText: {
    fontSize: 15,
    color: '#1e3a5f',
    fontWeight: '500',
  },
  answerTextSelected: {
    color: '#1e3a5f',
    fontWeight: '600',
  },

  /* Notes */
  notesCard: {
    backgroundColor: '#b8cfe8',
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  notesInput: {
    fontSize: 14,
    color: '#1e3a5f',
    paddingHorizontal: 0,
    paddingVertical: 0,
    textAlignVertical: 'top',
    minHeight: 100,
  },

  /* Buttons */
  submitButton: {
    backgroundColor: '#ff9e64',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
});