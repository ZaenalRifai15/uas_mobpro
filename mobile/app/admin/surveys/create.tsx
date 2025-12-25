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
  Image,
} from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import apiService from '@/services/api';

export default function CreateSurveyScreen() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [questions, setQuestions] = useState(['']); // Start with 1 empty question
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const updateQuestion = (index: number, text: string) => {
    const newQuestions = [...questions];
    newQuestions[index] = text;
    setQuestions(newQuestions);
  };

  // Add new question field
  const addQuestion = () => {
    setQuestions([...questions, '']);
  };

  // Remove question field
  const removeQuestion = (index: number) => {
    if (questions.length > 1) {
      const newQuestions = questions.filter((_, i) => i !== index);
      setQuestions(newQuestions);
    }
  };

  const handleCreate = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter survey title');
      return;
    }

    // Validate all questions are filled
    const emptyQuestions = questions.filter(q => q.trim() === '');
    if (emptyQuestions.length > 0) {
      Alert.alert('Error', 'Please fill in all questions or remove empty ones');
      return;
    }

    if (questions.length === 0) {
      Alert.alert('Error', 'Please add at least one question');
      return;
    }

    if (!user) {
      Alert.alert('Error', 'User not found');
      return;
    }

    setLoading(true);
    try {
      // Create survey
      const survey = await apiService.createSurvey({
        title,
        description,
        created_by: user.id,
      });

      // Create questions
      for (let i = 0; i < questions.length; i++) {
        await apiService.createQuestion({
          survey_id: survey.id,
          question_text: questions[i],
          order: i + 1,
        });
      }

      // Navigate to success screen
      router.push('/admin/surveys/create_success');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to create survey');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          {/* Back Button */}
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => {
              if (loading) return;
              router.replace('/admin/surveys');
            }}
            activeOpacity={0.7}
          >
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>

          {/* Header Card */}
          <View style={styles.headerCard}>
            <View style={styles.headerRow}>
              <View style={styles.iconContainer}>
                <Image 
                  source={require('@/assets/images/kh_logo.png')} 
                  style={styles.logo}
                  resizeMode="contain"
                />
                <Text style={styles.headerTitle}>{title || 'KampusQ'}</Text>
              </View>
              <TouchableOpacity style={styles.settingsButton}>
                <Text style={styles.settingsIcon}>⚙️</Text>
              </TouchableOpacity>
            </View>
            
            <TextInput
              style={styles.descriptionInput}
              placeholder="Deskripsi"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              editable={!loading}
              placeholderTextColor="#7C8BA1"
            />
          </View>

          {/* Title Input */}
          <View style={styles.card}>
            <Text style={styles.cardLabel}>Judul</Text>
            <TextInput
              style={styles.titleInput}
              placeholder="Masukkan judul survey"
              value={title}
              onChangeText={setTitle}
              editable={!loading}
              placeholderTextColor="#7C8BA1"
            />
          </View>

          {/* Questions */}
          {questions.map((question, index) => (
            <View key={index} style={styles.card}>
              <TextInput
                style={styles.questionInput}
                placeholder="Isi pertanyaan"
                value={question}
                onChangeText={(text) => updateQuestion(index, text)}
                multiline
                editable={!loading}
                placeholderTextColor="#7C8BA1"
              />
              
              {/* Radio Options */}
              <View style={styles.radioContainer}>
                <View style={styles.radioOption}>
                  <View style={styles.radioCircle} />
                  <Text style={styles.radioText}>Setuju</Text>
                </View>
                <View style={styles.radioOption}>
                  <View style={styles.radioCircle} />
                  <Text style={styles.radioText}>Tidak Setuju</Text>
                </View>
              </View>

              {/* Action Buttons */}
              <View style={styles.actionButtons}>
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={() => removeQuestion(index)}
                  disabled={loading || questions.length === 1}
                >
                  <Text style={styles.actionButtonIcon}>🗑️</Text>
                </TouchableOpacity>
                {index === questions.length - 1 && (
                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={addQuestion}
                    disabled={loading}
                  >
                    <Text style={styles.actionButtonIcon}>➕</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))}

          {/* Submit Button */}
          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleCreate}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>▶</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  content: {
    padding: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  backButtonText: {
    fontSize: 28,
    color: '#2C3E50',
  },
  headerCard: {
    backgroundColor: '#B8C5D6',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logo: {
    width: 28,
    height: 28,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
  },
  settingsButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingsIcon: {
    fontSize: 20,
  },
  descriptionInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#2C3E50',
    padding: 12,
    minHeight: 100,
    fontSize: 14,
    color: '#2C3E50',
    textAlignVertical: 'top',
  },
  card: {
    backgroundColor: '#B8C5D6',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  cardLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2C3E50',
    marginBottom: 12,
  },
  titleInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#2C3E50',
    padding: 12,
    fontSize: 14,
    color: '#2C3E50',
  },
  questionInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#2C3E50',
    padding: 12,
    minHeight: 60,
    fontSize: 14,
    color: '#2C3E50',
    marginBottom: 12,
    textAlignVertical: 'top',
  },
  radioContainer: {
    marginBottom: 12,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#2C3E50',
    backgroundColor: '#FFFFFF',
    marginRight: 10,
  },
  radioText: {
    fontSize: 14,
    color: '#2C3E50',
    fontWeight: '500',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    backgroundColor: '#34495E',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtonIcon: {
    fontSize: 18,
  },
  submitButton: {
    width: 56,
    height: 56,
    backgroundColor: '#FF8C42',
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'flex-end',
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  submitButtonText: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});